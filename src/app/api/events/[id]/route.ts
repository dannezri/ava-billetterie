/**
 * API Route: GET /api/events/[id]
 * Récupère un événement par ID avec tickets et stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eventIdSchema } from '@/lib/validations/event.validation';
import * as EventService from '@/lib/services/event.service';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Validation de l'ID
    const validatedParams = eventIdSchema.parse({ id: params.id });

    // Appel au service
    const result = await EventService.getEventById(validatedParams.id);

    if (!result) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event ID', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
