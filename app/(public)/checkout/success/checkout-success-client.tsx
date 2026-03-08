/**
 * Page de Succès - Achat Confirmé
 * Route: /checkout/success
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart/cart.context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  Download,
  Mail,
  Calendar,
  MapPin,
  ArrowRight,
  Shield,
  CreditCard,
} from 'lucide-react';
// Confetti animation (optionnel - nécessite npm install canvas-confetti)
// import confetti from 'canvas-confetti';

interface TransactionData {
  id: string;
  amount: number;
  platformFee: number;
  status: string;
  createdAt: string;
  ticket: {
    id: string;
    section: string | null;
    row: string | null;
    seatNumber: string | null;
    event: {
      title: string;
      eventDate: string;
      venue: string;
      city: string;
      imageUrl: string | null;
    };
  };
  buyer: {
    email: string;
  };
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearPurchased } = useCart();
  const transactionId = searchParams.get('transactionId');

  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transactionId) {
      setError('ID de transaction manquant');
      setLoading(false);
      return;
    }

    const fetchTransaction = async () => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Erreur lors du chargement');
        }

        setTransaction(data.data.transaction);
        clearPurchased([transactionId]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <Card className="border-destructive">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="mb-2 text-2xl font-bold">Une erreur est survenue</h1>
              <p className="mb-6 text-muted-foreground">
                {error || 'Transaction introuvable'}
              </p>
              <Button onClick={() => router.push('/events')}>
                Retour aux événements
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const ticketPrice = Number(transaction.amount) - Number(transaction.platformFee);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header Succès */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">🎉 Paiement réussi !</h1>
          <p className="text-lg text-muted-foreground">
            Votre billet a été acheté avec succès
          </p>
        </div>

        {/* Card Détails Transaction */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-6">
            {/* Event Info */}
            <div>
              <h2 className="mb-4 text-xl font-bold">{transaction.ticket.event.title}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(transaction.ticket.event.eventDate).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {transaction.ticket.event.venue}, {transaction.ticket.event.city}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Ticket Info */}
            <div>
              <h3 className="mb-2 font-semibold">Votre placement</h3>
              {transaction.ticket.section ? (
                <Badge variant="secondary" className="text-sm">
                  {transaction.ticket.section}
                  {transaction.ticket.row && ` - ${transaction.ticket.row}`}
                  {transaction.ticket.seatNumber && ` - Siège ${transaction.ticket.seatNumber}`}
                </Badge>
              ) : (
                <Badge variant="secondary">Placement libre</Badge>
              )}
            </div>

            <Separator />

            {/* Prix */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Prix du billet</span>
                <span>{ticketPrice.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Frais de service</span>
                <span>{Number(transaction.platformFee).toFixed(2)}€</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total payé</span>
                <span className="text-green-600">{Number(transaction.amount).toFixed(2)}€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Actions */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Prochaines étapes</h3>

            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Confirmation par email</p>
                <p className="text-sm text-muted-foreground">
                  Un email de confirmation a été envoyé à <strong>{transaction.buyer.email}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Download className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Téléchargez votre billet</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Votre billet est disponible dans votre compte
                </p>
                <Button size="sm" variant="outline" asChild>
                  <a href={`/tickets/${transaction.ticket.id}`}>
                    Voir mon billet
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-4">
              <CreditCard className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Paiement sécurisé</p>
                <p className="text-sm text-muted-foreground">
                  Votre paiement est protégé par notre système de séquestre bancaire jusqu'à J+2 après l'événement
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Garantie Sérénité */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">
                  🛡️ Protégé par la Garantie Sérénité
                </h3>
                <p className="text-sm text-green-800">
                  Votre achat est couvert par notre garantie. En cas de problème (billet invalide, événement annulé),
                  vous serez intégralement remboursé. Notre équipe reste à votre disposition.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions finales */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1" size="lg" asChild>
            <a href={`/tickets/${transaction.ticket.id}`}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger mon billet
            </a>
          </Button>
          <Button variant="outline" className="flex-1" size="lg" asChild>
            <a href="/events">
              Découvrir d'autres événements
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Numéro de transaction: <span className="font-mono">{transaction.id}</span>
        </p>
      </div>
    </div>
  );
}
