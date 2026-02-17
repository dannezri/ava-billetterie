/**
 * Main Layout Component
 * Wraps pages with Header and Footer
 */

'use client';

import { Footer } from './Footer';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
