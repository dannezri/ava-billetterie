/**
 * API Route: GET /api/disputes/[id]
 * Récupère le détail d'un litige
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDisputeById } from '@/lib/services/dispute.service';

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

    // 2. Récupérer le litige via service (avec vérification accès)
    const dispute = await getDisputeById(params.id, session.user.id);

    // 3. Retourner résultat
    return NextResponse.json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    console.error('[API] Get dispute error:', error);

    if (error instanceof Error) {
      if (error.message === 'Dispute not found') {
        return NextResponse.json({ error: 'Not found', message: 'Litige introuvable' }, { status: 404 });
      }

      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden', message: 'Accès refusé à ce litige' }, { status: 403 });
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
