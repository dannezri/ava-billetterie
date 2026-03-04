import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';
import Stripe from 'stripe';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

const resolveSchema = z.object({
  outcome: z.enum(['REFUND_BUYER', 'RELEASE_SELLER', 'PARTIAL_REFUND']),
  amount: z.number().positive().optional(),
  notes: z.string().min(10, 'Les notes doivent contenir au moins 10 caractères'),
  suspendSeller: z.boolean().optional().default(false),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = resolveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        transaction: {
          include: {
            buyer: { select: { id: true, email: true, trustScore: true } },
            seller: { select: { id: true, email: true, trustScore: true, stripeAccountId: true } },
          },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Litige non trouvé' }, { status: 404 });
    }
    if (dispute.status !== 'OPEN' && dispute.status !== 'INVESTIGATING') {
      return NextResponse.json({ error: 'Ce litige ne peut plus être résolu' }, { status: 400 });
    }

    const { outcome, notes, suspendSeller, amount } = parsed.data;
    const disputeStatus = outcome === 'REFUND_BUYER' || outcome === 'PARTIAL_REFUND'
      ? 'RESOLVED_REFUND'
      : 'RESOLVED_RELEASE';
    const txStatus = outcome === 'REFUND_BUYER' || outcome === 'PARTIAL_REFUND' ? 'REFUNDED' : 'RELEASED';

    const refundAmount = outcome === 'PARTIAL_REFUND' && amount
      ? amount
      : Number(dispute.transaction.amount);

    // Stripe refund si acheteur remboursé
    let stripeRefundId: string | null = null;
    if ((outcome === 'REFUND_BUYER' || outcome === 'PARTIAL_REFUND') && dispute.transaction.stripePaymentIntentId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: dispute.transaction.stripePaymentIntentId,
          amount: Math.round(refundAmount * 100),
          reason: 'fraudulent',
          metadata: {
            dispute_id: params.id,
            admin_email: user.email ?? 'unknown',
            outcome,
          },
        });
        stripeRefundId = refund.id;
      } catch (stripeError: any) {
        console.error('[Stripe refund error]', stripeError.message);
        // On ne bloque pas la résolution si Stripe échoue — on log et continue
      }
    }

    // Stripe transfer libération vendeur
    if (outcome === 'RELEASE_SELLER' && dispute.transaction.stripePaymentIntentId && dispute.transaction.seller.stripeAccountId) {
      try {
        const sellerAmount = Math.round(
          (Number(dispute.transaction.amount) - Number(dispute.transaction.platformFee)) * 100
        );
        await stripe.transfers.create({
          amount: sellerAmount,
          currency: 'eur',
          destination: dispute.transaction.seller.stripeAccountId,
          metadata: {
            dispute_id: params.id,
            transaction_id: dispute.transactionId,
          },
        });
      } catch (stripeError: any) {
        console.error('[Stripe transfer error]', stripeError.message);
      }
    }

    const adminUser = await prisma.user.findUnique({ where: { email: user.email! } });

    // Transaction DB atomique
    await prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: params.id },
        data: {
          status: disputeStatus,
          resolutionNotes: notes,
          resolvedAt: new Date(),
          resolvedById: adminUser?.id,
          stripeRefundId,
        },
      });

      await tx.transaction.update({
        where: { id: dispute.transactionId },
        data: { status: txStatus, releasedAt: new Date() },
      });

      // Remboursement → vendeur pénalisé
      if (outcome === 'REFUND_BUYER' || outcome === 'PARTIAL_REFUND') {
        await tx.user.update({
          where: { id: dispute.transaction.seller.id },
          data: {
            trustScore: Math.max(0, dispute.transaction.seller.trustScore - 20),
            disputesResolvedAgainst: { increment: 1 },
          },
        });
        // Acheteur légèrement récompensé
        await tx.user.update({
          where: { id: dispute.transaction.buyer.id },
          data: { trustScore: Math.min(100, dispute.transaction.buyer.trustScore + 5) },
        });
      }

      // Note de résolution dans la timeline
      if (adminUser) {
        await tx.disputeMessage.create({
          data: {
            disputeId: params.id,
            authorId: adminUser.id,
            message: `[Résolution admin] ${outcome === 'REFUND_BUYER' ? 'Remboursement acheteur' : outcome === 'RELEASE_SELLER' ? 'Libération vendeur' : 'Remboursement partiel'} — ${notes}`,
            isInternal: false,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'ADMIN_ACTION',
          metadata: {
            action: 'RESOLVE_DISPUTE',
            disputeId: params.id,
            outcome,
            notes,
            stripeRefundId,
            adminEmail: user.email,
            transactionId: dispute.transactionId,
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    });

    return NextResponse.json({
      message: 'Litige résolu avec succès',
      outcome,
      dispute_status: disputeStatus,
      transaction_status: txStatus,
      stripe_refund_id: stripeRefundId,
    });
  } catch (error) {
    console.error('[API /admin/disputes/[id]/resolve]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
