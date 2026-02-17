/**
 * Events Catalog Page
 * Browse and filter available events
 */

'use client';

import { EventCard } from '@/components/events/EventCard';
import { EventFilters, EventFiltersState } from '@/components/events/EventFilters';
import { SearchBar } from '@/components/events/SearchBar';
import { MainLayout } from '@/components/layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CalendarRange } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Event {
  id: string;
  title: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  date: string;
  venue?: string;
  city?: string;
  location: string;
  country?: string;
  availableTickets: number;
  minPrice?: number;
  maxPrice?: number;
}

export default function EventsPage() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFiltersState>({
    search: searchParams.get('search') || '',
    city: '',
    dateRange: '',
    category: '',
  });

  // Extract unique cities and categories from events
  const cities = Array.from(new Set(events.map((e) => e.city).filter(Boolean))) as string[];
  const categories = Array.from(new Set(events.map((e) => e.category).filter(Boolean))) as string[];

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.city) params.append('city', filters.city);
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.category) params.append('category', filters.category);

      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data.events);
        setFilteredEvents(data.data.events);
      } else {
        setError(data.error?.message || 'Erreur lors du chargement des événements');
      }
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError('Impossible de charger les événements. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: EventFiltersState) => {
    setFilters(newFilters);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CalendarRange className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Événements</h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Découvrez tous les événements disponibles et trouvez vos billets
          </p>
          
          {/* Search Bar */}
          <SearchBar className="max-w-2xl" />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <EventFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            cities={cities}
            categories={categories}
          />
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results Count */}
        {!loading && !error && (
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredEvents.length === 0 ? (
              <span>Aucun événement trouvé</span>
            ) : (
              <span>
                {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé
                {filteredEvents.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && filteredEvents.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                description={event.description}
                category={event.category}
                imageUrl={event.imageUrl}
                date={new Date(event.date)}
                location={event.location}
                country={event.country}
                availableTickets={event.availableTickets}
                minPrice={event.minPrice}
                maxPrice={event.maxPrice}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarRange className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun événement trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Essayez de modifier vos filtres ou revenez plus tard
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
