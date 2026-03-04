'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Search,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  Plus,
  CheckCircle,
  XCircle,
  CalendarDays,
  MapPin,
  Tag,
  ShieldCheck,
  MoreHorizontal,
  Ticket,
  TrendingUp,
} from 'lucide-react';
import { DataTable } from '@/components/admin/shared/DataTable';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface EventRow {
  id: string;
  title: string;
  artist: string | null;
  venue: string;
  city: string;
  country: string;
  eventDate: string;
  category: string | null;
  imageUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  ticketsAvailable: number;
  ticketsSold: number;
  gmv: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Stats {
  verified: number;
  unverified: number;
  ticketsTotal: number;
  upcoming: number;
  past: number;
}

interface Meta {
  cities: string[];
  categories: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

// ─── Chip stat ───────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  colorClass = 'bg-gray-100 text-gray-600',
}: {
  label: string;
  value: number;
  colorClass?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', colorClass)}>
      <span className="text-sm font-bold">{value}</span>
      {label}
    </span>
  );
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function EventsDataTable() {
  const { toast } = useToast();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [stats, setStats] = useState<Stats>({ verified: 0, unverified: 0, ticketsTotal: 0, upcoming: 0, past: 0 });
  const [meta, setMeta] = useState<Meta>({ cities: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  const hasActiveFilter = cityFilter !== 'all' || categoryFilter !== 'all' || dateRangeFilter !== 'all' || verifiedFilter !== 'all' || !!search;

  const fetchEvents = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: page.toString(), limit: '20' });
        if (search) params.set('search', search);
        if (verifiedFilter !== 'all') params.set('verified', verifiedFilter);
        if (cityFilter !== 'all') params.set('city', cityFilter);
        if (categoryFilter !== 'all') params.set('category', categoryFilter);
        if (dateRangeFilter !== 'all') params.set('dateRange', dateRangeFilter);

        const res = await fetch(`/api/admin/events?${params}`);
        if (!res.ok) throw new Error('Erreur API');

        const data = await res.json();
        setEvents(data.events || []);
        setPagination(data.pagination);
        setStats(data.stats || { verified: 0, unverified: 0, ticketsTotal: 0, upcoming: 0, past: 0 });
        if (data.meta) setMeta(data.meta);
      } catch {
        toast({ title: 'Erreur', description: 'Impossible de charger les événements', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    },
    [search, verifiedFilter, cityFilter, categoryFilter, dateRangeFilter, toast]
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchEvents(1), 300);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleDelete = async (event: EventRow) => {
    if (!confirm(`Supprimer « ${event.title} » ? Cette action est irréversible si aucun billet n'y est attaché.`)) return;
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) { toast({ title: 'Impossible de supprimer', description: json.error, variant: 'destructive' }); return; }
      toast({ title: 'Événement supprimé', description: `« ${event.title} » a été supprimé.` });
      fetchEvents(pagination.page);
    } catch {
      toast({ title: 'Erreur réseau', variant: 'destructive' });
    }
  };

  const handleVerify = async (event: EventRow, verified: boolean) => {
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: verified }),
      });
      if (!res.ok) throw new Error();
      toast({
        title: verified ? 'Événement vérifié ✓' : 'Vérification retirée',
        description: `« ${event.title} » ${verified ? 'est maintenant vérifié.' : "n'est plus vérifié."}`,
      });
      fetchEvents(pagination.page);
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  // ─── Colonnes ─────────────────────────────────────────────────────────────

  const columns: ColumnDef<EventRow>[] = [
    // Événement — image + titre + artiste + catégorie
    {
      id: 'event',
      header: 'Événement',
      cell: ({ row }) => {
        const e = row.original;
        const isPast = new Date(e.eventDate) < new Date();
        return (
          <div className={cn('flex items-center gap-3', isPast && 'opacity-60')}>
            {/* Thumbnail */}
            <div className="relative h-11 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {e.imageUrl ? (
                <Image src={e.imageUrl} alt={e.title} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-lg">🎭</span>
                </div>
              )}
            </div>
            {/* Info */}
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-tight truncate max-w-[180px]">{e.title}</p>
              {e.artist && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">{e.artist}</p>}
              {e.category && (
                <span className="mt-1 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                  {e.category}
                </span>
              )}
            </div>
          </div>
        );
      },
    },

    // Lieu
    {
      id: 'lieu',
      header: 'Lieu',
      cell: ({ row }) => {
        const e = row.original;
        const isPast = new Date(e.eventDate) < new Date();
        return (
          <div className={cn('text-sm', isPast && 'opacity-60')}>
            <p className="font-medium text-gray-800 truncate max-w-[140px]">{e.venue}</p>
            <p className="text-xs text-gray-400 flex items-center gap-0.5 mt-0.5">
              <MapPin className="h-3 w-3" />
              {e.city}
            </p>
          </div>
        );
      },
    },

    // Date
    {
      id: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const d = new Date(row.original.eventDate);
        const isPast = d < new Date();
        return (
          <div className="space-y-1">
            <p className={cn('text-sm font-medium whitespace-nowrap', isPast ? 'text-gray-400' : 'text-gray-800')}>
              {format(d, 'dd MMM yyyy', { locale: fr })}
            </p>
            <span
              className={cn(
                'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold',
                isPast ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'
              )}
            >
              {isPast ? 'Passé' : 'À venir'}
            </span>
          </div>
        );
      },
    },

    // Billets
    {
      id: 'billets',
      header: 'Billets',
      cell: ({ row }) => {
        const { ticketsAvailable, ticketsSold } = row.original;
        const total = ticketsAvailable + ticketsSold;
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <Ticket className="h-3 w-3" />
                {ticketsAvailable} dispo
              </span>
              {ticketsSold > 0 && (
                <span className="text-gray-400">· {ticketsSold} vendus</span>
              )}
            </div>
            {total > 0 && (
              <div className="h-1 w-20 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${Math.round((ticketsAvailable / total) * 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      },
    },

    // GMV
    {
      id: 'gmv',
      header: 'GMV',
      cell: ({ row }) => {
        const gmv = row.original.gmv;
        return gmv > 0 ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
            <TrendingUp className="h-3.5 w-3.5" />
            {formatEuro(gmv)}
          </span>
        ) : (
          <span className="text-gray-300 text-sm">—</span>
        );
      },
    },

    // Statut
    {
      id: 'statut',
      header: 'Statut',
      cell: ({ row }) => {
        const verified = row.original.isVerified;
        return (
          <Badge
            variant="outline"
            className={cn(
              'gap-1 text-xs font-medium whitespace-nowrap',
              verified
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', verified ? 'bg-green-500' : 'bg-amber-400')} />
            {verified ? 'Vérifié' : 'En attente'}
          </Badge>
        );
      },
    },

    // Actions
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="flex items-center gap-1">
              {/* Éditer */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-500 hover:text-indigo-600"
                title="Modifier"
                asChild
              >
                <Link href={`/admin/events/${e.id}/edit`}>
                  <Edit className="h-3.5 w-3.5" />
                </Link>
              </Button>

              {/* Voir sur le site */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-500 hover:text-gray-900"
                title="Voir sur le site"
                asChild
              >
                <a href={`/events/${e.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>

              {/* More: vérifier / supprimer */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {e.isVerified ? (
                    <DropdownMenuItem
                      className="gap-2 text-amber-700 focus:text-amber-700"
                      onClick={() => handleVerify(e, false)}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Retirer vérification
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="gap-2 text-green-700 focus:text-green-700"
                      onClick={() => handleVerify(e, true)}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Vérifier
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 text-red-600 focus:text-red-600"
                    onClick={() => handleDelete(e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        );
      },
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
          {/* KPI chips */}
          <div className="flex flex-wrap gap-2">
            <StatChip label="total" value={pagination.total} colorClass="bg-gray-100 text-gray-600" />
            <StatChip label="à venir" value={stats.upcoming} colorClass="bg-blue-50 text-blue-700" />
            <StatChip label="passés" value={stats.past} colorClass="bg-gray-100 text-gray-500" />
            <StatChip label="vérifiés" value={stats.verified} colorClass="bg-green-50 text-green-700" />
            {stats.unverified > 0 && (
              <StatChip label="en attente" value={stats.unverified} colorClass="bg-amber-50 text-amber-700" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link href="/admin/events/verification" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              Vérification
              {stats.unverified > 0 && (
                <span className="ml-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-xs text-white leading-none">
                  {stats.unverified}
                </span>
              )}
            </Link>
          </Button>
          <Button asChild size="sm" className="h-9 bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Link href="/admin/events/create">
              <Plus className="h-4 w-4" />
              Créer un événement
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Filtres ────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-wrap items-center gap-2">

          {/* Recherche */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Titre, artiste, salle…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>

          <div className="h-5 w-px bg-gray-200 hidden sm:block" />

          {/* Ville */}
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="h-9 min-w-[140px] bg-white">
              <MapPin className="mr-1.5 h-3.5 w-3.5 text-gray-400 shrink-0" />
              <SelectValue placeholder="Ville" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les villes</SelectItem>
              {meta.cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Période */}
          <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
            <SelectTrigger className="h-9 min-w-[140px] bg-white">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-gray-400 shrink-0" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Passés + À venir</SelectItem>
              <SelectItem value="upcoming">À venir</SelectItem>
              <SelectItem value="past">Passés</SelectItem>
            </SelectContent>
          </Select>

          {/* Genre */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 min-w-[140px] bg-white">
              <Tag className="mr-1.5 h-3.5 w-3.5 text-gray-400 shrink-0" />
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les genres</SelectItem>
              {meta.categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Vérification */}
          <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
            <SelectTrigger className="h-9 min-w-[140px] bg-white">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-gray-400 shrink-0" />
              <SelectValue placeholder="Vérification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="true">Vérifiés</SelectItem>
              <SelectItem value="false">Non vérifiés</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-gray-500 hover:text-gray-800"
                onClick={() => { setSearch(''); setCityFilter('all'); setCategoryFilter('all'); setDateRangeFilter('all'); setVerifiedFilter('all'); }}
              >
                Réinitialiser
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchEvents(1)}
              disabled={loading}
              className="h-9 w-9 bg-white"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={events}
        pagination={pagination}
        onPageChange={(page) => fetchEvents(page)}
        isLoading={loading}
        emptyMessage="Aucun événement trouvé"
        emptyDescription="Aucun événement ne correspond à vos critères de recherche."
      />
    </div>
  );
}
