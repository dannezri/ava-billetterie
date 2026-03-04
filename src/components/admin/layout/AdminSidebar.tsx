'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  Users,
  ArrowLeftRight,
  Flag,
  Calendar,
  BarChart3,
  Settings,
  ScrollText,
  ShieldCheck,
  ChevronRight,
  Wallet,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'default' | 'destructive' | 'secondary';
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Billets',
    href: '/admin/tickets',
    icon: Ticket,
    children: [
      { label: 'Tous les billets', href: '/admin/tickets' },
      { label: 'Queue validation', href: '/admin/tickets/validation' },
      { label: 'Signalés', href: '/admin/tickets/flagged' },
    ],
  },
  {
    label: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
    children: [
      { label: 'Tous les utilisateurs', href: '/admin/users' },
      { label: 'KYC en attente', href: '/admin/users/kyc-pending' },
      { label: 'Suspendus', href: '/admin/users/suspended' },
    ],
  },
  {
    label: 'Transactions',
    href: '/admin/transactions',
    icon: ArrowLeftRight,
    children: [
      { label: 'Toutes', href: '/admin/transactions' },
      { label: 'Séquestres', href: '/admin/transactions/escrow' },
      { label: 'Échouées', href: '/admin/transactions/failed' },
    ],
  },
  {
    label: 'Litiges',
    href: '/admin/disputes',
    icon: Flag,
    children: [
      { label: 'Tous les litiges', href: '/admin/disputes' },
      { label: 'Statistiques', href: '/admin/disputes/stats' },
    ],
  },
  {
    label: 'Événements',
    href: '/admin/events',
    icon: Calendar,
    children: [
      { label: 'Tous les événements', href: '/admin/events' },
      { label: 'Non vérifiés', href: '/admin/events/verification' },
      { label: 'Créer', href: '/admin/events/create' },
      { label: 'Import Ticketmaster', href: '/admin/events/import-ticketmaster' },
    ],
  },
  {
    label: 'Finance',
    href: '/admin/finance',
    icon: Wallet,
    children: [
      { label: 'Aperçu', href: '/admin/finance' },
      { label: 'Rapprochement', href: '/admin/finance/reconciliation' },
      { label: 'Payouts', href: '/admin/finance/payouts' },
      { label: 'Remboursements', href: '/admin/finance/refunds' },
    ],
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    children: [
      { label: 'Vue globale', href: '/admin/analytics' },
      { label: 'Événements', href: '/admin/analytics/events' },
      { label: 'Utilisateurs', href: '/admin/analytics/users' },
      { label: 'Funnels', href: '/admin/analytics/funnel' },
    ],
  },
  {
    label: 'Logs & Audit',
    href: '/admin/logs',
    icon: ScrollText,
  },
  {
    label: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
    children: [
      { label: 'Plateforme', href: '/admin/settings' },
      { label: 'Équipe', href: '/admin/settings/team' },
    ],
  },
];

interface AdminSidebarProps {
  userEmail?: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const isParentActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    if (item.children) return item.children.some((c) => pathname.startsWith(c.href));
    return false;
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-gray-900 text-gray-100 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-700">
        <ShieldCheck className="h-7 w-7 text-indigo-400" />
        <div>
          <p className="font-bold text-white text-sm">AVA Admin</p>
          <p className="text-xs text-gray-400">Espace Administration</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isParentActive(item);
          const Icon = item.icon;
          const hasChildren = !!item.children;

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <Badge
                    variant={item.badgeVariant || 'destructive'}
                    className="ml-auto text-xs h-5 px-1.5"
                  >
                    {item.badge}
                  </Badge>
                )}
                {hasChildren && (
                  <ChevronRight
                    className={cn(
                      'h-3.5 w-3.5 transition-transform',
                      active ? 'rotate-90 text-white' : 'text-gray-500 group-hover:text-gray-300'
                    )}
                  />
                )}
              </Link>

              {/* Sous-navigation */}
              {hasChildren && active && (
                <div className="mt-1 ml-7 space-y-0.5">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block px-3 py-1.5 rounded-md text-xs transition-colors',
                        pathname === child.href
                          ? 'text-white font-medium bg-gray-700'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{userEmail || 'Admin'}</p>
            <p className="text-xs text-gray-400">Administrateur</p>
          </div>
          <a
            href="/api/auth/signout"
            title="Se déconnecter"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </a>
        </div>
      </div>
    </aside>
  );
}
