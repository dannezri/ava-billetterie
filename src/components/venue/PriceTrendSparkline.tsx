'use client';

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

export interface IPriceSnapshot {
  snapshotDate: string; // ISO string
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  ticketsCount: number;
}

interface IPriceTrendSparklineProps {
  history: IPriceSnapshot[];
  /** Show full chart with axis labels (for modal/tooltip expanded view) */
  expanded?: boolean;
}

function computeTrend(history: IPriceSnapshot[]): { pct: number; direction: 'up' | 'down' | 'stable' } {
  if (history.length < 2) return { pct: 0, direction: 'stable' };
  const first = history[0].avgPrice;
  const last  = history[history.length - 1].avgPrice;
  const pct   = ((last - first) / first) * 100;
  return {
    pct,
    direction: pct < -2 ? 'down' : pct > 2 ? 'up' : 'stable',
  };
}

export function PriceTrendSparkline({ history, expanded = false }: IPriceTrendSparklineProps) {
  if (!history || history.length < 2) return null;

  const { pct, direction } = computeTrend(history);

  const data = history.map((h) => ({
    date:  new Date(h.snapshotDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    price: Math.round(h.avgPrice),
    min:   Math.round(h.minPrice),
  }));

  const lineColor =
    direction === 'down' ? '#10B981'   // emerald — prix baissent = bonne nouvelle acheteur
    : direction === 'up' ? '#EF4444'   // red
    : '#94A3B8';                        // slate

  const TrendIcon  = direction === 'down' ? TrendingDown : direction === 'up' ? TrendingUp : Minus;
  const trendLabel = direction === 'down' ? 'text-emerald-600 bg-emerald-50' : direction === 'up' ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-100';

  return (
    <div className={`flex items-center gap-2 ${expanded ? 'flex-col items-stretch' : ''}`}>
      {/* Mini sparkline */}
      <div className={expanded ? 'h-24 w-full' : 'h-8 w-20 shrink-0'}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            {expanded && (
              <Tooltip
                contentStyle={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                formatter={((v: number) => `${v}€ moy.`) as any}
                labelFormatter={(l) => l}
              />
            )}
            <Line
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={expanded ? 2 : 1.5}
              dot={expanded ? { r: 2, fill: lineColor } : false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend badge */}
      <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${trendLabel}`}>
        <TrendIcon className="h-3 w-3" />
        {pct > 0 ? '+' : ''}{Math.round(pct)}%
        {expanded && <span className="font-normal opacity-70 ml-0.5">7j</span>}
      </div>
    </div>
  );
}
