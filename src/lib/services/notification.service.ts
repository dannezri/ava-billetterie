/**
 * Notification Service
 * Gère la création, lecture et suppression des notifications utilisateurs
 */

import { prisma } from '@/lib/db/prisma';
import { NotificationType, NotificationPriority, Prisma } from '@prisma/client';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  ctaText?: string;
  metadata?: Record<string, unknown>;
  priority?: NotificationPriority;
  expiresAt?: Date;
}

export class NotificationService {
  static async create(params: CreateNotificationParams) {
    return prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        linkUrl: params.linkUrl,
        ctaText: params.ctaText,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
        priority: params.priority ?? 'MEDIUM',
        expiresAt: params.expiresAt,
      },
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async delete(notificationId: string, userId: string) {
    return prisma.notification.delete({
      where: { id: notificationId, userId },
    });
  }

  static async deleteAllRead(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });
  }

  static async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  static async getMany(
    userId: string,
    opts: {
      type?: NotificationType;
      isRead?: boolean;
      period?: 'today' | '7days' | '30days';
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const where: Prisma.NotificationWhereInput = { userId };

    if (opts.type) where.type = opts.type;
    if (opts.isRead !== undefined) where.isRead = opts.isRead;

    if (opts.period) {
      const now = new Date();
      const periodMap: Record<string, Date> = {
        today: new Date(new Date().setHours(0, 0, 0, 0)),
        '7days': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30days': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };
      where.createdAt = { gte: periodMap[opts.period] };
    }

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: opts.limit ?? 50,
      skip: opts.offset ?? 0,
    });
  }

  // ─── Helpers métier ───────────────────────────────────────────────────────

  static async notifyPurchaseConfirmed(p: {
    userId: string;
    transactionId: string;
    eventName: string;
    amount: number;
  }) {
    return this.create({
      userId: p.userId,
      type: 'TRANSACTION',
      title: 'Achat confirmé',
      message: `Votre achat pour ${p.eventName} est confirmé. Montant : ${p.amount.toFixed(2)}€`,
      linkUrl: `/my-purchases/${p.transactionId}`,
      ctaText: 'Voir mes billets',
      metadata: { transaction_id: p.transactionId, amount: p.amount },
      priority: 'HIGH',
    });
  }

  static async notifyTicketSold(p: {
    userId: string;
    transactionId: string;
    eventName: string;
    amount: number;
  }) {
    return this.create({
      userId: p.userId,
      type: 'TRANSACTION',
      title: 'Billet vendu !',
      message: `Votre billet pour ${p.eventName} a été vendu. Paiement : ${p.amount.toFixed(2)}€`,
      linkUrl: `/dashboard/seller`,
      ctaText: 'Voir vente',
      metadata: { transaction_id: p.transactionId, amount: p.amount },
      priority: 'HIGH',
    });
  }

  static async notifyEscrowReleased(p: {
    userId: string;
    transactionId: string;
    amount: number;
  }) {
    return this.create({
      userId: p.userId,
      type: 'TRANSACTION',
      title: 'Paiement reçu',
      message: `Le séquestre a été libéré. ${p.amount.toFixed(2)}€ transféré vers votre compte.`,
      linkUrl: `/dashboard/seller/withdraw`,
      ctaText: 'Voir mes revenus',
      metadata: { transaction_id: p.transactionId, amount: p.amount },
      priority: 'HIGH',
    });
  }

  static async notifyDisputeOpened(p: {
    userId: string;
    disputeId: string;
    eventName: string;
    reason: string;
  }) {
    return this.create({
      userId: p.userId,
      type: 'DISPUTE',
      title: 'Litige ouvert contre votre vente',
      message: `Un acheteur a ouvert un litige pour ${p.eventName}. Raison : ${p.reason}`,
      linkUrl: `/disputes/${p.disputeId}`,
      ctaText: 'Répondre au litige',
      metadata: { dispute_id: p.disputeId },
      priority: 'URGENT',
    });
  }

  static async notifyDisputeResolved(p: {
    userId: string;
    disputeId: string;
    outcome: 'REFUND_BUYER' | 'RELEASE_SELLER';
    amount?: number;
    resolutionNotes: string;
  }) {
    const forBuyer = p.outcome === 'REFUND_BUYER';
    return this.create({
      userId: p.userId,
      type: 'DISPUTE',
      title: forBuyer ? 'Litige résolu en votre faveur' : 'Litige résolu',
      message: forBuyer
        ? `Remboursement de ${p.amount?.toFixed(2)}€ effectué. ${p.resolutionNotes}`
        : `Le litige a été résolu. ${p.resolutionNotes}`,
      linkUrl: `/disputes/${p.disputeId}`,
      ctaText: 'Voir détails',
      metadata: { dispute_id: p.disputeId, outcome: p.outcome },
      priority: 'HIGH',
    });
  }

  static async notifyNewTicketForFollowedEvent(p: {
    userId: string;
    eventId: string;
    eventName: string;
    ticketId: string;
    price: number;
    category: string;
  }) {
    return this.create({
      userId: p.userId,
      type: 'PRICE_ALERT',
      title: 'Nouveau billet disponible',
      message: `Billet pour ${p.eventName} à ${p.price.toFixed(2)}€ (catégorie ${p.category})`,
      linkUrl: `/events/${p.eventId}`,
      ctaText: 'Voir billet',
      metadata: { event_id: p.eventId, ticket_id: p.ticketId, price: p.price },
      priority: 'MEDIUM',
    });
  }

  static async notifyPriceDrop(p: {
    userId: string;
    eventId: string;
    eventName: string;
    oldPrice: number;
    newPrice: number;
  }) {
    return this.create({
      userId: p.userId,
      type: 'PRICE_ALERT',
      title: 'Baisse de prix détectée',
      message: `${p.eventName} : nouveau prix ${p.newPrice.toFixed(2)}€ (était ${p.oldPrice.toFixed(2)}€)`,
      linkUrl: `/events/${p.eventId}`,
      ctaText: 'Voir billet',
      metadata: { event_id: p.eventId, old_price: p.oldPrice, new_price: p.newPrice },
      priority: 'MEDIUM',
    });
  }

  static async notifyKYCApproved(userId: string) {
    return this.create({
      userId,
      type: 'SYSTEM',
      title: 'Vérification KYC approuvée',
      message: 'Votre identité a été vérifiée. Vous pouvez maintenant retirer vos gains.',
      linkUrl: '/dashboard/seller/withdraw',
      ctaText: 'Retirer mes gains',
      priority: 'HIGH',
    });
  }

  static async notifyKYCRejected(userId: string) {
    return this.create({
      userId,
      type: 'SYSTEM',
      title: 'Vérification KYC rejetée',
      message: "Votre vérification d'identité a été rejetée. Veuillez soumettre à nouveau vos documents.",
      linkUrl: '/profile',
      ctaText: 'Mettre à jour',
      priority: 'HIGH',
    });
  }

  static async notifyDocumentExpiringSoon(p: { userId: string; days: number }) {
    return this.create({
      userId: p.userId,
      type: 'SYSTEM',
      title: "Document d'identité expire bientôt",
      message: `Votre pièce d'identité expire dans ${p.days} jours. Mettez-la à jour pour continuer à vendre.`,
      linkUrl: '/profile',
      ctaText: 'Mettre à jour',
      priority: 'MEDIUM',
      expiresAt: new Date(Date.now() + p.days * 24 * 60 * 60 * 1000),
    });
  }

  static async notifyEventFollowers(
    eventId: string,
    ticketId: string,
    price: number,
    category: string
  ) {
    const follows = await prisma.userEventFollow.findMany({
      where: { eventId, alertOnNewTicket: true },
      include: { event: true },
    });

    if (follows.length === 0) return;

    await Promise.all(
      follows.map((follow) =>
        this.notifyNewTicketForFollowedEvent({
          userId: follow.userId,
          eventId: follow.eventId,
          eventName: follow.event.title,
          ticketId,
          price,
          category: category || 'Standard',
        }).catch(() => null)
      )
    );
  }
}

// ── Compat exports fonctionnels ──────────────────────────────────────────────

export const createNotification = (data: CreateNotificationParams) =>
  NotificationService.create(data);

export const markAsRead = (id: string, userId: string) =>
  NotificationService.markAsRead(id, userId);

export const markAllAsRead = (userId: string) =>
  NotificationService.markAllAsRead(userId);

export const deleteNotification = (id: string, userId: string) =>
  NotificationService.delete(id, userId);

export const getUnreadCount = (userId: string) =>
  NotificationService.countUnread(userId);

export const getNotifications = (
  userId: string,
  filters: {
    unread?: boolean;
    page?: number;
    limit?: number;
    type?: NotificationType;
  }
) => {
  const offset = ((filters.page ?? 1) - 1) * (filters.limit ?? 20);
  return NotificationService.getMany(userId, {
    type: filters.type,
    isRead: filters.unread === true ? false : undefined,
    limit: filters.limit,
    offset,
  }).then(async (notifications) => {
    const unreadCount = await NotificationService.countUnread(userId);
    return {
      notifications,
      unreadCount,
      pagination: {
        total: notifications.length,
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        totalPages: 1,
      },
    };
  });
};
