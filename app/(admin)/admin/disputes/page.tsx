'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import {
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle,
  Flag,
  Clock,
  UserPlus,
  BarChart3,
} from 'lucide-react';
import { DataTable } from '@/components/admin/shared/DataTable';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { DisputesStatsHeader } from '@/components/admin/disputes/DisputesStatsHeader';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Dispute {
  id: string;
  status: string;
  reason: string;
  description: string | null;
  createdAt: string;
  resolvedAt: string | null;
  wait_hours: number;
  is_overdue_sla: boolean;
  is_urgent: boolean;
  assignedAdmin: { id: string; name: string | null; email: string } | null;
  reporter: { id: string; name: string | null; email: string };
  transaction: {
    id: string;
    amount: number;
    status: string;
    buyer: { id: string; name: string | null; email: string; trustScore: number };
    seller: { id: string; name: string | null; email: string; trustScore: number; disputesAsSellerCount: number };
    ticket: {
      id: string;
      event: { id: string; title: string };
    };
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const REASON_LABELS: Record<string, string> = {
  FAKE_TICKET: 'Billet frauduleux',
  NO_ACCESS: 'Accès refusé',
  DUPLICATE: 'Doublon',
  EVENT_CANCELLED: 'Événement annulé',
  WRONG_TICKET: 'Mauvais billet',
  SELLER_NO_RESPONSE: 'Vendeur muet',
  OTHER: 'Autre',
};

const formatEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);

export default function AdminDisputesPage() {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [slaFilter, setSlaFilter] = useState('all');
  const [stats, setStats] = useState({
    sla_exceeded: 0,
    urgent: 0,
    resolved_today: 0,
    avg_resolution_hours: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/disputes/stats');
      if (res.ok) {
        const data = await res.json();
        setStats({
          sla_exceeded: data.metrics.overdueDisputes,
          urgent: data.metrics.urgentDisputes,
          resolved_today: data.metrics.resolvedToday,
          avg_resolution_hours: data.metrics.avgResolutionHours,
        });
      }
    } catch {
      // silently ignore
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchDisputes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(reasonFilter !== 'all' && { reason: reasonFilter }),
        ...(slaFilter === 'overdue' && { urgent: 'true' }),
      });
      const res = await fetch(`/api/admin/disputes?${params}`);
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();

      // Compute is_urgent on client
      const now = Date.now();
      const enriched = (data.disputes || []).map((d: any) => ({
        ...d,
        is_urgent: d.wait_hours > 36 && !d.is_overdue_sla,
      }));

      // Filter SLA client-side if needed
      const filtered = slaFilter === 'ok'
        ? enriched.filter((d: any) => !d.is_overdue_sla && !d.is_urgent)
        : slaFilter === 'urgent'
        ? enriched.filter((d: any) => d.is_urgent)
        : slaFilter === 'overdue'
        ? enriched.filter((d: any) => d.is_overdue_sla)
        : enriched;

      setDisputes(filtered);
      setPagination(data.pagination);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les litiges', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, reasonFilter, slaFilter, toast]);

  useEffect(() => {
    fetchStats();
    fetchDisputes(1);
  }, [fetchStats, fetchDisputes]);

  const handleAssignToMe = async (disputeId: string) => {
    try {
      const res = await fetch(`/api/admin/disputes/${disputeId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: 'me' }),
      });
      if (res.ok) {
        toast({ title: 'Litige assigné à vous' });
        fetchDisputes(pagination.page);
      }
    } catch {
      toast({ title: 'Erreur assignation', variant: 'destructive' });
    }
  };

  const columns: ColumnDef<Dispute>[] = [
    {
      id: 'sla',
      header: 'SLA',
      cell: ({ row }) => {
        const d = row.original;
        if (d.status === 'RESOLVED_REFUND' || d.status === 'RESOLVED_RELEASE' || d.status === 'CLOSED') {
          return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
        if (d.is_overdue_sla) {
          return (
            <Badge className="bg-red-600 text-white text-xs gap-1">
              <AlertTriangle className="h-3 w-3" />
              {d.wait_hours}h
            </Badge>
          );
        }
        if (d.is_urgent) {
          return (
            <Badge className="bg-orange-500 text-white text-xs gap-1">
              <Clock className="h-3 w-3" />
              {d.wait_hours}h
            </Badge>
          );
        }
        return <span className="text-xs text-gray-400">{d.wait_hours}h</span>;
      },
    },
    {
      id: 'event',
      header: 'Litige',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-900 max-w-[180px] truncate">
            {row.original.transaction.ticket.event.title}
          </p>
          <Badge variant="outline" className="text-xs mt-0.5">
            {REASON_LABELS[row.original.reason] || row.original.reason}
          </Badge>
        </div>
      ),
    },
    {
      id: 'buyer',
      header: 'Acheteur',
      cell: ({ row }) => {
        const buyer = row.original.transaction.buyer;
        return (
          <div className="text-xs">
            <p className="font-medium text-gray-800">{buyer.name || buyer.email}</p>
            <p className="text-gray-400">Trust: {buyer.trustScore}/100</p>
          </div>
        );
      },
    },
    {
      id: 'seller',
      header: 'Vendeur',
      cell: ({ row }) => {
        const seller = row.original.transaction.seller;
        const isRecidivist = seller.disputesAsSellerCount >= 3;
        return (
          <div className="text-xs">
            <p className={cn('font-medium flex items-center gap-1', isRecidivist ? 'text-red-700' : 'text-gray-800')}>
              {seller.name || seller.email}
              {isRecidivist && <AlertTriangle className="h-3 w-3" />}
            </p>
            <p className="text-gray-400">
              Trust: {seller.trustScore}/100 · {seller.disputesAsSellerCount} litiges
            </p>
          </div>
        );
      },
    },
    {
      id: 'amount',
      header: 'Montant',
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900">
          {formatEuro(row.original.transaction.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'opened',
      header: 'Ouvert le',
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
          {format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr })}
        </span>
      ),
    },
    {
      id: 'assigned',
      header: 'Assigné à',
      cell: ({ row }) => {
        const admin = row.original.assignedAdmin;
        if (!admin) {
          return (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={(e) => { e.stopPropagation(); handleAssignToMe(row.original.id); }}
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Assigner
            </Button>
          );
        }
        return (
          <div className="flex items-center gap-1.5">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                {(admin.name || admin.email).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600">{admin.name || admin.email}</span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild className="h-7 px-2">
          <Link href={`/admin/disputes/${row.original.id}`}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Voir
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des litiges</h1>
          <p className="text-sm text-gray-500 mt-0.5">SLA : 48 heures maximum · Tri par ancienneté</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/disputes/stats">
              <BarChart3 className="h-4 w-4 mr-1" />
              Statistiques
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchDisputes(pagination.page); }} disabled={loading}>
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Stats header */}
      <DisputesStatsHeader stats={stats} loading={statsLoading} />

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="OPEN">Ouverts</SelectItem>
            <SelectItem value="INVESTIGATING">En investigation</SelectItem>
            <SelectItem value="RESOLVED_REFUND">Remboursés</SelectItem>
            <SelectItem value="RESOLVED_RELEASE">Libérés</SelectItem>
            <SelectItem value="CLOSED">Clôturés</SelectItem>
          </SelectContent>
        </Select>

        <Select value={reasonFilter} onValueChange={setReasonFilter}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue placeholder="Type de litige" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {Object.entries(REASON_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={slaFilter} onValueChange={setSlaFilter}>
          <SelectTrigger className="w-40 h-8 text-xs">
            <SelectValue placeholder="SLA" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="ok">Dans les délais</SelectItem>
            <SelectItem value="urgent">Urgents (36–48h)</SelectItem>
            <SelectItem value="overdue">SLA dépassé (+48h)</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
          <Flag className="h-4 w-4" />
          <span className="font-medium text-gray-900">{pagination.total}</span>
          litige{pagination.total > 1 ? 's' : ''}
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={disputes}
        pagination={pagination}
        onPageChange={(page) => fetchDisputes(page)}
        isLoading={loading}
        emptyMessage="Aucun litige trouvé"
        emptyDescription="Aucun litige ne correspond à vos critères actuels."
      />
    </div>
  );
}
