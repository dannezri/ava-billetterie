/**
 * GET /api/venues/seatmap
 *
 * Résout le seatmap d'une salle à partir du nom de la salle et/ou d'un seatmapId.
 *
 * Query params :
 *   - seatmapId  : ID direct du seatmap (prioritaire)
 *   - venueName  : Nom de la salle (fuzzy match)
 *   - stageSetup : 'FRONTAL' | 'ROUND_360' | ... (optionnel, défaut = seatmap isDefault)
 *
 * Response :
 *   { seatmap: ISeatmap } | { seatmap: null }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ISeatmap, IVenueSection } from '@/components/venue/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const seatmapId  = searchParams.get('seatmapId');
  const venueName  = searchParams.get('venueName');
  const stageSetup = searchParams.get('stageSetup');

  try {
    let rawSeatmap: Awaited<ReturnType<typeof fetchSeatmapById>> | null = null;

    // 1. Résolution directe par ID
    if (seatmapId) {
      rawSeatmap = await fetchSeatmapById(seatmapId);
    }

    // 2. Résolution par nom de venue
    if (!rawSeatmap && venueName) {
      rawSeatmap = await fetchSeatmapByVenueName(venueName, stageSetup ?? undefined);
    }

    if (!rawSeatmap) {
      return NextResponse.json({ seatmap: null });
    }

    // Transformer en ISeatmap
    const seatmap: ISeatmap = {
      id:                rawSeatmap.id,
      stageSetup:        rawSeatmap.stageSetup as ISeatmap['stageSetup'],
      configurationName: rawSeatmap.configurationName,
      viewboxWidth:      rawSeatmap.viewboxWidth,
      viewboxHeight:     rawSeatmap.viewboxHeight,
      sections:          [...rawSeatmap.sections]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((s): IVenueSection => ({
          section_id:  s.sectionCode,
          name:        s.officialName,
          category:    s.category as IVenueSection['category'],
          svg_path:    s.svgPath,
          fill_rule:   (s.fillRule === 'evenodd' ? 'evenodd' : 'nonzero') as 'nonzero' | 'evenodd',
          label_x:     s.labelX,
          label_y:     s.labelY,
          aliases:     s.aliases,
          capacity:    s.capacity ?? null,
        })),
    };

    return NextResponse.json({ seatmap });
  } catch (error) {
    console.error('[/api/venues/seatmap] Error:', error);
    return NextResponse.json({ seatmap: null }, { status: 500 });
  }
}

// ─── DB helpers ──────────────────────────────────────────────────────────────

const SECTION_SELECT = {
  id: true,
  sectionCode: true,
  officialName: true,
  category: true,
  svgPath: true,
  fillRule: true,
  labelX: true,
  labelY: true,
  aliases: true,
  capacity: true,
  sortOrder: true,
} as const;

const SEATMAP_SELECT = {
  id: true,
  stageSetup: true,
  configurationName: true,
  viewboxWidth: true,
  viewboxHeight: true,
  sections: { select: SECTION_SELECT },
} as const;

async function fetchSeatmapById(id: string) {
  return prisma.venueSeatmap.findUnique({
    where: { id },
    select: SEATMAP_SELECT,
  });
}

async function fetchSeatmapByVenueName(venueName: string, stageSetup?: string) {
  // Chercher le venue par nom (case-insensitive, starts-with)
  const venue = await prisma.venue.findFirst({
    where: {
      name: { contains: venueName, mode: 'insensitive' },
    },
    select: { id: true, name: true },
  });

  if (!venue) return null;

  // Chercher le seatmap correspondant
  return prisma.venueSeatmap.findFirst({
    where: {
      venueId: venue.id,
      ...(stageSetup ? { stageSetup: stageSetup as any } : { isDefault: true }),
    },
    select: SEATMAP_SELECT,
    orderBy: { isDefault: 'desc' },
  });
}
