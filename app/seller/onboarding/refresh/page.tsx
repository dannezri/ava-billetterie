/**
 * Page de rafraîchissement pour l'onboarding Stripe Connect
 * Utilisée quand le lien d'onboarding expire
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function OnboardingRefreshPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger automatiquement vers la page d'onboarding
    const timer = setTimeout(() => {
      router.push('/seller/onboarding');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <CardTitle>Redirection en cours...</CardTitle>
          <CardDescription>
            Nous allons générer un nouveau lien pour compléter votre profil
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Si vous n&apos;êtes pas redirigé automatiquement,</p>
          <a href="/seller/onboarding" className="text-primary hover:underline">
            cliquez ici
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
