/**
 * Page Mes Achats
 * Liste de tous les billets achetés avec filtres et pagination
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { MyPurchasesContent } from '@/components/buyer/MyPurchasesContent';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Mes achats | Acheteur',
  description: 'Consultez tous vos billets achetés',
};

export default async function MyPurchasesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mes achats</h1>
        <p className="text-muted-foreground mt-2">
          Retrouvez tous vos billets achetés et gérez vos transactions
        </p>
      </div>

      {/* Contenu principal */}
      <Suspense fallback={<MyPurchasesSkeleton />}>
        <MyPurchasesContent />
      </Suspense>
    </div>
  );
}

/**
 * Skeleton de chargement
 */
function MyPurchasesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Liste */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}
