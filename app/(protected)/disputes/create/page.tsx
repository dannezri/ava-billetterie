/**
 * Page Créer un Litige
 * Formulaire complet pour ouvrir un litige sur un achat
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { DisputeCreateForm } from '@/components/disputes/DisputeCreateForm';
import { AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ouvrir un litige | Ava',
  description: 'Signalez un problème avec votre achat',
};

export default function DisputeCreatePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Ouvrir un litige</h1>
        <p className="text-muted-foreground">
          Signalez un problème avec votre achat. Notre support vous répondra sous 2 heures.
        </p>
      </div>

      {/* Alerte fenêtre litige */}
      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>Fenêtre de litige : J-1 à J+2 après l'événement.</strong>{' '}
          Les litiges ne peuvent être ouverts que pour des billets achetés 1 jour avant
          à 2 jours après la date de l'événement.
        </AlertDescription>
      </Alert>

      {/* Formulaire */}
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-52 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        }
      >
        <DisputeCreateForm />
      </Suspense>
    </div>
  );
}
