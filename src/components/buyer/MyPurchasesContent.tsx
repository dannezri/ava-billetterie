/**
 * Contenu de la page Mes Achats (Client Component)
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  Calendar,
  MapPin,
  Download,
  FileText,
  MessageSquare,
  ChevronRight,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types alignés sur le schema Prisma (camelCase via @map)
type Purchase = {
  id: string;
  amount: number;
  platformFee: number;
  status: string;
  createdAt: string;
  escrowReleaseDate: string | null;
  ticket: {
    section: string | null;
    row: string | null;
    seatNumber: string | null;
    price: number;
    event: {
      id: string;
      title: string;
      artist: string;
      venue: string;
      city: string;
      eventDate: string;
      imageUrl: string | null;
    };
    seller: {
      id: string;
      name: string;
      email: string;
      trustScore: number;
    };
  };
  dispute: {
    id: string;
    status: string;
    reason: string;
  } | null;
  review: {
    id: string;
    rating: number;
  } | null;
};

type PurchasesData = {
  transactions: Purchase[];
  stats: {
    total: number;
    upcoming: number;
    past: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function MyPurchasesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  const page = parseInt(searchParams.get('page') || '1');

  const { data, isLoading, error } = useQuery<PurchasesData>({
    queryKey: ['purchases', filter, page],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/purchases?filter=${filter}&page=${page}&limit=20`);
      if (!res.ok) throw new Error('Failed to fetch purchases');
      const json = await res.json();
      return json.data;
    },
  });

  const handleFilterChange = (newFilter: string) => {
    router.push(`/my-purchases?filter=${newFilter}`);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Impossible de charger vos achats. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {data && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{data.stats.total}</div>
              <p className="text-xs text-muted-foreground">Total d'achats</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{data.stats.upcoming}</div>
              <p className="text-xs text-muted-foreground">Concerts à venir</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{data.stats.past}</div>
              <p className="text-xs text-muted-foreground">Concerts passés</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres par onglets */}
      <Tabs value={filter} onValueChange={handleFilterChange}>
        <TabsList>
          <TabsTrigger value="all">Tous</TabsTrigger>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="past">Passés</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : data && data.transactions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Aucun achat dans cette catégorie</p>
                <Button asChild>
                  <Link href="/events">Découvrir des événements</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data?.transactions.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => router.push(`/my-purchases?filter=${filter}&page=${page - 1}`)}
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} sur {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === data.pagination.totalPages}
            onClick={() => router.push(`/my-purchases?filter=${filter}&page=${page + 1}`)}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Carte d'affichage d'un achat
 */
function PurchaseCard({ purchase }: { purchase: Purchase }) {
  return (
    <Link href={`/my-purchases/${purchase.id}`}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Image de l'événement */}
            {purchase.ticket.event.imageUrl && (
              <img
                src={purchase.ticket.event.imageUrl}
                alt={purchase.ticket.event.title}
                className="w-24 h-24 rounded-md object-cover flex-shrink-0"
              />
            )}

            {/* Détails */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{purchase.ticket.event.title}</h3>
                  <p className="text-muted-foreground">{purchase.ticket.event.artist}</p>
                </div>
                <StatusBadge status={purchase.status} />
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(purchase.ticket.event.eventDate), 'PPP', { locale: fr })}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {purchase.ticket.event.venue}, {purchase.ticket.event.city}
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="flex items-center gap-4 mt-4">
                {purchase.ticket.section && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Section:</span>{' '}
                    <span className="font-medium">{purchase.ticket.section}</span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-muted-foreground">Prix:</span>{' '}
                  <span className="font-medium">{Number(purchase.amount).toFixed(2)} €</span>
                </div>
              </div>

              {/* Alertes et actions */}
              <div className="flex items-center gap-2 mt-4">
                {['COMPLETED', 'ESCROWED'].includes(purchase.status) && purchase.escrowReleaseDate && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Fonds libérés le{' '}
                    {format(new Date(purchase.escrowReleaseDate), 'dd/MM/yyyy')}
                  </Badge>
                )}
                {purchase.dispute && (
                  <Badge variant="destructive">Litige en cours</Badge>
                )}
                {!purchase.review && purchase.status === 'RELEASED' && (
                  <Badge variant="secondary">Avis en attente</Badge>
                )}
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Badge de statut de transaction
 */
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDING: { label: 'En attente', variant: 'secondary' },
    COMPLETED: { label: 'Confirmé', variant: 'default' },
    ESCROWED: { label: 'Confirmé', variant: 'default' },
    RELEASED: { label: 'Confirmé', variant: 'outline' },
    DISPUTED: { label: 'Litige', variant: 'destructive' },
    REFUNDED: { label: 'Remboursé', variant: 'secondary' },
    CANCELLED: { label: 'Annulé', variant: 'destructive' },
  };

  const config = variants[status] || { label: status, variant: 'outline' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
