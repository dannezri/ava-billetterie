/**
 * Page principale du Dashboard Vendeur - Mes Billets
 * Affiche la liste des billets du vendeur avec le statut KYC
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KYCStatusBadge } from '@/components/seller';
import { Plus, Package, Calendar, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useSellerTickets } from '@/hooks/useSellerTickets';
import { Alert, AlertDescription } from '@/components/ui/alert';

function DashboardHeader({ ticketsCount }: { ticketsCount: number }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes Billets</h1>
        <p className="mt-2 text-muted-foreground">
          Gérez vos billets en vente ({ticketsCount} billet{ticketsCount !== 1 ? 's' : ''})
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild>
          <Link href="/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            Vendre un billet
          </Link>
        </Button>
      </div>
    </div>
  );
}

function TicketsList() {
  const { tickets, loading, error } = useSellerTickets();

  if (loading) {
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-8">
          <Package className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Aucun billet en vente</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Commencez par mettre en vente votre premier billet
          </p>
          <Button asChild className="mt-6">
            <Link href="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              Vendre un billet
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_VALIDATION':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">En validation</Badge>;
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Actif</Badge>;
      case 'SOLD':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">Vendu</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVerificationBadge = (verificationStatus: string) => {
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
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Image/Icône de l'événement */}
                <div className="flex-shrink-0 hidden sm:flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>

                {/* Informations principales */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {ticket.eventName}
                      </h3>
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
                    </div>
                  </div>

                  {/* Badges de statut */}
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(ticket.status)}
                    {getVerificationBadge(ticket.verificationStatus)}
                  </div>

                  {/* Message d'erreur si rejeté */}
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
                    <p className="text-2xl font-bold text-primary">
                      {ticket.price.toFixed(2)} €
                    </p>
                    {ticket.originalPrice && (
                      <p className="text-xs text-muted-foreground line-through">
                        {ticket.originalPrice.toFixed(2)} €
                      </p>
                    )}
                  </div>
                  <Button asChild variant="outline" size="sm" className="whitespace-nowrap">
                    <Link href={`/tickets/${ticket.id}`}>
                      Voir les détails
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SellerTicketsPage() {
  const { total } = useSellerTickets();

  return (
    <div className="container max-w-7xl py-8">
      <DashboardHeader ticketsCount={total} />
      <TicketsList />
    </div>
  );
}
