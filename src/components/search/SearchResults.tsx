/**
 * SearchResults Component
 * Affichage des résultats de recherche mixtes
 */

import Link from 'next/link';
import { User, MapPin, Calendar } from 'lucide-react';
import { EventCard } from '@/components/marketplace/EventCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ISearchResultsProps {
  results: {
    events: any[];
    artists: Array<{
      name: string;
      category: string;
      eventsCount: number;
    }>;
    cities: Array<{
      name: string;
      eventsCount: number;
    }>;
  };
  query: string;
}

export function SearchResults({ results, query }: ISearchResultsProps) {
  const hasResults =
    results.events.length > 0 ||
    results.artists.length > 0 ||
    results.cities.length > 0;

  if (!hasResults) {
    return (
      <div className="py-12 text-center">
        <p className="mb-2 text-lg font-semibold text-slate-900">
          Aucun résultat pour "{query}"
        </p>
        <p className="text-slate-600">
          Essayez avec d'autres mots-clés ou vérifiez l'orthographe
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Événements */}
      {results.events.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Événements ({results.events.length})
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Artistes */}
      {results.artists.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Artistes ({results.artists.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {results.artists.map((artist, index) => (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{artist.name}</h3>
                      <p className="text-sm text-slate-600">{artist.category}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/events?artists=${encodeURIComponent(artist.name)}`}>
                      {artist.eventsCount} événement{artist.eventsCount > 1 ? 's' : ''}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Villes */}
      {results.cities.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Villes ({results.cities.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {results.cities.map((city, index) => (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-slate-900">{city.name}</h3>
                      <p className="text-xs text-slate-600">
                        {city.eventsCount} événement{city.eventsCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/events?cities=${encodeURIComponent(city.name)}`}>
                      Voir
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
