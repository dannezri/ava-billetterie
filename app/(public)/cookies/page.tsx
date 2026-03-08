/**
 * Politique de Cookies — AVA Billetterie
 */

import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de Cookies — AVA Billetterie',
  description:
    'Comment AVA Billetterie utilise les cookies : cookies essentiels, analytiques et de performance. Gestion de vos préférences.',
};

const lastUpdated = '1er janvier 2026';

type CookieCategory = {
  name: string;
  required: boolean;
  description: string;
  cookies: { name: string; purpose: string; duration: string; provider: string }[];
};

const cookieCategories: CookieCategory[] = [
  {
    name: 'Cookies Essentiels',
    required: true,
    description:
      'Ces cookies sont indispensables au fonctionnement de la plateforme. Ils gèrent votre session, votre authentification et la sécurité. Sans eux, AVA ne peut pas fonctionner correctement.',
    cookies: [
      {
        name: 'sb-auth-token',
        purpose: 'Session d\'authentification Supabase',
        duration: '7 jours',
        provider: 'AVA / Supabase',
      },
      {
        name: '__stripe_mid',
        purpose: 'Anti-fraude et sécurité des paiements Stripe',
        duration: '1 an',
        provider: 'Stripe',
      },
      {
        name: '__stripe_sid',
        purpose: 'Session de paiement Stripe',
        duration: '30 minutes',
        provider: 'Stripe',
      },
      {
        name: 'csrf_token',
        purpose: 'Protection contre les attaques CSRF',
        duration: 'Session',
        provider: 'AVA',
      },
    ],
  },
  {
    name: 'Cookies Analytiques',
    required: false,
    description:
      'Actuellement, nous n\'utilisons aucun cookie d\'analyse tiers. Seuls les cookies essentiels au fonctionnement (authentification, paiements) sont déposés. Des outils d\'analyse respectueux de la vie privée pourront être ajoutés dans le futur avec votre consentement préalable explicite.',
    cookies: [
      {
        name: 'sentry-sc',
        purpose: 'Monitoring des erreurs techniques (Sentry)',
        duration: '1 an',
        provider: 'Sentry',
      },
    ],
  },
  {
    name: 'Cookies de Performance',
    required: false,
    description:
      'Ces cookies permettent d\'optimiser les performances de la plateforme, notamment le chargement des images et des ressources.',
    cookies: [
      {
        name: '__vercel_live_token',
        purpose: 'Optimisation déploiement Vercel (mode preview)',
        duration: 'Session',
        provider: 'Vercel',
      },
    ],
  },
];

export default function CookiesPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-muted-foreground mb-6">
              Dernière mise à jour : {lastUpdated}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Politique de Cookies
            </h1>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              AVA Billetterie utilise des cookies pour faire fonctionner la plateforme
              et améliorer votre expérience. Voici exactement quels cookies nous utilisons,
              pourquoi, et comment gérer vos préférences.
            </p>
          </div>

          {/* Qu'est-ce qu'un cookie */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
              Qu&apos;est-ce qu&apos;un cookie ?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Un cookie est un petit fichier texte déposé sur votre appareil par un site web.
              Il permet au site de mémoriser des informations sur votre visite (préférences,
              session, etc.) pour faciliter votre prochaine visite et rendre le site plus utile.
              Les cookies ne peuvent pas accéder à d&apos;autres fichiers sur votre appareil
              et ne contiennent aucun virus.
            </p>
          </section>

          {/* Catégories */}
          <div className="space-y-10">
            {cookieCategories.map((category, i) => (
              <section key={i}>
                <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {category.name}
                  </h2>
                  {category.required ? (
                    <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">
                      Obligatoire
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2.5 py-1 rounded-full font-medium">
                      Optionnel
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {category.description}
                </p>

                {/* Table des cookies */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                          Nom
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                          Finalité
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                          Durée
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                          Fournisseur
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.cookies.map((cookie, j) => (
                        <tr
                          key={j}
                          className={`border-b border-gray-100 dark:border-gray-800/50 last:border-0 ${
                            j % 2 === 0 ? 'bg-white dark:bg-gray-950' : 'bg-gray-50/50 dark:bg-gray-900/30'
                          }`}
                        >
                          <td className="px-4 py-3 font-mono text-xs text-gray-800 dark:text-gray-200">
                            {cookie.name}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {cookie.purpose}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {cookie.duration}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {cookie.provider}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>

          {/* Gestion des préférences */}
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
              Gérer vos Préférences
            </h2>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                Vous pouvez gérer vos préférences de cookies de plusieurs façons :
              </p>
              <p>
                <strong className="text-gray-800 dark:text-gray-200">Via votre navigateur :</strong>{' '}
                La plupart des navigateurs vous permettent de refuser ou supprimer les cookies.
                Consultez l&apos;aide de votre navigateur pour les instructions spécifiques.
                Attention : désactiver certains cookies peut affecter le fonctionnement d&apos;AVA.
              </p>
              <p>
                <strong className="text-gray-800 dark:text-gray-200">Via nos paramètres :</strong>{' '}
                Un bandeau de gestion des cookies apparaît lors de votre première visite.
                Vous pouvez modifier vos préférences à tout moment depuis
                votre profil utilisateur (Paramètres → Cookies).
              </p>
              <p>
                <strong className="text-gray-800 dark:text-gray-200">Opt-out erreurs techniques :</strong>{' '}
                Pour Sentry :{' '}
                <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  sentry.io/privacy
                </a>
              </p>
            </div>
          </section>

          {/* Liens */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-muted-foreground mb-4">Voir aussi :</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Politique de confidentialité', href: '/privacy' },
                { label: 'Conditions d\'utilisation', href: '/terms' },
                { label: 'Mentions légales', href: '/legal' },
              ].map((link) => (
                <Button key={link.href} variant="outline" size="sm" className="rounded-full" asChild>
                  <Link href={link.href}>
                    {link.label}
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
