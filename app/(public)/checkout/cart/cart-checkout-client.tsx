'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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
  AlertCircle,
  Lock,
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CartCheckoutItem {
  transactionId: string;
  transactionIds: string[];
  type: 'single' | 'group';
  eventTitle: string;
  eventDate: string;
  section: string | null;
  seatNumber: string | null;
  quantity: number;
  price: number;       // TTC
  expiresAt: string;
}

interface CartCheckoutClientProps {
  items: CartCheckoutItem[];
  totalAmount: number;
  allTransactionIds: string[];
}

// ─── Countdown global ─────────────────────────────────────────────────────────

function useEarliestCountdown(items: CartCheckoutItem[]): { label: string; isUrgent: boolean } {
  const [state, setState] = useState({ label: '...', isUrgent: false });

  useEffect(() => {
    const tick = () => {
      const earliest = Math.min(...items.map((i) => new Date(i.expiresAt).getTime()));
      const diff = earliest - Date.now();
      if (diff <= 0) {
        setState({ label: '0:00', isUrgent: true });
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setState({ label: `${m}:${s.toString().padStart(2, '0')}`, isUrgent: diff < 3 * 60 * 1000 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [items]);

  return state;
}

// ─── Formulaire Stripe ────────────────────────────────────────────────────────

function CartCheckoutForm({ items, totalAmount, allTransactionIds }: CartCheckoutClientProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [step, setStep] = useState<'review' | 'payment' | 'processing'>('review');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { label: countdown, isUrgent } = useEarliestCountdown(items);
  const platformFee = totalAmount - items.reduce((s, i) => s + Number(i.price) / 1.05, 0);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setStep('processing');
    setError(null);

    try {
      // 1. Créer le PaymentIntent global
      const intentRes = await fetch('/api/payments/create-cart-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionIds: allTransactionIds }),
      });
      const intentData = await intentRes.json();

      if (!intentRes.ok) {
        throw new Error(intentData.error?.message ?? 'Échec de la création du paiement');
      }

      // 2. Confirmer le paiement
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Élément de carte introuvable');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentData.data.clientSecret,
        { payment_method: { card: cardElement } }
      );

      if (stripeError) throw new Error(stripeError.message);

      if (paymentIntent?.status === 'succeeded') {
        // 3. Vérifier + mettre à jour toutes les transactions en BDD
        await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionIds: allTransactionIds }),
        });

        router.push(`/checkout/cart/success?transactions=${allTransactionIds.join(',')}`);
      }
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors du paiement');
      setStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* ── Colonne principale ──────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-6">

        {/* Récapitulatif des billets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Vos billets ({items.reduce((s, i) => s + i.quantity, 0)})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between rounded-lg border bg-slate-50 p-4"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{item.eventTitle}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(item.eventDate), 'EEEE d MMMM yyyy', { locale: fr })}
                  </div>
                  {(item.section || item.seatNumber) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {[item.section, item.seatNumber && `Siège ${item.seatNumber}`]
                        .filter(Boolean)
                        .join(' — ')}
                    </div>
                  )}
                  {item.type === 'group' && (
                    <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                      {item.quantity} places côte à côte
                    </Badge>
                  )}
                </div>
                <span className="font-bold text-sm shrink-0 ml-4">
                  {Number(item.price).toFixed(2)} €
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Étape Conditions */}
        {step === 'review' && (
          <Card>
            <CardHeader>
              <CardTitle>Conditions de vente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Paiement sécurisé en une seule fois</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Tous vos billets sont vérifiés par notre équipe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span>Protection acheteur — remboursement garanti</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(v) => setAcceptedTerms(v as boolean)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  J'accepte les{' '}
                  <a href="/terms" className="underline hover:text-primary" target="_blank">
                    conditions générales de vente
                  </a>
                </Label>
              </div>

              <Button
                onClick={() => {
                  if (!acceptedTerms) { setError('Acceptez les conditions pour continuer'); return; }
                  setError(null);
                  setStep('payment');
                }}
                disabled={!acceptedTerms}
                className="w-full"
                size="lg"
              >
                Continuer vers le paiement
                <CreditCard className="ml-2 h-4 w-4" />
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
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
                <Alert
                  className={`inline-flex w-auto items-center gap-2 py-1.5 px-3 ${
                    isUrgent ? 'border-red-300 bg-red-50 text-red-700' : ''
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span className="font-mono font-bold text-sm">{countdown}</span>
                </Alert>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <Label>Carte bancaire</Label>
                  <div className="rounded-lg border-2 border-input p-4 focus-within:border-primary transition-colors">
                    <CardElement
                      options={{
                        style: {
                          base: { fontSize: '16px', color: '#000', '::placeholder': { color: '#aab7c4' } },
                          invalid: { color: '#dc2626' },
                        },
                        hidePostalCode: false,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Vos données bancaires ne sont jamais stockées.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={!stripe || isProcessing} className="w-full" size="lg">
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement en cours…
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Payer {totalAmount.toFixed(2)} €
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Récapitulatif ───────────────────────────────────────────────── */}
      <div className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-muted-foreground truncate max-w-[60%]">
                    {item.quantity > 1 ? `${item.quantity}× ` : ''}{item.eventTitle}
                  </span>
                  <span className="font-medium shrink-0">{Number(item.price).toFixed(2)} €</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total billets</span>
                <span>{(totalAmount - platformFee).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Frais de service (5%)</span>
                <span>{platformFee.toFixed(2)} €</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{totalAmount.toFixed(2)} €</span>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs text-green-900">
                <strong>Garantie Sérénité</strong> — Remboursement intégral si un billet est invalide.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Export avec Elements wrapper ─────────────────────────────────────────────

export function CartCheckoutClient(props: CartCheckoutClientProps) {
  return (
    <Elements stripe={stripePromise}>
      <CartCheckoutForm {...props} />
    </Elements>
  );
}
