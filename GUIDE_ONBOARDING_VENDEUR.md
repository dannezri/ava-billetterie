# 🚀 Guide Rapide - Onboarding Vendeur

Guide d'utilisation pour les développeurs et product managers.

---

## 📍 Navigation

### Pages disponibles

| URL | Description | Protection |
|-----|-------------|------------|
| `/seller/onboarding` | Page principale d'onboarding | 🔓 Public (auth requise) |
| `/seller/onboarding/complete` | Confirmation après onboarding | 🔓 Public |
| `/seller/onboarding/refresh` | Rafraîchissement lien expiré | 🔓 Public |
| `/seller/dashboard` | Dashboard vendeur | 🔒 Compte actif requis |

---

## 💻 Utilisation pour les développeurs

### 1. Utiliser le composant d'onboarding

```tsx
import { SellerOnboarding } from '@/components/stripe-connect';

export default function MyPage() {
  return (
    <div>
      <h1>Devenir Vendeur</h1>
      <SellerOnboarding />
    </div>
  );
}
```

### 2. Protéger une route vendeur

```tsx
import { SellerProtection } from '@/components/auth';

export default function SellerOnlyPage() {
  return (
    <SellerProtection>
      {/* Contenu accessible uniquement aux vendeurs actifs */}
      <YourContent />
    </SellerProtection>
  );
}
```

### 3. Utiliser le hook personnalisé

```tsx
import { useStripeConnect } from '@/hooks/use-stripe-connect';

export default function MyComponent() {
  const {
    accountStatus,
    loading,
    isAccountReady,
    checkAccountStatus,
    createOnboardingLink,
    openDashboard,
  } = useStripeConnect();

  useEffect(() => {
    checkAccountStatus();
  }, []);

  if (loading) return <div>Chargement...</div>;

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

### 4. Afficher le flow d'onboarding

```tsx
import { OnboardingFlow } from '@/components/stripe-connect';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  return <OnboardingFlow currentStep={currentStep} />;
}
```

---

## 🔌 API Routes

### Créer un lien d'onboarding

```typescript
// POST /api/stripe-connect/onboarding-link
const response = await fetch('/api/stripe-connect/onboarding-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
// { success: true, accountId: "acct_...", onboardingUrl: "https://..." }
```

### Vérifier le statut du compte

```typescript
// GET /api/stripe-connect/account-status
const response = await fetch('/api/stripe-connect/account-status');

const data = await response.json();
// {
//   success: true,
//   hasAccount: true,
//   chargesEnabled: true,
//   payoutsEnabled: true,
//   detailsSubmitted: true,
//   requirements: { ... }
// }
```

### Ouvrir le dashboard Stripe

```typescript
// POST /api/stripe-connect/dashboard-link
const response = await fetch('/api/stripe-connect/dashboard-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
window.open(data.url, '_blank');
```

---

## 🎨 Personnalisation UI

### Badges de statut

Le composant `SellerOnboarding` affiche automatiquement des badges :

- 🔵 **Non configuré** : Aucun compte Stripe Connect
- 🟡 **En attente** : Compte créé mais incomplet
- 🟢 **Actif** : Compte prêt à recevoir des paiements
- 🔴 **Action requise** : Documents manquants

### États du composant

```tsx
// État de chargement
<Loader2 className="animate-spin" />

// Compte non configuré
<Alert>Configuration requise</Alert>

// Compte incomplet
<Alert>Documents manquants</Alert>

// Compte actif
<Alert variant="success">Compte actif !</Alert>
```

---

## 🧪 Tests locaux

### 1. Configuration

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Copier les clés dans .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Lancer le serveur

```bash
# Terminal 1 - Next.js
npm run dev

# Terminal 2 - Webhooks Stripe
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

### 3. Tester l'onboarding

1. Aller sur `http://localhost:3000/seller/onboarding`
2. Cliquer sur "Commencer la configuration"
3. Remplir le formulaire Stripe (mode test)
4. Vérifier la redirection vers `/seller/onboarding/complete`
5. Accéder au dashboard `/seller/dashboard`

### 4. Données de test Stripe

```
Email: test@example.com
Téléphone: +33612345678
DOB: 01/01/1990
SSN: 000-00-0000 (US) ou equivalent
IBAN: FR1420041010050500013M02606 (France)
```

---

## 🔧 Dépannage

### Erreur : "Non authentifié"

```bash
# Vérifier l'authentification Supabase
# Se connecter avant d'accéder aux routes vendeur
```

### Erreur : "Compte non trouvé"

```bash
# Le compte sera créé automatiquement lors de la première demande d'onboarding
# Cliquer sur "Commencer la configuration"
```

### Erreur : "Webhook signature failed"

```bash
# Copier le whsec_xxx depuis le terminal Stripe CLI
# Mettre à jour STRIPE_WEBHOOK_SECRET dans .env.local
# Redémarrer le serveur
```

### Lien d'onboarding expiré

```bash
# L'utilisateur sera redirigé automatiquement vers /seller/onboarding/refresh
# Un nouveau lien sera généré
```

---

## 📊 Analytics & Monitoring

### Événements à tracker

```typescript
// Début d'onboarding
analytics.track('seller_onboarding_started', {
  userId: user.id,
  email: user.email,
});

// Onboarding complété
analytics.track('seller_onboarding_completed', {
  userId: user.id,
  accountId: account.id,
});

// Dashboard ouvert
analytics.track('seller_dashboard_opened', {
  userId: user.id,
});
```

### Logs importants

```typescript
// Service Stripe Connect
console.log('✅ Account token created:', tokenId);
console.log('✅ Stripe Connect account created:', accountId);
console.log('✅ Payout created:', payoutId);

// Erreurs
console.error('❌ Error creating account:', error);
```

---

## 🚦 États du compte vendeur

| État | `chargesEnabled` | `payoutsEnabled` | `detailsSubmitted` | Action |
|------|------------------|------------------|--------------------|--------|
| **Non configuré** | ❌ | ❌ | ❌ | Créer compte |
| **En configuration** | ❌ | ❌ | ❌ | Compléter onboarding |
| **Incomplet** | ✅ | ❌ | ❌ | Ajouter infos |
| **Actif** | ✅ | ✅ | ✅ | ✅ Peut vendre |

---

## 📞 Support

### Documentation

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Account Tokens](https://stripe.com/docs/connect/account-tokens)

### Contacts

- **Support Stripe** : support@stripe.com
- **Dashboard Stripe** : https://dashboard.stripe.com

---

## ✅ Checklist fonctionnalités

- [x] Création automatique du compte Stripe Connect
- [x] Génération du lien d'onboarding
- [x] Redirection vers Stripe UI
- [x] Gestion des retours (success/refresh)
- [x] Vérification du statut du compte
- [x] Protection des routes vendeur
- [x] Dashboard vendeur
- [x] Accès au dashboard Stripe Express
- [x] Gestion des erreurs
- [x] États de chargement
- [x] Audit logs

---

**Onboarding Vendeur v1.0**  
**Développé pour Ava Ticketing Platform**  
**Dernière mise à jour : 15 février 2026**
