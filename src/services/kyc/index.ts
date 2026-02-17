/**
 * Service KYC (Know Your Customer) via Stripe Identity
 */

import stripe from '@/lib/stripe/client';
import prisma from '@/lib/db/prisma';

/**
 * Créer une session de vérification d'identité Stripe
 * 
 * @param userId - ID de l'utilisateur (Prisma)
 * @param email - Email de l'utilisateur (pré-remplissage Stripe)
 * @returns La session de vérification (contenant le client_secret)
 */
export async function createVerificationSession(userId: string, email: string) {
  try {
    // 1. Vérifier si l'utilisateur a déjà une session active ou vérifiée
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true, kycProviderId: true },
    });

    if (user?.kycStatus === 'VERIFIED') {
      throw new Error('L\'identité de cet utilisateur est déjà vérifiée.');
    }

    // 2. Créer la session de vérification Stripe
    console.log(`🔍 Création session KYC pour userId: ${userId}`);
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      metadata: {
        user_id: userId, // Utilisation de snake_case pour éviter les problèmes de parsing
      },
      options: {
        document: {
          require_matching_selfie: true, // Demander un selfie pour comparer avec la pièce d'identité
        },
      },
    });

    // 3. Sauvegarder l'ID de session dans la base de données
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycProviderId: verificationSession.id,
        // On ne change pas le statut tout de suite, on attend le webhook
      },
    });

    // 4. Logger l'action
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'KYC_ATTEMPT',
        metadata: {
          sessionId: verificationSession.id,
          status: verificationSession.status,
        },
        ipAddress: 'system', // À améliorer si possible avec l'IP réelle
        userAgent: 'system',
      },
    });

    return {
      clientSecret: verificationSession.client_secret,
      id: verificationSession.id,
      status: verificationSession.status,
      url: verificationSession.url, // URL hébergée par Stripe (fallback si pas de modal)
    };
  } catch (error) {
    console.error('Erreur lors de la création de la session KYC:', error);
    throw new Error('Impossible de créer la session de vérification d\'identité.');
  }
}

/**
 * Récupérer les détails d'une session de vérification
 */
export async function getVerificationSession(sessionId: string) {
  try {
    const session = await stripe.identity.verificationSessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Erreur lors de la récupération de la session KYC:', error);
    throw new Error('Impossible de récupérer la session KYC.');
  }
}

/**
 * Traiter le résultat d'une vérification (appelé par webhook)
 */
export async function handleVerificationResult(sessionId: string, status: 'verified' | 'requires_input') {
  // Cette fonction sera utilisée par le webhook
  const session = await getVerificationSession(sessionId);
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('Aucun userId trouvé dans les métadonnées de la session KYC:', sessionId);
    return;
  }

  if (status === 'verified') {
    // Succès
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'VERIFIED',
        verifiedIdentity: true,
      },
    });
    console.log(`✅ KYC vérifié pour l'utilisateur ${userId}`);
  } else if (status === 'requires_input') {
    // Échec ou incomplet (ex: photo floue)
    // On peut notifier l'utilisateur ici
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'REJECTED', // Ou laisser en PENDING selon la logique métier
        verifiedIdentity: false,
      },
    });
    console.log(`⚠️ KYC nécessite une action pour l'utilisateur ${userId} : ${session.last_error?.reason}`);
  }
}
