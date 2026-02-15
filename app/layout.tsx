import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/provider";
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
  title: "AVA Billetterie - Plateforme de Revente Éthique",
  description: "Achetez et vendez vos billets en toute sécurité avec AVA Billetterie",
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
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
