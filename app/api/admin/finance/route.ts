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

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { searchParams } = new URL(request.url);
    const txLimit = parseInt(searchParams.get('limit') || '30');
    const txPage = parseInt(searchParams.get('page') || '1');

    const [
      // All-time totals
      gmvAll,
      feesAll,
      // This month
      gmvMonth,
      feesMonth,
      // Last month
      gmvLastMonth,
      feesLastMonth,
      // Escrow balance (ESCROWED = funds held)
      escrow,
      // Refunds
      refunds,
      refundCount,
      // Transaction count by status
      txByStatus,
      // Recent transactions
      recentTx,
      totalTxCount,
    ] = await Promise.all([
      prisma.transaction.aggregate({ _sum: { amount: true } }),
      prisma.transaction.aggregate({ _sum: { platformFee: true } }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { amount: true, platformFee: true },
      }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: startOfMonth } },
        _sum: { platformFee: true },
      }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { platformFee: true },
      }),
      prisma.transaction.aggregate({
        where: { status: 'ESCROWED' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { status: 'REFUNDED' },
        _sum: { amount: true },
      }),
      prisma.transaction.count({ where: { status: 'REFUNDED' } }),
      prisma.transaction.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { amount: true, platformFee: true },
      }),
      prisma.transaction.findMany({
        take: txLimit,
        skip: (txPage - 1) * txLimit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          platformFee: true,
          status: true,
          createdAt: true,
          buyer: { select: { name: true, email: true } },
          seller: { select: { name: true, email: true } },
          ticket: { select: { event: { select: { title: true } } } },
        },
      }),
      prisma.transaction.count(),
    ]);

    // 30-day daily revenue chart
    const allTx30 = await prisma.transaction.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, amount: true, platformFee: true },
    });
    const byDay: Record<string, { gmv: number; fees: number; count: number }> = {};
    for (const tx of allTx30) {
      const key = tx.createdAt.toISOString().split('T')[0];
      if (!byDay[key]) byDay[key] = { gmv: 0, fees: 0, count: 0 };
      byDay[key].gmv += Number(tx.amount);
      byDay[key].fees += Number(tx.platformFee);
      byDay[key].count += 1;
    }
    const revenueChart = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      revenueChart.push({ date: key, ...(byDay[key] || { gmv: 0, fees: 0, count: 0 }) });
    }

    const gmvMonthVal = Number(gmvMonth._sum.amount || 0);
    const gmvLastMonthVal = Number(gmvLastMonth._sum.amount || 0);
    const gmvChange =
      gmvLastMonthVal > 0
        ? Math.round(((gmvMonthVal - gmvLastMonthVal) / gmvLastMonthVal) * 1000) / 10
        : 0;

    const feesMonthVal = Number(feesMonth._sum.platformFee || 0);
    const feesLastMonthVal = Number(feesLastMonth._sum.platformFee || 0);
    const feesChange =
      feesLastMonthVal > 0
        ? Math.round(((feesMonthVal - feesLastMonthVal) / feesLastMonthVal) * 1000) / 10
        : 0;

    return NextResponse.json({
      kpis: {
        gmv_total: Number(gmvAll._sum.amount || 0),
        fees_total: Number(feesAll._sum.platformFee || 0),
        gmv_month: gmvMonthVal,
        fees_month: feesMonthVal,
        gmv_change_pct: gmvChange,
        fees_change_pct: feesChange,
        escrow_balance: Number(escrow._sum.amount || 0),
        escrow_count: escrow._count,
        refunds_total: Number(refunds._sum.amount || 0),
        refund_count: refundCount,
      },
      by_status: txByStatus.map((s) => ({
        status: s.status,
        count: s._count._all,
        gmv: Number(s._sum.amount || 0),
        fees: Number(s._sum.platformFee || 0),
      })),
      revenue_chart: revenueChart,
      transactions: recentTx.map((tx) => ({
        id: tx.id,
        amount: Number(tx.amount),
        platform_fee: Number(tx.platformFee),
        status: tx.status,
        created_at: tx.createdAt.toISOString(),
        event_title: tx.ticket.event.title,
        buyer: tx.buyer.name || tx.buyer.email,
        seller: tx.seller.name || tx.seller.email,
      })),
      pagination: {
        total: totalTxCount,
        page: txPage,
        limit: txLimit,
        totalPages: Math.ceil(totalTxCount / txLimit),
      },
    });
  } catch (error) {
    console.error('[API /admin/finance]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
