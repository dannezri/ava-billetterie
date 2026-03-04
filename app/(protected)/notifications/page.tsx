/**
 * Page Centre de Notifications
 * Liste complète avec filtres, compteurs et actions de masse
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server-client';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { NotificationsFilters } from '@/components/notifications/NotificationsFilters';
import { NotificationsPageActions } from '@/components/notifications/NotificationsPageActions';
import { NotificationService } from '@/lib/services/notification.service';
import { NotificationType } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Notifications — AVA',
};

interface NotificationsPageProps {
  searchParams: {
    type?: string;
    read?: string;
    period?: string;
  };
}

export default async function NotificationsPage({ searchParams }: NotificationsPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { type, read, period } = searchParams;

  // Notifications filtrées
  const notifications = await NotificationService.getMany(user.id, {
    type: type as NotificationType | undefined,
    isRead: read === 'false' ? false : read === 'true' ? true : undefined,
    period: period as 'today' | '7days' | '30days' | undefined,
    limit: 50,
  });

  // Compteurs
  const [unreadCount, totalCount, typeCounts] = await Promise.all([
    NotificationService.countUnread(user.id),
    prisma.notification.count({ where: { userId: user.id } }),
    prisma.notification.groupBy({
      by: ['type'],
      where: { userId: user.id },
      _count: true,
    }),
  ]);

  const mappedTypeCounts = typeCounts.map((t: { type: NotificationType; _count: number }) => ({
    type: t.type as string,
    _count: t._count,
  }));

  // Sérialiser pour les client components
  const serializedNotifications = notifications.map((n: (typeof notifications)[number]) => ({
    id: n.id,
    type: n.type as string,
    title: n.title,
    message: n.message,
    linkUrl: n.linkUrl,
    ctaText: n.ctaText,
    isRead: n.isRead,
    priority: n.priority as string,
    createdAt: n.createdAt.toISOString(),
    metadata: n.metadata as Record<string, unknown> | null,
  }));

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Bell className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>
          <p className="text-muted-foreground mt-1.5">
            {unreadCount > 0 ? (
              <>
                <span className="font-medium text-foreground">{unreadCount}</span>{' '}
                non-lue{unreadCount > 1 ? 's' : ''} · {totalCount} au total
              </>
            ) : (
              `${totalCount} notification${totalCount > 1 ? 's' : ''} au total`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsPageActions unreadCount={unreadCount} />
          <Button variant="outline" size="sm" asChild>
            <Link href="/notifications/settings">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Link>
          </Button>
        </div>
      </div>

      {/* Layout sidebar + liste */}
      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-card border rounded-xl p-4">
            <NotificationsFilters
              typeCounts={mappedTypeCounts}
              totalCount={totalCount}
              unreadCount={unreadCount}
            />
          </div>
        </aside>

        <main className="lg:col-span-3">
          <NotificationsList initialNotifications={serializedNotifications} />
        </main>
      </div>
    </div>
  );
}
