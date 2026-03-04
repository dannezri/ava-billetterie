/**
 * Event Validation Schemas
 * Schémas Zod pour validation des paramètres événements
 */

import { z } from 'zod';

/**
 * Schéma de validation pour les filtres d'événements
 */
export const eventFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
  sort: z.enum([
    'relevance',
    'date_asc',
    'date_desc',
    'price_min',
    'popularity',
  ]).default('relevance'),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  cities: z.string().optional(), // Comma-separated
  categories: z.string().optional(), // Comma-separated
  artists: z.string().optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().positive().optional(),
});

/**
 * Schéma de validation pour la recherche
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query cannot be empty').max(200),
  type: z.enum(['all', 'events', 'artists', 'cities']).default('all'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

/**
 * Schéma de validation pour ID
 */
export const eventIdSchema = z.object({
  id: z.string().uuid('Invalid event ID'),
});

export const ticketIdSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket ID'),
});

/**
 * Types inférés depuis les schémas
 */
export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type EventIdInput = z.infer<typeof eventIdSchema>;
export type TicketIdInput = z.infer<typeof ticketIdSchema>;
