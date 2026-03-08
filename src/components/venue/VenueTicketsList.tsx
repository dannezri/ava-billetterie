'use client';

import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { X, Ticket } from 'lucide-react';
import { CardClean } from '@/components/ui/card-clean';
import { ButtonClean } from '@/components/ui/button-clean';
import { VenueTicketCard } from './VenueTicketCard';
import { TicketsFilters, type SortOption } from './TicketsFilters';
import type { IVenueTicket, IVenueSection, SectionCategory } from './types';

interface IVenueTicketsListProps {
  tickets: IVenueTicket[];
  /** Unfiltered ticket list (for total count) */
  allTickets: IVenueTicket[];
  eventId: string;
  hoveredSectionId: string | null;
  selectedSectionIds: Set<string>;
  sortBy: SortOption;
  categoryFilters: Set<SectionCategory>;
  searchQuery: string;
  availableCategories: Set<SectionCategory>;
  onTicketHover: (ticket: IVenueTicket | null) => void;
  onResetFilter: () => void;
  onSortChange: (v: SortOption) => void;
  onCategoryToggle: (c: SectionCategory) => void;
  onSearchChange: (q: string) => void;
  sections?: IVenueSection[];
}

const ESTIMATED_CARD_HEIGHT = 100;

export function VenueTicketsList({
  tickets,
  allTickets,
  eventId,
  hoveredSectionId,
  selectedSectionIds,
  sortBy,
  categoryFilters,
  searchQuery,
  availableCategories,
  onTicketHover,
  onResetFilter,
  onSortChange,
  onCategoryToggle,
  onSearchChange,
  sections = [],
}: IVenueTicketsListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tickets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    overscan: 4,
    gap: 12,
  });

  // Auto-scroll to first ticket in the selected section
  useEffect(() => {
    if (selectedSectionIds.size === 0 || tickets.length === 0) return;
    const firstMatchIdx = tickets.findIndex((t) =>
      t.resolved_section_id ? selectedSectionIds.has(t.resolved_section_id) : false
    );
    if (firstMatchIdx >= 0) {
      virtualizer.scrollToIndex(firstMatchIdx, { align: 'start', behavior: 'smooth' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSectionIds]);

  const selectedNames = Array.from(selectedSectionIds)
    .map((id) => sections.find((s) => s.section_id === id)?.name ?? id)
    .join(', ');

  const isMapFiltered   = selectedSectionIds.size > 0;
  const isListFiltered  = categoryFilters.size > 0 || searchQuery.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {tickets.length} billet{tickets.length > 1 ? 's' : ''} disponible{tickets.length > 1 ? 's' : ''}
            {tickets.length < allTickets.length && (
              <span className="ml-1.5 text-xs font-normal text-gray-400">/ {allTickets.length}</span>
            )}
          </h2>
          {selectedNames && (
            <p className="mt-0.5 text-xs text-blue-600 font-medium truncate max-w-[220px]">
              Zone&nbsp;: {selectedNames}
            </p>
          )}
        </div>

        {(isMapFiltered || isListFiltered) && (
          <button
            onClick={onResetFilter}
            className="flex items-center gap-1.5 rounded-clean-sm border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 shadow-clean transition-all duration-200 hover:border-gray-300 hover:text-gray-900 hover:shadow-clean-md"
          >
            <X className="h-3.5 w-3.5" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Filtres avancés */}
      <div className="mb-4">
        <TicketsFilters
          sortBy={sortBy}
          onSortChange={onSortChange}
          categoryFilters={categoryFilters}
          onCategoryToggle={onCategoryToggle}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          availableCategories={availableCategories}
          totalCount={allTickets.length}
          filteredCount={tickets.length}
        />
      </div>

      {tickets.length === 0 ? (
        <CardClean className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Ticket className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Aucun billet dans cette zone</p>
            <p className="mt-1 text-xs text-gray-500">Cliquez sur une autre section de la carte</p>
          </div>
          <ButtonClean variant="secondary" size="sm" onClick={onResetFilter}>
            Voir tous les billets
          </ButtonClean>
        </CardClean>
      ) : (
        // Virtualised scroll container
        <div
          ref={parentRef}
          className="overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 280px)', minHeight: 200 }}
        >
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const ticket = tickets[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  data-section-id={ticket.resolved_section_id ?? ''}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <VenueTicketCard
                    ticket={ticket}
                    eventId={eventId}
                    isHighlighted={
                      hoveredSectionId !== null &&
                      hoveredSectionId === ticket.resolved_section_id
                    }
                    onMouseEnter={() => onTicketHover(ticket)}
                    onMouseLeave={() => onTicketHover(null)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
