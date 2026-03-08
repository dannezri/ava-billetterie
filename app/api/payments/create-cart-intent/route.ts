/**
 * POST /api/payments/create-cart-intent
 * Crée un seul PaymentIntent Stripe pour tous les items du panier.
 * Supporte des transactions de vendeurs différents.
 * Les fonds restent sur le compte plateforme si plusieurs vendeurs sont impliqués.
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { createClient } from '@/lib/supabase/server-client';
import Stripe from 'stripe';
import { stripePayments as stripe } from '@/lib/stripe/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

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

    // Charger toutes les transactions
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

    // Vérifier que toutes sont PENDING et appartiennent à l'acheteur
    const buyer = transactions[0].buyer;
    for (const t of transactions) {
      if (t.status !== 'PENDING') {
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_STATUS', message: `La transaction ${t.id.slice(0, 8)} a déjà été traitée` } },
          { status: 400 }
        );
      }
      if (t.buyerId !== buyer.id) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Accès interdit' } },
          { status: 403 }
        );
      }
    }

    if (buyer.email !== supabaseUser.email) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Accès interdit' } },
        { status: 403 }
      );
    }

    // Calcul du total
    // Les fonds restent toujours sur le compte plateforme (escrow), qu'il y ait un ou plusieurs vendeurs.
    // Le cron auto-payout transfère la part de chaque vendeur après la date de l'événement + 2 jours.
    const totalAmountCents = Math.round(
      transactions.reduce((s, t) => s + Number(t.amount), 0) * 100
    );

    // Informations pour les métadonnées et la description
    const sellerIds = [...new Set(transactions.map((t) => t.sellerId))];
    const eventTitles = [...new Set(transactions.map((t) => t.ticket.event.title))];
    const description =
      eventTitles.length === 1
        ? `${transactions.length} billet${transactions.length > 1 ? 's' : ''} – ${eventTitles[0]}`
        : `${transactions.length} billets – ${eventTitles.length} événements`;

    const paymentIntentConfig: Stripe.PaymentIntentCreateParams = {
      amount: totalAmountCents,
      currency: 'eur',
      payment_method_types: ['card'],
      receipt_email: buyer.email,
      description,
      metadata: {
        purchaseType: 'cart',
        transactionIds: transactionIds.join(','),
        ticketCount: String(transactions.length),
        buyerId: buyer.id,
        sellerCount: String(sellerIds.length),
      },
    };

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    // Stocker le PI ID sur toutes les transactions
    await prisma.transaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: buyer.id,
        action: 'PAYMENT_INTENT_CREATED',
        metadata: {
          transactionIds,
          paymentIntentId: paymentIntent.id,
          totalAmount: totalAmountCents / 100,
          purchaseType: 'cart',
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
    console.error('Erreur create-cart-intent:', error);

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
