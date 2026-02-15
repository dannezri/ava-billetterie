# Stripe Connect Service

Service de gestion des comptes Stripe Connect pour les vendeurs.

## 📦 Fonctionnalités

- ✅ Création de comptes Custom Accounts
- ✅ Génération de liens d'onboarding
- ✅ Vérification du statut des comptes
- ✅ Gestion des payouts
- ✅ Accès au dashboard Express
- ✅ Gestion des comptes bancaires externes

## 🔧 Utilisation

### Créer un compte Connect

```typescript
import { createConnectAccount } from '@/services/stripe-connect';

const accountId = await createConnectAccount({
  userId: 'user_123',
  email: 'seller@example.com',
  country: 'FR',
  businessType: 'individual',
});
```

### Générer un lien d'onboarding

```typescript
import { createAccountOnboardingLink } from '@/services/stripe-connect';

const result = await createAccountOnboardingLink(
  accountId,
  'http://localhost:3000/seller/onboarding/refresh',
  'http://localhost:3000/seller/onboarding/complete'
);

console.log(result.onboardingUrl);
// https://connect.stripe.com/setup/...
```

### Vérifier le statut

```typescript
import { getAccountStatus, isAccountReadyForPayments } from '@/services/stripe-connect';

const status = await getAccountStatus(accountId);
console.log(status.chargesEnabled); // true/false
console.log(status.payoutsEnabled); // true/false

const isReady = await isAccountReadyForPayments(accountId);
// true si le compte peut recevoir des paiements
```

### Récupérer le compte d'un utilisateur

```typescript
import { getUserConnectAccountId } from '@/services/stripe-connect';

const accountId = await getUserConnectAccountId('user_123');
```

### Créer un payout

```typescript
import { createPayout } from '@/services/stripe-connect';

const payout = await createPayout(
  accountId,
  10000, // 100.00 EUR en centimes
  'eur',
  { transaction_id: 'txn_123' }
);
```

## 🎯 Workflow complet

```typescript
// 1. Créer le compte
const accountId = await createConnectAccount({
  userId: user.id,
  email: user.email,
  country: 'FR',
  businessType: 'individual',
});

// 2. Générer le lien d'onboarding
const { onboardingUrl } = await createAccountOnboardingLink(
  accountId,
  refreshUrl,
  returnUrl
);

// 3. Rediriger l'utilisateur
window.location.href = onboardingUrl;

// 4. Après retour, vérifier le statut
const isReady = await isAccountReadyForPayments(accountId);

if (isReady) {
  // L'utilisateur peut maintenant vendre des billets
}
```

## 📊 Statut du compte

Le statut d'un compte Connect est déterminé par plusieurs critères :

- **chargesEnabled** : Le compte peut recevoir des paiements
- **payoutsEnabled** : Le compte peut recevoir des payouts
- **detailsSubmitted** : Le profil est complet
- **requirements.currentlyDue** : Documents requis immédiatement
- **requirements.pastDue** : Documents en retard
- **capabilities** : Capacités actives (card_payments, transfers)

## 🔐 Sécurité

- Les comptes sont créés en mode **Custom** pour un contrôle total
- Les payouts sont en mode **manual** pour gérer le séquestre
- Chaque compte est lié à un utilisateur via `metadata.user_id`
- Les audits logs sont créés automatiquement

## 🧪 Tests

```bash
# Tester la création d'un compte
npm run stripe:test

# Écouter les webhooks
npm run stripe:listen

# Déclencher des événements de test
stripe trigger account.updated
stripe trigger transfer.created
```

## 📚 Références

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Custom Accounts](https://stripe.com/docs/connect/custom-accounts)
- [Account Capabilities](https://stripe.com/docs/connect/account-capabilities)
