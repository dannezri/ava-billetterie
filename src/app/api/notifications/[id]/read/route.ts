/**
 * API Route: PATCH /api/notifications/[id]/read
 * Marque une notification comme lue
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { markAsRead } from '@/lib/services/notification.service';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Vérifier authentification
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Authentification requise' }, { status: 401 });
    }

    // 2. Marquer comme lu via service (avec vérification ownership)
    const notification = await markAsRead(params.id, session.user.id);

    // 3. Retourner résultat
    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('[API] Mark notification as read error:', error);

    if (error instanceof Error) {
      if (error.message === 'Notification not found') {
        return NextResponse.json({ error: 'Not found', message: 'Notification introuvable' }, { status: 404 });
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
