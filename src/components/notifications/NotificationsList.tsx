'use client';

import { useState } from 'react';
import { Bell, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationCard, INotification } from './NotificationCard';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface NotificationsListProps {
  initialNotifications: INotification[];
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<INotification[]>(initialNotifications);
  const { toast } = useToast();
  const router = useRouter();

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      router.refresh();
    } catch {
      toast({ title: 'Erreur lors du marquage', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      router.refresh();
    } catch {
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Bell className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">Aucune notification</h3>
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas encore de notification avec ces filtres.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
        />
      ))}

      {notifications.length >= 50 && (
        <div className="flex justify-center pt-4">
          <Button variant="outline">
            <Inbox className="h-4 w-4 mr-2" />
            Charger plus
          </Button>
        </div>
      )}
    </div>
  );
}
