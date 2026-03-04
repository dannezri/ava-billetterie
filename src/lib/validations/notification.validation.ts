/**
 * Validation schemas for notifications using Zod
 */

import { z } from 'zod';
import { NotificationType } from '@prisma/client';

/**
 * Schema pour récupérer les notifications
 */
export const getNotificationsSchema = z.object({
  unread: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
  type: z.nativeEnum(NotificationType).optional(),
});

/**
 * Schema pour marquer une notification comme lue
 */
export const markAsReadSchema = z.object({
  notificationId: z.string().uuid('ID notification invalide'),
});

/**
 * Schema pour marquer toutes les notifications comme lues
 */
export const markAllAsReadSchema = z.object({
  beforeDate: z.coerce.date().optional(),
});

/**
 * Schema pour supprimer une notification
 */
export const deleteNotificationSchema = z.object({
  notificationId: z.string().uuid('ID notification invalide'),
});

/**
 * Schema pour supprimer toutes les notifications lues
 */
export const deleteAllReadSchema = z.object({
  olderThanDays: z.coerce.number().int().positive().optional().default(30),
});

/**
 * Schema pour créer une notification (interne/admin)
 */
export const createNotificationSchema = z.object({
  userId: z.string().uuid('ID utilisateur invalide'),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1, 'Titre requis').max(255, 'Titre trop long'),
  message: z.string().min(1, 'Message requis').max(1000, 'Message trop long'),
  linkUrl: z.string().url('URL invalide').optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

/**
 * Schema pour obtenir le nombre de notifications non lues
 */
export const getUnreadCountSchema = z.object({
  type: z.nativeEnum(NotificationType).optional(),
});

// Type exports
export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type MarkAllAsReadInput = z.infer<typeof markAllAsReadSchema>;
export type DeleteNotificationInput = z.infer<typeof deleteNotificationSchema>;
export type DeleteAllReadInput = z.infer<typeof deleteAllReadSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type GetUnreadCountInput = z.infer<typeof getUnreadCountSchema>;
