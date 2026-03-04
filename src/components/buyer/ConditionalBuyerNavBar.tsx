/**
 * ConditionalBuyerNavBar - Affiche la BuyerNavBar uniquement dans l'espace acheteur
 * Masquée automatiquement quand l'utilisateur est dans l'espace vendeur
 */

'use client';

import { useCurrentSpace } from '@/hooks/useCurrentSpace';
import { BuyerNavBar } from './BuyerNavBar';

export function ConditionalBuyerNavBar() {
  const { space } = useCurrentSpace();

  // Ne pas afficher la navbar buyer en espace vendeur ou admin
  if (space === 'seller' || space === 'admin') {
    return null;
  }

  return <BuyerNavBar />;
}
