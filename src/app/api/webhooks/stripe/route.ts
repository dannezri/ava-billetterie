/**
 * Stripe Webhooks Handler
 * Gère les événements Stripe (paiements, KYC, transferts)
 */

import prisma from '@/lib/db/prisma';
import { logger } from '@/lib/logger';
import stripe from '@/lib/stripe/client';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Désactiver le body parser de Next.js pour les webhooks Stripe
export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.warn('⚠️ STRIPE_WEBHOOK_SECRET not configured');
}

/**
 * @api {POST} /api/webhooks/stripe
 * @description Point d'entrée pour tous les événements Stripe Webhooks.
 * Gère la validation de signature, l'idempotence, le logging Sentry et le dispatch vers les handlers spécifiques.
 * 
 * Événements gérés :
 * - Paiements: payment_intent.succeeded, charge.succeeded
 * - Transferts: transfer.created, transfer.paid, payout.paid
 * - KYC: identity.verification_session.verified, identity.verification_session.requires_input
 * - Comptes: account.updated, account.application.deauthorized
 * 
 * @returns {Object} { received: true } ou erreur
 */
export async function POST(req: NextRequest) {
  console.log('📥 Webhook received');
  
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is missing in environment variables');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('❌ Signature verification failed:', err instanceof Error ? err.message : 'Unknown');
      console.log('ℹ️  Ensure your .env.local STRIPE_WEBHOOK_SECRET matches the one from "stripe listen"');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`✅ Event validated: ${event.type}`);

    // === IDEMPOTENCE ===
    const existingLog = await prisma.auditLog.findFirst({
      where: {
        action: 'STRIPE_WEBHOOK_PROCESSED',
        metadata: {
          path: ['eventId'],
          equals: event.id,
        },
      },
    });

    if (existingLog) {
      console.log(`ℹ️ Event ${event.id} already processed. Skipping.`);
      return NextResponse.json({ received: true });
    }

    try {
    // Router les événements selon leur type
    switch (event.type) {
      // === PAIEMENTS ===
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.succeeded':
        await handleChargeSucceeded(event.data.object as Stripe.Charge);
        break;

      // === TRANSFERTS & PAYOUTS ===
      case 'transfer.created':
        await handleTransferCreated(event.data.object as Stripe.Transfer);
        break;

      case 'transfer.paid':
        await handleTransferPaid(event.data.object as Stripe.Transfer);
        break;

      case 'transfer.failed':
        await handleTransferFailed(event.data.object as Stripe.Transfer);
        break;

      case 'payout.paid':
        await handlePayoutPaid(event.data.object as Stripe.Payout);
        break;

      case 'payout.failed':
        await handlePayoutFailed(event.data.object as Stripe.Payout);
        break;

      // === KYC / IDENTITY ===
      case 'identity.verification_session.verified':
        await handleIdentityVerified(event.data.object as Stripe.Identity.VerificationSession);
        break;

      case 'identity.verification_session.requires_input':
        await handleIdentityRequiresInput(event.data.object as Stripe.Identity.VerificationSession);
        break;

      // === STRIPE CONNECT ACCOUNTS ===
      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'account.application.deauthorized':
        await handleAccountDeauthorized(event.data.object as Stripe.Account);
        break;

      case 'capability.updated':
        await handleCapabilityUpdated(event.data.object as Stripe.Capability);
        break;

      case 'external_account.created':
        await handleExternalAccountCreated(event.data.object);
        break;

      case 'person.created':
      case 'person.updated':
        console.log(`ℹ️ Person event: ${event.type}`);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // === LOGGING SUCCÈS ===
    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: 'STRIPE_WEBHOOK_PROCESSED',
        metadata: {
          eventId: event.id,
          eventType: event.type,
          processedAt: new Date().toISOString(),
        },
        ipAddress: 'stripe-webhook',
        userAgent: 'stripe',
      },
    });

    return NextResponse.json({ received: true });
    } catch (err) {
      logger.error(`Error processing event ${event.type}`, err, { eventId: event.id });
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Webhook error', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
