'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Package,
  User,
  Menu,
  Plus,
  BarChart3,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const navItems = [
  {
    title: 'Mes Billets',
    href: '/dashboard/seller',
    icon: Package,
    description: 'Billets en vente',
    exact: true,
  },
  {
    title: 'Vendre un billet',
    href: '/sell-ticket',
    icon: Plus,
    description: 'Mettre en vente',
    highlight: true,
  },
  {
    title: 'Historique & Paiements',
    href: '/dashboard/seller/history',
    icon: History,
    description: 'Ventes et virements automatiques',
  },
  {
    title: 'Analytics',
    href: '/dashboard/seller/analytics',
    icon: BarChart3,
    description: 'Performances',
  },
  {
    title: 'Profil vendeur',
    href: '/dashboard/seller/profile',
    icon: User,
    description: 'Informations vendeur',
  },
];

interface SellerSidebarProps {
  className?: string;
}

function SidebarContent() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="space-y-4 py-4">
      {/* Badge espace vendeur */}
      <div className="px-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accentGreen-50 border border-accentGreen-200">
          <span className="text-base leading-none">💼</span>
          <span className="text-sm font-semibold text-accentGreen-700">Espace Vendeur</span>
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-accentGreen-50 text-accentGreen-700 border border-accentGreen-200'
                    : item.highlight
                    ? 'text-accentGreen-600 hover:bg-accentGreen-50 hover:text-accentGreen-700'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4',
                    active
                      ? 'text-accentGreen-600'
                      : item.highlight
                      ? 'text-accentGreen-500'
                      : ''
                  )}
                />
                <span>{item.title}</span>
                {item.highlight && !active && (
                  <span className="ml-auto text-xs bg-accentGreen-100 text-accentGreen-700 px-1.5 py-0.5 rounded">
                    Nouveau
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SellerSidebar({ className }: SellerSidebarProps) {
  return (
    <div className={cn('pb-12', className)}>
      <SidebarContent />
    </div>
  );
}

export function MobileSellerSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
