/**
 * Page de checkout global du panier
 * Route: /checkout/cart?transactions=id1,id2,...
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server-client';
import prisma from '@/lib/db/prisma';
import { CartCheckoutClient, CartCheckoutItem } from './cart-checkout-client';
import { Skeleton } from '@/components/ui/skeleton';

interface CartCheckoutPageProps {
  searchParams: { transactions?: string };
}

export default async function CartCheckoutPage({ searchParams }: CartCheckoutPageProps) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const transactionIds = (searchParams.transactions ?? '').split(',').filter(Boolean);
  if (transactionIds.length === 0) redirect('/cart');

  // Charger les transactions
  const transactions = await prisma.transaction.findMany({
    where: { id: { in: transactionIds }, buyerId: user.id },
    include: { ticket: { include: { event: true } } },
  });

  if (transactions.length === 0) redirect('/cart');

  // Vérifier qu'aucune n'est expirée ou déjà traitée
  const hasInvalid = transactions.some(
    (t) => t.status !== 'PENDING' || (t.ticket.expiresAt && t.ticket.expiresAt < new Date())
  );
  if (hasInvalid) redirect('/cart');

  // Construire les items pour le client
  const items: CartCheckoutItem[] = transactions.map((t) => ({
    transactionId: t.id,
    transactionIds: [t.id],
    type: 'single',
    eventTitle: t.ticket.event.title,
    eventDate: t.ticket.event.eventDate.toISOString(),
    section: t.ticket.section,
    seatNumber: t.ticket.seatNumber,
    quantity: 1,
    price: Number(t.amount),
    expiresAt: t.ticket.expiresAt?.toISOString() ?? new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  }));

  const totalAmount = items.reduce((s, i) => s + i.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-10">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Paiement du panier</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {transactions.length} billet{transactions.length > 1 ? 's' : ''} — un seul paiement sécurisé
          </p>
        </div>

        <Suspense fallback={<CartCheckoutSkeleton />}>
          <CartCheckoutClient
            items={items}
            totalAmount={totalAmount}
            allTransactionIds={transactionIds}
          />
        </Suspense>
      </div>
    </div>
  );
}

function CartCheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
