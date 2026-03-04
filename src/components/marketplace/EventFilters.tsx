/**
 * EventFilters Component
 * Sidebar de filtres pour le catalogue événements
 */

'use client';

import { useState } from 'react';
import { Calendar, MapPin, Tag, DollarSign, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { IEventFilters } from '@/types/marketplace.types';

interface IEventFiltersProps {
  filters: IEventFilters;
  onFiltersChange: (filters: IEventFilters) => void;
  availableCities: string[];
  availableCategories: string[];
}

export function EventFilters({
  filters,
  onFiltersChange,
  availableCities,
  availableCategories,
}: IEventFiltersProps) {
  const [localFilters, setLocalFilters] = useState<IEventFilters>(filters);

  // Gestion des changements de villes
  const handleCityToggle = (city: string) => {
    const currentCities = localFilters.cities || [];
    const newCities = currentCities.includes(city)
      ? currentCities.filter((c) => c !== city)
      : [...currentCities, city];

    const updatedFilters = { ...localFilters, cities: newCities };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // Gestion des changements de catégories
  const handleCategoryToggle = (category: string) => {
    const currentCategories = localFilters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    const updatedFilters = { ...localFilters, categories: newCategories };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // Gestion du slider de prix
  const handlePriceChange = (values: number[]) => {
    const updatedFilters = {
      ...localFilters,
      priceRange: { min: values[0], max: values[1] },
    };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  // Réinitialiser les filtres
  const handleReset = () => {
    const emptyFilters: IEventFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  // Compteur de filtres actifs
  const activeFiltersCount =
    (localFilters.cities?.length || 0) +
    (localFilters.categories?.length || 0) +
    (localFilters.priceRange ? 1 : 0) +
    (localFilters.dateRange ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Header avec reset */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Filtres</h2>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-slate-600 hover:text-slate-900"
          >
            <X className="mr-1 h-4 w-4" />
            Réinitialiser
          </Button>
        )}
      </div>

      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="w-full justify-center">
          {activeFiltersCount} {activeFiltersCount === 1 ? 'filtre actif' : 'filtres actifs'}
        </Badge>
      )}

      {/* Filtre Villes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <MapPin className="mr-2 h-4 w-4 text-blue-600" />
            Ville
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availableCities.slice(0, 8).map((city) => (
            <div key={city} className="flex items-center space-x-2">
              <Checkbox
                id={`city-${city}`}
                checked={localFilters.cities?.includes(city) || false}
                onCheckedChange={() => handleCityToggle(city)}
              />
              <Label
                htmlFor={`city-${city}`}
                className="text-sm font-normal text-slate-700 cursor-pointer"
              >
                {city}
              </Label>
            </div>
          ))}
          {availableCities.length > 8 && (
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Voir plus...
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Filtre Catégories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <Tag className="mr-2 h-4 w-4 text-blue-600" />
            Catégorie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availableCategories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={localFilters.categories?.includes(category) || false}
                onCheckedChange={() => handleCategoryToggle(category)}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal text-slate-700 cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Filtre Prix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <DollarSign className="mr-2 h-4 w-4 text-blue-600" />
            Prix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {localFilters.priceRange?.min || 0}€
              </span>
              <span className="text-slate-600">
                {localFilters.priceRange?.max || 500}€
              </span>
            </div>
            <Slider
              defaultValue={[
                localFilters.priceRange?.min || 0,
                localFilters.priceRange?.max || 500,
              ]}
              max={500}
              step={10}
              onValueChange={handlePriceChange}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filtre Date (TODO: intégrer Calendar shadcn/ui) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-sm font-medium">
            <Calendar className="mr-2 h-4 w-4 text-blue-600" />
            Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">À venir : sélecteur de plage de dates</p>
        </CardContent>
      </Card>
    </div>
  );
}
