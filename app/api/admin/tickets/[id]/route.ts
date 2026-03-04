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

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        event: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            kycStatus: true,
            verifiedIdentity: true,
            trustScore: true,
            stripeAccountId: true,
            _count: { select: { ticketsForSale: true, sales: true, disputes: true } },
          },
        },
        transaction: {
          include: {
            buyer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Billet non trouvé' }, { status: 404 });
    }

    // Audit logs related to this ticket
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        metadata: {
          path: ['ticketId'],
          equals: params.id,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const waitHours = Math.round(
      (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60)
    );

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        status: ticket.status,
        verificationStatus: ticket.verificationStatus,
        price: Number(ticket.price),
        originalPrice: ticket.originalPrice ? Number(ticket.originalPrice) : null,
        section: ticket.section,
        row: ticket.row,
        seatNumber: ticket.seatNumber,
        pdfUrl: ticket.pdfUrl,
        pdfHash: ticket.pdfHash,
        barcodeNumber: ticket.barcodeNumber,
        rejectionReason: ticket.rejectionReason,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        expiresAt: ticket.expiresAt?.toISOString() || null,
        wait_hours: waitHours,
        event: {
          id: ticket.event.id,
          title: ticket.event.title,
          artist: ticket.event.artist,
          venue: ticket.event.venue,
          city: ticket.event.city,
          country: ticket.event.country,
          eventDate: ticket.event.eventDate.toISOString(),
          category: ticket.event.category,
          imageUrl: ticket.event.imageUrl,
          officialUrl: ticket.event.officialUrl,
          isVerified: ticket.event.isVerified,
        },
        seller: ticket.seller,
        transaction: ticket.transaction
          ? {
              id: ticket.transaction.id,
              amount: Number(ticket.transaction.amount),
              platformFee: Number(ticket.transaction.platformFee),
              status: ticket.transaction.status,
              createdAt: ticket.transaction.createdAt.toISOString(),
              escrowReleaseDate: ticket.transaction.escrowReleaseDate.toISOString(),
              releasedAt: ticket.transaction.releasedAt?.toISOString() || null,
              buyer: ticket.transaction.buyer,
            }
          : null,
      },
      audit_logs: auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        metadata: log.metadata,
        createdAt: log.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[API /admin/tickets/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      select: { id: true, status: true, transaction: { select: { id: true } } },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Billet non trouvé' }, { status: 404 });
    }

    if (ticket.transaction) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un billet lié à une transaction' },
        { status: 400 }
      );
    }

    await prisma.ticket.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        action: 'ADMIN_ACTION',
        userId: user.id,
        metadata: { event: 'TICKET_DELETED', ticketId: params.id, adminEmail: user.email },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API DELETE /admin/tickets/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
