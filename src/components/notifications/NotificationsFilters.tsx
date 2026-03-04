'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface TypeCount {
  type: string;
  _count: number;
}

interface NotificationsFiltersProps {
  typeCounts: TypeCount[];
  totalCount: number;
  unreadCount: number;
}

const TYPE_LABELS: Record<string, string> = {
  TRANSACTION: 'Transactions',
  DISPUTE: 'Litiges',
  PRICE_ALERT: 'Alertes prix',
  SYSTEM: 'Système',
  SOCIAL: 'Social',
};

const PERIOD_LABELS = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7days', label: '7 derniers jours' },
  { value: '30days', label: '30 derniers jours' },
  { value: '', label: 'Tout' },
];

export function NotificationsFilters({ typeCounts, totalCount, unreadCount }: NotificationsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('type') ?? '';
  const currentRead = searchParams.get('read') ?? '';
  const currentPeriod = searchParams.get('period') ?? '';

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => router.push(pathname);

  const hasFilters = currentType || currentRead || currentPeriod;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Affichage
        </h3>
        <div className="space-y-1">
          <FilterButton
            active={!currentRead && !currentType}
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('read');
              params.delete('type');
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            <span>Toutes</span>
            <Badge variant="secondary" className="ml-auto text-xs">{totalCount}</Badge>
          </FilterButton>
          <FilterButton
            active={currentRead === 'false'}
            onClick={() => setFilter('read', 'false')}
          >
            <span>Non-lues</span>
            {unreadCount > 0 && (
              <Badge className="ml-auto text-xs bg-red-500 hover:bg-red-500">{unreadCount}</Badge>
            )}
          </FilterButton>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Par type
        </h3>
        <div className="space-y-1">
          {typeCounts.map(({ type, _count }) => (
            <FilterButton
              key={type}
              active={currentType === type}
              onClick={() => setFilter('type', currentType === type ? '' : type)}
            >
              <span>{TYPE_LABELS[type] ?? type}</span>
              <Badge variant="outline" className="ml-auto text-xs">{_count}</Badge>
            </FilterButton>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Période
        </h3>
        <div className="space-y-1">
          {PERIOD_LABELS.map(({ value, label }) => (
            <FilterButton
              key={value || 'all'}
              active={currentPeriod === value}
              onClick={() => setFilter('period', value)}
            >
              {label}
            </FilterButton>
          ))}
        </div>
      </div>

      {hasFilters && (
        <>
          <Separator />
          <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={clearAllFilters}>
            Effacer les filtres
          </Button>
        </>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center text-sm px-3 py-2 rounded-md transition-colors text-left',
        active
          ? 'bg-primary text-primary-foreground font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
