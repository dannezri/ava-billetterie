/**
 * Cron Job: Libération automatique des réservations expirées
 * Route: GET /api/cron/release-expired
 *
 * Appelé automatiquement par Vercel Cron toutes les minutes.
 * Sécurisé par CRON_SECRET (header Authorization: Bearer <secret>).
 *
 * Peut aussi être déclenché manuellement depuis l'admin.
 */

import { NextRequest, NextResponse } from 'next/server';
import { releaseExpiredReservations } from '@/lib/services/cleanup.service';

export const runtime = 'nodejs';
// Forcer un re-exécution à chaque appel (pas de cache)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Vérification du secret pour les appels externes
  // En production Vercel, le header est positionné automatiquement par le scheduler
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await releaseExpiredReservations();

    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[cron/release-expired]', err);
    return NextResponse.json(
      { ok: false, error: err.message ?? 'Erreur interne' },
      { status: 500 },
    );
  }
}
