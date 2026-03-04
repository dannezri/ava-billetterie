/**
 * Stripe Webhooks Handler
 * Gère les événements Stripe (paiements individuels, groupes, KYC, transferts)
 */

import prisma from '@/lib/db/prisma';
import stripe from '@/lib/stripe/client';
import { NotificationService } from '@/lib/services/notification.service';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ─── Point d'entrée ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET manquant');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('❌ Signature invalide:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotence
  const alreadyProcessed = await prisma.auditLog.findFirst({
    where: {
      action: 'ADMIN_ACTION',
      metadata: { path: ['eventId'], equals: event.id },
    },
  });

  if (alreadyProcessed) {
    console.log(`ℹ️ Event ${event.id} déjà traité`);
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.succeeded':
        // Couvert par payment_intent.succeeded — log uniquement
        console.log(`✅ Charge succeeded: ${(event.data.object as Stripe.Charge).id}`);
        break;

      case 'transfer.created':
      case 'transfer.paid':
        await handleTransferCompleted(event.data.object as Stripe.Transfer);
        break;

      case 'transfer.failed':
        await handleTransferFailed(event.data.object as Stripe.Transfer);
        break;

      case 'payout.paid':
      case 'payout.failed':
        console.log(`ℹ️ Payout event: ${event.type}`);
        break;

      case 'identity.verification_session.verified':
        await handleIdentityVerified(
          event.data.object as Stripe.Identity.VerificationSession
        );
        break;

      case 'identity.verification_session.requires_input':
        await handleIdentityRequiresInput(
          event.data.object as Stripe.Identity.VerificationSession
        );
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object as Stripe.Account);
        break;

      case 'account.application.deauthorized':
        console.warn(`⚠️ Account deauthorized: ${(event.data.object as Stripe.Account).id}`);
        break;

      case 'capability.updated':
      case 'person.created':
      case 'person.updated':
      case 'external_account.created':
        console.log(`ℹ️ Unhandled (benign): ${event.type}`);
        break;

      default:
        console.log(`ℹ️ Unhandled event: ${event.type}`);
    }

    // Log de succès (idempotence)
    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'ADMIN_ACTION',
        metadata: {
          eventId: event.id,
          eventType: event.type,
          processedAt: new Date().toISOString(),
          source: 'stripe_webhook',
        },
        ipAddress: 'stripe-webhook',
        userAgent: 'stripe',
      },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`❌ Erreur processing ${event.type}:`, err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// ─── Handlers paiements ────────────────────────────────────────────────────────

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const meta = paymentIntent.metadata;
  const purchaseType = meta?.purchaseType;

  if (purchaseType === 'group' || purchaseType === 'cart') {
    // ── Achat groupe ou panier : N billets, N transactions ─────────────────
    const transactionIds = (meta.transactionIds ?? '').split(',').filter(Boolean);

    if (transactionIds.length === 0) {
      console.error('⚠️ group payment_intent sans transactionIds:', paymentIntent.id);
      return;
    }

    await prisma.$transaction(async (tx) => {
      const transactions = await tx.transaction.findMany({
        where: { id: { in: transactionIds }, status: 'PENDING' },
        include: { ticket: true },
      });

      if (transactions.length === 0) {
        console.log('ℹ️ Group transactions déjà traitées:', transactionIds);
        return;
      }

      const ticketIds = transactions.map((t) => t.ticketId);

      // Marquer tous les billets SOLD
      await tx.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: { status: 'SOLD' },
      });

      // Marquer toutes les transactions COMPLETED.
      // Les fonds restent sur la plateforme — le cron auto-payout gérera le virement vendeur.
      await tx.transaction.updateMany({
        where: { id: { in: transactionIds } },
        data: {
          status: 'COMPLETED',
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      // Mettre à jour les stats vendeur
      const sellerId = meta.sellerId;
      if (sellerId) {
        const totalRevenue = transactions.reduce(
          (s, t) => s + Number(t.amount) - Number(t.platformFee),
          0
        );
        await tx.user.update({
          where: { id: sellerId },
          data: {
            hasSoldTickets: true,
            totalSales: { increment: transactions.length },
            totalRevenue: { increment: totalRevenue },
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: meta.buyerId ?? 'unknown',
          action: 'PAYMENT_SUCCEEDED',
          metadata: {
            paymentIntentId: paymentIntent.id,
            transactionIds,
            purchaseType: 'group',
            amount: paymentIntent.amount / 100,
          },
        },
      });
    });

    console.log(
      `✅ Groupe payé: ${transactionIds.length} billets (PI: ${paymentIntent.id})`
    );
  } else {
    // ── Achat individuel : 1 billet, 1 transaction ─────────────────────────
    const transactionId = meta?.transactionId;

    if (!transactionId) {
      console.error('⚠️ payment_intent sans transactionId:', paymentIntent.id);
      return;
    }

    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId, status: 'PENDING' },
        include: { ticket: true },
      });

      if (!transaction) {
        console.log('ℹ️ Transaction déjà traitée:', transactionId);
        return;
      }

      await tx.ticket.update({
        where: { id: transaction.ticketId },
        data: { status: 'SOLD' },
      });

      // Les fonds restent sur la plateforme — le cron auto-payout gérera le virement vendeur.
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      await tx.user.update({
        where: { id: transaction.sellerId },
        data: {
          hasSoldTickets: true,
          totalSales: { increment: 1 },
          totalRevenue: {
            increment: Number(transaction.amount) - Number(transaction.platformFee),
          },
        },
      });

      await tx.auditLog.create({
        data: {
          userId: transaction.buyerId,
          action: 'PAYMENT_SUCCEEDED',
          metadata: {
            paymentIntentId: paymentIntent.id,
            transactionId,
            purchaseType: 'single',
            amount: paymentIntent.amount / 100,
          },
        },
      });
    });

    // Notifications acheteur + vendeur (fire-and-forget)
    const txData = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { ticket: { include: { event: true } } },
    });
    if (txData) {
      const eventName = txData.ticket.event.title;
      Promise.all([
        NotificationService.notifyPurchaseConfirmed({
          userId: txData.buyerId,
          transactionId,
          eventName,
          amount: Number(txData.amount),
        }),
        NotificationService.notifyTicketSold({
          userId: txData.sellerId,
          transactionId,
          eventName,
          amount: Number(txData.amount) - Number(txData.platformFee),
        }),
      ]).catch(() => null);
    }

    console.log(`✅ Paiement individuel réussi (PI: ${paymentIntent.id})`);
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const meta = paymentIntent.metadata;
  const purchaseType = meta?.purchaseType;

  if (purchaseType === 'group') {
    const transactionIds = (meta.transactionIds ?? '').split(',').filter(Boolean);

    if (transactionIds.length > 0) {
      await prisma.$transaction(async (tx) => {
        const transactions = await tx.transaction.findMany({
          where: { id: { in: transactionIds } },
        });
        const ticketIds = transactions.map((t) => t.ticketId);

        // Remettre les billets en ACTIVE
        await tx.ticket.updateMany({
          where: { id: { in: ticketIds } },
          data: { status: 'ACTIVE' },
        });

        await tx.transaction.updateMany({
          where: { id: { in: transactionIds } },
          data: { status: 'CANCELLED' },
        });
      });

      console.warn(
        `⚠️ Groupe paiement échoué: ${transactionIds.length} billets remis en vente (PI: ${paymentIntent.id})`
      );
    }
  } else {
    const transactionId = meta?.transactionId;
    if (transactionId) {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
      });
      if (transaction) {
        await prisma.ticket.update({
          where: { id: transaction.ticketId },
          data: { status: 'ACTIVE' },
        });
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { status: 'CANCELLED' },
        });
      }
      console.warn(`⚠️ Paiement individuel échoué (PI: ${paymentIntent.id})`);
    }
  }

  await prisma.auditLog.create({
    data: {
      userId: meta?.buyerId ?? 'unknown',
      action: 'PAYMENT_FAILED',
      metadata: {
        paymentIntentId: paymentIntent.id,
        purchaseType: purchaseType ?? 'single',
        error: paymentIntent.last_payment_error?.message ?? 'unknown',
      },
    },
  });
}

// ─── Handlers KYC ─────────────────────────────────────────────────────────────

async function handleIdentityVerified(
  session: Stripe.Identity.VerificationSession
) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      kycStatus: 'VERIFIED',
      verifiedIdentity: true,
      kycProviderId: session.id,
    },
  });

  NotificationService.notifyKYCApproved(userId).catch(() => null);
  console.log(`✅ KYC vérifié pour user: ${userId}`);
}

async function handleIdentityRequiresInput(
  session: Stripe.Identity.VerificationSession
) {
  const userId = session.metadata?.userId;
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: 'REJECTED' },
  });

  NotificationService.notifyKYCRejected(userId).catch(() => null);
  console.warn(`⚠️ KYC échoué pour user: ${userId}`);
}

// ─── Handlers Transfers (auto-payout) ─────────────────────────────────────────

async function handleTransferCompleted(transfer: Stripe.Transfer) {
  const transactionId = transfer.metadata?.transaction_id;

  if (!transactionId) {
    console.log(`ℹ️ Transfer ${transfer.id} sans transaction_id dans les metadata — ignoré`);
    return;
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: { id: true, autoPayoutStatus: true },
  });

  if (!transaction) {
    console.warn(`⚠️ Transfer ${transfer.id} : transaction ${transactionId} introuvable`);
    return;
  }

  // Déjà marqué COMPLETED → idempotent
  if (transaction.autoPayoutStatus === 'COMPLETED') {
    console.log(`ℹ️ Transaction ${transactionId} déjà COMPLETED — skip`);
    return;
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      autoPayoutStatus: 'COMPLETED',
      autoPayoutDate: new Date(),
      stripeTransferId: transfer.id,
      autoPayoutError: null,
    },
  });

  console.log(`✅ Transfer ${transfer.id} → transaction ${transactionId} marquée COMPLETED`);
}

async function handleTransferFailed(transfer: Stripe.Transfer) {
  const transactionId = transfer.metadata?.transaction_id;
  if (!transactionId) return;

  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      autoPayoutStatus: 'FAILED',
      autoPayoutError: `Stripe transfer ${transfer.id} échoué`,
    },
  }).catch(() => null);

  console.warn(`⚠️ Transfer ${transfer.id} échoué → transaction ${transactionId} marquée FAILED`);
}

// ─── Handlers Stripe Connect ───────────────────────────────────────────────────

async function handleAccountUpdated(account: Stripe.Account) {
  // Mettre à jour le stripeAccountId si l'onboarding est complété
  const user = await prisma.user.findFirst({
    where: { stripeAccountId: account.id },
  });

  if (!user) return;

  const isEnabled =
    account.charges_enabled && account.payouts_enabled;

  if (isEnabled) {
    console.log(`✅ Stripe Connect actif pour: ${account.id}`);
  } else {
    console.log(`ℹ️ Stripe Connect mise à jour: ${account.id} (enabled: ${isEnabled})`);
  }
}
