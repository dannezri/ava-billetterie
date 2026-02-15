/**
 * Configuration et constantes de l'application
 */

// ============================================================================
// BUSINESS RULES
// ============================================================================

export const BUSINESS_RULES = {
  // Pricing
  MAX_TICKET_PRICE: 5000, // €5000
  MIN_TICKET_PRICE: 1, // €1
  PLATFORM_FEE_PERCENTAGE: 0.15, // 15%
  STRIPE_FEE_PERCENTAGE: 0.029, // 2.9%
  STRIPE_FEE_FIXED: 0.3, // €0.30

  // Escrow
  ESCROW_RELEASE_DAYS_AFTER_EVENT: 2, // J+2
  PAYMENT_RESERVATION_MINUTES: 15, // 15 minutes pour payer

  // Trust Score
  INITIAL_TRUST_SCORE: 50,
  MAX_TRUST_SCORE: 100,
  MIN_TRUST_SCORE: 0,
  TRUST_SCORE_PENALTY_DISPUTE_LOST: -20,
  TRUST_SCORE_BONUS_SUCCESSFUL_SALE: 5,
  TRUST_SCORE_SUSPENSION_THRESHOLD: 20, // Suspend account if < 20

  // Disputes
  MAX_DISPUTES_BEFORE_SUSPENSION: 3,
  DISPUTE_WINDOW_DAYS_BEFORE_EVENT: 1, // J-1
  DISPUTE_WINDOW_DAYS_AFTER_EVENT: 2, // J+2

  // File Upload
  MAX_PDF_SIZE_MB: 5,
  ALLOWED_FILE_TYPES: ['application/pdf'],

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ============================================================================
// API ROUTES
// ============================================================================

export const API_ROUTES = {
  // Tickets
  TICKETS_LIST: '/api/tickets',
  TICKETS_UPLOAD: '/api/tickets/upload',
  TICKETS_DETAIL: (id: string) => `/api/tickets/${id}`,
  TICKETS_VALIDATE: (id: string) => `/api/tickets/${id}/validate`,

  // Payments
  PAYMENTS_CREATE_INTENT: '/api/payments/create-intent',
  PAYMENTS_CONFIRM: '/api/payments/confirm',
  PAYMENTS_RELEASE_ESCROW: '/api/payments/release-escrow',

  // Auth & KYC
  AUTH_VERIFY_KYC: '/api/auth/verify-kyc',
  KYC_CREATE_SESSION: '/api/kyc/create-session',
  KYC_CHECK_STATUS: '/api/kyc/check-status',

  // Disputes
  DISPUTES_CREATE: '/api/disputes/create',
  DISPUTES_LIST: '/api/disputes',
  DISPUTES_DETAIL: (id: string) => `/api/disputes/${id}`,
  DISPUTES_RESOLVE: (id: string) => `/api/disputes/${id}/resolve`,

  // Webhooks
  WEBHOOKS_STRIPE: '/api/webhooks/stripe',

  // Health
  HEALTH_CHECK: '/api/health',
} as const;

// ============================================================================
// APP ROUTES (Frontend)
// ============================================================================

export const APP_ROUTES = {
  HOME: '/',
  BROWSE_TICKETS: '/tickets',
  TICKET_DETAIL: (id: string) => `/tickets/${id}`,
  
  // Seller
  SELL_TICKET: '/sell',
  MY_LISTINGS: '/seller/listings',
  MY_SALES: '/seller/sales',
  
  // Buyer
  MY_TICKETS: '/buyer/tickets',
  MY_PURCHASES: '/buyer/purchases',
  
  // Account
  PROFILE: '/account/profile',
  SETTINGS: '/account/settings',
  KYC_VERIFICATION: '/account/kyc',
  
  // Disputes
  DISPUTES: '/disputes',
  CREATE_DISPUTE: (transactionId: string) => `/disputes/create/${transactionId}`,
  
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_TICKETS_VALIDATION: '/admin/tickets',
  ADMIN_DISPUTES: '/admin/disputes',
  ADMIN_USERS: '/admin/users',
  
  // Legal
  TERMS: '/legal/terms',
  PRIVACY: '/legal/privacy',
  REFUND_POLICY: '/legal/refund-policy',
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Generic
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  
  // Auth & KYC
  KYC_NOT_VERIFIED: 'KYC_NOT_VERIFIED',
  KYC_ALREADY_VERIFIED: 'KYC_ALREADY_VERIFIED',
  INVALID_KYC_SESSION: 'INVALID_KYC_SESSION',
  
  // Tickets
  TICKET_ALREADY_SOLD: 'TICKET_ALREADY_SOLD',
  TICKET_EXPIRED: 'TICKET_EXPIRED',
  DUPLICATE_BARCODE: 'DUPLICATE_BARCODE',
  DUPLICATE_PDF_HASH: 'DUPLICATE_PDF_HASH',
  INVALID_PDF: 'INVALID_PDF',
  PRICE_EXCEEDS_ORIGINAL: 'PRICE_EXCEEDS_ORIGINAL',
  
  // Payments
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_ALREADY_PROCESSED: 'PAYMENT_ALREADY_PROCESSED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  ESCROW_ALREADY_RELEASED: 'ESCROW_ALREADY_RELEASED',
  
  // Disputes
  DISPUTE_WINDOW_CLOSED: 'DISPUTE_WINDOW_CLOSED',
  DISPUTE_ALREADY_EXISTS: 'DISPUTE_ALREADY_EXISTS',
  INVALID_DISPUTE_REASON: 'INVALID_DISPUTE_REASON',
  
  // Trust Score
  TRUST_SCORE_TOO_LOW: 'TRUST_SCORE_TOO_LOW',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
} as const;

// ============================================================================
// STRIPE CONFIGURATION
// ============================================================================

export const STRIPE_CONFIG = {
  PAYMENT_METHODS: ['card', 'sepa_debit'],
  CURRENCY: 'eur',
  LOCALE: 'fr',
  CONNECT_CAPABILITIES: ['card_payments', 'transfers'],
} as const;

// ============================================================================
// DATE FORMATS
// ============================================================================

export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  DISPLAY_WITH_TIME: 'dd/MM/yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  API: 'yyyy-MM-dd',
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const PATTERNS = {
  // Barcode patterns (examples, à adapter selon billetteries)
  BARCODE_FNAC: /^[A-Z0-9]{12,16}$/,
  BARCODE_TICKETMASTER: /^TM[0-9]{10}$/,
  BARCODE_SEETICKETS: /^[0-9]{13}$/,
  
  // Email
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Phone (format FR)
  PHONE_FR: /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/,
} as const;

// ============================================================================
// CACHE KEYS & TTL
// ============================================================================

export const CACHE = {
  KEYS: {
    USER: (id: string) => `user:${id}`,
    TICKET: (id: string) => `ticket:${id}`,
    EVENT: (id: string) => `event:${id}`,
  },
  TTL: {
    USER: 60 * 5, // 5 minutes
    TICKET: 60 * 2, // 2 minutes
    EVENT: 60 * 30, // 30 minutes
  },
} as const;

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

export const EMAIL_TEMPLATES = {
  TICKET_VALIDATION_APPROVED: 'ticket-validation-approved',
  TICKET_VALIDATION_REJECTED: 'ticket-validation-rejected',
  TICKET_PURCHASED: 'ticket-purchased',
  TICKET_SOLD: 'ticket-sold',
  ESCROW_RELEASED: 'escrow-released',
  DISPUTE_CREATED: 'dispute-created',
  DISPUTE_RESOLVED: 'dispute-resolved',
  KYC_REMINDER: 'kyc-reminder',
} as const;
