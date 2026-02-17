'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type KYCStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

interface KYCStatusBadgeProps {
  status: KYCStatus;
  className?: string;
}

const statusConfig = {
  PENDING: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  VERIFIED: {
    label: 'Vérifié',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  REJECTED: {
    label: 'Rejeté',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function KYCStatusBadge({ status, className }: KYCStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(config.className, 'flex items-center gap-1.5', className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
