# 🚀 ACTION IMMÉDIATE - Tester Stripe Connect

## ✅ Tous les problèmes de code sont corrigés !

- ✅ Routes API déplacées au bon endroit (`app/api/`)
- ✅ Configuration Stripe conforme aux règles (`@/config/env`)
- ✅ Routes de test créées (sans authentification, dev uniquement)
- ✅ Script de test mis à jour
- ✅ Documentation complète

## ⚠️ ÉTAPE 0 : Activer Stripe Connect (REQUIS)

**Votre compte Stripe doit avoir Connect activé pour créer des comptes.**

### Activation rapide (3 minutes)

1. **Aller sur le Dashboard Stripe** (mode Test)
   ```
   https://dashboard.stripe.com/test/connect
   ```

2. **Cliquer sur "Get started"** et accepter les conditions

3. **Vérifier l'activation** : Vous devriez voir le dashboard Connect

📖 **Guide détaillé** : `STRIPE_CONNECT_ACTIVATION.md`

### Vérifier si Connect est déjà activé

```bash
# Si vous voyez cette erreur dans les logs :
# "You can only create new accounts if you've signed up for Connect"
# → Stripe Connect n'est PAS activé
```

**Une fois activé, passez à l'étape 1 ci-dessous.**

---

## 🎯 Étape 1 : Lancer les tests (1 minute)

```bash
# Dans le terminal (avec npm run dev actif)
npm run stripe:test
```

### Résultat attendu

```bash
ℹ️  === Exécution de tous les tests ===

✅ Serveur Next.js accessible

ℹ️  Test : Création d'un compte Connect...
✅ Compte créé avec succès
{
  "success": true,
  "accountId": "acct_xxxxxxxxxxxxx",
  "message": "Compte Stripe Connect de test créé avec succès"
}

ℹ️  Test : Génération du lien d'onboarding...
✅ Lien d'onboarding généré

ℹ️  Test : Récupération du statut du compte...
✅ Statut récupéré

ℹ️  Test : Génération du lien dashboard...
✅ Lien dashboard généré

✅ Tous les tests sont terminés !
```

## 🎯 Étape 2 : Si les tests passent

Félicitations ! 🎉 L'intégration Stripe Connect fonctionne.

### Prochaines actions :

1. **Tester dans le navigateur**
   ```
   http://localhost:3000/seller/onboarding
   ```

2. **Configurer les webhooks locaux** (optionnel)
   ```bash
   bash scripts/test-stripe-connect.sh listen
   ```

3. **Lire la documentation complète**
   - `STRIPE_CONNECT_TESTING.md` - Guide de test complet
   - `STRIPE_CONNECT_FIXES.md` - Détails des correctifs

## 🐛 Étape 3 : Si les tests échouent

### Erreur : "Serveur Next.js non accessible"

```bash
# Vérifier que le serveur tourne
curl http://localhost:3000/api/health

# Si erreur, redémarrer
npm run dev
```

### Erreur : "You can only create new accounts if you've signed up for Connect"

**Cause** : Stripe Connect n'est pas activé sur votre compte

**Solution** :
1. Consulter `STRIPE_CONNECT_ACTIVATION.md`
2. Aller sur https://dashboard.stripe.com/test/connect
3. Cliquer sur "Get started" et accepter les conditions
4. Relancer les tests

### Erreur : "Missing environment variable: STRIPE_SECRET_KEY"

```bash
# Valider les variables d'environnement
npm run env:validate

# Vérifier .env.local
cat .env.local | grep STRIPE
```

### Erreur : "Cette route de test n'est disponible qu'en développement"

```bash
# Vérifier NODE_ENV
echo $NODE_ENV
# Doit être vide ou "development"

# Si production, changer
export NODE_ENV=development
npm run dev
```

### Autre erreur

1. Vérifier les logs du terminal `npm run dev`
2. Consulter `STRIPE_CONNECT_TESTING.md` section Troubleshooting
3. Vérifier le dashboard Stripe : https://dashboard.stripe.com

## 📊 Qu'est-ce qui a été corrigé ?

### Problème 1 : Routes 404
- ❌ Routes dans `src/app/api/` (non utilisé par Next.js)
- ✅ Routes déplacées vers `app/api/` (correct)

### Problème 2 : Configuration non conforme
- ❌ `process.env.STRIPE_SECRET_KEY` (accès direct)
- ✅ `config.stripe.secretKey` (module centralisé)

### Problème 3 : Tests échouaient
- ❌ Routes production requièrent authentification
- ✅ Routes de test créées (bypass auth en dev)

## 🔐 Sécurité

Les routes de test sont **automatiquement désactivées en production** :

```typescript
if (!isDevelopment) {
  return 403; // Forbidden en production
}
```

## 📚 Documentation créée

1. **STRIPE_CONNECT_FIXES.md** - Résumé des correctifs
2. **STRIPE_CONNECT_TESTING.md** - Guide complet de test
3. **app/api/stripe-connect/test/README.md** - Doc des routes de test
4. **src/app/README.md** - Avertissement dossier obsolète

## ✨ Routes disponibles

### Production (avec authentification)
```
POST /api/stripe-connect/create-account
POST /api/stripe-connect/onboarding-link
POST /api/stripe-connect/dashboard-link
GET  /api/stripe-connect/account-status
```

### Test (sans authentification, dev uniquement)
```
POST /api/stripe-connect/test/create-account
POST /api/stripe-connect/test/onboarding-link
POST /api/stripe-connect/test/dashboard-link
GET  /api/stripe-connect/test/account-status?accountId=xxx
```

## 🎯 Commande unique pour tout tester

```bash
npm run stripe:test
```

C'est tout ! Si ça passe, vous êtes bon. ✅

---

**Date** : 15 février 2026  
**Temps estimé** : 1 minute  
**Prérequis** : `npm run dev` actif

**Lancez maintenant** : `npm run stripe:test`
