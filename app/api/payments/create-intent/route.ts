/**
 * Stripe Payment Intent API
 * POST /api/payments/create-intent - Create a payment intent with escrow
 * 
 * Logique:
 * - L'achat est TOUJOURS autorisé, même si le vendeur n'a pas configuré Stripe
 * - Si le vendeur a un compte Stripe Connect: transfert automatique configuré
 * - Si le vendeur n'a PAS de compte: fonds restent sur compte plateforme
 * - Le vendeur devra configurer son compte pour recevoir ses gains
 */

import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import Stripe from 'stripe';
import { stripePayments as stripe } from '@/lib/stripe/client';
import { paymentLimiter, applyRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Vous devez être connecté',
          },
        },
        { status: 401 }
      );
    }

    const rateLimitResponse = await applyRateLimit(paymentLimiter, user.id);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { ticketId, transactionId } = body;

    if (!ticketId || !transactionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'Paramètres manquants',
          },
        },
        { status: 400 }
      );
    }

    // Récupérer la transaction et vérifier son statut
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
        buyer: true,
        seller: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TRANSACTION_NOT_FOUND',
            message: 'Transaction non trouvée',
          },
        },
        { status: 404 }
      );
    }

    if (transaction.status !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Cette transaction a déjà été traitée',
          },
        },
        { status: 400 }
      );
    }

    // Convertir le montant en centimes pour Stripe
    // Les fonds restent toujours sur le compte plateforme (escrow).
    // Le cron auto-payout transfère la part du vendeur après la date de l'événement + 2 jours.
    const amountInCents = Math.round(Number(transaction.amount) * 100);

    // Configuration du Payment Intent
    const paymentIntentConfig: Stripe.PaymentIntentCreateParams = {
      amount: amountInCents,
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        transactionId: transaction.id,
        ticketId: transaction.ticketId,
        buyerId: transaction.buyerId,
        sellerId: transaction.sellerId,
        eventId: transaction.ticket.event.id,
        eventDate: transaction.ticket.event.eventDate.toISOString(),
        escrowReleaseDate: transaction.escrowReleaseDate?.toISOString() || '',
      },
      description: `Billet ${transaction.ticket.event.title} - ${transaction.ticket.section || 'Standard'}`,
      receipt_email: transaction.buyer.email,
    };

    // Créer le Payment Intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);

    // Mettre à jour la transaction avec le Payment Intent ID
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    // Créer un audit log
    await prisma.auditLog.create({
      data: {
        userId: transaction.buyerId,
        action: 'PAYMENT_INTENT_CREATED',
        metadata: {
          transactionId: transaction.id,
          paymentIntentId: paymentIntent.id,
          amount: transaction.amount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);

    // Erreurs Stripe spécifiques
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CARD_ERROR',
            message: error.message,
          },
        },
        { status: 400 }
      );
    }

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Erreur de configuration du paiement',
          },
        },
        { status: 400 }
      );
    }

    // Erreur générique
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PAYMENT_INTENT_FAILED',
          message: 'Erreur lors de la création du paiement',
        },
      },
      { status: 500 }
    );
  }
}
