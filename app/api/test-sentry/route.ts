import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

export async function GET(req: NextRequest) {
  try {
    // 1. Log simple
    logger.log('📢 Test log Sentry initiated');

    // 2. Log warning
    logger.warn('⚠️ Test warning sent to Sentry', {
      user_action: 'test_sentry_route',
      timestamp: new Date().toISOString(),
    });

    // 3. Provoquer une vraie erreur (décommenter pour crasher la route)
    // throw new Error('🔥 Ceci est une erreur fatale de test Sentry !');

    // 4. Capturer une erreur manuelle via logger
    logger.error('❌ Test error manually captured', new Error('Simulation d\'erreur'), {
      context: 'test_route',
      details: 'Vérification de la réception dans le dashboard',
    });

    // 5. Capturer via Sentry direct pour vérifier la config
    Sentry.captureMessage('🚀 Sentry integration seems to be working!');

    return NextResponse.json({
      success: true,
      message: 'Tests Sentry envoyés. Vérifiez votre dashboard.',
      dsn_configured: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
    });
  } catch (error) {
    logger.error('Erreur inattendue dans le test', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
}
