/**
 * API Route: GET /api/events
 * Récupère la liste des événements avec filtres et pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eventFiltersSchema } from '@/lib/validations/event.validation';
import * as EventService from '@/lib/services/event.service';
import { releaseExpiredReservations } from '@/lib/services/cleanup.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Construction de l'objet params depuis searchParams
    const rawParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '12',
      sort: searchParams.get('sort') || 'relevance',
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      cities: searchParams.get('cities') || undefined,
      categories: searchParams.get('categories') || undefined,
      artists: searchParams.get('artists') || undefined,
      priceMin: searchParams.get('priceMin') || undefined,
      priceMax: searchParams.get('priceMax') || undefined,
    };

    // Validation avec Zod
    const validatedParams = eventFiltersSchema.parse(rawParams);

    // Transformation des strings comma-separated en arrays
    const filters = {
      ...validatedParams,
      cities: validatedParams.cities
        ? validatedParams.cities.split(',').filter(Boolean)
        : undefined,
      categories: validatedParams.categories
        ? validatedParams.categories.split(',').filter(Boolean)
        : undefined,
    };

    // Nettoyage fire-and-forget des réservations expirées
    // (le cron Vercel prend le relais en production toutes les minutes)
    releaseExpiredReservations().catch(() => {});

    // Appel au service
    const result = await EventService.getEvents(filters);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
