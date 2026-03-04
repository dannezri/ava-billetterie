/**
 * Transaction Service
 * Gère la logique métier des transactions (achats de billets)
 */

import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
import type {
  GetUserPurchasesInput,
  GetTransactionByIdInput,
  DownloadTicketInput,
} from '@/lib/validations/transaction.validation';

/**
 * Récupère les achats d'un utilisateur avec filtres
 */
export async function getUserPurchases(userId: string, filters: GetUserPurchasesInput) {
  const { filter = 'all', page = 1, limit = 20 } = filters;

  // Conditions de filtrage (camelCase = noms Prisma via @map)
  const whereConditions: Prisma.TransactionWhereInput = {
    buyerId: userId,
    status: {
      in: ['PENDING', 'COMPLETED', 'ESCROWED', 'RELEASED', 'DISPUTED', 'REFUNDED'],
    },
  };

  // Filtre par date événement
  if (filter === 'upcoming') {
    whereConditions.ticket = {
      event: {
        eventDate: { gt: new Date() },
      },
    };
  } else if (filter === 'past') {
    whereConditions.ticket = {
      event: {
        eventDate: { lte: new Date() },
      },
    };
  }

  // Query paginée
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: whereConditions,
      include: {
        ticket: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                artist: true,
                venue: true,
                city: true,
                eventDate: true,
                imageUrl: true,
              },
            },
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                trustScore: true,
              },
            },
          },
        },
        dispute: {
          select: {
            id: true,
            status: true,
            reason: true,
          },
        },
        review: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where: whereConditions }),
  ]);

  // Statistiques
  const stats = {
    total,
    upcoming: await prisma.transaction.count({
      where: {
        buyerId: userId,
        status: { in: ['COMPLETED', 'ESCROWED', 'RELEASED'] },
        ticket: {
          event: {
            eventDate: { gt: new Date() },
          },
        },
      },
    }),
    past: await prisma.transaction.count({
      where: {
        buyerId: userId,
        status: { in: ['COMPLETED', 'ESCROWED', 'RELEASED'] },
        ticket: {
          event: {
            eventDate: { lte: new Date() },
          },
        },
      },
    }),
  };

  return {
    transactions,
    stats,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Récupère une transaction par son ID (avec vérification ownership)
 */
export async function getTransactionById(transactionId: string, userId: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      ticket: {
        include: {
          event: true,
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              trustScore: true,
              createdAt: true,
            },
          },
        },
      },
      buyer: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          trustScore: true,
        },
      },
      dispute: true,
      review: true,
    },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Vérification ownership (buyer ou seller)
  if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
    throw new Error('Forbidden: You do not have access to this transaction');
  }

  // Calculer les reviews moyens du vendeur
  const sellerReviews = await prisma.review.aggregate({
    where: {
      reviewedUserId: transaction.sellerId,
    },
    _avg: {
      rating: true,
    },
    _count: true,
  });

  return {
    transaction,
    seller: {
      ...transaction.seller,
      avg_rating: sellerReviews._avg.rating || 0,
      reviews_count: sellerReviews._count,
    },
  };
}

/**
 * Vérifie si l'utilisateur peut télécharger le billet
 */
export async function canDownloadTicket(transactionId: string, userId: string): Promise<boolean> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    select: {
      buyerId: true,
      status: true,
    },
  });

  if (!transaction) return false;
  if (transaction.buyerId !== userId) return false;

  // Téléchargeable dès que le paiement est confirmé (COMPLETED ou plus)
  return ['COMPLETED', 'ESCROWED', 'RELEASED'].includes(transaction.status);
}

/**
 * Vérifie si l'utilisateur peut ouvrir un litige
 */
export async function canOpenDispute(transactionId: string, userId: string): Promise<boolean> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      ticket: {
        include: {
          event: {
            select: {
              eventDate: true,
            },
          },
        },
      },
      dispute: true,
    },
  });

  if (!transaction) return false;
  if (transaction.buyerId !== userId) return false;
  if (transaction.dispute) return false; // Litige déjà existant
  if (!['COMPLETED', 'ESCROWED'].includes(transaction.status)) return false;

  // Vérifier période J-1 à J+2
  const now = new Date();
  const eventDate = new Date(transaction.ticket.event.eventDate);
  const oneDayBefore = new Date(eventDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  const twoDaysAfter = new Date(eventDate);
  twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);

  return now >= oneDayBefore && now <= twoDaysAfter;
}

/**
 * Vérifie si l'utilisateur peut laisser un avis
 */
export async function canLeaveReview(transactionId: string, userId: string): Promise<boolean> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      ticket: {
        include: {
          event: {
            select: {
              eventDate: true,
            },
          },
        },
      },
      review: true,
    },
  });

  if (!transaction) return false;
  if (transaction.buyerId !== userId) return false;
  if (transaction.review) return false; // Avis déjà existant
  if (transaction.status !== 'RELEASED') return false;

  // Vérifier période J+3 minimum
  const now = new Date();
  const eventDate = new Date(transaction.ticket.event.eventDate);
  const threeDaysAfter = new Date(eventDate);
  threeDaysAfter.setDate(threeDaysAfter.getDate() + 3);

  return now >= threeDaysAfter;
}

/**
 * Récupère les statistiques d'un acheteur
 */
export async function getBuyerStats(userId: string) {
  const [totalPurchases, totalSpentResult, upcomingConcerts] = await Promise.all([
    prisma.transaction.count({
      where: {
        buyerId: userId,
        status: { in: ['COMPLETED', 'ESCROWED', 'RELEASED'] },
      },
    }),
    // $queryRaw pour l'agrégation SUM (snake_case = noms colonnes DB)
    prisma.$queryRaw<Array<{ total: number | null }>>`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE buyer_id = ${userId}
        AND status IN ('COMPLETED', 'ESCROWED', 'RELEASED')
    `,
    prisma.transaction.count({
      where: {
        buyerId: userId,
        status: { in: ['COMPLETED', 'ESCROWED', 'RELEASED'] },
        ticket: {
          event: {
            eventDate: { gt: new Date() },
          },
        },
      },
    }),
  ]);

  return {
    totalPurchases,
    totalSpent: Number(totalSpentResult[0]?.total || 0),
    upcomingConcerts,
  };
}

/**
 * Récupère les prochains concerts d'un acheteur (dashboard)
 * Utilise $queryRaw pour performance (snake_case = noms colonnes DB)
 */
export async function getUpcomingConcerts(userId: string, limit = 3) {
  const results = await prisma.$queryRaw<Array<{
    transaction_id: string;
    status: string;
    event_id: string;
    title: string;
    artist: string;
    venue: string;
    city: string;
    event_date: Date;
    image_url: string | null;
  }>>`
    SELECT 
      t.id as transaction_id,
      t.status::text,
      e.id as event_id,
      e.title,
      e.artist,
      e.venue as venue,
      e.city,
      e.event_date,
      e.image_url
    FROM transactions t
    JOIN tickets tk ON tk.id = t.ticket_id
    JOIN events e ON e.id = tk.event_id
    WHERE t.buyer_id = ${userId}
      AND t.status IN ('COMPLETED', 'ESCROWED', 'RELEASED')
      AND e.event_date > NOW()
    ORDER BY e.event_date ASC
    LIMIT ${limit}
  `;

  // Transformer en format attendu par le frontend
  return results.map(r => ({
    id: r.transaction_id,
    status: r.status,
    ticket: {
      event: {
        id: r.event_id,
        title: r.title,
        artist: r.artist,
        venue: r.venue,
        city: r.city,
        eventDate: r.event_date,
        imageUrl: r.image_url,
      },
    },
  }));
}

/**
 * Calcule le temps restant avant libération du séquestre
 */
export function getTimeUntilRelease(escrowReleaseDate: Date): {
  isPast: boolean;
  days: number;
  hours: number;
  minutes: number;
} {
  const now = new Date();
  const release = new Date(escrowReleaseDate);

  if (release <= now) {
    return { isPast: true, days: 0, hours: 0, minutes: 0 };
  }

  const diff = release.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { isPast: false, days, hours, minutes };
}

/**
 * Récupère les données consolidées pour le dashboard acheteur
 */
export async function getDashboardData(userId: string) {
  // Récupérer l'activité récente via $queryRaw (snake_case = noms colonnes DB)
  const recentActivity = await prisma.$queryRaw<Array<{
    id: string;
    user_id: string | null;
    action: string;
    metadata: any;
    created_at: Date;
  }>>`
    SELECT id, user_id, action::text, metadata, created_at
    FROM audit_logs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 5
  `;
  
  const [stats, upcomingConcerts] = await Promise.all([
    getBuyerStats(userId),
    getUpcomingConcerts(userId, 3),
  ]);

  // Vérifier statut du compte via ORM (camelCase = noms Prisma)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  return {
    stats,
    upcomingConcerts,
    recentActivity,
    accountStatus: {
      emailVerified: true, // Géré par Supabase Auth
      profileComplete: !!(user?.name && user.name.trim().length > 0),
    },
  };
}
