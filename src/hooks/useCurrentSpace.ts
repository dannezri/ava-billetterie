/**
 * useCurrentSpace - Détecte l'espace actif (acheteur/vendeur/admin/public)
 * selon l'URL courante et retourne la configuration de thème associée.
 * Réutilise les palettes trustBlue et accentGreen du tailwind.config.ts
 */

'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export type UserSpace = 'buyer' | 'seller' | 'admin' | 'public';

export interface SpaceTheme {
  primary: string;
  primaryHover: string;
  accent: string;
  background: string;
  backgroundSubtle: string;
  badge: string;
  badgeText: string;
  border: string;
  ring: string;
  navActive: string;
  navActiveBg: string;
  navActiveBorder: string;
  pillActive: string;
  pillActiveText: string;
}

export interface SpaceConfig {
  space: UserSpace;
  theme: SpaceTheme;
  icon: string;
  label: string;
  homeUrl: string;
}

export const SPACE_CONFIGS: Record<UserSpace, SpaceConfig> = {
  buyer: {
    space: 'buyer',
    theme: {
      primary: 'bg-trustBlue-600',
      primaryHover: 'hover:bg-trustBlue-700',
      accent: 'text-trustBlue-600',
      background: 'bg-trustBlue-50',
      backgroundSubtle: 'bg-trustBlue-50/60',
      badge: 'bg-trustBlue-100',
      badgeText: 'text-trustBlue-800',
      border: 'border-trustBlue-200',
      ring: 'ring-trustBlue-500',
      navActive: 'text-trustBlue-600',
      navActiveBg: 'bg-trustBlue-50',
      navActiveBorder: 'border-trustBlue-600',
      pillActive: 'bg-trustBlue-600',
      pillActiveText: 'text-white',
    },
    icon: '🛒',
    label: 'Espace Acheteur',
    homeUrl: '/dashboard',
  },
  seller: {
    space: 'seller',
    theme: {
      primary: 'bg-accentGreen-600',
      primaryHover: 'hover:bg-accentGreen-700',
      accent: 'text-accentGreen-600',
      background: 'bg-accentGreen-50',
      backgroundSubtle: 'bg-accentGreen-50/60',
      badge: 'bg-accentGreen-100',
      badgeText: 'text-accentGreen-800',
      border: 'border-accentGreen-200',
      ring: 'ring-accentGreen-500',
      navActive: 'text-accentGreen-700',
      navActiveBg: 'bg-accentGreen-50',
      navActiveBorder: 'border-accentGreen-600',
      pillActive: 'bg-accentGreen-600',
      pillActiveText: 'text-white',
    },
    icon: '💼',
    label: 'Espace Vendeur',
    homeUrl: '/dashboard/seller',
  },
  admin: {
    space: 'admin',
    theme: {
      primary: 'bg-red-600',
      primaryHover: 'hover:bg-red-700',
      accent: 'text-red-600',
      background: 'bg-red-50',
      backgroundSubtle: 'bg-red-50/60',
      badge: 'bg-red-100',
      badgeText: 'text-red-800',
      border: 'border-red-200',
      ring: 'ring-red-500',
      navActive: 'text-red-600',
      navActiveBg: 'bg-red-50',
      navActiveBorder: 'border-red-600',
      pillActive: 'bg-red-600',
      pillActiveText: 'text-white',
    },
    icon: '⚙️',
    label: 'Admin',
    homeUrl: '/admin',
  },
  public: {
    space: 'public',
    theme: {
      primary: 'bg-gray-900',
      primaryHover: 'hover:bg-gray-800',
      accent: 'text-gray-900',
      background: 'bg-background',
      backgroundSubtle: 'bg-gray-50',
      badge: 'bg-gray-100',
      badgeText: 'text-gray-800',
      border: 'border-gray-200',
      ring: 'ring-gray-500',
      navActive: 'text-primary',
      navActiveBg: 'bg-primary/10',
      navActiveBorder: 'border-primary',
      pillActive: 'bg-primary',
      pillActiveText: 'text-primary-foreground',
    },
    icon: '🌐',
    label: 'Public',
    homeUrl: '/',
  },
};

/** Détermine l'espace selon le pathname */
function detectSpace(pathname: string): UserSpace {
  if (pathname.startsWith('/admin')) return 'admin';
  if (
    pathname.startsWith('/dashboard/seller') ||
    pathname.startsWith('/sell-ticket')
  ) {
    return 'seller';
  }
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/my-purchases') ||
    pathname.startsWith('/disputes') ||
    pathname.startsWith('/favorites') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/tickets')
  ) {
    return 'buyer';
  }
  return 'public';
}

export function useCurrentSpace(): SpaceConfig {
  const pathname = usePathname();

  return useMemo(() => {
    const space = detectSpace(pathname);
    return SPACE_CONFIGS[space];
  }, [pathname]);
}

/** Indique si on est dans un espace authentifié (buyer ou seller) */
export function useIsAuthenticated(): boolean {
  const { space } = useCurrentSpace();
  return space === 'buyer' || space === 'seller' || space === 'admin';
}
