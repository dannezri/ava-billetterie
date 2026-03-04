/**
 * Page Historique Ventes & Paiements — Dashboard Vendeur
 *
 * SEULE page financière de l'espace vendeur.
 * Affiche toutes les ventes avec le statut de virement automatique.
 * Les paiements sont automatiques (J+2 après événement) — aucune action vendeur.
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Calendar,
  MapPin,
  TrendingUp,
  Euro,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// ============================================================================
// TYPES
// ============================================================================

type AutoPayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'MANUAL_REVIEW';

interface SaleTransaction {
  id: string;
  status: string;
  autoPayoutStatus: AutoPayoutStatus;
  autoPayoutDate: string | null;
  autoPayoutError: string | null;
  manualReview: boolean;
  amount: number;
  platformFee: number;
  netAmount: number;
  escrowReleaseDate: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    artist: string | null;
    venue: string;
    city: string;
    eventDate: string;
  };
  buyer: { name: string | null; email: string };
  dispute: { status: string } | null;
}

interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  paidCount: number;
  pendingCount: number;
  actionRequiredCount: number;
}

interface SalesData {
  stats: SalesStats;
  transactions: SaleTransaction[];
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================================================
// PAYOUT STATUS BADGE
// ============================================================================

function PayoutStatusBadge({ transaction }: { transaction: SaleTransaction }) {
  const { autoPayoutStatus, autoPayoutDate, autoPayoutError, escrowReleaseDate, manualReview, dispute } =
    transaction;

  // Litige ouvert
  if (dispute && ['OPEN', 'INVESTIGATING'].includes(dispute.status)) {
    return (
      <div className="space-y-1">
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Litige ouvert
        </Badge>
        <p className="text-xs text-muted-foreground">Paiement suspendu</p>
      </div>
    );
  }

  // Revue manuelle
  if (manualReview || autoPayoutStatus === 'MANUAL_REVIEW') {
    return (
      <div className="space-y-1">
        <Badge className="gap-1 bg-orange-500 hover:bg-orange-600">
          <AlertTriangle className="h-3 w-3" />
          Action requise
        </Badge>
        {autoPayoutError && (
          <p className="text-xs text-orange-600 max-w-[200px]">{autoPayoutError}</p>
        )}
        <Button size="sm" variant="outline" className="h-6 text-xs" asChild>
          <Link href="/dashboard/seller/profile">Résoudre</Link>
        </Button>
      </div>
    );
  }

  // Virement complété
  if (autoPayoutStatus === 'COMPLETED' && autoPayoutDate) {
    return (
      <div className="space-y-1">
        <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Payé
        </Badge>
        <p className="text-xs text-muted-foreground">le {formatDate(autoPayoutDate)}</p>
      </div>
    );
  }

  // En cours de traitement
  if (autoPayoutStatus === 'PROCESSING') {
    return (
      <Badge className="gap-1 bg-blue-500 hover:bg-blue-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        En cours
      </Badge>
    );
  }

  // Échec temporaire (retry automatique)
  if (autoPayoutStatus === 'FAILED') {
    return (
      <div className="space-y-1">
        <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600">
          <Clock className="h-3 w-3" />
          Retry demain
        </Badge>
        <p className="text-xs text-muted-foreground">Nouvelle tentative automatique</p>
      </div>
    );
  }

  // En attente (PENDING) — afficher countdown
  if (escrowReleaseDate) {
    const daysLeft = getDaysUntil(escrowReleaseDate);

    if (daysLeft > 0) {
      return (
        <div className="space-y-1">
          <Badge className="gap-1 bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3" />
            Paiement dans {daysLeft}j
          </Badge>
          <p className="text-xs text-muted-foreground">Automatique le {formatDate(escrowReleaseDate)}</p>
        </div>
      );
    } else {
      return (
        <Badge className="gap-1 bg-blue-500 hover:bg-blue-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          Traitement en cours
        </Badge>
      );
    }
  }

  return <Badge variant="outline">En attente</Badge>;
}

// ============================================================================
// STAT CARDS
// ============================================================================

function StatCards({ stats, loading }: { stats: SalesStats | null; loading: boolean }) {
  const cards = [
    {
      label: 'Ventes totales',
      value: stats ? `${stats.totalSales}` : '—',
      sub: 'Billets vendus',
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      label: 'Revenus reçus',
      value: stats ? formatCurrency(stats.paidRevenue) : '—',
      sub: `${stats?.paidCount ?? 0} virement${(stats?.paidCount ?? 0) > 1 ? 's' : ''} effectué${(stats?.paidCount ?? 0) > 1 ? 's' : ''}`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
    },
    {
      label: 'En attente',
      value: stats ? formatCurrency(stats.pendingRevenue) : '—',
      sub: 'Paiement automatique J+2',
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      label: 'Action requise',
      value: stats ? `${stats.actionRequiredCount}` : '—',
      sub: stats?.actionRequiredCount ? 'Vérifiez votre profil' : 'Aucune action requise',
      icon: AlertTriangle,
      color: stats?.actionRequiredCount ? 'text-orange-600' : 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// TRANSACTION ROW
// ============================================================================

function TransactionRow({ transaction }: { transaction: SaleTransaction }) {
  return (
    <div className="flex items-start justify-between py-5 gap-4 border-b last:border-0">
      {/* Infos événement */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{transaction.event.title}</p>
        {transaction.event.artist && (
          <p className="text-sm text-muted-foreground">{transaction.event.artist}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(transaction.event.eventDate)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {transaction.event.venue}, {transaction.event.city}
          </span>
          <span className="text-muted-foreground/70">
            Vendu {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true, locale: fr })}
          </span>
        </div>
      </div>

      {/* Montant */}
      <div className="text-right shrink-0">
        <p className="font-bold text-emerald-700 text-lg">{formatCurrency(transaction.netAmount)}</p>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(transaction.amount)} − {formatCurrency(transaction.platformFee)} commission
        </p>
      </div>

      {/* Statut paiement */}
      <div className="shrink-0 min-w-[130px] text-right">
        <PayoutStatusBadge transaction={transaction} />
      </div>
    </div>
  );
}

// ============================================================================
// PAGE PRINCIPALE
// ============================================================================

export default function SellerHistoryPage() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch('/api/transactions/sales');
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error ?? 'Erreur lors du chargement');
        }
        setData(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const stats = data?.stats ?? null;
  const transactions = data?.transactions ?? [];
  const actionRequired = stats?.actionRequiredCount ?? 0;

  return (
    <div className="container max-w-6xl space-y-6 py-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Historique Ventes & Paiements</h1>
        <p className="mt-2 text-muted-foreground">
          {stats
            ? `${stats.totalSales} vente${stats.totalSales > 1 ? 's' : ''} · ${stats.paidCount} paiement${stats.paidCount > 1 ? 's' : ''} reçu${stats.paidCount > 1 ? 's' : ''}`
            : 'Chargement...'}
        </p>
      </div>

      {/* Info paiements automatiques */}
      <Alert className="border-blue-200 bg-blue-50/60">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Paiements 100% automatiques :</strong> Vos gains sont virés automatiquement
          2 jours après chaque événement. Aucune action de votre part n&apos;est nécessaire.
          Les fonds arrivent sur votre compte bancaire sous 1-3 jours ouvrés.
        </AlertDescription>
      </Alert>

      {/* Alerte action requise */}
      {!loading && actionRequired > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{actionRequired} paiement{actionRequired > 1 ? 's' : ''} bloqué{actionRequired > 1 ? 's' : ''}.</strong>
            {' '}Complétez votre vérification KYC ou connectez votre compte bancaire Stripe pour débloquer vos virements.{' '}
            <Link href="/dashboard/seller/profile" className="underline font-medium">
              Compléter mon profil
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <StatCards stats={stats} loading={loading} />

      {/* Table des transactions */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-32" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <Euro className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucune vente pour l&apos;instant</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                Vos ventes et paiements automatiques apparaîtront ici dès qu&apos;un billet sera acheté.
              </p>
              <Button asChild className="mt-6">
                <Link href="/sell-ticket">Vendre un billet</Link>
              </Button>
            </div>
          ) : (
            <div>
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
