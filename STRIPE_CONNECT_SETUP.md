# Guide Complet - Stripe Connect Setup

Guide de configuration et d'utilisation de Stripe Connect pour la plateforme Ava (Revente de billets avec séquestre).

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Configuration Stripe Connect](#configuration-stripe-connect)
- [Variables d'environnement](#variables-denvironnement)
- [Tests locaux avec Stripe CLI](#tests-locaux-avec-stripe-cli)
- [Workflow vendeur](#workflow-vendeur)
- [API Routes disponibles](#api-routes-disponibles)
- [Événements Webhook](#événements-webhook)
- [FAQ & Troubleshooting](#faq--troubleshooting)

---

## 🎯 Vue d'ensemble

### Qu'est-ce que Stripe Connect ?

Stripe Connect permet à notre plateforme de :
- Créer des **comptes vendeurs** (Custom Accounts)
- Gérer des **paiements en séquestre** (escrow)
- Transférer automatiquement les fonds aux vendeurs après validation
- Prélever des **frais de plateforme** (platform fees)

### Architecture du flux de paiement

```
Acheteur → Paie 100€
    ↓
Stripe (Séquestre)
    ↓ (après événement + 2 jours)
Vendeur reçoit 85€ (- 15% frais plateforme)
```

---

## 🔧 Configuration Stripe Connect

### 1. Dashboard Stripe

#### a) Activer Stripe Connect

1. Aller sur [Dashboard Stripe](https://dashboard.stripe.com)
2. **Connect** → **Settings**
3. Activer **Custom accounts**
4. Configurer les **brand settings** :
   - Logo de la plateforme
   - Couleurs
   - URL de support

#### b) Configurer les webhooks

1. **Developers** → **Webhooks**
2. Ajouter un endpoint :
   - **URL (local)** : `http://localhost:3000/api/webhooks/stripe`
   - **URL (production)** : `https://votre-domaine.com/api/webhooks/stripe`

3. Sélectionner les événements :

**Paiements :**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.succeeded`

**Transferts :**
- `transfer.created`
- `transfer.paid`
- `transfer.failed`
- `payout.paid`
- `payout.failed`

**Connect :**
- `account.updated`
- `account.application.deauthorized`
- `capability.updated`
- `external_account.created`

**Identity (KYC) :**
- `identity.verification_session.verified`
- `identity.verification_session.requires_input`

4. **Copier le webhook secret** → `STRIPE_WEBHOOK_SECRET`

#### c) Vérifier les clés API

1. **Developers** → **API keys**
2. Copier :
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`

---

## 🔑 Variables d'environnement

Ajouter dans `.env.local` :

```bash
# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs pour les redirections Connect
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vérifier la configuration

```bash
npm run env:validate
```

---

## 🧪 Tests locaux avec Stripe CLI

### Installation Stripe CLI

#### macOS
```bash
brew install stripe/stripe-cli/stripe
```

#### Linux
```bash
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

#### Windows
```powershell
scoop install stripe
```

### Configuration

#### 1. Authentification

```bash
stripe login
```

Cela ouvrira un navigateur pour autoriser la CLI.

#### 2. Tester la connexion

```bash
stripe config --list
```

Vous devriez voir votre configuration :
```
device_name = macbook-pro
test_mode_api_key = sk_test_***
```

---

### 🎬 Lancer les webhooks locaux

#### Terminal 1 : Serveur Next.js

```bash
npm run dev
```

#### Terminal 2 : Stripe CLI (Forward webhooks)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Output attendu :**
```
> Ready! Your webhook signing secret is whsec_xxx (^C to quit)
```

⚠️ **Important** : Copier le `whsec_xxx` dans `.env.local` :

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Puis **redémarrer** le serveur Next.js.

---

### 🧪 Tester les événements

#### Test 1 : Créer un compte Connect

**API Request :**
```bash
curl -X POST http://localhost:3000/api/stripe-connect/create-account \
  -H "Content-Type: application/json" \
  -d '{
    "country": "FR",
    "businessType": "individual"
  }'
```

**Réponse attendue :**
```json
{
  "success": true,
  "accountId": "acct_xxx",
  "message": "Compte Stripe Connect créé avec succès"
}
```

**Logs Stripe CLI :**
```
account.updated [evt_xxx]
```

#### Test 2 : Générer un lien d'onboarding

```bash
curl -X POST http://localhost:3000/api/stripe-connect/onboarding-link
```

**Réponse :**
```json
{
  "success": true,
  "accountId": "acct_xxx",
  "onboardingUrl": "https://connect.stripe.com/setup/...",
  "expiresAt": 1234567890
}
```

#### Test 3 : Simuler un paiement

Utiliser Stripe CLI pour déclencher un webhook :

```bash
stripe trigger payment_intent.succeeded
```

**Logs attendus dans le terminal Next.js :**
```
✅ Webhook event received: payment_intent.succeeded
💰 Payment succeeded: pi_xxx
✅ Transaction created/updated with escrow
```

#### Test 4 : Simuler un transfert

```bash
stripe trigger transfer.created
```

**Logs :**
```
✅ Webhook event received: transfer.created
💸 Transfer created: tr_xxx
✅ Transaction marked as released
```

---

## 👤 Workflow vendeur

### 1. Créer un compte Connect

**Frontend :**
```typescript
const response = await fetch('/api/stripe-connect/create-account', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    country: 'FR',
    businessType: 'individual',
  }),
});

const { accountId } = await response.json();
```

### 2. Rediriger vers l'onboarding

```typescript
const response = await fetch('/api/stripe-connect/onboarding-link', {
  method: 'POST',
});

const { onboardingUrl } = await response.json();

// Rediriger l'utilisateur
window.location.href = onboardingUrl;
```

### 3. Vérifier le statut du compte

```typescript
const response = await fetch('/api/stripe-connect/account-status');
const status = await response.json();

if (status.chargesEnabled && status.payoutsEnabled) {
  console.log('✅ Compte prêt à vendre !');
} else {
  console.log('⚠️ Documents manquants:', status.requirements.currentlyDue);
}
```

### 4. Accéder au dashboard Stripe Express

```typescript
const response = await fetch('/api/stripe-connect/dashboard-link', {
  method: 'POST',
});

const { url } = await response.json();

// Ouvrir le dashboard dans un nouvel onglet
window.open(url, '_blank');
```

---

## 🛣️ API Routes disponibles

### POST `/api/stripe-connect/create-account`

Créer un compte Stripe Connect pour l'utilisateur connecté.

**Body :**
```json
{
  "country": "FR",
  "businessType": "individual"
}
```

**Réponse :**
```json
{
  "success": true,
  "accountId": "acct_xxx"
}
```

---

### POST `/api/stripe-connect/onboarding-link`

Générer un lien d'onboarding pour compléter le profil vendeur.

**Réponse :**
```json
{
  "success": true,
  "accountId": "acct_xxx",
  "onboardingUrl": "https://connect.stripe.com/setup/...",
  "expiresAt": 1234567890
}
```

---

### GET `/api/stripe-connect/account-status`

Récupérer le statut du compte Connect de l'utilisateur.

**Réponse :**
```json
{
  "success": true,
  "hasAccount": true,
  "id": "acct_xxx",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "detailsSubmitted": true,
  "requirements": {
    "currentlyDue": [],
    "eventuallyDue": [],
    "pastDue": []
  },
  "capabilities": {
    "cardPayments": "active",
    "transfers": "active"
  }
}
```

---

### POST `/api/stripe-connect/dashboard-link`

Générer un lien vers le dashboard Stripe Express du vendeur.

**Réponse :**
```json
{
  "success": true,
  "url": "https://connect.stripe.com/express/..."
}
```

---

## 📡 Événements Webhook

### Paiements

| Événement | Description | Action |
|-----------|-------------|--------|
| `payment_intent.succeeded` | Paiement réussi | ✅ Créer transaction en séquestre |
| `payment_intent.payment_failed` | Paiement échoué | ❌ Libérer le billet |
| `charge.succeeded` | Confirmation charge | 📝 Log audit |

### Transferts

| Événement | Description | Action |
|-----------|-------------|--------|
| `transfer.created` | Transfert créé | 💸 Marquer transaction RELEASED |
| `transfer.paid` | Transfert payé | ✅ Log confirmation |
| `transfer.failed` | Transfert échoué | ⚠️ Alerter support |
| `payout.paid` | Payout arrivé en banque | 💰 Confirmer au vendeur |
| `payout.failed` | Payout échoué | ❌ Alerter vendeur |

### Stripe Connect

| Événement | Description | Action |
|-----------|-------------|--------|
| `account.updated` | Compte mis à jour | 🔄 Vérifier statut KYC |
| `account.application.deauthorized` | Compte déconnecté | ⚠️ Retirer stripe_account_id |
| `capability.updated` | Capacité mise à jour | 🔐 Notifier utilisateur |
| `external_account.created` | Compte bancaire ajouté | 🏦 Log audit |

---

## ❓ FAQ & Troubleshooting

### 🔴 Erreur : "Webhook signature verification failed"

**Cause :** Secret webhook incorrect ou serveur pas redémarré.

**Solution :**
1. Vérifier que `STRIPE_WEBHOOK_SECRET` est correct dans `.env.local`
2. Redémarrer le serveur Next.js
3. Vérifier que Stripe CLI est bien démarré

```bash
# Terminal 1
npm run dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

### 🔴 Erreur : "No such account: acct_xxx"

**Cause :** Compte créé en mode test, mais clé API en mode live (ou inversement).

**Solution :**
1. Vérifier que toutes les clés sont en mode **test** (`pk_test_`, `sk_test_`)
2. Vérifier le mode dans le dashboard Stripe (toggle en haut à droite)

---

### 🔴 L'utilisateur ne voit pas son compte Connect

**Cause :** `stripeAccountId` non enregistré en base de données.

**Solution :**
1. Vérifier les logs du serveur lors de la création du compte
2. Vérifier que Prisma est bien configuré :

```bash
npx prisma generate
npx prisma migrate dev
```

3. Vérifier la table `users` :

```sql
SELECT id, email, stripe_account_id FROM users WHERE id = 'xxx';
```

---

### 🔴 Webhook local ne reçoit pas les événements

**Cause :** Stripe CLI mal configuré ou port incorrect.

**Solution :**
1. Vérifier le port du serveur Next.js (par défaut 3000)
2. Relancer Stripe CLI avec le bon port :

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

3. Vérifier les logs Stripe CLI pour voir les événements

---

### 🟡 Comment tester en mode production ?

1. **Passer en mode live** dans le dashboard Stripe
2. Copier les **clés live** (sans préfixe `_test`)
3. Configurer les **webhooks production** :
   - URL : `https://votre-domaine.com/api/webhooks/stripe`
   - Copier le nouveau `webhook_secret`
4. Ajouter les clés dans **Vercel Environment Variables**

```bash
# Vercel CLI
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
```

---

### 🟢 Comment tester les payouts ?

Les payouts nécessitent un compte Connect **complètement vérifié** avec un compte bancaire.

**En test mode :**
```bash
# Simuler un payout
stripe trigger payout.paid
```

**En live mode :**
1. Créer un vrai compte Connect
2. Compléter l'onboarding (KYC + IBAN)
3. Déclencher un transfert réel après une transaction

---

## 📚 Ressources

- [Documentation Stripe Connect](https://stripe.com/docs/connect)
- [Custom Accounts Guide](https://stripe.com/docs/connect/custom-accounts)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)

---

## 🎓 Résumé des commandes

```bash
# Installation Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Lancer les webhooks locaux
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Déclencher un événement test
stripe trigger payment_intent.succeeded
stripe trigger transfer.created
stripe trigger account.updated

# Créer un compte Connect test
stripe accounts create --type=custom --country=FR --email=test@example.com

# Lister les comptes
stripe accounts list

# Récupérer un compte
stripe accounts retrieve acct_xxx
```

---

## ✅ Checklist de déploiement

- [ ] Compte Stripe en mode **live** configuré
- [ ] Stripe Connect activé dans le dashboard
- [ ] Webhooks production configurés
- [ ] Variables d'environnement ajoutées sur Vercel
- [ ] Tests de bout en bout réalisés (account, onboarding, payment, transfer)
- [ ] Monitoring des webhooks activé (dashboard Stripe)
- [ ] Emails transactionnels configurés (Resend/SendGrid)

---

**Développé pour Ava Ticketing Platform** 🎫
