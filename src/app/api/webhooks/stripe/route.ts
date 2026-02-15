/**
 * Stripe Webhooks Handler
 * Gère les événements Stripe (paiements, KYC, transferts)
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/db/prisma';
import stripe from '@/lib/stripe/client';

// Désactiver le body parser de Next.js pour les webhooks Stripe
export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.warn('⚠️ STRIPE_WEBHOOK_SECRET not configured');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('❌ Missing signature or webhook secret');
      return NextResponse.json(
        { error: 'Webhook signature or secret missing' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Webhook signature verification failed:', errorMessage);
      return NextResponse.json(
        { error: `Webhook Error: ${errorMessage}` },
        { status: 400 }
      );
    }

    console.log('✅ Webhook event received:', event.type);

    // Router les événements selon leur type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge);
        break;

      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      case 'identity.verification_session.verified':
        await handleIdentityVerified(event.data.object as Stripe.Identity.VerificationSession);
        break;

      case 'identity.verification_session.requires_input':
        await handleIdentityRequiresInput(event.data.object as Stripe.Identity.VerificationSession);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * Paiement réussi → Mettre à jour la transaction en séquestre
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Payment succeeded:', paymentIntent.id);

  const ticketId = paymentIntent.metadata.ticket_id;
  const buyerId = paymentIntent.metadata.buyer_id;

  if (!ticketId || !buyerId) {
    console.error('❌ Missing ticket_id or buyer_id in metadata');
    return;
  }

  try {
    // Récupérer le billet et calculer la date de libération du séquestre
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true },
    });

    if (!ticket) {
      console.error('❌ Ticket not found:', ticketId);
      return;
    }

    // Calculer escrow_release_date = event_date + 2 jours
    const escrowReleaseDate = new Date(ticket.event.eventDate);
    escrowReleaseDate.setDate(escrowReleaseDate.getDate() + 2);

    // Créer ou mettre à jour la transaction
    await prisma.transaction.upsert({
      where: { ticketId },
      create: {
        ticketId,
        buyerId,
        sellerId: ticket.sellerId,
        amount: paymentIntent.amount / 100, // Convertir cents → euros
        platformFee: (paymentIntent.amount * 0.15) / 100,
        stripePaymentIntentId: paymentIntent.id,
        status: 'ESCROWED',
        escrowReleaseDate,
      },
      update: {
        status: 'ESCROWED',
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    // Mettre à jour le statut du billet
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'SOLD' },
    });

    console.log('✅ Transaction created/updated with escrow');

    // TODO: Envoyer emails (acheteur + vendeur)
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
}

/**
 * Paiement échoué → Libérer la réservation
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('❌ Payment failed:', paymentIntent.id);

  const ticketId = paymentIntent.metadata.ticket_id;

  if (!ticketId) {
    return;
  }

  try {
    // Remettre le billet en vente
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'ACTIVE' },
    });

    console.log('✅ Ticket released back to marketplace');
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

/**
 * Charge réussie (confirmation supplémentaire)
 */
async function handleChargeSucceeded(charge: Stripe.Charge) {
  console.log('💳 Charge succeeded:', charge.id);
  // Log pour audit
  // TODO: Créer audit log
}

/**
 * Transfert créé → Séquestre libéré vers le vendeur
 */
async function handleTransferCreated(transfer: Stripe.Transfer) {
  console.log('💸 Transfer created:', transfer.id);

  const transactionId = transfer.metadata.transaction_id;

  if (!transactionId) {
    console.error('❌ Missing transaction_id in transfer metadata');
    return;
  }

  try {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'RELEASED',
        stripeTransferId: transfer.id,
        releasedAt: new Date(),
      },
    });

    console.log('✅ Transaction marked as released');

    // TODO: Envoyer email au vendeur
  } catch (error) {
    console.error('❌ Error handling transfer:', error);
  }
}

/**
 * KYC vérifié → Mettre à jour le statut utilisateur
 */
async function handleIdentityVerified(
  session: Stripe.Identity.VerificationSession
) {
  console.log('✅ Identity verified:', session.id);

  const userId = session.metadata?.user_id;

  if (!userId) {
    console.error('❌ Missing user_id in verification session metadata');
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'VERIFIED',
        kycProviderId: session.id,
      },
    });

    console.log('✅ User KYC status updated to VERIFIED');

    // TODO: Envoyer email de confirmation
  } catch (error) {
    console.error('❌ Error updating KYC status:', error);
  }
}

/**
 * KYC nécessite input supplémentaire
 */
async function handleIdentityRequiresInput(
  session: Stripe.Identity.VerificationSession
) {
  console.log('⚠️ Identity requires input:', session.id);

  const userId = session.metadata?.user_id;

  if (!userId) {
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'PENDING',
      },
    });

    console.log('✅ User KYC status updated to PENDING');

    // TODO: Envoyer email demandant plus d'informations
  } catch (error) {
    console.error('❌ Error updating KYC status:', error);
  }
}
