/**
 * API Route: GET /api/tickets/[id]
 * Récupère un billet par ID avec vendeur et event
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ticketIdSchema } from '@/lib/validations/event.validation';
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
    const validatedParams = ticketIdSchema.parse({ ticketId: params.id });

    // Appel au service
    const result = await EventService.getTicketById(validatedParams.ticketId);

    if (!result) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Vérifier que le billet est bien actif
    if (result.ticket.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Ticket is not available' },
        { status: 410 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid ticket ID', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
