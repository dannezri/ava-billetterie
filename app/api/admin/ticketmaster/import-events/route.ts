/**
 * POST /api/admin/ticketmaster/import-events
 * Importe les événements Ticketmaster sélectionnés en base de données
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';
import { ArtistImageFetcherService } from '@/lib/services/artist-image-fetcher.service';
import type { ITicketmasterEvent } from '@/lib/services/ticketmaster.service';

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

    const { events } = (await request.json()) as { events: ITicketmasterEvent[] };

    if (!events || events.length === 0) {
      return NextResponse.json({ error: 'Aucun événement à importer' }, { status: 400 });
    }

    console.log(`[import-events] Importing ${events.length} events...`);

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const tmEvent of events) {
      try {
        // Auto-récupération image artiste si pas d'image Ticketmaster
        let finalImageUrl: string | null = tmEvent.image_url || null;

        if (!finalImageUrl && tmEvent.artist && tmEvent.artist !== 'Artiste inconnu') {
          try {
            const imageResult = await ArtistImageFetcherService.fetchArtistImage(tmEvent.artist);
            if (imageResult) {
              finalImageUrl = await ArtistImageFetcherService.uploadToUploadcare(
                imageResult.url,
                tmEvent.artist
              );
              console.log(`[import-events] Image auto-fetched for "${tmEvent.artist}" (${imageResult.source})`);
            }
          } catch (imgErr) {
            console.warn(`[import-events] Image fetch failed for "${tmEvent.artist}" (non-blocking):`, imgErr);
          }
        }

        // Création de l'événement
        await prisma.event.create({
          data: {
            title: tmEvent.title,
            artist: tmEvent.artist || null,
            category: tmEvent.category || null,
            eventDate: new Date(tmEvent.event_date),
            doorsOpenTime: tmEvent.doors_open_time || null,
            venue: tmEvent.venue,
            city: tmEvent.city,
            country: 'France',
            imageUrl: finalImageUrl,
            officialUrl: tmEvent.official_url || null,
            isVerified: true,
          },
        });

        imported++;
        console.log(`[import-events] ✅ Imported: "${tmEvent.title}"`);
      } catch (err: any) {
        failed++;
        errors.push(`"${tmEvent.title}": ${err.message}`);
        console.error(`[import-events] ❌ Failed: "${tmEvent.title}"`, err);
      }
    }

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          userId: null,
          action: 'ADMIN_ACTION',
          metadata: {
            action: 'TICKETMASTER_IMPORT',
            imported,
            failed,
            total: events.length,
            adminEmail: user.email,
            errors: errors.slice(0, 10), // Limiter le payload
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    } catch (auditErr) {
      console.error('[import-events] Audit log failed (non-blocking):', auditErr);
    }

    console.log(`[import-events] Done: ${imported} imported, ${failed} failed`);

    return NextResponse.json({ imported, failed, errors: errors.slice(0, 5) });
  } catch (error: any) {
    console.error('[import-events] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur import' },
      { status: 500 }
    );
  }
}
