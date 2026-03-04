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
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Métriques globales
    const [
      totalDisputes,
      openDisputes,
      resolvedToday,
      resolvedThisMonth,
      resolvedRefund,
      resolvedRelease,
      overdueDisputes,
      urgentDisputes,
    ] = await Promise.all([
      prisma.dispute.count(),
      prisma.dispute.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
      prisma.dispute.count({ where: { resolvedAt: { gte: todayStart } } }),
      prisma.dispute.count({ where: { resolvedAt: { gte: thirtyDaysAgo } } }),
      prisma.dispute.count({ where: { status: 'RESOLVED_REFUND' } }),
      prisma.dispute.count({ where: { status: 'RESOLVED_RELEASE' } }),
      // SLA dépassé = ouvert depuis > 48h
      prisma.dispute.count({
        where: {
          status: { in: ['OPEN', 'INVESTIGATING'] },
          createdAt: { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        },
      }),
      // Urgent = ouvert depuis > 36h
      prisma.dispute.count({
        where: {
          status: { in: ['OPEN', 'INVESTIGATING'] },
          createdAt: {
            lt: new Date(Date.now() - 36 * 60 * 60 * 1000),
            gte: new Date(Date.now() - 48 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Temps de résolution moyen (100 derniers)
    const resolvedWithDates = await prisma.dispute.findMany({
      where: { status: { in: ['RESOLVED_REFUND', 'RESOLVED_RELEASE', 'CLOSED'] }, resolvedAt: { not: null } },
      select: { createdAt: true, resolvedAt: true },
      orderBy: { resolvedAt: 'desc' },
      take: 100,
    });

    const avgResolutionHours =
      resolvedWithDates.length > 0
        ? resolvedWithDates.reduce((sum, d) => {
            const hours = (d.resolvedAt!.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60);
            return sum + hours;
          }, 0) / resolvedWithDates.length
        : 0;

    // SLA respecté = résolu en < 48h
    const slaCompliant = resolvedWithDates.filter((d) => {
      const hours = (d.resolvedAt!.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60);
      return hours <= 48;
    }).length;

    const slaRate = resolvedWithDates.length > 0 ? (slaCompliant / resolvedWithDates.length) * 100 : 100;

    // Répartition par type (raison)
    const byReason = await prisma.dispute.groupBy({
      by: ['reason'],
      _count: true,
      orderBy: { _count: { reason: 'desc' } },
    });

    // Tendance 30 derniers jours (groupé par jour)
    const dailyDisputes = await prisma.$queryRaw<Array<{ date: Date; opened: bigint; resolved: bigint }>>`
      SELECT
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as opened,
        COUNT(*) FILTER (WHERE status IN ('RESOLVED_REFUND', 'RESOLVED_RELEASE', 'CLOSED')) as resolved
      FROM disputes
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `;

    // Top 10 vendeurs récidivistes
    const topSellers = await prisma.user.findMany({
      where: { disputesAsSellerCount: { gt: 0 } },
      select: {
        id: true,
        name: true,
        email: true,
        trustScore: true,
        disputesAsSellerCount: true,
        disputesResolvedAgainst: true,
        totalSales: true,
      },
      orderBy: { disputesAsSellerCount: 'desc' },
      take: 10,
    });

    const totalResolved = resolvedRefund + resolvedRelease;
    const refundRate = totalResolved > 0 ? (resolvedRefund / totalResolved) * 100 : 0;
    const disputeRate = totalDisputes > 0 ? ((totalDisputes / Math.max(totalDisputes * 10, 1)) * 100) : 0;

    return NextResponse.json({
      metrics: {
        totalDisputes,
        openDisputes,
        resolvedToday,
        resolvedThisMonth,
        overdueDisputes,
        urgentDisputes,
        avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
        slaRate: Math.round(slaRate * 10) / 10,
        refundRate: Math.round(refundRate * 10) / 10,
      },
      byReason: byReason.map((r) => ({
        reason: r.reason,
        count: r._count,
      })),
      dailyTrend: dailyDisputes.map((d) => ({
        date: d.date,
        opened: Number(d.opened),
        resolved: Number(d.resolved),
      })),
      topSellers: topSellers.map((s) => ({
        ...s,
        trustScore: s.trustScore,
        disputeRate:
          s.totalSales > 0 ? Math.round((s.disputesAsSellerCount / s.totalSales) * 100 * 10) / 10 : 0,
      })),
    });
  } catch (error) {
    console.error('[API /admin/disputes/stats]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
