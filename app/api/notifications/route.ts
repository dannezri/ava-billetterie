/**
 * GET /api/notifications
 * Récupère les notifications de l'utilisateur connecté
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { NotificationService } from '@/lib/services/notification.service';
import { NotificationType } from '@prisma/client';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
  const offset = parseInt(searchParams.get('offset') ?? '0');
  const type = searchParams.get('type') as NotificationType | null;
  const read = searchParams.get('read');
  const period = searchParams.get('period') as 'today' | '7days' | '30days' | null;

  try {
    const [notifications, unreadCount] = await Promise.all([
      NotificationService.getMany(user.id, {
        type: type ?? undefined,
        isRead: read === 'false' ? false : read === 'true' ? true : undefined,
        period: period ?? undefined,
        limit,
        offset,
      }),
      NotificationService.countUnread(user.id),
    ]);

    return NextResponse.json({
      success: true,
      data: { notifications, unreadCount },
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('[API] GET /api/notifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
