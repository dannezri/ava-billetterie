/**
 * SpaceSwitcher - Dropdown pour basculer entre Espace Acheteur et Espace Vendeur
 * Affiché dans le Header pour les utilisateurs authentifiés hors admin
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { useCurrentSpace } from '@/hooks/useCurrentSpace';
import { cn } from '@/lib/utils';

export function SpaceSwitcher() {
  const router = useRouter();
  const currentSpace = useCurrentSpace();

  // Ne pas afficher en admin ou public
  if (currentSpace.space === 'admin' || currentSpace.space === 'public') {
    return null;
  }

  const handleSwitch = (target: 'buyer' | 'seller') => {
    if (target === currentSpace.space) return;
    const url = target === 'buyer' ? '/dashboard' : '/dashboard/seller';
    try {
      localStorage.setItem('preferred_space', target);
    } catch {}
    router.push(url);
  };

  const isBuyer = currentSpace.space === 'buyer';
  const isSeller = currentSpace.space === 'seller';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-1.5 font-medium h-9 px-3 rounded-lg border transition-colors',
            isBuyer && 'border-trustBlue-200 bg-trustBlue-50 text-trustBlue-700 hover:bg-trustBlue-100',
            isSeller && 'border-accentGreen-200 bg-accentGreen-50 text-accentGreen-700 hover:bg-accentGreen-100'
          )}
        >
          <span className="text-base leading-none">{currentSpace.icon}</span>
          <span className="hidden sm:inline text-sm">{currentSpace.label}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-56 p-1.5">
        {/* Espace Acheteur */}
        <DropdownMenuItem
          onClick={() => handleSwitch('buyer')}
          className={cn(
            'flex items-center gap-3 p-3 cursor-pointer rounded-md',
            isBuyer && 'bg-trustBlue-50'
          )}
        >
          <span className="text-xl leading-none">🛒</span>
          <div className="flex-1 min-w-0">
            <p className={cn('font-medium text-sm', isBuyer && 'text-trustBlue-700')}>
              Espace Acheteur
            </p>
            <p className="text-xs text-muted-foreground">Acheter des billets</p>
          </div>
          {isBuyer && <Check className="w-4 h-4 text-trustBlue-600 shrink-0" />}
        </DropdownMenuItem>

        {/* Espace Vendeur */}
        <DropdownMenuItem
          onClick={() => handleSwitch('seller')}
          className={cn(
            'flex items-center gap-3 p-3 cursor-pointer rounded-md',
            isSeller && 'bg-accentGreen-50'
          )}
        >
          <span className="text-xl leading-none">💼</span>
          <div className="flex-1 min-w-0">
            <p className={cn('font-medium text-sm', isSeller && 'text-accentGreen-700')}>
              Espace Vendeur
            </p>
            <p className="text-xs text-muted-foreground">Gérer mes ventes</p>
          </div>
          {isSeller && <Check className="w-4 h-4 text-accentGreen-600 shrink-0" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
