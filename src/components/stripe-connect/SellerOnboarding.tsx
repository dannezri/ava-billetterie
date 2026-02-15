/**
 * Composant d'onboarding vendeur Stripe Connect
 * Permet de créer et configurer un compte vendeur
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

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
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Vérifier le statut du compte au chargement
  useEffect(() => {
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
        setAccountStatus(data);
      } else {
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
    try {
      setLoading(true);
      setError(null);

      // Créer ou récupérer le lien d'onboarding
      const response = await fetch('/api/stripe-connect/onboarding-link', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération du lien');
      }

      // Rediriger vers Stripe Connect
      window.location.href = data.onboardingUrl;
    } catch (err) {
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
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connexion requise</CardTitle>
          <CardDescription>
            Vous devez être connecté pour configurer votre compte vendeur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/login')} className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Se connecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Compte Vendeur</CardTitle>
            <CardDescription>
              Configurez votre compte pour recevoir des paiements
            </CardDescription>
          </div>
          {accountStatus && getAccountStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Compte non configuré */}
        {!accountStatus?.hasAccount && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pour vendre des billets sur Ava, vous devez configurer votre compte vendeur.
              Ce processus prend environ 5 minutes.
            </p>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Ce dont vous aurez besoin :</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                <li>Pièce d&apos;identité (CNI, Passeport)</li>
                <li>Coordonnées bancaires (IBAN)</li>
                <li>Adresse postale</li>
              </ul>
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
        )}

        {/* Compte configuré mais incomplet */}
        {accountStatus?.hasAccount &&
          (!accountStatus.chargesEnabled ||
            !accountStatus.payoutsEnabled ||
            !accountStatus.detailsSubmitted) && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Votre compte vendeur nécessite des informations supplémentaires pour être activé.
                </AlertDescription>
              </Alert>

              {accountStatus.requirements?.currentlyDue &&
                accountStatus.requirements.currentlyDue.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Documents requis :</h4>
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
          )}

        {/* Compte actif */}
        {accountStatus?.hasAccount &&
          accountStatus.chargesEnabled &&
          accountStatus.payoutsEnabled &&
          accountStatus.detailsSubmitted && (
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

              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-medium">Informations</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✅ Paiements activés</li>
                  <li>✅ Retraits activés</li>
                  <li>✅ Profil complété</li>
                </ul>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
