/**
 * API Route: GET /api/search
 * Recherche globale (événements, artistes, villes)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { searchQuerySchema } from '@/lib/validations/event.validation';
import * as EventService from '@/lib/services/event.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Construction de l'objet params
    const rawParams = {
      q: searchParams.get('q') || '',
      type: searchParams.get('type') || 'all',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    // Validation avec Zod
    const validatedParams = searchQuerySchema.parse(rawParams);

    // Appel au service
    const result = await EventService.searchGlobal({
      query: validatedParams.q,
      type: validatedParams.type,
      page: validatedParams.page,
      limit: validatedParams.limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
