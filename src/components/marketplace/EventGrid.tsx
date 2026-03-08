/**
 * EventGrid Component
 * Grille responsive d'événements avec états de chargement
 */

import { EventCard } from './EventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarOff } from 'lucide-react';

interface IEventGridProps {
  events: any[];
  isLoading?: boolean;
}

/**
 * Composant Skeleton pour carte événement
 */
function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mb-3 h-4 w-1/2" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-3 h-4 w-2/3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * État vide : aucun événement trouvé
 */
function EmptyState() {
  return (
    <div className="col-span-full flex min-h-[400px] flex-col items-center justify-center text-center">
      <CalendarOff className="mb-4 h-16 w-16 text-gray-300" />
      <h3 className="mb-2 text-xl font-semibold text-gray-900">
        Aucun événement trouvé
      </h3>
      <p className="text-gray-500">
        Essayez de modifier vos filtres ou revenez plus tard
      </p>
    </div>
  );
}

export function EventGrid({ events, isLoading = false }: IEventGridProps) {
  // État de chargement
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // État vide
  if (events.length === 0) {
    return <EmptyState />;
  }

  // Grille d'événements
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
