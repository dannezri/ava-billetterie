/**
 * Page d'onboarding vendeur Stripe Connect
 */

import { SellerOnboarding } from '@/components/stripe-connect';

export default function SellerOnboardingPage() {
  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Devenir Vendeur</h1>
        <p className="text-muted-foreground mt-2">
          Configurez votre compte pour commencer à vendre des billets sur Ava
        </p>
      </div>

      <SellerOnboarding />

      <div className="mt-8 rounded-lg border bg-muted/50 p-6">
        <h2 className="text-lg font-semibold mb-4">Pourquoi devenir vendeur ?</h2>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start">
            <span className="mr-2">✅</span>
            <span>
              <strong>Paiements sécurisés :</strong> Vos fonds sont protégés jusqu&apos;à ce que
              l&apos;acheteur assiste à l&apos;événement
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">💰</span>
            <span>
              <strong>Commission transparente :</strong> 15% de frais de plateforme, aucun frais
              caché
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🚀</span>
            <span>
              <strong>Vente rapide :</strong> Listez vos billets en quelques clics et touchez des
              milliers d&apos;acheteurs
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">🔒</span>
            <span>
              <strong>Protection anti-fraude :</strong> Vérification des billets et système de
              litige intégré
            </span>
          </li>
        </ul>
      </div>

      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">ℹ️ Bon à savoir</h3>
        <p className="text-sm text-blue-800">
          Une fois votre compte configuré, vos fonds seront versés 2 jours après chaque événement,
          sauf en cas de litige. Vous pouvez suivre vos paiements dans le dashboard Stripe Express.
        </p>
      </div>
    </div>
  );
}
