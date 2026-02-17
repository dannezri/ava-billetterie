/**
 * Composant d'onboarding vendeur Stripe Connect
 * Permet de créer et configurer un compte vendeur
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

console.log('🚨 SellerOnboarding.tsx module loaded');

interface AccountStatus {
  hasAccount: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  requirements?: {
    currentlyDue: string[];
    pastDue: string[];
    pendingVerification: string[];
  };
}

export default function SellerOnboarding() {
  console.log('✨ SellerOnboarding function called');
  const { user, loading: authLoading } = useAuth();
  console.log('👤 useAuth result:', { user: user?.id, authLoading });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Vérifier le statut du compte au chargement
  useEffect(() => {
    console.log('🔄 SellerOnboarding component mounted');
    if (!authLoading) {
      if (user) {
        checkAccountStatus();
      } else {
        setCheckingStatus(false);
      }
    }
  }, [user, authLoading]);

  /**
   * Vérifier le statut du compte Connect
   */
  const checkAccountStatus = async () => {
    try {
      setCheckingStatus(true);
      const response = await fetch('/api/stripe-connect/account-status');
      
      if (response.status === 401) {
        setCheckingStatus(false);
        return; // Non authentifié
      }

      const data = await response.json();

      if (response.ok) {
        console.log('📊 Account status received:', data);
        setAccountStatus(data);
      } else {
        console.log('❌ No account yet');
        // Pas de compte encore
        setAccountStatus({ hasAccount: false });
      }
    } catch (err) {
      console.error('Error checking account status:', err);
      setAccountStatus({ hasAccount: false });
    } finally {
      setCheckingStatus(false);
    }
  };

  /**
   * Démarrer l'onboarding Stripe Connect
   */
  const startOnboarding = async () => {
    console.log('🚀 Start onboarding clicked');
    alert('🚀 Bouton cliqué ! Le onboarding va démarrer...');
    try {
      setLoading(true);
      setError(null);

      // Créer ou récupérer le lien d'onboarding
      console.log('📡 Calling /api/stripe-connect/onboarding-link...');
      const response = await fetch('/api/stripe-connect/onboarding-link', {
        method: 'POST',
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération du lien');
      }

      if (!data.onboardingUrl) {
        throw new Error('Aucune URL d\'onboarding reçue');
      }

      console.log('🔗 Redirecting to:', data.onboardingUrl);
      // Rediriger vers Stripe Connect
      window.location.href = data.onboardingUrl;
    } catch (err) {
      console.error('❌ Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ouvrir le dashboard Stripe Express
   */
  const openDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/stripe-connect/dashboard-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        window.open(data.url, '_blank');
      } else {
        setError(data.error || "Erreur lors de l'ouverture du dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Déterminer le statut global du compte
   */
  const getAccountStatusBadge = () => {
    if (!accountStatus || !accountStatus.hasAccount) {
      return <Badge variant="secondary">Non configuré</Badge>;
    }

    if (
      accountStatus.chargesEnabled &&
      accountStatus.payoutsEnabled &&
      accountStatus.detailsSubmitted
    ) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Actif
        </Badge>
      );
    }

    if (accountStatus.requirements?.pastDue && accountStatus.requirements.pastDue.length > 0) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          Action requise
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        <AlertCircle className="mr-1 h-3 w-3" />
        En attente
      </Badge>
    );
  };

  if (authLoading || checkingStatus) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Vous devez être connecté pour configurer votre compte vendeur.
        </p>
        <Button onClick={() => router.push('/login')} className="w-full">
          <LogIn className="mr-2 h-4 w-4" />
          Se connecter
        </Button>
      </div>
    );
  }

  console.log('🎨 SellerOnboarding rendering, accountStatus:', accountStatus);
  
  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Configurez votre compte Stripe pour recevoir des paiements
          </p>
        </div>
        {accountStatus && getAccountStatusBadge()}
      </div>

      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Compte non configuré */}
        {!accountStatus?.hasAccount && (
          <>
            {console.log('🔴 Rendering: No account button')}
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <p className="text-sm">
                Pour vendre des billets, vous devez configurer votre compte vendeur.
                <span className="text-muted-foreground"> Ce processus prend environ 5 minutes.</span>
              </p>

              <div className="space-y-2">
                <p className="text-sm font-medium">Ce dont vous aurez besoin :</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  <li>Pièce d&apos;identité (CNI, Passeport)</li>
                  <li>Coordonnées bancaires (IBAN)</li>
                  <li>Adresse postale</li>
                </ul>
              </div>
            </div>

            <Button onClick={startOnboarding} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirection...
                </>
              ) : (
                'Commencer la configuration'
              )}
            </Button>
          </div>
          </>
        )}

        {/* Compte configuré mais incomplet */}
        {accountStatus?.hasAccount &&
          (!accountStatus.chargesEnabled ||
            !accountStatus.payoutsEnabled ||
            !accountStatus.detailsSubmitted) && (
            <>
              {console.log('🟡 Rendering: Incomplete account button')}
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Votre compte vendeur nécessite des informations supplémentaires pour être activé.
                </AlertDescription>
              </Alert>

              {accountStatus.requirements?.currentlyDue &&
                accountStatus.requirements.currentlyDue.length > 0 && (
                  <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                    <p className="text-sm font-medium">Documents requis :</p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {accountStatus.requirements.currentlyDue.map((req) => (
                        <li key={req}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="flex gap-2">
                <Button onClick={startOnboarding} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirection...
                    </>
                  ) : (
                    'Compléter mon profil'
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={checkAccountStatus}
                  disabled={loading}
                  size="icon"
                >
                  <Loader2 className={loading ? 'h-4 w-4 animate-spin' : 'hidden'} />
                  {!loading && '🔄'}
                </Button>
              </div>
            </div>
            </>
          )}

        {/* Compte actif */}
        {accountStatus?.hasAccount &&
          accountStatus.chargesEnabled &&
          accountStatus.payoutsEnabled &&
          accountStatus.detailsSubmitted && (
            <>
              {console.log('🟢 Rendering: Active account dashboard button')}
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Votre compte vendeur est actif ! Vous pouvez maintenant vendre des billets.
                </AlertDescription>
              </Alert>

              <div className="grid gap-2">
                <Button variant="outline" onClick={openDashboard} disabled={loading}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Accéder à mon dashboard Stripe
                </Button>

                <Button variant="ghost" onClick={checkAccountStatus} disabled={loading} size="sm">
                  Rafraîchir le statut
                </Button>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="mb-2 text-sm font-medium">État du compte</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ Paiements activés</li>
                  <li>✅ Retraits activés</li>
                  <li>✅ Profil complété</li>
                </ul>
              </div>
            </div>
            </>
          )}
      </div>
    </div>
  );
}
