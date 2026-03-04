/**
 * Health check endpoint pour vérifier l'état de l'application
 * Utile pour les monitoring et les déploiements
 */

import { NextResponse } from 'next/server';
import { config } from '@/config/env';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Retourne l'état de santé de l'application
 */
export async function GET() {
  try {
    // Vérifier les variables d'environnement critiques
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required environment variables',
          missing: missingVars,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Vérifier la connexion à la base de données (optionnel)
    // const dbCheck = await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'ok',
        environment: config.app.env,
        version: process.env.npm_package_version || '0.1.0',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok', // Remplacer par le résultat de dbCheck si implémenté
          env: 'ok',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
