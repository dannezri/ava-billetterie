/**
 * Review Service
 * Gère la logique métier des avis (ratings) des vendeurs
 * 
 * Note: Le schema Prisma utilise @map() → camelCase dans le code
 * Champs existants: id, transactionId, reviewerId, reviewedUserId, rating, comment, createdAt
 * Pas de champ is_published en DB.
 */

import { prisma } from '@/lib/db/prisma';
import type { CreateReviewInput, GetUserReviewsInput } from '@/lib/validations/review.validation';

/**
 * Crée un nouvel avis
 */
export async function createReview(data: CreateReviewInput, reviewerId: string) {
  const { transactionId, reviewedUserId, rating, comment } = data;

  // 1. Vérifier que la transaction existe et appartient à l'utilisateur
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      ticket: {
        include: {
          event: true,
        },
      },
      review: true,
    },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.buyerId !== reviewerId) {
    throw new Error('Forbidden: Only the buyer can leave a review');
  }

  // 2. Vérifier qu'il n'y a pas déjà un avis
  if (transaction.review) {
    throw new Error('A review already exists for this transaction');
  }

  // 3. Vérifier que la transaction est finalisée (RELEASED)
  if (transaction.status !== 'RELEASED') {
    throw new Error('Review can only be left for released transactions');
  }

  // 4. Vérifier la période de validité (J+3 minimum)
  const now = new Date();
  const eventDate = new Date(transaction.ticket.event.eventDate);
  const threeDaysAfter = new Date(eventDate);
  threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);

  if (now < threeDaysAfter) {
    throw new Error('Review can only be left 3 days after the event');
  }

  // 5. Vérifier que reviewedUserId correspond au vendeur
  if (reviewedUserId !== transaction.sellerId) {
    throw new Error('ReviewedUserId must match the seller of the transaction');
  }

  // 6. Créer l'avis
  const review = await prisma.review.create({
    data: {
      transactionId,
      reviewerId,
      reviewedUserId,
      rating,
      comment: comment || null,
    },
  });

  return review;
}

/**
 * Récupère les avis d'un vendeur
 */
export async function getUserReviews(userId: string, filters: GetUserReviewsInput) {
  const { page = 1, limit = 10 } = filters;

  const [reviews, total, stats] = await Promise.all([
    prisma.review.findMany({
      where: {
        reviewedUserId: userId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
          },
        },
        transaction: {
          select: {
            id: true,
            ticket: {
              select: {
                event: {
                  select: {
                    title: true,
                    eventDate: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({
      where: {
        reviewedUserId: userId,
      },
    }),
    // Statistiques des avis
    prisma.review.groupBy({
      by: ['rating'],
      where: {
        reviewedUserId: userId,
      },
      _count: {
        rating: true,
      },
    }),
  ]);

  // Calculer moyenne et distribution
  const totalReviews = stats.reduce((sum, stat) => sum + stat._count.rating, 0);
  const weightedSum = stats.reduce((sum, stat) => sum + stat.rating * stat._count.rating, 0);
  const avgRating = totalReviews > 0 ? weightedSum / totalReviews : 0;

  const distribution = {
    5: stats.find((s) => s.rating === 5)?._count.rating || 0,
    4: stats.find((s) => s.rating === 4)?._count.rating || 0,
    3: stats.find((s) => s.rating === 3)?._count.rating || 0,
    2: stats.find((s) => s.rating === 2)?._count.rating || 0,
    1: stats.find((s) => s.rating === 1)?._count.rating || 0,
  };

  return {
    reviews,
    stats: {
      total,
      avg_rating: Number(avgRating.toFixed(1)),
      distribution,
    },
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Récupère un avis par son ID
 */
export async function getReviewById(reviewId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviewedUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      transaction: {
        include: {
          ticket: {
            include: {
              event: true,
            },
          },
        },
      },
    },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  return review;
}

/**
 * Vérifie si un utilisateur peut laisser un avis
 */
export async function canLeaveReview(transactionId: string, userId: string): Promise<boolean> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      ticket: {
        include: {
          event: true,
        },
      },
      review: true,
    },
  });

  if (!transaction) return false;
  if (transaction.buyerId !== userId) return false;
  if (transaction.review) return false;
  if (transaction.status !== 'RELEASED') return false;

  // Vérifier période J+3
  const now = new Date();
  const eventDate = new Date(transaction.ticket.event.eventDate);
  const threeDaysAfter = new Date(eventDate);
  threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);

  return now >= threeDaysAfter;
}

/**
 * Supprime un avis (utilisateur peut supprimer son propre avis)
 */
export async function deleteReview(reviewId: string, userId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  // Vérifier ownership
  if (review.reviewerId !== userId) {
    throw new Error('Forbidden: You can only delete your own reviews');
  }

  return prisma.review.delete({
    where: { id: reviewId },
  });
}

/**
 * Met à jour un avis
 */
export async function updateReview(
  reviewId: string,
  userId: string,
  data: { rating?: number; comment?: string | null }
) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  // Vérifier ownership
  if (review.reviewerId !== userId) {
    throw new Error('Forbidden: You can only update your own reviews');
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.comment !== undefined && { comment: data.comment }),
    },
  });
}

/**
 * Calcule le trust score impact d'un vendeur basé sur ses avis
 */
export async function calculateTrustScoreFromReviews(userId: string): Promise<number> {
  const reviews = await prisma.review.aggregate({
    where: {
      reviewedUserId: userId,
    },
    _avg: {
      rating: true,
    },
    _count: true,
  });

  if (!reviews._count || reviews._count === 0) {
    return 70; // Score par défaut
  }

  const avgRating = reviews._avg.rating || 0;
  const reviewCount = reviews._count;

  // Formule : (avgRating / 5) * 100 avec bonus pour nombre d'avis
  let score = (avgRating / 5) * 100;

  // Bonus pour nombre d'avis (max +10 points)
  const reviewBonus = Math.min(reviewCount * 0.5, 10);
  score += reviewBonus;

  return Math.round(Math.min(score, 100));
}
