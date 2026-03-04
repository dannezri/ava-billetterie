'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationCard, INotification } from '@/components/notifications/NotificationCard';
import { Loader2, CheckCheck, Eye, Bell } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface NotificationDropdownProps {
  onClose: () => void;
  onUpdate: () => void;
}

export function NotificationDropdown({ onClose, onUpdate }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=5');
      if (res.ok) {
        const json = await res.json();
        const raw: INotification[] = json.data?.notifications ?? json.notifications ?? [];
        setNotifications(raw);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'PATCH' });
      if (res.ok) {
        toast({ title: 'Toutes les notifications marquées comme lues' });
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        onUpdate();
      }
    } catch {
      toast({ title: 'Erreur lors du marquage', variant: 'destructive' });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      onUpdate();
    } catch {
      // silent
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col max-h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-sm">
          Notifications{unreadCount > 0 && ` (${unreadCount} non-lue${unreadCount > 1 ? 's' : ''})`}
        </h3>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs h-7">
            <CheckCheck className="w-3 h-3 mr-1" />
            Tout marquer lu
          </Button>
        )}
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto divide-y">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Bell className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationCard
              key={n.id}
              notification={n}
              compact
              onMarkAsRead={handleMarkAsRead}
              onClick={onClose}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t">
          <Button variant="ghost" className="w-full text-sm h-8" asChild>
            <Link href="/notifications" onClick={onClose}>
              <Eye className="w-4 h-4 mr-2" />
              Voir toutes les notifications
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
