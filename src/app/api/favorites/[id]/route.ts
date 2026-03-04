/**
 * API Route: DELETE /api/favorites/[id]
 * Retire un événement des favoris
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { removeFavorite } from '@/lib/services/favorite.service';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Vérifier authentification
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Authentification requise' }, { status: 401 });
    }

    // 2. Retirer le favori via service (avec vérification ownership)
    await removeFavorite(params.id, session.user.id);

    // 3. Retourner résultat
    return NextResponse.json({
      success: true,
      message: 'Événement retiré des favoris',
    });
  } catch (error) {
    console.error('[API] Remove favorite error:', error);

    if (error instanceof Error) {
      if (error.message === 'Favorite not found') {
        return NextResponse.json({ error: 'Not found', message: 'Favori introuvable' }, { status: 404 });
      }

      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden', message: 'Accès refusé' }, { status: 403 });
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
