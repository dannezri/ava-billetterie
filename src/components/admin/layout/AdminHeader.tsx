'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const breadcrumbMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/tickets': 'Billets',
  '/admin/tickets/validation': 'Queue de Validation',
  '/admin/tickets/flagged': 'Billets Signalés',
  '/admin/users': 'Utilisateurs',
  '/admin/users/kyc-pending': 'KYC en Attente',
  '/admin/users/suspended': 'Comptes Suspendus',
  '/admin/transactions': 'Transactions',
  '/admin/transactions/escrow': 'Séquestres',
  '/admin/transactions/failed': 'Paiements Échoués',
  '/admin/disputes': 'Litiges',
  '/admin/disputes/stats': 'Stats Litiges',
  '/admin/events': 'Événements',
  '/admin/events/verification': 'Vérification Événements',
  '/admin/events/create': 'Créer un Événement',
  '/admin/finance': 'Finance',
  '/admin/finance/reconciliation': 'Rapprochement Bancaire',
  '/admin/finance/payouts': 'Payouts',
  '/admin/finance/refunds': 'Remboursements',
  '/admin/analytics': 'Analytics',
  '/admin/analytics/events': 'Analytics Événements',
  '/admin/analytics/users': 'Analytics Utilisateurs',
  '/admin/analytics/funnel': 'Funnels Conversion',
  '/admin/logs': 'Logs & Audit',
  '/admin/settings': 'Paramètres',
  '/admin/settings/team': 'Équipe Admin',
};

export function AdminHeader() {
  const pathname = usePathname();

  const buildBreadcrumb = () => {
    const parts = pathname.split('/').filter(Boolean);
    const crumbs: { label: string; href: string }[] = [{ label: 'Admin', href: '/admin' }];

    let current = '';
    for (const part of parts) {
      current += `/${part}`;
      const label = breadcrumbMap[current];
      if (label && current !== '/admin') {
        crumbs.push({ label, href: current });
      }
    }
    return crumbs;
  };

  const crumbs = buildBreadcrumb();
  const currentTitle = breadcrumbMap[pathname] || 'Admin';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center px-6 gap-4">
      {/* Breadcrumb + Titre */}
      <div className="flex-1 min-w-0">
        <nav className="flex items-center gap-1 text-xs text-gray-400 mb-0.5">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {i === crumbs.length - 1 ? (
                <span className="text-gray-600">{crumb.label}</span>
              ) : (
                <a href={crumb.href} className="hover:text-gray-600 transition-colors">
                  {crumb.label}
                </a>
              )}
            </span>
          ))}
        </nav>
        <h1 className="text-base font-semibold text-gray-900 truncate">{currentTitle}</h1>
      </div>

      {/* Recherche globale */}
      <div className="relative hidden md:flex items-center w-64">
        <Search className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          placeholder="Rechercher..."
          className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
        />
      </div>

      {/* Lien vers la plateforme */}
      <Button variant="outline" size="sm" asChild className="hidden lg:flex">
        <a href="/" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
          Voir la plateforme
        </a>
      </Button>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5 text-gray-600" />
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
        >
          3
        </Badge>
      </Button>

      {/* Refresh */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => window.location.reload()}
        title="Actualiser"
      >
        <RefreshCw className="h-4 w-4 text-gray-600" />
      </Button>
    </header>
  );
}
