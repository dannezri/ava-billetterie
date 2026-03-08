'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { SectionCategory } from './types';

export type SortOption = 'price_asc' | 'price_desc' | 'section_asc' | 'trust_desc';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'price_asc',   label: 'Prix croissant' },
  { value: 'price_desc',  label: 'Prix décroissant' },
  { value: 'section_asc', label: 'Section A→Z' },
  { value: 'trust_desc',  label: 'Meilleurs vendeurs' },
];

const CATEGORY_OPTIONS: { id: SectionCategory; label: string; color: string }[] = [
  { id: 'STANDING_PIT', label: 'Fosse / Debout', color: 'bg-blue-100 text-blue-700 border-blue-300 data-[active=true]:bg-blue-600 data-[active=true]:text-white data-[active=true]:border-blue-600' },
  { id: 'LOWER_TIER',   label: 'Tribune Basse',  color: 'bg-violet-100 text-violet-700 border-violet-300 data-[active=true]:bg-violet-600 data-[active=true]:text-white data-[active=true]:border-violet-600' },
  { id: 'MIDDLE_TIER',  label: 'Tribune Moy.',   color: 'bg-purple-100 text-purple-700 border-purple-300 data-[active=true]:bg-purple-600 data-[active=true]:text-white data-[active=true]:border-purple-600' },
  { id: 'UPPER_TIER',   label: 'Gradin / Haut',  color: 'bg-emerald-100 text-emerald-700 border-emerald-300 data-[active=true]:bg-emerald-600 data-[active=true]:text-white data-[active=true]:border-emerald-600' },
  { id: 'SEATED_FLOOR', label: 'Parterre Assis', color: 'bg-sky-100 text-sky-700 border-sky-300 data-[active=true]:bg-sky-600 data-[active=true]:text-white data-[active=true]:border-sky-600' },
  { id: 'VIP_PREMIUM',  label: 'VIP / Carré Or', color: 'bg-amber-100 text-amber-700 border-amber-300 data-[active=true]:bg-amber-600 data-[active=true]:text-white data-[active=true]:border-amber-600' },
  { id: 'VIP_LOGES',    label: 'Loges',           color: 'bg-orange-100 text-orange-700 border-orange-300 data-[active=true]:bg-orange-600 data-[active=true]:text-white data-[active=true]:border-orange-600' },
  { id: 'ACCESSIBLE',   label: 'PMR',             color: 'bg-teal-100 text-teal-700 border-teal-300 data-[active=true]:bg-teal-600 data-[active=true]:text-white data-[active=true]:border-teal-600' },
];

interface ITicketsFiltersProps {
  sortBy: SortOption;
  onSortChange: (v: SortOption) => void;
  categoryFilters: Set<SectionCategory>;
  onCategoryToggle: (c: SectionCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  availableCategories: Set<SectionCategory>;
  totalCount: number;
  filteredCount: number;
}

export function TicketsFilters({
  sortBy,
  onSortChange,
  categoryFilters,
  onCategoryToggle,
  searchQuery,
  onSearchChange,
  availableCategories,
  totalCount,
  filteredCount,
}: ITicketsFiltersProps) {
  const [showCategories, setShowCategories] = useState(false);
  const isFiltered = categoryFilters.size > 0 || searchQuery.length > 0;
  const shownCategories = CATEGORY_OPTIONS.filter((c) => availableCategories.has(c.id));

  return (
    <div className="space-y-2.5">
      {/* Search + Sort row */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rang, place, vendeur…"
            className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_1px_3px_rgba(0,0,0,0.06)] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-sm text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.06)] outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Category filter toggle */}
        {shownCategories.length > 0 && (
          <button
            onClick={() => setShowCategories((v) => !v)}
            className={[
              'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition',
              showCategories || categoryFilters.size > 0
                ? 'border-blue-400 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
            ].join(' ')}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {categoryFilters.size > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {categoryFilters.size}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Category pills */}
      {showCategories && shownCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {shownCategories.map((cat) => {
            const active = categoryFilters.has(cat.id);
            return (
              <button
                key={cat.id}
                data-active={active}
                onClick={() => onCategoryToggle(cat.id)}
                className={[
                  'rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                  cat.color,
                ].join(' ')}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Active filter summary */}
      {isFiltered && filteredCount < totalCount && (
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-700">{filteredCount}</span> sur {totalCount} billets
        </p>
      )}
    </div>
  );
}
