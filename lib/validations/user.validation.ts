/**
 * Validation schemas for user management using Zod
 */

import { z } from 'zod';

/**
 * Schema pour mettre à jour le profil utilisateur
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'Prénom trop court').max(100, 'Prénom trop long').optional(),
  lastName: z.string().min(2, 'Nom trop court').max(100, 'Nom trop long').optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Format de téléphone invalide (E.164)')
    .optional()
    .nullable(),
  avatarUrl: z.string().url('URL avatar invalide').optional().nullable(),
});

/**
 * Schema pour uploader un avatar
 */
export const uploadAvatarSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, {
    message: 'La taille du fichier ne doit pas dépasser 5MB',
  }),
  // .refine((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), {
  //   message: 'Format de fichier invalide (JPG, PNG, WebP uniquement)',
  // }),
});

/**
 * Schema pour changer le mot de passe
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      ),
    confirmPassword: z.string().min(1, 'Confirmation requise'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

/**
 * Schema pour les préférences de notification
 */
export const updatePreferencesSchema = z.object({
  notificationEmail: z.boolean().optional(),
  notificationSms: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

/**
 * Schema pour activer la 2FA
 */
export const enable2FASchema = z.object({
  totpCode: z.string().length(6, 'Code à 6 chiffres requis').regex(/^\d{6}$/, 'Code invalide'),
});

/**
 * Schema pour désactiver la 2FA
 */
export const disable2FASchema = z.object({
  password: z.string().min(1, 'Mot de passe requis'),
  totpCode: z.string().length(6, 'Code à 6 chiffres requis').regex(/^\d{6}$/, 'Code invalide'),
});

/**
 * Schema pour vérifier un code 2FA
 */
export const verify2FASchema = z.object({
  totpCode: z.string().length(6, 'Code à 6 chiffres requis').regex(/^\d{6}$/, 'Code invalide'),
});

/**
 * Schema pour supprimer le compte
 */
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Mot de passe requis pour confirmer'),
  confirmations: z
    .array(z.enum(['irreversible', 'data_loss', 'tickets_cancelled']))
    .length(3, 'Toutes les confirmations sont requises'),
  deleteReason: z.string().max(500, 'Raison trop longue').optional().nullable(),
});

/**
 * Schema pour obtenir les sessions actives
 */
export const getActiveSessionsSchema = z.object({
  includeCurrentSession: z.boolean().optional().default(true),
});

/**
 * Schema pour révoquer une session
 */
export const revokeSessionSchema = z.object({
  sessionId: z.string().min(1, 'ID session requis'),
});

/**
 * Schema pour exporter les données (RGPD)
 */
export const exportDataSchema = z.object({
  format: z.enum(['json', 'csv']).optional().default('json'),
  includeTransactions: z.boolean().optional().default(true),
  includeReviews: z.boolean().optional().default(true),
  includeNotifications: z.boolean().optional().default(false),
});

// Type exports
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UploadAvatarInput = z.infer<typeof uploadAvatarSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type Enable2FAInput = z.infer<typeof enable2FASchema>;
export type Disable2FAInput = z.infer<typeof disable2FASchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type GetActiveSessionsInput = z.infer<typeof getActiveSessionsSchema>;
export type RevokeSessionInput = z.infer<typeof revokeSessionSchema>;
export type ExportDataInput = z.infer<typeof exportDataSchema>;
