'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck, ShieldAlert, Loader2, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Initialisation de Stripe (une seule fois)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface IdentityVerificationProps {
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export default function IdentityVerification({ status }: IdentityVerificationProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleVerifyClick = async () => {
    setLoading(true);
    try {
      // 1. Obtenir le client_secret depuis notre API
      const response = await fetch('/api/kyc/create-session', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'initialisation de la vérification');
      }

      const { clientSecret } = await response.json();

      // 2. Charger Stripe
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe n\'a pas pu être chargé');

      // 3. Ouvrir la modale de vérification d'identité
      const { error } = await stripe.verifyIdentity(clientSecret);

      if (error) {
        throw error;
      } else {
        // Succès (la vérification est en cours de traitement par Stripe)
        toast({
          title: 'Documents envoyés',
          description: 'La page va se recharger pour mettre à jour votre statut.',
        });
        
        // Délai pour laisser le temps au webhook de traiter (3s)
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur KYC:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'VERIFIED') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-green-100 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-green-900">Identité vérifiée</h4>
            <p className="text-sm text-green-700">
              Votre identité a été confirmée. Vous pouvez vendre sans restriction.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pour garantir la sécurité des transactions, nous devons vérifier votre identité avant votre première vente.
      </p>

      <div className="space-y-4">
        {status === 'REJECTED' && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Vérification échouée</AlertTitle>
            <AlertDescription>
              Nous n&apos;avons pas pu vérifier votre identité. Veuillez réessayer avec des documents plus clairs.
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">Documents acceptés :</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Carte d&apos;identité nationale</li>
              <li>Passeport</li>
              <li>Permis de conduire</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            🔒 La vérification est réalisée de manière sécurisée par Stripe Identity. Vos documents ne sont pas stockés sur nos serveurs.
          </p>
        </div>

        <Button onClick={handleVerifyClick} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            'Démarrer la vérification'
          )}
        </Button>
      </div>
    </div>
  );
}
