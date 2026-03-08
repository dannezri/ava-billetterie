/**
 * Contenu de la page Détail d'un achat (Client Component)
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  Calendar,
  MapPin,
  Download,
  FileText,
  MessageSquare,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type TransactionDetail = {
  transaction: {
    id: string;
    ticket_price: number;
    platform_fee: number;
    total_amount: number;
    status: string;
    created_at: string;
    escrow_release_date: string | null;
    payment_method: string | null;
    card_brand: string | null;
    card_last4: string | null;
  };
  ticket: {
    id: string;
    seat_category: string;
    seat_section: string | null;
    seat_row: string | null;
    seat_number: string | null;
    pdf_url: string | null;
    event: {
      id: string;
      title: string;
      artist: string;
      venue: string;
      address: string;
      city: string;
      event_date: string;
      image_url: string | null;
    };
  };
  seller: {
    id: string;
    pseudo: string;
    trustScore: number;
    totalSales: number;
    memberSince: string;
    avgRating: number;
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

export function PurchaseDetailContent({ transactionId }: { transactionId: string }) {
  const router = useRouter();

  const { data, isLoading, error } = useQuery<TransactionDetail>({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${transactionId}`);
      if (!res.ok) throw new Error('Failed to fetch transaction');
      const json = await res.json();
      return json.data;
    },
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Impossible de charger les détails de la transaction. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !data) {
    return <div>Chargement...</div>;
  }

  const { transaction, ticket, seller, dispute, review } = data;
  const isPastEvent = new Date(ticket.event.event_date) < new Date();
  const canDownload = ['ESCROWED', 'RELEASED'].includes(transaction.status);

  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Détail de l'achat</h1>
          <p className="text-muted-foreground">Référence: {transaction.id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Alertes */}
      {dispute && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Un litige est en cours pour cette transaction.{' '}
            <Link href={`/disputes/${dispute.id}`} className="underline font-medium">
              Voir le litige
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {transaction.status === 'ESCROWED' && transaction.escrow_release_date && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Les fonds sont en séquestre jusqu'au{' '}
            {format(new Date(transaction.escrow_release_date), 'PPP', { locale: fr })}. Le vendeur recevra le paiement
            après cette date si aucun problème n'est signalé.
          </AlertDescription>
        </Alert>
      )}

      {!review && transaction.status === 'RELEASED' && isPastEvent && (
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            Le concert est passé. Vous pouvez maintenant laisser un avis sur le vendeur.{' '}
            <Link href={`/my-purchases/${transaction.id}/review`} className="underline font-medium">
              Laisser un avis
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails de l'événement */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'événement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {ticket.event.image_url && (
                  <img
                    src={ticket.event.image_url}
                    alt={ticket.event.title}
                    className="w-32 h-32 rounded-md object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{ticket.event.title}</h2>
                  <p className="text-lg text-muted-foreground mb-4">{ticket.event.artist}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(ticket.event.event_date), 'PPPp', { locale: fr })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{ticket.event.venue}, {ticket.event.city}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations du billet */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du billet</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Catégorie</dt>
                  <dd className="font-medium">{ticket.seat_category}</dd>
                </div>
                {ticket.seat_section && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Section</dt>
                    <dd className="font-medium">{ticket.seat_section}</dd>
                  </div>
                )}
                {ticket.seat_row && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Rangée</dt>
                    <dd className="font-medium">{ticket.seat_row}</dd>
                  </div>
                )}
                {ticket.seat_number && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Siège</dt>
                    <dd className="font-medium">{ticket.seat_number}</dd>
                  </div>
                )}
              </dl>

              <Separator className="my-4" />

              <div className="flex gap-2">
                <Button asChild disabled={!canDownload} className="flex-1">
                  <Link href={`/api/transactions/${transaction.id}/download`} target="_blank">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le billet
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/api/transactions/${transaction.id}/invoice`} target="_blank">
                    <FileText className="mr-2 h-4 w-4" />
                    Facture
                  </Link>
                </Button>
              </div>

              {!canDownload && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Le billet sera disponible au téléchargement une fois le paiement validé
                </p>
              )}
            </CardContent>
          </Card>

          {/* Informations du vendeur */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du vendeur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{seller.pseudo}</h3>
                    <Badge variant="secondary">{seller.trustScore}% fiable</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{seller.totalSales} ventes</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {seller.avgRating.toFixed(1)}
                    </span>
                    <span>Membre depuis {format(new Date(seller.memberSince), 'MMM yyyy', { locale: fr })}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Résumé de la transaction */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Statut</dt>
                  <dd>
                    <Badge variant={transaction.status === 'RELEASED' ? 'default' : 'secondary'}>
                      {transaction.status}
                    </Badge>
                  </dd>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <dt>Prix du billet</dt>
                  <dd className="font-medium">{transaction.ticket_price.toFixed(2)} €</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Frais de service</dt>
                  <dd className="text-muted-foreground">{transaction.platform_fee.toFixed(2)} €</dd>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <dt>Total</dt>
                  <dd>{transaction.total_amount.toFixed(2)} €</dd>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">Date d'achat</dt>
                  <dd className="text-muted-foreground">
                    {format(new Date(transaction.created_at), 'Pp', { locale: fr })}
                  </dd>
                </div>
                {transaction.card_brand && transaction.card_last4 && (
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">Paiement</dt>
                    <dd className="text-muted-foreground">
                      {transaction.card_brand.toUpperCase()} **** {transaction.card_last4}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {!review && transaction.status === 'RELEASED' && isPastEvent && (
                <Button asChild className="w-full">
                  <Link href={`/my-purchases/${transaction.id}/review`}>
                    <Star className="mr-2 h-4 w-4" />
                    Laisser un avis
                  </Link>
                </Button>
              )}
              {!dispute && transaction.status === 'ESCROWED' && (
                <Button asChild variant="destructive" className="w-full">
                  <Link href={`/disputes/create?transactionId=${transaction.id}`}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Signaler un problème
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href="/support">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contacter le support
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
