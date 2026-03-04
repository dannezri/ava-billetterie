/**
 * PriceStats Component
 * Statistiques de prix pour un événement
 */

import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
            <p className="mb-1 text-xs text-slate-600">Minimum</p>
            <p className="text-lg font-bold text-green-600">{stats.minPrice}€</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 text-center">
            <p className="mb-1 text-xs text-slate-600">Moyen</p>
            <p className="text-lg font-bold text-blue-600">{stats.avgPrice}€</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3 text-center">
            <p className="mb-1 text-xs text-slate-600">Maximum</p>
            <p className="text-lg font-bold text-orange-600">{stats.maxPrice}€</p>
          </div>
        </div>

        {/* Distribution des prix (histogramme simple) */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Distribution</p>
          <div className="space-y-2">
            {stats.priceDistribution.map((item) => {
              if (item.count === 0) return null;
              const percentage = (item.count / maxCount) * 100;

              return (
                <div key={item.range}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600">{item.range}€</span>
                    <span className="font-medium text-slate-900">
                      {item.count} billet{item.count > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
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
