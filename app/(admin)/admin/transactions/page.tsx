'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { Search, Filter, RefreshCw, Eye, ArrowLeftRight, Clock } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/DataTable';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

interface Transaction {
  id: string;
  amount: number;
  platformFee: number;
  status: string;
  stripePaymentIntentId: string | null;
  escrowReleaseDate: string;
  createdAt: string;
  countdown_seconds: number | null;
  buyer: { id: string; name: string | null; email: string };
  seller: { id: string; name: string | null; email: string };
  ticket: {
    id: string;
    event: { id: string; title: string; eventDate: string };
  };
  dispute: { id: string; status: string; reason: string } | null;
}

interface EscrowStats {
  total_count: number;
  total_amount: number;
  releasing_today: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const formatEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);

const EscrowCountdown = ({ seconds }: { seconds: number | null }) => {
  if (!seconds) return null;
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return (
    <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
      <Clock className="h-3 w-3" />
      {d > 0 ? `${d}j ${h}h` : `${h}h`}
    </div>
  );
};

export default function AdminTransactionsPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [escrowStats, setEscrowStats] = useState<EscrowStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('filter') === 'escrow' ? 'ESCROWED' : 'all');
  const [activeTab, setActiveTab] = useState<'all' | 'escrow' | 'failed'>(
    searchParams.get('filter') === 'escrow' ? 'escrow' : 'all'
  );

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(activeTab === 'escrow' && { escrow: 'true' }),
        ...(activeTab === 'failed' && { failed: 'true' }),
        ...(statusFilter !== 'all' && activeTab === 'all' && { status: statusFilter }),
      });
      const res = await fetch(`/api/admin/transactions?${params}`);
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      setTransactions(data.transactions || []);
      setEscrowStats(data.escrow_stats || null);
      setPagination(data.pagination);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les transactions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, activeTab, toast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTransactions(1), 300);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-gray-500">{row.original.id.slice(0, 8)}…</span>
      ),
    },
    {
      id: 'event',
      header: 'Événement',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
            {row.original.ticket.event.title}
          </p>
          <p className="text-xs text-gray-500">
            {format(new Date(row.original.ticket.event.eventDate), 'dd MMM yyyy', { locale: fr })}
          </p>
        </div>
      ),
    },
    {
      id: 'parties',
      header: 'Acheteur → Vendeur',
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="text-gray-900">{row.original.buyer.name || row.original.buyer.email}</p>
          <p className="text-gray-500">→ {row.original.seller.name || row.original.seller.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Montant',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {formatEuro(row.original.amount)}
          </p>
          <p className="text-xs text-gray-400">
            Comm: {formatEuro(row.original.platformFee)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <div className="space-y-1">
          <StatusBadge status={row.original.status} />
          {row.original.status === 'ESCROWED' && (
            <EscrowCountdown seconds={row.original.countdown_seconds} />
          )}
          {row.original.dispute && (
            <StatusBadge status={row.original.dispute.status} />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <div className="text-xs text-gray-500">
          {format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr })}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild className="h-7 px-2">
          <Link href={`/admin/transactions/${row.original.id}`}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Voir
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-1.5">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Toutes
            </TabsTrigger>
            <TabsTrigger value="escrow" className="flex items-center gap-1.5">
              🔒 Séquestres
            </TabsTrigger>
            <TabsTrigger value="failed" className="flex items-center gap-1.5">
              ⚠️ En attente
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="ID, email, intent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 w-52"
              />
            </div>
            {activeTab === 'all' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="ESCROWED">Séquestre</SelectItem>
                  <SelectItem value="RELEASED">Libéré</SelectItem>
                  <SelectItem value="REFUNDED">Remboursé</SelectItem>
                  <SelectItem value="DISPUTED">En litige</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" onClick={() => fetchTransactions(pagination.page)} disabled={loading}>
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {/* Stats escrow */}
        {activeTab === 'escrow' && escrowStats && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { label: 'Séquestres actifs', value: escrowStats.total_count },
              {
                label: 'Montant bloqué',
                value: formatEuro(escrowStats.total_amount),
              },
              {
                label: 'Libération aujourd\'hui',
                value: escrowStats.releasing_today,
              },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-3">
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Tabs>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={transactions}
        pagination={pagination}
        onPageChange={(page) => fetchTransactions(page)}
        isLoading={loading}
        emptyMessage="Aucune transaction trouvée"
        emptyDescription="Aucune transaction ne correspond à vos critères."
      />
    </div>
  );
}
