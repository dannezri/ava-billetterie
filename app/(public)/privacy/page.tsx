/**
 * Politique de Confidentialité — AVA Billetterie
 * Traitement des données personnelles, RGPD
 */

import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — AVA Billetterie',
  description:
    'Comment AVA Billetterie collecte, utilise et protège vos données personnelles. Conformité RGPD, droits des utilisateurs, politique de conservation.',
};

const lastUpdated = '1er janvier 2026';

const sections = [
  {
    title: '1. Responsable du Traitement',
    content: `Le responsable du traitement de vos données personnelles est :

AVA SAS
[Adresse complète]
[Code postal] Paris, France
Email : privacy@ava-billetterie.com
SIRET : [Numéro SIRET]

Pour toute question relative à vos données personnelles, contactez notre Délégué à la Protection des Données (DPO) : dpo@ava-billetterie.com`,
  },
  {
    title: '2. Données Collectées',
    content: `Nous collectons uniquement les données nécessaires au fonctionnement de la plateforme :

2.1 Données d'identification :
• Nom, prénom, adresse email (lors de l'inscription)
• Numéro de téléphone (optionnel, pour les alertes)
• Date de naissance (vérification majeur)

2.2 Données de vérification KYC (vendeurs uniquement) :
• Copie de pièce d'identité (passeport, carte nationale d'identité)
• Selfie de vérification
• Ces données sont traitées exclusivement par Stripe Identity et ne sont pas stockées sur nos serveurs.

2.3 Données de transaction :
• Historique des achats et ventes
• Montants des transactions
• Informations de paiement (gérées par Stripe, nous ne stockons pas de numéros de carte)

2.4 Données techniques :
• Adresse IP, type de navigateur, pages visitées
• Cookies (voir notre Politique de Cookies)

2.5 Données de communication :
• Messages échangés avec notre support
• Preuves fournies dans le cadre de litiges`,
  },
  {
    title: '3. Finalités et Bases Légales du Traitement',
    content: `3.1 Exécution du contrat (article 6.1.b RGPD) :
• Gestion de votre compte utilisateur
• Traitement des transactions et du séquestre
• Vérification KYC des vendeurs
• Gestion des litiges et de la Garantie Sérénité

3.2 Obligations légales (article 6.1.c RGPD) :
• Lutte contre la fraude et le blanchiment d'argent
• Conservation des données comptables (10 ans)
• Conformité DSP2 et réglementations bancaires

3.3 Intérêts légitimes (article 6.1.f RGPD) :
• Amélioration de la plateforme et de l'expérience utilisateur
• Prévention de la fraude
• Sécurité de la plateforme

3.4 Consentement (article 6.1.a RGPD) :
• Envoi de newsletters et communications marketing (opt-in)
• Utilisation de cookies non-essentiels`,
  },
  {
    title: '4. Durées de Conservation',
    content: `Vos données sont conservées pour les durées suivantes :

• Données de compte actif : pendant la durée d'utilisation du compte + 3 ans après la dernière connexion
• Données de transactions : 10 ans (obligation légale comptable)
• Données KYC : selon les exigences de Stripe Identity (généralement 5 ans)
• Logs de connexion : 12 mois
• Messages de support : 3 ans après la résolution du ticket
• Données de cookies : voir notre Politique de Cookies

Après expiration, vos données sont supprimées ou anonymisées.`,
  },
  {
    title: '5. Destinataires des Données',
    content: `Vos données peuvent être partagées avec :

5.1 Prestataires techniques indispensables :
• Stripe (paiement, séquestre, KYC) — siège USA, certifié Privacy Shield
• Supabase (base de données) — infrastructure UE
• Vercel (hébergement) — infrastructure UE et USA
• Uploadcare (stockage de fichiers) — infrastructure UE
• Sentry (monitoring technique) — infrastructure USA

5.2 Autorités légales :
En cas d'obligation légale, réquisition judiciaire ou lutte contre la fraude.

5.3 Nouveaux propriétaires en cas de cession :
En cas de fusion, acquisition ou cession d'actifs, avec information préalable des utilisateurs.

Nous ne vendons jamais vos données à des tiers.`,
  },
  {
    title: '6. Vos Droits (RGPD)',
    content: `Conformément au RGPD, vous disposez des droits suivants :

• Droit d'accès : obtenir une copie de toutes vos données personnelles
• Droit de rectification : corriger des données inexactes
• Droit à l'effacement ("droit à l'oubli") : demander la suppression de vos données (sous conditions légales)
• Droit à la limitation du traitement : restreindre l'utilisation de vos données
• Droit à la portabilité : recevoir vos données dans un format structuré
• Droit d'opposition : vous opposer au traitement pour intérêts légitimes ou marketing direct
• Droit de retirer votre consentement : à tout moment, sans affecter la licéité du traitement antérieur

Pour exercer ces droits, contactez : privacy@ava-billetterie.com

Délai de réponse : 30 jours maximum (prorogeable à 3 mois pour les demandes complexes).

Si vous estimez que le traitement de vos données viole le RGPD, vous pouvez déposer une réclamation auprès de la CNIL : cnil.fr`,
  },
  {
    title: '7. Sécurité des Données',
    content: `Nous mettons en œuvre des mesures techniques et organisationnelles appropriées :

• Chiffrement des données en transit (TLS 1.3) et au repos (AES-256)
• Accès aux données restreint au personnel autorisé (principe du moindre privilège)
• Authentification forte obligatoire pour les accès internes
• Audits de sécurité réguliers
• Plan de réponse aux incidents de sécurité
• Hébergement en centres de données certifiés ISO 27001

En cas de violation de données personnelles susceptible d'engendrer un risque pour vos droits et libertés, nous vous en informerons dans les 72h.`,
  },
  {
    title: '8. Transferts Hors UE',
    content: `Certains de nos prestataires (Stripe, Vercel, Sentry) ont leurs sièges aux États-Unis. Ces transferts sont encadrés par :
• Les Clauses Contractuelles Types (CCT) de la Commission européenne
• L'adhésion au Data Privacy Framework UE-États-Unis

Nous vérifions régulièrement la conformité de nos prestataires.`,
  },
  {
    title: '9. Cookies',
    content: `Notre utilisation des cookies est détaillée dans notre Politique de Cookies, accessible à l'adresse ava-billetterie.com/cookies.

En résumé : nous utilisons des cookies strictement nécessaires au fonctionnement (pas de consentement requis) et des cookies analytiques (avec votre consentement).`,
  },
  {
    title: '10. Modifications de la Politique',
    content: `Toute modification substantielle de cette politique vous sera notifiée par email et/ou par notification sur la plateforme, avec un préavis de 30 jours. La version en vigueur est toujours accessible à l'adresse ava-billetterie.com/privacy.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">
                Dernière mise à jour : {lastUpdated}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Chez AVA, nous prenons la protection de vos données au sérieux.
              Cette politique explique clairement quelles données nous collectons,
              pourquoi, et comment vous pouvez exercer vos droits RGPD.
            </p>

            {/* Résumé rapide */}
            <div className="mt-6 p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
                En résumé (mais lisez la version complète)
              </p>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                {[
                  'Nous collectons uniquement ce qui est nécessaire au service',
                  'Nous ne vendons jamais vos données',
                  'Les données de paiement sont gérées par Stripe (nous n\'avons pas accès)',
                  'Le KYC est traité par Stripe Identity (pas stocké chez nous)',
                  'Vous pouvez demander la suppression de vos données à tout moment',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
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

          {/* Contact DPO */}
          <div className="mt-12 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Contacter notre DPO
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Pour toute question ou exercice de vos droits RGPD :
            </p>
            <a
              href="mailto:privacy@ava-billetterie.com"
              className="text-primary hover:underline text-sm font-medium"
            >
              privacy@ava-billetterie.com
            </a>
          </div>

          {/* Liens */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-muted-foreground mb-4">Voir aussi :</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Conditions d\'utilisation', href: '/terms' },
                { label: 'Mentions légales', href: '/legal' },
                { label: 'Politique cookies', href: '/cookies' },
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
