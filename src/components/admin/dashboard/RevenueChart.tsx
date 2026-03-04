'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RevenueData {
  date: string;
  gmv: number;
  commissions: number;
  transactions: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const formatEuro = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k€`;
  return `${value.toFixed(0)}€`;
};

const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), 'd MMM', { locale: fr });
  } catch {
    return dateStr;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-2">
        {label ? format(parseISO(label), 'd MMMM yyyy', { locale: fr }) : ''}
      </p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name === 'gmv' ? 'GMV' : 'Commissions'}:</span>
          <span className="font-medium">{formatEuro(entry.value)}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-100">
        <span className="text-gray-500">Transactions:</span>
        <span className="font-medium">{payload[0]?.payload?.transactions || 0}</span>
      </div>
    </div>
  );
};

export function RevenueChart({ data }: RevenueChartProps) {
  const [period, setPeriod] = useState<7 | 30>(30);

  const displayData = period === 7 ? data.slice(-7) : data;

  const total = displayData.reduce(
    (acc, d) => ({ gmv: acc.gmv + d.gmv, commissions: acc.commissions + d.commissions }),
    { gmv: 0, commissions: 0 }
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Revenus & GMV</CardTitle>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-gray-500">
                GMV: <span className="font-semibold text-gray-700">{formatEuro(total.gmv)}</span>
              </span>
              <span className="text-xs text-gray-500">
                Commissions:{' '}
                <span className="font-semibold text-green-700">
                  {formatEuro(total.commissions)}
                </span>
              </span>
            </div>
          </div>
          {/* Sélecteur période */}
          <div className="flex gap-1">
            {([7, 30] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                className={cn('h-7 px-2 text-xs', period === p && 'bg-indigo-600 hover:bg-indigo-700')}
                onClick={() => setPeriod(p)}
              >
                {p}j
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatEuro}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="gmv"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#4f46e5' }}
                name="gmv"
              />
              <Line
                type="monotone"
                dataKey="commissions"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#10b981' }}
                name="commissions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2 justify-center">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-0.5 bg-indigo-600 rounded" />
            GMV
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-0.5 bg-emerald-500 rounded" />
            Commissions
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
