import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Middleware Next.js pour :
 * - Authentification (Supabase session)
 * - Protection routes selon rôles (buyer, seller, admin)
 * - Vérification KYC pour vendeurs
 * - Rate limiting (via headers)
 */
export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session si nécessaire (Supabase auto-refresh)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // ============================================================================
  // 1. ROUTES PUBLIQUES (pas d'authentification requise)
  // ============================================================================
  
  const publicRoutes = [
    '/',
    '/about',
    '/help',
    '/events',
    '/search',
    '/terms',
    '/privacy',
    '/legal',
    '/cookies',
    '/serenity-guarantee',
  ];

  // Autoriser routes publiques et assets
  if (
    publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/webhooks') || // Webhooks publics (sécurisés par signature)
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return res;
  }

  // ============================================================================
  // 2. ROUTES AUTHENTIFICATION (redirection si déjà connecté)
  // ============================================================================
  
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (session) {
      // Déjà connecté → Redirect dashboard approprié
      const user = await getUserRole(session.user.id);
      const redirectUrl = getDefaultDashboard(user?.role || 'BUYER');
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return res;
  }

  // ============================================================================
  // 3. ROUTES PROTÉGÉES (authentification obligatoire)
  // ============================================================================
  
  if (!session) {
    // Non authentifié → Redirect login avec returnUrl
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ============================================================================
  // 4. ROUTES ACHETEUR (utilisateur standard)
  // ============================================================================
  
  const buyerRoutes = [
    '/dashboard',
    '/my-purchases',
    '/favorites',
    '/notifications',
    '/profile',
    '/payment-methods',
    '/invoices',
    '/checkout',
  ];

  if (buyerRoutes.some((route) => pathname.startsWith(route))) {
    // Vérifier email vérifié (optionnel, selon politique)
    // const user = await getUserDetails(session.user.id);
    // if (!user?.email_verified_at) {
    //   return NextResponse.redirect(new URL('/verify-email', request.url));
    // }
    
    return res;
  }

  // ============================================================================
  // 5. ROUTES VENDEUR (KYC obligatoire)
  // ============================================================================
  
  const sellerRoutes = [
    '/seller/dashboard',
    '/seller/tickets',
    '/seller/sales',
    '/seller/payments',
    '/seller/analytics',
    '/seller/reputation',
    '/seller/disputes',
  ];

  if (sellerRoutes.some((route) => pathname.startsWith(route))) {
    const user = await getUserDetails(session.user.id);

    // Vérifier KYC
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (user.kyc_status !== 'VERIFIED') {
      // KYC non vérifié → Redirect onboarding vendeur
      const onboardingUrl = new URL('/seller/onboarding', request.url);
      
      // Exception : Autoriser accès à la page onboarding elle-même
      if (pathname === '/seller/onboarding' || pathname.startsWith('/seller/kyc')) {
        return res;
      }
      
      return NextResponse.redirect(onboardingUrl);
    }

    return res;
  }

  // ============================================================================
  // 6. ROUTES ADMIN (rôle ADMIN ou MODERATOR)
  // ============================================================================
  
  if (pathname.startsWith('/admin')) {
    const user = await getUserDetails(session.user.id);

    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      // Pas admin → Redirect dashboard standard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Moderators : Accès limité à validation billets uniquement
    if (user.role === 'MODERATOR') {
      const moderatorAllowedRoutes = [
        '/admin/tickets/validation',
        '/admin/tickets/pending',
      ];

      const isAllowed = moderatorAllowedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (!isAllowed && pathname !== '/admin') {
        // Redirect vers validation billets
        return NextResponse.redirect(
          new URL('/admin/tickets/validation', request.url)
        );
      }
    }

    return res;
  }

  // ============================================================================
  // 7. ROUTES API PROTÉGÉES
  // ============================================================================
  
  if (pathname.startsWith('/api')) {
    // Routes API publiques (pas d'auth requise)
    const publicApiRoutes = [
      '/api/events',
      '/api/search',
      '/api/health',
    ];

    const isPublicApi = publicApiRoutes.some((route) =>
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isPublicApi) {
      return res;
    }

    // Routes API protégées
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Routes API Admin
    if (pathname.startsWith('/api/admin')) {
      const user = await getUserDetails(session.user.id);

      if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Accès administrateur requis' },
          { status: 403 }
        );
      }
    }

    // Routes API Seller (KYC requis)
    const sellerApiRoutes = [
      '/api/seller',
      '/api/stripe-connect',
      '/api/tickets/create',
    ];

    if (sellerApiRoutes.some((route) => pathname.startsWith(route))) {
      const user = await getUserDetails(session.user.id);

      if (!user || user.kyc_status !== 'VERIFIED') {
        return NextResponse.json(
          {
            error: 'KYC_REQUIRED',
            message: 'Vérification d\'identité requise pour cette action',
          },
          { status: 403 }
        );
      }
    }

    return res;
  }

  // Par défaut : Autoriser
  return res;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Récupère les détails utilisateur depuis DB
 * Cache en production avec revalidation courte
 */
async function getUserDetails(userId: string) {
  try {
    // Import dynamique pour éviter problème edge runtime
    const { prisma } = await import('@/lib/prisma');

    const user = await prisma.user.findUnique({
      where: { supabase_user_id: userId },
      select: {
        id: true,
        role: true,
        kyc_status: true,
        email_verified_at: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user details in middleware:', error);
    return null;
  }
}

/**
 * Récupère uniquement le rôle utilisateur (optimisé)
 */
async function getUserRole(userId: string) {
  try {
    const { prisma } = await import('@/lib/prisma');

    const user = await prisma.user.findUnique({
      where: { supabase_user_id: userId },
      select: { role: true },
    });

    return user;
  } catch (error) {
    console.error('Error fetching user role in middleware:', error);
    return null;
  }
}

/**
 * Retourne le dashboard par défaut selon le rôle
 */
function getDefaultDashboard(role: string): string {
  switch (role) {
    case 'ADMIN':
    case 'MODERATOR':
      return '/admin';
    case 'SELLER':
      return '/seller/dashboard';
    case 'BUYER':
    default:
      return '/dashboard';
  }
}

// ============================================================================
// CONFIGURATION MIDDLEWARE
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};