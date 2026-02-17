# Guide de Test Stripe Connect

Ce guide explique comment tester l'intégration Stripe Connect localement.

## 🚀 Démarrage rapide

### 1. Prérequis

```bash
# Serveur Next.js en cours d'exécution
npm run dev

# Variables d'environnement configurées
# - STRIPE_SECRET_KEY
# - STRIPE_PUBLISHABLE_KEY
# - NODE_ENV=development
```

### 2. Lancer les tests

```bash
# Exécuter tous les tests automatiquement
npm run stripe:test
```

## 📋 Tests disponibles

### Test complet (recommandé)
```bash
npm run stripe:test
```

Exécute dans l'ordre :
1. ✅ Création d'un compte Stripe Connect
2. ✅ Génération du lien d'onboarding
3. ✅ Récupération du statut du compte
4. ✅ Génération du lien dashboard

### Tests individuels

```bash
# Créer un compte uniquement
bash scripts/test-stripe-connect.sh create

# Générer un lien d'onboarding
bash scripts/test-stripe-connect.sh onboarding

# Vérifier le statut
bash scripts/test-stripe-connect.sh status

# Générer un lien dashboard
bash scripts/test-stripe-connect.sh dashboard
```

## 🔍 Ce qui est testé

### 1. Création de compte Connect
- ✅ Création d'un compte Custom Stripe
- ✅ Configuration des capabilities (card_payments, transfers)
- ✅ Configuration des payouts manuels
- ✅ Stockage de l'accountId

### 2. Lien d'onboarding
- ✅ Génération d'un lien AccountLink
- ✅ Configuration des URLs de retour
- ✅ Validation de l'expiration

### 3. Statut du compte
- ✅ Récupération des informations du compte
- ✅ Vérification des requirements (KYC)
- ✅ État des capabilities
- ✅ Raisons de désactivation éventuelles

### 4. Lien dashboard
- ✅ Génération d'un LoginLink
- ✅ Accès au dashboard Stripe Connect

## 🛠 Tests avec Stripe CLI

### Installation

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_latest_linux_x86_64.tar.gz
tar -xvf stripe_latest_linux_x86_64.tar.gz
```

### Écouter les webhooks localement

```bash
# Dans un terminal séparé
bash scripts/test-stripe-connect.sh listen

# Copier le webhook signing secret affiché
# L'ajouter dans .env.local : STRIPE_WEBHOOK_SECRET=whsec_...
```

### Déclencher des webhooks de test

```bash
bash scripts/test-stripe-connect.sh webhooks
```

Webhooks déclenchés :
- `account.updated` - Mise à jour du compte
- `payment_intent.succeeded` - Paiement réussi
- `transfer.created` - Transfert créé

### Créer un compte via Stripe CLI

```bash
bash scripts/test-stripe-connect.sh create-cli
```

### Lister les comptes Connect

```bash
bash scripts/test-stripe-connect.sh list
```

## 📊 Exemple de résultat réussi

```json
{
  "success": true,
  "accountId": "acct_1QK8NxP1234567890",
  "message": "Compte Stripe Connect de test créé avec succès",
  "warning": "Ceci est une route de test - désactivée en production"
}
```

## ⚠️ Erreurs courantes

### "Non authentifié"

❌ **Problème** : Vous utilisez les routes de production au lieu des routes de test

✅ **Solution** : Vérifier que le script utilise `/api/stripe-connect/test/*`

### "Serveur Next.js non accessible"

❌ **Problème** : Le serveur n'est pas démarré

✅ **Solution** : 
```bash
npm run dev
```

### "Missing environment variable: STRIPE_SECRET_KEY"

❌ **Problème** : Variables d'environnement non configurées

✅ **Solution** :
```bash
# Vérifier .env.local
cat .env.local | grep STRIPE

# Ou valider avec
npm run env:validate
```

### "This route is only available in development"

❌ **Problème** : `NODE_ENV=production` ou déployé en production

✅ **Solution** : Les routes de test sont désactivées en production (comportement normal)

## 🔐 Sécurité

### Routes de test (Development uniquement)

Les routes dans `/api/stripe-connect/test/*` :
- ✅ **Bypassent l'authentification** pour faciliter les tests
- ✅ **Désactivées automatiquement en production** via `isDevelopment`
- ⚠️ Ne jamais utiliser en production

### Routes de production

Les routes dans `/api/stripe-connect/*` (racine) :
- ✅ **Requièrent une authentification Supabase**
- ✅ Vérifient la session utilisateur
- ✅ Sécurisées pour la production

## 📚 Ressources

- [Documentation Stripe Connect](https://stripe.com/docs/connect)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhooks locaux](https://stripe.com/docs/webhooks/test)
- [Custom Accounts](https://stripe.com/docs/connect/custom-accounts)

## 🐛 Debug

### Activer les logs Stripe

```typescript
// src/lib/stripe/client.ts
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-04-10',
  typescript: true,
  maxNetworkRetries: 2,
  telemetry: false,
  // Activer les logs (development uniquement)
  ...(isDevelopment && {
    timeout: 30000,
  }),
});
```

### Vérifier les logs Next.js

```bash
# Terminal où tourne npm run dev
# Les logs d'erreur Stripe y apparaîtront
```

### Inspecter un compte dans Stripe Dashboard

1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. Activer le mode Test
3. Connect → Accounts
4. Rechercher par accountId ou email

## ✅ Checklist avant déploiement

- [ ] Tests passent en local (`npm run stripe:test`)
- [ ] Webhooks fonctionnent (`bash scripts/test-stripe-connect.sh listen`)
- [ ] Routes de test désactivées en production (vérifier `isDevelopment`)
- [ ] Variables d'environnement configurées sur Vercel
- [ ] Webhook endpoint configuré dans Stripe Dashboard
- [ ] STRIPE_WEBHOOK_SECRET ajouté en production

## 🎯 Prochaines étapes

Après avoir validé les tests :
1. Tester le flow d'onboarding complet dans le navigateur
2. Vérifier les webhooks en production
3. Tester les paiements end-to-end
4. Configurer le monitoring (Sentry)

---

**Note** : Ce guide est maintenu à jour dans `STRIPE_CONNECT_TESTING.md`
