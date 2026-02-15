/**
 * Validation schemas for disputes using Zod
 */

import { z } from 'zod';
import { DisputeReason } from '@/types';

export const createDisputeSchema = z.object({
  transactionId: z.string().uuid('ID transaction invalide'),
  
  reason: z.nativeEnum(DisputeReason, {
    errorMap: () => ({ message: 'Raison de litige invalide' }),
  }),
  
  description: z
    .string()
    .min(20, 'Description trop courte (minimum 20 caractères)')
    .max(2000, 'Description trop longue (maximum 2000 caractères)'),
  
  evidenceUrls: z
    .array(z.string().url('URL de preuve invalide'))
    .max(5, 'Maximum 5 preuves')
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
