/**
 * GET /api/cart/pending
 * Retourne toutes les transactions PENDING de l'utilisateur connecté,
 * avec les données nécessaires pour reconstruire le panier côté client.
 */

import prisma from '@/lib/db/prisma';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user: supabaseUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !supabaseUser) {
      // Non authentifié → panier vide, pas d'erreur
      return NextResponse.json({ success: true, items: [] });
    }

    // Résoudre l'id DB de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: supabaseUser.email! },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ success: true, items: [] });
    }

    // Récupérer toutes les transactions PENDING avec les données ticket + event
    const transactions = await prisma.transaction.findMany({
      where: {
        buyerId: user.id,
        status: 'PENDING',
      },
      include: {
        ticket: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                eventDate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Ne garder que ceux dont le billet est encore RESERVED et non expiré
    const now = new Date();
    const valid = transactions.filter(
      (t) =>
        t.ticket.status === 'RESERVED' &&
        t.ticket.expiresAt !== null &&
        t.ticket.expiresAt > now,
    );

    const items = valid.map((t) => ({
      transactionId: t.id,
      ticketId: t.ticket.id,
      groupId: t.ticket.groupId ?? null,
      expiresAt: t.ticket.expiresAt!.toISOString(),
      amount: Number(t.amount), // total TTC (avec frais)
      eventId: t.ticket.event.id,
      eventTitle: t.ticket.event.title,
      eventDate: t.ticket.event.eventDate.toISOString(),
      section: t.ticket.section ?? null,
      seatNumber: t.ticket.seatNumber ?? null,
    }));

    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error('[GET /api/cart/pending]', err);
    return NextResponse.json({ success: true, items: [] });
  }
}
