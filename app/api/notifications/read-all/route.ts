/**
 * PATCH /api/notifications/read-all
 * Marque toutes les notifications de l'utilisateur comme lues
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { NotificationService } from '@/lib/services/notification.service';

export async function PATCH() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await NotificationService.markAllAsRead(user.id);
    return NextResponse.json({
      success: true,
      data: { count: result.count },
    });
  } catch (error) {
    console.error('[API] PATCH /notifications/read-all error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
