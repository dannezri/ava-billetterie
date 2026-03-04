/**
 * Layout pour l'espace acheteur
 * Inclut le Header principal, la barre de navigation buyer et le Footer
 * Appliqué à toutes les routes dans le groupe (buyer)
 */

import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BuyerNavBar } from '@/components/buyer/BuyerNavBar';

export default function BuyerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <BuyerNavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
