/**
 * Dashboard Page (Protected)
 */

import { LogoutButton } from '@/components/auth/LogoutButton';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server-client';
import { ShoppingBag, Ticket, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {user.user_metadata?.name || user.email} !
          </h1>
          <p className="text-muted-foreground">
            Gérez vos billets et transactions depuis votre tableau de bord
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mes billets</CardTitle>
              <Ticket className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Billets en vente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-2">
              Aucun billet en vente
            </p>
            <Button asChild className="w-full mt-4">
              <Link href="/tickets/create">Vendre un billet</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mes achats</CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Billets achetés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-2">
              Aucun achat récent
            </p>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/events">Parcourir les événements</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mes ventes</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>Revenus totaux</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0,00 €</div>
            <p className="text-xs text-muted-foreground mt-2">
              Aucune vente réalisée
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Commencer</CardTitle>
            <CardDescription>
              Découvrez les fonctionnalités principales d&apos;AVA Billetterie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Vérifiez votre identité</h3>
                <p className="text-sm text-muted-foreground">
                  Pour vendre des billets, vous devez d&apos;abord vérifier
                  votre identité
                </p>
                <Button asChild variant="link" className="px-0 mt-2">
                  <Link href="/profile/verify">
                    Vérifier mon identité →
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Parcourez les événements</h3>
                <p className="text-sm text-muted-foreground">
                  Découvrez les billets disponibles pour vos événements préférés
                </p>
                <Button asChild variant="link" className="px-0 mt-2">
                  <Link href="/events">Voir les événements →</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Vendez vos billets</h3>
                <p className="text-sm text-muted-foreground">
                  Mettez en vente vos billets inutilisés en toute sécurité
                </p>
                <Button asChild variant="link" className="px-0 mt-2">
                  <Link href="/tickets/create">Vendre un billet →</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
