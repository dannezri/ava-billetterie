import { NextRequest, NextResponse } from 'next/server';
import { createAccountOnboardingLink } from '@/services/stripe-connect';
import { isDevelopment, appUrl } from '@/config/env';

/**
 * Route de TEST pour générer un lien d'onboarding
 * ⚠️ DÉSACTIVÉE EN PRODUCTION - Bypass l'authentification
 */
export async function POST(req: NextRequest) {
  // Vérifier qu'on est en développement
  if (!isDevelopment) {
    return NextResponse.json(
      { error: 'Cette route de test n\'est disponible qu\'en développement' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'accountId requis dans le body' },
        { status: 400 }
      );
    }

    const refreshUrl = `${appUrl}/seller/onboarding/refresh`;
    const returnUrl = `${appUrl}/seller/onboarding/complete`;

    const result = await createAccountOnboardingLink(
      accountId,
      refreshUrl,
      returnUrl
    );

    return NextResponse.json({
      success: true,
      onboardingUrl: result.onboardingUrl,
      expiresAt: result.expiresAt,
      warning: 'Ceci est une route de test - désactivée en production',
    });
  } catch (error) {
    console.error('Error creating test onboarding link:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du lien d\'onboarding',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
