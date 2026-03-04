/**
 * Composant Client Checkout avec Stripe Elements
 * Gère le flow: Reserve → Payment → Success
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
  User,
  Lock,
} from 'lucide-react';
import Image from 'next/image';
import { formatDate, formatPrice } from '@/lib/utils';

// Initialiser Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface TicketData {
  id: string;
  price: number;
  section: string | null;
  row: string | null;
  seatNumber: string | null;
  eventTitle: string;
  eventDate: Date;
  eventVenue: string;
  eventCity: string;
  eventImage: string | null;
  seller: {
    name: string | null;
    trustScore: number;
  };
}

interface CheckoutClientProps {
  ticket: TicketData;
  /** TransactionId déjà créé depuis le panier — skip auto-reserve si présent */
  preReservedTransactionId?: string | null;
}

// Composant avec accès à Stripe Context
function CheckoutForm({
  ticket,
  preReservedTransactionId,
}: {
  ticket: TicketData;
  preReservedTransactionId?: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [step, setStep] = useState<'loading' | 'reserve' | 'payment' | 'processing'>(
    preReservedTransactionId ? 'reserve' : 'loading'
  );
  const [reservationId, setReservationId] = useState<string | null>(
    preReservedTransactionId ?? null
  );
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calcul des montants
  const platformFeeRate = 0.05; // 5%
  const platformFee = ticket.price * platformFeeRate;
  const totalAmount = ticket.price + platformFee;

  // Auto-réservation au chargement — sautée si transactionId déjà fourni depuis le panier
  useEffect(() => {
    if (preReservedTransactionId) return;

    const reserveTicket = async () => {
      try {
        const response = await fetch('/api/tickets/reserve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticketId: ticket.id }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'Échec de la réservation');
        }

        setReservationId(data.data.transactionId);
        setTimeLeft(Math.floor((new Date(data.data.expiresAt).getTime() - Date.now()) / 1000));
        setStep('reserve');
      } catch (err: any) {
        setError(err.message);
        setStep('reserve');
      }
    };

    reserveTicket();
  }, [ticket.id, preReservedTransactionId]);

  // Timer de réservation
  useEffect(() => {
    if (step !== 'payment' && step !== 'processing') return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('⏱️ Temps de réservation expiré. Redirection...');
          setTimeout(() => {
            router.push(`/events/${ticket.id}`);
          }, 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft, router, ticket.id]);

  // Formater le temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Passer à l'étape paiement
  const handleContinueToPayment = () => {
    if (!acceptedTerms) {
      setError('Vous devez accepter les conditions générales');
      return;
    }
    setError(null);
    setStep('payment');
  };

  // Traiter le paiement
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !reservationId) {
      return;
    }

    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      // 1. Créer Payment Intent
      const intentResponse = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          transactionId: reservationId,
        }),
      });

      const intentData = await intentResponse.json();

      if (!intentResponse.ok) {
        throw new Error(
          intentData.error?.message || 'Échec de la création du paiement'
        );
      }

      // 2. Confirmer le paiement avec Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Élément de carte non trouvé');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.data.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Vérifier et mettre à jour la transaction côté serveur
        // (filet de sécurité si le webhook Stripe tarde ou n'est pas configuré en dev)
        await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: reservationId }),
        });

        router.push(`/checkout/success?transactionId=${reservationId}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement');
      setStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Affichage selon l'étape
  if (step === 'loading') {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Colonne gauche: Détails */}
      <div className="lg:col-span-2 space-y-6">
        {/* Card Événement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Votre billet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {ticket.eventImage && (
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={ticket.eventImage}
                    alt={ticket.eventTitle}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold">{ticket.eventTitle}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(new Date(ticket.eventDate))}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {ticket.eventVenue}, {ticket.eventCity}
                  </div>
                </div>
                {ticket.section && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {ticket.section}
                      {ticket.row && ` - ${ticket.row}`}
                      {ticket.seatNumber && ` - Siège ${ticket.seatNumber}`}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Vendeur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Vendu par
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{ticket.seller.name || 'Vendeur'}</p>
                <p className="text-sm text-muted-foreground">
                  Score de confiance: {ticket.seller.trustScore}/100
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Vérifié
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Étape Réservation */}
        {step === 'reserve' && (
          <Card>
            <CardHeader>
              <CardTitle>Conditions de vente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Garanties */}
              <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                <h4 className="font-semibold text-sm">🛡️ Vos garanties</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Paiement sécurisé avec séquestre bancaire</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Billet vérifié par notre équipe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    <span>Protection acheteur garantie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Remboursement en cas de problème</span>
                  </div>
                </div>
              </div>

              {/* Checkbox CGV */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                    J'accepte les conditions générales de vente
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    En cochant cette case, vous acceptez nos{' '}
                    <a href="/cgu" className="underline hover:text-primary" target="_blank">
                      conditions générales
                    </a>
                    {' '}et notre{' '}
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

              <Button
                onClick={handleContinueToPayment}
                disabled={!acceptedTerms || !reservationId}
                className="w-full"
                size="lg"
              >
                Continuer vers le paiement
                <CreditCard className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Étape Paiement */}
        {(step === 'payment' || step === 'processing') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Paiement sécurisé
                </span>
                <Alert className="inline-flex w-auto items-center gap-2 py-2 px-3">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                </Alert>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <Label>Informations de carte bancaire</Label>
                  <div className="rounded-lg border-2 border-input p-4 focus-within:border-primary transition-colors">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#000',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#dc2626',
                          },
                        },
                        hidePostalCode: false,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Paiement sécurisé par Stripe. Vos données bancaires ne sont jamais stockées.
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
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Payer {formatPrice(totalAmount)}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Colonne droite: Récapitulatif */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Prix du billet</span>
                <span className="font-medium">{formatPrice(ticket.price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frais de service (5%)</span>
                <span className="text-muted-foreground">{formatPrice(platformFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {reservationId && (
              <Badge variant="secondary" className="w-full justify-center py-2">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Billet réservé
              </Badge>
            )}

            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs text-green-900">
                <strong>Garantie Sérénité</strong>
                <br />
                Remboursement intégral si le billet est invalide ou si l'événement est annulé.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Composant wrapper avec Elements Provider
export function CheckoutClient({ ticket, preReservedTransactionId }: CheckoutClientProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm ticket={ticket} preReservedTransactionId={preReservedTransactionId} />
    </Elements>
  );
}
