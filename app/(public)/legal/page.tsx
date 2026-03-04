/**
 * Mentions Légales — AVA Billetterie
 */

import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions Légales — AVA Billetterie',
  description:
    'Mentions légales d\'AVA Billetterie : éditeur, hébergeur, directeur de publication et informations légales de la société.',
};

export default function LegalPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-8">
            Mentions Légales
          </h1>

          <div className="space-y-10 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                1. Éditeur du Site
              </h2>
              <div className="space-y-2">
                <p><strong className="text-zinc-800 dark:text-zinc-200">Raison sociale :</strong> AVA SAS</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Forme juridique :</strong> Société par actions simplifiée (SAS)</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Capital social :</strong> [X] euros</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Siège social :</strong> [Adresse], [Code postal] Paris, France</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">SIRET :</strong> [XXX XXX XXX XXXXX]</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">RCS :</strong> Paris [Numéro RCS]</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Numéro TVA intracommunautaire :</strong> FR [Numéro TVA]</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Email :</strong>{' '}
                  <a href="mailto:contact@ava-billetterie.com" className="text-primary hover:underline">
                    contact@ava-billetterie.com
                  </a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                2. Directeur de la Publication
              </h2>
              <p>
                [Nom Prénom du Directeur de Publication], en qualité de [Fonction]
                de la société AVA SAS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                3. Hébergement
              </h2>
              <div className="space-y-2">
                <p><strong className="text-zinc-800 dark:text-zinc-200">Hébergeur principal :</strong> Vercel Inc.</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Adresse :</strong> 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Site web :</strong>{' '}
                  <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    vercel.com
                  </a>
                </p>
                <p className="mt-3"><strong className="text-zinc-800 dark:text-zinc-200">Base de données :</strong> Supabase Inc., infrastructure Europe (Frankfurt)</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Stockage fichiers :</strong> Uploadcare Inc., infrastructure Europe</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                4. Traitement des Paiements
              </h2>
              <div className="space-y-2">
                <p><strong className="text-zinc-800 dark:text-zinc-200">Prestataire de paiement :</strong> Stripe Payments Europe Limited</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Adresse :</strong> 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, D02 H210, Irlande</p>
                <p>
                  Stripe est un établissement de paiement agréé et supervisé par la Banque Centrale d&apos;Irlande.
                  Notre mécanisme de séquestre bancaire est géré via Stripe Connect, soumis aux réglementations européennes
                  sur les services de paiement (DSP2).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                5. Propriété Intellectuelle
              </h2>
              <p>
                L&apos;ensemble du contenu de ce site (textes, images, logos, code source, design) est la
                propriété exclusive d&apos;AVA SAS ou de ses partenaires et est protégé par les lois françaises
                et internationales relatives à la propriété intellectuelle.
              </p>
              <p className="mt-3">
                Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie
                des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite,
                sauf autorisation écrite préalable d&apos;AVA SAS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                6. Données Personnelles
              </h2>
              <p>
                Le traitement des données personnelles des utilisateurs est décrit dans notre{' '}
                <Link href="/privacy" className="text-primary hover:underline font-medium">
                  Politique de Confidentialité
                </Link>
                . Conformément au Règlement Général sur la Protection des Données (RGPD),
                vous disposez de droits sur vos données personnelles. Contactez notre DPO :
                privacy@ava-billetterie.com
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                7. Médiation
              </h2>
              <p>
                En cas de litige non résolu avec notre service client, vous pouvez recourir
                gratuitement à un médiateur de la consommation conformément aux articles L.616-1
                et R.616-1 du Code de la consommation.
              </p>
              <p className="mt-2">
                Plateforme européenne de règlement en ligne des litiges (RLL) :{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ec.europa.eu/consumers/odr
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                8. Crédits
              </h2>
              <div className="space-y-2">
                <p><strong className="text-zinc-800 dark:text-zinc-200">Conception & développement :</strong> Équipe AVA</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Framework :</strong> Next.js 14 (Vercel)</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Icônes :</strong> Lucide React</p>
                <p><strong className="text-zinc-800 dark:text-zinc-200">Composants UI :</strong> shadcn/ui (Radix UI)</p>
              </div>
            </section>
          </div>

          {/* Liens */}
          <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-muted-foreground mb-4">Voir aussi :</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Conditions d\'utilisation', href: '/terms' },
                { label: 'Politique de confidentialité', href: '/privacy' },
                { label: 'Politique cookies', href: '/cookies' },
                { label: 'Nous contacter', href: '/contact' },
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
