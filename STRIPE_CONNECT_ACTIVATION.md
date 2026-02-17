# ⚠️ URGENT : Activer Stripe Connect

## 🚨 Problème détecté

Votre compte Stripe **n'a pas Stripe Connect activé**. C'est requis pour créer des comptes Connect.

### Erreur rencontrée

```
StripeInvalidRequestError: You can only create new accounts if you've 
signed up for Connect, which you can learn how to do at 
https://stripe.com/docs/connect.
```

## ✅ Solution : Activation en 3 minutes

### Étape 1 : Accéder au Dashboard Stripe

**Mode Test** (pour les tests locaux) :
```
https://dashboard.stripe.com/test/connect/accounts/overview
```

**Mode Live** (pour la production) :
```
https://dashboard.stripe.com/connect/accounts/overview
```

### Étape 2 : Activer Connect

1. **Se connecter au Dashboard Stripe**
   - https://dashboard.stripe.com

2. **Activer le mode Test** (coin supérieur droit)
   - Basculer sur "Test Mode"

3. **Accéder à Connect**
   - Menu gauche → "Connect" 
   - OU directement : https://dashboard.stripe.com/test/connect/accounts/overview

4. **Cliquer sur "Get started"**
   - Si c'est votre première fois, Stripe affichera un bouton "Get started"
   - Cliquer dessus pour commencer l'activation

5. **Accepter les conditions**
   - Lire et accepter les Terms of Service de Stripe Connect
   - Cliquer sur "Accept"

6. **Configurer Connect** (optionnel pour les tests)
   - Type de compte : **Custom** (recommandé pour votre use case)
   - Branding : Peut être configuré plus tard

### Étape 3 : Vérifier l'activation

Une fois activé, vous devriez voir :
- ✅ Dashboard Connect avec "Accounts", "Payments", "Transfers"
- ✅ Possibilité de créer des comptes Connect
- ✅ Section "Settings" → "Connect settings"

## 🧪 Retester après activation

Une fois Stripe Connect activé :

```bash
# Relancer les tests
npm run stripe:test
```

**Résultat attendu** :
```bash
✅ Compte créé avec succès
{
  "success": true,
  "accountId": "acct_xxxxxxxxxxxxx",
  "message": "Compte Stripe Connect de test créé avec succès"
}
```

## 📚 Types de comptes Connect

Stripe Connect propose 3 types de comptes :

### 1. Custom Accounts (recommandé pour vous)
- ✅ **Contrôle total** sur l'expérience utilisateur
- ✅ Vous gérez l'onboarding et la vérification
- ✅ Vous gérez les payouts
- ⚠️ Plus de responsabilités compliance

### 2. Express Accounts
- ✅ Onboarding simplifié géré par Stripe
- ✅ Moins de responsabilités compliance
- ⚠️ Moins de contrôle sur l'expérience

### 3. Standard Accounts
- ✅ Comptes Stripe indépendants
- ⚠️ Moins adapté pour une marketplace

**Votre configuration actuelle utilise Custom Accounts** (voir `src/services/stripe-connect/index.ts` ligne 55-56).

## 🔐 Configuration supplémentaire (après activation)

### Webhooks (optionnel pour tests, requis pour prod)

1. **Accéder aux webhooks**
   ```
   https://dashboard.stripe.com/test/webhooks
   ```

2. **Ajouter un endpoint local** (pour dev)
   ```
   Endpoint URL: http://localhost:3000/api/webhooks/stripe
   Events: account.updated, payment_intent.succeeded, transfer.created
   ```

3. **Ou utiliser Stripe CLI** (recommandé)
   ```bash
   bash scripts/test-stripe-connect.sh listen
   ```

### Branding (optionnel)

Personnaliser l'apparence de l'onboarding :
```
Dashboard → Connect → Settings → Branding
```

## ⚡ Mode Test vs Mode Live

### Mode Test (développement)
- ✅ **Gratuit** et illimité
- ✅ Pas de vrai argent
- ✅ Parfait pour tester
- ⚠️ Nécessite activation Connect séparée

### Mode Live (production)
- ⚠️ **Argent réel**
- ⚠️ Nécessite activation Connect séparée
- ⚠️ Vérification d'identité requise
- ⚠️ Frais Stripe appliqués

## 🎯 Checklist d'activation

- [ ] Se connecter au Dashboard Stripe
- [ ] Basculer en mode Test
- [ ] Accéder à Connect (menu gauche)
- [ ] Cliquer sur "Get started"
- [ ] Accepter les Terms of Service
- [ ] Configurer le type de compte (Custom)
- [ ] Vérifier que Connect est activé
- [ ] Relancer `npm run stripe:test`

## 🐛 Problèmes fréquents

### "I don't see the Connect option"

**Solution** :
1. Vérifier que vous êtes sur le bon compte Stripe
2. Vérifier que vous avez les permissions administrateur
3. Rafraîchir la page du dashboard

### "Connect is not available in my country"

Stripe Connect est disponible dans 46+ pays. Vérifier :
```
https://stripe.com/global
```

### "I already activated Connect but still get the error"

**Solutions** :
1. Vérifier que vous utilisez la bonne clé API (test vs live)
2. Vérifier `.env.local` :
   ```bash
   cat .env.local | grep STRIPE_SECRET_KEY
   # Doit commencer par sk_test_ (mode test)
   ```
3. Régénérer les clés API dans le dashboard

## 📖 Documentation officielle

- **Activation Connect** : https://stripe.com/docs/connect/enable-payment-acceptance-guide
- **Custom Accounts** : https://stripe.com/docs/connect/custom-accounts
- **Onboarding** : https://stripe.com/docs/connect/custom/hosted-onboarding
- **Dashboard Connect** : https://dashboard.stripe.com/test/connect

## 🎯 Prochaines étapes après activation

1. ✅ Activer Stripe Connect (cette page)
2. 🧪 Relancer `npm run stripe:test`
3. 🌐 Tester l'onboarding dans le navigateur
4. ⚙️ Configurer les webhooks
5. 🚀 Déployer en production

---

**Temps estimé** : 3-5 minutes  
**Prérequis** : Compte Stripe valide  
**Coût** : Gratuit en mode Test

**Action immédiate** : Aller sur https://dashboard.stripe.com/test/connect
