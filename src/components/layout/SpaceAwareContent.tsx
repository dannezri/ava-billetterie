/**
 * SpaceAwareContent - Ajoute la SellerSidebar pour les pages vendeur
 * qui n'ont PAS leur propre layout imbriqué (ex: /sell-ticket).
 *
 * Les pages sous /dashboard/seller/* ont leur propre layout avec SellerSidebar
 * — on les exclut pour éviter une double sidebar.
 *
 * Pages qui bénéficient de ce wrapper : /sell-ticket, et toute future
 * page vendeur hors du groupe dashboard/seller.
 */

'use client';

import { usePathname } from 'next/navigation';
import { useCurrentSpace } from '@/hooks/useCurrentSpace';
import { SellerSidebar, MobileSellerSidebar } from '@/components/seller';

/** Pages vendeur qui ont déjà leur propre layout avec sidebar */
const SELLER_SELF_LAYOUT_PREFIX = '/dashboard/seller';

interface SpaceAwareContentProps {
  children: React.ReactNode;
}

export function SpaceAwareContent({ children }: SpaceAwareContentProps) {
  const { space } = useCurrentSpace();
  const pathname = usePathname();

  // Pages sous /dashboard/seller/* ont leur propre layout → pas de sidebar ici
  const hasSelfLayout = pathname.startsWith(SELLER_SELF_LAYOUT_PREFIX);

  if (space === 'seller' && !hasSelfLayout) {
    return (
      <div className="flex flex-1 min-h-0 bg-accentGreen-50/30">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r border-accentGreen-100 bg-white md:block shrink-0">
          <SellerSidebar />
        </aside>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Mobile header vendeur */}
          <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-accentGreen-200 bg-accentGreen-50 px-4 md:hidden">
            <MobileSellerSidebar />
            <span className="text-sm font-semibold text-accentGreen-700">💼 Espace Vendeur</span>
          </div>
          {children}
        </div>
      </div>
    );
  }

  // Buyer, public, admin, ou pages seller avec leur propre layout : pass-through
  return <>{children}</>;
}
