/**
 * Page de confirmation après onboarding Stripe Connect
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home, Plus } from 'lucide-react';

export default function OnboardingCompletePage() {
  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Configuration Terminée !</CardTitle>
          <CardDescription>
            Votre compte vendeur est maintenant configuré
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-semibold mb-3">Prochaines étapes :</h3>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2 font-semibold text-primary">1.</span>
                <span>Listez votre premier billet en téléchargeant le PDF</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 font-semibold text-primary">2.</span>
                <span>Attendez la validation (généralement sous 24h)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 font-semibold text-primary">3.</span>
                <span>Recevez vos paiements 2 jours après l&apos;événement</span>
              </li>
            </ol>
          </div>

          <div className="grid gap-2">
            <Button asChild size="lg">
              <Link href="/seller/tickets/new">
                <Plus className="mr-2 h-4 w-4" />
                Vendre mon premier billet
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Vous pouvez accéder à votre profil vendeur à tout moment depuis{' '}
            <Link href="/seller/dashboard" className="text-primary hover:underline">
              votre dashboard
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
