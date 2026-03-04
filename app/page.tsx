import type { Metadata } from 'next';
import { Hero, HowItWorks, Features, Guarantees, Testimonials, FAQ, CTA, Footer } from '@/components/landing';

export const metadata: Metadata = {
  title: 'AVA Billetterie — Revente de billets éthique, séquestre J+2',
  description:
    'La première plateforme française de revente de billets avec séquestre bancaire J+2. Achetez et vendez en toute confiance : prix ≤ facial, KYC vendeurs, Garantie Sérénité (+50€ si problème).',
  keywords: [
    'revente billets',
    'billets concert',
    'plateforme éthique',
    'séquestre bancaire',
    'billets festival',
    'anti-scalping',
    'KYC',
    'garantie sérénité',
  ],
  openGraph: {
    title: 'AVA Billetterie — Revente de billets éthique, séquestre J+2',
    description:
      'Achetez et vendez vos billets de concert sans arnaque. Séquestre bancaire, prix ≤ facial, remboursement garanti + 50€ si problème.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'AVA Billetterie',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AVA Billetterie — Revente éthique de billets de concert',
    description:
      'Séquestre J+2, KYC vendeurs, Garantie Sérénité. La plateforme qui protège vraiment acheteurs et vendeurs.',
  },
  alternates: {
    canonical: 'https://ava-billetterie.com',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <Features />
      <Guarantees />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
