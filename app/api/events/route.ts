/**
 * Events API Route
 * GET /api/events - Fetch events with optional filters
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const dateRange = searchParams.get('dateRange') || '';
    const category = searchParams.get('category') || '';

    // Build where clause
    const where: any = {};

    // Search filter (title)
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // City filter
    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Date range filter
    if (dateRange) {
      const now = new Date();
      let startDate = now;
      let endDate: Date;

      switch (dateRange) {
        case 'today':
          endDate = new Date(now);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          endDate = new Date(now);
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'month':
          endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case '3months':
          endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case '6months':
          endDate = new Date(now);
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        default:
          endDate = new Date(now);
          endDate.setFullYear(endDate.getFullYear() + 10);
      }

      where.eventDate = {
        gte: startDate,
        lte: endDate,
      };
    } else {
      // By default, only show future events
      where.eventDate = {
        gte: new Date(),
      };
    }

    // Fetch events
    const events = await prisma.event.findMany({
      where,
      include: {
        _count: {
          select: {
            tickets: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
        tickets: {
          where: {
            status: 'ACTIVE',
          },
          select: {
            price: true,
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
      orderBy: {
        eventDate: 'asc',
      },
    });

    // Transform data to include ticket counts and price range
    const eventsWithDetails = events.map((event) => {
      const availableTickets = event._count.tickets;
      const prices = event.tickets.map((t) => Number(t.price));
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        imageUrl: event.imageUrl,
        date: event.eventDate,
        location: `${event.venue}, ${event.city}`,
        country: event.country,
        availableTickets,
        minPrice,
        maxPrice,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        events: eventsWithDetails,
        total: eventsWithDetails.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EVENTS_FETCH_FAILED',
          message: error.message || 'Failed to fetch events',
        },
      },
      { status: 500 }
    );
  }
}
