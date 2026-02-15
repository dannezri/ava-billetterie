import { NextRequest, NextResponse } from 'next/server';
import {
  createConnectAccount,
  createAccountOnboardingLink,
  getUserConnectAccountId,
} from '@/services/stripe-connect';
import { createClient } from '@/lib/supabase/server-client';

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
    const refreshUrl = `${APP_URL}/seller/onboarding/refresh`;
    const returnUrl = `${APP_URL}/seller/onboarding/complete`;

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
