'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ShoppingBag,
  TrendingDown,
  AlertTriangle,
  Bell,
  CheckCheck,
  Shield,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface INotification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl: string | null;
  ctaText: string | null;
  isRead: boolean;
  priority: string;
  createdAt: string | Date;
  metadata?: Record<string, unknown> | null;
}

interface NotificationCardProps {
  notification: INotification;
  compact?: boolean;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; badge: string; badgeVariant: 'default' | 'destructive' | 'secondary' | 'outline' }
> = {
  TRANSACTION: {
    icon: <ShoppingBag className="h-4 w-4" />,
    badge: 'Transaction',
    badgeVariant: 'default',
  },
  DISPUTE: {
    icon: <AlertTriangle className="h-4 w-4" />,
    badge: 'Litige',
    badgeVariant: 'destructive',
  },
  PRICE_ALERT: {
    icon: <TrendingDown className="h-4 w-4" />,
    badge: 'Alerte prix',
    badgeVariant: 'secondary',
  },
  SYSTEM: {
    icon: <Shield className="h-4 w-4" />,
    badge: 'Système',
    badgeVariant: 'outline',
  },
  SOCIAL: {
    icon: <Star className="h-4 w-4" />,
    badge: 'Social',
    badgeVariant: 'secondary',
  },
};

export function NotificationCard({
  notification,
  compact = false,
  onMarkAsRead,
  onDelete,
  onClick,
}: NotificationCardProps) {
  const config = TYPE_CONFIG[notification.type] ?? {
    icon: <Bell className="h-4 w-4" />,
    badge: 'Notification',
    badgeVariant: 'outline' as const,
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: fr,
  });

  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.();
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-start gap-3 p-4 cursor-pointer hover:bg-accent transition-colors',
          !notification.isRead && 'bg-blue-50 dark:bg-blue-950/20'
        )}
        onClick={handleClick}
      >
        <div
          className={cn(
            'mt-0.5 flex-shrink-0 rounded-full p-1.5',
            !notification.isRead
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
            )}
            <p className="text-sm font-medium leading-tight truncate">{notification.title}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 transition-all',
        !notification.isRead
          ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
          : 'bg-background border-border hover:border-blue-300',
        notification.priority === 'URGENT' && 'border-l-4 border-l-red-500'
      )}
    >
      {/* Point état lecture */}
      <span
        className={cn(
          'absolute top-4 left-4 h-2 w-2 rounded-full flex-shrink-0',
          !notification.isRead ? 'bg-blue-500' : 'bg-muted-foreground/30'
        )}
      />

      <div className="ml-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={cn(
                'rounded-full p-1.5',
                !notification.isRead
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {config.icon}
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wide">
              {notification.title}
            </h3>
            <Badge variant={config.badgeVariant} className="text-xs">
              {config.badge}
            </Badge>
            {notification.priority === 'URGENT' && (
              <Badge variant="destructive" className="text-xs">Urgent</Badge>
            )}
          </div>

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Message */}
        <p className="text-sm text-muted-foreground mt-2">{notification.message}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
          <p className="text-xs text-muted-foreground">{timeAgo}</p>

          <div className="flex items-center gap-2">
            {!notification.isRead && onMarkAsRead && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Marquer lu
              </Button>
            )}
            {notification.linkUrl && notification.ctaText && (
              <Button size="sm" className="h-7 text-xs" asChild>
                <Link href={notification.linkUrl} onClick={onClick}>
                  {notification.ctaText}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
