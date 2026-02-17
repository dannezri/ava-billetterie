/**
 * Liste des achats de billets avec téléchargement sécurisé
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Calendar, MapPin, Clock, Shield, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface Purchase {
  id: string;
  status: string;
  amount: any; // Prisma Decimal
  platformFee: any; // Prisma Decimal
  escrowReleaseDate: Date;
  createdAt: Date;
  ticket: {
    id: string;
    section: string | null;
    row: string | null;
    seatNumber: string | null;
    pdfUrl: string | null;
    event: {
      id: string;
      title: string;
      artist: string;
      venue: string;
      city: string;
      eventDate: Date;
      imageUrl: string | null;
    };
    seller: {
      name: string | null;
      email: string;
      trustScore: number;
    };
  };
}

interface PurchasesListProps {
  purchases: Purchase[];
}

export function PurchasesList({ purchases }: PurchasesListProps) {
  const [downloadingTicket, setDownloadingTicket] = useState<string | null>(null);

  const handleDownloadTicket = async (purchaseId: string, ticketId: string) => {
    setDownloadingTicket(ticketId);

    try {
      const response = await fetch(`/api/tickets/${ticketId}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: purchaseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erreur lors du téléchargement');
      }

      // Ouvrir l'URL sécurisée dans un nouvel onglet
      window.open(data.data.secureUrl, '_blank');

      toast({
        title: 'Téléchargement lancé',
        description: 'Votre e-ticket sécurisé a été ouvert dans un nouvel onglet',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDownloadingTicket(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        );
      case 'ESCROWED':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Shield className="w-3 h-3 mr-1" />
            En séquestre
          </Badge>
        );
      case 'RELEASED':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Finalisé
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTimeUntilRelease = (releaseDate: Date) => {
    const now = new Date();
    const release = new Date(releaseDate);
    
    if (release <= now) {
      return 'Séquestre libéré';
    }

    return `Libération dans ${formatDistanceToNow(release, { locale: fr })}`;
  };

  const formatEventDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {purchases.map((purchase) => {
        const isReleased = purchase.status === 'RELEASED';
        const eventPassed = new Date(purchase.ticket.event.eventDate) < new Date();

        return (
          <Card key={purchase.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Image de l'événement */}
              {purchase.ticket.event.imageUrl && (
                <div className="w-full md:w-48 h-48 md:h-auto relative bg-gray-100">
                  <img
                    src={purchase.ticket.event.imageUrl}
                    alt={purchase.ticket.event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Contenu */}
              <div className="flex-1">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">
                        {purchase.ticket.event.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {purchase.ticket.event.artist}
                      </CardDescription>
                    </div>
                    {getStatusBadge(purchase.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Informations événement */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatEventDate(purchase.ticket.event.eventDate)}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>
                        {purchase.ticket.event.venue}, {purchase.ticket.event.city}
                      </span>
                    </div>
                  </div>

                  {/* Placement */}
                  {purchase.ticket.section && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-900">
                        {purchase.ticket.section}
                        {purchase.ticket.row && ` • ${purchase.ticket.row}`}
                        {purchase.ticket.seatNumber && ` • ${purchase.ticket.seatNumber}`}
                      </div>
                    </div>
                  )}

                  {/* Prix */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Montant payé</span>
                    <span className="text-lg font-bold">
                      {Number(purchase.amount).toFixed(2)}€
                    </span>
                  </div>

                  {/* Countdown séquestre */}
                  {!isReleased && purchase.status === 'ESCROWED' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 mt-0.5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            Protection acheteur active
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            {getTimeUntilRelease(purchase.escrowReleaseDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3">
                  {purchase.status === 'PENDING' ? (
                    <div className="w-full">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-900">
                          ⏳ Paiement en cours de traitement
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Votre e-ticket sera disponible une fois le paiement confirmé
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleDownloadTicket(purchase.id, purchase.ticket.id)}
                        disabled={!purchase.ticket.pdfUrl || downloadingTicket === purchase.ticket.id}
                        className="w-full sm:w-auto"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {downloadingTicket === purchase.ticket.id
                          ? 'Génération...'
                          : 'Télécharger l\'e-ticket'}
                      </Button>

                      {eventPassed && !isReleased && (
                        <p className="text-xs text-muted-foreground sm:ml-auto self-center">
                          Le paiement sera libéré le{' '}
                          {new Date(purchase.escrowReleaseDate).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </>
                  )}
                </CardFooter>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
