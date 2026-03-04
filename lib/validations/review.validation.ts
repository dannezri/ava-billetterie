/**
 * Validation schemas for reviews using Zod
 */

import { z } from 'zod';

/**
 * Schema pour créer un avis
 */
export const createReviewSchema = z.object({
  transactionId: z.string().uuid('ID transaction invalide'),
  reviewedUserId: z.string().uuid('ID utilisateur invalide'),
  rating: z
    .number()
    .int('La note doit être un nombre entier')
    .min(1, 'La note minimum est 1')
    .max(5, 'La note maximum est 5'),
  comment: z
    .string()
    .max(500, 'Le commentaire ne peut pas dépasser 500 caractères')
    .optional()
    .nullable(),
});

/**
 * Schema pour récupérer les avis d'un utilisateur
 */
export const getUserReviewsSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

/**
 * Schema pour récupérer un avis par ID
 */
export const getReviewByIdSchema = z.object({
  reviewId: z.string().uuid('ID avis invalide'),
});

/**
 * Schema pour modifier un avis (utilisateur)
 */
export const updateReviewSchema = z.object({
  reviewId: z.string().uuid('ID avis invalide'),
  rating: z
    .number()
    .int('La note doit être un nombre entier')
    .min(1, 'La note minimum est 1')
    .max(5, 'La note maximum est 5')
    .optional(),
  comment: z
    .string()
    .max(500, 'Le commentaire ne peut pas dépasser 500 caractères')
    .optional()
    .nullable(),
});

/**
 * Schema pour supprimer un avis
 */
export const deleteReviewSchema = z.object({
  reviewId: z.string().uuid('ID avis invalide'),
});

/**
 * Schema pour modérer un avis (admin)
 */
export const moderateReviewSchema = z.object({
  reviewId: z.string().uuid('ID avis invalide'),
  isPublished: z.boolean(),
  moderationNotes: z.string().max(1000).optional().nullable(),
});

/**
 * Schema pour signaler un avis inapproprié
 */
export const flagReviewSchema = z.object({
  reviewId: z.string().uuid('ID avis invalide'),
  reason: z.string().min(10, 'Raison trop courte').max(500, 'Raison trop longue'),
});

// Type exports
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type GetUserReviewsInput = z.infer<typeof getUserReviewsSchema>;
export type GetReviewByIdInput = z.infer<typeof getReviewByIdSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
export type FlagReviewInput = z.infer<typeof flagReviewSchema>;
