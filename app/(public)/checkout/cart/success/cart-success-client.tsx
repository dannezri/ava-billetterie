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
  Mail,
  Calendar,
  MapPin,
  ArrowRight,
  Shield,
  Ticket,
  Download,
  Home,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TransactionSummary {
  id: string;
  amount: number;
  platformFee: number;
  ticket: {
    id: string;
    section: string | null;
    seatNumber: string | null;
    row: string | null;
    event: {
      title: string;
      eventDate: string;
      venue: string;
      city: string;
    };
  };
}

export default function CartSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearPurchased } = useCart();

  const transactionsParam = searchParams.get('transactions') ?? '';
  const transactionIds = transactionsParam.split(',').filter(Boolean);

  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [buyerEmail, setBuyerEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionIds.length === 0) {
      setError('Paramètres manquants');
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          transactionIds.map((id) => fetch(`/api/transactions/${id}`).then((r) => r.json()))
        );

        const txs: TransactionSummary[] = results.map((r) => ({
          id: r.data.transaction.id,
          amount: Number(r.data.transaction.amount),
          platformFee: Number(r.data.transaction.platformFee),
          ticket: r.data.transaction.ticket,
        }));

        setTransactions(txs);
        setBuyerEmail(results[0]?.data?.transaction?.buyer?.email ?? '');
        clearPurchased(transactionIds);
      } catch {
        setError('Impossible de charger les données');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [transactionsParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16">
        <div className="container mx-auto max-w-3xl px-4 space-y-6">
          <Skeleton className="mx-auto h-20 w-20 rounded-full" />
          <Skeleton className="mx-auto h-10 w-80" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <Card className="border-destructive">
            <CardContent className="p-8 text-center">
              <p className="mb-6 text-muted-foreground">{error ?? 'Transaction introuvable'}</p>
              <Button onClick={() => router.push('/events')}>
                Retour aux événements <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalPaid = transactions.reduce((s, t) => s + t.amount, 0);
  const totalFees = transactions.reduce((s, t) => s + t.platformFee, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16">
      <div className="container mx-auto max-w-3xl px-4">

        {/* Header succès */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">🎉 Paiement réussi !</h1>
          <p className="text-lg text-muted-foreground">
            {transactions.length > 1
              ? `Vos ${transactions.length} billets ont été achetés avec succès`
              : 'Votre billet a été acheté avec succès'}
          </p>
          <Badge className="mt-3 bg-green-600 text-white px-4 py-1.5 text-sm">
            {transactions.length} billet{transactions.length > 1 ? 's' : ''} confirmé{transactions.length > 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Liste des billets achetés */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Vos billets</h2>
            <div className="space-y-3">
              {transactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{tx.ticket.event.title}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tx.ticket.event.eventDate), 'd MMM yyyy', { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {tx.ticket.event.venue}, {tx.ticket.event.city}
                        </span>
                        {tx.ticket.section && (
                          <span className="flex items-center gap-1">
                            <Ticket className="h-3 w-3" />
                            {tx.ticket.section}
                            {tx.ticket.seatNumber && ` – Siège ${tx.ticket.seatNumber}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold shrink-0 ml-4">
                    {(tx.amount - tx.platformFee).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span>Sous-total billets</span>
                <span>{(totalPaid - totalFees).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frais de service</span>
                <span>{totalFees.toFixed(2)} €</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total payé</span>
                <span className="text-green-700">{totalPaid.toFixed(2)} €</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prochaines étapes */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Prochaines étapes</h3>

            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Confirmation par email</p>
                <p className="text-sm text-muted-foreground">
                  Un email a été envoyé à <strong>{buyerEmail}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-4">
              <Download className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium">Téléchargez vos billets</p>
                <p className="mb-3 text-sm text-muted-foreground">
                  Vos billets sont disponibles dans votre compte
                </p>
                <div className="flex flex-wrap gap-2">
                  {transactions.map((tx, idx) => (
                    <Button key={tx.id} size="sm" variant="outline" asChild>
                      <a href={`/tickets/${tx.ticket.id}`}>
                        Billet {idx + 1}
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Garantie */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 shrink-0 text-green-600" />
              <div>
                <h3 className="mb-1 font-semibold text-green-900">🛡️ Protégé par la Garantie Sérénité</h3>
                <p className="text-sm text-green-800">
                  Votre achat est couvert. En cas de billet invalide ou d'événement annulé, vous serez intégralement remboursé.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1 bg-green-600 hover:bg-green-700" size="lg" asChild>
            <a href="/my-purchases">
              <Ticket className="mr-2 h-4 w-4" />
              Voir mes billets
            </a>
          </Button>
          <Button variant="outline" className="flex-1" size="lg" asChild>
            <a href="/events">
              <Home className="mr-2 h-4 w-4" />
              Découvrir d'autres événements
            </a>
          </Button>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Références : {transactionIds.map((id) => id.slice(0, 8).toUpperCase()).join(' · ')}
        </p>
      </div>
    </div>
  );
}
