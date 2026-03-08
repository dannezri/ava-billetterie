/**
 * Page Garantie Sérénité — AVA Billetterie
 * La garantie unique : remboursement intégral + 50€ si billet refusé
 */

import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  CheckCircle2,
  Clock,
  Smartphone,
  Camera,
  Banknote,
  AlertTriangle,
  Star,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { FAQAccordion } from '@/components/landing/FAQAccordion';

export const metadata: Metadata = {
  title: 'Garantie Sérénité — Remboursement + 50€ si billet refusé',
  description:
    'Si votre billet AVA est refusé à l\'entrée du concert, nous vous remboursons intégralement + 50€ de dédommagement. Sous 10 minutes. Sans justification compliquée.',
  openGraph: {
    title: 'Garantie Sérénité — Remboursement + 50€ si billet refusé',
    description:
      'La seule plateforme qui vous rembourse + 50€ si votre billet ne fonctionne pas. Activation en 1 clic.',
  },
};

const coveredCases = [
  {
    icon: CheckCircle2,
    title: 'Billet faux ou invalide',
    description: 'Le code-barres est refusé par les systèmes de la salle ou du festival',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    icon: CheckCircle2,
    title: 'Code-barres déjà utilisé',
    description: 'Le billet a déjà été scanné : le vendeur vous avait envoyé un doublon',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    icon: CheckCircle2,
    title: 'Événement annulé sans report',
    description: 'Le concert est annulé définitivement (pas simplement reporté)',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    icon: CheckCircle2,
    title: 'Billet ne correspond pas',
    description: 'Mauvaise date, mauvaise salle, mauvais événement',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/20',
  },
];

const activationSteps = [
  {
    step: 1,
    icon: Smartphone,
    title: 'Appuyez sur "SOS Concert"',
    description:
      'Le bouton est visible dans votre commande active pendant les 4h entourant l\'événement. Il se géolocalise pour confirmer votre présence.',
    timing: 'Immédiatement',
  },
  {
    step: 2,
    icon: Camera,
    title: 'Envoyez une preuve',
    description:
      'Photo du refus à l\'entrée, email de l\'organisateur ou simple appel à notre hotline dédiée concert (disponible J du concert, 18h-2h).',
    timing: '< 2 minutes',
  },
  {
    step: 3,
    icon: CheckCircle2,
    title: 'Validation instantanée',
    description:
      'Notre équipe (vraie équipe humaine, pas un bot) valide votre demande. En cas de doute, on vous rappelle directement.',
    timing: '< 5 minutes',
  },
  {
    step: 4,
    icon: Banknote,
    title: 'Remboursement + 50€',
    description:
      'Le montant total de votre achat + 50€ de dédommagement sont virés sur votre compte dans les 10 minutes suivant la validation.',
    timing: '< 10 minutes total',
  },
];

const testimonials = [
  {
    name: 'Camille P.',
    event: 'Coldplay, Paris La Défense Arena',
    text: 'Mon billet était un doublon. Le staff a refusé l\'entrée. J\'ai activé SOS Concert, envoyé une photo, et 7 minutes plus tard j\'avais 102€ sur mon compte. Irréel mais vrai.',
    timing: '7 min',
    amount: '+50€',
  },
  {
    name: 'Marc L.',
    event: 'Taylor Swift, Lyon',
    text: 'Concert annulé 2 jours avant. Tous mes amis ont attendu 3 semaines pour un remboursement Ticketmaster. Moi, j\'avais la Garantie Sérénité : remboursé + 50€ en 5 minutes.',
    timing: '5 min',
    amount: '+50€',
  },
  {
    name: 'Julie R.',
    event: 'Travis Scott, Paris Bercy',
    text: 'Le code-barres était illisible à l\'entrée. Billet corrompu. J\'ai appelé la hotline concert à 20h45, validée en 3 minutes. Incroyable réactivité, merci !',
    timing: '8 min',
    amount: '+50€',
  },
];

const faqItems = [
  {
    question: 'Combien de temps pour être remboursé ?',
    answer:
      'En moyenne 7 à 10 minutes après activation de la Garantie. C\'est notre engagement : dès validation de votre preuve, le virement est immédiat. Pas de "vous serez remboursé dans 5 à 10 jours ouvrables" — on rembourse en temps réel.',
  },
  {
    question: 'Dois-je prouver que le billet ne fonctionnait pas ?',
    answer:
      'Une simple photo du refus à l\'entrée suffit dans la grande majorité des cas. Ou un email de l\'organisateur confirmant l\'annulation. En cas de doute, notre équipe peut vous appeler directement pour comprendre la situation. Nous faisons confiance à nos utilisateurs.',
  },
  {
    question: 'Pourquoi 50€ en plus du remboursement ?',
    answer:
      'Parce qu\'un concert raté, c\'est plus qu\'une perte d\'argent. C\'est du transport, peut-être un hôtel, des attentes, de l\'émotion. Les 50€ ne couvrent pas tout ça, mais c\'est notre façon de dire : "On est vraiment désolés, et on assume."',
  },
  {
    question: 'Est-ce que tous les billets achetés sur AVA sont couverts ?',
    answer:
      'Oui, 100% des billets achetés sur AVA sont automatiquement couverts par la Garantie Sérénité. Pas de souscription supplémentaire, pas de case à cocher, pas de frais additionnels. C\'est inclus dans les 5% de frais de plateforme.',
  },
  {
    question: 'Que se passe-t-il si l\'événement est reporté (pas annulé) ?',
    answer:
      'Si l\'événement est reporté à une date ultérieure, vous avez deux options : conserver votre billet pour la nouvelle date (votre séquestre est prolongé automatiquement), ou demander un remboursement intégral sans les 50€ de dédommagement (car l\'événement n\'est pas annulé).',
  },
  {
    question: 'La garantie s\'applique-t-elle si j\'ai perdu mon billet ?',
    answer:
      'Non. La Garantie Sérénité couvre les problèmes liés au billet lui-même (faux, doublon, annulation, mauvaise info). Si vous perdez votre PDF ou votre téléphone le jour J, contactez notre support — on fera notre possible pour vous aider, mais ce n\'est pas couvert par la garantie.',
  },
];

export default function SerenityGuaranteePage() {
  return (
    <div className="space-y-24 py-16">
      {/* Hero */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/20 dark:text-green-300">
            <Shield className="h-4 w-4" />
            <span>Garantie Sérénité — Exclusivement sur AVA</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            Votre billet ne fonctionne pas ?{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
              On vous rembourse + 50€
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Aucune justification compliquée. Aucune attente interminable.
            Aucune dispute par email. On vous rembourse en moins de 10 minutes,
            et on ajoute 50€ pour la déception.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="rounded-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white shadow-lg"
              asChild
            >
              <Link href="/events">
                Voir les événements protégés
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              asChild
            >
              <Link href="#how-it-works">
                Comment l&apos;activer ?
                <ChevronDown className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Bannière chiffres clés */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-500 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '< 10 min', label: 'Délai remboursement' },
              { value: '+50€', label: 'Dédommagement systématique' },
              { value: '100%', label: 'Des billets AVA couverts' },
              { value: '0', label: 'Justification compliquée' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-white/80 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cas couverts */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-4">
              Quels problèmes sont couverts ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              La Garantie Sérénité vous protège dans toutes ces situations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {coveredCases.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  Non couvert
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Billet perdu, mauvaise salle choisie par l&apos;acheteur,
                  problème de transport pour se rendre au concert,
                  événement reporté (non annulé).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment activer */}
      <section id="how-it-works" className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-4">
                Comment activer la Garantie ?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                4 étapes, moins de 10 minutes, depuis l&apos;entrée du concert
              </p>
            </div>

            <div className="space-y-4">
              {activationSteps.map((step, index) => (
                <div key={index} className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white font-bold text-lg">{step.step}</span>
                    </div>
                    {index < activationSteps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gradient-to-b from-green-300 to-emerald-200 dark:from-green-700 dark:to-emerald-800 my-2" />
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                        <span className="flex-shrink-0 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
                          {step.timing}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/20 dark:text-yellow-300 mb-4">
              <Star className="h-4 w-4 fill-current" />
              <span>Ils ont été protégés par la Garantie</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-4">
              Histoires vraies
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all">
                <div className="mb-4">
                  <p className="font-bold text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.event}</p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-6 leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-bold">{t.timing}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary ml-auto">
                    <Banknote className="h-4 w-4" />
                    <span className="text-sm font-bold">Remb. {t.amount}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-4">
                Questions sur la Garantie
              </h2>
            </div>
            <FAQAccordion items={faqItems} />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-green-600 to-emerald-500 p-12 text-center text-white max-w-4xl mx-auto">
          <Shield className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">
            Achetez vos billets en toute sérénité
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            100% des billets achetés sur AVA sont automatiquement protégés.
            Pas de frais supplémentaires, pas de démarche spéciale.
          </p>
          <Button
            size="lg"
            className="rounded-full bg-white text-green-700 hover:bg-gray-100 font-bold shadow-xl"
            asChild
          >
            <Link href="/events">
              Voir les événements
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
