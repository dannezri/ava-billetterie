/**
 * Admin router
 * Handles all admin-related tRPC procedures (ticket validation, disputes, etc.)
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { 
  sendTicketApprovedEmail, 
  sendTicketRejectedEmail,
  sendTicketInfoRequestEmail 
} from '@/services/email';

/**
 * Vérifie si l'utilisateur a les droits admin
 * TODO: Ajouter un champ isAdmin dans le modèle User
 * Pour l'instant, on vérifie si l'email est dans une liste d'admins
 */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

function assertIsAdmin(userEmail: string) {
  if (!ADMIN_EMAILS.includes(userEmail)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Accès réservé aux administrateurs',
    });
  }
}

export const adminRouter = router({
  /**
   * Récupérer tous les billets en attente de validation
   */
  getPendingTickets: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      assertIsAdmin(ctx.session.user.email!);

      const { limit, cursor } = input;

      const tickets = await ctx.prisma.ticket.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          status: 'PENDING_VALIDATION',
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              artist: true,
              venue: true,
              city: true,
              eventDate: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              kycStatus: true,
              trustScore: true,
              verifiedIdentity: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc', // FIFO - les plus anciens d'abord
        },
      });

      let nextCursor: string | undefined = undefined;
      if (tickets.length > limit) {
        const nextItem = tickets.pop();
        nextCursor = nextItem!.id;
      }

      return {
        tickets,
        nextCursor,
      };
    }),

  /**
   * Approuver un billet
   */
  approveTicket: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertIsAdmin(ctx.session.user.email!);

      const ticket = await ctx.prisma.ticket.findUnique({
        where: { id: input.ticketId },
        include: {
          seller: true,
          event: true,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Billet non trouvé',
        });
      }

      if (ticket.status !== 'PENDING_VALIDATION') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce billet n\'est pas en attente de validation',
        });
      }

      // Mise à jour du billet
      const updatedTicket = await ctx.prisma.ticket.update({
        where: { id: input.ticketId },
        data: {
          status: 'ACTIVE',
          verificationStatus: 'APPROVED',
        },
      });

      // Log d'audit
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'ADMIN_ACTION',
          metadata: {
            action: 'APPROVE_TICKET',
            ticketId: input.ticketId,
            notes: input.adminNotes,
          },
          ipAddress: (ctx.req?.headers as any)?.['x-forwarded-for'] ?? 'unknown',
          userAgent: (ctx.req?.headers as any)?.['user-agent'] ?? 'unknown',
        },
      });

      // Envoi email au vendeur
      await sendTicketApprovedEmail(
        ticket.seller.email,
        ticket.seller.name || 'Vendeur',
        ticket.event.title,
        ticket.id
      );

      return updatedTicket;
    }),

  /**
   * Rejeter un billet
   */
  rejectTicket: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        rejectionReason: z.string().min(10, 'La raison doit contenir au moins 10 caractères'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertIsAdmin(ctx.session.user.email!);

      const ticket = await ctx.prisma.ticket.findUnique({
        where: { id: input.ticketId },
        include: {
          seller: true,
          event: true,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Billet non trouvé',
        });
      }

      if (ticket.status !== 'PENDING_VALIDATION') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce billet n\'est pas en attente de validation',
        });
      }

      // Mise à jour du billet
      const updatedTicket = await ctx.prisma.ticket.update({
        where: { id: input.ticketId },
        data: {
          status: 'CANCELLED',
          verificationStatus: 'REJECTED',
          rejectionReason: input.rejectionReason,
        },
      });

      // Log d'audit
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'ADMIN_ACTION',
          metadata: {
            action: 'REJECT_TICKET',
            ticketId: input.ticketId,
            reason: input.rejectionReason,
          },
          ipAddress: (ctx.req?.headers as any)?.['x-forwarded-for'] ?? 'unknown',
          userAgent: (ctx.req?.headers as any)?.['user-agent'] ?? 'unknown',
        },
      });

      // Envoi email au vendeur
      await sendTicketRejectedEmail(
        ticket.seller.email,
        ticket.seller.name || 'Vendeur',
        ticket.event.title,
        input.rejectionReason
      );

      return updatedTicket;
    }),

  /**
   * Demander des informations complémentaires au vendeur
   */
  requestTicketInfo: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertIsAdmin(ctx.session.user.email!);

      const ticket = await ctx.prisma.ticket.findUnique({
        where: { id: input.ticketId },
        include: {
          seller: true,
          event: true,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Billet non trouvé',
        });
      }

      if (ticket.status !== 'PENDING_VALIDATION') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Ce billet n\'est pas en attente de validation',
        });
      }

      // Log d'audit
      await ctx.prisma.auditLog.create({
        data: {
          userId: ctx.session.user.id,
          action: 'ADMIN_ACTION',
          metadata: {
            action: 'REQUEST_TICKET_INFO',
            ticketId: input.ticketId,
            message: input.message,
          },
          ipAddress: (ctx.req?.headers as any)?.['x-forwarded-for'] ?? 'unknown',
          userAgent: (ctx.req?.headers as any)?.['user-agent'] ?? 'unknown',
        },
      });

      // Envoi email au vendeur
      await sendTicketInfoRequestEmail(
        ticket.seller.email,
        ticket.seller.name || 'Vendeur',
        ticket.event.title,
        input.message,
        ticket.id
      );

      return { success: true };
    }),

  /**
   * Récupérer les statistiques admin
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    assertIsAdmin(ctx.session.user.email!);

    const [
      pendingTickets,
      activeTickets,
      rejectedTickets,
      openDisputes,
      totalTransactions,
    ] = await Promise.all([
      ctx.prisma.ticket.count({ where: { status: 'PENDING_VALIDATION' } }),
      ctx.prisma.ticket.count({ where: { status: 'ACTIVE' } }),
      ctx.prisma.ticket.count({ where: { verificationStatus: 'REJECTED' } }),
      ctx.prisma.dispute.count({ where: { status: 'OPEN' } }),
      ctx.prisma.transaction.count(),
    ]);

    return {
      pendingTickets,
      activeTickets,
      rejectedTickets,
      openDisputes,
      totalTransactions,
    };
  }),
});
