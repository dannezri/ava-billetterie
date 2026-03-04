/**
 * Layout pour les pages publiques
 * Inclut le Header principal et le Footer
 * Appliqué à : /events, /about, /search, /checkout, etc.
 */

import { ReactNode } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
