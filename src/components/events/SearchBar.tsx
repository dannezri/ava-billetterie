/**
 * Search Bar Component
 * Autocomplete search for events with 300ms debounce
 * Displays results in a dropdown
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Calendar, MapPin, Loader2, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SearchResult {
  id: string;
  title: string;
  artist?: string;
  venue: string;
  city: string;
  date: Date;
  availableTickets: number;
  minPrice?: number;
  imageUrl?: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  placeholder = "Rechercher un événement, artiste ou lieu...",
  className = '' 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const router = useRouter();

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/events/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data.events.map((e: any) => ({
          ...e,
          date: new Date(e.date),
        })));
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsLoading(value.length >= 2);
    setIsOpen(true);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer (300ms debounce)
    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Navigate to event page
  const handleResultClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
    setIsOpen(false);
    setQuery('');
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border bg-card shadow-lg">
          {isLoading ? (
            // Loading skeleton
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            // Results list
            <div className="max-h-96 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result.id)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    {/* Event image placeholder */}
                    <div className="flex-shrink-0 w-16 h-16 rounded bg-muted flex items-center justify-center">
                      {result.imageUrl ? (
                        <img 
                          src={result.imageUrl} 
                          alt={result.title}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1">
                        {result.title}
                      </h4>
                      {result.artist && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {result.artist}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(result.date, 'dd MMM', { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {result.city}
                        </span>
                      </div>
                      {result.minPrice && (
                        <p className="mt-1 text-xs font-semibold text-primary">
                          À partir de {result.minPrice.toFixed(2)}€
                        </p>
                      )}
                    </div>

                    {/* Availability badge */}
                    {result.availableTickets > 0 && (
                      <Badge variant="secondary" className="flex-shrink-0">
                        {result.availableTickets} {result.availableTickets === 1 ? 'billet' : 'billets'}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
              
              {/* View all results link */}
              <div className="p-3 text-center border-t bg-muted/50">
                <button
                  onClick={() => {
                    router.push(`/events?search=${encodeURIComponent(query)}`);
                    setIsOpen(false);
                  }}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Voir tous les résultats pour "{query}"
                </button>
              </div>
            </div>
          ) : (
            // No results
            <div className="p-6 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucun événement trouvé pour "{query}"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Essayez avec d'autres mots-clés
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
