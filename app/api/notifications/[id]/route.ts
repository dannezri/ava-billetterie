/**
 * DELETE /api/notifications/[id]
 * Supprime une notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { NotificationService } from '@/lib/services/notification.service';

export async function DELETE(
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
    await NotificationService.delete(params.id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] DELETE /notifications/[id] error:', error);
    return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 });
  }
}
