import { NextRequest, NextResponse } from 'next/server';
import {
  createConnectAccount,
  createAccountOnboardingLink,
  getUserConnectAccountId,
} from '@/services/stripe-connect';
import { createClient } from '@/lib/supabase/server-client';

/**
 * @api {POST} /api/stripe-connect/onboarding-link
 * @description Génère un lien d'onboarding Stripe Connect pour un vendeur.
 * Si le vendeur n'a pas encore de compte Stripe, un compte Custom est automatiquement créé.
 * Le lien redirige vers le formulaire hébergé par Stripe pour la collecte des infos bancaires/identité.
 * 
 * @returns {Object} JSON response
 * - success: boolean
 * - accountId: string
 * - onboardingUrl: string
 * - expiresAt: number
 * 
 * @error 401 Non authentifié
 * @error 500 Erreur serveur
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier si l'utilisateur a déjà un compte Connect
    let accountId = await getUserConnectAccountId(user.id);

    // Si pas de compte, en créer un automatiquement
    if (!accountId) {
      console.log('🆕 No Stripe account found, creating one...');
      accountId = await createConnectAccount({
        userId: user.id,
        email: user.email!,
        country: 'FR',
        businessType: 'individual',
      });
    }

    // Générer le lien d'onboarding
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const refreshUrl = `${APP_URL}/dashboard/seller/profile?refresh=true`;
    const returnUrl = `${APP_URL}/dashboard/seller/profile?success=true`;

    const result = await createAccountOnboardingLink(accountId, refreshUrl, returnUrl);

    return NextResponse.json({
      success: true,
      accountId: result.accountId,
      onboardingUrl: result.onboardingUrl,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('Error creating onboarding link:', error);
    return NextResponse.json(
      {
        error: "Erreur lors de la génération du lien d'onboarding",
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
