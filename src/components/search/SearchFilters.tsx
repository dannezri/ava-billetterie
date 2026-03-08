/**
 * SearchFilters Component
 * Filtres pour la recherche (version simplifiée)
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';
import { IEventFilters } from '@/types/marketplace.types';

interface ISearchFiltersProps {
  filters: IEventFilters;
  onFiltersChange: (filters: IEventFilters) => void;
}

const CATEGORIES = ['Rock', 'Pop', 'Jazz', 'Électro', 'Hip-Hop', 'Classique'];

export function SearchFilters({ filters, onFiltersChange }: ISearchFiltersProps) {
  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    onFiltersChange({ ...filters, categories: newCategories });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm font-medium">
          <Filter className="mr-2 h-4 w-4 text-blue-600" />
          Filtres
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Catégories</p>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`search-cat-${category}`}
                  checked={filters.categories?.includes(category) || false}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label
                  htmlFor={`search-cat-${category}`}
                  className="text-sm font-normal text-gray-700 cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
