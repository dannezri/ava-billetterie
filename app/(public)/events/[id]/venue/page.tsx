/**
 * Page Plan Interactif de la Salle
 * Route: /events/[id]/venue
 *
 * Charge l'événement + seatmap directement via Prisma (pas de self-fetch API)
 * pour éviter les erreurs SSR liées aux appels fetch auto-référençants.
 *
 * Priorité seatmap : event.seatmapId > fuzzy match venue name > fallback générique
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { VenuePageClient } from '@/components/venue/VenuePageClient';
import { FALLBACK_SEATMAP } from '@/components/venue/venue-sections-config';
import type { ISeatmap, IVenueSection } from '@/components/venue/types';
import type { IPriceSnapshot } from '@/components/venue/PriceTrendSparkline';

// ISR: revalidate seatmap pages every hour (seatmaps change rarely)
export const revalidate = 3600;

// Pre-generate venue pages for the 30 most recent events
export async function generateStaticParams() {
  try {
    const events = await prisma.event.findMany({
      take: 30,
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    return events.map((e) => ({ id: e.id }));
  } catch {
    return [];
  }
}

interface VenuePageProps {
  params: { id: string };
  searchParams: { setup?: string }; // ?setup=ROUND_360 pour forcer une config 360°
}

// ─── Sélecteur Prisma ────────────────────────────────────────────────────────

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
  stageSetup?: string
): Promise<ISeatmap> {
  try {
    let raw = null;

    // 1. Liaison directe via event.seatmapId
    if (seatmapId) {
      raw = await prisma.venueSeatmap.findUnique({
        where: { id: seatmapId },
        select: SEATMAP_SELECT,
      });
    }

    // 2. Fuzzy match sur le nom de la salle (insensible à la casse)
    if (!raw) {
      const venue = await prisma.venue.findFirst({
        where: { name: { contains: venueName, mode: 'insensitive' } },
        select: { id: true },
      });

      if (venue) {
        raw = await prisma.venueSeatmap.findFirst({
          where: {
            venueId: venue.id,
            ...(stageSetup ? { stageSetup: stageSetup as any } : { isDefault: true }),
          },
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
        section_id:  s.sectionCode,
        name:        s.officialName,
        category:    s.category as IVenueSection['category'],
        svg_path:    s.svgPath,
        fill_rule:   s.fillRule === 'evenodd' ? 'evenodd' : 'nonzero',
        label_x:     s.labelX,
        label_y:     s.labelY,
        aliases:     s.aliases,
        capacity:    s.capacity ?? null,
      })),
    };
  } catch (err) {
    console.error('[VenuePage] seatmap resolution failed:', err);
    return FALLBACK_SEATMAP;
  }
}

// ─── Fetch événement + billets ───────────────────────────────────────────────

async function getEventWithTickets(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id:        true,
        title:     true,
        artist:    true,
        venue:     true,
        city:      true,
        eventDate: true,
        seatmapId: true,
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
                id:              true,
                name:            true,
                trustScore:      true,
                verifiedIdentity: true,
                kycStatus:       true,
              },
            },
          },
          orderBy: { price: 'asc' },
        },
      },
    });

    return event;
  } catch {
    return null;
  }
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { title: true, venue: true, city: true },
  });

  if (!event) return { title: 'Plan de la salle' };

  return {
    title: `Plan de la salle · ${event.title}`,
    description: `Choisissez votre zone et achetez vos billets pour ${event.title} — ${event.venue}, ${event.city}`,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function VenuePage({ params, searchParams }: VenuePageProps) {
  const event = await getEventWithTickets(params.id);

  if (!event) notFound();

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [seatmap, rawHistory] = await Promise.all([
    resolveSeatmap(event.seatmapId, event.venue, searchParams.setup),
    prisma.priceHistory.findMany({
      where: { eventId: event.id, snapshotDate: { gte: sevenDaysAgo } },
      orderBy: { snapshotDate: 'asc' },
      select: { sectionCode: true, snapshotDate: true, minPrice: true, avgPrice: true, maxPrice: true, ticketsCount: true },
    }),
  ]);

  // Group history by sectionCode
  const priceHistory = rawHistory.reduce<Record<string, IPriceSnapshot[]>>((acc, row) => {
    const snap: IPriceSnapshot = {
      snapshotDate: row.snapshotDate.toISOString(),
      minPrice:     Number(row.minPrice),
      avgPrice:     Number(row.avgPrice),
      maxPrice:     Number(row.maxPrice),
      ticketsCount: row.ticketsCount,
    };
    (acc[row.sectionCode] ??= []).push(snap);
    return acc;
  }, {});

  const rawTickets = event.tickets.map((t) => ({
    id:         t.id,
    section:    t.section,
    seatNumber: t.seatNumber,
    row:        t.row,
    price:      Number(t.price),
    status:     t.status,
    seller: {
      id:              t.seller.id,
      name:            t.seller.name,
      trustScore:      t.seller.trustScore,
      verifiedIdentity: t.seller.verifiedIdentity,
      kycStatus:       t.seller.kycStatus,
    },
  }));

  return (
    <VenuePageClient
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
      priceHistory={priceHistory}
    />
  );
}
