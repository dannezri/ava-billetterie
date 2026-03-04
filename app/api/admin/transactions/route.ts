import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const escrowOnly = searchParams.get('escrow') === 'true';
    const failedOnly = searchParams.get('failed') === 'true';
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (status) where.status = status;
    if (escrowOnly) where.status = 'ESCROWED';
    if (failedOnly) where.status = 'PENDING'; // Les PENDING sans paiement Stripe
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { stripePaymentIntentId: { contains: search, mode: 'insensitive' } },
        { buyer: { email: { contains: search, mode: 'insensitive' } } },
        { seller: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: escrowOnly
          ? { escrowReleaseDate: 'asc' }
          : { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, email: true, trustScore: true } },
          seller: { select: { id: true, name: true, email: true, trustScore: true } },
          ticket: {
            include: {
              event: { select: { id: true, title: true, eventDate: true } },
            },
          },
          dispute: { select: { id: true, status: true, reason: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Pour la vue escrow : montant total bloqué
    let escrowStats = null;
    if (escrowOnly) {
      const stats = await prisma.transaction.aggregate({
        where: { status: 'ESCROWED' },
        _sum: { amount: true },
        _count: { id: true },
      });
      const releasingToday = await prisma.transaction.count({
        where: {
          status: 'ESCROWED',
          escrowReleaseDate: {
            gte: new Date(),
            lt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
      });
      escrowStats = {
        total_count: stats._count.id,
        total_amount: Number(stats._sum.amount || 0),
        releasing_today: releasingToday,
      };
    }

    const now = new Date();
    const formattedTransactions = transactions.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
      platformFee: Number(tx.platformFee),
      countdown_seconds: tx.status === 'ESCROWED'
        ? Math.max(0, Math.floor((new Date(tx.escrowReleaseDate).getTime() - now.getTime()) / 1000))
        : null,
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      escrow_stats: escrowStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API /admin/transactions]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
