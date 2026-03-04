/**
 * Favorite Service
 * Gère la logique métier des favoris (wishlist événements)
 * 
 * ⚠️ IMPORTANT: La table "favorites" n'existe PAS encore en base de données.
 * Ce service est stubé pour éviter les crashes runtime.
 * TODO: Créer la table favorites via migration Prisma.
 */

import { prisma } from '@/lib/db/prisma';
import type { GetUserFavoritesInput } from '@/lib/validations/favorite.validation';

// Type stub pour Favorite
interface FavoriteStub {
  id: string;
  userId: string;
  eventId: string;
  createdAt: Date;
  event?: any;
}

/**
 * Ajoute un événement aux favoris (stub)
 */
export async function addFavorite(userId: string, eventId: string): Promise<FavoriteStub> {
  // Vérifier que l'événement existe (cette table existe bien)
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      artist: true,
      city: true,
      eventDate: true,
      imageUrl: true,
    },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  console.warn('[FavoriteService] addFavorite: Table favorites missing in DB (stub)');
  return {
    id: `stub-${Date.now()}`,
    userId,
    eventId,
    createdAt: new Date(),
    event,
  };
}

/**
 * Retire un événement des favoris (stub)
 */
export async function removeFavorite(favoriteId: string, userId: string) {
  console.warn('[FavoriteService] removeFavorite: Table favorites missing in DB (stub)');
  return { id: favoriteId };
}

/**
 * Retire un événement des favoris par event_id (stub)
 */
export async function removeFavoriteByEventId(userId: string, eventId: string) {
  console.warn('[FavoriteService] removeFavoriteByEventId: Table favorites missing in DB (stub)');
  return { userId, eventId };
}

/**
 * Récupère les favoris d'un utilisateur (stub)
 */
export async function getUserFavorites(userId: string, filters: GetUserFavoritesInput) {
  const { page = 1, limit = 20 } = filters;

  console.warn('[FavoriteService] getUserFavorites: Table favorites missing in DB (stub)');
  return {
    favorites: [],
    pagination: {
      total: 0,
      page,
      limit,
      totalPages: 0,
    },
  };
}

/**
 * Vérifie si un événement est en favori (stub)
 */
export async function isFavorite(userId: string, eventId: string): Promise<boolean> {
  return false;
}

/**
 * Récupère le nombre de favoris d'un utilisateur (stub)
 */
export async function getFavoritesCount(userId: string): Promise<number> {
  return 0;
}

/**
 * Récupère les favoris avec nouveaux billets disponibles (stub)
 */
export async function getFavoritesWithNewTickets(userId: string, sinceDays = 7) {
  console.warn('[FavoriteService] getFavoritesWithNewTickets: Table favorites missing in DB (stub)');
  return [];
}

/**
 * Toggle favori (stub)
 */
export async function toggleFavorite(userId: string, eventId: string) {
  console.warn('[FavoriteService] toggleFavorite: Table favorites missing in DB (stub)');
  return { action: 'added' as const, favorite: null };
}
