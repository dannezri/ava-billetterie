/**
 * GET /api/cron/process-auto-payouts
 *
 * Cron job quotidien (9h00 heure serveur) : virement automatique par billet.
 * Chaque transaction RELEASED et éligible reçoit un Stripe Transfer individuel.
 *
 * Sécurité : requiert le header Authorization: Bearer <CRON_SECRET>
 * Configuré dans vercel.json (crons section).
 */

import { NextRequest, NextResponse } from 'next/server';
import { AutoPayoutService } from '@/lib/services/auto-payout.service';

export async function GET(request: NextRequest) {
  // Vérifier le secret Vercel Cron
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    console.warn('🚫 [AutoPayout Cron] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();
  console.log('🚀 [AutoPayout Cron] Starting...');

  try {
    const result = await AutoPayoutService.processEligiblePayouts();

    const durationMs = Date.now() - startTime;

    // Alerter si taux d'échec élevé (> 20%)
    const failureRate = result.processed > 0 ? (result.failed / result.processed) * 100 : 0;
    if (failureRate > 20) {
      console.warn(`⚠️  [AutoPayout Cron] High failure rate: ${failureRate.toFixed(1)}%`);
    }

    console.log(`✅ [AutoPayout Cron] Completed in ${durationMs}ms`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration_ms: durationMs,
      ...result,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('❌ [AutoPayout Cron] Fatal error:', errMsg);

    return NextResponse.json(
      {
        success: false,
        error: errMsg,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
