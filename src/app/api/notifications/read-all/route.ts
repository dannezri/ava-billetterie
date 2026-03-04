/**
 * API Route: PATCH /api/notifications/read-all
 * Marque toutes les notifications comme lues
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { markAllAsRead } from '@/lib/services/notification.service';

export async function PATCH(request: NextRequest) {
  try {
    // 1. Vérifier authentification
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Authentification requise' }, { status: 401 });
    }

    // 2. Parser query params (optionnel: beforeDate)
    const { searchParams } = new URL(request.url);
    const beforeDateParam = searchParams.get('beforeDate');
    const beforeDate = beforeDateParam ? new Date(beforeDateParam) : undefined;

    // 3. Marquer toutes comme lues via service
    const result = await markAllAsRead(session.user.id);

    // 4. Retourner résultat
    return NextResponse.json({
      success: true,
      data: {
        count: result.count,
      },
      message: 'Toutes les notifications ont été marquées comme lues',
    });
  } catch (error) {
    console.error('[API] Mark all notifications as read error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}
