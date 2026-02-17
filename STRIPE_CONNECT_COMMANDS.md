# 🚀 Stripe Connect - Commandes Rapides

Référence rapide de toutes les commandes disponibles pour Stripe Connect.

---

## 📦 Scripts NPM

### Tests & Développement

```bash
# Lancer le serveur Next.js
npm run dev

# Écouter les webhooks Stripe locaux
npm run stripe:listen

# Exécuter tous les tests Stripe Connect
npm run stripe:test

# Déclencher des webhooks de test
npm run stripe:webhooks
```

---

## 🔧 Script de Test Personnalisé

### Commandes disponibles

```bash
# Aide
bash scripts/test-stripe-connect.sh help

# Exécuter tous les tests
bash scripts/test-stripe-connect.sh test

# Créer un compte Connect
bash scripts/test-stripe-connect.sh create

# Générer un lien d'onboarding
bash scripts/test-stripe-connect.sh onboarding

# Vérifier le statut du compte
bash scripts/test-stripe-connect.sh status

# Générer un lien dashboard
bash scripts/test-stripe-connect.sh dashboard

# Déclencher des webhooks de test
bash scripts/test-stripe-connect.sh webhooks

# Écouter les webhooks locaux (Stripe CLI)
bash scripts/test-stripe-connect.sh listen

# Créer un compte via Stripe CLI
bash scripts/test-stripe-connect.sh create-cli

# Lister les comptes Connect
bash scripts/test-stripe-connect.sh list
```

---

## 🔌 Stripe CLI

### Installation

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Windows
scoop install stripe
```

### Authentification

```bash
# Se connecter à Stripe
stripe login

# Vérifier la configuration
stripe config --list
```

### Webhooks Locaux

```bash
# Écouter les webhooks (méthode 1)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Écouter les webhooks (méthode 2 - via NPM)
npm run stripe:listen

# Copier le webhook secret affiché (whsec_xxx)
# Ajouter dans .env.local :
# STRIPE_WEBHOOK_SECRET=whsec_xxx

# Redémarrer le serveur Next.js
npm run dev
```

### Déclencher des Événements

```bash
# Paiements
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger charge.succeeded

# Transferts
stripe trigger transfer.created
stripe trigger transfer.paid
stripe trigger transfer.failed

# Payouts
stripe trigger payout.paid
stripe trigger payout.failed

# Comptes Connect
stripe trigger account.updated
stripe trigger account.application.deauthorized
stripe trigger capability.updated

# KYC
stripe trigger identity.verification_session.verified
stripe trigger identity.verification_session.requires_input
```

### Gestion des Comptes

```bash
# Créer un compte Connect
stripe accounts create \
  --type=custom \
  --country=FR \
  --email=test@example.com \
  --business-type=individual \
  --capabilities[card_payments][requested]=true \
  --capabilities[transfers][requested]=true

# Lister les comptes
stripe accounts list --limit=10

# Récupérer un compte
stripe accounts retrieve acct_xxx

# Supprimer un compte
stripe accounts delete acct_xxx
```

---

## 🧪 Tests API Manuels

### Créer un compte Connect

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

### Générer un lien d'onboarding

```bash
curl -X POST http://localhost:3000/api/stripe-connect/onboarding-link
```

**Réponse attendue :**
```json
{
  "success": true,
  "accountId": "acct_xxx",
  "onboardingUrl": "https://connect.stripe.com/setup/...",
  "expiresAt": 1234567890
}
```

### Vérifier le statut du compte

```bash
curl http://localhost:3000/api/stripe-connect/account-status
```

**Réponse attendue :**
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

### Générer un lien dashboard

```bash
curl -X POST http://localhost:3000/api/stripe-connect/dashboard-link
```

**Réponse attendue :**
```json
{
  "success": true,
  "url": "https://connect.stripe.com/express/..."
}
```

---

## 🗄️ Base de Données

### Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Créer une migration
npx prisma migrate dev --name add_stripe_connect

# Appliquer les migrations
npx prisma migrate deploy

# Ouvrir Prisma Studio
npx prisma studio

# Vérifier le schéma
npx prisma validate
```

### Requêtes SQL Utiles

```sql
-- Vérifier les comptes Connect des utilisateurs
SELECT id, email, stripe_account_id, kyc_status, trust_score
FROM users
WHERE stripe_account_id IS NOT NULL;

-- Vérifier les transactions en séquestre
SELECT t.id, t.amount, t.status, t.escrow_release_date,
       u.email as seller_email, u.stripe_account_id
FROM transactions t
JOIN users u ON t.seller_id = u.id
WHERE t.status = 'ESCROWED';

-- Vérifier les audit logs Stripe Connect
SELECT id, user_id, action, metadata, created_at
FROM audit_logs
WHERE action = 'ADMIN_ACTION'
  AND metadata->>'action' LIKE '%stripe%'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🔍 Monitoring & Logs

### Logs du Serveur Next.js

```bash
# Suivre les logs en temps réel
npm run dev | grep -E "(✅|❌|⚠️|💰|💸)"

# Filtrer les logs Stripe Connect
npm run dev | grep "Stripe Connect"

# Filtrer les webhooks
npm run dev | grep "Webhook"
```

### Logs Stripe CLI

```bash
# Voir les événements en temps réel
stripe listen --print-json

# Filtrer par type d'événement
stripe listen --events account.updated,transfer.created

# Sauvegarder les logs
stripe listen --forward-to localhost:3000/api/webhooks/stripe > stripe-logs.txt
```

### Dashboard Stripe

```bash
# Ouvrir le dashboard Stripe
open https://dashboard.stripe.com

# Ouvrir les webhooks
open https://dashboard.stripe.com/webhooks

# Ouvrir les comptes Connect
open https://dashboard.stripe.com/connect/accounts
```

---

## 🚀 Workflow Complet

### Setup Initial (une seule fois)

```bash
# 1. Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Se connecter
stripe login

# 3. Configurer les variables d'environnement
cp env.template .env.local
# Éditer .env.local avec vos clés Stripe

# 4. Installer les dépendances
npm install

# 5. Générer Prisma
npx prisma generate
```

### Développement Quotidien

```bash
# Terminal 1 - Serveur Next.js
npm run dev

# Terminal 2 - Webhooks Stripe
npm run stripe:listen

# Terminal 3 - Tests
npm run stripe:test
```

### Tests Complets

```bash
# 1. Créer un compte
bash scripts/test-stripe-connect.sh create

# 2. Générer lien onboarding
bash scripts/test-stripe-connect.sh onboarding

# 3. Vérifier statut
bash scripts/test-stripe-connect.sh status

# 4. Déclencher webhooks
bash scripts/test-stripe-connect.sh webhooks

# 5. Vérifier les logs
# Consulter le terminal du serveur Next.js
```

---

## 📚 Ressources

### Documentation

- [Guide Complet](./STRIPE_CONNECT_SETUP.md)
- [Quick Start](./STRIPE_CONNECT_QUICK_START.md)
- [Fonctionnalités](./STRIPE_CONNECT_FEATURES.md)
- [Résumé Implémentation](./STRIPE_CONNECT_IMPLEMENTATION_SUMMARY.md)

### Liens Externes

- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
- [Custom Accounts Guide](https://stripe.com/docs/connect/custom-accounts)
- [Webhooks Testing](https://stripe.com/docs/webhooks/test)

---

## 💡 Tips & Astuces

### Raccourcis Utiles

```bash
# Alias pour les commandes fréquentes
alias stripe-listen="npm run stripe:listen"
alias stripe-test="npm run stripe:test"
alias stripe-dev="npm run dev"

# Fonction pour tester rapidement
stripe-quick-test() {
  npm run stripe:test && npm run stripe:webhooks
}
```

### Variables d'environnement

```bash
# Vérifier les variables Stripe
env | grep STRIPE

# Valider la configuration
npm run env:validate

# Générer un secret
npm run env:secret
```

### Debugging

```bash
# Activer les logs détaillés Stripe
export STRIPE_LOG=debug

# Vérifier la connexion Stripe
stripe config --list

# Tester la signature webhook
stripe webhooks test --forward-to localhost:3000/api/webhooks/stripe
```

---

**Référence créée le 15/02/2026**

**Développé pour Ava Ticketing Platform** 🎫
