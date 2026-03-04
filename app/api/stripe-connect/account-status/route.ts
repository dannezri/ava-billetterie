import { NextRequest, NextResponse } from 'next/server';
import { getAccountStatus } from '@/services/stripe-connect';
import { createClient } from '@/lib/supabase/server-client';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json({ error: 'accountId requis' }, { status: 400 });
    }

    const status = await getAccountStatus(accountId);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error('Error getting account status:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
