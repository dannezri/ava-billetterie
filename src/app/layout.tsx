/**
 * Root Layout - Requis par Next.js App Router
 * Appliqué à toutes les routes de l'application
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Billets Éthiques - Revente de billets sécurisée',
    template: '%s | Billets Éthiques',
  },
  description: 'Plateforme de revente de billets éthique et sécurisée avec garantie Sérénité',
  keywords: ['billets', 'concerts', 'revente', 'sécurisé', 'éthique'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
