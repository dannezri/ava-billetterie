/**
 * Page Tarification — AVA Billetterie
 * Transparence totale sur les frais : 5% acheteur, 0% vendeur
 */

import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  ArrowRight,
  Calculator,
  Shield,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { PriceCalculator } from '@/components/landing/PriceCalculator';
import { ComparisonTable } from '@/components/landing/ComparisonTable';
import { FAQAccordion } from '@/components/landing/FAQAccordion';

export const metadata: Metadata = {
  title: 'Tarification Transparente — 5% de frais, rien de plus | AVA',
  description:
    'Frais uniques de 5% pour l\'acheteur. 0% de frais pour le vendeur. Pas de frais d\'inscription, pas de frais cachés. Découvrez ce qui est inclus dans ces 5%.',
  openGraph: {
    title: 'Tarification Transparente — 5% de frais, rien de plus | AVA',
    description:
      '5% pour l\'acheteur, 0% pour le vendeur. Tout est inclus : vérification billets, séquestre, Garantie Sérénité, support.',
  },
};

const includedInFees = [
  'Vérification manuelle de chaque billet',
  'KYC vendeurs (Stripe Identity)',
  'Séquestre bancaire J+2',
  'Garantie Sérénité (remb. + 50€)',
  'Support client 7j/7',
  'Frais de paiement Stripe (~2%)',
  'Détection de doublons (SHA-256)',
  'Stockage sécurisé + watermark PDF',
  'Infrastructure anti-fraude',
];

const neverCharged = [
  'Frais d\'inscription ou d\'abonnement',
  'Frais de retrait pour les vendeurs',
  'Frais de téléchargement du PDF',
  'Frais de modification d\'annonce',
  'Frais d\'annulation (billet non vendu)',
  'Frais "de traitement" supplémentaires',
  'Frais "de service" cachés',
  'Commission sur le vendeur',
];

const faqItems = [
  {
    question: 'Qui paie les frais de plateforme ?',
    answer:
      'L\'acheteur paie 5% de frais en plus du prix du billet. Le vendeur ne paie rien : il reçoit 100% du prix de vente affiché sur son annonce. Par exemple, si un billet est vendu 50€, l\'acheteur paie 52,50€ et le vendeur reçoit 50€.',
  },
  {
    question: 'Pourquoi 5% et pas moins ?',
    answer:
      'Ces 5% couvrent : la vérification manuelle de chaque billet (humain, pas un algo), le séquestre bancaire via Stripe Connect (coût infrastructure), la Garantie Sérénité (remb. + 50€ si problème), le support client humain 7j/7, et les frais de paiement Stripe (~2%). Notre marge réelle est d\'environ 1-1.5%. Notre objectif : viabilité, pas enrichissement.',
  },
  {
    question: 'Vous êtes vraiment moins chers que Viagogo ?',
    answer:
      'Oui, massivement. Viagogo facture 25 à 40% de frais à l\'acheteur ET 15 à 25% au vendeur. StubHub prend 10 à 30% à l\'acheteur. Nous prenons 5% à l\'acheteur et 0% au vendeur. Et en plus, nous ne permettons pas le scalping (prix plafonnés au facial).',
  },
  {
    question: 'Y a-t-il des frais pour les vendeurs ?',
    answer:
      'Zéro. Créer un compte, vendre des billets, retirer son argent après l\'événement : tout est gratuit pour les vendeurs. Le KYC est également gratuit (c\'est Stripe qui gère). La seule contrainte pour les vendeurs : ne pas vendre au-dessus du prix facial.',
  },
  {
    question: 'Que se passe-t-il si je dois annuler mon achat ?',
    answer:
      'Si le billet n\'est pas encore validé par l\'acheteur (rare), contact support. En règle générale, les achats sur AVA sont fermes et définitifs — comme un billet de concert classique. En revanche, si le vendeur annule, vous êtes remboursé intégralement sans aucun frais.',
  },
  {
    question: 'Les 50€ de la Garantie Sérénité sont-ils inclus dans les 5% ?',
    answer:
      'Oui. La Garantie Sérénité est incluse dans les frais de plateforme. Nous couvrons ces 50€ nous-mêmes (et nous les récupérons ensuite sur le vendeur fautif via son Trust Score / sanctions). Vous n\'avez rien de plus à payer pour bénéficier de cette garantie.',
  },
];

export default function PricingPage() {
  return (
    <div className="space-y-24 py-16">
      {/* Hero */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/20 dark:text-green-300">
            <Check className="h-4 w-4" />
            <span>Tarification 100% transparente</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              5% de frais
            </span>
            {' '}— rien de plus
          </h1>

          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Pas de frais cachés, pas de mauvaises surprises, pas de fine print.
            Ce que vous voyez sur l&apos;annonce + 5%, c&apos;est exactement ce que vous payez.
          </p>

          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Acheteur : <strong className="text-zinc-900 dark:text-white">+5%</strong></span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Vendeur : <strong className="text-zinc-900 dark:text-white">0%</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Calculateur */}
      <section className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-xl border-2">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                Calculateur de Prix
              </h2>
              <p className="text-muted-foreground">
                Entrez le prix du billet et voyez exactement ce que vous paierez
              </p>
            </div>
            <PriceCalculator />
          </Card>
        </div>
      </section>

      {/* Ce qui est inclus */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white md:text-4xl mb-4">
              Ce qui est inclus dans les 5%
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Ce n&apos;est pas un frais de plateforme ordinaire.
              C&apos;est une assurance complète pour votre tranquillité d&apos;esprit.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
            {/* Inclus */}
            <Card className="p-8 border-2 border-green-200 dark:border-green-900 bg-green-50/30 dark:bg-green-950/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Inclus dans les 5%
                </h3>
              </div>
              <ul className="space-y-3">
                {includedInFees.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Jamais facturé */}
            <Card className="p-8 border-2 border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-950/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Jamais facturé
                </h3>
              </div>
              <ul className="space-y-3">
                {neverCharged.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="text-sm text-zinc-500 dark:text-zinc-500 line-through">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparaison */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white md:text-4xl mb-4">
            Pourquoi AVA est différent
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Comparaison honnête avec les autres plateformes
          </p>
        </div>
        <ComparisonTable />
      </section>

      {/* FAQ */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white md:text-4xl mb-4">
                Questions sur la tarification
              </h2>
            </div>
            <FAQAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Commencez sans frais d&apos;inscription
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Créer un compte est 100% gratuit. Vous ne payez que quand vous achetez un billet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="rounded-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold"
              asChild
            >
              <Link href="/signup">
                Créer mon compte gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-white bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link href="/events">Voir les billets disponibles</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
