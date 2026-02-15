/**
 * Type definitions for environment variables
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Database
    DATABASE_URL: string;

    // NextAuth / Supabase
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;

    // Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;

    // Stripe Identity (KYC)
    STRIPE_IDENTITY_VERIFICATION_SESSION_RETURN_URL: string;

    // File Upload (Uploadcare/Cloudinary)
    NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY: string;
    UPLOADCARE_SECRET_KEY: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;

    // Email (Resend/SendGrid)
    RESEND_API_KEY?: string;
    SENDGRID_API_KEY?: string;
    NEXT_PUBLIC_EMAIL_FROM: string;

    // Application
    NEXT_PUBLIC_APP_URL: string;
    NODE_ENV: 'development' | 'production' | 'test';

    // Security
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;

    // Monitoring
    SENTRY_DSN?: string;
    NEXT_PUBLIC_POSTHOG_KEY?: string;
    NEXT_PUBLIC_POSTHOG_HOST?: string;

    // Feature Flags
    NEXT_PUBLIC_ENABLE_DISPUTES?: string;
    NEXT_PUBLIC_ENABLE_REVIEWS?: string;
    NEXT_PUBLIC_MAX_TICKET_PRICE?: string;
  }
}
