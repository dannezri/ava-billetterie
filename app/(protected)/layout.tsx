/**
 * Layout pour l'espace protégé (acheteur)
 * Inclut le Header principal, la barre de navigation buyer et le Footer
 * Appliqué à toutes les routes dans le groupe (protected)
 */

import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ConditionalBuyerNavBar } from '@/components/buyer/ConditionalBuyerNavBar';
import { SpaceAwareContent } from '@/components/layout/SpaceAwareContent';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* BuyerNavBar masquée automatiquement dans l'espace vendeur */}
      <ConditionalBuyerNavBar />
      {/*
       * SpaceAwareContent gère la sidebar selon l'espace actif :
       * - buyer/public/admin ou pages sous dashboard/seller/* : main simple
       * - seller hors dashboard/seller/* (ex: /sell-ticket) : SellerSidebar + main
       */}
      <SpaceAwareContent>
        <main className="flex-1">{children}</main>
      </SpaceAwareContent>
      
      <Footer />
    </div>
  );
}
