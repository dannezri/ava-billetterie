/**
 * Layout du Dashboard Vendeur
 * Inclut la sidebar de navigation et la protection par authentification
 * Note: /profile est accessible sans protection car c'est la page d'onboarding
 */

'use client';

import { usePathname } from 'next/navigation';
import { SellerSidebar, MobileSellerSidebar } from '@/components/seller';
import { SellerProtection } from '@/components/auth';

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isProfilePage = pathname === '/dashboard/seller/profile';

  // La page /profile n'est pas protégée car c'est la page d'onboarding
  const content = (
    <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 border-r bg-background md:block">
          <SellerSidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Header */}
          <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
            <MobileSellerSidebar />
            <h1 className="text-lg font-semibold">Dashboard Vendeur</h1>
          </div>

          {/* Page Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
  );

  // Si c'est la page profile, on ne protège pas
  if (isProfilePage) {
    return content;
  }

  // Sinon, on protège avec SellerProtection
  return <SellerProtection>{content}</SellerProtection>;
}
