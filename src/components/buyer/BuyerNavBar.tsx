/**
 * BuyerNavBar - Barre de navigation secondaire pour l'espace acheteur
 * Thème trustBlue (bleu) pour identification visuelle immédiate
 */

'use client';

import { cn } from '@/lib/utils';
import {
  Bell,
  Heart,
  LayoutDashboard,
  Scale,
  ShoppingBag,
  User,
  Home,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const buyerNavItems = [
  {
    href: '/events',
    label: 'Découvrir',
    icon: Ticket,
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/my-purchases',
    label: 'Mes Achats',
    icon: ShoppingBag,
  },
  {
    href: '/favorites',
    label: 'Favoris',
    icon: Heart,
  },
  {
    href: '/disputes',
    label: 'Litiges',
    icon: Scale,
  },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    href: '/profile',
    label: 'Profil',
    icon: User,
  },
];

export function BuyerNavBar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact || href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-16 z-40 w-full border-b bg-trustBlue-50/80 backdrop-blur supports-[backdrop-filter]:bg-trustBlue-50/60">
      <div className="container">
        {/* Desktop: horizontal tabs */}
        <div className="hidden sm:flex items-center gap-1 h-12 -mb-px">
          {buyerNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 h-12 text-sm font-medium border-b-2 transition-colors',
                  active
                    ? 'border-trustBlue-600 text-trustBlue-700 font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-trustBlue-600 hover:border-trustBlue-300'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile: scrollable pills */}
        <div className="flex sm:hidden items-center gap-2 py-2 overflow-x-auto scrollbar-none -mx-4 px-4">
          {buyerNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  active
                    ? 'bg-trustBlue-600 text-white'
                    : 'bg-trustBlue-100/70 text-trustBlue-700 hover:bg-trustBlue-100'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
