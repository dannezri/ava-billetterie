import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import { prisma } from '@/lib/db/prisma';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        transaction: { select: { id: true } },
        event: { select: { title: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Billet non trouvé' }, { status: 404 });
    }

    if (ticket.status !== 'RESERVED') {
      return NextResponse.json(
        { error: 'Ce billet n\'est pas en état RESERVED' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Supprimer la transaction en attente associée
      if (ticket.transaction) {
        await tx.transaction.delete({ where: { id: ticket.transaction.id } });
      }

      // Remettre le billet en ACTIVE et effacer l'expiration
      await tx.ticket.update({
        where: { id: params.id },
        data: { status: 'ACTIVE', expiresAt: null },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: 'ADMIN_ACTION',
          metadata: {
            action: 'RELEASE_TICKET',
            ticketId: params.id,
            adminEmail: user.email,
            eventTitle: ticket.event.title,
            transactionId: ticket.transaction?.id ?? null,
          },
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    });

    return NextResponse.json({ message: 'Place libérée avec succès' });
  } catch (error) {
    console.error('[API /admin/tickets/[id]/release]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
