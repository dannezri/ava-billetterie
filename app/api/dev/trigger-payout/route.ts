/**
 * POST /api/dev/trigger-payout
 *
 * ⚠️  DÉVELOPPEMENT UNIQUEMENT — Bloqué en production.
 *
 * Déclenche manuellement le virement automatique pour une transaction spécifique.
 * Utilisé pour tester le flow auto-payout sans attendre le cron quotidien.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AutoPayoutService } from '@/lib/services/auto-payout.service';
import { prisma } from '@/lib/db/prisma';

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json({ error: 'transactionId requis' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { id: true, status: true, autoPayoutStatus: true, escrowReleaseDate: true },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 });
    }

    // Forcer le statut RELEASED si encore ESCROWED (pour les tests avec ESCROW_RELEASE_HOURS=0)
    if (transaction.status === 'ESCROWED' || transaction.status === 'COMPLETED') {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
          escrowReleaseDate: new Date(Date.now() - 1000), // Passé de 1 seconde
        },
      });
    }

    // Réinitialiser le statut si déjà COMPLETED (pour re-tester)
    if (transaction.autoPayoutStatus === 'COMPLETED') {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          autoPayoutStatus: 'PENDING',
          autoPayoutDate: null,
          autoPayoutError: null,
          stripeTransferId: null,
        },
      });
    }

    const result = await AutoPayoutService.processSinglePayout(transactionId);

    return NextResponse.json({
      success: true,
      message: `Traitement terminé : ${result.succeeded} succès, ${result.failed} échec(s)`,
      result,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[DEV] trigger-payout error:', errMsg);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
