'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { InteractiveVenueMap } from './InteractiveVenueMap';
import { VenueTicketsList } from './VenueTicketsList';
import { resolveSectionId } from './venue-sections-config';
import { useSectionAnalytics } from '@/hooks/useSectionAnalytics';
import { type SortOption } from './TicketsFilters';
import type { IVenueTicket, ISectionPrice, ISeatmap, IVenueSection, SectionCategory } from './types';
import type { IPriceSnapshot } from './PriceTrendSparkline';

interface IVenuePageClientProps {
  event: {
    id: string;
    title: string;
    artist: string | null;
    venue: string;
    city: string;
    eventDate: string;
  };
  rawTickets: Array<{
    id: string;
    section: string | null;
    seatNumber: string | null;
    row: string | null;
    price: number;
    status: string;
    seller: {
      id: string;
      name: string | null;
      trustScore: number;
      verifiedIdentity?: boolean;
      kycStatus?: string;
    };
  }>;
  seatmap: ISeatmap;
  /** Mode intégré : masque le header/hero internes (utilisé depuis /events/[id]) */
  embedded?: boolean;
  /** Prix historiques par section (7 derniers jours) */
  priceHistory?: Record<string, IPriceSnapshot[]>;
}

export function VenuePageClient({ event, rawTickets, seatmap, priceHistory = {}, embedded = false }: IVenuePageClientProps) {
  // ─── Map interaction state ─────────────────────────────────────────────────
  const [hoveredSection,     setHoveredSection]    = useState<IVenueSection | null>(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState<Set<string>>(new Set());
  const [priceRange,         setPriceRange]         = useState<[number, number]>([0, Infinity]);
  const [mouseX,             setMouseX]             = useState(0);
  const [mouseY,             setMouseY]             = useState(0);

  // ─── List filters state ────────────────────────────────────────────────────
  const [sortBy,           setSortBy]           = useState<SortOption>('price_asc');
  const [categoryFilters,  setCategoryFilters]  = useState<Set<SectionCategory>>(new Set());
  const [searchQuery,      setSearchQuery]      = useState('');

  // ─── Analytics (client-side accumulator for live heatmap) ─────────────────
  const [liveAnalytics, setLiveAnalytics] = useState<
    Record<string, { views_count: number; clicks_count: number }>
  >({});
  const { trackView, trackHover, trackClick } = useSectionAnalytics(event.id);

  const hoveredSectionId = hoveredSection?.section_id ?? null;

  // ─── Tickets resolution ────────────────────────────────────────────────────
  const tickets = useMemo<IVenueTicket[]>(
    () =>
      rawTickets
        .filter((t) => t.status === 'ACTIVE')
        .map((t) => ({
          id: t.id,
          section: t.section,
          seatNumber: t.seatNumber,
          row: t.row,
          price: t.price,
          status: t.status,
          seller: {
            id: t.seller.id,
            name: t.seller.name,
            trustScore: t.seller.trustScore,
            // Use DB field directly; fall back to trust score threshold only if field is missing
            verifiedIdentity: t.seller.verifiedIdentity ?? (t.seller.trustScore ?? 0) >= 70,
            kycStatus: (t.seller.kycStatus ?? 'PENDING') as 'PENDING' | 'VERIFIED' | 'REJECTED',
          },
          resolved_section_id: resolveSectionId(t.section, seatmap.sections),
        })),
    [rawTickets, seatmap.sections]
  );

  // ─── Price stats per section ───────────────────────────────────────────────
  const sectionPrices = useMemo<Map<string, ISectionPrice>>(() => {
    const map = new Map<string, ISectionPrice>();
    tickets.forEach((ticket) => {
      const sid = ticket.resolved_section_id;
      if (!sid) return;
      const existing = map.get(sid);
      if (!existing) {
        map.set(sid, { section_id: sid, min_price: ticket.price, max_price: ticket.price, tickets_count: 1 });
      } else {
        existing.min_price = Math.min(existing.min_price, ticket.price);
        existing.max_price = Math.max(existing.max_price, ticket.price);
        existing.tickets_count += 1;
      }
    });
    return map;
  }, [tickets]);

  // ─── Global price bounds (for slider) ─────────────────────────────────────
  const { globalPriceMin, globalPriceMax } = useMemo(() => {
    let min = Infinity, max = 0;
    sectionPrices.forEach((d) => {
      if (d.min_price < min) min = d.min_price;
      if (d.max_price > max) max = d.max_price;
    });
    return { globalPriceMin: min === Infinity ? 0 : min, globalPriceMax: max };
  }, [sectionPrices]);

  // Initialise price range once we have real bounds
  const effectivePriceRange: [number, number] = [
    priceRange[0] === 0 && priceRange[1] === Infinity
      ? globalPriceMin
      : priceRange[0],
    priceRange[1] === Infinity ? globalPriceMax : priceRange[1],
  ];

  // ─── Available categories (only show pills for categories present in data) ──
  const availableCategories = useMemo<Set<SectionCategory>>(() => {
    const cats = new Set<SectionCategory>();
    tickets.forEach((t) => {
      if (!t.resolved_section_id) return;
      const sec = seatmap.sections.find((s) => s.section_id === t.resolved_section_id);
      if (sec) cats.add(sec.category);
    });
    return cats;
  }, [tickets, seatmap.sections]);

  // ─── Filtered + sorted tickets ─────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    let result = tickets;

    // Section filter (map)
    if (selectedSectionIds.size > 0) {
      result = result.filter(
        (t) => t.resolved_section_id && selectedSectionIds.has(t.resolved_section_id)
      );
    }

    // Price range filter
    if (priceRange[1] !== Infinity) {
      result = result.filter(
        (t) => t.price >= effectivePriceRange[0] && t.price <= effectivePriceRange[1]
      );
    }

    // Category filter
    if (categoryFilters.size > 0) {
      result = result.filter((t) => {
        const sec = seatmap.sections.find((s) => s.section_id === t.resolved_section_id);
        return sec && categoryFilters.has(sec.category);
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.row?.toLowerCase().includes(q) ||
          t.seatNumber?.toLowerCase().includes(q) ||
          t.section?.toLowerCase().includes(q) ||
          t.seller.name?.toLowerCase().includes(q)
      );
    }

    // Sort
    const sorted = [...result];
    switch (sortBy) {
      case 'price_asc':   sorted.sort((a, b) => a.price - b.price); break;
      case 'price_desc':  sorted.sort((a, b) => b.price - a.price); break;
      case 'section_asc': sorted.sort((a, b) => (a.section ?? '').localeCompare(b.section ?? '')); break;
      case 'trust_desc':  sorted.sort((a, b) => b.seller.trustScore - a.seller.trustScore); break;
    }

    return sorted;
  }, [tickets, selectedSectionIds, priceRange, effectivePriceRange, categoryFilters, searchQuery, sortBy, seatmap.sections]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX);
    setMouseY(e.clientY);
  }, []);

  const handleSectionHover = useCallback((section: IVenueSection | null) => {
    setHoveredSection(section);
    if (section) {
      trackHover(section.section_id);
      // Accumulate locally for live heatmap (no re-render throttle needed — hovers are ~500ms debounced)
      setLiveAnalytics((prev) => {
        const cur = prev[section.section_id] ?? { views_count: 0, clicks_count: 0 };
        return { ...prev, [section.section_id]: { ...cur, views_count: cur.views_count + 1 } };
      });
    } else {
      trackHover(null);
    }
  }, [trackHover]);

  const handleSectionClick = useCallback((sectionId: string, shiftKey: boolean) => {
    setSelectedSectionIds((prev) => {
      const next = new Set(prev);
      if (shiftKey) {
        if (next.has(sectionId)) next.delete(sectionId);
        else next.add(sectionId);
      } else {
        if (next.size === 1 && next.has(sectionId)) next.clear();
        else { next.clear(); next.add(sectionId); }
      }
      return next;
    });
    trackClick(sectionId);
    setLiveAnalytics((prev) => {
      const cur = prev[sectionId] ?? { views_count: 0, clicks_count: 0 };
      return { ...prev, [sectionId]: { ...cur, clicks_count: cur.clicks_count + 1 } };
    });
  }, [trackClick]);

  const handleTicketHover = useCallback(
    (t: IVenueTicket | null) =>
      setHoveredSection(
        t?.resolved_section_id
          ? (seatmap.sections.find((s) => s.section_id === t.resolved_section_id) ?? null)
          : null
      ),
    [seatmap.sections]
  );

  const handleCategoryToggle = useCallback((cat: SectionCategory) => {
    setCategoryFilters((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  const handleResetFilter = useCallback(() => {
    setSelectedSectionIds(new Set());
    setPriceRange([0, Infinity]);
    setCategoryFilters(new Set());
    setSearchQuery('');
  }, []);

  const handlePriceRangeChange = useCallback((range: [number, number]) => {
    setPriceRange(range);
    // Clear section selections that are now out of range
    setSelectedSectionIds((prev) => {
      const next = new Set<string>();
      prev.forEach((id) => {
        const p = sectionPrices.get(id);
        if (p && p.min_price >= range[0] && p.min_price <= range[1]) next.add(id);
      });
      return next;
    });
  }, [sectionPrices]);

  return (
    <div className={embedded ? 'space-y-5' : 'min-h-screen bg-gray-50'} onMouseMove={handleMouseMove}>
      {/* Top bar — masqué en mode embedded */}
      {!embedded && (
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-clean">
          <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;événement
            </Link>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 leading-tight truncate max-w-[260px]">
                {event.title}
              </p>
              <p className="text-xs text-gray-500">
                {event.venue} · {event.city}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hero — masqué en mode embedded */}
      {!embedded && (
        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-5">
            <h1 className="text-xl font-bold text-gray-900">Plan de la salle</h1>
            <p className="mt-1 text-sm text-gray-500">
              {tickets.length} billet{tickets.length > 1 ? 's' : ''} disponible{tickets.length > 1 ? 's' : ''}
              {' · '}
              <span className="font-medium text-gray-700">{seatmap.configurationName}</span>
            </p>
          </div>
        </div>
      )}

      {/* Layout vertical : carte en grand, liste en dessous */}
      <div className={embedded ? 'space-y-5' : 'container mx-auto px-4 py-6 space-y-6 max-w-5xl'}>
        {/* Carte — pleine largeur */}
        <InteractiveVenueMap
          seatmap={seatmap}
          sectionPrices={sectionPrices}
          hoveredSectionId={hoveredSectionId}
          selectedSectionIds={selectedSectionIds}
          priceRange={effectivePriceRange}
          globalPriceMin={globalPriceMin}
          globalPriceMax={globalPriceMax}
          mouseX={mouseX}
          mouseY={mouseY}
          priceHistory={priceHistory}
          sectionAnalytics={liveAnalytics}
          eventTitle={event.title}
          onSectionHover={handleSectionHover}
          onSectionClick={handleSectionClick}
          onPriceRangeChange={handlePriceRangeChange}
        />

        {/* Liste billets — pleine largeur */}
        <VenueTicketsList
          tickets={filteredTickets}
          allTickets={tickets}
          eventId={event.id}
          hoveredSectionId={hoveredSectionId}
          selectedSectionIds={selectedSectionIds}
          sortBy={sortBy}
          categoryFilters={categoryFilters}
          searchQuery={searchQuery}
          availableCategories={availableCategories}
          onTicketHover={handleTicketHover}
          onResetFilter={handleResetFilter}
          onSortChange={setSortBy}
          onCategoryToggle={handleCategoryToggle}
          onSearchChange={setSearchQuery}
          sections={seatmap.sections}
        />
      </div>
    </div>
  );
}
