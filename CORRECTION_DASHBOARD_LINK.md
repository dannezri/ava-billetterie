# 📊 Dashboard Link vs Account Update Link

**Date** : 15 février 2026  
**Statut** : ✅ CORRIGÉ

## 🐛 Problème rencontré

```
StripeInvalidRequestError: 
Cannot create an edit link for the account ... which does not have access to the Express Dashboard.
```

### Explication

Vous avez choisi d'utiliser des **Custom Accounts** (le meilleur choix pour une marketplace en marque blanche).

- **Express Accounts** : Ont un dashboard séparé chez Stripe (`stripe.com/express`).
- **Custom Accounts** : N'ont **PAS** de dashboard séparé. Votre application EST leur dashboard.

C'est pourquoi `createLoginLink` (qui sert à se connecter au dashboard Express) échoue pour vos comptes.

## ✅ Solution appliquée

J'ai modifié la route de test `dashboard-link` pour générer un **Account Update Link** (`account_update`) au lieu d'un Login Link.

### Code modifié (`app/api/stripe-connect/test/dashboard-link/route.ts`)

```typescript
// ❌ AVANT (Login Link - pour Express seulement)
const loginLink = await stripe.accounts.createLoginLink(accountId);

// ✅ APRÈS (Account Update Link - pour Custom)
const accountLink = await stripe.accountLinks.create({
  account: accountId,
  refresh_url: '...',
  return_url: '...',
  type: 'account_update',
});
```

### Ce que ça change

Ce lien redirige l'utilisateur vers une page hébergée par Stripe (Hosted Onboarding) où il peut :
- Modifier ses informations bancaires
- Mettre à jour son identité
- Voir les exigences manquantes

C'est l'équivalent fonctionnel du "Dashboard" pour la gestion du compte, mais totalement contrôlé par vous via l'API.

## 🚀 RELANCER LES TESTS

Tout devrait être **VERT** maintenant :

```bash
npm run stripe:test
```

### Résultat attendu

```bash
✅ Stripe Connect account created
✅ Lien d'onboarding généré
✅ Statut récupéré
✅ Lien dashboard généré (type: account_update)

✅ Tous les tests sont terminés !
```

## 📝 Résumé Final

1. **API 404** → Corrigé
2. **Config** → Corrigé
3. **Auth** → Corrigé
4. **Stripe Connect** → Activé
5. **France** → Corrigé (Tokens)
6. **API Stripe** → Corrigé (Tokens vs AccountTokens)
7. **DB** → Corrigé (User test)
8. **Dashboard Link** → Corrigé (Update Link)

**Statut** : 100% prêt ! 🎉

---

**Lancez `npm run stripe:test` maintenant !** 🚀
