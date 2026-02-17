/**
 * Ticket router
 * Handles all ticket-related tRPC procedures
 */

import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const ticketRouter = router({
  /**
   * Get all available tickets
   */
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        eventId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, eventId } = input;

      const tickets = await ctx.prisma.ticket.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          status: 'ACTIVE',
          eventId: eventId || undefined,
        },
        include: {
          event: {
            select: {
              title: true,
              eventDate: true,
              venue: true,
            },
          },
          seller: {
            select: {
              name: true,
              verifiedIdentity: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
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
   * Get a single ticket by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ticket = await ctx.prisma.ticket.findUnique({
        where: { id: input.id },
        include: {
          event: true,
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              verifiedIdentity: true,
              createdAt: true,
            },
          },
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        });
      }

      return ticket;
    }),

  /**
   * Create a new ticket (protected - requires authentication)
   */
  create: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        seatNumber: z.string().optional(),
        section: z.string().optional(),
        row: z.string().optional(),
        price: z.number().positive(),
        originalPrice: z.number().positive(),
        proofImageUrl: z.string().url(),
        transferMethod: z.enum([
          'PHYSICAL',
          'E_TICKET',
          'MOBILE_TRANSFER',
          'PRINT_AT_HOME',
        ]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify the event exists
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.eventId },
      });

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      // Check if user has verified identity
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.verifiedIdentity) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Identity verification required to sell tickets',
        });
      }

      // Create the ticket
      const ticket = await ctx.prisma.ticket.create({
        data: {
          ...input,
          sellerId: userId,
          status: 'PENDING_VALIDATION',
        },
        include: {
          event: true,
        },
      });

      return ticket;
    }),

  /**
   * Update ticket status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          'PENDING_VALIDATION',
          'ACTIVE',
          'RESERVED',
          'SOLD',
          'CANCELLED',
          'FLAGGED',
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const ticket = await ctx.prisma.ticket.findUnique({
        where: { id: input.id },
      });

      if (!ticket) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ticket not found',
        });
      }

      // Only the seller can update their ticket status
      if (ticket.sellerId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own tickets',
        });
      }

      const updatedTicket = await ctx.prisma.ticket.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      return updatedTicket;
    }),

  /**
   * Get tickets by seller (my tickets)
   */
  getMySales: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const tickets = await ctx.prisma.ticket.findMany({
      where: { sellerId: userId },
      include: {
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tickets;
  }),

  /**
   * Get purchase history
   */
  getMyPurchases: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const transactions = await ctx.prisma.transaction.findMany({
      where: { buyerId: userId },
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transactions;
  }),
});
