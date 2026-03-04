'use client';

import { AlertCircle, Clock, CheckCircle, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DisputesStatsHeaderProps {
  stats: {
    sla_exceeded: number;
    urgent: number;
    resolved_today: number;
    avg_resolution_hours: number;
  };
  loading?: boolean;
}

interface StatCardProps {
  icon: React.ElementType;
  value: number | string;
  label: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
  loading?: boolean;
}

function StatCard({ icon: Icon, value, label, bgColor, iconColor, borderColor, loading }: StatCardProps) {
  return (
    <Card className={cn('border', borderColor)}>
      <CardContent className="p-4">
        {loading ? (
          <div className="animate-pulse flex items-center gap-3">
            <div className={cn('h-10 w-10 rounded-lg', bgColor)} />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-16 bg-gray-200 rounded" />
              <div className="h-3 w-28 bg-gray-100 rounded" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg', bgColor)}>
              <Icon className={cn('h-5 w-5', iconColor)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DisputesStatsHeader({ stats, loading }: DisputesStatsHeaderProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={AlertCircle}
        value={stats.sla_exceeded}
        label="SLA dépassé (> 48h)"
        bgColor="bg-red-100"
        iconColor="text-red-600"
        borderColor="border-red-200"
        loading={loading}
      />
      <StatCard
        icon={Clock}
        value={stats.urgent}
        label="Urgents (36–48h)"
        bgColor="bg-orange-100"
        iconColor="text-orange-600"
        borderColor="border-orange-200"
        loading={loading}
      />
      <StatCard
        icon={CheckCircle}
        value={stats.resolved_today}
        label="Résolus aujourd'hui"
        bgColor="bg-green-100"
        iconColor="text-green-600"
        borderColor="border-green-200"
        loading={loading}
      />
      <StatCard
        icon={Timer}
        value={`${stats.avg_resolution_hours}h`}
        label="Temps résolution moyen"
        bgColor="bg-blue-100"
        iconColor="text-blue-600"
        borderColor="border-blue-200"
        loading={loading}
      />
    </div>
  );
}
