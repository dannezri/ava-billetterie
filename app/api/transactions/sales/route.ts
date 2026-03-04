/**
 * GET /api/transactions/sales
 *
 * Retourne l'historique des ventes du vendeur connecté.
 * Inclut le statut du virement automatique (autoPayoutStatus) par transaction.
 *
 * Remplace l'ancien système de solde/retrait manuel.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const sellerId = dbUser.id;

    const sales = await prisma.transaction.findMany({
      where: {
        sellerId,
        status: { in: ['COMPLETED', 'ESCROWED', 'RELEASED', 'DISPUTED'] },
      },
      include: {
        ticket: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                artist: true,
                venue: true,
                city: true,
                eventDate: true,
              },
            },
          },
        },
        buyer: {
          select: { name: true, email: true },
        },
        dispute: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Stats globales
    const paid = sales.filter((t) => t.autoPayoutStatus === 'COMPLETED');
    const pending = sales.filter(
      (t) => t.autoPayoutStatus === 'PENDING' || t.autoPayoutStatus === 'PROCESSING'
    );
    const actionRequired = sales.filter((t) => t.autoPayoutStatus === 'MANUAL_REVIEW');

    const totalRevenue = sales.reduce(
      (acc, t) => acc + (Number(t.amount) - Number(t.platformFee)),
      0
    );
    const paidRevenue = paid.reduce(
      (acc, t) => acc + (Number(t.amount) - Number(t.platformFee)),
      0
    );
    const pendingRevenue = pending.reduce(
      (acc, t) => acc + (Number(t.amount) - Number(t.platformFee)),
      0
    );

    return NextResponse.json({
      stats: {
        totalSales: sales.length,
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        paidCount: paid.length,
        pendingCount: pending.length,
        actionRequiredCount: actionRequired.length,
      },
      transactions: sales.map((t) => ({
        id: t.id,
        status: t.status,
        autoPayoutStatus: t.autoPayoutStatus,
        autoPayoutDate: t.autoPayoutDate,
        autoPayoutError: t.autoPayoutError,
        manualReview: t.manualReview,
        amount: Number(t.amount),
        platformFee: Number(t.platformFee),
        netAmount: Number(t.amount) - Number(t.platformFee),
        escrowReleaseDate: t.escrowReleaseDate,
        createdAt: t.createdAt,
        event: {
          id: t.ticket.event.id,
          title: t.ticket.event.title,
          artist: t.ticket.event.artist,
          venue: t.ticket.event.venue,
          city: t.ticket.event.city,
          eventDate: t.ticket.event.eventDate,
        },
        buyer: {
          name: t.buyer.name,
          email: t.buyer.email,
        },
        dispute: t.dispute ? { status: t.dispute.status } : null,
      })),
    });
  } catch (error) {
    console.error('[GET /api/transactions/sales]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
