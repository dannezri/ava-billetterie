/**
 * PATCH /api/notifications/[id]/read
 * Marque une notification comme lue
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { NotificationService } from '@/lib/services/notification.service';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notification = await NotificationService.markAsRead(params.id, user.id);
    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error('[API] PATCH /notifications/[id]/read error:', error);
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }
}
