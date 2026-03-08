/**
 * PriceStats Component
 * Statistiques de prix pour un événement
 */

'use client';

import { TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IPriceStatsProps {
  stats: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    priceDistribution: Array<{
      range: string;
      count: number;
    }>;
  };
}

export function PriceStats({ stats }: IPriceStatsProps) {
  const maxCount = Math.max(...stats.priceDistribution.map((d) => d.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Statistiques de prix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prix min/max/moyen */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-green-50 p-3 text-center">
            <p className="mb-1 text-xs text-gray-600">Minimum</p>
            <p className="text-lg font-bold text-green-600">{stats.minPrice}€</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <p className="mb-1 text-xs text-gray-600">Moyen</p>
            <p className="text-lg font-bold text-blue-600">{stats.avgPrice}€</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3 text-center">
            <p className="mb-1 text-xs text-gray-600">Maximum</p>
            <p className="text-lg font-bold text-orange-600">{stats.maxPrice}€</p>
          </div>
        </div>

        {/* Distribution des prix — barres animées avec labels intégrés */}
        <div>
          <p className="mb-2.5 text-sm font-semibold text-gray-700">Distribution des prix</p>
          <div className="space-y-2">
            {stats.priceDistribution.map((item, i) => {
              if (item.count === 0) return null;
              const pct = Math.round((item.count / maxCount) * 100);
              const isMax = item.count === maxCount;

              return (
                <div key={item.range} className="flex items-center gap-2">
                  {/* Range label */}
                  <span className="w-20 shrink-0 text-right text-[11px] font-medium text-gray-500">
                    {item.range}€
                  </span>

                  {/* Bar */}
                  <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={[
                        'h-full rounded-full transition-all duration-500',
                        isMax ? 'bg-blue-600' : 'bg-blue-400',
                      ].join(' ')}
                      style={{
                        width: `${pct}%`,
                        transitionDelay: `${i * 60}ms`,
                      }}
                    />
                    {/* Count inside bar */}
                    {pct > 30 && (
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-white">
                        {item.count} billet{item.count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Count outside if bar too short */}
                  {pct <= 30 && (
                    <span className="shrink-0 text-[11px] font-semibold text-gray-700">
                      {item.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Info économie */}
        {stats.minPrice < stats.avgPrice && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="flex items-center text-sm font-medium text-green-900">
              <TrendingDown className="mr-2 h-4 w-4" />
              Économisez jusqu'à{' '}
              {Math.round(((stats.avgPrice - stats.minPrice) / stats.avgPrice) * 100)}%
            </p>
            <p className="mt-1 text-xs text-green-700">
              en choisissant le billet le moins cher
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
