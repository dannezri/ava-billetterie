/**
 * API: Création d'un Payment Intent Stripe pour un groupe de billets
 * POST /api/payments/create-group-intent
 *
 * Body: { transactionIds: string[] }
 * Retourne: { clientSecret, paymentIntentId, totalAmount }
 *
 * Un seul PaymentIntent pour N billets (même vendeur).
 * Les transaction IDs sont stockés dans la metadata Stripe.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { createClient } from '@/lib/supabase/server-client';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = createClient();
    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Connectez-vous pour continuer' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transactionIds } = body as { transactionIds: string[] };

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_PARAMETERS', message: 'Transaction IDs manquants' } },
        { status: 400 }
      );
    }

    // ── Charger toutes les transactions ─────────────────────────────────────
    const transactions = await prisma.transaction.findMany({
      where: { id: { in: transactionIds } },
      include: {
        ticket: { include: { event: true } },
        buyer: true,
        seller: true,
      },
    });

    if (transactions.length !== transactionIds.length) {
      return NextResponse.json(
        { success: false, error: { code: 'TRANSACTIONS_NOT_FOUND', message: 'Certaines transactions sont introuvables' } },
        { status: 404 }
      );
    }

    // ── Validations ─────────────────────────────────────────────────────────
    for (const t of transactions) {
      if (t.status !== 'PENDING') {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_STATUS', message: 'Une transaction a déjà été traitée' } },
          { status: 400 }
        );
      }
    }

    // Vérifier que l'acheteur est bien l'utilisateur connecté
    const buyer = transactions[0].buyer;
    if (buyer.email !== supabaseUser.email) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Accès interdit' } },
        { status: 403 }
      );
    }

    const firstEvent = transactions[0].ticket.event;
    const seller = transactions[0].seller;

    // ── Calcul des montants ─────────────────────────────────────────────────
    // Les fonds restent toujours sur le compte plateforme (escrow).
    // Le cron auto-payout transfère la part du vendeur après la date de l'événement + 2 jours.
    const totalAmountCents = Math.round(
      transactions.reduce((s, t) => s + Number(t.amount), 0) * 100
    );

    // ── Construire le Payment Intent ────────────────────────────────────────
    const paymentIntentConfig: Stripe.PaymentIntentCreateParams = {
      amount: totalAmountCents,
      currency: 'eur',
      payment_method_types: ['card'],
      receipt_email: buyer.email,
      description: `${transactions.length} billets - ${firstEvent.title}`,
      metadata: {
        purchaseType: 'group',
        transactionIds: transactionIds.join(','),
        ticketCount: String(transactions.length),
        buyerId: buyer.id,
        sellerId: seller.id,
        eventId: firstEvent.id,
        eventDate: firstEvent.eventDate.toISOString(),
        escrowReleaseDate: transactions[0].escrowReleaseDate?.toISOString() ?? '',
      },
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    // ── Stocker le PI ID sur chaque transaction ─────────────────────────────
    await prisma.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    // ── Audit log ───────────────────────────────────────────────────────────
    await prisma.auditLog.create({
      data: {
        userId: buyer.id,
        action: 'PAYMENT_INTENT_CREATED',
        metadata: {
          transactionIds,
          paymentIntentId: paymentIntent.id,
          totalAmount: totalAmountCents / 100,
          purchaseType: 'group',
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        totalAmount: totalAmountCents / 100,
      },
    });
  } catch (error: any) {
    console.error('Error creating group payment intent:', error);

    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { success: false, error: { code: 'CARD_ERROR', message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'PAYMENT_INTENT_FAILED', message: 'Erreur lors de la création du paiement' } },
      { status: 500 }
    );
  }
}
