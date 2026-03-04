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
  Clock,
  AlertTriangle,
  ArrowLeft,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Types alignés sur le retour de getTransactionById (Prisma camelCase)
 * Le service retourne { transaction, seller } où:
 * - transaction inclut ticket (avec event + seller), dispute, review
 * - seller est enrichi avec avg_rating et reviews_count
 */
type TransactionDetailResponse = {
  transaction: {
    id: string;
    amount: number;
    platformFee: number;
    status: string;
    createdAt: string;
    escrowReleaseDate: string | null;
    stripePaymentIntentId: string | null;
    ticket: {
      id: string;
      price: number;
      section: string | null;
      row: string | null;
      seatNumber: string | null;
      pdfUrl: string | null;
      event: {
        id: string;
        title: string;
        artist: string;
        venue: string;
        address: string | null;
        city: string;
        eventDate: string;
        imageUrl: string | null;
      };
      seller: {
        id: string;
        name: string;
        email: string;
        trustScore: number;
        createdAt: string;
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
  seller: {
    id: string;
    name: string;
    trustScore: number;
    avg_rating: number;
    reviews_count: number;
  };
};

export function PurchaseDetailContent({ transactionId }: { transactionId: string }) {
  const router = useRouter();

  const { data, isLoading, error } = useQuery<TransactionDetailResponse>({
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

  const { transaction } = data;
  const ticket = transaction.ticket;
  const event = ticket.event;
  const dispute = transaction.dispute;
  const review = transaction.review;
  const isPastEvent = new Date(event.eventDate) < new Date();
  // Le billet est accessible dès que le paiement est confirmé (COMPLETED ou plus)
  const canDownload = ['COMPLETED', 'ESCROWED', 'RELEASED'].includes(transaction.status);

  return (
    <div className="space-y-6">
      {/* Header avec retour */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Détail de l&apos;achat</h1>
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

      {['COMPLETED', 'ESCROWED'].includes(transaction.status) && transaction.escrowReleaseDate && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Les fonds sont en séquestre jusqu&apos;au{' '}
            {format(new Date(transaction.escrowReleaseDate), 'PPP', { locale: fr })}. Le vendeur recevra le paiement
            après cette date si aucun problème n&apos;est signalé.
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
              <CardTitle>Détails de l&apos;événement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {event.imageUrl && (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-32 h-32 rounded-md object-cover"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-1">{event.title}</h2>
                  <p className="text-lg text-muted-foreground mb-4">{event.artist}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(event.eventDate), 'PPPp', { locale: fr })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.venue}, {event.city}</span>
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
                {ticket.section && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Section</dt>
                    <dd className="font-medium">{ticket.section}</dd>
                  </div>
                )}
                {ticket.row && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Rangée</dt>
                    <dd className="font-medium">{ticket.row}</dd>
                  </div>
                )}
                {ticket.seatNumber && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Siège</dt>
                    <dd className="font-medium">{ticket.seatNumber}</dd>
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
                  <dd className="font-medium">{Number(ticket.price).toFixed(2)} €</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Frais de service</dt>
                  <dd className="text-muted-foreground">{Number(transaction.platformFee).toFixed(2)} €</dd>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <dt>Total</dt>
                  <dd>{Number(transaction.amount).toFixed(2)} €</dd>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <dt className="text-muted-foreground">Date d&apos;achat</dt>
                  <dd className="text-muted-foreground">
                    {format(new Date(transaction.createdAt), 'Pp', { locale: fr })}
                  </dd>
                </div>
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
              {!dispute && ['COMPLETED', 'ESCROWED'].includes(transaction.status) && (
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
