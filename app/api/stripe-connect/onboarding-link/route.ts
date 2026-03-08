import { NextRequest, NextResponse } from 'next/server';
import { createAccountOnboardingLink } from '@/services/stripe-connect';
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

    const body = await req.json();
    const { accountId, refreshUrl, returnUrl } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'accountId requis' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || '';
    const result = await createAccountOnboardingLink(
      accountId,
      refreshUrl || `${origin}/dashboard/seller/onboarding/refresh`,
      returnUrl || `${origin}/dashboard/seller/onboarding/return`
    );

    return NextResponse.json({
      success: true,
      url: result.onboardingUrl,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error('Error creating onboarding link:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du lien d\'onboarding', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
