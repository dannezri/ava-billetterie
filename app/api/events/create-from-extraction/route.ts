/**
 * POST /api/events/create-from-extraction
 *
 * Crée un événement non vérifié à partir des données extraites du PDF.
 * L'événement sera visible côté admin (is_verified = false) pour validation.
 * Accessible à tout utilisateur authentifié.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server-client';
import prisma from '@/lib/db/prisma';

const createEventSchema = z.object({
  title:         z.string().min(2, 'Titre requis').max(255),
  artist:        z.string().max(255).optional().nullable(),
  category:      z.string().max(100).optional().nullable(),
  eventDate:     z.string().datetime('Date invalide'),
  doorsOpenTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM').optional().nullable(),
  venue:         z.string().max(255).optional().nullable(),
  city:          z.string().max(100).optional().nullable(),
  country:       z.string().max(100).optional().nullable(),
});

export async function POST(request: NextRequest) {
  // Auth
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { title, artist, category, eventDate, doorsOpenTime, venue, city, country } = parsed.data;

    const event = await prisma.event.create({
      data: {
        title,
        artist:        artist        ?? null,
        category:      category      ?? null,
        doorsOpenTime: doorsOpenTime ?? null,
        venue:         venue         ?? 'À définir',
        city:          city          ?? 'À définir',
        country:       country       ?? 'France',
        eventDate:     new Date(eventDate),
        isVerified:    false, // Validation admin requise
      },
      select: {
        id: true,
        title: true,
        artist: true,
        category: true,
        doorsOpenTime: true,
        venue: true,
        city: true,
        country: true,
        eventDate: true,
        isVerified: true,
        createdAt: true,
      },
    });

    console.log(`[Events] Nouvel événement créé depuis extraction PDF — id: ${event.id}, titre: "${event.title}", par user: ${user.id}`);

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error: any) {
    console.error('[Events] Erreur création depuis extraction:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 },
    );
  }
}
