import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

async function assertAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await assertAdmin();
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';
    const queue = searchParams.get('queue') === 'true'; // Mode queue validation

    const where: any = {};
    if (status) where.status = status;
    if (queue) where.status = 'PENDING_VALIDATION';
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { event: { title: { contains: search, mode: 'insensitive' } } },
        { seller: { email: { contains: search, mode: 'insensitive' } } },
        { seller: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: queue ? 'asc' : 'desc' }, // FIFO pour la queue
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
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              kycStatus: true,
              trustScore: true,
              verifiedIdentity: true,
            },
          },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    // Stats pour la queue
    let queueStats = null;
    if (queue) {
      const now = new Date();
      const [overdue12h, overdue24h] = await Promise.all([
        prisma.ticket.count({
          where: {
            status: 'PENDING_VALIDATION',
            createdAt: { lt: new Date(now.getTime() - 12 * 60 * 60 * 1000) },
          },
        }),
        prisma.ticket.count({
          where: {
            status: 'PENDING_VALIDATION',
            createdAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          },
        }),
      ]);
      queueStats = { total, overdue_12h: overdue12h, overdue_24h: overdue24h };
    }

    // Calculer le temps d'attente pour chaque billet
    const now = new Date();
    const ticketsWithWait = tickets.map((t) => ({
      ...t,
      wait_hours: Math.floor((now.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60)),
      price: Number(t.price),
      originalPrice: t.originalPrice ? Number(t.originalPrice) : null,
    }));

    return NextResponse.json({
      tickets: ticketsWithWait,
      queue_stats: queueStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API /admin/tickets]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
