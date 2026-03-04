/**
 * Validation schemas for favorites using Zod
 */

import { z } from 'zod';

/**
 * Schema pour ajouter un événement aux favoris
 */
export const addFavoriteSchema = z.object({
  eventId: z.string().uuid('ID événement invalide'),
});

/**
 * Schema pour retirer un favori
 */
export const removeFavoriteSchema = z.object({
  favoriteId: z.string().uuid('ID favori invalide'),
});

/**
 * Schema pour récupérer les favoris d'un utilisateur
 */
export const getUserFavoritesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  sortBy: z.enum(['created_at', 'event_date']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Schema pour vérifier si un événement est en favori
 */
export const checkFavoriteSchema = z.object({
  eventId: z.string().uuid('ID événement invalide'),
});

/**
 * Schema pour les alertes prix (future feature)
 */
export const togglePriceAlertSchema = z.object({
  favoriteId: z.string().uuid('ID favori invalide'),
  priceAlert: z.boolean(),
  targetPrice: z.number().positive().optional().nullable(),
});

// Type exports
export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
export type RemoveFavoriteInput = z.infer<typeof removeFavoriteSchema>;
export type GetUserFavoritesInput = z.infer<typeof getUserFavoritesSchema>;
export type CheckFavoriteInput = z.infer<typeof checkFavoriteSchema>;
export type TogglePriceAlertInput = z.infer<typeof togglePriceAlertSchema>;
