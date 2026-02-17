/**
 * Gestionnaire d'erreurs Stripe pour l'affichage utilisateur
 */

import { Stripe } from 'stripe';

export interface FriendlyError {
  title: string;
  message: string;
  code?: string;
}

/**
 * Traduit une erreur Stripe en message convivial pour l'utilisateur
 */
export function getFriendlyStripeError(error: any): FriendlyError {
  // Erreur brute Stripe
  if (error?.type) {
    switch (error.type) {
      case 'StripeCardError':
        return handleCardError(error);
      case 'StripeInvalidRequestError':
        return {
          title: 'Erreur de requête',
          message: 'Les informations envoyées sont incomplètes ou invalides. Veuillez vérifier vos saisies.',
          code: error.code,
        };
      case 'StripeConnectionError':
        return {
          title: 'Erreur de connexion',
          message: 'Impossible de contacter le serveur de paiement. Vérifiez votre connexion internet.',
          code: 'connection_error',
        };
      case 'StripeAuthenticationError':
        return {
          title: 'Erreur technique',
          message: 'Une erreur d\'authentification est survenue. Veuillez contacter le support.',
          code: 'auth_error',
        };
      case 'StripeRateLimitError':
        return {
          title: 'Serveur surchargé',
          message: 'Trop de requêtes en même temps. Veuillez réessayer dans quelques instants.',
          code: 'rate_limit',
        };
    }
  }

  // Erreur générique
  return {
    title: 'Une erreur est survenue',
    message: error?.message || 'Une erreur inattendue s\'est produite lors du traitement du paiement.',
    code: 'unknown',
  };
}

function handleCardError(error: any): FriendlyError {
  switch (error.code) {
    case 'card_declined':
      return {
        title: 'Carte refusée',
        message: 'Votre carte a été refusée par la banque. Veuillez essayer une autre carte.',
        code: error.code,
      };
    case 'expired_card':
      return {
        title: 'Carte expirée',
        message: 'Votre carte a expiré. Veuillez utiliser une carte valide.',
        code: error.code,
      };
    case 'incorrect_cvc':
      return {
        title: 'CVC incorrect',
        message: 'Le code de sécurité (CVC) est incorrect. Vérifiez les 3 chiffres au dos de votre carte.',
        code: error.code,
      };
    case 'processing_error':
      return {
        title: 'Erreur de traitement',
        message: 'Une erreur est survenue lors du traitement de la carte. Veuillez réessayer.',
        code: error.code,
      };
    case 'insufficient_funds':
      return {
        title: 'Solde insuffisant',
        message: 'Votre compte ne dispose pas des fonds nécessaires pour effectuer cette transaction.',
        code: error.code,
      };
    default:
      return {
        title: 'Problème de carte',
        message: error.message || 'Votre carte ne peut pas être débitée pour le moment.',
        code: error.code,
      };
  }
}
