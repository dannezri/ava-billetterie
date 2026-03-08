/**
 * Page Comment ça marche — AVA Billetterie
 * Explication détaillée du séquestre, KYC, vérification billets et garantie
 */

import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Upload,
  ShieldCheck,
  Banknote,
  UserCheck,
  FileCheck,
  Lock,
  Trophy,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Comment ça marche — AVA Billetterie',
  description:
    'Comprendre le fonctionnement d\'AVA : séquestre bancaire J+2, KYC vendeurs, vérification manuelle des billets, et Garantie Sérénité. Tout ce que vous devez savoir avant d\'acheter ou vendre.',
  openGraph: {
    title: 'Comment ça marche — AVA Billetterie',
    description:
      'Séquestre J+2, KYC, vérification billets, Garantie Sérénité : tout comprendre en 3 minutes.',
  },
};

const buyerSteps = [
  {
    icon: FileCheck,
    title: 'Parcourez & sélectionnez',
    description:
      'Recherchez parmi des milliers de billets vérifiés. Chaque billet a passé notre validation manuelle (prix ≤ facial, code-barres lisible, pas de doublon). Le vendeur est KYC-vérifié.',
    detail: 'Vendeurs vérifiés · Prix plafonnés · Billets authentifiés',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: Lock,
    title: 'Payez en toute sécurité',
    description:
      'Votre paiement est immédiatement placé en séquestre sur un compte Stripe sécurisé. Ni le vendeur, ni nous ne pouvons y toucher. L\'argent est littéralement verrouillé.',
    detail: 'Séquestre Stripe · Chiffrement 256-bit · Conformité DSP2',
    color: 'from-blue-500 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    icon: ShieldCheck,
    title: 'Téléchargez votre billet',
    description:
      'Dès le paiement confirmé, vous recevez accès à votre billet PDF via un lien sécurisé temporaire (expire dans 1h). Le PDF contient un watermark unique pour éviter la copie.',
    detail: 'Lien sécurisé · Watermark unique · Stockage chiffré',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    icon: Banknote,
    title: 'Profitez — et si problème, on rembourse',
    description:
      'Allez au concert ! Si votre billet est refusé à l\'entrée, activez la Garantie Sérénité depuis l\'app : remboursement + 50€ sous 10 minutes. Sans question compliquée.',
    detail: 'Garantie Sérénité · Remb. + 50€ · Sous 10 min',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
  },
];

const sellerSteps = [
  {
    icon: UserCheck,
    title: 'Vérification KYC (une seule fois)',
    description:
      'Première étape obligatoire : vérifier votre identité via Stripe Identity. Selfie + pièce d\'identité. Rapide (2 min), sécurisé (Stripe), et ça rassure énormément les acheteurs.',
    detail: 'Via Stripe Identity · RGPD · 1 seule fois',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: Upload,
    title: 'Déposez votre billet',
    description:
      'Uploadez votre billet PDF. Notre système extrait automatiquement les informations (événement, date, prix facial) et détecte les doublons (hash SHA-256 + analyse code-barres).',
    detail: 'PDF uniquement · Analyse auto · Détection doublons',
    color: 'from-blue-500 to-violet-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    icon: ShieldCheck,
    title: 'Validation manuelle sous 24h',
    description:
      'Notre équipe vérifie manuellement chaque billet : lisibilité, cohérence prix vs facial, authenticité. Une fois approuvé, votre billet est visible sur la marketplace.',
    detail: 'Vérif. humaine · Sous 24h · Prix ≤ facial obligatoire',
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    icon: Banknote,
    title: 'Recevez votre argent J+2',
    description:
      'Deux jours après l\'événement (si aucun litige), les fonds sont automatiquement libérés du séquestre et virés sur votre compte bancaire. Zéro frais pour le vendeur.',
    detail: 'Virement auto · J+2 après event · 0% frais vendeur',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
  },
];

const securityFeatures = [
  {
    icon: Lock,
    title: 'Séquestre Stripe Connect',
    description:
      'L\'argent est bloqué dans un compte Stripe Connect séparé. Ni nous ni le vendeur ne pouvons y accéder pendant la période de séquestre. C\'est la banque qui tient l\'argent.',
  },
  {
    icon: UserCheck,
    title: 'KYC obligatoire vendeurs',
    description:
      'Chaque vendeur doit vérifier son identité (pièce d\'identité + selfie) via Stripe Identity avant de vendre. Élimine 99% des arnaqueurs dès le départ.',
  },
  {
    icon: FileCheck,
    title: 'Vérification hash des billets',
    description:
      'Chaque PDF est hashé (SHA-256). Si un billet identique est uploadé une seconde fois, notre système le détecte et rejette automatiquement la vente.',
  },
  {
    icon: Trophy,
    title: 'Trust Score vendeur',
    description:
      'Chaque vendeur a un score de confiance (0-100) basé sur ses ventes, avis et litiges. 3 litiges perdus = suspension automatique. Les bons vendeurs sont mis en avant.',
  },
];

const disputeSteps = [
  {
    time: 'Immédiatement',
    action: 'Activez le bouton "SOS Concert" dans l\'app',
    icon: AlertTriangle,
  },
  {
    time: '< 2 minutes',
    action: 'Envoyez une preuve (photo du refus à l\'entrée ou email organisateur)',
    icon: FileCheck,
  },
  {
    time: '< 10 minutes',
    action: 'Notre équipe valide et libère le remboursement + 50€',
    icon: Banknote,
  },
  {
    time: 'J+2 max',
    action: 'Si problème constaté après le concert, litige possible sous 48h',
    icon: Clock,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-24 py-16">
      {/* Hero */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Transparent par design</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">
            Comment fonctionne{' '}
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              AVA ?
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Séquestre bancaire, KYC, vérification des billets, Garantie Sérénité.
            Nous expliquons tout — sans jargon, avec honnêteté.
          </p>
        </div>
      </section>

      {/* Pour les acheteurs */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-950/20 dark:text-green-300 mb-4">
            <CheckCircle2 className="h-4 w-4" />
            <span>Pour les acheteurs</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-4">
            Acheter un billet en 4 étapes
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            De la recherche à l&apos;entrée du concert, voici exactement ce qui se passe
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {buyerSteps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < buyerSteps.length - 1 && (
                <div className="absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-zinc-200 to-zinc-100 dark:from-zinc-700 dark:to-zinc-800 hidden lg:block z-0 -ml-3 mr-3" />
              )}

              <div className="relative z-10 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 h-full flex flex-col hover:shadow-xl transition-all group">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-600 dark:from-zinc-200 dark:to-zinc-400 text-white dark:text-gray-900 text-sm font-bold flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`inline-flex mb-5 rounded-xl ${step.bgColor} p-3.5 w-fit`}>
                  <step.icon
                    className={`h-7 w-7 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}
                    strokeWidth={2}
                  />
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1 mb-4">
                  {step.description}
                </p>

                {/* Detail badge */}
                <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 font-medium">
                  {step.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pour les vendeurs */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 dark:border-purple-900 dark:bg-purple-950/20 dark:text-purple-300 mb-4">
              <Banknote className="h-4 w-4" />
              <span>Pour les vendeurs</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-4">
              Vendre un billet en 4 étapes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              De l&apos;upload à la réception de votre argent, zéro frais pour vous
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {sellerSteps.map((step, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 flex flex-col hover:shadow-xl transition-all relative"
              >
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-600 dark:from-zinc-200 dark:to-zinc-400 text-white dark:text-gray-900 text-sm font-bold flex items-center justify-center shadow-lg">
                  {index + 1}
                </div>

                <div className={`inline-flex mb-5 rounded-xl ${step.bgColor} p-3.5 w-fit`}>
                  <step.icon
                    className={`h-7 w-7 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}
                    strokeWidth={2}
                  />
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1 mb-4">
                  {step.description}
                </p>

                <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 font-medium">
                  {step.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi le séquestre ? */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-4">
              Pourquoi le séquestre bancaire ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              C&apos;est la pièce maîtresse qui rend tout le reste possible
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold">Sans séquestre (les autres)</h3>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
                {[
                  'Le vendeur reçoit l\'argent avant l\'événement',
                  'S\'il disparaît ou envoie un faux billet, pas de recours',
                  'L\'acheteur doit "faire confiance" au vendeur',
                  'Litiges longs, remboursements rares',
                  'Risque permanent d\'arnaque',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1 flex-shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-8 border-2 border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold">Avec séquestre AVA</h3>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
                {[
                  'L\'argent est bloqué chez Stripe (ni acheteur ni vendeur)',
                  'Le vendeur ne peut pas partir avec votre argent',
                  'Si problème : l\'acheteur est remboursé immédiatement',
                  'Le vendeur est payé seulement si tout s\'est bien passé',
                  'Zéro risque d\'arnaque des deux côtés',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Sécurité multi-niveaux */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-4">
              Architecture de sécurité multi-niveaux
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Quatre couches de protection pour garantir chaque transaction
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="flex gap-5 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* En cas de problème */}
      <section className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl mb-4">
              En cas de problème à l&apos;entrée
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              La Garantie Sérénité s&apos;active en quelques clics
            </p>
          </div>

          <div className="space-y-4">
            {disputeSteps.map((step, index) => (
              <div
                key={index}
                className="flex gap-5 p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>
                  {index < disputeSteps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-800 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-1">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">
                    {step.time}
                  </span>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {step.action}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" className="rounded-full" asChild>
              <Link href="/serenity-guarantee">
                En savoir plus sur la Garantie Sérénité
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à essayer ?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Inscription gratuite en 2 minutes. Aucune carte bancaire requise pour créer un compte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="rounded-full bg-white text-gray-900 hover:bg-gray-100 font-semibold"
              asChild
            >
              <Link href="/signup">
                Créer mon compte
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
