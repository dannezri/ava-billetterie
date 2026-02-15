import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AVA Billetterie - Plateforme de Revente Éthique 100% Sécurisée",
  description: "Revendez vos billets sans arnaque grâce au séquestre bancaire, KYC et vérification manuelle. Prix bloqués au facial, remboursement garanti en cas de fraude.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        <TRPCProvider>
          {children}
          <Toaster />
        </TRPCProvider>
      </body>
    </html>
  );
}
