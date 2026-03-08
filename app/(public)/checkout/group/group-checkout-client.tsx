/**
 * GroupCheckoutClient
 * Composant client pour l'achat d'un groupe de billets adjacents.
 * Flow : Réserver → Accepter CGV → Payer (Stripe) → Succès
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreditCard,
  Clock,
  Loader2,
  Shield,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Users,
  Lock,
  Ticket,
} from 'lucide-react';
import Image from 'next/image';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

const PLATFORM_FEE_RATE = 0.05;
const TIMER_SECONDS = 15 * 60;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TicketItem {
  id: string;
  price: number;
  section: string | null;
  seatNumber: string | null;
  row: string | null;
}

interface GroupData {
  ticketIds: string[];
  tickets: TicketItem[];
  event: {
    id: string;
    title: string;
    eventDate: string;
    venue: string;
    city: string;
    imageUrl: string | null;
  };
  seller: {
    name: string | null;
    trustScore: number;
  };
}

// ─── Utilitaires ───────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(amount: number) {
  return `${amount.toFixed(2).replace('.', ',')} €`;
}

// ─── Form principal ────────────────────────────────────────────────────────────

function GroupCheckoutForm({
  group,
  preReservedTransactionIds,
}: {
  group: GroupData;
  preReservedTransactionIds?: string[] | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const isPreReserved = !!preReservedTransactionIds?.length;

  type Step = 'loading' | 'reserve' | 'payment' | 'processing';
  const [step, setStep] = useState<Step>(isPreReserved ? 'reserve' : 'loading');
  const [transactionIds, setTransactionIds] = useState<string[]>(
    preReservedTransactionIds ?? []
  );
  const [reservationData, setReservationData] = useState<{
    totalAmount: number;
    totalTicketsPrice: number;
    totalPlatformFee: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Prix calculés (avant réservation, pour l'affichage anticipé)
  const ticketsTotal = group.tickets.reduce((s, t) => s + t.price, 0);
  const platformFee = ticketsTotal * PLATFORM_FEE_RATE;
  const grandTotal = ticketsTotal + platformFee;

  // ── Réservation automatique au mount — sautée si pré-réservé depuis le panier ─
  useEffect(() => {
    if (isPreReserved) {
      // Données calculées localement à partir des billets
      setReservationData({
        totalAmount: grandTotal,
        totalTicketsPrice: ticketsTotal,
        totalPlatformFee: platformFee,
      });
      return;
    }

    const reserveAll = async () => {
      try {
        const res = await fetch('/api/tickets/reserve-group', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketIds: group.ticketIds }),
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error?.message ?? 'Échec de la réservation');
        }

        setTransactionIds(data.data.transactionIds);
        setReservationData({
          totalAmount: data.data.totalAmount,
          totalTicketsPrice: data.data.totalTicketsPrice,
          totalPlatformFee: data.data.totalPlatformFee,
        });
        setTimeLeft(Math.floor((new Date(data.data.expiresAt).getTime() - Date.now()) / 1000));
        setStep('reserve');
      } catch (err: any) {
        setError(err.message);
        setStep('reserve');
      }
    };

    reserveAll();
  }, [group.ticketIds, isPreReserved]);

  // ── Timer de réservation ────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 'payment' && step !== 'processing') return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Annuler la réservation
          if (transactionIds.length > 0) {
            fetch(`/api/tickets/reserve-group?transactionIds=${transactionIds.join(',')}`, {
              method: 'DELETE',
            }).catch(console.error);
          }
          setError('⏱️ Temps de réservation expiré. Redirection...');
          setTimeout(() => router.push(`/events/${group.event.id}`), 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft, transactionIds, router, group.event.id]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleContinueToPayment = () => {
    if (!acceptedTerms) {
      setError('Veuillez accepter les conditions générales de vente');
      return;
    }
    if (!reservationData) {
      setError('Réservation non confirmée. Veuillez réessayer.');
      return;
    }
    setError(null);
    setStep('payment');
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || transactionIds.length === 0) return;

    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      // 1. Créer le Payment Intent groupe
      const intentRes = await fetch('/api/payments/create-group-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionIds }),
      });
      const intentData = await intentRes.json();

      if (!intentRes.ok) {
        throw new Error(intentData.error?.message ?? 'Échec de la création du paiement');
      }

      // 2. Confirmer le paiement Stripe côté client
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Élément de carte introuvable');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.data.clientSecret,
        { payment_method: { card: cardElement } }
      );

      if (stripeError) throw new Error(stripeError.message);

      if (paymentIntent?.status === 'succeeded') {
        // Vérifier et mettre à jour les transactions côté serveur
        // (filet de sécurité si le webhook Stripe tarde ou n'est pas configuré en dev)
        await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionIds }),
        });

        router.push(
          `/checkout/group/success?transactions=${transactionIds.join(',')}&event=${group.event.id}`
        );
      }
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors du paiement');
      setStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Skeleton loading ────────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const displayTotal = reservationData?.totalAmount ?? grandTotal;
  const displayFee = reservationData?.totalPlatformFee ?? platformFee;
  const displayTicketsPrice = reservationData?.totalTicketsPrice ?? ticketsTotal;

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* ── Colonne gauche ──────────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-6">

        {/* Card : Badge groupe + événement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Votre groupe de {group.tickets.length} billets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Infos événement */}
            <div className="flex gap-4">
              {group.event.imageUrl && (
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={group.event.imageUrl}
                    alt={group.event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-1.5">
                <h3 className="text-lg font-bold">{group.event.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(group.event.eventDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {group.event.venue}, {group.event.city}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Liste des billets */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Sièges côte à côte
              </p>
              <div className="grid gap-2">
                {group.tickets.map((ticket, idx) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between rounded-lg border border-green-100 bg-green-50/50 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {ticket.section ?? 'Placement libre'}
                          {ticket.row && ` · Rang ${ticket.row}`}
                        </p>
                        {ticket.seatNumber && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Ticket className="h-3 w-3" />
                            Siège {ticket.seatNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-gray-800">
                      {formatPrice(ticket.price)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Badge garantie adjacence */}
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  Places garanties côte à côte — achat groupé obligatoire
                </p>
              </div>
            </div>

            {/* Vendeur */}
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vendu par</p>
                <p className="font-semibold">{group.seller.name ?? 'Vendeur anonyme'}</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Trust Score {group.seller.trustScore}/100
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* ── Étape : Conditions ──────────────────────────────────────────────── */}
        {step === 'reserve' && (
          <Card>
            <CardHeader>
              <CardTitle>Conditions de vente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Garanties */}
              <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-semibold">🛡️ Vos garanties</p>
                {[
                  { icon: Shield, text: 'Paiement sécurisé avec séquestre bancaire' },
                  { icon: CheckCircle2, text: 'Billets vérifiés par notre équipe' },
                  { icon: Lock, text: 'Protection acheteur garantie' },
                  { icon: CheckCircle2, text: 'Remboursement intégral en cas de problème' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-green-600" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(v) => setAcceptedTerms(!!v)}
                />
                <div className="space-y-1">
                  <Label htmlFor="terms" className="cursor-pointer text-sm font-medium">
                    J'accepte les conditions générales de vente
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    En cochant cette case, vous acceptez nos{' '}
                    <a href="/terms" className="underline hover:text-primary" target="_blank">
                      conditions générales
                    </a>{' '}
                    et notre{' '}
                    <a href="/privacy" className="underline hover:text-primary" target="_blank">
                      politique de confidentialité
                    </a>
                    .
                  </p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!reservationData && !error && (
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertDescription>Réservation des billets en cours…</AlertDescription>
                </Alert>
              )}

              {reservationData && (
                <Badge className="w-full justify-center gap-2 py-2 text-sm bg-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {group.tickets.length} billets réservés pour 15 minutes
                </Badge>
              )}

              <Button
                onClick={handleContinueToPayment}
                disabled={!acceptedTerms || !reservationData}
                className="w-full"
                size="lg"
              >
                Continuer vers le paiement
                <CreditCard className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Étape : Paiement Stripe ─────────────────────────────────────────── */}
        {(step === 'payment' || step === 'processing') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Paiement sécurisé
                </span>
                <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-mono font-bold">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className={timeLeft < 120 ? 'text-red-600' : ''}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <Label>Carte bancaire</Label>
                  <div className="rounded-lg border-2 border-input p-4 transition-colors focus-within:border-primary">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#000',
                            '::placeholder': { color: '#aab7c4' },
                          },
                          invalid: { color: '#dc2626' },
                        },
                        hidePostalCode: false,
                      }}
                    />
                  </div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Paiement sécurisé par Stripe. Données bancaires jamais stockées.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={!stripe || isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement…
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Payer {formatPrice(displayTotal)} pour {group.tickets.length} billets
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Colonne droite : Récapitulatif sticky ──────────────────────────────── */}
      <div>
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Détail par billet */}
            <div className="space-y-2">
              {group.tickets.map((ticket, idx) => (
                <div key={ticket.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Billet {idx + 1}
                    {ticket.seatNumber ? ` (Siège ${ticket.seatNumber})` : ''}
                  </span>
                  <span>{formatPrice(ticket.price)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total billets</span>
                <span>{formatPrice(displayTicketsPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Frais de service (5%)</span>
                <span>{formatPrice(displayFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-green-700">{formatPrice(displayTotal)}</span>
              </div>
            </div>

            {transactionIds.length > 0 && (
              <Badge variant="secondary" className="w-full justify-center py-2 text-xs">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {group.tickets.length} billets réservés
              </Badge>
            )}

            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs text-green-900">
                <strong>Garantie Sérénité</strong>
                <br />
                Remboursement intégral si un billet est invalide ou l'événement annulé.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Wrapper Elements Stripe ──────────────────────────────────────────────────

export function GroupCheckoutClient({
  group,
  preReservedTransactionIds,
}: {
  group: GroupData;
  preReservedTransactionIds?: string[] | null;
}) {
  return (
    <Elements stripe={stripePromise}>
      <GroupCheckoutForm group={group} preReservedTransactionIds={preReservedTransactionIds} />
    </Elements>
  );
}
