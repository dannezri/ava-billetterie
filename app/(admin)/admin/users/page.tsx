'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { type ColumnDef } from '@tanstack/react-table';
import { Search, Filter, RefreshCw, Eye, Shield, Users } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  kycStatus: string;
  verifiedIdentity: boolean;
  trustScore: number;
  stripeAccountId: string | null;
  createdAt: string;
  _count: {
    ticketsForSale: number;
    purchases: number;
    sales: number;
    disputes: number;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const TrustScoreMini = ({ score }: { score: number }) => {
  const color =
    score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden w-16">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-700 w-8">{score}</span>
    </div>
  );
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('all');

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(kycFilter !== 'all' && { kyc_status: kycFilter }),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Erreur API');
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les utilisateurs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [search, kycFilter, toast]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'email',
      header: 'Utilisateur',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
              {(row.original.name || row.original.email).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {row.original.name || 'Sans nom'}
            </p>
            <p className="text-xs text-gray-500">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'kycStatus',
      header: 'KYC',
      cell: ({ row }) => <StatusBadge status={`KYC_${row.original.kycStatus}`} />,
    },
    {
      accessorKey: 'trustScore',
      header: 'Trust Score',
      cell: ({ row }) => <TrustScoreMini score={row.original.trustScore} />,
    },
    {
      id: 'activite',
      header: 'Activité',
      cell: ({ row }) => (
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span title="Achats">{row.original._count.purchases} achats</span>
          <span>·</span>
          <span title="Ventes">{row.original._count.sales} ventes</span>
          {row.original._count.disputes > 0 && (
            <>
              <span>·</span>
              <span className="text-red-600 font-medium">{row.original._count.disputes} litiges</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Inscrit le',
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'dd MMM yyyy', { locale: fr }),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              ···
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${row.original.id}`} className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5" /> Voir le profil
              </Link>
            </DropdownMenuItem>
            {row.original.stripeAccountId && (
              <DropdownMenuItem asChild>
                <a
                  href={`https://dashboard.stripe.com/connect/accounts/${row.original.stripeAccountId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-3.5 w-3.5" /> Stripe Connect
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header + Filtres */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Email, nom, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={kycFilter} onValueChange={setKycFilter}>
            <SelectTrigger className="w-40 h-9">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <SelectValue placeholder="KYC Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous (KYC)</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="VERIFIED">Vérifiés</SelectItem>
              <SelectItem value="REJECTED">Rejetés</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span className="font-medium text-gray-900">{pagination.total.toLocaleString('fr-FR')}</span> utilisateurs
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchUsers(pagination.page)} disabled={loading}>
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={users}
        pagination={pagination}
        onPageChange={(page) => fetchUsers(page)}
        isLoading={loading}
        emptyMessage="Aucun utilisateur trouvé"
        emptyDescription="Essayez de modifier vos filtres de recherche."
      />
    </div>
  );
}
