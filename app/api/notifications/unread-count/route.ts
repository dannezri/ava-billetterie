/**
 * GET /api/notifications/unread-count
 * Retourne le nombre de notifications non-lues (utilisé par NotificationBell)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { NotificationService } from '@/lib/services/notification.service';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const count = await NotificationService.countUnread(user.id);
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
