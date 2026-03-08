import { Ratelimit } from '@upstash/ratelimit';
import { NextRequest, NextResponse } from 'next/server';
import { redis, isRedisConfigured } from './redis';

/**
 * Login : 5 tentatives / minute par IP — protection brute-force
 */
export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: 'ratelimit:login',
});

/**
 * Signup : 3 inscriptions / 10 minutes par IP — protection spam accounts
 */
export const signupLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '10 m'),
  analytics: true,
  prefix: 'ratelimit:signup',
});

/**
 * Password reset : 3 demandes / heure par email — protection flood
 */
export const passwordResetLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'ratelimit:password-reset',
});

/**
 * Upload ticket PDF : 10 uploads / heure par user
 */
export const uploadTicketLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'ratelimit:upload-ticket',
});

/**
 * Payments : 10 paiements / heure par user
 */
export const paymentLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'ratelimit:payment',
});

/**
 * Extraire l'IP réelle du client (compatible Vercel)
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Applique un rate limiter sur un identifiant.
 * Retourne une Response 429 si la limite est dépassée, null sinon.
 */
export async function applyRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<NextResponse | null> {
  // Bypass rate limiting if Redis is not configured (dev sans Upstash)
  if (!isRedisConfigured) {
    return null;
  }
  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    const headers = new Headers({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    });

    if (!success) {
      return NextResponse.json(
        {
          error: 'Trop de requêtes. Veuillez réessayer plus tard.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        { status: 429, headers }
      );
    }

    return null;
  } catch (err) {
    // En cas d'erreur Redis (ex: service indisponible), on laisse passer
    // pour éviter de bloquer les utilisateurs légitimes
    console.error('[rate-limit] Redis error, bypassing:', err);
    return null;
  }
}
