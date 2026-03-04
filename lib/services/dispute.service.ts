/**
 * Dispute Service
 * Gère la logique métier des litiges entre acheteurs et vendeurs
 * 
 * Note: Le schema Prisma utilise @map() → camelCase dans le code
 * Champs existants: id, transactionId, reporterId, reason, description,
 *                   evidenceUrls, status, resolutionNotes, resolvedAt, createdAt
 */

import { prisma } from '@/lib/db/prisma';
import { DisputeStatus, DisputeReason, TransactionStatus } from '@prisma/client';
import type { CreateDisputeInput } from '@/lib/validations/dispute';
import { NotificationService } from '@/lib/services/notification.service';

/**
 * Crée un nouveau litige
 */
export async function createDispute(data: CreateDisputeInput, reporterId: string) {
  const { transactionId, reason, description, evidenceUrls } = data;

  // 1. Vérifier que la transaction existe et appartient à l'utilisateur
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      ticket: {
        include: {
          event: true,
        },
      },
      dispute: true,
    },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.buyerId !== reporterId) {
    throw new Error('Forbidden: Only the buyer can open a dispute');
  }

  // 2. Vérifier qu'il n'y a pas déjà un litige
  if (transaction.dispute) {
    throw new Error('A dispute already exists for this transaction');
  }

  // 3. Vérifier que la transaction est en séquestre
  if (transaction.status !== 'ESCROWED') {
    throw new Error('Dispute can only be opened for escrowed transactions');
  }

  // 4. Vérifier la période de validité (J-1 à J+2)
  const now = new Date();
  const eventDate = new Date(transaction.ticket.event.eventDate);
  const oneDayBefore = new Date(eventDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  const twoDaysAfter = new Date(eventDate);
  twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);

  if (now < oneDayBefore || now > twoDaysAfter) {
    throw new Error('Dispute can only be opened between D-1 and D+2 of the event');
  }

  // 5. Créer le litige dans une transaction Prisma
  const dispute = await prisma.$transaction(async (tx) => {
    // Créer le litige
    const newDispute = await tx.dispute.create({
      data: {
        transactionId,
        reporterId,
        reason,
        description,
        evidenceUrls: evidenceUrls || [],
        status: 'OPEN',
      },
    });

    // Mettre à jour la transaction (status DISPUTED)
    await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'DISPUTED',
      },
    });

    return newDispute;
  });

  // Notifier le vendeur (hors transaction Prisma pour ne pas bloquer)
  NotificationService.notifyDisputeOpened({
    userId: transaction.sellerId,
    disputeId: dispute.id,
    eventName: transaction.ticket.event.title,
    reason: reason,
  }).catch(() => null);

  return dispute;
}

/**
 * Récupère les litiges d'un utilisateur (acheteur ou vendeur)
 */
export async function getUserDisputes(
  userId: string,
  filters: {
    status?: DisputeStatus;
    role?: 'buyer' | 'seller';
  } = {}
) {
  const { status, role } = filters;

  // Construire les conditions WHERE
  const whereConditions: any = {
    OR: [
      { reporterId: userId }, // Litiges ouverts par l'utilisateur
      {
        transaction: {
          sellerId: userId, // Litiges concernant ses ventes
        },
      },
    ],
  };

  // Filtre par statut
  if (status) {
    whereConditions.status = status;
  }

  // Filtre par rôle
  if (role === 'buyer') {
    whereConditions.OR = [{ reporterId: userId }];
  } else if (role === 'seller') {
    whereConditions.OR = [{ transaction: { sellerId: userId } }];
  }

  const disputes = await prisma.dispute.findMany({
    where: whereConditions,
    include: {
      transaction: {
        include: {
          ticket: {
            include: {
              event: {
                select: {
                  id: true,
                  title: true,
                  artist: true,
                  eventDate: true,
                  venue: true,
                  city: true,
                },
              },
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return disputes;
}

/**
 * Récupère un litige par son ID (avec vérification accès)
 */
export async function getDisputeById(disputeId: string, userId: string) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      transaction: {
        include: {
          ticket: {
            include: {
              event: true,
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              trustScore: true,
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
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!dispute) {
    throw new Error('Dispute not found');
  }

  // Vérifier que l'utilisateur est impliqué (acheteur, vendeur, ou admin)
  const isReporter = dispute.reporterId === userId;
  const isBuyer = dispute.transaction.buyerId === userId;
  const isSeller = dispute.transaction.sellerId === userId;

  if (!isReporter && !isBuyer && !isSeller) {
    throw new Error('Forbidden: You do not have access to this dispute');
  }

  return dispute;
}

/**
 * Vérifie si un utilisateur peut ouvrir un litige sur une transaction
 */
export async function canOpenDispute(transactionId: string, userId: string): Promise<boolean> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      ticket: {
        include: {
          event: true,
        },
      },
      dispute: true,
    },
  });

  if (!transaction) return false;
  if (transaction.buyerId !== userId) return false;
  if (transaction.dispute) return false;
  if (transaction.status !== 'ESCROWED') return false;

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
 * Ajoute un message/preuve à un litige existant
 */
export async function addDisputeEvidence(
  disputeId: string,
  userId: string,
  evidenceUrl: string
) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      transaction: true,
    },
  });

  if (!dispute) {
    throw new Error('Dispute not found');
  }

  // Vérifier que l'utilisateur est impliqué
  const isReporter = dispute.reporterId === userId;
  const isSeller = dispute.transaction.sellerId === userId;

  if (!isReporter && !isSeller) {
    throw new Error('Forbidden: You cannot add evidence to this dispute');
  }

  // Ajouter l'URL aux preuves existantes
  const currentEvidence = (dispute.evidenceUrls as string[]) || [];
  const updatedEvidence = [...currentEvidence, evidenceUrl];

  return prisma.dispute.update({
    where: { id: disputeId },
    data: {
      evidenceUrls: updatedEvidence,
    },
  });
}

/**
 * Compte les litiges ouverts d'un utilisateur
 */
export async function getOpenDisputesCount(userId: string): Promise<number> {
  return prisma.dispute.count({
    where: {
      OR: [
        { reporterId: userId },
        { transaction: { sellerId: userId } },
      ],
      status: {
        in: ['OPEN', 'INVESTIGATING'],
      },
    },
  });
}
