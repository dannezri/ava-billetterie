/**
 * Page "Mes Achats" - Liste des billets achetés par l'utilisateur
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server-client';
import prisma from '@/lib/db/prisma';
import { PurchasesList } from '@/components/purchases/PurchasesList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

async function getPurchases(userId: string) {
  const purchases = await prisma.transaction.findMany({
    where: {
      buyerId: userId,
      status: {
        in: ['PENDING', 'ESCROWED', 'RELEASED'],
      },
    },
    include: {
      ticket: {
        include: {
          event: true,
          seller: {
            select: {
              name: true,
              email: true,
              trustScore: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return purchases;
}

export default async function MyPurchasesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirect=/my-purchases');
  }

  const purchases = await getPurchases(user.id);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Mes Achats</h1>
        <p className="text-muted-foreground mt-2">
          Gérez vos billets achetés et téléchargez vos e-tickets
        </p>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aucun achat</CardTitle>
            <CardDescription>
              Vous n'avez pas encore acheté de billets. Parcourez nos événements pour trouver votre prochain concert !
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a
              href="/events"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Découvrir les événements
            </a>
          </CardContent>
        </Card>
      ) : (
        <Suspense fallback={<PurchasesListSkeleton />}>
          <PurchasesList purchases={purchases} />
        </Suspense>
      )}
    </div>
  );
}

function PurchasesListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
