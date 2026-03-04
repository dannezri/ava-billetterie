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
    const reason = searchParams.get('reason');
    const urgentOnly = searchParams.get('urgent') === 'true';

    const where: any = {};
    if (status) where.status = status;
    if (reason) where.reason = reason;
    if (urgentOnly) {
      where.status = 'OPEN';
      where.createdAt = { lt: new Date(Date.now() - 48 * 60 * 60 * 1000) };
    }

    const [disputes, total] = await Promise.all([
      prisma.dispute.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, name: true, email: true, trustScore: true } },
          assignedAdmin: { select: { id: true, name: true, email: true } },
          transaction: {
            include: {
              buyer: { select: { id: true, name: true, email: true, trustScore: true } },
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  trustScore: true,
                  disputesAsSellerCount: true,
                },
              },
              ticket: {
                include: {
                  event: { select: { id: true, title: true } },
                },
              },
            },
          },
        },
      }),
      prisma.dispute.count({ where }),
    ]);

    const now = new Date();
    const formattedDisputes = disputes.map((d) => ({
      ...d,
      wait_hours: Math.floor((now.getTime() - d.createdAt.getTime()) / (1000 * 60 * 60)),
      is_overdue_sla: (now.getTime() - d.createdAt.getTime()) > 48 * 60 * 60 * 1000,
      transaction: {
        ...d.transaction,
        amount: Number(d.transaction.amount),
        platformFee: Number(d.transaction.platformFee),
      },
    }));

    return NextResponse.json({
      disputes: formattedDisputes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API /admin/disputes]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
