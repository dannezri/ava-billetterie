/**
 * DELETE /api/notifications/delete-read
 * Supprime toutes les notifications lues de l'utilisateur
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { NotificationService } from '@/lib/services/notification.service';

export async function DELETE() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await NotificationService.deleteAllRead(user.id);
    return NextResponse.json({ success: true, data: { count: result.count } });
  } catch (error) {
    console.error('[API] DELETE /notifications/delete-read error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
