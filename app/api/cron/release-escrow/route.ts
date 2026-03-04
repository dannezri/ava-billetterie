/**
 * Cron Job: Libération automatique du séquestre (ESCROWED → RELEASED)
 * Route: GET /api/cron/release-escrow
 *
 * Appelé automatiquement par Vercel Cron toutes les minutes.
 * Sécurisé par CRON_SECRET (header Authorization: Bearer <secret>).
 *
 * Logique :
 *  - Trouve toutes les transactions ESCROWED dont escrowReleaseDate <= now
 *  - Les passe en RELEASED
 *  - En test (ESCROW_RELEASE_HOURS=0) : les transactions sont libérables
 *    immédiatement après le paiement
 *
 * Peut aussi être déclenché manuellement depuis l'admin.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Vérification du secret pour les appels externes
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const now = new Date();

    // Trouver toutes les transactions en séquestre (COMPLETED ou ESCROWED) dont la date de libération est passée
    const maturedTransactions = await prisma.transaction.findMany({
      where: {
        status: { in: ['COMPLETED', 'ESCROWED'] },
        escrowReleaseDate: { lte: now },
      },
      select: {
        id: true,
        sellerId: true,
        amount: true,
        platformFee: true,
        escrowReleaseDate: true,
      },
    });

    if (maturedTransactions.length === 0) {
      return NextResponse.json({
        ok: true,
        released: 0,
        timestamp: now.toISOString(),
      });
    }

    const transactionIds = maturedTransactions.map((t) => t.id);
    let released = 0;
    let errors = 0;

    // Traitement par batch de 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < transactionIds.length; i += BATCH_SIZE) {
      const batch = transactionIds.slice(i, i + BATCH_SIZE);

      try {
        await prisma.$transaction(async (tx) => {
          // 1. Passer les transactions en RELEASED
          await tx.transaction.updateMany({
            where: { id: { in: batch } },
            data: { status: 'RELEASED' },
          });

          // 2. Audit log groupé
          await tx.auditLog.create({
            data: {
              userId: null,
              action: 'ADMIN_ACTION',
              metadata: {
                type: 'ESCROW_RELEASED',
                transactionIds: batch,
                reason: 'escrow_release_date_reached',
                releasedAt: now.toISOString(),
              },
            },
          });
        });

        released += batch.length;
      } catch (err) {
        console.error(`[cron/release-escrow] Erreur batch ${i}-${i + batch.length}:`, err);
        errors += batch.length;
      }
    }

    console.log(
      `[cron/release-escrow] ${released} transaction(s) libérée(s), ${errors} erreur(s)`
    );

    return NextResponse.json({
      ok: true,
      released,
      errors,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    console.error('[cron/release-escrow]', err);
    return NextResponse.json(
      { ok: false, error: err.message ?? 'Erreur interne' },
      { status: 500 }
    );
  }
}
