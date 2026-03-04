/**
 * Page Détail d'un achat
 * Affiche toutes les informations d'une transaction, le billet, le vendeur, etc.
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { PurchaseDetailContent } from '@/components/buyer/PurchaseDetailContent';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Détail de l\'achat | Acheteur',
  description: 'Consultez les détails de votre achat',
};

export default async function PurchaseDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<PurchaseDetailSkeleton />}>
        <PurchaseDetailContent transactionId={params.id} />
      </Suspense>
    </div>
  );
}

function PurchaseDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
