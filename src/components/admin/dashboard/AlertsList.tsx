'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, AlertTriangle, Info, X, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  link?: string;
}

interface AlertsListProps {
  alerts: Alert[];
}

const alertConfig = {
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    textColor: 'text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800',
    textColor: 'text-amber-600',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-600',
  },
};

export function AlertsList({ alerts }: AlertsListProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = alerts.filter((a) => !dismissed.has(a.id));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Alertes Système</CardTitle>
          {visible.length > 0 && (
            <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
              {visible.length}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {visible.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-400">
            ✅ Aucune alerte active
          </div>
        ) : (
          visible.map((alert) => {
            const cfg = alertConfig[alert.type];
            const Icon = cfg.icon;

            return (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border text-sm',
                  cfg.bg,
                  cfg.border
                )}
              >
                <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', cfg.iconColor)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('font-medium text-xs', cfg.titleColor)}>{alert.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(alert.timestamp), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <p className={cn('text-xs mt-0.5', cfg.textColor)}>{alert.message}</p>
                  {alert.link && (
                    <Link
                      href={alert.link}
                      className={cn('text-xs font-medium mt-1 flex items-center gap-1', cfg.titleColor)}
                    >
                      Voir <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 flex-shrink-0 -mr-1 -mt-0.5 opacity-60 hover:opacity-100"
                  onClick={() => setDismissed((prev) => new Set([...prev, alert.id]))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
