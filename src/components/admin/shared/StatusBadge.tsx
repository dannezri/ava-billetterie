import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType =
  | 'PENDING_VALIDATION'
  | 'ACTIVE'
  | 'RESERVED'
  | 'SOLD'
  | 'CANCELLED'
  | 'FLAGGED'
  | 'DRAFT'
  | 'PENDING'
  | 'ESCROWED'
  | 'RELEASED'
  | 'REFUNDED'
  | 'DISPUTED'
  | 'OPEN'
  | 'INVESTIGATING'
  | 'RESOLVED_REFUND'
  | 'RESOLVED_RELEASE'
  | 'CLOSED'
  | 'APPROVED'
  | 'REJECTED'
  | 'VERIFIED'
  | string;

interface StatusConfig {
  label: string;
  className: string;
}

const statusMap: Record<string, StatusConfig> = {
  // Ticket statuses
  DRAFT: { label: 'Brouillon', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  PENDING_VALIDATION: { label: 'En validation', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  ACTIVE: { label: 'Actif', className: 'bg-green-100 text-green-800 border-green-200' },
  RESERVED: { label: 'Réservé', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  SOLD: { label: 'Vendu', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  CANCELLED: { label: 'Annulé', className: 'bg-red-100 text-red-800 border-red-200' },
  FLAGGED: { label: 'Signalé', className: 'bg-orange-100 text-orange-800 border-orange-200' },

  // Transaction statuses
  PENDING: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  COMPLETED: { label: 'Confirmé', className: 'bg-green-100 text-green-800 border-green-200' },
  ESCROWED: { label: 'Séquestre', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  RELEASED: { label: 'Libéré', className: 'bg-green-100 text-green-800 border-green-200' },
  REFUNDED: { label: 'Remboursé', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  DISPUTED: { label: 'En litige', className: 'bg-red-100 text-red-800 border-red-200' },

  // Dispute statuses
  OPEN: { label: 'Ouvert', className: 'bg-red-100 text-red-800 border-red-200' },
  INVESTIGATING: { label: 'En cours', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  RESOLVED_REFUND: { label: 'Résolu (remb.)', className: 'bg-green-100 text-green-800 border-green-200' },
  RESOLVED_RELEASE: { label: 'Résolu (libéré)', className: 'bg-green-100 text-green-800 border-green-200' },
  CLOSED: { label: 'Clôturé', className: 'bg-gray-100 text-gray-700 border-gray-200' },

  // Verification statuses
  APPROVED: { label: 'Approuvé', className: 'bg-green-100 text-green-800 border-green-200' },
  REJECTED: { label: 'Rejeté', className: 'bg-red-100 text-red-800 border-red-200' },
  VERIFIED: { label: 'Vérifié', className: 'bg-green-100 text-green-800 border-green-200' },

  // KYC statuses
  KYC_PENDING: { label: 'KYC Attente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  KYC_VERIFIED: { label: 'KYC Vérifié', className: 'bg-green-100 text-green-800 border-green-200' },
  KYC_REJECTED: { label: 'KYC Rejeté', className: 'bg-red-100 text-red-800 border-red-200' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
