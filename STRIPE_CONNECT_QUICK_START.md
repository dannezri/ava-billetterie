# 🚀 Quick Start - Stripe Connect

Guide rapide pour démarrer avec Stripe Connect en 5 minutes.

## ⚡ Setup Rapide

### 1. Variables d'environnement

Ajouter dans `.env.local` :

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Lancer le serveur et Stripe CLI

**Terminal 1 - Next.js :**
```bash
npm run dev
```

**Terminal 2 - Stripe Webhooks :**
```bash
npm run stripe:listen
```

> ⚠️ Copier le `whsec_xxx` dans `.env.local` puis redémarrer le serveur

---

## 🧪 Tests Rapides

### Test complet automatique
```bash
npm run stripe:test
```

### Tester les webhooks
```bash
npm run stripe:webhooks
```

### Tester manuellement

**1. Créer un compte :**
```bash
curl -X POST http://localhost:3000/api/stripe-connect/create-account \
  -H "Content-Type: application/json" \
  -d '{"country":"FR"}'
```

**2. Générer un lien d'onboarding :**
```bash
curl -X POST http://localhost:3000/api/stripe-connect/onboarding-link
```

**3. Vérifier le statut :**
```bash
curl http://localhost:3000/api/stripe-connect/account-status
```

---

## 🎨 Utilisation dans React

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
    checkAccountStatus,
    createOnboardingLink,
    openDashboard,
    isAccountReady,
  } = useStripeConnect();

  return (
    <div>
      {isAccountReady ? (
        <p>✅ Vous pouvez vendre !</p>
      ) : (
        <button onClick={async () => {
          const url = await createOnboardingLink();
          window.location.href = url;
        }}>
          Configurer mon compte
        </button>
      )}
    </div>
  );
}
```

---

## 📡 API Routes

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/stripe-connect/create-account` | POST | Créer un compte Connect |
| `/api/stripe-connect/onboarding-link` | POST | Lien d'onboarding |
| `/api/stripe-connect/account-status` | GET | Statut du compte |
| `/api/stripe-connect/dashboard-link` | POST | Lien dashboard |

---

## 🔍 Webhooks Importants

| Événement | Quand | Action |
|-----------|-------|--------|
| `account.updated` | Compte modifié | ✅ Log + notification |
| `payment_intent.succeeded` | Paiement OK | 💰 Créer transaction |
| `transfer.created` | Séquestre libéré | 💸 Payer le vendeur |

---

## ✅ Checklist

- [ ] Stripe CLI installé (`brew install stripe/stripe-cli/stripe`)
- [ ] Variables d'environnement configurées
- [ ] Serveur Next.js démarré (`npm run dev`)
- [ ] Webhooks locaux actifs (`npm run stripe:listen`)
- [ ] Tests passés (`npm run stripe:test`)

---

## 🐛 Problèmes Courants

### ❌ Webhook signature failed
```bash
# Copier le secret du terminal Stripe CLI dans .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Redémarrer le serveur
npm run dev
```

### ❌ Compte non trouvé
```bash
# Vérifier la base de données
npx prisma studio

# Vérifier la table users, colonne stripe_account_id
```

### ❌ Tests échouent
```bash
# Vérifier que le serveur est lancé
curl http://localhost:3000/api/health

# Si erreur 404, lancer le serveur
npm run dev
```

---

## 📚 Documentation Complète

Pour plus de détails, voir : [STRIPE_CONNECT_SETUP.md](./STRIPE_CONNECT_SETUP.md)

---

**Développé pour Ava Ticketing Platform** 🎫
