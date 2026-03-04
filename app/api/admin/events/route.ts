/**
 * API Admin: GET /api/admin/events   → liste paginée avec stats
 * API Admin: POST /api/admin/events  → créer un événement (avec auto-fetch image artiste)
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

// ─── Schéma création ────────────────────────────────────────────────────────

const createEventSchema = z.object({
  title: z.string().min(3, 'Titre trop court').max(255),
  artist: z.string().max(255).optional(),
  category: z.string().optional(),
  description: z.string().max(5000).optional(),
  eventDate: z.string().min(1, 'Date requise'),
  doorsOpenTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  venue: z.string().min(2, 'Salle requise').max(255),
  city: z.string().min(2, 'Ville requise').max(100),
  country: z.string().default('France'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  officialUrl: z.string().url().optional().or(z.literal('')),
  isVerified: z.boolean().default(true),
});

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const city = searchParams.get('city');
    const verified = searchParams.get('verified');
    const category = searchParams.get('category');
    const dateRange = searchParams.get('dateRange'); // 'all' | 'upcoming' | 'past'
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;
    const now = new Date();

    // WHERE clause
    const where: any = {};
    if (city) where.city = city;
    if (verified !== null && verified !== '') where.isVerified = verified === 'true';
    if (category) where.category = category;
    if (dateRange === 'upcoming') where.eventDate = { gte: now };
    if (dateRange === 'past') where.eventDate = { lt: now };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [events, total, statsVerified, ticketsTotal, upcomingCount, pastCount, rawCities, rawCategories] =
      await Promise.all([
        prisma.event.findMany({
          where,
          select: {
            id: true,
            title: true,
            artist: true,
            venue: true,
            city: true,
            country: true,
            eventDate: true,
            category: true,
            imageUrl: true,
            isVerified: true,
            createdAt: true,
            tickets: {
              select: {
                status: true,
                transaction: {
                  select: { amount: true, status: true },
                },
              },
            },
          },
          orderBy: { eventDate: 'desc' },
          skip,
          take: limit,
        }),
        prisma.event.count({ where }),
        prisma.event.count({ where: { isVerified: true } }),
        prisma.ticket.count(),
        prisma.event.count({ where: { eventDate: { gte: now } } }),
        prisma.event.count({ where: { eventDate: { lt: now } } }),
        // Villes distinctes (pour le select)
        prisma.event.findMany({
          select: { city: true },
          distinct: ['city'],
          orderBy: { city: 'asc' },
        }),
        // Catégories distinctes (pour le select)
        prisma.event.findMany({
          select: { category: true },
          distinct: ['category'],
          where: { category: { not: null } },
          orderBy: { category: 'asc' },
        }),
      ]);

    // Calcul stats par événement
    const eventsWithStats = events.map((event) => {
      const ticketsAvailable = event.tickets.filter(
        (t) => t.status === 'ACTIVE'
      ).length;
      const ticketsSold = event.tickets.filter((t) => t.status === 'SOLD').length;
      const gmv = event.tickets.reduce((acc, t) => {
        if (
          t.transaction &&
          ['ESCROWED', 'RELEASED', 'DISPUTED'].includes(t.transaction.status)
        ) {
          return acc + Number(t.transaction.amount);
        }
        return acc;
      }, 0);

      return {
        id: event.id,
        title: event.title,
        artist: event.artist,
        venue: event.venue,
        city: event.city,
        country: event.country,
        eventDate: event.eventDate,
        category: event.category,
        imageUrl: event.imageUrl,
        isVerified: event.isVerified,
        createdAt: event.createdAt,
        ticketsAvailable,
        ticketsSold,
        gmv,
      };
    });

    const cities = rawCities.map((r) => r.city).filter(Boolean) as string[];
    const categories = rawCategories.map((r) => r.category).filter(Boolean) as string[];

    return NextResponse.json({
      events: eventsWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        verified: statsVerified,
        unverified: total - statsVerified,
        ticketsTotal,
        upcoming: upcomingCount,
        past: pastCount,
      },
      meta: { cities, categories },
    });
  } catch (error) {
    console.error('[API GET /admin/events]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const validated = createEventSchema.parse(body);

    // ── Auto-récupération image artiste ──────────────────────────────────────
    // Si l'admin n'a pas fourni d'image et qu'un artiste est renseigné,
    // on tente de récupérer une image officielle depuis les APIs externes.
    // L'échec n'est jamais bloquant : l'événement est créé sans image plutôt que de fail.

    let finalImageUrl: string | null = validated.imageUrl || null;
    let imageAutoFetched = false;

    if (!finalImageUrl && validated.artist) {
      console.log(`[POST /api/admin/events] Auto-fetch image pour: "${validated.artist}"`);
      try {
        const imageResult = await ArtistImageFetcherService.fetchArtistImage(validated.artist);

        if (imageResult) {
          finalImageUrl = await ArtistImageFetcherService.uploadToUploadcare(
            imageResult.url,
            validated.artist
          );
          imageAutoFetched = true;
          console.log(
            `[POST /api/admin/events] Image auto-récupérée (${imageResult.source}): ${finalImageUrl}`
          );
        }
      } catch (imageErr) {
        // Non-bloquant — on continue sans image
        console.error('[POST /api/admin/events] Auto-fetch image failed (non-blocking):', imageErr);
      }
    }

    // ── Création événement ────────────────────────────────────────────────────

    const event = await prisma.event.create({
      data: {
        title: validated.title,
        artist: validated.artist || null,
        category: validated.category || null,
        description: validated.description || null,
        eventDate: new Date(validated.eventDate),
        doorsOpenTime: validated.doorsOpenTime || null,
        venue: validated.venue,
        city: validated.city,
        country: validated.country,
        imageUrl: finalImageUrl,
        officialUrl: validated.officialUrl || null,
        isVerified: validated.isVerified,
      },
    });

    // Audit log — utiliser des valeurs de fallback pour les colonnes NOT NULL
    try {
      await prisma.auditLog.create({
        data: {
          userId: null,
          action: 'ADMIN_ACTION',
          metadata: {
            action: 'EVENT_CREATED',
            eventId: event.id,
            eventTitle: event.title,
            adminEmail: user.email,
            imageAutoFetched,
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    } catch (auditErr: any) {
      // Ne pas bloquer la réponse si l'audit log échoue
      console.error('[POST /api/admin/events] Audit log failed (non-blocking):', auditErr);
    }

    return NextResponse.json({ event, imageAutoFetched }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation échouée', details: error.errors },
        { status: 400 }
      );
    }
    console.error('[API POST /admin/events]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
