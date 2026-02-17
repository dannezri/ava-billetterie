# 🇫🇷 Stripe Connect - Exigence France : Account Tokens

## 📋 Contexte

Depuis une mise à jour réglementaire, **Stripe impose aux plateformes basées en France** d'utiliser des **Account Tokens** pour créer des comptes Connect Custom.

### Erreur rencontrée (avant correction)

```
Connect platforms based in FR must create accounts via account tokens when 
`controller[requirement_collection]=application`, which includes Custom accounts.
```

## ✅ Solution implémentée

Le service `stripe-connect` a été mis à jour pour utiliser la méthode en deux étapes requise :

### Avant (❌ Ne fonctionne plus pour la France)

```typescript
const account = await stripe.accounts.create({
  type: 'custom',
  country: 'FR',
  email: 'seller@example.com',
  // ... autres paramètres
});
```

### Après (✅ Conforme aux exigences France)

```typescript
// Étape 1 : Créer un Account Token
const accountToken = await stripe.tokens.create({
  account: {
    individual: {
      email: 'seller@example.com',
    },
    business_type: 'individual',
    tos_shown_and_accepted: true,
  },
});

// Étape 2 : Créer le compte avec le token
const account = await stripe.accounts.create({
  type: 'custom',
  country: 'FR',
  account_token: accountToken.id,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  metadata: { ... },
});
```

## 🔧 Changements apportés

### Fichier modifié

**`src/services/stripe-connect/index.ts`** - Fonction `createConnectAccount()`

### Nouveautés

1. **Création d'Account Token** en premier
   - Contient toutes les informations du compte
   - Inclut l'acceptation des TOS
   - IP de l'utilisateur (127.0.0.1 en dev, réelle en prod)

2. **Création du compte** avec le token
   - Utilise `account_token` au lieu des paramètres directs
   - Simplifie la création finale

## 🌍 Pays concernés

Cette exigence s'applique à :
- 🇫🇷 **France** (votre cas)
- 🇪🇺 Autres pays de l'Union Européenne

Pour les autres pays (US, UK, etc.), l'ancienne méthode fonctionne toujours, mais Account Tokens est recommandé.

## 🧪 Tester maintenant

La correction est appliquée. Relancez les tests :

```bash
npm run stripe:test
```

**Résultat attendu** :
```bash
✅ Serveur Next.js accessible
🇫🇷 Creating account token for FR-based platform...
✅ Account token created: catok_xxxxxxxxxxxxx
✅ Stripe Connect account created: acct_xxxxxxxxxxxxx
✅ Compte créé avec succès
```

## 📚 Avantages des Account Tokens

### Sécurité améliorée
- ✅ Les informations sensibles ne transitent qu'une fois
- ✅ Le token est éphémère (usage unique)
- ✅ Moins de risque d'exposition de données

### Compliance
- ✅ Conforme aux réglementations EU
- ✅ Audit trail complet
- ✅ Acceptation TOS explicite

### Flexibilité
- ✅ Permet de précharger les informations
- ✅ Séparation des étapes (collecte vs création)
- ✅ Facilite les flux d'onboarding complexes

## ⚠️ Notes importantes

### IP de l'utilisateur

En **développement** (tests) :
```typescript
ip: '127.0.0.1' // OK pour les tests
```

En **production** :
```typescript
ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
```

**TODO** : Mettre à jour le code pour capturer l'IP réelle en production.

### TOS Acceptance

```typescript
tos_shown_and_accepted: true
```

- Indique que les Terms of Service ont été affichés et acceptés
- ⚠️ Requis pour la compliance France

### Limitations

- Un Account Token ne peut être utilisé qu'**une seule fois**
- Il expire après **quelques heures**
- Il ne peut pas être réutilisé pour mettre à jour un compte

## 🔄 Migration

### Comptes existants

Les comptes créés **avant** cette mise à jour continuent de fonctionner normalement. Aucune action requise.

### Nouveaux comptes

Tous les **nouveaux comptes** utilisent automatiquement Account Tokens.

## 📖 Documentation Stripe

- **Account Tokens** : https://stripe.com/docs/connect/account-tokens
- **Custom Accounts** : https://stripe.com/docs/connect/custom-accounts
- **Compliance EU** : https://stripe.com/docs/connect/express-accounts

## 🎯 Checklist

- [x] Service mis à jour avec Account Tokens
- [x] TOS acceptance inclus
- [x] IP temporaire pour dev (127.0.0.1)
- [ ] Capturer l'IP réelle en production (TODO)
- [ ] Tester la création de compte
- [ ] Vérifier l'onboarding complet

## 🐛 Troubleshooting

### "Invalid account token"

**Cause** : Token déjà utilisé ou expiré

**Solution** : Recréer un nouveau token (automatique dans le code)

### "TOS acceptance required"

**Cause** : `tos_acceptance` manquant ou invalide

**Solution** : Vérifier que `date` et `ip` sont présents (déjà fait)

### "Invalid IP address"

**Cause** : IP au mauvais format

**Solution** : Utiliser une IPv4 valide (127.0.0.1 pour dev)

---

**Date de mise à jour** : 15 février 2026  
**Statut** : ✅ Implémenté et prêt pour tests  
**Action** : Relancer `npm run stripe:test`
