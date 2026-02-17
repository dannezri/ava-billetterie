/**
 * Events Search API Route
 * GET /api/events/search - Search events with autocomplete support
 * Supports debounced search queries for better performance
 */

import prisma from '@/lib/db/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Minimum 2 characters for search
    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          events: [],
          total: 0,
        },
      });
    }

    // Search in title, artist, venue, city
    const events = await prisma.event.findMany({
      where: {
        AND: [
          {
            eventDate: {
              gte: new Date(), // Only future events
            },
          },
          {
            OR: [
              {
                title: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                artist: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                venue: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              {
                city: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
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
          take: 1,
        },
      },
      orderBy: [
        {
          eventDate: 'asc',
        },
        {
          title: 'asc',
        },
      ],
      take: limit,
    });

    // Transform data for autocomplete
    const eventsWithDetails = events.map((event) => {
      const availableTickets = event._count.tickets;
      const minPrice = event.tickets.length > 0 ? Number(event.tickets[0].price) : null;

      return {
        id: event.id,
        title: event.title,
        artist: event.artist,
        venue: event.venue,
        city: event.city,
        country: event.country,
        category: event.category,
        imageUrl: event.imageUrl,
        date: event.eventDate,
        location: `${event.venue}, ${event.city}`,
        availableTickets,
        minPrice,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        events: eventsWithDetails,
        total: eventsWithDetails.length,
        query,
      },
    });
  } catch (error: any) {
    console.error('Error searching events:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message: error.message || 'Failed to search events',
        },
      },
      { status: 500 }
    );
  }
}
