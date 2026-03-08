'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Comment fonctionne le séquestre ?',
    answer:
      "Quand un acheteur paie, l'argent est bloqué sur un compte Stripe sécurisé (pas chez nous). Le vendeur ne peut pas y toucher. 2 jours après l'événement, si aucun litige n'est ouvert, les fonds sont automatiquement transférés au vendeur. En cas de problème, l'acheteur peut ouvrir un litige et être remboursé.",
  },
  {
    question: 'Pourquoi dois-je faire le KYC ?',
    answer:
      "La vérification KYC est obligatoire pour tous les vendeurs. Elle permet de confirmer votre identité avec une pièce d'identité et un selfie via Stripe Identity. Cela empêche les arnaques, respecte les régulations bancaires européennes (DSP2) et rassure les acheteurs. C'est rapide (moins de 2 minutes).",
  },
  {
    question: 'Puis-je vendre au-dessus du prix facial ?',
    answer:
      "Non, c'est strictement interdit sur Ava. Nous plafonnons tous les prix au prix d'origine du billet. Notre système analyse automatiquement le PDF et rejette toute tentative de surtarification.",
  },
  {
    question: "Que se passe-t-il si mon billet est refusé à l'entrée ?",
    answer:
      "Si votre billet est invalide ou refusé, vous avez jusqu'à J+2 après l'événement pour ouvrir un litige. Notre équipe examine chaque cas sous 24h. Si le vendeur est en tort, vous êtes intégralement remboursé.",
  },
  {
    question: "Combien coûte Ava ?",
    answer:
      "Nous prélevons des frais de service transparents : 5% pour le vendeur et 3% + 0,50€ pour l'acheteur. Ces frais couvrent le séquestre, la vérification KYC et le support. Pas de frais cachés.",
  },
  {
    question: 'Combien de temps faut-il pour valider mon billet ?',
    answer:
      "Une fois votre billet uploadé, notre équipe le vérifie sous 24h ouvrées. Nous contrôlons la lisibilité, le code-barres et la cohérence du prix. Une fois approuvé, votre billet est immédiatement visible.",
  },
  {
    question: 'Mon billet PDF est-il en sécurité ?',
    answer:
      "Oui, chaque PDF est stocké de manière chiffrée. Seul l'acheteur final peut le télécharger via un lien temporaire. Le PDF reçu contient un watermark dynamique avec l'ID de transaction.",
  },
  {
    question: "Puis-je annuler une vente ?",
    answer:
      "Si votre billet n'est pas encore vendu, vous pouvez l'annuler depuis votre dashboard. Si un acheteur a déjà payé, vous ne pouvez plus annuler : le contrat est engagé.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-gray-50 py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-clean-sm border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
            <HelpCircle className="h-4 w-4" />
            <span>Questions fréquentes</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
            Tout ce que vous devez savoir
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Des questions ? Nous avons les réponses.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-clean shadow-clean overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-base font-semibold text-gray-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200',
                    openIndex === index && 'rotate-180 text-blue-600'
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
                  <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 text-sm">
            Vous ne trouvez pas votre réponse ?{' '}
            <a href="/help" className="font-semibold text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline">
              Consultez notre centre d&apos;aide
            </a>{' '}
            ou{' '}
            <a href="/contact" className="font-semibold text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline">
              contactez-nous
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
