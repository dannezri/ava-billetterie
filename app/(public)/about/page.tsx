/**
 * Page À Propos - AVA Billetterie
 * Histoire, valeurs, équipe et mission de la plateforme
 */

import type { Metadata } from 'next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Shield,
  TrendingUp,
  Users,
  Zap,
  Scale,
  ArrowRight,
  CheckCircle2,
  Target,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'À Propos d\'AVA — La plateforme de revente éthique',
  description:
    'Découvrez l\'histoire d\'AVA Billetterie, née de la frustration face aux plateformes de revente abusives. Notre mission : permettre à chacun d\'acheter et vendre des billets en toute confiance, sans scalping.',
  openGraph: {
    title: 'À Propos d\'AVA — La plateforme de revente éthique',
    description:
      'Notre mission : revente de billets sans arnaque, sans scalping, avec séquestre bancaire J+2.',
  },
};

const values = [
  {
    icon: Shield,
    title: 'Sécurité',
    description:
      'Séquestre bancaire automatique via Stripe Connect. Votre argent est bloqué jusqu\'à 2 jours après l\'événement — ni l\'acheteur ni le vendeur ne peuvent être arnaqués.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: Heart,
    title: 'Éthique',
    description:
      'Prix strictement plafonnés au prix facial, conformément à la loi française. Nous refusons toute tentative de scalping. Notre système détecte et bloque automatiquement les surtarifations.',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
  },
  {
    icon: TrendingUp,
    title: 'Transparence',
    description:
      'Frais uniques de 5% pour l\'acheteur, 0 frais pour le vendeur. Aucun frais caché, aucune mauvaise surprise. Ce que vous voyez, c\'est exactement ce que vous payez.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    icon: Users,
    title: 'Communauté',
    description:
      'Score de confiance vendeur (0-100), avis vérifiés, KYC obligatoire. Chaque utilisateur est responsable de sa réputation. La communauté s\'autorégule naturellement.',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
  {
    icon: Zap,
    title: 'Rapidité',
    description:
      'Vérification des billets en moins de 24h, paiement vendeur sous 48h après l\'événement, remboursement garanti en moins de 10 minutes en cas de problème.',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
  },
  {
    icon: Scale,
    title: 'Conformité',
    description:
      'Conformes DSP2, RGPD, et loi française anti-scalping. KYC via Stripe Identity. Données chiffrées, aucune conservation inutile. Nous respectons vos droits.',
    color: 'from-indigo-500 to-violet-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
  },
];

const milestones = [
  {
    year: '2023',
    title: 'L\'idée naît',
    description:
      'Après avoir perdu 180€ sur un billet Coldplay acheté sur une plateforme concurrente (code-barres déjà utilisé), nos fondateurs décident de créer la solution qu\'ils auraient voulu avoir.',
  },
  {
    year: '2024',
    title: 'Développement & Beta',
    description:
      'Développement de l\'architecture séquestre + KYC. Lancement de la beta privée avec 500 utilisateurs. 0 fraude détectée, 100% de satisfaction.',
  },
  {
    year: '2025',
    title: 'Lancement public',
    description:
      'Ouverture au grand public. 10 000+ billets vendus, 50 000+ utilisateurs, 0% de scalping détecté sur la plateforme.',
  },
  {
    year: '2026',
    title: 'Croissance & Innovation',
    description:
      'Extension à d\'autres types d\'événements (sport, théâtre, expositions). Lancement de la Garantie Sérénité : remboursement + 50€ si votre billet ne fonctionne pas.',
  },
];

const commitments = [
  'Jamais de frais cachés',
  'Jamais de scalping toléré',
  'Toujours du côté de l\'acheteur en cas de litige',
  'Support humain, pas un bot',
  'Données personnelles protégées (RGPD)',
  'Prix maximum = Prix facial du billet d\'origine',
];

export default function AboutPage() {
  return (
    <div className="space-y-24 py-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-300">
            <Target className="h-4 w-4" />
            <span>Notre mission</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl lg:text-6xl">
            La revente de billets{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              telle qu&apos;elle devrait être
            </span>
          </h1>

          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            AVA Billetterie est née d&apos;une frustration simple : pourquoi est-il si difficile
            de revendre un billet sans risquer de se faire arnaquer — ou d&apos;arnaquer sans le vouloir ?
            Nous avons créé la plateforme que nous aurions voulu avoir.
          </p>
        </div>
      </section>

      {/* Stats rapides */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '50 000+', label: 'Utilisateurs' },
              { value: '10 000+', label: 'Billets vendus' },
              { value: '0%', label: 'Scalping toléré' },
              { value: '4.9/5', label: 'Note moyenne' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-white/80 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl mb-4">
              Notre Histoire
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              De la frustration d&apos;un concert raté à une plateforme de confiance
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 hidden md:block" />

            <div className="space-y-10">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-8 md:ml-0">
                  {/* Year bubble */}
                  <div className="relative flex-shrink-0 hidden md:flex">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white text-sm shadow-lg z-10">
                      {milestone.year}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="md:hidden inline-block mb-2 text-sm font-bold text-primary">
                      {milestone.year}
                    </div>
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl mb-4">
              Nos Valeurs
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Ce ne sont pas que des mots. Ce sont les principes qui guident chaque décision technique et produit.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all"
              >
                <CardHeader className="pb-4">
                  <div className={`inline-flex mb-4 rounded-xl ${value.bgColor} p-3.5 w-fit`}>
                    <value.icon
                      className={`h-7 w-7 bg-gradient-to-br ${value.color} bg-clip-text text-transparent`}
                      strokeWidth={2}
                    />
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nos Engagements */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-4xl mb-6">
                Nos engagements concrets
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                Au-delà des discours, voici les garanties concrètes que nous prenons
                envers chaque utilisateur de la plateforme.
              </p>
              <Button size="lg" className="rounded-full" asChild>
                <Link href="/serenity-guarantee">
                  Découvrir la Garantie Sérénité
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {commitments.map((commitment, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {commitment}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Rejoignez la communauté AVA
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Des milliers d&apos;utilisateurs font déjà confiance à notre plateforme
            pour acheter et vendre leurs billets en toute sérénité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="rounded-full bg-white text-zinc-900 hover:bg-zinc-100 font-semibold"
              asChild
            >
              <Link href="/signup">Créer un compte gratuit</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-white bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link href="/events">Voir les événements</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
