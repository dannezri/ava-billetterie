/**
 * Ticket Reservation API
 * POST /api/tickets/reserve - Reserve a ticket for 15 minutes
 */

import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

/**
 * Calcule la date de libération du séquestre.
 * En test (ESCROW_RELEASE_HOURS=0) : libération immédiate (Date.now()).
 * En production : date événement + 2 jours (J+2 standard).
 */
function getEscrowReleaseDate(eventDate: Date): Date {
  const hoursEnv = process.env.ESCROW_RELEASE_HOURS;
  if (hoursEnv !== undefined && hoursEnv !== '') {
    const hours = parseFloat(hoursEnv);
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  return new Date(eventDate.getTime() + 2 * 24 * 60 * 60 * 1000);
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = createClient();
    const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Vous devez être connecté pour réserver un billet',
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticketId } = body;

    if (!ticketId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_TICKET_ID',
            message: 'ID du billet manquant',
          },
        },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur — upsert pour les comptes Supabase Auth sans record DB
    const user = await prisma.user.upsert({
      where: { email: supabaseUser.email! },
      update: {},
      create: {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.name ?? null,
      },
    });

    // Transaction atomique pour réserver le billet
    const result = await prisma.$transaction(async (tx) => {
      // 1. Vérifier que le billet est disponible
      const ticket = await tx.ticket.findUnique({
        where: { id: ticketId },
        include: {
          event: true,
          seller: true,
        },
      });

      if (!ticket) {
        throw new Error('Billet non trouvé');
      }

      if (ticket.status !== 'ACTIVE') {
        throw new Error('Ce billet n\'est plus disponible');
      }

      if (ticket.verificationStatus !== 'APPROVED') {
        throw new Error('Ce billet n\'a pas encore été vérifié');
      }

      // Vérifier que l'acheteur n'est pas le vendeur
      if (ticket.sellerId === user.id) {
        throw new Error('Vous ne pouvez pas acheter votre propre billet');
      }

      // 2. Mettre à jour le statut du billet à RESERVED avec expiration dans 15 min
      const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const updatedTicket = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: 'RESERVED',
          expiresAt: reservationExpiresAt,
        },
      });

      // 3. Calculer les montants
      const ticketPrice = Number(ticket.price);
      const platformFeeRate = 0.05; // 5%
      const platformFee = ticketPrice * platformFeeRate;
      const totalAmount = ticketPrice + platformFee;

      // 4. Créer la transaction
      const transaction = await tx.transaction.create({
        data: {
          ticketId: ticket.id,
          buyerId: user.id,
          sellerId: ticket.sellerId,
          amount: totalAmount,
          platformFee: platformFee,
          status: 'PENDING',
          // Date de libération du séquestre
          // En test (ESCROW_RELEASE_HOURS=0) : immédiatement après la vente
          // En production : date événement + 2 jours (J+2)
          escrowReleaseDate: getEscrowReleaseDate(ticket.event.eventDate),
        },
      });

      // 5. Créer un audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'TICKET_RESERVED',
          metadata: {
            ticketId: ticket.id,
            transactionId: transaction.id,
            amount: totalAmount,
          },
        },
      });

      return { transaction, ticket: updatedTicket };
    });

    // Programmer la libération automatique après 15 minutes
    // Note: En production, utilisez un job scheduler (Vercel Cron, AWS Lambda, etc.)
    // Pour l'instant, le frontend gérera le timer

    return NextResponse.json({
      success: true,
      data: {
        transactionId: result.transaction.id,
        ticketId: result.ticket.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        amount: result.transaction.amount,
      },
    });
  } catch (error: any) {
    console.error('Error reserving ticket:', error);

    // Conflit de réservation simultanée (contrainte unique ticket_id)
    if (error.code === 'P2002' && error.meta?.target?.includes('ticket_id')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_RESERVED',
            message: 'Ce billet vient d\'être réservé par un autre acheteur.',
          },
        },
        { status: 409 }
      );
    }

    // Erreur métier
    if (
      error.message?.includes('disponible') ||
      error.message?.includes('vérifié') ||
      error.message?.includes('propre billet')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RESERVATION_FAILED',
            message: error.message,
          },
        },
        { status: 400 }
      );
    }

    // Erreur serveur
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la réservation du billet',
        },
      },
      { status: 500 }
    );
  }
}

// Endpoint pour annuler une réservation (si timer expire)
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_TRANSACTION_ID' } },
        { status: 400 }
      );
    }

    // Transaction atomique pour annuler la réservation
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { ticket: true },
      });

      if (!transaction || transaction.status !== 'PENDING') {
        throw new Error('Transaction non trouvée ou déjà traitée');
      }

      // Remettre le billet en ACTIVE et effacer l'expiration
      await tx.ticket.update({
        where: { id: transaction.ticketId },
        data: { status: 'ACTIVE', expiresAt: null },
      });

      // Marquer la transaction comme annulée
      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: 'CANCELLED' },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'CANCELLATION_FAILED', message: error.message },
      },
      { status: 500 }
    );
  }
}
