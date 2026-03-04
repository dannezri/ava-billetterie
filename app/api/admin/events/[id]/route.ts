/**
 * API Admin: GET    /api/admin/events/[id]  → détail événement
 * API Admin: PATCH  /api/admin/events/[id]  → modifier événement
 * API Admin: DELETE /api/admin/events/[id]  → supprimer événement
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';
import { ArtistImageFetcherService } from '@/lib/services/artist-image-fetcher.service';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

async function assertAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) return null;
  return user;
}

const updateEventSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  artist: z.string().max(255).optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  description: z.string().max(5000).optional().or(z.literal('')),
  eventDate: z.string().optional(),
  doorsOpenTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  venue: z.string().min(2).max(255).optional(),
  city: z.string().min(2).max(100).optional(),
  country: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  officialUrl: z.string().url().optional().or(z.literal('')),
  isVerified: z.boolean().optional(),
});

interface RouteContext {
  params: { id: string };
}

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [event, auditLogs] = await Promise.all([
      prisma.event.findUnique({
        where: { id: params.id },
        include: {
          tickets: {
            select: {
              id: true,
              status: true,
              price: true,
              verificationStatus: true,
              seller: { select: { email: true } },
            },
          },
        },
      }),
      // Historique modifications de cet événement
      prisma.auditLog.findMany({
        where: {
          action: 'ADMIN_ACTION',
          metadata: { path: ['eventId'], equals: params.id },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ]);

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    const ticketStats = {
      total: event.tickets.length,
      active: event.tickets.filter((t) => t.status === 'ACTIVE').length,
      sold: event.tickets.filter((t) => t.status === 'SOLD').length,
      pending: event.tickets.filter((t) => t.status === 'PENDING_VALIDATION').length,
      reserved: event.tickets.filter((t) => t.status === 'RESERVED').length,
    };

    return NextResponse.json({
      event: { ...event, tickets: undefined },
      ticketStats,
      auditHistory: auditLogs,
    });
  } catch (error) {
    console.error('[API GET /admin/events/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Champs "critiques" dont la modification impacte directement les billets acheteurs
const CRITICAL_FIELDS = new Set(['eventDate', 'venue', 'city', 'country']);

function computeDiff(
  before: Record<string, any>,
  after: Record<string, any>
): Record<string, { from: string; to: string }> {
  const changes: Record<string, { from: string; to: string }> = {};
  for (const key of Object.keys(after)) {
    const prev = before[key] instanceof Date ? before[key].toISOString() : String(before[key] ?? '');
    const next = after[key] instanceof Date ? after[key].toISOString() : String(after[key] ?? '');
    if (prev !== next) changes[key] = { from: String(before[key] ?? ''), to: String(after[key] ?? '') };
  }
  return changes;
}

// ─── PATCH ───────────────────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const validated = updateEventSchema.parse(body);

    // Snapshot avant modification
    const currentEvent = await prisma.event.findUnique({ where: { id: params.id } });
    if (!currentEvent) return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });

    // Billet actifs impactés
    const ticketCount = await prisma.ticket.count({
      where: {
        eventId: params.id,
        status: { in: ['ACTIVE', 'RESERVED', 'PENDING_VALIDATION'] },
      },
    });

    const updateData: any = {};
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.artist !== undefined) updateData.artist = validated.artist || null;
    if (validated.category !== undefined) updateData.category = validated.category || null;
    if (validated.description !== undefined) updateData.description = validated.description || null;
    if (validated.eventDate !== undefined) updateData.eventDate = new Date(validated.eventDate);
    if (validated.doorsOpenTime !== undefined) updateData.doorsOpenTime = validated.doorsOpenTime || null;
    if (validated.venue !== undefined) updateData.venue = validated.venue;
    if (validated.city !== undefined) updateData.city = validated.city;
    if (validated.country !== undefined) updateData.country = validated.country;
    if (validated.imageUrl !== undefined) updateData.imageUrl = validated.imageUrl || null;
    if (validated.officialUrl !== undefined) updateData.officialUrl = validated.officialUrl || null;
    if (validated.isVerified !== undefined) updateData.isVerified = validated.isVerified;

    // ── Auto-récupération image si absente en DB et non fournie dans le formulaire ──
    // Condition : pas d'image dans le formulaire ET pas d'image dans la DB actuelle.
    // Non-bloquant : l'événement est mis à jour sans image si le fetch échoue.

    let imageAutoFetched = false;
    const artistForFetch = validated.artist ?? currentEvent.artist;

    if (!updateData.imageUrl && !currentEvent.imageUrl && artistForFetch) {
      console.log(`[PATCH /api/admin/events/${params.id}] Auto-fetch image pour: "${artistForFetch}"`);
      try {
        const imageResult = await ArtistImageFetcherService.fetchArtistImage(artistForFetch);
        if (imageResult) {
          updateData.imageUrl = await ArtistImageFetcherService.uploadToUploadcare(
            imageResult.url,
            artistForFetch
          );
          imageAutoFetched = true;
          console.log(`[PATCH /api/admin/events/${params.id}] Image auto-récupérée (${imageResult.source}): ${updateData.imageUrl}`);
        }
      } catch (imageErr) {
        console.error('[PATCH /api/admin/events/[id]] Auto-fetch image failed (non-blocking):', imageErr);
      }
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: updateData,
    });

    // Diff précis des champs modifiés
    const changes = computeDiff(currentEvent as any, updateData);
    const criticalChanges = Object.keys(changes).filter((k) => CRITICAL_FIELDS.has(k));

    // Audit log enrichi
    try {
      await prisma.auditLog.create({
        data: {
          userId: null,
          action: 'ADMIN_ACTION',
          metadata: {
            action: 'EVENT_UPDATED',
            eventId: event.id,
            eventTitle: event.title,
            adminEmail: user.email,
            affectedTickets: ticketCount,
            changes,
            criticalChanges,
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    } catch (auditErr) {
      console.error('[PATCH /admin/events/[id]] Audit log failed (non-blocking):', auditErr);
    }

    return NextResponse.json({
      event,
      imageAutoFetched,
      warning:
        ticketCount > 0 && criticalChanges.length > 0
          ? `${ticketCount} billet(s) impacté(s) par le changement de ${criticalChanges.join(', ')}.`
          : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation échouée', details: error.errors },
        { status: 400 }
      );
    }
    console.error('[API PATCH /admin/events/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Vérifier tickets actifs avant suppression
    const activeTickets = await prisma.ticket.count({
      where: {
        eventId: params.id,
        status: { in: ['ACTIVE', 'RESERVED', 'SOLD'] },
      },
    });

    if (activeTickets > 0) {
      return NextResponse.json(
        {
          error: `Impossible de supprimer : ${activeTickets} billet(s) actif(s) ou vendu(s) existent pour cet événement.`,
        },
        { status: 409 }
      );
    }

    await prisma.event.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        userId: null,
        action: 'ADMIN_ACTION',
        metadata: {
          action: 'EVENT_DELETED',
          eventId: params.id,
          adminEmail: user.email,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API DELETE /admin/events/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
