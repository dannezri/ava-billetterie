'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Euro,
  Users,
  AlertCircle,
  Flag,
  TrendingUp,
  ArrowLeftRight,
  Clock,
} from 'lucide-react';
import { MetricCard } from '@/components/admin/dashboard/MetricCard';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { UserAcquisitionChart } from '@/components/admin/dashboard/UserAcquisitionChart';
import { AlertsList } from '@/components/admin/dashboard/AlertsList';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DashboardData {
  metrics: {
    transactions_today: { count: number; amount: number; change_percent: number };
    users_total: { count: number; new_24h: number };
    tickets_pending: { count: number; overdue_24h: number };
    disputes_open: { count: number; overdue_48h: number };
    revenue_month: { amount: number };
  };
  revenue_chart: { date: string; gmv: number; commissions: number; transactions: number }[];
  acquisition_chart: { date: string; users: number }[];
  alerts: { id: string; type: 'error' | 'warning' | 'info'; title: string; message: string; timestamp: string; link?: string }[];
  recent_transactions: {
    id: string;
    amount: number;
    platform_fee: number;
    status: string;
    created_at: string;
    event_title: string;
    buyer_name: string;
    seller_name: string;
  }[];
}

const formatEuro = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/dashboard');
        if (!res.ok) throw new Error('Erreur lors du chargement des données');
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5 * 60 * 1000); // Rafraîchir toutes les 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Métriques clés ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))
        ) : error ? (
          <div className="col-span-4 text-center py-8 text-red-500 text-sm">{error}</div>
        ) : (
          <>
            <MetricCard
              label="Transactions aujourd'hui"
              value={data?.metrics.transactions_today.count ?? 0}
              change={{
                value: data?.metrics.transactions_today.change_percent ?? 0,
                isPositive: (data?.metrics.transactions_today.change_percent ?? 0) >= 0,
              }}
              icon={ShoppingCart}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
              link="/admin/transactions?filter=today"
            />
            <MetricCard
              label="GMV aujourd'hui"
              value={formatEuro(data?.metrics.transactions_today.amount ?? 0)}
              icon={Euro}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
            />
            <MetricCard
              label="Billets en validation"
              value={data?.metrics.tickets_pending.count ?? 0}
              description={
                (data?.metrics.tickets_pending.overdue_24h ?? 0) > 0
                  ? `⚠️ ${data?.metrics.tickets_pending.overdue_24h} dépassent le SLA 24h`
                  : 'Dans les délais SLA'
              }
              change={
                data?.metrics.tickets_pending.overdue_24h
                  ? { value: data.metrics.tickets_pending.overdue_24h, isPositive: false }
                  : undefined
              }
              icon={AlertCircle}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
              link="/admin/tickets/validation"
            />
            <MetricCard
              label="Litiges ouverts"
              value={data?.metrics.disputes_open.count ?? 0}
              description={
                (data?.metrics.disputes_open.overdue_48h ?? 0) > 0
                  ? `🔴 ${data?.metrics.disputes_open.overdue_48h} urgents (> 48h)`
                  : 'Dans les délais SLA'
              }
              icon={Flag}
              iconColor="text-red-600"
              iconBg="bg-red-50"
              link="/admin/disputes?status=open"
            />
          </>
        )}
      </div>

      {/* Métriques secondaires */}
      {!loading && !error && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <MetricCard
            label="Utilisateurs totaux"
            value={data.metrics.users_total.count.toLocaleString('fr-FR')}
            description={`+${data.metrics.users_total.new_24h} nouveaux aujourd'hui`}
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            link="/admin/users"
          />
          <MetricCard
            label="Revenus commissions (mois)"
            value={formatEuro(data.metrics.revenue_month.amount)}
            icon={TrendingUp}
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
            link="/admin/finance"
          />
          <MetricCard
            label="Séquestres actifs"
            value="—"
            description="Voir les détails"
            icon={ArrowLeftRight}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
            link="/admin/transactions/escrow"
          />
        </div>
      )}

      {/* ── Graphiques ───────────────────────────────────────────────── */}
      {!loading && !error && data && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <RevenueChart data={data.revenue_chart} />
          </div>
          <div>
            <UserAcquisitionChart data={data.acquisition_chart} />
          </div>
        </div>
      )}
      {loading && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Skeleton className="xl:col-span-2 h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      )}

      {/* ── Transactions récentes + Alertes ─────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Dernières transactions */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Dernières Transactions</CardTitle>
                <a
                  href="/admin/transactions"
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Voir tout →
                </a>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {(data?.recent_transactions || []).map((tx) => (
                    <a
                      key={tx.id}
                      href={`/admin/transactions/${tx.id}`}
                      className="flex items-center gap-3 py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {tx.event_title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.buyer_name} → {tx.seller_name}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatEuro(tx.amount)}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5 justify-end">
                          <StatusBadge status={tx.status} />
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {format(new Date(tx.created_at), 'dd MMM HH:mm', { locale: fr })}
                        </div>
                      </div>
                    </a>
                  ))}
                  {(!data?.recent_transactions || data.recent_transactions.length === 0) && (
                    <div className="py-8 text-center text-sm text-gray-400">
                      Aucune transaction récente
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alertes */}
        <div>
          {loading ? (
            <Skeleton className="h-[300px] rounded-xl" />
          ) : (
            <AlertsList alerts={data?.alerts || []} />
          )}
        </div>
      </div>
    </div>
  );
}
