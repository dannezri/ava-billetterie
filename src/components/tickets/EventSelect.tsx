'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface EventOption {
  id: string;
  title: string;
  artist: string | null;
  venue: string;
  city: string;
  date: string; // ISO string
}

interface EventSelectProps {
  value: string; // event id sélectionné
  onChange: (eventId: string) => void;
  /** Pré-recherche automatique — extrait du PDF */
  defaultSearchQuery?: string | null;
  /**
   * Appelé quand la recherche automatique (via defaultSearchQuery) revient
   * avec 0 résultats — signale que l'événement n'existe pas en BDD.
   */
  onNoResults?: () => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Combobox de recherche d'événements avec autocomplete.
 * - Recherche debounced (300ms) sur /api/events/search
 * - Si defaultSearchQuery fourni (extraction PDF), lance la recherche auto
 * - Si 1 seul résultat → auto-sélection
 * - Si 0 résultat lors de la recherche auto → appel onNoResults()
 */
export function EventSelect({
  value,
  onChange,
  defaultSearchQuery,
  onNoResults,
  disabled = false,
  error,
}: EventSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventOption | null>(null);

  // Tracks whether the next search was triggered by defaultSearchQuery (not manual typing)
  const isAutoSearchRef = useRef(false);

  // Recherche debounced
  const searchEvents = useCallback(async (q: string) => {
    if (q.length < 2) {
      setEvents([]);
      return;
    }

    const wasAutoSearch = isAutoSearchRef.current;
    isAutoSearchRef.current = false;

    setLoading(true);
    try {
      const res = await fetch(`/api/events/search?q=${encodeURIComponent(q)}&limit=8`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      // L'API retourne { success, data: { events } }
      const eventList: EventOption[] = (data.data?.events || data.events || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        artist: e.artist || null,
        venue: e.venue || e.venue_name || '',
        city: e.city || '',
        date: e.date || e.eventDate || e.event_date || '',
      }));

      setEvents(eventList);

      // Auto-sélection si 1 seul résultat
      if (eventList.length === 1 && !value) {
        handleSelect(eventList[0]);
        return;
      }

      // Aucun résultat lors d'une recherche automatique → événement inconnu
      if (eventList.length === 0 && wasAutoSearch) {
        onNoResults?.();
      }
    } catch (err) {
      console.error('Event search error:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, onNoResults]);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => searchEvents(query), 300);
    return () => clearTimeout(timer);
  }, [query, searchEvents]);

  // Auto-recherche si nom extrait du PDF
  useEffect(() => {
    if (defaultSearchQuery && defaultSearchQuery.length >= 2 && !value) {
      isAutoSearchRef.current = true;
      setQuery(defaultSearchQuery.substring(0, 50));
      setIsOpen(true);
    }
  // On ne veut déclencher que quand defaultSearchQuery change (pas value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSearchQuery]);

  const handleSelect = (event: EventOption) => {
    setSelectedEvent(event);
    onChange(event.id);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    setSelectedEvent(null);
    onChange('');
    setEvents([]);
    setQuery('');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative">
      {/* Trigger */}
      {selectedEvent ? (
        <div className={cn(
          'flex items-center justify-between rounded-md border px-3 py-2 text-sm',
          error ? 'border-red-500' : 'border-input',
          disabled && 'opacity-50 cursor-not-allowed'
        )}>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{selectedEvent.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {formatDate(selectedEvent.date)} · {selectedEvent.venue}, {selectedEvent.city}
            </p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Rechercher un événement (artiste, salle, ville...)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
            className={cn('pl-9', error && 'border-red-500')}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {/* Dropdown résultats */}
      {isOpen && !selectedEvent && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          {events.length === 0 && !loading && query.length >= 2 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Aucun événement trouvé pour &quot;{query}&quot;
            </div>
          )}
          {events.length === 0 && !loading && query.length < 2 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Tapez au moins 2 caractères pour rechercher
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Recherche...
            </div>
          )}
          {events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => handleSelect(event)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm hover:bg-accent transition-colors border-b last:border-0"
            >
              <Check
                className={cn('h-4 w-4 mt-0.5 shrink-0', value === event.id ? 'opacity-100 text-primary' : 'opacity-0')}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {formatDate(event.date)}
                  {event.venue && ` · ${event.venue}`}
                  {event.city && `, ${event.city}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Overlay pour fermer */}
      {isOpen && !selectedEvent && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
