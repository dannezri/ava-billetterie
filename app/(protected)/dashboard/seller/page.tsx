/**
 * Page principale du Dashboard Vendeur - Mes Billets
 * Deux onglets : billets en vente (tri par publication DESC) et billets vendus (tri par achat DESC)
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Package, Calendar, MapPin, AlertCircle, ShoppingBag, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyTickets, type MyTicket } from '@/hooks/useMyTickets';
import { Alert, AlertDescription } from '@/components/ui/alert';

function DashboardHeader({ activeCount, soldCount }: { activeCount: number; soldCount: number }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes Billets</h1>
        <p className="mt-2 text-muted-foreground">
          {activeCount} en vente · {soldCount} vendu{soldCount !== 1 ? 's' : ''}
        </p>
      </div>
      <Button asChild>
        <Link href="/sell-ticket">
          <Plus className="mr-2 h-4 w-4" />
          Vendre un billet
        </Link>
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ type }: { type: 'active' | 'sold' }) {
  if (type === 'sold') {
    return (
      <Card>
        <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Aucun billet vendu</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Vos billets vendus apparaîtront ici
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Aucun billet en vente</h3>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Commencez par mettre en vente votre premier billet
        </p>
        <Button asChild className="mt-6">
          <Link href="/sell-ticket">
            <Plus className="mr-2 h-4 w-4" />
            Vendre un billet
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING_VALIDATION':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">En validation</Badge>;
    case 'ACTIVE':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Actif</Badge>;
    case 'SOLD':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Vendu</Badge>;
    case 'RESERVED':
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">Réservé</Badge>;
    case 'CANCELLED':
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Annulé</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getVerificationBadge(verificationStatus: string) {
  switch (verificationStatus) {
    case 'PENDING':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">⏳ En attente</Badge>;
    case 'APPROVED':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">✓ Approuvé</Badge>;
    case 'REJECTED':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">✗ Rejeté</Badge>;
    default:
      return null;
  }
}

function TicketRow({ ticket, showSoldAt }: { ticket: MyTicket; showSoldAt?: boolean }) {
  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Image */}
        <div className="flex-shrink-0 hidden sm:block w-16 h-16 rounded-lg overflow-hidden bg-primary/10">
          {ticket.imageUrl ? (
            <Image
              src={ticket.imageUrl}
              alt={ticket.eventName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg line-clamp-1">{ticket.eventName}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(ticket.eventDate).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {ticket.venue}
                  {ticket.city && `, ${ticket.city}`}
                </span>
              </div>
              {ticket.section && (
                <p className="text-xs text-muted-foreground mt-1">
                  Section {ticket.section}
                  {ticket.row && ` • Rangée ${ticket.row}`}
                  {ticket.seatNumber && ` • Siège ${ticket.seatNumber}`}
                </p>
              )}
              {showSoldAt && ticket.soldAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Acheté le{' '}
                  {new Date(ticket.soldAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
              {!showSoldAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Publié le{' '}
                  {new Date(ticket.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {getStatusBadge(ticket.status)}
            {!showSoldAt && getVerificationBadge(ticket.verificationStatus)}
          </div>

          {ticket.rejectionReason && (
            <Alert variant="destructive" className="mt-3 py-2">
              <AlertDescription className="text-xs">
                <strong>Raison du rejet :</strong> {ticket.rejectionReason}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Prix et actions */}
        <div className="flex-shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{ticket.price.toFixed(2)} €</p>
            {ticket.originalPrice && (
              <p className="text-xs text-muted-foreground line-through">
                {ticket.originalPrice.toFixed(2)} €
              </p>
            )}
          </div>
          <Button asChild variant="outline" size="sm" className="whitespace-nowrap">
            <Link href={`/tickets/${ticket.id}`}>Voir les détails</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function TicketTabs() {
  const { tickets, loading, error } = useMyTickets();

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const activeTickets = tickets
    .filter((t) => t.status !== 'SOLD')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const soldTickets = tickets
    .filter((t) => t.status === 'SOLD')
    .sort((a, b) => {
      const dateA = a.soldAt ? new Date(a.soldAt).getTime() : new Date(a.updatedAt).getTime();
      const dateB = b.soldAt ? new Date(b.soldAt).getTime() : new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });

  return (
    <Tabs defaultValue="active">
      <TabsList className="mb-4">
        <TabsTrigger value="active" className="gap-2">
          <Tag className="h-4 w-4" />
          Billets en vente
          {activeTickets.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {activeTickets.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sold" className="gap-2">
          <ShoppingBag className="h-4 w-4" />
          Billets vendus
          {soldTickets.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {soldTickets.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active">
        {activeTickets.length === 0 ? (
          <EmptyState type="active" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {activeTickets.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} showSoldAt={false} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="sold">
        {soldTickets.length === 0 ? (
          <EmptyState type="sold" />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {soldTickets.map((ticket) => (
                  <TicketRow key={ticket.id} ticket={ticket} showSoldAt />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}

export default function SellerTicketsPage() {
  const { tickets } = useMyTickets();

  const activeCount = tickets.filter((t) => t.status !== 'SOLD').length;
  const soldCount = tickets.filter((t) => t.status === 'SOLD').length;

  return (
    <div className="container max-w-7xl py-8">
      <DashboardHeader activeCount={activeCount} soldCount={soldCount} />
      <TicketTabs />
    </div>
  );
}
