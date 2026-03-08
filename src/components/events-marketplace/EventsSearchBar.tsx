'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Search, User, MapPin, CalendarDays, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchEvent {
  id: string;
  title: string;
  artist: string | null;
  city: string;
  eventDate: string;
  imageUrl: string | null;
}

interface SearchArtist {
  name: string;
  category: string;
  eventsCount: number;
}

interface SearchCity {
  name: string;
  eventsCount: number;
}

interface SearchResults {
  events: SearchEvent[];
  artists: SearchArtist[];
  cities: SearchCity[];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function EventsSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer le dropdown au clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch résultats quand la query debounced change
  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q.trim())}&type=all&limit=5`,
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results ?? null);
      setIsOpen(true);
    } catch {
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  const hasResults =
    results &&
    (results.events.length > 0 ||
      results.artists.length > 0 ||
      results.cities.length > 0);

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSelect = () => {
    setIsOpen(false);
    setQuery('');
    setResults(null);
  };

  return (
    <div className="bg-white px-4 pt-4 pb-3">
      <div ref={containerRef} className="relative mx-auto max-w-3xl">

        {/* Champ de recherche */}
        <div
          className={cn(
            'flex items-center gap-3 rounded-full border bg-white px-5 py-3 shadow-sm transition-all',
            isOpen && hasResults
              ? 'rounded-b-none border-b-transparent shadow-md border-gray-300'
              : 'border-gray-200 focus-within:border-gray-300 focus-within:shadow-md',
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-emerald-600" />
          ) : (
            <Search className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (hasResults) setIsOpen(true); }}
            placeholder="Recherche d'événements, d'artistes, d'équipes, etc."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none"
          />

          {query && (
            <button
              onClick={handleClear}
              className="flex-shrink-0 rounded-full p-0.5 text-gray-400 transition hover:text-gray-600"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown résultats */}
        {isOpen && (
          <div className="absolute left-0 right-0 z-50 overflow-hidden rounded-b-2xl border border-t-0 border-gray-300 bg-white shadow-xl">

            {/* Aucun résultat */}
            {!hasResults && !isLoading && query.trim().length >= 2 && (
              <div className="px-5 py-6 text-center text-sm text-gray-500">
                Aucun résultat pour{' '}
                <span className="font-semibold text-gray-700">"{query}"</span>
              </div>
            )}

            {/* Artistes */}
            {results && results.artists.length > 0 && (
              <div>
                <p className="px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Artistes
                </p>
                {results.artists.slice(0, 4).map((artist) => (
                  <Link
                    key={artist.name}
                    href={`/events/artist/${encodeURIComponent(artist.name)}`}
                    onClick={handleSelect}
                    className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <User className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {artist.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {artist.eventsCount} événement{artist.eventsCount > 1 ? 's' : ''}
                        {artist.category ? ` · ${artist.category}` : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Événements */}
            {results && results.events.length > 0 && (
              <div>
                <p className="px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Événements
                </p>
                {results.events.slice(0, 3).map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    onClick={handleSelect}
                    className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {event.city}
                        {event.eventDate
                          ? ` · ${new Date(event.eventDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                            })}`
                          : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Villes */}
            {results && results.cities.length > 0 && (
              <div>
                <p className="px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Villes
                </p>
                {results.cities.slice(0, 3).map((city) => (
                  <Link
                    key={city.name}
                    href={`/events?location=${encodeURIComponent(city.name)}`}
                    onClick={handleSelect}
                    className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <MapPin className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {city.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {city.eventsCount} événement{city.eventsCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Footer : voir tous les résultats */}
            {hasResults && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={handleSelect}
                className="flex items-center justify-center gap-1.5 border-t border-gray-100 px-5 py-3 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
              >
                <Search className="h-3.5 w-3.5" />
                Voir tous les résultats pour "{query}"
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
