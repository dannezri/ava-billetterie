/**
 * Cleanup Service — Libération automatique des réservations expirées
 *
 * Une réservation expirée = ticket RESERVED dont expiresAt est dans le passé
 * et dont la transaction associée est encore PENDING (non achetée).
 *
 * Actions :
 *  - Ticket : RESERVED → ACTIVE, expiresAt → null
 *  - Transaction : PENDING → CANCELLED
 *  - AuditLog : TICKET_RELEASED enregistré
 */

import { prisma } from '@/lib/db/prisma';

export interface CleanupResult {
  released: number;
  errors: number;
  durationMs: number;
}

export async function releaseExpiredReservations(): Promise<CleanupResult> {
  const start = Date.now();
  const now = new Date();

  // Trouver tous les tickets RESERVED dont l'expiration est passée
  const expiredTickets = await prisma.ticket.findMany({
    where: {
      status: 'RESERVED',
      expiresAt: { lte: now },
    },
    select: { id: true },
  });

  if (expiredTickets.length === 0) {
    return { released: 0, errors: 0, durationMs: Date.now() - start };
  }

  const ticketIds = expiredTickets.map((t) => t.id);
  let released = 0;
  let errors = 0;

  // Traitement par batch de 50 pour éviter les timeouts
  const BATCH_SIZE = 50;
  for (let i = 0; i < ticketIds.length; i += BATCH_SIZE) {
    const batch = ticketIds.slice(i, i + BATCH_SIZE);

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Remettre les billets en ACTIVE
        await tx.ticket.updateMany({
          where: { id: { in: batch } },
          data: { status: 'ACTIVE', expiresAt: null },
        });

        // 2. Annuler les transactions PENDING associées
        await tx.transaction.updateMany({
          where: {
            ticketId: { in: batch },
            status: 'PENDING',
          },
          data: { status: 'CANCELLED' },
        });

        // 3. Audit log groupé (action système, pas de userId)
        await tx.auditLog.create({
          data: {
            userId: null,
            action: 'ADMIN_ACTION',
            metadata: {
              type: 'RESERVATION_EXPIRED_RELEASE',
              ticketIds: batch,
              reason: 'reservation_expired',
              releasedAt: now.toISOString(),
            },
          },
        });
      });

      released += batch.length;
    } catch (err) {
      console.error(`[cleanup] Erreur batch ${i}-${i + batch.length}:`, err);
      errors += batch.length;
    }
  }

  const durationMs = Date.now() - start;
  console.log(
    `[cleanup] ${released} réservation(s) libérée(s), ${errors} erreur(s) — ${durationMs}ms`,
  );

  return { released, errors, durationMs };
}
