'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Comment fonctionne le séquestre ?',
    answer:
      'Quand un acheteur paie, l\'argent est bloqué sur un compte Stripe sécurisé (pas chez nous). Le vendeur ne peut pas y toucher. 2 jours après l\'événement, si aucun litige n\'est ouvert, les fonds sont automatiquement transférés au vendeur. En cas de problème (billet invalide, code-barres déjà utilisé), l\'acheteur peut ouvrir un litige et être remboursé.',
  },
  {
    question: 'Pourquoi dois-je faire le KYC ?',
    answer:
      'La vérification KYC (Know Your Customer) est obligatoire pour tous les vendeurs. Elle permet de confirmer votre identité avec une pièce d\'identité et un selfie via Stripe Identity. Cela empêche les arnaques, respecte les régulations bancaires européennes (DSP2) et rassure les acheteurs. C\'est rapide (moins de 2 minutes) et vos données sont sécurisées par Stripe.',
  },
  {
    question: 'Puis-je vendre au-dessus du prix facial ?',
    answer:
      'Non, c\'est strictement interdit sur Ava. Nous plafonnons tous les prix au prix d\'origine du billet. Notre système analyse automatiquement le PDF et rejette toute tentative de surtarification. C\'est notre engagement éthique : pas de spéculation, juste une revente honnête pour ceux qui ne peuvent plus aller à un événement.',
  },
  {
    question: 'Que se passe-t-il si mon billet est refusé à l\'entrée ?',
    answer:
      'Si votre billet est invalide, code-barres déjà scanné ou refusé pour toute autre raison, vous avez jusqu\'à J+2 après l\'événement pour ouvrir un litige. Vous devrez fournir des preuves (photo du refus, email du producteur, etc.). Notre équipe examine chaque cas sous 24h. Si le vendeur est en tort, vous êtes intégralement remboursé et son trust score chute.',
  },
  {
    question: 'Combien coûte Ava ?',
    answer:
      'Nous prélevons des frais de service transparents : 5% pour le vendeur (sur le montant de la vente) et 3% + 0,50€ pour l\'acheteur. Ces frais couvrent le séquestre bancaire, la vérification KYC, l\'infrastructure de sécurité et le support client. Pas de frais cachés, pas de surprises.',
  },
  {
    question: 'Combien de temps faut-il pour valider mon billet ?',
    answer:
      'Une fois votre billet uploadé, notre équipe le vérifie manuellement sous 24h ouvrées (souvent moins). Nous contrôlons la lisibilité, le code-barres, la cohérence du prix et l\'absence de manipulation. Une fois approuvé, votre billet est immédiatement visible sur la marketplace.',
  },
  {
    question: 'Mon billet PDF est-il en sécurité ?',
    answer:
      'Oui, chaque PDF est stocké de manière chiffrée sur un serveur sécurisé. Seul l\'acheteur final peut le télécharger via un lien temporaire (expire 1h). Le PDF reçu par l\'acheteur contient un watermark dynamique avec l\'ID de transaction pour éviter toute revente sauvage. Nous respectons le RGPD : pas de conservation inutile.',
  },
  {
    question: 'Puis-je annuler une vente ?',
    answer:
      'Si votre billet n\'est pas encore vendu (statut "actif"), vous pouvez l\'annuler à tout moment depuis votre dashboard. Si un acheteur a déjà payé (statut "vendu"), vous ne pouvez plus annuler : le contrat est engagé et le billet est transféré. En cas de force majeure, contactez notre support.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-zinc-50 py-20 dark:bg-zinc-900 md:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300">
            <HelpCircle className="h-4 w-4" />
            <span>Questions fréquentes</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            Tout ce que vous devez savoir
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Des questions ? Nous avons les réponses.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-3xl space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-950"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-start justify-between gap-4 p-6 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <span className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 flex-shrink-0 text-zinc-500 transition-transform',
                    openIndex === index && 'rotate-180'
                  )}
                />
              </button>
              <div
                className={cn(
                  'grid transition-all duration-300 ease-in-out',
                  openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-zinc-100 p-6 pt-4 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="mx-auto mt-12 max-w-3xl text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Vous ne trouvez pas votre réponse ?{' '}
            <a
              href="/help"
              className="font-semibold text-blue-600 underline-offset-4 hover:underline dark:text-blue-500"
            >
              Consultez notre centre d&apos;aide
            </a>{' '}
            ou{' '}
            <a
              href="/contact"
              className="font-semibold text-blue-600 underline-offset-4 hover:underline dark:text-blue-500"
            >
              contactez-nous directement
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
