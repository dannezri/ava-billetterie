# 💳 Stripe Connect - README

> **Implémentation complète de Stripe Connect Custom Accounts pour la plateforme Ava**

---

## 🎯 Qu'est-ce que c'est ?

Stripe Connect permet à notre plateforme de :
- ✅ Créer des **comptes vendeurs** (Custom Accounts)
- ✅ Gérer des **paiements en séquestre** (escrow)
- ✅ Transférer automatiquement les fonds aux vendeurs
- ✅ Prélever des **frais de plateforme** (15%)

---

## 📚 Documentation Disponible

| Document | Description | Temps | Audience |
|----------|-------------|-------|----------|
| **[STRIPE_CONNECT_QUICK_START.md](./STRIPE_CONNECT_QUICK_START.md)** | ⚡ Démarrer en 5 minutes | 5 min | Développeurs |
| **[STRIPE_CONNECT_SETUP.md](./STRIPE_CONNECT_SETUP.md)** | 📘 Guide complet | 30 min | Développeurs, DevOps |
| **[STRIPE_CONNECT_FEATURES.md](./STRIPE_CONNECT_FEATURES.md)** | 🎯 Liste des fonctionnalités | 10 min | Product, Développeurs |
| **[STRIPE_CONNECT_COMMANDS.md](./STRIPE_CONNECT_COMMANDS.md)** | 🚀 Commandes rapides | 5 min | Développeurs |
| **[STRIPE_CONNECT_DONE.md](./STRIPE_CONNECT_DONE.md)** | ✅ Ce qui a été fait | 5 min | Tous |
| **[STRIPE_CONNECT_IMPLEMENTATION_SUMMARY.md](./STRIPE_CONNECT_IMPLEMENTATION_SUMMARY.md)** | 📊 Résumé technique | 15 min | Tous |

---

## 🚀 Quick Start (5 minutes)

### 1. Configuration

```bash
# Ajouter dans .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Lancer le serveur

```bash
# Terminal 1 - Next.js
npm run dev

# Terminal 2 - Webhooks Stripe
npm run stripe:listen
```

### 3. Tester

```bash
# Tests automatiques
npm run stripe:test

# Déclencher webhooks
npm run stripe:webhooks
```

---

## 📦 Ce qui a été créé

### Services Backend

✅ **Service Stripe Connect** (`src/services/stripe-connect/`)
- Création de comptes Custom Accounts
- Génération de liens d'onboarding
- Vérification du statut
- Gestion des payouts
- Accès au dashboard

### API Routes

✅ **4 routes API** :
- `POST /api/stripe-connect/create-account`
- `POST /api/stripe-connect/onboarding-link`
- `GET /api/stripe-connect/account-status`
- `POST /api/stripe-connect/dashboard-link`

### Webhooks

✅ **11 événements gérés** :
- Paiements : `payment_intent.*`, `charge.*`
- Transferts : `transfer.*`, `payout.*`
- Comptes : `account.*`, `capability.*`
- KYC : `identity.verification_session.*`

### Composants React

✅ **Composant UI** :
- `<SellerOnboarding />` - Interface vendeur complète

✅ **Hook personnalisé** :
- `useStripeConnect()` - Gestion du compte Connect

### Pages

✅ **3 pages Next.js** :
- `/seller/onboarding` - Page principale
- `/seller/onboarding/complete` - Confirmation
- `/seller/onboarding/refresh` - Rafraîchissement

### Scripts & Outils

✅ **Script de test** :
- `scripts/test-stripe-connect.sh` - 9 commandes disponibles

✅ **Scripts NPM** :
- `npm run stripe:listen` - Écouter webhooks
- `npm run stripe:test` - Tests complets
- `npm run stripe:webhooks` - Déclencher webhooks

---

## 🎨 Utilisation dans le Code

### Composant prêt à l'emploi

```tsx
import { SellerOnboarding } from '@/components/stripe-connect';

export default function SellerPage() {
  return (
    <div>
      <h1>Devenir Vendeur</h1>
      <SellerOnboarding />
    </div>
  );
}
```

### Hook personnalisé

```tsx
import { useStripeConnect } from '@/hooks/use-stripe-connect';

export default function MyComponent() {
  const {
    accountStatus,
    loading,
    error,
    isAccountReady,
    createOnboardingLink,
    openDashboard,
  } = useStripeConnect();

  if (!isAccountReady) {
    return (
      <button onClick={async () => {
        const url = await createOnboardingLink();
        window.location.href = url;
      }}>
        Configurer mon compte vendeur
      </button>
    );
  }

  return <p>✅ Vous pouvez vendre des billets !</p>;
}
```

### Service Backend

```typescript
import {
  createConnectAccount,
  getAccountStatus,
  isAccountReadyForPayments,
} from '@/services/stripe-connect';

// Créer un compte
const accountId = await createConnectAccount({
  userId: user.id,
  email: user.email,
  country: 'FR',
});

// Vérifier le statut
const status = await getAccountStatus(accountId);

// Vérifier si prêt
const isReady = await isAccountReadyForPayments(accountId);
```

---

## 🔄 Workflow Complet

```
┌─────────────────────────────────────────────────────────┐
│                 WORKFLOW STRIPE CONNECT                  │
└─────────────────────────────────────────────────────────┘

1. Vendeur → /seller/onboarding
   ↓
2. POST /api/stripe-connect/create-account
   → stripe.accounts.create(type: 'custom')
   → DB: users.stripe_account_id = acct_xxx
   ↓
3. POST /api/stripe-connect/onboarding-link
   → Redirect to Stripe Connect UI
   → User complète: KYC, IBAN, etc.
   ↓
4. Webhook: account.updated
   → DB: Audit log
   → Email: "✅ Compte vérifié"
   ↓
5. Vendeur liste des billets
   ↓
6. Acheteur achète → Payment Intent (séquestre)
   → Webhook: payment_intent.succeeded
   → DB: transaction.status = 'ESCROWED'
   ↓
7. J+2 après événement → Cron Job
   → stripe.transfers.create(destination: seller_account_id)
   → Webhook: transfer.created
   → DB: transaction.status = 'RELEASED'
   ↓
8. Stripe → Payout automatique vers IBAN
   → Webhook: payout.paid
   → Email: "💰 Paiement reçu"
```

---

## ✅ Checklist

### Local (Développement) ✅

- [x] Service Stripe Connect créé
- [x] Routes API configurées
- [x] Webhooks étendus
- [x] Composants React créés
- [x] Hooks personnalisés créés
- [x] Pages d'onboarding créées
- [x] Scripts de test créés
- [x] Documentation complète

### Production (À faire)

- [ ] Dashboard Stripe en mode **live**
- [ ] Stripe Connect activé (Custom Accounts)
- [ ] Webhooks production configurés
- [ ] Variables d'environnement Vercel
- [ ] Tests de bout en bout
- [ ] Monitoring actif
- [ ] Emails transactionnels

---

## 🧪 Tests

### Tests Automatiques

```bash
# Tous les tests
npm run stripe:test

# Déclencher webhooks
npm run stripe:webhooks
```

### Tests Manuels

```bash
# 1. Créer un compte
curl -X POST http://localhost:3000/api/stripe-connect/create-account \
  -H "Content-Type: application/json" \
  -d '{"country":"FR"}'

# 2. Générer lien onboarding
curl -X POST http://localhost:3000/api/stripe-connect/onboarding-link

# 3. Vérifier statut
curl http://localhost:3000/api/stripe-connect/account-status

# 4. Dashboard
curl -X POST http://localhost:3000/api/stripe-connect/dashboard-link
```

### Webhooks

```bash
# Déclencher événements
stripe trigger account.updated
stripe trigger payment_intent.succeeded
stripe trigger transfer.created
stripe trigger payout.paid
```

---

## 🐛 Troubleshooting

### ❌ "Webhook signature verification failed"

**Solution :**
1. Copier le `whsec_xxx` du terminal Stripe CLI
2. Ajouter dans `.env.local` : `STRIPE_WEBHOOK_SECRET=whsec_xxx`
3. Redémarrer : `npm run dev`

### ❌ "No such account"

**Solution :**
- Vérifier que les clés sont en mode **test** (`pk_test_`, `sk_test_`)
- Vérifier le mode dans le dashboard Stripe

### ❌ Compte non trouvé en DB

**Solution :**
```bash
npx prisma studio
# Vérifier la colonne stripe_account_id dans users
```

---

## 📊 Monitoring

### Logs à surveiller

✅ **Succès**
```
✅ Stripe Connect account created: acct_xxx
💰 Payment succeeded: pi_xxx
💸 Transfer created: tr_xxx
💰 Payout paid: po_xxx
```

⚠️ **Avertissements**
```
⚠️ Account has requirements: [...]
⚠️ Identity requires input
⚠️ Capability not active: pending
```

❌ **Erreurs**
```
❌ Webhook signature verification failed
❌ Transfer failed: tr_xxx
❌ Payout failed: po_xxx
```

---

## 🎯 Prochaines Étapes

### Phase 2 : Intégration (En cours)

- [ ] Job cron libération séquestre
- [ ] Emails transactionnels (Resend)
- [ ] Dashboard vendeur (historique)
- [ ] Tests end-to-end

### Phase 3 : Production

- [ ] Configuration Stripe live
- [ ] Webhooks production
- [ ] Monitoring & alertes
- [ ] Documentation utilisateur

---

## 📞 Support

### Documentation

1. **Quick Start** : [STRIPE_CONNECT_QUICK_START.md](./STRIPE_CONNECT_QUICK_START.md)
2. **Guide Complet** : [STRIPE_CONNECT_SETUP.md](./STRIPE_CONNECT_SETUP.md)
3. **FAQ** : [STRIPE_CONNECT_SETUP.md](./STRIPE_CONNECT_SETUP.md#faq--troubleshooting)

### Ressources Externes

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Custom Accounts Guide](https://stripe.com/docs/connect/custom-accounts)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)

---

## 🎉 Conclusion

L'implémentation de Stripe Connect est **complète et prête à être testée** !

### Pour démarrer :

1. **Lire** : [STRIPE_CONNECT_QUICK_START.md](./STRIPE_CONNECT_QUICK_START.md)
2. **Configurer** : Variables d'environnement
3. **Tester** : `npm run stripe:test`
4. **Développer** : Intégrer dans votre flow

---

**Implémentation réalisée le 15 février 2026**

**Développé pour Ava Ticketing Platform** 🎫
