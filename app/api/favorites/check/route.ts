/**
 * GET /api/favorites/check?eventId=xxx
 * Vérifie si l'événement est dans les favoris de l'utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isFavorite } from '@/lib/services/favorite.service';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ isFavorite: false, favoriteId: null });
    }

    const eventId = request.nextUrl.searchParams.get('eventId');
    if (!eventId) {
      return NextResponse.json(
        { error: 'Bad request', message: 'eventId requis' },
        { status: 400 }
      );
    }

    const result = await isFavorite(session.user.id, eventId);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[API] Check favorite error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
