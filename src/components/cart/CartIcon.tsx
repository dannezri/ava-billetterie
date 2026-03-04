'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart/cart.context';
import { cn } from '@/lib/utils';

function useGlobalCountdown(expiresAt: string | null): string | null {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!expiresAt) {
      setLabel(null);
      return;
    }

    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel('0:00');
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel(`${m}:${s.toString().padStart(2, '0')}`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return label;
}

export function CartIcon({ className }: { className?: string }) {
  const { totalItems, earliestExpiry } = useCart();
  const countdown = useGlobalCountdown(totalItems > 0 ? earliestExpiry : null);

  if (totalItems === 0) {
    return (
      <Link
        href="/cart"
        aria-label="Panier vide"
        className={cn(
          'relative flex items-center justify-center rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
          className
        )}
      >
        <ShoppingCart className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      aria-label={`Panier — ${totalItems} billet${totalItems > 1 ? 's' : ''}`}
      className={cn(
        'relative flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-orange-50',
        className
      )}
    >
      <div className="relative">
        <ShoppingCart className="h-5 w-5 text-orange-600" />
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white leading-none">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      </div>
      {countdown && (
        <span className="font-mono text-xs font-semibold text-orange-600">
          {countdown}
        </span>
      )}
    </Link>
  );
}
