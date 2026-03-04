'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { Search, Filter, RefreshCw, Eye, Trash2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Ticket {
  id: string;
  status: string;
  verificationStatus: string;
  price: number;
  originalPrice: number | null;
  barcodeNumber: string | null;
  createdAt: string;
  wait_hours: number;
  event: { id: string; title: string; venue: string; city: string; eventDate: string };
  seller: { id: string; name: string | null; email: string; kycStatus: string; trustScore: number };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const formatEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);

export default function AdminTicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'flagged'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTickets = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(activeTab === 'pending' && { queue: 'true' }),
        ...(activeTab === 'flagged' && { status: 'FLAGGED' }),
        ...(statusFilter !== 'all' && activeTab === 'all' && { status: statusFilter }),
      });
      const res = await fetch(`/api/admin/tickets?${params}`);
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      setTickets(data.tickets || []);
      setPagination(data.pagination);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les billets', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, activeTab, toast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTickets(1), 300);
    return () => clearTimeout(timer);
  }, [fetchTickets]);

  const handleDelete = useCallback(async (ticketId: string) => {
    setDeletingId(ticketId);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }
      toast({ title: 'Billet supprimé', description: 'Le billet a été supprimé avec succès.' });
      fetchTickets(pagination.page);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  }, [fetchTickets, pagination.page, toast]);

  const columns: ColumnDef<Ticket>[] = [
    {
      id: 'event',
      header: 'Événement',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
            {row.original.event.title}
          </p>
          <p className="text-xs text-gray-500">
            {row.original.event.venue}, {row.original.event.city}
          </p>
          <p className="text-xs text-gray-400">
            {format(new Date(row.original.event.eventDate), 'dd MMM yyyy', { locale: fr })}
          </p>
        </div>
      ),
    },
    {
      id: 'seller',
      header: 'Vendeur',
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="text-gray-900">{row.original.seller.name || row.original.seller.email}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-xs font-medium',
                row.original.seller.kycStatus === 'VERIFIED'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              )}
            >
              KYC {row.original.seller.kycStatus}
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500">Trust: {row.original.seller.trustScore}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Prix',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-semibold">{formatEuro(row.original.price)}</p>
          {row.original.originalPrice && (
            <p className={cn('text-xs', row.original.price > row.original.originalPrice ? 'text-red-600 font-medium' : 'text-gray-400')}>
              Facial: {formatEuro(row.original.originalPrice)}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <div className="space-y-1">
          <StatusBadge status={row.original.status} />
          <StatusBadge status={row.original.verificationStatus} />
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Soumis le',
      cell: ({ row }) => (
        <div className="text-xs text-gray-500">
          {format(new Date(row.original.createdAt), 'dd MMM HH:mm', { locale: fr })}
          {row.original.wait_hours >= 24 && (
            <p className="text-red-600 font-medium">⚠️ {Math.floor(row.original.wait_hours / 24)}j</p>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.status === 'PENDING_VALIDATION' && (
            <Button variant="default" size="sm" asChild className="h-7 px-2 bg-indigo-600 hover:bg-indigo-700">
              <Link href="/admin/tickets/validation">
                Valider
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild className="h-7 px-2">
            <a href={`/admin/tickets/${row.original.id}`} target="_blank" rel="noopener noreferrer">
              <Eye className="h-3.5 w-3.5" />
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                disabled={deletingId === row.original.id}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce billet ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Vous êtes sur le point de supprimer définitivement le billet{' '}
                  <strong>{row.original.event.title}</strong> de{' '}
                  <strong>{row.original.seller.name || row.original.seller.email}</strong>.
                  <br />
                  Cette action est irréversible. Les billets liés à une transaction ne peuvent pas être supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(row.original.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Tous les billets</TabsTrigger>
            <TabsTrigger value="pending">En validation</TabsTrigger>
            <TabsTrigger value="flagged">Signalés</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Événement, vendeur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 w-56"
              />
            </div>
            {activeTab === 'all' && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-9">
                  <Filter className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="DRAFT">Brouillons</SelectItem>
                  <SelectItem value="PENDING_VALIDATION">En validation</SelectItem>
                  <SelectItem value="ACTIVE">Actifs</SelectItem>
                  <SelectItem value="SOLD">Vendus</SelectItem>
                  <SelectItem value="CANCELLED">Annulés</SelectItem>
                  <SelectItem value="FLAGGED">Signalés</SelectItem>
                </SelectContent>
              </Select>
            )}

            {activeTab === 'pending' && (
              <Button variant="default" size="sm" asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/admin/tickets/validation">
                  Ouvrir la queue de validation →
                </Link>
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={() => fetchTickets(pagination.page)} disabled={loading}>
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </Tabs>

      <DataTable
        columns={columns}
        data={tickets}
        pagination={pagination}
        onPageChange={(page) => fetchTickets(page)}
        isLoading={loading}
        emptyMessage="Aucun billet trouvé"
        emptyDescription="Aucun billet ne correspond à vos critères de recherche."
      />
    </div>
  );
}
