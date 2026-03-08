/**
 * POST /api/payments/verify
 * Vérifie directement auprès de Stripe qu'un PaymentIntent est bien réussi
 * et met à jour la transaction/billet en base si ce n'est pas encore fait.
 * Utilisé comme filet de sécurité après la confirmation côté client,
 * pour ne pas dépendre uniquement du webhook (qui peut être lent ou absent en dev).
 */

import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { NotificationService } from '@/lib/services/notification.service';
import { stripePayments as stripe } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // Accepte soit un seul transactionId, soit un tableau (achat groupe)
    const { transactionId, transactionIds: rawIds } = body;
    const ids: string[] = rawIds ?? (transactionId ? [transactionId] : []);

    if (ids.length === 0) {
      return NextResponse.json({ error: 'transactionId(s) requis' }, { status: 400 });
    }

    // Charger toutes les transactions de cet acheteur
    const transactions = await prisma.transaction.findMany({
      where: { id: { in: ids }, buyerId: user.id },
      include: { ticket: true },
    });

    if (transactions.length === 0) {
      return NextResponse.json({ error: 'Transactions introuvables' }, { status: 404 });
    }

    // Si toutes sont déjà traitées, rien à faire
    const pending = transactions.filter((t) => t.status === 'PENDING');
    if (pending.length === 0) {
      return NextResponse.json({ status: transactions[0].status });
    }

    // Utiliser le PaymentIntent de la première transaction pending
    const firstWithPI = pending.find((t) => t.stripePaymentIntentId);
    if (!firstWithPI?.stripePaymentIntentId) {
      return NextResponse.json({ status: 'PENDING' });
    }

    // Vérifier directement auprès de Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(
      firstWithPI.stripePaymentIntentId
    );

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ status: 'PENDING', stripeStatus: paymentIntent.status });
    }

    // Le paiement a réussi mais le webhook n'a pas encore mis à jour la BDD
    // On fait la mise à jour ici (idempotent avec le webhook)
    await prisma.$transaction(async (tx) => {
      const ticketIds = pending.map((t) => t.ticketId);
      const pendingIds = pending.map((t) => t.id);

      await tx.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: { status: 'SOLD', expiresAt: null },
      });

      await tx.transaction.updateMany({
        where: { id: { in: pendingIds } },
        data: {
          status: 'COMPLETED',
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      // Mettre à jour les stats du vendeur (on prend le sellerId du premier)
      const sellerId = pending[0].sellerId;
      const totalRevenue = pending.reduce(
        (s, t) => s + Number(t.amount) - Number(t.platformFee),
        0
      );
      await tx.user.update({
        where: { id: sellerId },
        data: {
          hasSoldTickets: true,
          totalSales: { increment: pending.length },
          totalRevenue: { increment: totalRevenue },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'PAYMENT_SUCCEEDED',
          metadata: {
            paymentIntentId: paymentIntent.id,
            transactionIds: pendingIds,
            source: 'client_side_verify_fallback',
          },
        },
      });
    });

    console.log(
      `✅ ${pending.length} transaction(s) [${pending.map((t) => t.id).join(', ')}] vérifiées → ESCROWED (fallback)`
    );

    // Notifications acheteur + vendeur (fire-and-forget)
    const notifyPromises = pending.map(async (t) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: t.ticketId },
        include: { event: true },
      });
      if (!ticket) return;
      const eventName = ticket.event.title;
      const buyerAmount = Number(t.amount);
      const sellerAmount = Number(t.amount) - Number(t.platformFee);

      return Promise.all([
        NotificationService.notifyPurchaseConfirmed({
          userId: t.buyerId,
          transactionId: t.id,
          eventName,
          amount: buyerAmount,
        }),
        NotificationService.notifyTicketSold({
          userId: t.sellerId,
          transactionId: t.id,
          eventName,
          amount: sellerAmount,
        }),
      ]);
    });
    Promise.allSettled(notifyPromises).catch(() => null);

    return NextResponse.json({ status: 'COMPLETED' });
  } catch (err: any) {
    console.error('Erreur /api/payments/verify:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
