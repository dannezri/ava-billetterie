/**
 * Favorite Service
 * Gère la logique métier des favoris (wishlist événements)
 */

import { prisma } from '@/lib/db/prisma';
import type { GetUserFavoritesInput } from '@/lib/validations/favorite.validation';

/**
 * Ajoute un événement aux favoris
 */
export async function addFavorite(userId: string, eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });

  if (existing) {
    throw new Error('Event already in favorites');
  }

  return prisma.favorite.create({
    data: { userId, eventId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          artist: true,
          city: true,
          eventDate: true,
          imageUrl: true,
        },
      },
    },
  });
}

/**
 * Retire un favori par son id (avec vérification ownership)
 */
export async function removeFavorite(favoriteId: string, userId: string) {
  const favorite = await prisma.favorite.findUnique({
    where: { id: favoriteId },
  });

  if (!favorite) {
    throw new Error('Favorite not found');
  }

  if (favorite.userId !== userId) {
    throw new Error('Forbidden: you do not own this favorite');
  }

  return prisma.favorite.delete({ where: { id: favoriteId } });
}

/**
 * Retire un favori par eventId
 */
export async function removeFavoriteByEventId(userId: string, eventId: string) {
  return prisma.favorite.deleteMany({ where: { userId, eventId } });
}

/**
 * Récupère les favoris d'un utilisateur avec pagination
 */
export async function getUserFavorites(userId: string, filters: GetUserFavoritesInput) {
  const { page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            artist: true,
            city: true,
            eventDate: true,
            imageUrl: true,
            tickets: {
              where: { status: 'ACTIVE' },
              select: { price: true },
            },
          },
        },
      },
    }),
    prisma.favorite.count({ where: { userId } }),
  ]);

  const enriched = favorites.map((fav) => {
    const prices = fav.event.tickets.map((t) => Number(t.price));
    return {
      id: fav.id,
      createdAt: fav.createdAt,
      event: {
        id: fav.event.id,
        title: fav.event.title,
        artist: fav.event.artist,
        city: fav.event.city,
        eventDate: fav.event.eventDate,
        imageUrl: fav.event.imageUrl,
        ticketsAvailable: prices.length,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      },
    };
  });

  return {
    favorites: enriched,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Vérifie si un événement est en favori, retourne le favoriteId si oui
 */
export async function isFavorite(
  userId: string,
  eventId: string
): Promise<{ isFavorite: boolean; favoriteId: string | null }> {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_eventId: { userId, eventId } },
    select: { id: true },
  });

  return {
    isFavorite: !!favorite,
    favoriteId: favorite?.id ?? null,
  };
}

/**
 * Récupère le nombre de favoris d'un utilisateur
 */
export async function getFavoritesCount(userId: string): Promise<number> {
  return prisma.favorite.count({ where: { userId } });
}
