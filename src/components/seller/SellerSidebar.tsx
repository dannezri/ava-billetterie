'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Package, 
  TrendingUp, 
  CreditCard, 
  User,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const navItems = [
  {
    title: 'Mes Billets',
    href: '/dashboard/seller',
    icon: Package,
  },
  {
    title: 'Ventes',
    href: '/dashboard/seller/sales',
    icon: TrendingUp,
  },
  {
    title: 'Paiements',
    href: '/dashboard/seller/payments',
    icon: CreditCard,
  },
  {
    title: 'Profil',
    href: '/dashboard/seller/profile',
    icon: User,
  },
];

interface SellerSidebarProps {
  className?: string;
}

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          Dashboard Vendeur
        </h2>
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary'
                )}
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
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
