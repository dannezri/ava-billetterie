/**
 * Event Service
 * Logique métier pour les événements
 */

import { prisma } from '@/lib/prisma';
import { Prisma, TicketStatus, TicketVerificationStatus } from '@prisma/client';

/**
 * Récupère les événements avec filtres et pagination
 */
export async function getEvents(params: {
  page?: number;
  limit?: number;
  sort?: string;
  dateFrom?: string;
  dateTo?: string;
  cities?: string[];
  categories?: string[];
  artists?: string;
  priceMin?: number;
  priceMax?: number;
}) {
  const {
    page = 1,
    limit = 12,
    sort = 'relevance',
    dateFrom,
    dateTo,
    cities,
    categories,
    artists,
    priceMin,
    priceMax,
  } = params;

  const skip = (page - 1) * limit;

  // Construction du WHERE clause
  const where: Prisma.EventWhereInput = {
    isVerified: true,
    eventDate: {
      gte: dateFrom ? new Date(dateFrom) : new Date(),
      ...(dateTo && { lte: new Date(dateTo) }),
    },
    ...(cities && cities.length > 0 && { city: { in: cities } }),
    ...(categories && categories.length > 0 && { category: { in: categories } }),
    ...(artists && {
      artist: { contains: artists, mode: 'insensitive' as Prisma.QueryMode },
    }),
    // Filtrer uniquement événements avec billets actifs
    tickets: {
      some: {
        status: TicketStatus.ACTIVE,
        verificationStatus: TicketVerificationStatus.APPROVED,
        ...(priceMin !== undefined || priceMax !== undefined
          ? {
              price: {
                ...(priceMin !== undefined && { gte: priceMin }),
                ...(priceMax !== undefined && { lte: priceMax }),
              },
            }
          : {}),
      },
    },
  };

  // Construction du ORDER BY clause
  let orderBy: Prisma.EventOrderByWithRelationInput[] = [];
  switch (sort) {
    case 'date_asc':
      orderBy = [{ eventDate: 'asc' }];
      break;
    case 'date_desc':
      orderBy = [{ eventDate: 'desc' }];
      break;
    case 'price_min':
      // Note: Prisma ne supporte pas le tri par champs agrégés directement
      // On trie par date par défaut et on fera le tri en post-traitement si nécessaire
      orderBy = [{ eventDate: 'asc' }];
      break;
    case 'popularity':
      orderBy = [{ eventDate: 'asc' }];
      break;
    default:
      orderBy = [{ eventDate: 'asc' }];
  }

  // Exécution des requêtes en parallèle
  const [events, total, availableCities, availableCategories] = await Promise.all([
    // Récupération des événements
    prisma.event.findMany({
      where,
      include: {
        tickets: {
          where: {
            status: TicketStatus.ACTIVE,
            verificationStatus: TicketVerificationStatus.APPROVED,
          },
          select: {
            price: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    // Comptage total
    prisma.event.count({ where }),
    // Récupération des villes disponibles
    prisma.event.findMany({
      where: { isVerified: true, eventDate: { gte: new Date() } },
      select: { city: true },
      distinct: ['city'],
    }),
    // Récupération des catégories disponibles
    prisma.event.findMany({
      where: { isVerified: true, eventDate: { gte: new Date() }, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    }),
  ]);

  // Calcul des stats pour chaque événement
  const eventsWithStats = events.map((event) => {
    const prices = event.tickets.map((t) => Number(t.price));
    return {
      ...event,
      ticketsAvailable: event.tickets.length,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      tickets: undefined, // Retirer les tickets du retour
    };
  });

  return {
    events: eventsWithStats,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    filters: {
      availableCities: availableCities.map((e) => e.city).filter(Boolean),
      availableCategories: availableCategories
        .map((e) => e.category)
        .filter(Boolean) as string[],
    },
  };
}

/**
 * Récupère un événement par ID avec tickets et statistiques
 */
export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      tickets: {
        where: {
          status: TicketStatus.ACTIVE,
          verificationStatus: TicketVerificationStatus.APPROVED,
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              trustScore: true,
              sales: {
                where: { status: 'RELEASED' },
                select: { id: true },
              },
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
    return null;
  }

  // Calcul des statistiques de prix
  const prices = event.tickets.map((t) => Number(t.price));
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  // Distribution des prix par tranches
  const priceDistribution = [
    { range: '0-50', count: 0 },
    { range: '50-100', count: 0 },
    { range: '100-150', count: 0 },
    { range: '150-200', count: 0 },
    { range: '200+', count: 0 },
  ];

  prices.forEach((price) => {
    if (price < 50) priceDistribution[0].count++;
    else if (price < 100) priceDistribution[1].count++;
    else if (price < 150) priceDistribution[2].count++;
    else if (price < 200) priceDistribution[3].count++;
    else priceDistribution[4].count++;
  });

  // Formater les tickets avec le vendeur
  const ticketsWithSeller = event.tickets.map((ticket) => ({
    ...ticket,
    seller: {
      id: ticket.seller.id,
      name: ticket.seller.name,
      trustScore: ticket.seller.trustScore,
      totalSales: ticket.seller.sales.length,
    },
  }));

  return {
    event: {
      ...event,
      tickets: undefined, // Retirer pour éviter duplication
    },
    tickets: ticketsWithSeller,
    stats: {
      ticketsAvailable: event.tickets.length,
      minPrice,
      maxPrice,
      avgPrice: Math.round(avgPrice * 100) / 100,
      priceDistribution,
    },
  };
}

/**
 * Récupère un billet par ID avec event et vendeur
 */
export async function getTicketById(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      event: true,
      seller: {
        select: {
          id: true,
          name: true,
          trustScore: true,
          createdAt: true,
          sales: {
            where: { status: 'RELEASED' },
            select: { id: true },
          },
          reviewsReceived: {
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: {
              rating: true,
              comment: true,
              createdAt: true,
              reviewer: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!ticket) {
    return null;
  }

  // Calcul statistiques vendeur
  const avgRating =
    ticket.seller.reviewsReceived.length > 0
      ? ticket.seller.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) /
        ticket.seller.reviewsReceived.length
      : 0;

  return {
    ticket,
    event: ticket.event,
    seller: {
      id: ticket.seller.id,
      name: ticket.seller.name,
      trustScore: ticket.seller.trustScore,
      totalSales: ticket.seller.sales.length,
      memberSince: ticket.seller.createdAt,
      reviews: ticket.seller.reviewsReceived,
      avgRating: Math.round(avgRating * 10) / 10,
    },
  };
}

/**
 * Recherche globale (événements, artistes, villes)
 */
export async function searchGlobal(params: {
  query: string;
  type?: string;
  page?: number;
  limit?: number;
}) {
  const { query, type = 'all', page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const searchWhere: Prisma.EventWhereInput = {
    isVerified: true,
    eventDate: { gte: new Date() },
    OR: [
      { title: { contains: query, mode: 'insensitive' as Prisma.QueryMode } },
      { artist: { contains: query, mode: 'insensitive' as Prisma.QueryMode } },
      { venue: { contains: query, mode: 'insensitive' as Prisma.QueryMode } },
      { city: { contains: query, mode: 'insensitive' as Prisma.QueryMode } },
    ],
  };

  let events: any[] = [];
  let artists: any[] = [];
  let cities: any[] = [];

  if (type === 'all' || type === 'events') {
    events = await prisma.event.findMany({
      where: searchWhere,
      include: {
        tickets: {
          where: {
            status: TicketStatus.ACTIVE,
            verificationStatus: TicketVerificationStatus.APPROVED,
          },
          select: { price: true },
        },
      },
      orderBy: { eventDate: 'asc' },
      skip: type === 'events' ? skip : 0,
      take: type === 'events' ? limit : 5,
    });

    // Ajouter stats
    events = events.map((event) => {
      const prices = event.tickets.map((t: any) => Number(t.price));
      return {
        ...event,
        ticketsAvailable: event.tickets.length,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        maxPrice: prices.length > 0 ? Math.max(...prices) : null,
        tickets: undefined,
      };
    });
  }

  if (type === 'all' || type === 'artists') {
    const artistsResults = await prisma.event.groupBy({
      by: ['artist', 'category'],
      where: {
        artist: { contains: query, mode: 'insensitive' as Prisma.QueryMode },
        isVerified: true,
        eventDate: { gte: new Date() },
      },
      _count: { id: true },
      take: type === 'artists' ? limit : 3,
      orderBy: { _count: { id: 'desc' } },
    });

    artists = artistsResults
      .filter((a) => a.artist)
      .map((a) => ({
        name: a.artist!,
        category: a.category || 'Autre',
        eventsCount: a._count.id,
      }));
  }

  if (type === 'all' || type === 'cities') {
    const citiesResults = await prisma.event.groupBy({
      by: ['city'],
      where: {
        city: { contains: query, mode: 'insensitive' as Prisma.QueryMode },
        isVerified: true,
        eventDate: { gte: new Date() },
      },
      _count: { id: true },
      take: type === 'cities' ? limit : 5,
      orderBy: { _count: { id: 'desc' } },
    });

    cities = citiesResults.map((c) => ({
      name: c.city,
      eventsCount: c._count.id,
    }));
  }

  const totalResults = events.length + artists.length + cities.length;

  return {
    query,
    results: {
      events,
      artists,
      cities,
    },
    totalResults,
  };
}

/**
 * Récupère les événements populaires
 */
export async function getPopularEvents(limit = 10) {
  const events = await prisma.event.findMany({
    where: {
      isVerified: true,
      eventDate: { gte: new Date() },
    },
    include: {
      tickets: {
        where: {
          status: TicketStatus.ACTIVE,
          verificationStatus: TicketVerificationStatus.APPROVED,
        },
        select: { price: true },
      },
    },
    take: limit,
    orderBy: {
      eventDate: 'asc',
    },
  });

  return events.map((event) => {
    const prices = event.tickets.map((t) => Number(t.price));
    return {
      ...event,
      ticketsAvailable: event.tickets.length,
      minPrice: prices.length > 0 ? Math.min(...prices) : null,
      maxPrice: prices.length > 0 ? Math.max(...prices) : null,
      tickets: undefined,
    };
  });
}

/**
 * Récupère les événements à venir
 */
export async function getUpcomingEvents(limit = 10) {
  return getPopularEvents(limit);
}
