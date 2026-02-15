import { NextRequest, NextResponse } from 'next/server';
import { createConnectAccount } from '@/services/stripe-connect';
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
    const { country = 'FR', businessType = 'individual' } = body;

    const accountId = await createConnectAccount({
      userId: user.id,
      email: user.email!,
      country,
      businessType,
    });

    return NextResponse.json({
      success: true,
      accountId,
      message: 'Compte Stripe Connect créé avec succès',
    });
  } catch (error) {
    console.error('Error creating Connect account:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte Connect', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
