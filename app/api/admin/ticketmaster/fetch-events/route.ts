/**
 * POST /api/admin/ticketmaster/fetch-events
 * Récupère les événements Ticketmaster FR + détecte les doublons en DB
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { TicketmasterService } from '@/lib/services/ticketmaster.service';
import { DuplicateDetectionService } from '@/lib/services/duplicate-detection.service';

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

    console.log('[fetch-events] Fetching Ticketmaster events for FR/Music...');

    // 1. Récupérer les événements depuis Ticketmaster
    const tmEvents = await TicketmasterService.fetchTopEvents({
      country: 'FR',
      size: 50,
      classification: 'Music',
    });

    console.log(`[fetch-events] ${tmEvents.length} events received from Ticketmaster`);

    // 2. Détection doublons pour chaque événement (en parallèle par batch de 10)
    const BATCH_SIZE = 10;
    const eventsWithStatus: any[] = [];

    for (let i = 0; i < tmEvents.length; i += BATCH_SIZE) {
      const batch = tmEvents.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (tmEvent) => {
          const check = await DuplicateDetectionService.checkDuplicate({
            title: tmEvent.title,
            artist: tmEvent.artist,
            event_date: new Date(tmEvent.event_date),
            city: tmEvent.city,
          });
          return { ...tmEvent, status: check.status, duplicate_reason: check.reason };
        })
      );
      eventsWithStatus.push(...results);
    }

    // 3. Statistiques
    const stats = {
      total: eventsWithStatus.length,
      new: eventsWithStatus.filter((e) => e.status === 'new').length,
      duplicates: eventsWithStatus.filter((e) => e.status === 'duplicate').length,
      exists: eventsWithStatus.filter((e) => e.status === 'exists').length,
    };

    console.log('[fetch-events] Stats:', stats);

    return NextResponse.json({ events: eventsWithStatus, stats });
  } catch (error: any) {
    console.error('[fetch-events] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur récupération Ticketmaster' },
      { status: 500 }
    );
  }
}
