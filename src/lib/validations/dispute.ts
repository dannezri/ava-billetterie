/**
 * Validation schemas for disputes using Zod
 * reason uses Prisma enum values (UPPERCASE) to match the DB and form payload
 */

import { z } from 'zod';

export const createDisputeSchema = z.object({
  transactionId: z.string().uuid('ID transaction invalide'),

  reason: z.enum(
    [
      'FAKE_TICKET',
      'NO_ACCESS',
      'DUPLICATE',
      'EVENT_CANCELLED',
      'WRONG_TICKET',
      'SELLER_NO_RESPONSE',
      'OTHER',
    ],
    { errorMap: () => ({ message: 'Raison de litige invalide' }) }
  ),

  description: z
    .string()
    .min(20, 'Description trop courte (minimum 20 caractères)')
    .max(2000, 'Description trop longue (maximum 2000 caractères)'),

  evidenceUrls: z
    .array(z.string().url('URL de preuve invalide'))
    .max(10, 'Maximum 10 preuves')
    .optional()
    .default([]),
});

export const resolveDisputeSchema = z.object({
  disputeId: z.string().uuid('ID litige invalide'),
  
  resolution: z.enum(['refund', 'release'], {
    errorMap: () => ({ message: 'Résolution invalide' }),
  }),
  
  resolutionNotes: z
    .string()
    .min(10, 'Notes trop courtes')
    .max(1000, 'Notes trop longues'),
});

export type CreateDisputeInput = z.infer<typeof createDisputeSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
