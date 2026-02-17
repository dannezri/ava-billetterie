/**
 * Purchase Modal Component
 * Modal d'achat de billet avec récapitulatif, Stripe Elements et conditions
 */

'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  ShoppingCart,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Shield,
} from 'lucide-react';

// Initialiser Stripe (la clé publique sera passée via props)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface Ticket {
  id: string;
  price: number;
  section?: string;
  row?: string;
  seatNumber?: string;
  eventTitle: string;
  eventDate: Date;
  eventVenue: string;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  onSuccess?: () => void;
}

// Composant interne avec accès à Stripe
function PurchaseForm({
  ticket,
  onClose,
  onSuccess,
}: {
  ticket: Ticket;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes en secondes
  const [step, setStep] = useState<'reserve' | 'payment' | 'success'>('reserve');

  // Calcul des frais
  const platformFeeRate = 0.05; // 5%
  const platformFee = ticket.price * platformFeeRate;
  const totalAmount = ticket.price + platformFee;

  // Timer de réservation
  useEffect(() => {
    if (step !== 'payment' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('Temps de réservation expiré. Veuillez recommencer.');
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft, onClose]);

  // Formater le temps restant
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Étape 1: Réserver le billet
  const handleReserve = async () => {
    setIsProcessing(true);
    setError(null);

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
      setStep('payment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Étape 2: Traiter le paiement
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !acceptedTerms) {
      return;
    }

    setIsProcessing(true);
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
        throw new Error(intentData.error?.message || 'Échec de la création du paiement');
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
        setStep('success');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  // Rendu selon l'étape
  if (step === 'success') {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="mb-2 text-2xl font-bold">Paiement réussi !</h3>
        <p className="text-muted-foreground">
          Votre billet a été acheté avec succès.
          <br />
          Un email de confirmation vous a été envoyé.
        </p>
      </div>
    );
  }

  if (step === 'reserve') {
    return (
      <div className="space-y-6">
        {/* Récapitulatif */}
        <div className="space-y-4">
          <h3 className="font-semibold">Récapitulatif de votre achat</h3>

          <div className="rounded-lg border p-4 space-y-3">
            <div>
              <p className="font-semibold">{ticket.eventTitle}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(ticket.eventDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-sm text-muted-foreground">{ticket.eventVenue}</p>
            </div>

            <Separator />

            {ticket.section && (
              <div className="text-sm">
                <span className="text-muted-foreground">Placement : </span>
                <span className="font-medium">
                  {ticket.section}
                  {ticket.row && ` - ${ticket.row}`}
                  {ticket.seatNumber && ` - ${ticket.seatNumber}`}
                </span>
              </div>
            )}
          </div>

          {/* Détail des prix */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Prix du billet</span>
              <span>{ticket.price.toFixed(2)}€</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Frais de service (5%)
              </span>
              <span className="text-muted-foreground">
                {platformFee.toFixed(2)}€
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{totalAmount.toFixed(2)}€</span>
            </div>
          </div>

          {/* Garanties */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Paiement sécurisé avec séquestre</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Protection acheteur garantie</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Billet vérifié par l'équipe AVA</span>
            </div>
          </div>
        </div>

        {/* Conditions générales */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              J'accepte les conditions générales de vente
            </Label>
            <p className="text-sm text-muted-foreground">
              En cochant cette case, vous acceptez nos{' '}
              <a href="/cgu" className="underline hover:text-primary">
                conditions générales
              </a>
              {' '}et notre{' '}
              <a href="/privacy" className="underline hover:text-primary">
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Annuler
          </Button>
          <Button
            onClick={handleReserve}
            disabled={!acceptedTerms || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Réservation...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Continuer vers le paiement
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    );
  }

  // Étape paiement
  return (
    <form onSubmit={handlePayment} className="space-y-6">
      {/* Timer */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          Temps restant pour finaliser votre achat :{' '}
          <span className="font-bold">{formatTime(timeLeft)}</span>
        </AlertDescription>
      </Alert>

      {/* Récapitulatif compact */}
      <div className="rounded-lg border p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold">{ticket.eventTitle}</p>
            <p className="text-sm text-muted-foreground">{ticket.section}</p>
          </div>
          <Badge>Réservé</Badge>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between font-bold">
          <span>Total à payer</span>
          <span>{totalAmount.toFixed(2)}€</span>
        </div>
      </div>

      {/* Stripe Card Element */}
      <div className="space-y-2">
        <Label>Informations de paiement</Label>
        <div className="rounded-lg border p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Paiement sécurisé par Stripe. Vos informations bancaires ne sont jamais
          stockées.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Payer {totalAmount.toFixed(2)}€
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Composant principal avec Elements Provider
export function PurchaseModal({
  isOpen,
  onClose,
  ticket,
  onSuccess,
}: PurchaseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Acheter un billet
          </DialogTitle>
          <DialogDescription>
            Finalisez votre achat en toute sécurité
          </DialogDescription>
        </DialogHeader>

        <Elements stripe={stripePromise}>
          <PurchaseForm ticket={ticket} onClose={onClose} onSuccess={onSuccess} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
