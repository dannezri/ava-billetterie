/**
 * Page Mes Litiges
 * Liste de tous les litiges de l'acheteur
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DisputesList } from '@/components/disputes/DisputesList';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mes litiges | Ava',
  description: 'Consultez et gérez vos litiges',
};

export default function DisputesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes litiges</h1>
          <p className="text-muted-foreground mt-1">
            Suivez l'avancement de vos demandes
          </p>
        </div>
        <Button asChild>
          <Link href="/disputes/create">
            <Plus className="mr-2 h-4 w-4" />
            Ouvrir un litige
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        }
      >
        <DisputesList />
      </Suspense>
    </div>
  );
}
