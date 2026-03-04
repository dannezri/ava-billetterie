/**
 * API Route: GET /api/transactions/[id]
 * Récupère le détail d'une transaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTransactionById } from '@/lib/services/transaction.service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Vérifier authentification
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Authentification requise' }, { status: 401 });
    }

    // 2. Récupérer la transaction via service (avec vérification ownership)
    const result = await getTransactionById(params.id, session.user.id);

    // 3. Retourner résultat
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API] Get transaction error:', error);

    if (error instanceof Error) {
      if (error.message === 'Transaction not found') {
        return NextResponse.json({ error: 'Not found', message: 'Transaction introuvable' }, { status: 404 });
      }

      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Accès refusé à cette transaction' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}
