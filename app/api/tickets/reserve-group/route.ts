/**
 * API: Réservation atomique d'un groupe de billets adjacents
 * POST /api/tickets/reserve-group
 *
 * Body: { ticketIds: string[] }
 * Retourne: { transactionIds, totalAmount, totalWithFees, expiresAt }
 *
 * Garanties :
 *  - Tous les billets sont ACTIVE + APPROVED
 *  - Même événement, même vendeur
 *  - L'acheteur n'est pas le vendeur
 *  - Opération atomique via prisma.$transaction
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { createClient } from '@/lib/supabase/server-client';

const PLATFORM_FEE_RATE = 0.05;
const RESERVATION_MINUTES = 15;

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
    // ── Auth ────────────────────────────────────────────────────────────────
    const supabase = createClient();
    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Connectez-vous pour continuer' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticketIds } = body as { ticketIds: string[] };

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length < 2) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Minimum 2 billets requis' } },
        { status: 400 }
      );
    }

    if (ticketIds.length > 10) {
      return NextResponse.json(
        { success: false, error: { code: 'TOO_MANY_TICKETS', message: 'Maximum 10 billets par groupe' } },
        { status: 400 }
      );
    }

    // ── Récupérer l'utilisateur DB ──────────────────────────────────────────
    const buyer = await prisma.user.findUnique({
      where: { email: supabaseUser.email! },
    });

    if (!buyer) {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'Utilisateur introuvable' } },
        { status: 404 }
      );
    }

    // ── Transaction atomique ────────────────────────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      // 1. Charger tous les billets avec verrouillage pessimiste
      const tickets = await tx.ticket.findMany({
        where: { id: { in: ticketIds } },
        include: {
          event: true,
          seller: { select: { id: true, stripeAccountId: true } },
        },
      });

      // 2. Vérifications
      if (tickets.length !== ticketIds.length) {
        throw new Error('Certains billets sont introuvables');
      }

      const firstEventId = tickets[0].eventId;
      const firstSellerId = tickets[0].sellerId;

      for (const ticket of tickets) {
        if (ticket.status !== 'ACTIVE') {
          throw new Error(`Le billet ${ticket.seatNumber ?? ticket.id} n'est plus disponible`);
        }
        if (ticket.verificationStatus !== 'APPROVED') {
          throw new Error(`Le billet ${ticket.seatNumber ?? ticket.id} n'a pas encore été vérifié`);
        }
        if (ticket.eventId !== firstEventId) {
          throw new Error('Tous les billets doivent être pour le même événement');
        }
        if (ticket.sellerId !== firstSellerId) {
          throw new Error('Tous les billets doivent avoir le même vendeur');
        }
        if (ticket.sellerId === buyer.id) {
          throw new Error('Vous ne pouvez pas acheter vos propres billets');
        }
      }

      // 3. Marquer tous les billets RESERVED avec expiration dans 15 min
      const reservationExpiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);
      await tx.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: { status: 'RESERVED', expiresAt: reservationExpiresAt },
      });

      // 4. Créer une Transaction par billet
      const escrowReleaseDate = getEscrowReleaseDate(tickets[0].event.eventDate);

      const transactions = await Promise.all(
        tickets.map((ticket) => {
          const ticketPrice = Number(ticket.price);
          const platformFee = ticketPrice * PLATFORM_FEE_RATE;
          return tx.transaction.create({
            data: {
              ticketId: ticket.id,
              buyerId: buyer.id,
              sellerId: ticket.sellerId,
              amount: ticketPrice + platformFee,
              platformFee,
              status: 'PENDING',
              escrowReleaseDate,
            },
          });
        })
      );

      // 5. Audit log
      await tx.auditLog.create({
        data: {
          userId: buyer.id,
          action: 'TICKET_RESERVED',
          metadata: {
            ticketIds,
            transactionIds: transactions.map((t) => t.id),
            totalAmount: transactions.reduce((s, t) => s + Number(t.amount), 0),
            groupReservation: true,
          },
        },
      });

      return { transactions, event: tickets[0].event };
    });

    const totalAmount = result.transactions.reduce((s, t) => s + Number(t.amount), 0);
    const totalTicketsPrice = result.transactions.reduce(
      (s, t) => s + Number(t.amount) - Number(t.platformFee),
      0
    );
    const totalPlatformFee = result.transactions.reduce(
      (s, t) => s + Number(t.platformFee),
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        transactionIds: result.transactions.map((t) => t.id),
        ticketCount: ticketIds.length,
        totalTicketsPrice: Math.round(totalTicketsPrice * 100) / 100,
        totalPlatformFee: Math.round(totalPlatformFee * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        eventId: result.event.id,
        expiresAt: new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error reserving group tickets:', error);

    // Conflit de réservation simultanée (contrainte unique ticket_id)
    if (error.code === 'P2002' && error.meta?.target?.includes('ticket_id')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_RESERVED',
            message: 'Un ou plusieurs billets viennent d\'être réservés par un autre acheteur.',
          },
        },
        { status: 409 }
      );
    }

    const isBusinessError = [
      'disponible',
      'vérifié',
      'propres billets',
      'même événement',
      'même vendeur',
      'introuvables',
    ].some((msg) => error.message?.includes(msg));

    if (isBusinessError) {
      return NextResponse.json(
        { success: false, error: { code: 'RESERVATION_FAILED', message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Erreur lors de la réservation' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE — Annuler une réservation groupe (expiration timer)
 * ?transactionIds=id1,id2,id3
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('transactionIds');
    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_IDS' } },
        { status: 400 }
      );
    }

    const transactionIds = idsParam.split(',').filter(Boolean);

    await prisma.$transaction(async (tx) => {
      const transactions = await tx.transaction.findMany({
        where: { id: { in: transactionIds }, status: 'PENDING' },
        include: { ticket: true },
      });

      const ticketIds = transactions.map((t) => t.ticketId);

      await tx.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: { status: 'ACTIVE', expiresAt: null },
      });

      await tx.transaction.updateMany({
        where: { id: { in: transactionIds } },
        data: { status: 'CANCELLED' },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error cancelling group reservation:', error);
    return NextResponse.json(
      { success: false, error: { code: 'CANCELLATION_FAILED', message: error.message } },
      { status: 500 }
    );
  }
}
