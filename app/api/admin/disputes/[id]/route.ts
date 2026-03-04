import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id: params.id },
      include: {
        transaction: {
          include: {
            ticket: { include: { event: true } },
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
                trustScore: true,
                totalSales: true,
                createdAt: true,
              },
            },
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                trustScore: true,
                totalSales: true,
                disputesAsSellerCount: true,
                disputesResolvedAgainst: true,
                stripeAccountId: true,
                createdAt: true,
              },
            },
          },
        },
        reporter: { select: { id: true, name: true, email: true } },
        resolvedBy: { select: { id: true, name: true, email: true } },
        assignedAdmin: { select: { id: true, name: true, email: true } },
        messages: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json({ error: 'Litige non trouvé' }, { status: 404 });
    }

    const now = new Date();
    const waitHours = Math.floor((now.getTime() - dispute.createdAt.getTime()) / (1000 * 60 * 60));
    const isOverdueSla = waitHours > 48;
    const isUrgent = waitHours > 36 && !isOverdueSla;

    const formatted = {
      ...dispute,
      transaction: {
        ...dispute.transaction,
        amount: Number(dispute.transaction.amount),
        platformFee: Number(dispute.transaction.platformFee),
      },
      wait_hours: waitHours,
      is_overdue_sla: isOverdueSla,
      is_urgent: isUrgent,
    };

    return NextResponse.json({ dispute: formatted });
  } catch (error) {
    console.error('[API /admin/disputes/[id] GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
