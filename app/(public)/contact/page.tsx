/**
 * Page Contact — AVA Billetterie
 * Formulaire de contact + informations de support
 */

import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Clock, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nous Contacter — AVA Billetterie',
  description:
    'Contactez l\'équipe AVA Billetterie. Support disponible 7j/7, réponse en moins de 2h. Hotline dédiée pour les urgences concert le jour J.',
  openGraph: {
    title: 'Nous Contacter — AVA Billetterie',
    description: 'Notre équipe répond en moins de 2h, même le week-end.',
  },
};

const contactOptions = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Pour toute question générale, remboursement ou litige.',
    detail: 'Réponse en < 2h en semaine, < 4h week-end',
    action: 'contact@ava-billetterie.com',
    href: 'mailto:contact@ava-billetterie.com',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    icon: Shield,
    title: 'Litige & Garantie Sérénité',
    description: 'Problème avec un billet ? Activez la garantie depuis l\'app ou contactez-nous.',
    detail: 'Traitement prioritaire < 30 min',
    action: 'litige@ava-billetterie.com',
    href: 'mailto:litige@ava-billetterie.com',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    icon: MessageSquare,
    title: 'Hotline Concert 🚨',
    description: 'Urgence le jour du concert ? Notre hotline est disponible en soirée.',
    detail: 'Disponible 18h–2h les jours de concerts',
    action: '+33 1 00 00 00 00',
    href: 'tel:+33100000000',
    color: 'from-red-500 to-pink-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
  },
];

const topics = [
  'Problème avec un billet acheté',
  'Question sur un remboursement',
  'Aide pour vendre un billet',
  'Problème de vérification KYC',
  'Question sur le séquestre',
  'Signaler un vendeur frauduleux',
  'Partenariat / Presse',
  'Autre',
];

export default function ContactPage() {
  return (
    <div className="space-y-20 py-16">
      {/* Hero */}
      <section className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-5xl">
            Nous sommes là{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              pour vous aider
            </span>
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Une vraie équipe, de vraies réponses — pas des bots.
            Nous répondons en moins de 2h, même le week-end.
          </p>
        </div>
      </section>

      {/* Options de contact */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {contactOptions.map((option, index) => (
            <Card
              key={index}
              className="p-8 text-center hover:shadow-xl transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${option.bg} flex items-center justify-center mx-auto mb-5`}>
                <option.icon
                  className={`h-7 w-7 bg-gradient-to-br ${option.color} bg-clip-text text-transparent`}
                  strokeWidth={2}
                />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                {option.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 leading-relaxed">
                {option.description}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-6">
                <Clock className="h-3.5 w-3.5" />
                <span>{option.detail}</span>
              </div>
              <a
                href={option.href}
                className="inline-flex items-center justify-center gap-2 w-full rounded-full border-2 border-zinc-200 dark:border-zinc-700 py-2.5 text-sm font-semibold text-zinc-900 dark:text-white hover:border-primary hover:text-primary transition-colors group-hover:border-primary group-hover:text-primary"
              >
                {option.action}
              </a>
            </Card>
          ))}
        </div>
      </section>

      {/* Formulaire de contact */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-3">
                Envoyer un message
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Remplissez le formulaire, on revient vers vous rapidement
              </p>
            </div>

            <Card className="p-8">
              <form
                action="mailto:contact@ava-billetterie.com"
                method="post"
                encType="text/plain"
                className="space-y-6"
              >
                {/* Nom + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Marie Dupont"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="marie@exemple.com"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Sujet */}
                <div>
                  <label
                    htmlFor="topic"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Sujet de votre message <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
                  >
                    <option value="">Choisissez un sujet…</option>
                    {topics.map((topic, i) => (
                      <option key={i} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Numéro de commande */}
                <div>
                  <label
                    htmlFor="order"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Numéro de commande{' '}
                    <span className="text-muted-foreground font-normal">(si applicable)</span>
                  </label>
                  <input
                    id="order"
                    name="order"
                    type="text"
                    placeholder="AVA-XXXX-XXXX"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    placeholder="Décrivez votre problème ou votre question en détail…"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-sm resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full rounded-full">
                  Envoyer le message
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  En envoyant ce formulaire, vous acceptez que nous traitions vos données
                  pour répondre à votre demande. Voir notre{' '}
                  <Link href="/privacy" className="underline hover:text-primary">
                    politique de confidentialité
                  </Link>
                  .
                </p>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Autres ressources */}
      <section className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Avant de nous contacter…
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Votre réponse est peut-être déjà dans notre centre d&apos;aide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="rounded-full" asChild>
              <Link href="/help">
                Voir le Centre d&apos;Aide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full" asChild>
              <Link href="/how-it-works">
                Comment ça marche ?
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
