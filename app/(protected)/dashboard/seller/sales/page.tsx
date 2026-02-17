/**
 * Page Ventes du Dashboard Vendeur
 * Affiche l'historique des ventes et transactions
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// TODO: Remplacer par les vraies données via tRPC
function useSalesData() {
  return {
    stats: {
      totalSales: 0,
      revenue: 0,
      pendingPayouts: 0,
    },
    transactions: [],
    loading: false,
  };
}

function StatsCards() {
  const { stats, loading } = useSalesData();

  const cards = [
    {
      title: 'Ventes totales',
      value: stats.totalSales,
      icon: TrendingUp,
      description: 'Nombre de billets vendus',
    },
    {
      title: 'Revenus totaux',
      value: `${stats.revenue.toFixed(2)} €`,
      icon: DollarSign,
      description: 'Montant encaissé',
    },
    {
      title: 'Paiements en attente',
      value: `${stats.pendingPayouts.toFixed(2)} €`,
      icon: Package,
      description: 'À recevoir après événements',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="mt-1 h-3 w-32" />
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TransactionsList() {
  const { transactions, loading } = useSalesData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des ventes</CardTitle>
        <CardDescription>Vos transactions récentes</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Aucune vente</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Vos transactions apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* TODO: Mapper les vraies transactions */}
            {transactions.map((transaction: any) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{transaction.eventName}</h4>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{transaction.amount} €</span>
                  <Badge variant="secondary">{transaction.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function SellerSalesPage() {
  return (
    <div className="container max-w-7xl space-y-8 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ventes</h1>
        <p className="mt-2 text-muted-foreground">
          Suivez vos ventes et transactions
        </p>
      </div>

      <StatsCards />
      <TransactionsList />
    </div>
  );
}
