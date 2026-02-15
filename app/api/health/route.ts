/**
 * Health check endpoint
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check - verify environment variables are loaded
    const envCheck = {
      database: !!process.env.DATABASE_URL,
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      stripe: !!process.env.STRIPE_SECRET_KEY,
    };

    const allServicesConfigured = Object.values(envCheck).every(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        status: allServicesConfigured ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        services: {
          api: 'up',
          database: envCheck.database ? 'configured' : 'missing',
          supabase: envCheck.supabase ? 'configured' : 'missing',
          stripe: envCheck.stripe ? 'configured' : 'missing',
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: error instanceof Error ? error.message : 'Service unhealthy',
        },
      },
      { status: 503 }
    );
  }
}
