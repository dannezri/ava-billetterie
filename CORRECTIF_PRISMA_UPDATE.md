# ✅ Correctif : Erreur "Record to update not found"

## Problème identifié

Une erreur `PrismaClientKnownRequestError: Record to update not found` survenait lors de l'onboarding vendeur.

**Cause** : L'utilisateur était authentifié via Supabase Auth, mais son enregistrement n'existait pas dans la table publique `users` de la base de données (désynchronisation fréquente en développement).

## Solution appliquée

Modification de `src/services/stripe-connect/index.ts` :

Remplacement de `prisma.user.update()` par `prisma.user.upsert()`.

```typescript
// Avant (Erreur si user n'existe pas)
await prisma.user.update({ ... });

// Après (Crée le user s'il n'existe pas)
await prisma.user.upsert({
  where: { id: userId },
  update: { stripeAccountId: account.id },
  create: {
    id: userId,
    email,
    stripeAccountId: account.id,
    kycStatus: 'PENDING',
    verifiedIdentity: false,
    trustScore: 50,
  },
});
```

## Comment vérifier

1. Rechargez la page `/seller/onboarding`.
2. Cliquez sur "Commencer la configuration".
3. L'erreur 500 devrait disparaître et vous devriez être redirigé vers Stripe.
