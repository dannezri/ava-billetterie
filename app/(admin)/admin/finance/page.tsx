'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowLeftRight,
  RefreshCw,
  Lock,
  RotateCcw,
  Euro,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FinanceData {
  kpis: {
    gmv_total: number;
    fees_total: number;
    gmv_month: number;
    fees_month: number;
    gmv_change_pct: number;
    fees_change_pct: number;
    escrow_balance: number;
    escrow_count: number;
    refunds_total: number;
    refund_count: number;
  };
  by_status: {
    status: string;
    count: number;
    gmv: number;
    fees: number;
  }[];
  revenue_chart: { date: string; gmv: number; fees: number; count: number }[];
  transactions: {
    id: string;
    amount: number;
    platform_fee: number;
    status: string;
    created_at: string;
    event_title: string;
    buyer: string;
    seller: string;
  }[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

const TX_STATUS_STYLES: Record<string, string> = {
  ESCROWED: 'bg-blue-50 text-blue-700 border-blue-200',
  RELEASED: 'bg-green-50 text-green-700 border-green-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  REFUNDED: 'bg-gray-100 text-gray-600 border-gray-200',
  DISPUTED: 'bg-red-50 text-red-700 border-red-200',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

function KpiCard({
  label,
  value,
  sub,
  changePct,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: string;
  sub?: string;
  changePct?: number;
  icon: React.ElementType;
  iconClass?: string;
}) {
  const positive = (changePct ?? 0) >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={cn('p-2.5 rounded-lg', iconClass || 'bg-indigo-50')}>
          <Icon className={cn('h-5 w-5', iconClass ? 'text-white' : 'text-indigo-600')} />
        </div>
      </div>
      {changePct !== undefined && (
        <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', positive ? 'text-green-600' : 'text-red-500')}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {positive ? '+' : ''}{changePct}% vs mois dernier
        </div>
      )}
    </div>
  );
}

function MiniBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', className || 'bg-indigo-500')} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function AdminFinancePage() {
  const { toast } = useToast();
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/finance?page=${p}&limit=30`);
      if (!res.ok) throw new Error();
      setData(await res.json());
      setPage(p);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les données financières', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  // Compute max GMV for chart bars
  const maxGmv = data ? Math.max(...data.revenue_chart.map((d) => d.gmv), 1) : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Finance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Aperçu des flux financiers de la plateforme</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchData(page)} disabled={loading}>
          <RefreshCw className={cn('h-3.5 w-3.5 mr-1.5', loading && 'animate-spin')} />
          Actualiser
        </Button>
      </div>

      {/* KPIs */}
      {loading && !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="GMV ce mois"
            value={fmt(data.kpis.gmv_month)}
            sub={`Total: ${fmt(data.kpis.gmv_total)}`}
            changePct={data.kpis.gmv_change_pct}
            icon={Euro}
            iconClass="bg-indigo-500"
          />
          <KpiCard
            label="Commissions ce mois"
            value={fmt(data.kpis.fees_month)}
            sub={`Total: ${fmt(data.kpis.fees_total)}`}
            changePct={data.kpis.fees_change_pct}
            icon={Wallet}
            iconClass="bg-green-500"
          />
          <KpiCard
            label="Séquestre en cours"
            value={fmt(data.kpis.escrow_balance)}
            sub={`${data.kpis.escrow_count} transaction${data.kpis.escrow_count > 1 ? 's' : ''}`}
            icon={Lock}
            iconClass="bg-blue-500"
          />
          <KpiCard
            label="Remboursements"
            value={fmt(data.kpis.refunds_total)}
            sub={`${data.kpis.refund_count} remboursement${data.kpis.refund_count > 1 ? 's' : ''}`}
            icon={RotateCcw}
            iconClass="bg-red-400"
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart (30j) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">GMV — 30 derniers jours</h2>
          {loading && !data ? (
            <Skeleton className="h-40 w-full" />
          ) : data ? (
            <div className="flex items-end gap-px h-40">
              {data.revenue_chart.map((d) => {
                const pct = maxGmv > 0 ? (d.gmv / maxGmv) * 100 : 0;
                return (
                  <div
                    key={d.date}
                    className="flex-1 group relative"
                    title={`${d.date}\nGMV: ${fmt(d.gmv)}\nCommissions: ${fmt(d.fees)}\n${d.count} tx`}
                  >
                    <div
                      className="w-full bg-indigo-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity"
                      style={{ height: `${Math.max(pct, d.gmv > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{data ? format(new Date(data.revenue_chart[0].date), 'd MMM', { locale: fr }) : ''}</span>
            <span>{data ? format(new Date(data.revenue_chart[data.revenue_chart.length - 1].date), 'd MMM', { locale: fr }) : ''}</span>
          </div>
        </div>

        {/* By status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Répartition par statut</h2>
          {loading && !data ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)}
            </div>
          ) : data ? (
            <div className="space-y-4">
              {data.by_status
                .sort((a, b) => b.count - a.count)
                .map((s) => {
                  const totalCount = data.by_status.reduce((acc, x) => acc + x.count, 0);
                  return (
                    <div key={s.status}>
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className={cn('text-xs', TX_STATUS_STYLES[s.status] || '')}>
                          {s.status}
                        </Badge>
                        <span className="text-xs font-semibold text-gray-700">{s.count} · {fmt(s.gmv)}</span>
                      </div>
                      <MiniBar
                        value={s.count}
                        max={totalCount}
                        className={
                          s.status === 'RELEASED' ? 'bg-green-500' :
                          s.status === 'ESCROWED' ? 'bg-blue-500' :
                          s.status === 'REFUNDED' ? 'bg-gray-400' :
                          s.status === 'DISPUTED' ? 'bg-red-500' : 'bg-amber-400'
                        }
                      />
                    </div>
                  );
                })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-700">Transactions récentes</h2>
            {data && (
              <span className="text-xs text-gray-400">{data.pagination.total} au total</span>
            )}
          </div>
        </div>

        {loading && !data ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : data && data.transactions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 font-medium">Événement</th>
                    <th className="text-left px-4 py-2.5 font-medium">Acheteur</th>
                    <th className="text-left px-4 py-2.5 font-medium">Vendeur</th>
                    <th className="text-right px-4 py-2.5 font-medium">Montant</th>
                    <th className="text-right px-4 py-2.5 font-medium">Commission</th>
                    <th className="text-center px-4 py-2.5 font-medium">Statut</th>
                    <th className="text-right px-4 py-2.5 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-900 font-medium max-w-[180px] truncate">
                        {tx.event_title}
                      </td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-[140px]">{tx.buyer}</td>
                      <td className="px-4 py-3 text-gray-500 truncate max-w-[140px]">{tx.seller}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {fmt(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-indigo-600 font-medium">
                        {fmt(tx.platform_fee)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className={cn('text-xs', TX_STATUS_STYLES[tx.status] || '')}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-400 text-xs whitespace-nowrap">
                        {format(new Date(tx.created_at), 'dd MMM yyyy', { locale: fr })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Page {data.pagination.page} / {data.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => fetchData(page - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.pagination.totalPages || loading}
                    onClick={() => fetchData(page + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-32 text-sm text-gray-400">
            Aucune transaction enregistrée
          </div>
        )}
      </div>
    </div>
  );
}
