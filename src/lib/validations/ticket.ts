/**
 * Validation schemas for tickets using Zod
 */

import { z } from 'zod';
import { BUSINESS_RULES } from '@/config/constants';

export const ticketUploadSchema = z.object({
  eventId: z.string().uuid('ID événement invalide'),
  
  originalPrice: z
    .number()
    .min(BUSINESS_RULES.MIN_TICKET_PRICE, 'Prix minimum €1')
    .max(BUSINESS_RULES.MAX_TICKET_PRICE, 'Prix maximum €5000'),
  
  sellingPrice: z
    .number()
    .min(BUSINESS_RULES.MIN_TICKET_PRICE, 'Prix minimum €1')
    .max(BUSINESS_RULES.MAX_TICKET_PRICE, 'Prix maximum €5000'),
  
  seatCategory: z
    .string()
    .min(2, 'Catégorie trop courte')
    .max(100, 'Catégorie trop longue'),
  
  seatNumber: z
    .string()
    .max(50, 'Numéro de siège trop long')
    .optional()
    .nullable(),
  
  pdfUrl: z.string().url('URL PDF invalide'),
  
  barcodeNumber: z
    .string()
    .min(5, 'Code-barres invalide')
    .max(50, 'Code-barres trop long')
    .optional()
    .nullable(),
}).refine(
  (data) => data.sellingPrice <= data.originalPrice,
  {
    message: 'Le prix de vente ne peut pas dépasser le prix facial',
    path: ['sellingPrice'],
  }
);

export const ticketSearchSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  artist: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z
    .number()
    .int()
    .positive()
    .max(BUSINESS_RULES.MAX_PAGE_SIZE)
    .default(BUSINESS_RULES.DEFAULT_PAGE_SIZE),
});

export const ticketValidationSchema = z.object({
  ticketId: z.string().uuid(),
  approved: z.boolean(),
  rejectionReason: z.string().min(10).max(500).optional(),
});

export type TicketUploadInput = z.infer<typeof ticketUploadSchema>;
export type TicketSearchInput = z.infer<typeof ticketSearchSchema>;
export type TicketValidationInput = z.infer<typeof ticketValidationSchema>;
