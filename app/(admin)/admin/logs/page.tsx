'use client';

import { useEffect, useState, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { RefreshCw, ScrollText, ShieldCheck } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/DataTable';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: string;
  action: string;
  metadata: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  ADMIN_ACTION: { label: 'Action Admin', color: 'bg-purple-100 text-purple-800' },
  TICKET_UPLOAD: { label: 'Upload Billet', color: 'bg-blue-100 text-blue-800' },
  TICKET_RESERVED: { label: 'Réservation', color: 'bg-yellow-100 text-yellow-800' },
  TICKET_PURCHASE: { label: 'Achat', color: 'bg-green-100 text-green-800' },
  PAYMENT: { label: 'Paiement', color: 'bg-emerald-100 text-emerald-800' },
  PAYMENT_FAILED: { label: 'Paiement échoué', color: 'bg-red-100 text-red-800' },
  PAYMENT_SUCCEEDED: { label: 'Paiement réussi', color: 'bg-green-100 text-green-800' },
  DISPUTE_CREATED: { label: 'Litige créé', color: 'bg-orange-100 text-orange-800' },
  KYC_ATTEMPT: { label: 'KYC', color: 'bg-indigo-100 text-indigo-800' },
};

const MetaPreview = ({ meta }: { meta: Record<string, any> }) => {
  const key = Object.keys(meta)[0];
  const subAction = meta.action || meta.type || meta.event_type;

  return (
    <div className="text-xs text-gray-500 max-w-[250px] truncate">
      {subAction ? (
        <span className="font-medium text-gray-700">{subAction}</span>
      ) : key ? (
        <span>
          {key}: {String(meta[key]).slice(0, 50)}
        </span>
      ) : null}
    </div>
  );
};

export default function AdminLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(actionFilter !== 'all' && { action: actionFilter }),
      });
      const res = await fetch(`/api/admin/logs?${params}`);
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      setLogs(data.logs || []);
      setPagination(data.pagination);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les logs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [actionFilter, toast]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const columns: ColumnDef<AuditLog>[] = [
    {
      id: 'timestamp',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {format(new Date(row.original.createdAt), 'dd MMM HH:mm:ss', { locale: fr })}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const cfg = ACTION_LABELS[row.original.action] || {
          label: row.original.action,
          color: 'bg-gray-100 text-gray-700',
        };
        return (
          <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', cfg.color)}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      id: 'user',
      header: 'Utilisateur',
      cell: ({ row }) => (
        <div className="text-xs">
          {row.original.user ? (
            <>
              <p className="text-gray-900">{row.original.user.name || row.original.user.email}</p>
              <p className="text-gray-400">{row.original.user.email}</p>
            </>
          ) : (
            <span className="text-gray-400">Système</span>
          )}
        </div>
      ),
    },
    {
      id: 'details',
      header: 'Détails',
      cell: ({ row }) => <MetaPreview meta={row.original.metadata} />,
    },
    {
      id: 'ip',
      header: 'IP',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-400">
          {row.original.ipAddress || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            <span className="font-medium text-gray-900">{pagination.total.toLocaleString('fr-FR')}</span> logs RGPD
          </div>
          <span className="text-xs text-gray-400">(conservés 3 ans)</span>
        </div>

        <div className="flex items-center gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Filtrer par action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              <SelectItem value="ADMIN_ACTION">Actions admin</SelectItem>
              <SelectItem value="TICKET_UPLOAD">Uploads billet</SelectItem>
              <SelectItem value="TICKET_PURCHASE">Achats</SelectItem>
              <SelectItem value="PAYMENT_SUCCEEDED">Paiements OK</SelectItem>
              <SelectItem value="PAYMENT_FAILED">Paiements échoués</SelectItem>
              <SelectItem value="DISPUTE_CREATED">Litiges</SelectItem>
              <SelectItem value="KYC_ATTEMPT">KYC</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => fetchLogs(pagination.page)} disabled={loading}>
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        pagination={pagination}
        onPageChange={(page) => fetchLogs(page)}
        isLoading={loading}
        emptyMessage="Aucun log trouvé"
        emptyDescription="Aucun log d'audit ne correspond à vos critères."
      />
    </div>
  );
}
