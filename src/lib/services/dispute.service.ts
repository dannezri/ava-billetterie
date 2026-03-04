/**
 * Dispute Service
 * Gère la logique métier des litiges entre acheteurs et vendeurs
 */

import { prisma } from '@/lib/db/prisma';
import { DisputeStatus } from '@prisma/client';
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

  // 3. Vérifier que la transaction est dans un statut éligible au litige
  // ESCROWED = séquestre actif, COMPLETED/RELEASED = paiement confirmé (post-concert J+1/J+2)
  const eligibleStatuses = ['ESCROWED', 'COMPLETED', 'RELEASED'];
  if (!eligibleStatuses.includes(transaction.status)) {
    throw new Error(`Dispute can only be opened for eligible transactions (current: ${transaction.status})`);
  }

  // 4. Vérifier la période de validité (J-1 à J+2)
  // En développement, ce check peut être désactivé via SKIP_DISPUTE_DATE_CHECK=true
  const skipDateCheck = process.env.SKIP_DISPUTE_DATE_CHECK === 'true';

  if (!skipDateCheck) {
    const now = new Date();
    const eventDate = new Date(transaction.ticket.event.eventDate);
    const oneDayBefore = new Date(eventDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    const twoDaysAfter = new Date(eventDate);
    twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);

    if (now < oneDayBefore || now > twoDaysAfter) {
      throw new Error('Dispute can only be opened between D-1 and D+2 of the event');
    }
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

  // Notifier le vendeur (fire-and-forget)
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
      messages: {
        where: { isInternal: false },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
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
  if (!['ESCROWED', 'COMPLETED', 'RELEASED'].includes(transaction.status)) return false;

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
 * Ajoute un message à la timeline d'un litige
 */
export async function addDisputeMessage(
  disputeId: string,
  authorId: string,
  message: string,
  attachmentUrls?: string[]
) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { transaction: true },
  });

  if (!dispute) throw new Error('Dispute not found');

  const isReporter = dispute.reporterId === authorId;
  const isBuyer = dispute.transaction.buyerId === authorId;
  const isSeller = dispute.transaction.sellerId === authorId;

  if (!isReporter && !isBuyer && !isSeller) {
    throw new Error('Forbidden: You cannot add a message to this dispute');
  }

  if (dispute.status === 'CLOSED' || dispute.status === 'RESOLVED_REFUND' || dispute.status === 'RESOLVED_RELEASE') {
    throw new Error('Cannot add messages to a closed or resolved dispute');
  }

  const newMessage = await prisma.disputeMessage.create({
    data: {
      disputeId,
      authorId,
      message,
      attachments: attachmentUrls && attachmentUrls.length > 0 ? attachmentUrls : undefined,
      isInternal: false,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  await prisma.dispute.update({
    where: { id: disputeId },
    data: { updatedAt: new Date() },
  });

  return newMessage;
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
