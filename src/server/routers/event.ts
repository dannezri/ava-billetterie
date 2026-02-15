/**
 * Event router
 * Handles all event-related tRPC procedures
 */

import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const eventRouter = router({
  /**
   * Get all events
   */
  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        search: z.string().optional(),
        category: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search, category } = input;

      const events = await ctx.prisma.event.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          AND: [
            search
              ? {
                  OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { venue: { contains: search, mode: 'insensitive' } },
                  ],
                }
              : {},
            category ? { category } : {},
          ],
        },
        orderBy: {
          eventDate: 'asc',
        },
      });

      let nextCursor: string | undefined = undefined;
      if (events.length > limit) {
        const nextItem = events.pop();
        nextCursor = nextItem!.id;
      }

      return {
        events,
        nextCursor,
      };
    }),

  /**
   * Get a single event by ID with available tickets
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.prisma.event.findUnique({
        where: { id: input.id },
        include: {
          tickets: {
            where: {
              status: 'AVAILABLE',
            },
            include: {
              seller: {
                select: {
                  name: true,
                  verifiedIdentity: true,
                },
              },
            },
            orderBy: {
              price: 'asc',
            },
          },
        },
      });

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      return event;
    }),

  /**
   * Search events by title or venue
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(2),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const events = await ctx.prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: input.query, mode: 'insensitive' } },
            { venue: { contains: input.query, mode: 'insensitive' } },
            { artist: { contains: input.query, mode: 'insensitive' } },
          ],
        },
        take: input.limit,
        orderBy: {
          date: 'asc',
        },
      });

      return events;
    }),

  /**
   * Get upcoming events
   */
  getUpcoming: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      const events = await ctx.prisma.event.findMany({
        where: {
          date: {
            gte: now,
          },
        },
        take: input.limit,
        orderBy: {
          date: 'asc',
        },
      });

      return events;
    }),

  /**
   * Get events by category
   */
  getByCategory: publicProcedure
    .input(
      z.object({
        category: z.string(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const events = await ctx.prisma.event.findMany({
        where: {
          category: input.category,
        },
        take: input.limit,
        orderBy: {
          date: 'asc',
        },
      });

      return events;
    }),

  /**
   * Get event statistics (total tickets, average price, etc.)
   */
  getStats: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [event, ticketCount, avgPrice] = await Promise.all([
        ctx.prisma.event.findUnique({
          where: { id: input.id },
        }),
        ctx.prisma.ticket.count({
          where: {
            eventId: input.id,
            status: 'AVAILABLE',
          },
        }),
        ctx.prisma.ticket.aggregate({
          where: {
            eventId: input.id,
            status: 'AVAILABLE',
          },
          _avg: {
            price: true,
          },
          _min: {
            price: true,
          },
          _max: {
            price: true,
          },
        }),
      ]);

      if (!event) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Event not found',
        });
      }

      return {
        event,
        availableTickets: ticketCount,
        averagePrice: avgPrice._avg.price || 0,
        minPrice: avgPrice._min.price || 0,
        maxPrice: avgPrice._max.price || 0,
      };
    }),
});
