/**
 * Event Filters Component
 * Filters for events: date, city, artist/title search
 */

'use client';

import { useState } from 'react';
import { Search, Calendar, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export interface EventFiltersState {
  search: string;
  city: string;
  dateRange: string;
  category: string;
}

interface EventFiltersProps {
  filters: EventFiltersState;
  onFiltersChange: (filters: EventFiltersState) => void;
  cities: string[];
  categories: string[];
}

export function EventFilters({
  filters,
  onFiltersChange,
  cities,
  categories,
}: EventFiltersProps) {
  const [localFilters, setLocalFilters] = useState<EventFiltersState>(filters);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...localFilters, search: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCityChange = (value: string) => {
    const newFilters = { ...localFilters, city: value === 'all' ? '' : value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (value: string) => {
    const newFilters = { ...localFilters, dateRange: value === 'all' ? '' : value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...localFilters, category: value === 'all' ? '' : value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: EventFiltersState = {
      search: '',
      city: '',
      dateRange: '',
      category: '',
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters =
    localFilters.search ||
    localFilters.city ||
    localFilters.dateRange ||
    localFilters.category;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filtres</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Rechercher un événement ou artiste
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Nom de l'événement ou artiste..."
            value={localFilters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Catégorie
          </Label>
          <Select value={localFilters.category || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Filter */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">
            <MapPin className="mr-1 inline h-4 w-4" />
            Ville
          </Label>
          <Select value={localFilters.city || 'all'} onValueChange={handleCityChange}>
            <SelectTrigger id="city">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les villes</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label htmlFor="dateRange" className="text-sm font-medium">
            <Calendar className="mr-1 inline h-4 w-4" />
            Période
          </Label>
          <Select value={localFilters.dateRange || 'all'} onValueChange={handleDateRangeChange}>
            <SelectTrigger id="dateRange">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les dates</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois-ci</SelectItem>
              <SelectItem value="3months">3 prochains mois</SelectItem>
              <SelectItem value="6months">6 prochains mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 border-t pt-4">
          {localFilters.search && (
            <Badge variant="secondary" className="gap-1">
              Recherche: {localFilters.search}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleSearchChange('')}
              />
            </Badge>
          )}
          {localFilters.category && (
            <Badge variant="secondary" className="gap-1">
              {localFilters.category}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleCategoryChange('')}
              />
            </Badge>
          )}
          {localFilters.city && (
            <Badge variant="secondary" className="gap-1">
              {localFilters.city}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleCityChange('')}
              />
            </Badge>
          )}
          {localFilters.dateRange && (
            <Badge variant="secondary" className="gap-1">
              {localFilters.dateRange === 'today' && 'Aujourd\'hui'}
              {localFilters.dateRange === 'week' && 'Cette semaine'}
              {localFilters.dateRange === 'month' && 'Ce mois-ci'}
              {localFilters.dateRange === '3months' && '3 mois'}
              {localFilters.dateRange === '6months' && '6 mois'}
              <X
                className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleDateRangeChange('')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// Helper Badge component for active filters
function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'secondary';
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        variant === 'secondary'
          ? 'bg-secondary text-secondary-foreground'
          : 'bg-primary text-primary-foreground'
      } ${className}`}
    >
      {children}
    </span>
  );
}
