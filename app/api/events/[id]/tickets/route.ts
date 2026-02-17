/**
 * GET /api/events/[id]/tickets
 * Récupère tous les billets disponibles pour un événement
 */

import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    // Vérifier que l'événement existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les billets actifs et vérifiés
    const tickets = await prisma.ticket.findMany({
      where: {
        eventId,
        status: 'ACTIVE',
        verificationStatus: 'APPROVED',
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            trustScore: true,
          },
        },
      },
      orderBy: {
        price: 'asc',
      },
    });

    // Formater les données pour le frontend
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      price: Number(ticket.price),
      originalPrice: ticket.originalPrice ? Number(ticket.originalPrice) : undefined,
      section: ticket.section || undefined,
      row: ticket.row || undefined,
      seatNumber: ticket.seatNumber || undefined,
      verificationStatus: ticket.verificationStatus,
      seller: {
        id: ticket.seller.id,
        name: ticket.seller.name || undefined,
        email: ticket.seller.email,
        trustScore: ticket.seller.trustScore,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedTickets,
    });
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Erreur lors de la récupération des billets',
        },
      },
      { status: 500 }
    );
  }
}
