/**
 * Contenu principal du dashboard acheteur (Client Component)
 * Récupère et affiche les données via React Query
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, ShoppingBag, TrendingUp, Bell, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type DashboardData = {
  stats: {
    totalPurchases: number;
    totalSpent: number;
    upcomingConcerts: number;
  };
  upcomingConcerts: Array<{
    id: string;
    ticket: {
      event: {
        id: string;
        title: string;
        artist: string;
        venue: string;
        city: string;
        event_date: string;
        image_url: string | null;
      };
    };
    status: string;
    escrow_release_date: string | null;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    created_at: string;
    metadata: any;
  }>;
  accountStatus: {
    emailVerified: boolean;
    profileComplete: boolean;
  };
};

export function DashboardContent() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Impossible de charger les données du dashboard. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Alertes de statut du compte */}
      {(!data.accountStatus.emailVerified || !data.accountStatus.profileComplete) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {!data.accountStatus.emailVerified && (
              <p>
                Veuillez vérifier votre adresse email.{' '}
                <Link href="/verify-email" className="underline font-medium">
                  Renvoyer l'email
                </Link>
              </p>
            )}
            {!data.accountStatus.profileComplete && (
              <p>
                Complétez votre profil pour profiter pleinement de la plateforme.{' '}
                <Link href="/profile" className="underline font-medium">
                  Compléter mon profil
                </Link>
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des achats</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalPurchases}</div>
            <p className="text-xs text-muted-foreground">billets achetés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalSpent.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">sur tous vos achats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prochains concerts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.upcomingConcerts}</div>
            <p className="text-xs text-muted-foreground">à venir</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">non lues</p>
          </CardContent>
        </Card>
      </div>

      {/* Prochains concerts */}
      <Card>
        <CardHeader>
          <CardTitle>Prochains concerts</CardTitle>
          <CardDescription>Vos billets pour les événements à venir</CardDescription>
        </CardHeader>
        <CardContent>
          {data.upcomingConcerts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Aucun concert à venir</p>
              <Button asChild>
                <Link href="/events">Découvrir des événements</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.upcomingConcerts.map((concert) => (
                <Link
                  key={concert.id}
                  href={`/my-purchases/${concert.id}`}
                  className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  {concert.ticket.event.image_url && (
                    <img
                      src={concert.ticket.event.image_url}
                      alt={concert.ticket.event.title}
                      className="w-20 h-20 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{concert.ticket.event.title}</h3>
                    <p className="text-sm text-muted-foreground">{concert.ticket.event.artist}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {format(new Date(concert.ticket.event.event_date), 'PPP', { locale: fr })}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {concert.ticket.event.venue}, {concert.ticket.event.city}
                      </span>
                    </div>
                  </div>
                  {concert.status === 'ESCROWED' && concert.escrow_release_date && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Séquestre
                    </Badge>
                  )}
                </Link>
              ))}
              <Button asChild variant="outline" className="w-full">
                <Link href="/my-purchases">Voir tous mes achats</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentActivity.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucune activité récente</p>
          ) : (
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="mt-1">
                    {activity.action.includes('PAYMENT') && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {activity.action.includes('DISPUTE') && (
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                    )}
                    {activity.action.includes('REVIEW') && <Bell className="h-5 w-5 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{getActivityLabel(activity.action)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activity.created_at), 'PPp', { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Convertit les actions d'audit en libellés lisibles
 */
function getActivityLabel(action: string): string {
  const labels: Record<string, string> = {
    PAYMENT_SUCCEEDED: 'Paiement effectué avec succès',
    DISPUTE_OPENED: 'Litige ouvert',
    DISPUTE_RESOLVED: 'Litige résolu',
    REVIEW_CREATED: 'Avis laissé',
    TRANSACTION_REFUNDED: 'Transaction remboursée',
  };
  return labels[action] || action;
}
