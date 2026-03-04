/**
 * Validation schemas for transactions using Zod
 */

import { z } from 'zod';

/**
 * Schema pour réserver un billet (initier transaction)
 */
export const reserveTicketSchema = z.object({
  ticketId: z.string().uuid('ID billet invalide'),
});

/**
 * Schema pour récupérer la liste des achats
 */
export const getUserPurchasesSchema = z.object({
  filter: z.enum(['all', 'upcoming', 'past']).optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/**
 * Schema pour récupérer une transaction par ID
 */
export const getTransactionByIdSchema = z.object({
  transactionId: z.string().uuid('ID transaction invalide'),
});

/**
 * Schema pour télécharger le PDF d'un billet
 */
export const downloadTicketSchema = z.object({
  transactionId: z.string().uuid('ID transaction invalide'),
});

/**
 * Schema pour générer une facture
 */
export const generateInvoiceSchema = z.object({
  transactionId: z.string().uuid('ID transaction invalide'),
});

/**
 * Schema pour lister les factures
 */
export const listInvoicesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/**
 * Schema pour la libération du séquestre (cron job)
 */
export const releaseEscrowSchema = z.object({
  transactionId: z.string().uuid('ID transaction invalide'),
});

/**
 * Schema pour annuler une réservation expirée
 */
export const cancelExpiredReservationSchema = z.object({
  transactionId: z.string().uuid('ID transaction invalide'),
});

// Type exports
export type ReserveTicketInput = z.infer<typeof reserveTicketSchema>;
export type GetUserPurchasesInput = z.infer<typeof getUserPurchasesSchema>;
export type GetTransactionByIdInput = z.infer<typeof getTransactionByIdSchema>;
export type DownloadTicketInput = z.infer<typeof downloadTicketSchema>;
export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
export type ListInvoicesInput = z.infer<typeof listInvoicesSchema>;
export type ReleaseEscrowInput = z.infer<typeof releaseEscrowSchema>;
export type CancelExpiredReservationInput = z.infer<typeof cancelExpiredReservationSchema>;
