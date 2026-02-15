/**
 * Wrapper pour accéder à la configuration de l'application
 * Réexporte les éléments principaux de src/config/env.ts
 */

import { config, isProduction, isDevelopment, isStaging, isTest, appUrl } from '@/config/env';

export { config, isProduction, isDevelopment, isStaging, isTest, appUrl };

export default config;
