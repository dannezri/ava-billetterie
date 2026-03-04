/**
 * Page Analytics Vendeur
 * Performances et statistiques de vente — thème vert (espace vendeur)
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, DollarSign, Eye, Star, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function useAnalyticsData() {
  return {
    overview: {
      totalViews: 0,
      conversionRate: 0,
      avgSellingPrice: 0,
      totalRevenue: 0,
      activeListings: 0,
      avgRating: 0,
    },
    loading: false,
  };
}

function OverviewCards() {
  const { overview, loading } = useAnalyticsData();

  const cards = [
    {
      label: 'Vues totales',
      value: overview.totalViews.toLocaleString('fr-FR'),
      icon: Eye,
      description: 'Sur toutes vos annonces',
    },
    {
      label: 'Taux de conversion',
      value: `${overview.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      description: 'Vues → ventes',
    },
    {
      label: 'Prix moyen',
      value: `${overview.avgSellingPrice.toFixed(2)} €`,
      icon: DollarSign,
      description: 'Par billet vendu',
    },
    {
      label: 'Revenus totaux',
      value: `${overview.totalRevenue.toFixed(2)} €`,
      icon: BarChart3,
      description: 'Nets après commission',
    },
    {
      label: 'Annonces actives',
      value: overview.activeListings.toString(),
      icon: Package,
      description: 'Billets en vente',
    },
    {
      label: 'Note moyenne',
      value: overview.avgRating > 0 ? `${overview.avgRating.toFixed(1)}/5` : '—',
      icon: Star,
      description: 'Satisfaction acheteurs',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-accentGreen-100">
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="border-accentGreen-100 hover:border-accentGreen-200 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <div className="p-1.5 rounded-md bg-accentGreen-50">
                  <Icon className="h-4 w-4 text-accentGreen-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-accentGreen-900">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-accentGreen-100">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 rounded-full bg-accentGreen-50 mb-4">
          <BarChart3 className="h-10 w-10 text-accentGreen-400" />
        </div>
        <h3 className="text-lg font-semibold text-accentGreen-900 mb-2">
          Pas encore de données
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Vos analytics apparaîtront ici une fois que vous aurez des billets en vente et des vues sur vos annonces.
        </p>
        <Badge className="mt-4 bg-accentGreen-100 text-accentGreen-700 hover:bg-accentGreen-100">
          Disponible bientôt
        </Badge>
      </CardContent>
    </Card>
  );
}

export default function SellerAnalyticsPage() {
  return (
    <div className="container max-w-7xl py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-accentGreen-900">
          Analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Suivez les performances de vos annonces et optimisez vos ventes
        </p>
      </div>

      {/* Cartes overview */}
      <OverviewCards />

      {/* Section graphiques (placeholder) */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-accentGreen-100">
          <CardHeader>
            <CardTitle className="text-accentGreen-900 text-base">Ventes par mois</CardTitle>
            <CardDescription>Évolution de vos ventes sur les 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState />
          </CardContent>
        </Card>

        <Card className="border-accentGreen-100">
          <CardHeader>
            <CardTitle className="text-accentGreen-900 text-base">Vues par annonce</CardTitle>
            <CardDescription>Annonces les plus consultées cette semaine</CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
