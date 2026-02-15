/**
 * Dashboard vendeur - Page protégée
 * Nécessite un compte Stripe Connect actif
 */

'use client';

import { SellerProtection } from '@/components/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStripeConnect } from '@/hooks/use-stripe-connect';
import { Plus, Package, TrendingUp, DollarSign, ExternalLink } from 'lucide-react';
import Link from 'next/link';

function DashboardContent() {
  const { openDashboard, loading } = useStripeConnect();

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Vendeur</h1>
          <p className="mt-2 text-muted-foreground">
            Gérez vos billets et suivez vos ventes
          </p>
        </div>
        <Button asChild>
          <Link href="/seller/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            Vendre un billet
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billets en vente</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Aucun billet actif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Commencez à vendre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0,00 €</div>
            <p className="text-xs text-muted-foreground">En attente de ventes</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Vos dernières transactions et billets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Aucune activité</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Commencez par vendre votre premier billet
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/seller/tickets/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Vendre un billet
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/seller/tickets/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Vendre un billet
                </Link>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={openDashboard}
                disabled={loading}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Dashboard Stripe
              </Button>

              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/seller/settings">
                  <Package className="mr-2 h-4 w-4" />
                  Mes paramètres
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guide vendeur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="mb-1 font-medium">1. Téléchargez votre billet</h4>
                <p className="text-muted-foreground">
                  Format PDF uniquement, taille max 5MB
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-medium">2. Attendez la validation</h4>
                <p className="text-muted-foreground">
                  Notre équipe vérifie sous 24h
                </p>
              </div>
              <div>
                <h4 className="mb-1 font-medium">3. Recevez vos paiements</h4>
                <p className="text-muted-foreground">
                  2 jours après l&apos;événement
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SellerDashboardPage() {
  return (
    <SellerProtection>
      <DashboardContent />
    </SellerProtection>
  );
}
