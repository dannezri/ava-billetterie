import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

const approveSchema = z.object({
  notes: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = approveSchema.safeParse(body);

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        seller: { select: { id: true, name: true, email: true } },
        event: { select: { title: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Billet non trouvé' }, { status: 404 });
    }
    if (ticket.status !== 'PENDING_VALIDATION') {
      return NextResponse.json({ error: 'Ce billet n\'est pas en attente de validation' }, { status: 400 });
    }

    // Mise à jour du billet
    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: {
        status: 'ACTIVE',
        verificationStatus: 'APPROVED',
      },
    });

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        action: 'ADMIN_ACTION',
        metadata: {
          action: 'APPROVE_TICKET',
          ticketId: params.id,
          adminEmail: user.email,
          notes: parsed.success ? parsed.data.notes : undefined,
          eventTitle: ticket.event.title,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // TODO: Envoyer email au vendeur (via service email)

    return NextResponse.json({
      ticket: {
        id: updatedTicket.id,
        status: updatedTicket.status,
        verificationStatus: updatedTicket.verificationStatus,
      },
      message: 'Billet approuvé avec succès',
    });
  } catch (error) {
    console.error('[API /admin/tickets/[id]/approve]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
