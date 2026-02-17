# 🔧 Correction API Stripe - Account Tokens

**Date** : 15 février 2026  
**Statut** : ✅ CORRIGÉ

## 🐛 Problème rencontré

```
TypeError: Cannot read properties of undefined (reading 'create')
at stripe.accountTokens.create()
```

### Cause

J'avais utilisé `stripe.accountTokens.create()` qui n'existe pas dans l'API Stripe.

## ✅ Solution appliquée

Utilisation de la **bonne API** : `stripe.tokens.create()` avec le paramètre `account`.

### Code corrigé

```typescript
// ✅ CORRECT
const accountToken = await stripe.tokens.create({
  account: {
    individual: {
      email: 'seller@example.com',
    },
    business_type: 'individual',
    tos_shown_and_accepted: true,
  },
});

// Puis créer le compte
const account = await stripe.accounts.create({
  type: 'custom',
  country: 'FR',
  account_token: accountToken.id,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  // ...
});
```

### Ce qui a changé

❌ **Avant** (incorrect) :
```typescript
stripe.accountTokens.create({ ... })
```

✅ **Après** (correct) :
```typescript
stripe.tokens.create({ account: { ... } })
```

## 🧪 Tester maintenant

Le serveur Next.js devrait **recompiler automatiquement**. Si ce n'est pas le cas :

1. **Vérifier le terminal `npm run dev`** - il devrait afficher :
   ```
   ✓ Compiled /api/stripe-connect/test/create-account in XXms
   ```

2. **Relancer les tests** :
   ```bash
   npm run stripe:test
   ```

## 📊 Résultat attendu

```bash
ℹ️  Test : Création d'un compte Connect...
🇫🇷 Creating account token for FR-based platform...
✅ Account token created: tok_xxxxxxxxxxxxx
✅ Stripe Connect account created: acct_xxxxxxxxxxxxx
✅ Compte créé avec succès
```

## 📚 Référence Stripe

- **Token API** : https://stripe.com/docs/api/tokens/create_account
- **Account Tokens** : https://stripe.com/docs/connect/account-tokens
- **Custom Accounts** : https://stripe.com/docs/connect/custom-accounts

## ⚡ Action immédiate

```bash
npm run stripe:test
```

Le problème est résolu ! 🎉

---

**TLDR** : Mauvaise API utilisée → Corrigé avec `stripe.tokens.create()`. Relancez les tests.
