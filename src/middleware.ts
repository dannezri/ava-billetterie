/**
 * Middleware Next.js pour la gestion des environnements et de la sécurité
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware pour vérifier l'environnement et ajouter des headers de sécurité
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Ajouter des headers de sécurité supplémentaires
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Ajouter un header custom pour identifier l'environnement (dev uniquement)
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Environment', 'development');
  }

  return response;
}

/**
 * Configuration du middleware
 * Appliqué à toutes les routes sauf les fichiers statiques
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
