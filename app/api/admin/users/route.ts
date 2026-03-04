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
    const kycStatus = searchParams.get('kyc_status');
    const search = searchParams.get('search') || '';
    const trustMin = searchParams.get('trust_min') ? parseInt(searchParams.get('trust_min')!) : undefined;
    const trustMax = searchParams.get('trust_max') ? parseInt(searchParams.get('trust_max')!) : undefined;

    const where: any = {};
    if (kycStatus) where.kycStatus = kycStatus;
    if (trustMin !== undefined) where.trustScore = { ...where.trustScore, gte: trustMin };
    if (trustMax !== undefined) where.trustScore = { ...where.trustScore, lte: trustMax };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          kycStatus: true,
          verifiedIdentity: true,
          trustScore: true,
          stripeAccountId: true,
          createdAt: true,
          _count: {
            select: {
              ticketsForSale: true,
              purchases: true,
              sales: true,
              disputes: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API /admin/users]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
