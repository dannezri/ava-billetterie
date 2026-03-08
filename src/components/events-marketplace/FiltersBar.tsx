'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FiltersBarProps {
  categories: string[];
}

const DATE_FILTERS = [
  { label: 'Cette semaine', value: 'week' },
  { label: 'Ce week-end', value: 'weekend' },
  { label: 'Ce mois', value: 'month' },
];

export function FiltersBar({ categories }: FiltersBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category');
  const selectedDate = searchParams.get('date');

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/events?${params.toString()}`);
  };

  const handleDateClick = (value: string) => {
    setParam('date', selectedDate === value ? null : value);
  };

  const handleCategoryClick = (value: string) => {
    setParam('category', selectedCategory === value ? null : value);
  };

  return (
    <div className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">

          {/* Localisation */}
          <Button variant="outline" size="sm" className="flex-shrink-0 gap-1.5">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>Montmorency</span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </Button>

          {/* Filtres dates */}
          {DATE_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              size="sm"
              variant={selectedDate === filter.value ? 'default' : 'outline'}
              onClick={() => handleDateClick(filter.value)}
              className={cn(
                'flex-shrink-0',
                selectedDate === filter.value &&
                  'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600',
              )}
            >
              {filter.label}
            </Button>
          ))}

          {/* Séparateur */}
          <div className="h-6 w-px flex-shrink-0 bg-gray-200" />

          {/* Tous types */}
          <Button
            size="sm"
            variant={!selectedCategory ? 'default' : 'outline'}
            onClick={() => setParam('category', null)}
            className={cn(
              'flex-shrink-0',
              !selectedCategory && 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600',
            )}
          >
            Tous types
          </Button>

          {/* Catégories musicales */}
          {categories.slice(0, 6).map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? 'default' : 'outline'}
              onClick={() => handleCategoryClick(cat)}
              className={cn(
                'flex-shrink-0',
                selectedCategory === cat &&
                  'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600',
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
