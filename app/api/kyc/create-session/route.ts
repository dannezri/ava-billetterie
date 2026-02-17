import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { createVerificationSession } from '@/services/kyc';

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // 2. Création de la session KYC
    const session = await createVerificationSession(user.id, user.email || '');

    return NextResponse.json({
      clientSecret: session.clientSecret,
      id: session.id,
    });
  } catch (error) {
    console.error('Erreur API KYC:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne' },
      { status: 500 }
    );
  }
}
