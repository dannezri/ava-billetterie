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

export default stripe;
