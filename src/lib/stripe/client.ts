/**
 * Stripe client configuration
 * ✅ Utilise le module de configuration centralisé
 */

import Stripe from 'stripe';
import { config } from '@/config/env';

export const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-04-10',
  typescript: true,
});

/**
 * Client Stripe avec API version récente pour les paiements
 * (PaymentIntents, charges côté acheteur)
 */
export const stripePayments = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  typescript: true,
});

export default stripe;
