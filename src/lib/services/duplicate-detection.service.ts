/**
 * Service de détection de doublons pour l'import Ticketmaster
 */

import { prisma } from '@/lib/db/prisma';

export type DuplicateStatus = 'new' | 'duplicate' | 'exists';

interface ICheckDuplicateParams {
  title: string;
  artist: string;
  event_date: Date;
  city: string;
}

export interface IDuplicateCheckResult {
  status: DuplicateStatus;
  reason?: string;
}

export class DuplicateDetectionService {
  /**
   * Vérifie si un événement est un doublon par rapport aux événements en DB.
   *
   * Logique :
   *   - "exists"    → même artiste + même ville + date à ±1 jour
   *   - "duplicate" → même artiste + même ville + date à ±3 jours
   *                   OU titre contient le nom de l'artiste + même ville + date à ±7 jours
   *   - "new"       → aucune correspondance
   */
  static async checkDuplicate(params: ICheckDuplicateParams): Promise<IDuplicateCheckResult> {
    const { artist, city, event_date } = params;

    const ms1Day = 24 * 60 * 60 * 1000;

    // ── 1. Correspondance exacte ───────────────────────────────────────────────
    const exactMatch = await prisma.event.findFirst({
      where: {
        artist: { equals: artist, mode: 'insensitive' },
        city: { equals: city, mode: 'insensitive' },
        eventDate: {
          gte: new Date(event_date.getTime() - ms1Day),
          lte: new Date(event_date.getTime() + ms1Day),
        },
      },
      select: { id: true, title: true, eventDate: true },
    });

    if (exactMatch) {
      return {
        status: 'exists',
        reason: `Déjà en DB : "${exactMatch.title}" (${new Date(exactMatch.eventDate).toLocaleDateString('fr-FR')})`,
      };
    }

    // ── 2. Correspondance similaire ────────────────────────────────────────────
    const similarMatch = await prisma.event.findFirst({
      where: {
        city: { equals: city, mode: 'insensitive' },
        eventDate: {
          gte: new Date(event_date.getTime() - 3 * ms1Day),
          lte: new Date(event_date.getTime() + 3 * ms1Day),
        },
        OR: [
          { artist: { equals: artist, mode: 'insensitive' } },
          { title: { contains: artist, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, eventDate: true },
    });

    if (similarMatch) {
      return {
        status: 'duplicate',
        reason: `Similaire à : "${similarMatch.title}" (${new Date(similarMatch.eventDate).toLocaleDateString('fr-FR')})`,
      };
    }

    return { status: 'new' };
  }
}
