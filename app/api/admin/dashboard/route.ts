import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

async function assertAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return null;
  }
  return user;
}

export async function GET() {
  try {
    const user = await assertAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const yesterday = new Date(startOfToday);
    yesterday.setDate(yesterday.getDate() - 1);

    // ─── Métriques principales (Promise.all pour perf) ─────────────────────
    const [
      transactionsToday,
      transactionsYesterday,
      transactionsTodaySum,
      usersCount,
      usersNew24h,
      ticketsPending,
      disputesOpen,
      revenueMonth,
      recentTransactions,
    ] = await Promise.all([
      // Transactions aujourd'hui
      prisma.transaction.count({ where: { createdAt: { gte: startOfToday } } }),
      // Transactions hier
      prisma.transaction.count({ where: { createdAt: { gte: yesterday, lt: startOfToday } } }),
      // Somme transactions aujourd'hui
      prisma.transaction.aggregate({
        where: { createdAt: { gte: startOfToday } },
        _sum: { amount: true },
      }),
      // Total users
      prisma.user.count(),
      // Nouveaux users 24h
      prisma.user.count({ where: { createdAt: { gte: yesterday } } }),
      // Billets en validation
      prisma.ticket.count({ where: { status: 'PENDING_VALIDATION' } }),
      // Litiges ouverts
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      // Revenus du mois (platform fees)
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: { in: ['RELEASED', 'ESCROWED'] },
        },
        _sum: { platformFee: true },
      }),
      // 10 dernières transactions avec relations
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true, email: true } },
          ticket: {
            include: {
              event: { select: { title: true } },
            },
          },
        },
      }),
    ]);

    // ─── Graphique revenus (30 derniers jours) ─────────────────────────────
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // findMany + agrégation JS pour éviter groupBy sur DateTime
    const allTx = await prisma.transaction.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, amount: true, platformFee: true },
    });

    // Agrégation par jour
    const revenueByDay: Record<string, { gmv: number; commissions: number; transactions: number }> = {};
    for (const tx of allTx) {
      const dateKey = tx.createdAt.toISOString().split('T')[0];
      if (!revenueByDay[dateKey]) {
        revenueByDay[dateKey] = { gmv: 0, commissions: 0, transactions: 0 };
      }
      revenueByDay[dateKey].gmv += Number(tx.amount);
      revenueByDay[dateKey].commissions += Number(tx.platformFee);
      revenueByDay[dateKey].transactions += 1;
    }

    // Générer les 30 derniers jours (même si pas de données)
    const revenueChart = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      revenueChart.push({
        date: key,
        gmv: revenueByDay[key]?.gmv || 0,
        commissions: revenueByDay[key]?.commissions || 0,
        transactions: revenueByDay[key]?.transactions || 0,
      });
    }

    // ─── Acquisitions utilisateurs (30 derniers jours) ────────────────────
    const newUsers = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const usersByDay: Record<string, number> = {};
    for (const u of newUsers) {
      const key = u.createdAt.toISOString().split('T')[0];
      usersByDay[key] = (usersByDay[key] || 0) + 1;
    }

    const acquisitionChart = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      acquisitionChart.push({ date: key, users: usersByDay[key] || 0 });
    }

    // ─── Alertes système ───────────────────────────────────────────────────
    const alerts = [];

    // SLA Validation billets (> 24h)
    const overdueSLA = await prisma.ticket.count({
      where: {
        status: 'PENDING_VALIDATION',
        createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (overdueSLA > 0) {
      alerts.push({
        id: 'sla-tickets',
        type: 'warning',
        title: 'SLA Validation Dépassé',
        message: `${overdueSLA} billet(s) en attente depuis plus de 24h`,
        timestamp: new Date().toISOString(),
        link: '/admin/tickets/validation',
      });
    }

    // SLA Litiges (> 48h)
    const overdueDisputes = await prisma.dispute.count({
      where: {
        status: 'OPEN',
        createdAt: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      },
    });
    if (overdueDisputes > 0) {
      alerts.push({
        id: 'sla-disputes',
        type: 'error',
        title: 'SLA Litiges Dépassé',
        message: `${overdueDisputes} litige(s) ouvert(s) depuis plus de 48h`,
        timestamp: new Date().toISOString(),
        link: '/admin/disputes',
      });
    }

    // Calcul variation transactions
    const txChange =
      transactionsYesterday > 0
        ? ((transactionsToday - transactionsYesterday) / transactionsYesterday) * 100
        : 0;

    return NextResponse.json({
      metrics: {
        transactions_today: {
          count: transactionsToday,
          amount: Number(transactionsTodaySum._sum.amount || 0),
          change_percent: Math.round(txChange * 10) / 10,
        },
        users_total: { count: usersCount, new_24h: usersNew24h },
        tickets_pending: { count: ticketsPending, overdue_24h: overdueSLA },
        disputes_open: { count: disputesOpen, overdue_48h: overdueDisputes },
        revenue_month: { amount: Number(revenueMonth._sum.platformFee || 0) },
      },
      revenue_chart: revenueChart,
      acquisition_chart: acquisitionChart,
      alerts,
      recent_transactions: recentTransactions.map((tx) => ({
        id: tx.id,
        amount: Number(tx.amount),
        platform_fee: Number(tx.platformFee),
        status: tx.status,
        created_at: tx.createdAt.toISOString(),
        event_title: tx.ticket.event.title,
        buyer_name: tx.buyer.name || tx.buyer.email,
        seller_name: tx.seller.name || tx.seller.email,
      })),
    });
  } catch (error) {
    console.error('[API /admin/dashboard]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
