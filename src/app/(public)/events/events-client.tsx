/**
 * Events Client Component
 * Composant client pour la page catalogue avec gestion d'état
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { EventGrid } from '@/components/marketplace/EventGrid';
import { EventFilters } from '@/components/marketplace/EventFilters';
import { IEventFilters, SortOption } from '@/types/marketplace.types';

export function EventsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // États
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<IEventFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Fetch événements
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Construction des query params
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());
      params.set('sort', sortBy);

      if (filters.cities && filters.cities.length > 0) {
        params.set('cities', filters.cities.join(','));
      }
      if (filters.categories && filters.categories.length > 0) {
        params.set('categories', filters.categories.join(','));
      }
      if (filters.priceRange) {
        params.set('priceMin', filters.priceRange.min.toString());
        params.set('priceMax', filters.priceRange.max.toString());
      }
      if (searchQuery) {
        params.set('artists', searchQuery);
      }

      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch events');

      const data = await response.json();
      setEvents(data.events);
      setPagination(data.pagination);
      setAvailableCities(data.filters.availableCities);
      setAvailableCategories(data.filters.availableCategories);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, filters, searchQuery]);

  // Charger les événements au montage et quand les dépendances changent
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Gestion changement de filtres
  const handleFiltersChange = (newFilters: IEventFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset à la page 1
  };

  // Gestion changement de tri
  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Gestion recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Compteur filtres actifs
  const activeFiltersCount =
    (filters.cities?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.priceRange ? 1 : 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            Catalogue Événements
          </h1>
          <p className="text-gray-600">
            Découvrez les meilleurs événements et achetez vos billets en toute sécurité
          </p>
        </div>

        {/* Barre de recherche et tri */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Recherche */}
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un événement, artiste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </form>

          {/* Tri */}
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Pertinence</SelectItem>
                <SelectItem value="date_asc">Date croissante</SelectItem>
                <SelectItem value="date_desc">Date décroissante</SelectItem>
                <SelectItem value="price_min">Prix minimum</SelectItem>
                <SelectItem value="popularity">Popularité</SelectItem>
              </SelectContent>
            </Select>

            {/* Bouton filtres mobile */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <EventFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  availableCities={availableCities}
                  availableCategories={availableCategories}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Layout Desktop: Sidebar + Contenu */}
        <div className="flex gap-6">
          {/* Sidebar Filtres (Desktop uniquement) */}
          <aside className="hidden w-80 shrink-0 lg:block">
            <div className="sticky top-24">
              <EventFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                availableCities={availableCities}
                availableCategories={availableCategories}
              />
            </div>
          </aside>

          {/* Contenu principal */}
          <main className="flex-1">
            {/* Résultats count */}
            <div className="mb-4 text-sm text-gray-600">
              {isLoading ? (
                'Chargement...'
              ) : (
                <>
                  <span className="font-semibold text-gray-900">{pagination.total}</span>{' '}
                  {pagination.total === 1 ? 'événement trouvé' : 'événements trouvés'}
                </>
              )}
            </div>

            {/* Grille événements */}
            <EventGrid events={events} isLoading={isLoading} />

            {/* Pagination (TODO) */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} sur {pagination.totalPages}
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
