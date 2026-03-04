/**
 * Layout du Dashboard Vendeur
 * Thème accentGreen (vert) — espace vendeur identifié visuellement
 * Accessible à TOUT utilisateur authentifié
 */

'use client';

import { SellerSidebar, MobileSellerSidebar } from '@/components/seller';

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-accentGreen-50/30">
      {/* Desktop Sidebar — fond blanc avec bordure verte */}
      <aside className="hidden w-64 border-r border-accentGreen-100 bg-white md:block shrink-0">
        <SellerSidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-accentGreen-200 bg-accentGreen-50 px-4 md:hidden">
          <MobileSellerSidebar />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-accentGreen-700">💼 Espace Vendeur</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
