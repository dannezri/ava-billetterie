/**
 * AutoPayoutService
 *
 * Gère les virements automatiques par billet (J+2 après l'événement).
 * Flux : Chaque transaction RELEASED → Stripe Transfer individuel → compte vendeur.
 *
 * Appelé par le cron job quotidien /api/cron/process-auto-payouts.
 */

import { config } from '@/config/env';
import Stripe from 'stripe';
import { prisma } from '@/lib/db/prisma';
import { NotificationService } from './notification.service';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-04-10',
  typescript: true,
});

// ============================================================================
// TYPES
// ============================================================================

export interface AutoPayoutResult {
  processed: number;
  succeeded: number;
  failed: number;
  errors: Array<{ transactionId: string; error: string }>;
}

interface SellerInfo {
  id: string;
  kycStatus: string;
  stripeAccountId: string | null;
}

// ============================================================================
// SERVICE
// ============================================================================

// Type de transaction enrichie utilisé en interne
type EligibleTransaction = {
  id: string;
  sellerId: string;
  amount: import('@prisma/client').Prisma.Decimal;
  platformFee: import('@prisma/client').Prisma.Decimal;
  stripePaymentIntentId: string | null;
  seller: SellerInfo;
  ticket: { event: { title: string } };
};

export class AutoPayoutService {
  /**
   * Traiter tous les virements automatiques éligibles.
   * Appelé quotidiennement par le cron job (9h00 heure serveur).
   */
  static async processEligiblePayouts(): Promise<AutoPayoutResult> {
    console.log('🔄 [AutoPayout] Processing auto-payouts...');
    console.log(`⏰ [AutoPayout] Timestamp: ${new Date().toISOString()}`);

    const eligibleTransactions = await prisma.transaction.findMany({
      where: {
        status: 'RELEASED',
        autoPayoutStatus: { in: ['PENDING', 'FAILED'] },
        escrowReleaseDate: { lte: new Date() },
        manualReview: false,
      },
      include: {
        seller: {
          select: { id: true, kycStatus: true, stripeAccountId: true },
        },
        ticket: {
          include: { event: { select: { title: true } } },
        },
      },
      orderBy: { escrowReleaseDate: 'asc' },
      take: 100,
    });

    console.log(`📊 [AutoPayout] Found ${eligibleTransactions.length} eligible transactions`);

    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    const errors: AutoPayoutResult['errors'] = [];

    for (const transaction of eligibleTransactions) {
      processed++;
      const outcome = await this.processOnePayout(transaction as EligibleTransaction);
      if (outcome.success) {
        succeeded++;
      } else {
        failed++;
        errors.push({ transactionId: transaction.id, error: outcome.error ?? 'Échec' });
      }
    }

    console.log(
      `✅ [AutoPayout] Done: ${succeeded} succeeded, ${failed} failed out of ${processed} processed`
    );

    return { processed, succeeded, failed, errors };
  }

  /**
   * Déclencher le virement pour une transaction unique (usage DEV).
   */
  static async processSinglePayout(transactionId: string): Promise<AutoPayoutResult> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        seller: {
          select: { id: true, kycStatus: true, stripeAccountId: true },
        },
        ticket: {
          include: { event: { select: { title: true } } },
        },
      },
    });

    if (!transaction) {
      return { processed: 0, succeeded: 0, failed: 1, errors: [{ transactionId, error: 'Transaction introuvable' }] };
    }

    const outcome = await this.processOnePayout(transaction as EligibleTransaction);

    return {
      processed: 1,
      succeeded: outcome.success ? 1 : 0,
      failed: outcome.success ? 0 : 1,
      errors: outcome.success ? [] : [{ transactionId, error: outcome.error ?? 'Échec' }],
    };
  }

  /**
   * Logique commune : traiter une seule transaction.
   */
  private static async processOnePayout(
    transaction: EligibleTransaction
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const eligibility = await this.checkSellerEligibility(transaction.seller);

      if (!eligibility.eligible) {
        console.warn(
          `⚠️  [AutoPayout] Seller ${transaction.sellerId} not eligible: ${eligibility.reason}`
        );

        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { autoPayoutStatus: 'MANUAL_REVIEW', autoPayoutError: eligibility.reason },
        });

        await NotificationService.create({
          userId: transaction.sellerId,
          type: 'SYSTEM',
          title: 'Action requise pour recevoir votre paiement',
          message: eligibility.reason ?? 'Une action est requise pour débloquer votre paiement.',
          linkUrl: '/dashboard/seller/profile',
          ctaText: 'Compléter mon profil',
          priority: 'HIGH',
        });

        return { success: false, error: eligibility.reason ?? 'Vendeur non éligible' };
      }

      const eventName = transaction.ticket.event.title;
      const sellerAmount = Number(transaction.amount) - Number(transaction.platformFee);

      const result = await this.createStripeTransfer({
        transactionId: transaction.id,
        amount: sellerAmount,
        stripeAccountId: transaction.seller.stripeAccountId!,
        eventName,
        stripePaymentIntentId: transaction.stripePaymentIntentId,
      });

      if (result.success) {
        console.log(
          `✅ [AutoPayout] Transfer succeeded for tx ${transaction.id}: ${result.transferId}`
        );

        await NotificationService.create({
          userId: transaction.sellerId,
          type: 'TRANSACTION',
          title: 'Paiement reçu',
          message: `Vous avez reçu ${sellerAmount.toFixed(2)}€ pour ${eventName}. Les fonds arriveront sous 1-3 jours ouvrés.`,
          linkUrl: '/dashboard/seller/history',
          ctaText: 'Voir mon historique',
          priority: 'HIGH',
        });

        return { success: true };
      } else {
        console.error(
          `❌ [AutoPayout] Transfer failed for tx ${transaction.id}: ${result.error}`
        );
        return { success: false, error: result.error };
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error(`❌ [AutoPayout] Error processing tx ${transaction.id}:`, errMsg);

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { autoPayoutStatus: 'FAILED', autoPayoutError: errMsg },
      });

      return { success: false, error: errMsg };
    }
  }

  /**
   * Vérifier l'éligibilité d'un vendeur au virement automatique.
   */
  private static async checkSellerEligibility(seller: SellerInfo): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    if (seller.kycStatus !== 'VERIFIED') {
      return {
        eligible: false,
        reason: 'Vérification identité requise (KYC non validé)',
      };
    }

    if (!seller.stripeAccountId) {
      return {
        eligible: false,
        reason: 'Compte bancaire non connecté (Stripe Connect requis)',
      };
    }

    try {
      const account = await stripe.accounts.retrieve(seller.stripeAccountId);

      if (!account.charges_enabled) {
        return {
          eligible: false,
          reason: 'Compte Stripe non activé (charges désactivées)',
        };
      }

      if (!account.payouts_enabled) {
        return {
          eligible: false,
          reason: 'Virements désactivés sur le compte Stripe',
        };
      }
    } catch {
      return {
        eligible: false,
        reason: 'Impossible de vérifier le compte Stripe',
      };
    }

    return { eligible: true };
  }

  /**
   * Créer un Stripe Transfer vers le compte connecté du vendeur.
   */
  private static async createStripeTransfer(params: {
    transactionId: string;
    amount: number;
    stripeAccountId: string;
    eventName: string;
    stripePaymentIntentId?: string | null;
  }): Promise<{ success: boolean; transferId?: string; error?: string }> {
    try {
      await prisma.transaction.update({
        where: { id: params.transactionId },
        data: { autoPayoutStatus: 'PROCESSING' },
      });

      const amountCents = Math.round(params.amount * 100);

      // Lier le transfer à la charge originale pour que Stripe finance
      // directement depuis ce paiement plutôt que depuis le solde disponible.
      let sourceTransaction: string | undefined;
      if (params.stripePaymentIntentId) {
        try {
          const pi = await stripe.paymentIntents.retrieve(params.stripePaymentIntentId, { expand: ['latest_charge'] });
          const charge = pi.latest_charge as Stripe.Charge | null;
          if (charge?.id) sourceTransaction = charge.id;
        } catch {
          // Pas bloquant : on continue sans source_transaction
        }
      }

      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: 'eur',
        destination: params.stripeAccountId,
        transfer_group: `auto_payout_${params.transactionId}`,
        description: `Paiement automatique - ${params.eventName}`,
        ...(sourceTransaction ? { source_transaction: sourceTransaction } : {}),
        metadata: {
          transaction_id: params.transactionId,
          event_name: params.eventName,
          auto_payout: 'true',
        },
      });


      await prisma.transaction.update({
        where: { id: params.transactionId },
        data: {
          autoPayoutStatus: 'COMPLETED',
          autoPayoutDate: new Date(),
          stripeTransferId: transfer.id,
          autoPayoutError: null,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: 'AUTO_PAYOUT_COMPLETED',
          metadata: {
            transaction_id: params.transactionId,
            stripe_transfer_id: transfer.id,
            amount_eur: params.amount,
            event_name: params.eventName,
          },
        },
      });

      return { success: true, transferId: transfer.id };
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Stripe transfer failed';

      await prisma.transaction.update({
        where: { id: params.transactionId },
        data: {
          autoPayoutStatus: 'FAILED',
          autoPayoutError: errMsg,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: 'AUTO_PAYOUT_FAILED',
          metadata: {
            transaction_id: params.transactionId,
            error: errMsg,
            event_name: params.eventName,
          },
        },
      });

      return { success: false, error: errMsg };
    }
  }
}
