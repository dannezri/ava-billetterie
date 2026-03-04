import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;

    const userData = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        kycStatus: true,
        kycProviderId: true,
        verifiedIdentity: true,
        stripeAccountId: true,
        trustScore: true,
        createdAt: true,
        updatedAt: true,
        ticketsForSale: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            status: true,
            price: true,
            originalPrice: true,
            createdAt: true,
            event: {
              select: { title: true, eventDate: true, city: true },
            },
          },
        },
        purchases: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            ticket: {
              select: {
                event: { select: { title: true, eventDate: true } },
              },
            },
          },
        },
        sales: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            amount: true,
            platformFee: true,
            status: true,
            createdAt: true,
            ticket: {
              select: {
                event: { select: { title: true, eventDate: true } },
              },
            },
          },
        },
        disputes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            reason: true,
            status: true,
            description: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            ticketsForSale: true,
            purchases: true,
            sales: true,
            disputes: true,
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('[API /admin/users/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
