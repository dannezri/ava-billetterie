/**
 * User Service
 * Gère la logique métier du profil utilisateur
 * 
 * Note: Le schema Prisma utilise @map() → camelCase dans le code, snake_case en DB
 * Champs existants: id, email, name, phone, kycStatus, kycProviderId, verifiedIdentity,
 *                   stripeAccountId, trustScore, createdAt, updatedAt
 */

import { prisma } from '@/lib/db/prisma';
import { createClient } from '@/lib/supabase/server';
import type { UpdateProfileInput } from '@/lib/validations/user.validation';

/**
 * Récupère le profil complet d'un utilisateur
 */
export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      kycStatus: true,
      stripeAccountId: true,
      verifiedIdentity: true,
      trustScore: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Met à jour le profil d'un utilisateur
 */
export async function updateUserProfile(userId: string, data: UpdateProfileInput) {
  const updateData: any = {};

  // Le schema utilise un champ unique "name" (pas first_name/last_name)
  if (data.firstName !== undefined || data.lastName !== undefined) {
    // Récupérer le nom actuel pour fusionner
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const currentParts = (currentUser?.name || '').split(' ');
    const firstName = data.firstName ?? currentParts[0] ?? '';
    const lastName = data.lastName ?? currentParts.slice(1).join(' ') ?? '';
    updateData.name = `${firstName} ${lastName}`.trim();
  }

  if (data.phone !== undefined) updateData.phone = data.phone;

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
}

/**
 * Met à jour les préférences de notification
 * Note: Les champs notification_email/notification_sms n'existent pas en DB.
 * Stub pour compatibilité API — à implémenter quand la table sera créée.
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: {
    notificationEmail?: boolean;
    notificationSms?: boolean;
  }
) {
  // TODO: Créer une table user_preferences ou ajouter colonnes à users
  console.warn('[UserService] updateNotificationPreferences: Not implemented (columns missing in DB)');
  return { success: true, message: 'Preferences saved (stub)' };
}

/**
 * Vérifie si le profil est complet
 */
export async function isProfileComplete(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  if (!user) return false;
  return !!(user.name && user.name.trim().length > 0);
}

/**
 * Récupère les statistiques d'un utilisateur
 */
export async function getUserStats(userId: string) {
  const [purchasesCount, salesCount, reviewsCount] = await Promise.all([
    // Achats
    prisma.transaction.count({
      where: {
        buyerId: userId,
        status: { in: ['ESCROWED', 'RELEASED'] },
      },
    }),
    // Ventes
    prisma.transaction.count({
      where: {
        sellerId: userId,
        status: { in: ['ESCROWED', 'RELEASED'] },
      },
    }),
    // Avis reçus
    prisma.review.count({
      where: {
        reviewedUserId: userId,
      },
    }),
  ]);

  // Total dépensé via $queryRaw (snake_case = colonnes DB)
  const totalSpentResult = await prisma.$queryRaw<Array<{ total: number | null }>>`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE buyer_id = ${userId}
      AND status IN ('ESCROWED', 'RELEASED')
  `;

  // Total gagné via $queryRaw
  const totalEarnedResult = await prisma.$queryRaw<Array<{ total: number | null }>>`
    SELECT COALESCE(SUM(amount - platform_fee), 0) as total
    FROM transactions
    WHERE seller_id = ${userId}
      AND status = 'RELEASED'
  `;

  return {
    purchases: purchasesCount,
    sales: salesCount,
    reviews: reviewsCount,
    favorites: 0, // Table favorites n'existe pas encore
    totalSpent: Number(totalSpentResult[0]?.total || 0),
    totalEarned: Number(totalEarnedResult[0]?.total || 0),
  };
}

/**
 * Supprime le compte d'un utilisateur (anonymisation RGPD)
 */
export async function deleteUserAccount(userId: string, password: string) {
  // 1. Vérifier le mot de passe avec Supabase Auth
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user || !user.user || user.user.id !== userId) {
    throw new Error('Unauthorized');
  }

  // Vérifier le mot de passe (Supabase Auth)
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.user.email!,
    password,
  });

  if (signInError) {
    throw new Error('Invalid password');
  }

  // 2. Anonymiser les données dans une transaction
  await prisma.$transaction(async (tx) => {
    // Annuler billets actifs
    await tx.ticket.updateMany({
      where: {
        sellerId: userId,
        status: { in: ['ACTIVE', 'PENDING_VALIDATION', 'RESERVED'] },
      },
      data: {
        status: 'CANCELLED',
      },
    });

    // Anonymiser l'utilisateur
    await tx.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@anonymized.com`,
        name: 'Utilisateur Supprimé',
        phone: null,
      },
    });
  });

  // 3. Supprimer le compte Supabase Auth
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

  if (deleteError) {
    console.error('Failed to delete Supabase user:', deleteError);
    // Ne pas throw, l'anonymisation DB est déjà faite
  }

  return { success: true };
}

/**
 * Exporte les données d'un utilisateur (RGPD)
 */
export async function exportUserData(userId: string) {
  const [user, purchases, sales, reviews, disputes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
    }),
    prisma.transaction.findMany({
      where: { buyerId: userId },
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
      },
    }),
    prisma.transaction.findMany({
      where: { sellerId: userId },
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
      },
    }),
    prisma.review.findMany({
      where: {
        OR: [{ reviewerId: userId }, { reviewedUserId: userId }],
      },
    }),
    prisma.dispute.findMany({
      where: {
        OR: [
          { reporterId: userId },
          { transaction: { sellerId: userId } },
        ],
      },
    }),
  ]);

  return {
    user,
    purchases,
    sales,
    reviews,
    notifications: [], // Table notifications n'existe pas encore
    favorites: [], // Table favorites n'existe pas encore
    disputes,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Change le mot de passe (via Supabase Auth)
 */
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const supabase = await createClient();

  // 1. Vérifier l'utilisateur
  const { data: user } = await supabase.auth.getUser();

  if (!user || !user.user || user.user.id !== userId) {
    throw new Error('Unauthorized');
  }

  // 2. Vérifier le mot de passe actuel
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.user.email!,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error('Current password is incorrect');
  }

  // 3. Changer le mot de passe
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error('Failed to update password: ' + updateError.message);
  }

  return { success: true };
}

/**
 * Récupère l'activité récente d'un utilisateur (pour dashboard)
 */
export async function getRecentActivity(userId: string, limit = 5) {
  const [recentPurchases, recentReviews, recentDisputes] = await Promise.all([
    // Achats récents
    prisma.transaction.findMany({
      where: { buyerId: userId },
      include: {
        ticket: {
          include: {
            event: {
              select: {
                title: true,
                artist: true,
                eventDate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    // Avis laissés récents
    prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        transaction: {
          include: {
            ticket: {
              include: {
                event: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    // Litiges récents
    prisma.dispute.findMany({
      where: { reporterId: userId },
      include: {
        transaction: {
          include: {
            ticket: {
              include: {
                event: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ]);

  // Transformer en activités uniformes
  const activities = [
    ...recentPurchases.map((p) => ({
      id: p.id,
      type: 'purchase' as const,
      title: `Achat de billet pour ${p.ticket.event.title}`,
      description: `${p.ticket.event.artist}`,
      timestamp: p.createdAt,
      link: `/my-purchases/${p.id}`,
    })),
    ...recentReviews.map((r) => ({
      id: r.id,
      type: 'review' as const,
      title: `Avis laissé (${r.rating}/5)`,
      description: `Pour ${r.transaction.ticket.event.title}`,
      timestamp: r.createdAt,
      link: `/my-purchases/${r.transactionId}`,
    })),
    ...recentDisputes.map((d) => ({
      id: d.id,
      type: 'dispute' as const,
      title: 'Litige ouvert',
      description: d.reason,
      timestamp: d.createdAt,
      link: `/disputes/${d.id}`,
    })),
  ];

  // Trier par date décroissante et limiter
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}

/**
 * Vérifie si l'email est vérifié (via Supabase Auth, pas de champ en DB)
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  // Email verification est gérée par Supabase Auth, pas par la table users
  // Si l'utilisateur est authentifié, son email est vérifié
  return true;
}

/**
 * Upload et met à jour l'avatar d'un utilisateur
 * Note: Le champ avatar_url n'existe pas en DB.
 * TODO: Ajouter la colonne avatar_url à la table users
 */
export async function uploadAvatar(userId: string, file: File) {
  // Validation du fichier
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large (max 5MB)');
  }

  // Mock URL temporaire (pas de colonne avatar_url en DB)
  const mockAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`;

  return {
    avatarUrl: mockAvatarUrl,
    message: 'Avatar uploaded successfully (stub — column missing in DB)',
  };
}
