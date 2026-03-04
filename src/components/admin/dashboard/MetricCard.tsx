'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: { value: number; isPositive: boolean };
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  link?: string;
  description?: string;
  loading?: boolean;
}

export function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50',
  link,
  description,
  loading = false,
}: MetricCardProps) {
  const content = (
    <Card className={cn('relative overflow-hidden transition-shadow hover:shadow-md', link && 'cursor-pointer')}>
      <CardContent className="p-5">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-8 w-32 bg-gray-200 rounded" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className={cn('p-2 rounded-lg', iconBg)}>
                <Icon className={cn('h-5 w-5', iconColor)} />
              </div>
              {change !== undefined && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                    change.isPositive
                      ? 'text-green-700 bg-green-50'
                      : 'text-red-700 bg-red-50'
                  )}
                >
                  {change.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : change.value === 0 ? (
                    <Minus className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {change.value > 0 ? '+' : ''}
                  {change.value.toFixed(1)}%
                </div>
              )}
            </div>

            {/* Valeur */}
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
            </div>

            {/* Lien */}
            {link && (
              <div className="mt-3 text-xs text-indigo-600 font-medium flex items-center gap-1">
                Voir le détail →
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }
  return content;
}
