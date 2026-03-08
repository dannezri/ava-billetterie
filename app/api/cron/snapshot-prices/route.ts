/**
 * Cron job — snapshot quotidien des prix par section
 *
 * Déclenchement : Vercel Cron (vercel.json) ou appel HTTP protégé
 *   GET /api/cron/snapshot-prices
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Fréquence recommandée : 1×/jour (00:00 UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveSectionId, FALLBACK_SECTIONS } from '@/components/venue/venue-sections-config';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  // Auth guard
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Avoid duplicate snapshots for today
    const alreadyRan = await prisma.priceHistory.findFirst({
      where: { snapshotDate: { gte: today } },
      select: { id: true },
    });
    if (alreadyRan) {
      return NextResponse.json({ message: 'Snapshot already taken today', skipped: true });
    }

    // All future events with active tickets
    const events = await prisma.event.findMany({
      where: { eventDate: { gte: new Date() } },
      select: {
        id: true,
        venue: true,
        seatmapId: true,
        tickets: {
          where: { status: 'ACTIVE', verificationStatus: 'APPROVED' },
          select: { section: true, price: true },
        },
      },
    });

    let totalSnapshots = 0;

    for (const event of events) {
      if (event.tickets.length === 0) continue;

      // Resolve seatmap sections for this event
      let sections = FALLBACK_SECTIONS;
      if (event.seatmapId) {
        const sm = await prisma.venueSeatmap.findUnique({
          where: { id: event.seatmapId },
          select: { sections: { select: { sectionCode: true, officialName: true, aliases: true } } },
        });
        if (sm) {
          sections = sm.sections.map((s) => ({
            section_id: s.sectionCode,
            name: s.officialName,
            category: 'LOWER_TIER' as const,
            svg_path: '',
            fill_rule: 'nonzero' as const,
            label_x: 0,
            label_y: 0,
            aliases: s.aliases,
          }));
        }
      }

      // Group prices by resolved section code
      const bySection = new Map<string, number[]>();
      for (const ticket of event.tickets) {
        const code = resolveSectionId(ticket.section, sections);
        if (!code) continue;
        const arr = bySection.get(code) ?? [];
        arr.push(Number(ticket.price));
        bySection.set(code, arr);
      }

      // Insert snapshots
      const rows = Array.from(bySection.entries()).map(([sectionCode, prices]) => ({
        eventId:      event.id,
        sectionCode,
        minPrice:     Math.min(...prices),
        maxPrice:     Math.max(...prices),
        avgPrice:     prices.reduce((a, b) => a + b, 0) / prices.length,
        ticketsCount: prices.length,
        snapshotDate: today,
      }));

      if (rows.length > 0) {
        await prisma.priceHistory.createMany({ data: rows, skipDuplicates: true });
        totalSnapshots += rows.length;
      }
    }

    return NextResponse.json({
      success: true,
      events:    events.length,
      snapshots: totalSnapshots,
      date:      today.toISOString(),
    });
  } catch (err) {
    console.error('[cron/snapshot-prices]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
