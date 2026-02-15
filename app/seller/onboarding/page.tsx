/**
 * Page d'onboarding vendeur Stripe Connect
 */

'use client';

import { SellerOnboarding } from '@/components/stripe-connect';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

export default function SellerOnboardingPage() {
  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Devenir Vendeur</h1>
        <p className="mt-2 text-muted-foreground">
          Configurez votre compte pour commencer à vendre des billets sur Ava
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Onboarding Component */}
        <div className="lg:col-span-2">
          <SellerOnboarding />
        </div>

        {/* Right Column - Benefits */}
        <div className="space-y-6">
          {/* Why become a seller */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Pourquoi Ava ?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Paiements sécurisés</p>
                  <p className="text-sm text-muted-foreground">
                    Fonds protégés par séquestre
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Commission 15%</p>
                  <p className="text-sm text-muted-foreground">Transparente, sans frais cachés</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Paiement J+2</p>
                  <p className="text-sm text-muted-foreground">
                    Après chaque événement
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
                  <CheckCircle2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Protection anti-fraude</p>
                  <p className="text-sm text-muted-foreground">
                    Vérification des billets
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Requirements */}
          <Card className="p-6">
            <h3 className="mb-3 font-semibold">Documents nécessaires</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Pièce d&apos;identité (CNI/Passeport)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Coordonnées bancaires (IBAN)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Adresse postale</span>
              </li>
            </ul>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              ⏱️ Temps estimé : 5-10 minutes
            </p>
          </Card>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Vos informations sont sécurisées et traitées par Stripe, leader mondial des
              paiements en ligne. Ava ne stocke aucune donnée bancaire.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-blue-900">ℹ️ Bon à savoir</h3>
        <p className="text-sm text-blue-800">
          Une fois votre compte configuré, vos fonds seront versés 2 jours après chaque
          événement, sauf en cas de litige. Vous pouvez suivre vos paiements dans le dashboard
          Stripe Express.
        </p>
      </div>
    </div>
  );
}
