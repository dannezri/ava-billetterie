/**
 * Page Détail Événement
 * Route: /events/[id]
 *
 * Layout : sidebar (infos event) + colonne principale (carte interactive EN GRAND + liste billets)
 * Le seatmap est résolu via Prisma côté serveur pour éviter les self-fetch SSR.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EventHeader } from '@/components/events/EventHeader';
import { EventDetails } from '@/components/events/EventDetails';
import { PriceStats } from '@/components/events/PriceStats';
import { TicketSelectionModalTrigger } from '@/components/events/TicketSelectionModalTrigger';
import { VenuePageClient } from '@/components/venue/VenuePageClient';
import { prisma } from '@/lib/prisma';
import { FALLBACK_SEATMAP } from '@/components/venue/venue-sections-config';
import type { ISeatmap, IVenueSection } from '@/components/venue/types';

interface EventDetailPageProps {
  params: { id: string };
  searchParams: { quantity?: string; together?: string };
}

// ─── Sélecteurs Prisma ────────────────────────────────────────────────────────

const SECTION_SELECT = {
  sectionCode:  true,
  officialName: true,
  category:     true,
  svgPath:      true,
  fillRule:     true,
  labelX:       true,
  labelY:       true,
  aliases:      true,
  capacity:     true,
  sortOrder:    true,
} as const;

const SEATMAP_SELECT = {
  id:                true,
  stageSetup:        true,
  configurationName: true,
  viewboxWidth:      true,
  viewboxHeight:     true,
  sections: { select: SECTION_SELECT, orderBy: { sortOrder: 'asc' as const } },
} as const;

// ─── Résolution du seatmap ───────────────────────────────────────────────────

async function resolveSeatmap(
  seatmapId: string | null | undefined,
  venueName: string,
): Promise<ISeatmap> {
  try {
    let raw = null;

    if (seatmapId) {
      raw = await prisma.venueSeatmap.findUnique({
        where: { id: seatmapId },
        select: SEATMAP_SELECT,
      });
    }

    if (!raw) {
      const venue = await prisma.venue.findFirst({
        where: { name: { contains: venueName, mode: 'insensitive' } },
        select: { id: true },
      });
      if (venue) {
        raw = await prisma.venueSeatmap.findFirst({
          where: { venueId: venue.id, isDefault: true },
          select: SEATMAP_SELECT,
          orderBy: { isDefault: 'desc' },
        });
      }
    }

    if (!raw) return FALLBACK_SEATMAP;

    return {
      id:                raw.id,
      stageSetup:        raw.stageSetup as ISeatmap['stageSetup'],
      configurationName: raw.configurationName,
      viewboxWidth:      raw.viewboxWidth,
      viewboxHeight:     raw.viewboxHeight,
      sections:          raw.sections.map((s): IVenueSection => ({
        section_id: s.sectionCode,
        name:       s.officialName,
        category:   s.category as IVenueSection['category'],
        svg_path:   s.svgPath,
        fill_rule:  s.fillRule === 'evenodd' ? 'evenodd' : 'nonzero',
        label_x:    s.labelX,
        label_y:    s.labelY,
        aliases:    s.aliases,
        capacity:   s.capacity ?? null,
      })),
    };
  } catch {
    return FALLBACK_SEATMAP;
  }
}

// ─── Fetch événement complet via Prisma ───────────────────────────────────────

async function getEvent(id: string) {
  try {
    return await prisma.event.findUnique({
      where: { id },
      select: {
        id:           true,
        title:        true,
        artist:       true,
        venue:        true,
        city:         true,
        country:      true,
        eventDate:    true,
        doorsOpenTime: true,
        category:     true,
        imageUrl:     true,
        officialUrl:  true,
        isVerified:   true,
        description:  true,
        seatmapId:    true,
        tickets: {
          where: {
            status:             { in: ['ACTIVE', 'RESERVED'] },
            verificationStatus: 'APPROVED',
            groupId:            null,
          },
          select: {
            id:         true,
            section:    true,
            seatNumber: true,
            row:        true,
            price:      true,
            status:     true,
            seller: {
              select: {
                id:               true,
                name:             true,
                trustScore:       true,
                verifiedIdentity: true,
                kycStatus:        true,
              },
            },
          },
          orderBy: { price: 'asc' },
        },
      },
    });
  } catch {
    return null;
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { title: true, artist: true, description: true, imageUrl: true },
  });
  if (!event) return { title: 'Événement introuvable' };
  return {
    title: `${event.title} — Billets`,
    description: event.description || `Achetez vos billets pour ${event.title}`,
    openGraph: {
      title: event.title,
      description: event.description || undefined,
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function EventDetailPage({
  params,
  searchParams,
}: EventDetailPageProps) {
  const quantity = parseInt(searchParams.quantity || '0') || 0;
  const together = searchParams.together === 'true';
  const hasFilter = quantity > 0;

  const event = await getEvent(params.id);
  if (!event) notFound();

  const seatmap = await resolveSeatmap(event.seatmapId, event.venue);

  // Compute price stats for sidebar (format attendu par PriceStats)
  const allPrices = event.tickets.map((t) => Number(t.price));
  const stats = (() => {
    if (!allPrices.length) return null;
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const avgPrice = Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length);

    // Histogramme : 4 tranches égales entre min et max
    const step = Math.max(Math.ceil((maxPrice - minPrice) / 4), 1);
    const buckets: Array<{ range: string; count: number }> = [];
    for (let from = Math.floor(minPrice); from <= maxPrice; from += step) {
      const to = from + step;
      buckets.push({
        range: `${from}–${to}`,
        count: allPrices.filter((p) => p >= from && p < to).length,
      });
    }

    return { minPrice, maxPrice, avgPrice, priceDistribution: buckets };
  })();

  const rawTickets = event.tickets.map((t) => ({
    id:         t.id,
    section:    t.section,
    seatNumber: t.seatNumber,
    row:        t.row,
    price:      Number(t.price),
    status:     t.status,
    seller: {
      id:               t.seller.id,
      name:             t.seller.name,
      trustScore:       t.seller.trustScore,
      verifiedIdentity: t.seller.verifiedIdentity,
      kycStatus:        t.seller.kycStatus,
    },
  }));

  // Shape event for sidebar components (compatible with existing components)
  const eventForSidebar = {
    ...event,
    venueAddress:  null as string | null,
    doorsOpenTime: event.doorsOpenTime ?? null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal sélection */}
      <TicketSelectionModalTrigger
        eventId={event.id}
        eventName={event.title}
        shouldOpenAuto={!hasFilter}
        initialQuantity={quantity || 1}
        initialTogether={together}
      />

      {/* Hero */}
      <EventHeader event={eventForSidebar} />

      {/* Barre sticky */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            {hasFilter && (
              <Badge variant="secondary" className="gap-1.5 bg-blue-50 px-3 py-1 text-blue-700 text-sm">
                🎫 {quantity} billet{quantity > 1 ? 's' : ''}{together ? ' côte à côte' : ''}
              </Badge>
            )}
            <TicketSelectionModalTrigger
              eventId={event.id}
              eventName={event.title}
              initialQuantity={quantity || 1}
              initialTogether={together}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  {hasFilter ? 'Modifier ma recherche' : 'Filtrer les billets'}
                </Button>
              }
            />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

          {/* ── Sidebar (infos event) ── */}
          <aside className="w-full shrink-0 space-y-4 lg:w-72">
            <EventDetails event={eventForSidebar} />
            {stats && <PriceStats stats={stats} />}
          </aside>

          {/* ── Colonne principale : carte GRANDE + liste billets ── */}
          <div className="min-w-0 flex-1">
            <VenuePageClient
              embedded
              event={{
                id:        event.id,
                title:     event.title,
                artist:    event.artist ?? null,
                venue:     event.venue,
                city:      event.city,
                eventDate: event.eventDate.toISOString(),
              }}
              rawTickets={rawTickets}
              seatmap={seatmap}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
