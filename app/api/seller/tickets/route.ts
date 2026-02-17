import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/seller/tickets
 * Récupère tous les billets du vendeur connecté
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // 2. Récupérer l'utilisateur depuis la DB
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // 3. Récupérer les billets du vendeur
    const tickets = await prisma.ticket.findMany({
      where: {
        sellerId: dbUser.id,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            eventDate: true,
            venue: true,
            city: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 4. Formater les données pour le frontend
    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      eventId: ticket.eventId,
      eventName: ticket.event.title,
      eventDate: ticket.event.eventDate,
      venue: ticket.event.venue,
      city: ticket.event.city,
      category: ticket.event.category,
      price: Number(ticket.price),
      originalPrice: ticket.originalPrice ? Number(ticket.originalPrice) : null,
      section: ticket.section,
      row: ticket.row,
      seatNumber: ticket.seatNumber,
      status: ticket.status,
      verificationStatus: ticket.verificationStatus,
      rejectionReason: ticket.rejectionReason,
      pdfUrl: ticket.pdfUrl,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }));

    return NextResponse.json({
      tickets: formattedTickets,
      total: formattedTickets.length,
    });

  } catch (error) {
    console.error('❌ Error fetching seller tickets:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des billets' },
      { status: 500 }
    );
  }
}
