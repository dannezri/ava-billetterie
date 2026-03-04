'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type ColumnDef } from '@tanstack/react-table';
import { CheckCircle, XCircle, Edit, RefreshCw, ChevronRight, ExternalLink } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EventRow {
  id: string;
  title: string;
  artist: string | null;
  venue: string;
  city: string;
  eventDate: string;
  category: string | null;
  imageUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  ticketsAvailable: number;
  ticketsSold: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function EventVerificationPage() {
  const { toast } = useToast();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUnverified = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        verified: 'false',
      });

      const res = await fetch(`/api/admin/events?${params}`);
      if (!res.ok) throw new Error('Erreur API');

      const data = await res.json();
      setEvents(data.events || []);
      setPagination(data.pagination);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les événements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUnverified(1);
  }, [fetchUnverified]);

  const handleVerify = async (event: EventRow, verified: boolean) => {
    setActionLoading(event.id);
    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: verified }),
      });

      if (!res.ok) throw new Error();

      toast({
        title: verified ? '✓ Événement approuvé' : 'Événement rejeté',
        description: `« ${event.title} » ${verified ? 'est maintenant visible dans le catalogue.' : 'reste non vérifié.'}`,
      });

      // Retirer de la liste
      setEvents((prev) => prev.filter((e) => e.id !== event.id));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const columns: ColumnDef<EventRow>[] = [
    {
      id: 'image',
      header: '',
      cell: ({ row }) => (
        <div className="relative h-12 w-16 overflow-hidden rounded-md bg-gray-100">
          {row.original.imageUrl ? (
            <Image
              src={row.original.imageUrl}
              alt={row.original.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-300">
              N/A
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'event',
      header: 'Événement',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900 text-sm">{row.original.title}</p>
          {row.original.artist && (
            <p className="text-xs text-gray-500">{row.original.artist}</p>
          )}
          {row.original.category && (
            <span className="inline-block mt-0.5 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
              {row.original.category}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'lieu',
      header: 'Lieu',
      cell: ({ row }) => (
        <div className="text-sm">
          <p className="font-medium text-gray-900">{row.original.venue}</p>
          <p className="text-xs text-gray-500">{row.original.city}</p>
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm whitespace-nowrap">
          {format(new Date(row.original.eventDate), 'dd MMM yyyy', { locale: fr })}
        </span>
      ),
    },
    {
      id: 'soumis',
      header: 'Soumis le',
      cell: ({ row }) => (
        <span className="text-xs text-gray-500">
          {format(new Date(row.original.createdAt), 'dd MMM HH:mm', { locale: fr })}
        </span>
      ),
    },
    {
      id: 'billets',
      header: 'Billets',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.ticketsAvailable}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isActing = actionLoading === row.original.id;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
              disabled={isActing}
              onClick={() => handleVerify(row.original, true)}
            >
              <CheckCircle className="mr-1 h-3.5 w-3.5" />
              Approuver
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 border-red-200 text-red-600 hover:bg-red-50"
              disabled={isActing}
              onClick={() => handleVerify(row.original, false)}
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Rejeter
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
              <Link href={`/admin/events/${row.original.id}/edit`} title="Modifier">
                <Edit className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link href="/admin" className="hover:text-gray-900">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/admin/events" className="hover:text-gray-900">Événements</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Queue vérification</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Queue de vérification</h1>
          <p className="text-sm text-gray-500">
            {pagination.total} événement(s) en attente de validation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUnverified(pagination.page)}
            disabled={loading}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </Button>
          <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/admin/events">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Tous les événements
            </Link>
          </Button>
        </div>
      </div>

      {/* Info */}
      {pagination.total === 0 && !loading && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
          <p className="font-medium text-green-700">Queue vide ✓</p>
          <p className="text-sm text-green-600">Tous les événements ont été traités.</p>
        </div>
      )}

      {/* Table */}
      {(loading || pagination.total > 0) && (
        <DataTable
          columns={columns}
          data={events}
          pagination={pagination}
          onPageChange={(page) => fetchUnverified(page)}
          isLoading={loading}
          emptyMessage="Queue vide"
          emptyDescription="Aucun événement en attente de vérification."
        />
      )}
    </div>
  );
}
