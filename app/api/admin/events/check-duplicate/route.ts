/**
 * API Admin: POST /api/admin/events/check-duplicate
 * Vérifie si un événement similaire existe (même artiste + ville + date ±1 jour)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';

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

export async function POST(request: NextRequest) {
  try {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { artist, city, eventDate, excludeId } = body;

    if (!artist || !city || !eventDate) {
      return NextResponse.json(
        { error: 'artist, city et eventDate sont requis' },
        { status: 400 }
      );
    }

    const date = new Date(eventDate);
    const dayBefore = new Date(date);
    dayBefore.setDate(dayBefore.getDate() - 1);
    const dayAfter = new Date(date);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const duplicate = await prisma.event.findFirst({
      where: {
        artist: { equals: artist, mode: 'insensitive' },
        city: { equals: city, mode: 'insensitive' },
        eventDate: { gte: dayBefore, lte: dayAfter },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: {
        id: true,
        title: true,
        artist: true,
        venue: true,
        city: true,
        eventDate: true,
        isVerified: true,
      },
    });

    return NextResponse.json({ duplicate: duplicate || null });
  } catch (error) {
    console.error('[API POST /admin/events/check-duplicate]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
