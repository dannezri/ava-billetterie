/**
 * Validation schemas for payments using Zod
 */

import { z } from 'zod';

export const createPaymentIntentSchema = z.object({
  ticketId: z.string().uuid('ID billet invalide'),
});

export const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'ID de paiement requis'),
  ticketId: z.string().uuid('ID billet invalide'),
});

export const releaseEscrowSchema = z.object({
  transactionId: z.string().uuid('ID transaction invalide'),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type ReleaseEscrowInput = z.infer<typeof releaseEscrowSchema>;
