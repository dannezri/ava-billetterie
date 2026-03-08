/**
 * CGU — Conditions Générales d'Utilisation
 * AVA Billetterie
 */

import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation — AVA Billetterie',
  description:
    'Conditions générales d\'utilisation d\'AVA Billetterie. Règles d\'utilisation de la plateforme, droits et obligations des acheteurs et vendeurs.',
};

const lastUpdated = '1er janvier 2026';

const sections = [
  {
    title: '1. Présentation de la Plateforme',
    content: `AVA Billetterie (ci-après "AVA", "la Plateforme" ou "nous") est une plateforme de mise en relation entre vendeurs et acheteurs de billets de spectacle, concert, festival et événements culturels ou sportifs.

AVA est exploitée par [Société AVA SAS], société par actions simplifiée au capital de [X] euros, immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro [XXX XXX XXX], dont le siège social est situé [Adresse].

La Plateforme est accessible à l'adresse ava-billetterie.com. En accédant à la Plateforme et en l'utilisant, vous acceptez sans réserve les présentes Conditions Générales d'Utilisation (CGU).`,
  },
  {
    title: '2. Respect de la Loi Française — Anti-scalping',
    content: `AVA s'engage à respecter strictement les dispositions légales françaises relatives à la revente de billets, notamment :

• L'article L. 123-12 du Code de la consommation qui interdit la revente de billets à un prix supérieur au prix facial d'acquisition.
• La loi n° 2012-348 du 12 mars 2012 relative à l'organisation des manifestations sportives et culturelles.

En conséquence, sur AVA :
- Aucun billet ne peut être vendu à un prix supérieur au prix facial d'origine (imprimé sur le billet).
- Notre système vérifie automatiquement le prix facial lors de chaque mise en vente.
- Toute tentative de surtarification entraîne le rejet automatique de l'annonce et peut entraîner la suspension du compte.`,
  },
  {
    title: '3. Création de Compte et Conditions d\'Accès',
    content: `3.1 Conditions d'âge : Vous devez être âgé d'au moins 18 ans pour utiliser AVA.

3.2 Exactitude des informations : Vous vous engagez à fournir des informations exactes, complètes et à jour lors de votre inscription et à les maintenir actualisées.

3.3 Sécurité du compte : Vous êtes responsable de la confidentialité de vos identifiants. Toute activité effectuée depuis votre compte vous est imputable.

3.4 Un compte par personne : Il est interdit de créer plusieurs comptes. Tout contournement de suspension ou de bannissement est également interdit.`,
  },
  {
    title: '4. Règles pour les Vendeurs',
    content: `4.1 KYC obligatoire : Avant toute mise en vente, les vendeurs doivent compléter la vérification d'identité (KYC) via Stripe Identity. Cette vérification inclut la fourniture d'une pièce d'identité valide et d'un selfie.

4.2 Authenticité des billets : Le vendeur garantit que :
- Le billet est authentique et lui appartient légalement.
- Le billet n'a pas été vendu sur une autre plateforme simultanément.
- Le code-barres est intact, lisible et n'a pas été scanné.
- Le prix de vente ne dépasse pas le prix facial du billet.

4.3 Billets interdits : Sont interdits sur AVA les billets :
- Falsifiés ou contrefaits.
- Obtenus frauduleusement.
- Faisant l'objet de restrictions de revente explicites de l'organisateur (ex : billets nominatifs non transférables).

4.4 Sanctions : Tout manquement à ces règles peut entraîner : suppression de l'annonce, suspension temporaire, bannissement définitif, et/ou signalement aux autorités compétentes.`,
  },
  {
    title: '5. Mécanisme de Séquestre',
    content: `5.1 Principe : Lors de chaque achat, le montant payé par l'acheteur est placé en séquestre sur un compte Stripe Connect sécurisé. Ces fonds ne sont pas accessibles par AVA, le vendeur ou l'acheteur pendant la période de séquestre.

5.2 Durée du séquestre : Les fonds sont maintenus en séquestre pendant toute la durée entre la date d'achat et 48h après la date de l'événement.

5.3 Libération des fonds :
- Si aucun litige n'est ouvert dans les 48h suivant l'événement, les fonds sont automatiquement libérés en faveur du vendeur.
- En cas de litige validé, les fonds sont remboursés à l'acheteur.

5.4 Ce mécanisme est géré exclusivement via Stripe Connect et soumis aux conditions d'utilisation de Stripe.`,
  },
  {
    title: '6. Garantie Sérénité',
    content: `6.1 Principe : AVA offre une "Garantie Sérénité" à tous les acheteurs. Si un billet acheté sur AVA est refusé à l'entrée d'un événement pour l'une des raisons suivantes, l'acheteur est remboursé intégralement du montant payé + 50€ de dédommagement :
- Billet invalide ou faux.
- Code-barres déjà scanné (doublon).
- Événement définitivement annulé (sans report).
- Billet ne correspondant pas à l'événement indiqué.

6.2 Activation : L'acheteur doit activer la garantie via l'application AVA ("SOS Concert") dans les 48h suivant l'événement, en fournissant une preuve du problème (photo du refus, email de l'organisateur, etc.).

6.3 Exclusions : La Garantie Sérénité ne couvre pas : les billets perdus par l'acheteur, l'impossibilité de se rendre à l'événement pour des raisons personnelles, les événements reportés (uniquement annulés définitivement).`,
  },
  {
    title: '7. Frais et Tarification',
    content: `7.1 Frais acheteur : AVA perçoit des frais de service de 5% du prix du billet à la charge de l'acheteur. Ces frais sont clairement affichés avant toute validation d'achat.

7.2 Frais vendeur : Les vendeurs ne paient aucun frais de mise en vente, de commission ni de retrait. La mise en vente et le retrait des fonds sont gratuits.

7.3 Transparence : Aucun frais caché ne sera appliqué en dehors des 5% mentionnés ci-dessus.

7.4 Modification des frais : AVA se réserve le droit de modifier ses frais. Toute modification sera communiquée avec un préavis de 30 jours.`,
  },
  {
    title: '8. Propriété Intellectuelle',
    content: `Le contenu de la Plateforme (textes, graphiques, logos, code source, etc.) est protégé par les droits de propriété intellectuelle d'AVA ou de ses partenaires. Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est strictement interdite.`,
  },
  {
    title: '9. Limitation de Responsabilité',
    content: `AVA est une plateforme de mise en relation. À ce titre :
- AVA n'est pas vendeur des billets (les vendeurs sont des particuliers).
- AVA ne garantit pas la qualité des événements eux-mêmes (son, organisation, etc.).
- AVA ne peut être tenu responsable en cas de force majeure (annulation par l'organisateur, catastrophe naturelle, etc.), dans la limite des obligations légales.

En revanche, AVA garantit :
- La sécurité des transactions via le mécanisme de séquestre.
- La Garantie Sérénité telle que décrite à l'article 6.
- La réactivité du support en cas de problème.`,
  },
  {
    title: '10. Données Personnelles',
    content: `Le traitement de vos données personnelles est régi par notre Politique de Confidentialité, accessible à l'adresse ava-billetterie.com/privacy. En utilisant AVA, vous consentez à ce traitement conformément à cette politique.`,
  },
  {
    title: '11. Modification des CGU',
    content: `AVA se réserve le droit de modifier les présentes CGU. Les utilisateurs seront informés de toute modification substantielle par email et/ou notification sur la Plateforme. La poursuite de l'utilisation de la Plateforme après modification vaut acceptation des nouvelles CGU.`,
  },
  {
    title: '12. Droit Applicable et Litiges',
    content: `Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut d'accord amiable, tout litige sera soumis aux tribunaux compétents de Paris.

Conformément aux articles L.612-1 et suivants du Code de la consommation, vous pouvez recourir gratuitement au médiateur de la consommation agréé : [Médiateur].`,
  },
];

export default function TermsPage() {
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
              Conditions Générales d&apos;Utilisation
            </h1>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Ces conditions régissent l&apos;utilisation de la plateforme AVA Billetterie.
              Nous avons fait notre possible pour les rédiger de façon claire et honnête.
              Pour toute question, contactez-nous.
            </p>
          </div>

          {/* Navigation rapide */}
          <div className="mb-10 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Navigation rapide
            </p>
            <ul className="space-y-1">
              {sections.map((section, i) => (
                <li key={i}>
                  <a
                    href={`#section-${i}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section, i) => (
              <div key={i} id={`section-${i}`} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                  {section.title}
                </h2>
                <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Liens vers autres pages légales */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-muted-foreground mb-4">Voir aussi :</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Politique de confidentialité', href: '/privacy' },
                { label: 'Mentions légales', href: '/legal' },
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
