/**
 * Configuration centralisée des variables d'environnement
 * Avec validation et typage fort
 */

/**
 * Type pour les environnements supportés
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Configuration de l'application basée sur l'environnement
 */
export interface AppConfig {
  env: Environment;
  isDevelopment: boolean;
  isProduction: boolean;
  isStaging: boolean;
  isTest: boolean;
  appUrl: string;
  appName: string;
}

/**
 * Configuration de la base de données
 */
export interface DatabaseConfig {
  url: string;
}

/**
 * Configuration Supabase
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

/**
 * Configuration NextAuth
 */
export interface AuthConfig {
  url: string;
  secret: string;
}

/**
 * Configuration Stripe
 */
export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  identityReturnUrl: string;
}

/**
 * Configuration upload de fichiers
 */
export interface UploadConfig {
  provider: 'uploadcare' | 'cloudinary';
  uploadcare?: {
    publicKey: string;
    secretKey: string;
  };
  cloudinary?: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
}

/**
 * Configuration email
 */
export interface EmailConfig {
  provider: 'resend' | 'sendgrid';
  apiKey: string;
  from: string;
}

/**
 * Configuration monitoring
 */
export interface MonitoringConfig {
  sentry?: {
    dsn: string;
  };
  posthog?: {
    key: string;
    host: string;
  };
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  enableDisputes: boolean;
  enableReviews: boolean;
  maxTicketPrice: number;
}

/**
 * Configuration complète de l'application
 */
export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
  supabase: SupabaseConfig;
  auth: AuthConfig;
  stripe: StripeConfig;
  upload: UploadConfig;
  email: EmailConfig;
  monitoring: MonitoringConfig;
  features: FeatureFlags;
}

/**
 * Récupère une variable d'environnement avec validation
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  
  return value;
}

/**
 * Récupère une variable d'environnement optionnelle
 */
function getOptionalEnvVar(key: string, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue;
}

/**
 * Récupère une variable d'environnement booléenne
 */
function getBooleanEnvVar(key: string, defaultValue = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Récupère une variable d'environnement numérique
 */
function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Détermine l'environnement actuel
 */
function getCurrentEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  
  if (nodeEnv === 'test') return 'test';
  if (appUrl.includes('staging')) return 'staging';
  if (nodeEnv === 'production') return 'production';
  return 'development';
}

/**
 * Crée la configuration de l'application
 */
function createAppConfig(): AppConfig {
  const env = getCurrentEnvironment();
  
  return {
    env,
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isStaging: env === 'staging',
    isTest: env === 'test',
    appUrl: getEnvVar('NEXT_PUBLIC_APP_URL'),
    appName: getOptionalEnvVar('NEXT_PUBLIC_APP_NAME', 'Ava') || 'Ava',
  };
}

/**
 * Crée la configuration de la base de données
 */
function createDatabaseConfig(): DatabaseConfig {
  return {
    url: getEnvVar('DATABASE_URL'),
  };
}

/**
 * Crée la configuration Supabase
 */
function createSupabaseConfig(): SupabaseConfig {
  return {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  };
}

/**
 * Crée la configuration NextAuth
 */
function createAuthConfig(): AuthConfig {
  return {
    url: getEnvVar('NEXTAUTH_URL'),
    secret: getEnvVar('NEXTAUTH_SECRET'),
  };
}

/**
 * Crée la configuration Stripe
 */
function createStripeConfig(): StripeConfig {
  return {
    publishableKey: getEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    secretKey: getEnvVar('STRIPE_SECRET_KEY'),
    webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET'),
    identityReturnUrl: getEnvVar('STRIPE_IDENTITY_VERIFICATION_SESSION_RETURN_URL'),
  };
}

/**
 * Crée la configuration upload
 */
function createUploadConfig(): UploadConfig {
  const uploadcareKey = getOptionalEnvVar('NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY');
  const cloudinaryName = getOptionalEnvVar('CLOUDINARY_CLOUD_NAME');
  
  if (uploadcareKey) {
    return {
      provider: 'uploadcare',
      uploadcare: {
        publicKey: uploadcareKey,
        secretKey: getEnvVar('UPLOADCARE_SECRET_KEY'),
      },
    };
  }
  
  if (cloudinaryName) {
    return {
      provider: 'cloudinary',
      cloudinary: {
        cloudName: cloudinaryName,
        apiKey: getEnvVar('CLOUDINARY_API_KEY'),
        apiSecret: getEnvVar('CLOUDINARY_API_SECRET'),
      },
    };
  }
  
  throw new Error('No upload provider configured (Uploadcare or Cloudinary)');
}

/**
 * Crée la configuration email
 */
function createEmailConfig(): EmailConfig {
  const resendKey = getOptionalEnvVar('RESEND_API_KEY');
  const sendgridKey = getOptionalEnvVar('SENDGRID_API_KEY');
  
  if (resendKey) {
    return {
      provider: 'resend',
      apiKey: resendKey,
      from: getEnvVar('NEXT_PUBLIC_EMAIL_FROM'),
    };
  }
  
  if (sendgridKey) {
    return {
      provider: 'sendgrid',
      apiKey: sendgridKey,
      from: getEnvVar('NEXT_PUBLIC_EMAIL_FROM'),
    };
  }
  
  throw new Error('No email provider configured (Resend or SendGrid)');
}

/**
 * Crée la configuration monitoring
 */
function createMonitoringConfig(): MonitoringConfig {
  const config: MonitoringConfig = {};
  
  const sentryDsn = getOptionalEnvVar('SENTRY_DSN');
  if (sentryDsn) {
    config.sentry = { dsn: sentryDsn };
  }
  
  const posthogKey = getOptionalEnvVar('NEXT_PUBLIC_POSTHOG_KEY');
  if (posthogKey) {
    config.posthog = {
      key: posthogKey,
      host: getOptionalEnvVar('NEXT_PUBLIC_POSTHOG_HOST', 'https://app.posthog.com') || 'https://app.posthog.com',
    };
  }
  
  return config;
}

/**
 * Crée la configuration des feature flags
 */
function createFeatureFlags(): FeatureFlags {
  return {
    enableDisputes: getBooleanEnvVar('NEXT_PUBLIC_ENABLE_DISPUTES', true),
    enableReviews: getBooleanEnvVar('NEXT_PUBLIC_ENABLE_REVIEWS', false),
    maxTicketPrice: getNumberEnvVar('NEXT_PUBLIC_MAX_TICKET_PRICE', 5000),
  };
}

/**
 * Initialise et valide la configuration complète
 */
function initConfig(): Config {
  try {
    return {
      app: createAppConfig(),
      database: createDatabaseConfig(),
      supabase: createSupabaseConfig(),
      auth: createAuthConfig(),
      stripe: createStripeConfig(),
      upload: createUploadConfig(),
      email: createEmailConfig(),
      monitoring: createMonitoringConfig(),
      features: createFeatureFlags(),
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Configuration error:', error.message);
    }
    throw error;
  }
}

/**
 * Configuration de l'application (singleton)
 */
export const config = initConfig();

/**
 * Helpers pour accéder à la configuration
 */
export const isProduction = config.app.isProduction;
export const isDevelopment = config.app.isDevelopment;
export const isStaging = config.app.isStaging;
export const isTest = config.app.isTest;
export const appUrl = config.app.appUrl;

/**
 * Exporte la configuration par défaut
 */
export default config;
