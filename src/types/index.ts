/**
 * Types principaux de l'application
 * Basé sur le schéma Prisma et les besoins métier
 */

// ============================================================================
// USER TYPES
// ============================================================================

export enum KYCStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export interface IUser {
  id: string;
  email: string;
  phone: string | null;
  kycStatus: KYCStatus;
  kycProviderId: string | null;
  stripeAccountId: string | null;
  trustScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface IEvent {
  id: string;
  name: string;
  artist: string;
  venue: string;
  city: string;
  eventDate: Date;
  doorsOpenTime: string | null;
  officialUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
}

// ============================================================================
// TICKET TYPES
// ============================================================================

export enum TicketStatus {
  DRAFT = 'draft',
  PENDING_VALIDATION = 'pending_validation',
  ACTIVE = 'active',
  RESERVED = 'reserved',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
  FLAGGED = 'flagged',
}

export enum TicketVerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface ITicket {
  id: string;
  eventId: string;
  event?: IEvent;
  sellerId: string;
  seller?: IUser;
  status: TicketStatus;
  originalPrice: number;
  sellingPrice: number;
  seatCategory: string;
  seatNumber: string | null;
  pdfUrl: string;
  pdfHash: string;
  barcodeNumber: string | null;
  verificationStatus: TicketVerificationStatus;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export enum TransactionStatus {
  PENDING = 'pending',
  ESCROWED = 'escrowed',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

export interface ITransaction {
  id: string;
  ticketId: string;
  ticket?: ITicket;
  buyerId: string;
  buyer?: IUser;
  sellerId: string;
  seller?: IUser;
  amount: number;
  platformFee: number;
  stripePaymentIntentId: string;
  stripeTransferId: string | null;
  status: TransactionStatus;
  escrowReleaseDate: Date;
  releasedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// DISPUTE TYPES
// ============================================================================

export enum DisputeReason {
  FAKE_TICKET = 'fake_ticket',
  NO_ACCESS = 'no_access',
  DUPLICATE = 'duplicate',
  OTHER = 'other',
}

export enum DisputeStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED_REFUND = 'resolved_refund',
  RESOLVED_RELEASE = 'resolved_release',
  CLOSED = 'closed',
}

export interface IDispute {
  id: string;
  transactionId: string;
  transaction?: ITransaction;
  reporterId: string;
  reporter?: IUser;
  reason: DisputeReason;
  description: string;
  evidenceUrls: string[];
  status: DisputeStatus;
  resolutionNotes: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface IReview {
  id: string;
  transactionId: string;
  transaction?: ITransaction;
  reviewerId: string;
  reviewer?: IUser;
  reviewedUserId: string;
  reviewedUser?: IUser;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export enum AuditAction {
  TICKET_UPLOAD = 'ticket_upload',
  KYC_ATTEMPT = 'kyc_attempt',
  PAYMENT = 'payment',
  DISPUTE_CREATED = 'dispute_created',
  ADMIN_ACTION = 'admin_action',
}

export interface IAuditLog {
  id: string;
  userId: string | null;
  user?: IUser;
  action: AuditAction;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
