'use client';

import { useEffect, useState } from 'react';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { UserAcquisitionChart } from '@/components/admin/dashboard/UserAcquisitionChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface DashboardData {
  revenue_chart: { date: string; gmv: number; commissions: number; transactions: number }[];
  acquisition_chart: { date: string; users: number }[];
  metrics: {
    transactions_today: { count: number; amount: number };
    users_total: { count: number; new_24h: number };
    tickets_pending: { count: number };
    disputes_open: { count: number };
    revenue_month: { amount: number };
  };
}

const formatEuro = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);

const DISPUTE_COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#6b7280'];
const DISPUTE_REASONS = [
  { name: 'Billet frauduleux', value: 45 },
  { name: 'Accès refusé', value: 28 },
  { name: 'Doublon', value: 15 },
  { name: 'Autre', value: 12 },
];

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[280px] rounded-xl" />
        ))}
      </div>
    );
  }

  // Calcul funnel conversion (mock pour MVP - à connecter avec vraies données)
  const conversionFunnel = [
    { label: 'Visiteurs', value: data?.metrics.users_total.count ? data.metrics.users_total.count * 12 : 0, color: '#6366f1' },
    { label: 'Inscrits', value: data?.metrics.users_total.count || 0, color: '#8b5cf6' },
    { label: 'KYC validé', value: Math.floor((data?.metrics.users_total.count || 0) * 0.6), color: '#a78bfa' },
    { label: 'Premier achat', value: Math.floor((data?.metrics.users_total.count || 0) * 0.3), color: '#c4b5fd' },
    { label: 'Récurrent', value: Math.floor((data?.metrics.users_total.count || 0) * 0.12), color: '#ddd6fe' },
  ];

  return (
    <div className="space-y-6">
      {/* GMV + Commissions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {data && <RevenueChart data={data.revenue_chart} />}
        {data && <UserAcquisitionChart data={data.acquisition_chart} />}
      </div>

      {/* Funnel + Raisons litiges */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Funnel conversion */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Funnel de Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={conversionFunnel}
                  layout="vertical"
                  margin={{ left: 20, right: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    width={80}
                  />
                  <Tooltip
                    formatter={(v: number) => [v.toLocaleString('fr-FR'), 'Utilisateurs']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {conversionFunnel.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1">
              {conversionFunnel.map((step, i) => {
                const prev = i > 0 ? conversionFunnel[i - 1].value : step.value;
                const rate = prev > 0 ? ((step.value / prev) * 100).toFixed(0) : 100;
                return (
                  <div key={step.label} className="flex justify-between text-xs text-gray-500">
                    <span>{step.label}</span>
                    <span>
                      {step.value.toLocaleString('fr-FR')}
                      {i > 0 && <span className="text-gray-400 ml-1">({rate}%)</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Répartition litiges */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Raisons des Litiges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DISPUTE_REASONS}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {DISPUTE_REASONS.map((_, index) => (
                      <Cell key={index} fill={DISPUTE_COLORS[index % DISPUTE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Part']} />
                  <Legend
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-gray-400 mt-1">
              Données indicatives — à connecter avec la vraie base
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPIs résumé */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Taux de conversion', value: '8.3%', trend: '+1.2% vs mois dernier' },
          { label: 'Panier moyen', value: formatEuro((data?.metrics.transactions_today.amount || 0) / Math.max(1, data?.metrics.transactions_today.count || 1)), trend: '' },
          { label: 'GMV total mois', value: formatEuro(data?.revenue_chart.slice(-30).reduce((a, b) => a + b.gmv, 0) || 0), trend: '' },
          { label: 'Commission moyenne', value: '7.5%', trend: 'Plateforme + frais' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{kpi.value}</p>
              {kpi.trend && <p className="text-xs text-gray-400 mt-0.5">{kpi.trend}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
