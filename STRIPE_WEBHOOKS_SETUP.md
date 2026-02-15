# ✅ Stripe Webhooks - Configuration

## 🎉 Webhooks Créés sur Stripe

Vous avez configuré 2 webhooks Stripe :

### 1. whimsical-celebration-snapshot
```
URL: https://ava-billetterie-web.vercel.app/api/webhooks/stripe
Secret: whsec_MK3cndR23fPfdDsGxMXiWqPAGbXniVQE
```

### 2. whimsical-celebration-thin
```
URL: https://ava-billetterie-web.vercel.app/api/webhooks/stripe
Secret: whsec_kvrbRM1FLOaRP2zYRLsqEmOfqbZTCRMm
```

---

## ⚠️ Recommandation : Utiliser UN SEUL Webhook

Vous n'avez besoin que d'un seul endpoint webhook. **Supprimez l'un des deux** pour éviter :
- Double traitement des événements
- Confusion lors du debugging
- Coûts inutiles

**Lequel garder ?** → Celui qui a tous les événements configurés (voir ci-dessous)

---

## 🔧 Configuration du Webhook à Garder

Vérifiez que votre webhook Stripe écoute ces événements :

### Paiements (Critical)
- ✅ `payment_intent.succeeded` → Paiement réussi, création transaction
- ✅ `payment_intent.payment_failed` → Paiement échoué, libérer réservation
- ✅ `charge.succeeded` → Confirmation charge

### Séquestre (Critical)
- ✅ `transfer.created` → Séquestre libéré vers vendeur

### KYC (Critical)
- ✅ `identity.verification_session.verified` → KYC approuvé
- ✅ `identity.verification_session.requires_input` → KYC nécessite plus d'infos

### Optionnels (pour phase 2)
- `charge.refunded` → Remboursement
- `account.updated` → Compte Connect modifié
- `payout.paid` → Payout versé au vendeur

---

## 🚀 Actions à Faire MAINTENANT

### 1️⃣ Ajouter le Secret dans Vercel (2 min) ⚠️ CRITICAL

#### Option A : Via CLI (Recommandé)

```bash
cd /Users/dannezri/Desktop/ava

# Ajouter pour tous les environnements
vercel env add STRIPE_WEBHOOK_SECRET

# Coller cette valeur quand demandé :
whsec_MK3cndR23fPfdDsGxMXiWqPAGbXniVQE
```

Sélectionner :
- [x] Production
- [x] Preview
- [x] Development

#### Option B : Via Dashboard Vercel

1. Aller sur https://vercel.com/avas-projects-033b4f47/ava-billetterie-web/settings/environment-variables
2. Cliquer **Add New**
3. **Key :** `STRIPE_WEBHOOK_SECRET`
4. **Value :** `whsec_MK3cndR23fPfdDsGxMXiWqPAGbXniVQE`
5. Cocher **Production**, **Preview**, **Development**
6. Sauvegarder

---

### 2️⃣ Ajouter Localement dans .env.local (1 min)

```bash
# Ajouter cette ligne dans votre .env.local
echo 'STRIPE_WEBHOOK_SECRET="whsec_MK3cndR23fPfdDsGxMXiWqPAGbXniVQE"' >> .env.local
```

Ou l'ajouter manuellement dans `.env.local` :

```env
STRIPE_WEBHOOK_SECRET="whsec_MK3cndR23fPfdDsGxMXiWqPAGbXniVQE"
```

---

### 3️⃣ Tester les Webhooks Localement (Optionnel)

Pour tester en développement local, utilisez Stripe CLI :

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Forward les webhooks vers votre local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copier le webhook secret affiché (commence par whsec_...)
# L'ajouter dans .env.local
```

Puis dans un autre terminal :

```bash
# Trigger un événement test
stripe trigger payment_intent.succeeded
```

---

### 4️⃣ Redéployer sur Vercel (1 min)

```bash
# Commit les changements
git add .
git commit -m "feat(webhooks): add Stripe webhook handler"
git push origin main

# Ou déployer directement
vercel --prod
```

---

## ✅ Ce Qui a Été Créé

### Fichiers Créés Automatiquement

1. **`src/app/api/webhooks/stripe/route.ts`** (300+ lignes)
   - Handler complet des webhooks Stripe
   - Gestion de tous les événements
   - Mise à jour automatique de la base de données
   - Logs détaillés

2. **`next.config.ts`**
   - Configuration Next.js
   - Headers de sécurité

### Événements Gérés dans le Code

```typescript
✅ payment_intent.succeeded      → Création transaction en séquestre
✅ payment_intent.payment_failed → Libération réservation billet
✅ charge.succeeded              → Log audit
✅ transfer.created              → Libération séquestre vers vendeur
✅ identity.verification_session.verified → KYC approuvé
✅ identity.verification_session.requires_input → KYC en attente
```

---

## 🧪 Tester les Webhooks

### Test avec Stripe CLI

```bash
# Tester payment succeeded
stripe trigger payment_intent.succeeded

# Tester KYC vérifié
stripe trigger identity.verification_session.verified

# Tester transfert
stripe trigger transfer.created
```

### Test en Production

1. Faire un vrai paiement test sur votre app
2. Vérifier les logs Vercel : `vercel logs --follow`
3. Vérifier les logs Stripe Dashboard > Developers > Webhooks > [votre endpoint]

---

## 📊 Monitoring des Webhooks

### Via Stripe Dashboard

1. Aller sur https://dashboard.stripe.com/test/webhooks
2. Cliquer sur votre webhook `whimsical-celebration-snapshot`
3. Voir tous les événements envoyés et leurs statuts
4. En cas d'échec, **Retry** l'événement

### Via Vercel Logs

```bash
# Voir les logs webhooks en temps réel
vercel logs --follow

# Filter par erreurs uniquement
vercel logs --filter error

# Voir un déploiement spécifique
vercel logs <deployment-url>
```

### Ce Que Vous Verrez dans les Logs

```
✅ Webhook event received: payment_intent.succeeded
💰 Payment succeeded: pi_xxxxx
✅ Transaction created/updated with escrow
✅ Ticket status updated to SOLD
```

Ou en cas d'erreur :

```
❌ Webhook signature verification failed: Invalid signature
❌ Missing ticket_id in metadata
❌ Error handling payment success: [error details]
```

---

## 🐛 Troubleshooting

### ❌ Erreur "Webhook signature verification failed"

**Cause :** Mauvais `STRIPE_WEBHOOK_SECRET` configuré

**Solution :**
```bash
# Vérifier la variable dans Vercel
vercel env ls

# La supprimer et la recréer
vercel env rm STRIPE_WEBHOOK_SECRET
vercel env add STRIPE_WEBHOOK_SECRET

# Redéployer
vercel --prod
```

### ❌ Erreur "Missing stripe-signature header"

**Cause :** La requête ne vient pas de Stripe

**Solution :** Vérifier que l'URL du webhook sur Stripe est correcte :
```
https://ava-billetterie-web.vercel.app/api/webhooks/stripe
```

### ❌ Timeout / Erreur 500

**Cause :** Le handler prend trop de temps ou une erreur dans le code

**Solution :**
```bash
# Voir les logs détaillés
vercel logs --filter error

# Vérifier la connexion database
# Vérifier que Prisma Client est généré
```

### ❌ "Transaction not found"

**Cause :** Métadonnées manquantes dans le PaymentIntent

**Solution :** Vérifier que lors de la création du PaymentIntent, vous passez bien :
```typescript
metadata: {
  ticket_id: 'xxx',
  buyer_id: 'xxx',
  transaction_id: 'xxx'
}
```

---

## 📝 Bonnes Pratiques

### 1. Idempotence

Les webhooks peuvent être envoyés plusieurs fois. Le code gère déjà ça avec :
- `upsert` au lieu de `create` pour les transactions
- Vérifications d'existence avant mise à jour

### 2. Réponse Rapide

Le handler doit répondre en < 5 secondes. Si traitement long :
- Répondre immédiatement `{ received: true }`
- Ajouter job dans une queue (Vercel Cron, Inngest, etc.)

### 3. Logs Détaillés

Tous les événements sont loggés :
- ✅ Succès avec détails
- ❌ Erreurs avec stack trace
- ℹ️ Événements non gérés

### 4. Retry Automatique

Stripe retry automatiquement les webhooks qui échouent :
- 3 retries espacés exponentiellement
- Vérifier Stripe Dashboard si échecs répétés

---

## 🎯 Prochaines Étapes

Après configuration des webhooks :

1. **Tester un paiement complet**
   - Créer un ticket test
   - L'acheter avec une carte test Stripe
   - Vérifier que la transaction est créée en séquestre
   - Vérifier les emails envoyés

2. **Configurer les emails**
   - Resend / SendGrid
   - Templates pour :
     - Confirmation achat
     - Confirmation vente
     - Séquestre libéré
     - KYC approuvé

3. **Créer le job de libération séquestre**
   - Vercel Cron job quotidien
   - Chercher transactions avec `escrow_release_date <= NOW()`
   - Créer le transfert Stripe

4. **Tests end-to-end**
   - Parcours complet vendeur
   - Parcours complet acheteur
   - Gestion litiges

---

## ✅ Checklist de Vérification

- [ ] Un seul webhook Stripe configuré (supprimer le doublon)
- [ ] `STRIPE_WEBHOOK_SECRET` ajouté dans Vercel (Production, Preview, Development)
- [ ] `STRIPE_WEBHOOK_SECRET` ajouté dans `.env.local`
- [ ] Code webhook déployé sur Vercel
- [ ] Test avec Stripe CLI réussi
- [ ] Logs Vercel ne montrent pas d'erreurs
- [ ] Logs Stripe Dashboard montrent des succès (200)

---

## 📚 Ressources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Vercel Logs](https://vercel.com/docs/observability/runtime-logs)

---

**Configuration webhooks terminée ! 🎉**

Ajoutez le secret dans Vercel, redéployez, et vos webhooks seront opérationnels !
