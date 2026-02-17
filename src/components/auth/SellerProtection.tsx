/**
 * Composant de protection des routes vendeur
 * Vérifie que l'utilisateur a un compte Stripe Connect actif
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStripeConnect } from '@/hooks/use-stripe-connect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';

interface SellerProtectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Composant qui protège une route et nécessite un compte vendeur actif
 */
export default function SellerProtection({
  children,
  fallback,
  redirectTo = '/dashboard/seller/profile',
}: SellerProtectionProps) {
  const router = useRouter();
  const { accountStatus, loading, error, checkAccountStatus, isAccountReady } =
    useStripeConnect();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      await checkAccountStatus();
      setChecking(false);
    };

    verify();
  }, [checkAccountStatus]);

  // Loading state
  if (loading || checking) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Vérification de votre compte...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Erreur
            </CardTitle>
            <CardDescription>
              Impossible de vérifier votre statut vendeur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => checkAccountStatus()} className="w-full">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Account not ready - show fallback or redirect prompt
  if (!isAccountReady) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Configuration requise</CardTitle>
            <CardDescription>
              Vous devez configurer votre compte vendeur pour accéder à cette page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!accountStatus?.hasAccount ? (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Vous n&apos;avez pas encore de compte vendeur configuré.
                  </AlertDescription>
                </Alert>
                <Button onClick={() => router.push(redirectTo)} className="w-full">
                  Configurer mon compte vendeur
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Votre compte vendeur nécessite des informations supplémentaires.
                  </AlertDescription>
                </Alert>

                {accountStatus.requirements?.currentlyDue &&
                  accountStatus.requirements.currentlyDue.length > 0 && (
                    <div className="rounded-lg border bg-muted/50 p-4">
                      <h4 className="mb-2 text-sm font-medium">Documents requis :</h4>
                      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {accountStatus.requirements.currentlyDue.map((req) => (
                          <li key={req}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                <Button onClick={() => router.push(redirectTo)} className="w-full">
                  Compléter mon profil
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Account is ready - render children
  return <>{children}</>;
}

/**
 * Hook pour vérifier si l'utilisateur peut vendre
 */
export function useRequireSellerAccount() {
  const router = useRouter();
  const { isAccountReady, checkAccountStatus } = useStripeConnect();

  useEffect(() => {
    const verify = async () => {
      await checkAccountStatus();
      if (!isAccountReady) {
        router.push('/dashboard/seller/profile');
      }
    };

    verify();
  }, [isAccountReady, checkAccountStatus, router]);

  return { isAccountReady };
}
