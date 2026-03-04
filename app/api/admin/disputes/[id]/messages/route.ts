import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

const messageSchema = z.object({
  message: z.string().min(2).max(2000),
  isInternal: z.boolean().default(false),
  attachmentUrls: z.array(z.string()).max(5).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.disputeMessage.findMany({
      where: { disputeId: params.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('[API /admin/disputes/[id]/messages GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dispute = await prisma.dispute.findUnique({ where: { id: params.id } });
    if (!dispute) {
      return NextResponse.json({ error: 'Litige non trouvé' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const adminUser = await prisma.user.findUnique({ where: { email: user.email! } });
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    const newMessage = await prisma.disputeMessage.create({
      data: {
        disputeId: params.id,
        authorId: adminUser.id,
        message: parsed.data.message,
        isInternal: parsed.data.isInternal,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attachments: parsed.data.attachmentUrls ? ({ urls: parsed.data.attachmentUrls } as any) : null,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error('[API /admin/disputes/[id]/messages POST]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
