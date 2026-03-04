'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Flag,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/admin/shared/DataTable';
import { type ColumnDef } from '@tanstack/react-table';
import { cn } from '@/lib/utils';

interface StatsData {
  metrics: {
    totalDisputes: number;
    openDisputes: number;
    resolvedToday: number;
    resolvedThisMonth: number;
    overdueDisputes: number;
    urgentDisputes: number;
    avgResolutionHours: number;
    slaRate: number;
    refundRate: number;
  };
  byReason: Array<{ reason: string; count: number }>;
  dailyTrend: Array<{ date: string; opened: number; resolved: number }>;
  topSellers: Array<{
    id: string;
    name: string | null;
    email: string;
    trustScore: number;
    disputesAsSellerCount: number;
    disputesResolvedAgainst: number;
    totalSales: number;
    disputeRate: number;
  }>;
}

const REASON_LABELS: Record<string, string> = {
  FAKE_TICKET: 'Billet frauduleux',
  NO_ACCESS: 'Accès refusé',
  DUPLICATE: 'Doublon',
  EVENT_CANCELLED: 'Évén. annulé',
  WRONG_TICKET: 'Mauvais billet',
  SELLER_NO_RESPONSE: 'Vendeur muet',
  OTHER: 'Autre',
};

const PIE_COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={cn('p-2 rounded-lg', iconBg)}>
            <Icon className={cn('h-5 w-5', iconColor)} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function DisputeStatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/disputes/stats')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const topSellerColumns: ColumnDef<StatsData['topSellers'][0]>[] = [
    {
      header: 'Vendeur',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm text-gray-800">{row.original.name || '—'}</p>
          <p className="text-xs text-gray-400">{row.original.email}</p>
        </div>
      ),
    },
    {
      header: 'Trust Score',
      cell: ({ row }) => {
        const score = row.original.trustScore;
        return (
          <div className="flex items-center gap-1.5">
            <Shield className={cn('h-3.5 w-3.5', score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600')} />
            <span className={cn('text-sm font-semibold', score >= 80 ? 'text-green-700' : score >= 50 ? 'text-yellow-700' : 'text-red-700')}>
              {score}/100
            </span>
          </div>
        );
      },
    },
    {
      header: 'Litiges reçus',
      cell: ({ row }) => (
        <Badge
          className={cn(
            row.original.disputesAsSellerCount >= 5
              ? 'bg-red-600'
              : row.original.disputesAsSellerCount >= 3
              ? 'bg-orange-500'
              : 'bg-gray-200 text-gray-700'
          )}
        >
          {row.original.disputesAsSellerCount}
        </Badge>
      ),
    },
    {
      header: 'Perdus',
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.disputesResolvedAgainst}</span>
      ),
    },
    {
      header: 'Taux litiges',
      cell: ({ row }) => (
        <span className={cn('text-sm font-medium', row.original.disputeRate > 10 ? 'text-red-600' : 'text-gray-700')}>
          {row.original.disputeRate}%
        </span>
      ),
    },
    {
      header: 'Ventes totales',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.totalSales}</span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
          <Link href={`/admin/users/${row.original.id}`}>Profil</Link>
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-lg" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-72 bg-gray-100 rounded-lg" />
          <div className="h-72 bg-gray-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-500">Erreur de chargement</div>;

  const pieData = data.byReason.map((r) => ({
    name: REASON_LABELS[r.reason] || r.reason,
    value: r.count,
  }));

  const trendData = data.dailyTrend.map((d) => ({
    date: format(new Date(d.date), 'dd/MM', { locale: fr }),
    Ouverts: d.opened,
    Résolus: d.resolved,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/disputes">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Litiges
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Statistiques Litiges</h1>
            <p className="text-sm text-gray-500 mt-0.5">Analyse globale des 30 derniers jours</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Flag}
          label="Litiges actifs"
          value={data.metrics.openDisputes}
          sub={`${data.metrics.totalDisputes} au total`}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <KpiCard
          icon={Clock}
          label="Temps résolution moyen"
          value={`${data.metrics.avgResolutionHours}h`}
          sub="SLA cible : 48h"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KpiCard
          icon={CheckCircle}
          label="SLA respecté"
          value={`${data.metrics.slaRate}%`}
          sub="Résolus en < 48h"
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <KpiCard
          icon={TrendingUp}
          label="En faveur acheteur"
          value={`${data.metrics.refundRate}%`}
          sub="Parmi les litiges résolus"
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* SLA alerts */}
      {(data.metrics.overdueDisputes > 0 || data.metrics.urgentDisputes > 0) && (
        <div className="flex gap-3">
          {data.metrics.overdueDisputes > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-red-700">{data.metrics.overdueDisputes}</span>
              <span className="text-red-600">litiges avec SLA dépassé</span>
              <Button size="sm" variant="ghost" className="h-6 text-xs text-red-700 ml-2" asChild>
                <Link href="/admin/disputes?sla=overdue">Voir →</Link>
              </Button>
            </div>
          )}
          {data.metrics.urgentDisputes > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 text-sm">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-semibold text-orange-700">{data.metrics.urgentDisputes}</span>
              <span className="text-orange-600">litiges urgents (36–48h)</span>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pie chart — Répartition par type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Répartition par type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                Aucune donnée
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => [`${v} litige${Number(v) > 1 ? 's' : ''}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Line chart — Tendance 30 jours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Tendance — 30 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                Aucune donnée
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Ouverts" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Résolus" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top vendeurs récidivistes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Top vendeurs récidivistes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topSellers.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Aucun vendeur avec des litiges</p>
          ) : (
            <DataTable
              columns={topSellerColumns}
              data={data.topSellers}
              emptyMessage="Aucun vendeur récidiviste"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
