/**
 * Filter Sidebar Component
 * Filters for tickets marketplace: price range (slider), category (checkboxes), sorting
 */

'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface TicketFilters {
  minPrice: number;
  maxPrice: number;
  categories: string[];
  sortBy: 'price_asc' | 'price_desc' | 'date_added';
}

interface FilterSidebarProps {
  filters: TicketFilters;
  onFiltersChange: (filters: TicketFilters) => void;
  availableCategories: string[];
  priceRange?: { min: number; max: number };
  className?: string;
}

export function FilterSidebar({
  filters,
  onFiltersChange,
  availableCategories,
  priceRange = { min: 0, max: 500 },
  className = '',
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<TicketFilters>(filters);
  const [isPriceRangeActive, setIsPriceRangeActive] = useState(false);

  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Apply filters
  const applyFilters = (newFilters: TicketFilters) => {
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle price range change
  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newFilters = {
      ...localFilters,
      [type === 'min' ? 'minPrice' : 'maxPrice']: value,
    };
    setIsPriceRangeActive(true);
    applyFilters(newFilters);
  };

  // Handle category toggle
  const handleCategoryToggle = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter((c) => c !== category)
      : [...localFilters.categories, category];
    
    applyFilters({
      ...localFilters,
      categories: newCategories,
    });
  };

  // Handle sort change
  const handleSortChange = (sortBy: TicketFilters['sortBy']) => {
    applyFilters({
      ...localFilters,
      sortBy,
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: TicketFilters = {
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      categories: [],
      sortBy: 'date_added',
    };
    setIsPriceRangeActive(false);
    applyFilters(clearedFilters);
  };

  // Check if filters are active
  const hasActiveFilters =
    localFilters.categories.length > 0 ||
    isPriceRangeActive ||
    localFilters.sortBy !== 'date_added';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Filtres</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Tout effacer
          </Button>
        )}
      </div>

      <Separator />

      {/* Sort */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold">Trier par</Label>
        </div>
        <Select value={localFilters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_added">Plus récents</SelectItem>
            <SelectItem value="price_asc">Prix croissant</SelectItem>
            <SelectItem value="price_desc">Prix décroissant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range Slider */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">Prix</Label>
        
        {/* Min Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Minimum</span>
            <span className="font-medium">{localFilters.minPrice}€</span>
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step={5}
            value={localFilters.minPrice}
            onChange={(e) => handlePriceChange('min', Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Max Price */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Maximum</span>
            <span className="font-medium">{localFilters.maxPrice}€</span>
          </div>
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step={5}
            value={localFilters.maxPrice}
            onChange={(e) => handlePriceChange('max', Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Price Range Display */}
        <div className="rounded-lg bg-muted px-3 py-2 text-center text-sm font-medium">
          {localFilters.minPrice}€ - {localFilters.maxPrice}€
        </div>
      </div>

      <Separator />

      {/* Category Checkboxes */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Catégorie</Label>
        <div className="space-y-2">
          {availableCategories.length > 0 ? (
            availableCategories.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={localFilters.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="h-4 w-4 rounded border-muted-foreground text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                />
                <span className="text-sm group-hover:text-foreground transition-colors">
                  {category}
                </span>
              </label>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Aucune catégorie disponible
            </p>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Filtres actifs</Label>
            <div className="flex flex-wrap gap-2">
              {isPriceRangeActive && (
                <Badge variant="secondary" className="gap-1">
                  {localFilters.minPrice}€ - {localFilters.maxPrice}€
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => {
                      setIsPriceRangeActive(false);
                      applyFilters({
                        ...localFilters,
                        minPrice: priceRange.min,
                        maxPrice: priceRange.max,
                      });
                    }}
                  />
                </Badge>
              )}
              {localFilters.categories.map((category) => (
                <Badge key={category} variant="secondary" className="gap-1">
                  {category}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleCategoryToggle(category)}
                  />
                </Badge>
              ))}
              {localFilters.sortBy !== 'date_added' && (
                <Badge variant="secondary" className="gap-1">
                  {localFilters.sortBy === 'price_asc' && 'Prix ↑'}
                  {localFilters.sortBy === 'price_desc' && 'Prix ↓'}
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
