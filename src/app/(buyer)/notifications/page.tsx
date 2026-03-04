/**
 * Page Notifications
 * Centre de notifications de l'utilisateur
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, CheckCheck, AlertCircle, Calendar, ShoppingBag, MessageSquare, Info } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Types alignés sur le schema Prisma (camelCase via @map)
type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl: string | null;
  isRead: boolean;
  createdAt: string;
};

// Le service stubbed retourne unread_count (snake_case) → on accepte les deux
type NotificationsResponse = {
  notifications: Notification[];
  unreadCount?: number;
  unread_count?: number;
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const json = await res.json();
      return json.data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to mark as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications/read-all', { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to mark all as read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({ title: 'Toutes les notifications ont été marquées comme lues' });
    },
  });

  // Support both camelCase and snake_case from stubbed service
  const unreadCount = data?.unreadCount ?? data?.unread_count ?? 0;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PURCHASE_CONFIRMATION':
        return <ShoppingBag className="h-5 w-5 text-green-500" />;
      case 'ESCROW_RELEASED':
        return <CheckCheck className="h-5 w-5 text-blue-500" />;
      case 'DISPUTE_OPENED':
      case 'DISPUTE_RESOLVED':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'REVIEW_REQUEST':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case 'EVENT_REMINDER':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-muted-foreground mt-2">{unreadCount} non lues</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={() => markAllAsReadMutation.mutate()}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : data && data.notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune notification</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn('cursor-pointer hover:bg-accent transition-colors', {
                'bg-blue-50 dark:bg-blue-950/20': !notification.isRead,
              })}
              onClick={() => {
                if (!notification.isRead) {
                  markAsReadMutation.mutate(notification.id);
                }
                if (notification.linkUrl) {
                  window.location.href = notification.linkUrl;
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      </div>
                      {!notification.isRead && (
                        <Badge variant="default" className="flex-shrink-0">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(notification.createdAt), 'PPp', { locale: fr })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
