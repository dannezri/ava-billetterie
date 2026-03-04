import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

const assignSchema = z.object({
  admin_id: z.union([z.string().uuid(), z.literal('me'), z.null()]),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const dispute = await prisma.dispute.findUnique({ where: { id: params.id } });
    if (!dispute) {
      return NextResponse.json({ error: 'Litige non trouvé' }, { status: 404 });
    }

    // Résoudre "me" → l'admin connecté (retrouvé par email)
    let targetAdminId: string | null = parsed.data.admin_id === 'me' ? null : parsed.data.admin_id;
    if (parsed.data.admin_id === 'me') {
      const adminUser = await prisma.user.findUnique({ where: { email: user.email! } });
      targetAdminId = adminUser?.id ?? null;
    }

    const updated = await prisma.dispute.update({
      where: { id: params.id },
      data: {
        assignedTo: targetAdminId,
        status: targetAdminId && dispute.status === 'OPEN' ? 'INVESTIGATING' : dispute.status,
      },
      include: {
        assignedAdmin: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'ADMIN_ACTION',
        metadata: {
          action: 'ASSIGN_DISPUTE',
          disputeId: params.id,
          assignedTo: targetAdminId,
          adminEmail: user.email,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({ dispute: updated });
  } catch (error) {
    console.error('[API /admin/disputes/[id]/assign]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
