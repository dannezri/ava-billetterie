# 🏦 Logique d'Escrow (Séquestre) - Ava Marketplace

## 📋 Vue d'ensemble

Le système d'escrow garantit la **sécurité des transactions** pour les acheteurs et vendeurs, même si le vendeur n'a pas encore configuré son compte de paiement.

---

## 🔄 Flux de Paiement

### 1️⃣ Achat du Billet

**Sans compte Stripe vendeur:**
```
Acheteur paie 100€
    ↓
💳 Stripe charge la carte
    ↓
💰 100€ → Compte Plateforme (escrow)
    ↓
✅ Achat confirmé
```

**Avec compte Stripe vendeur:**
```
Acheteur paie 100€
    ↓
💳 Stripe charge la carte
    ↓
💰 95€ → Compte Vendeur (bloqué en escrow)
💰 5€ → Frais Plateforme
    ↓
✅ Achat confirmé
```

### 2️⃣ Libération des Fonds (Escrow Release)

**Date de libération:** `Date événement + 2 jours`

**Cas 1: Vendeur AVEC compte Stripe**
```
Date événement + 2 jours
    ↓
✅ Fonds automatiquement libérés
    ↓
💰 Vendeur reçoit 95€
    ↓
📧 Email "Paiement effectué"
```

**Cas 2: Vendeur SANS compte Stripe**
```
Date événement + 2 jours
    ↓
⚠️  Fonds restent bloqués
    ↓
📧 Email "Configurez votre compte pour recevoir 95€"
    ↓
Vendeur configure Stripe Connect
    ↓
💰 Transfert manuel déclenché
    ↓
✅ Vendeur reçoit 95€
```

---

## 💻 Implémentation Technique

### Payment Intent Creation

```typescript
// app/api/payments/create-intent/route.ts

const hasStripeAccount = !!seller.stripeAccountId;

const paymentIntentConfig = {
  amount: 10000, // 100€ en centimes
  currency: 'eur',
  metadata: {
    sellerHasStripeAccount: hasStripeAccount.toString(),
    // ...autres métadonnées
  },
};

// Transfert automatique SI le vendeur a un compte
if (hasStripeAccount) {
  paymentIntentConfig.transfer_data = {
    destination: seller.stripeAccountId,
    amount: 9500, // 95€ après frais plateforme
  };
  paymentIntentConfig.on_behalf_of = seller.stripeAccountId;
}
// SINON les fonds restent sur le compte plateforme

const paymentIntent = await stripe.paymentIntents.create(paymentIntentConfig);
```

### Webhook Handler

```typescript
// app/api/webhooks/stripe/route.ts

async function handlePaymentIntentSucceeded(paymentIntent) {
  const sellerHasAccount = paymentIntent.metadata.sellerHasStripeAccount === 'true';
  
  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: 'ESCROWED',
      // Si pas de compte vendeur, flag pour transfert manuel
      requiresManualTransfer: !sellerHasAccount,
    },
  });
  
  // Email acheteur: "Achat confirmé"
  await sendBuyerConfirmation();
  
  // Email vendeur
  if (sellerHasAccount) {
    await sendSellerSaleNotification(); // "Vente réalisée, paiement le X"
  } else {
    await sendSellerConfigReminder(); // "Configurez Stripe pour recevoir 95€"
  }
}
```

### Escrow Release Job

```typescript
// Cron job quotidien: vérifier les transactions à libérer

const transactionsToRelease = await prisma.transaction.findMany({
  where: {
    status: 'ESCROWED',
    escrowReleaseDate: { lte: new Date() },
  },
  include: { seller: true },
});

for (const transaction of transactionsToRelease) {
  if (transaction.requiresManualTransfer && !transaction.seller.stripeAccountId) {
    // Vendeur n'a toujours pas configuré son compte
    await sendSellerUrgentReminder(transaction.seller);
    // Fonds restent bloqués
  } else if (transaction.requiresManualTransfer && transaction.seller.stripeAccountId) {
    // Vendeur a configuré son compte entre temps
    await transferFundsManually(transaction);
  } else {
    // Transfert automatique déjà effectué par Stripe
    await markAsReleased(transaction);
  }
}
```

---

## 🔐 Sécurité & Avantages

### Pour l'Acheteur ✅
- **Jamais bloqué**: Peut toujours acheter, indépendamment du statut vendeur
- **Protection garantie**: Fonds en séquestre jusqu'à validation événement
- **Remboursement facile**: Si événement annulé, fonds facilement récupérables

### Pour le Vendeur ✅
- **Flexibilité**: Configure Stripe à son rythme
- **Pas de perte**: Gains toujours sécurisés sur plateforme
- **Transparence**: Notifications régulières pour configuration

### Pour la Plateforme ✅
- **Contrôle total**: Fonds sous contrôle jusqu'à configuration vendeur
- **Conformité**: Respect des régulations financières
- **Revenus**: Frais plateforme perçus immédiatement

---

## 📊 États de Transaction

| État | Description | Fonds Acheteur | Fonds Vendeur |
|------|-------------|----------------|---------------|
| `PENDING` | Réservation active | Non débités | Aucun |
| `ESCROWED` | Paiement réussi | Débités | En escrow |
| `RELEASED` | Fonds libérés | - | Transférés |
| `REFUNDED` | Remboursement | Remboursés | Aucun |
| `CANCELLED` | Annulé | Non débités | Aucun |

---

## 🔔 Notifications Email

### Acheteur
1. **Achat confirmé** (immédiat)
   - Récapitulatif achat
   - Lien PDF billet
   - Date événement

2. **Événement approche** (J-7)
   - Rappel événement
   - Instructions accès

### Vendeur
1. **Vente réalisée - Avec compte** (immédiat)
   - Montant net: 95€
   - Date paiement: Date événement + 2 jours
   - Lien dashboard

2. **Vente réalisée - Sans compte** (immédiat)
   - Gains bloqués: 95€
   - Appel à l'action: Configurer Stripe
   - Deadline: Date événement + 2 jours

3. **Rappel configuration** (Date événement)
   - Gains disponibles: 95€
   - Urgence: Configurer maintenant
   - Lien configuration Stripe

4. **Paiement effectué** (Date événement + 2 jours)
   - Confirmation transfert
   - Montant reçu: 95€
   - Délai bancaire: 2-3 jours

---

## 🛠️ Configuration Requise

### Variables d'environnement

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plateforme
PLATFORM_STRIPE_ACCOUNT_ID=acct_...  # Compte plateforme
PLATFORM_FEE_PERCENTAGE=0.05         # 5%

# Emails
RESEND_API_KEY=re_...
```

### Base de données

```prisma
model Transaction {
  status                TransactionStatus
  escrowReleaseDate     DateTime
  requiresManualTransfer Boolean          @default(false)
  stripePaymentIntentId String?
  stripeTransferId      String?          // Pour transferts manuels
}
```

---

## 📝 TODO: Améliorations Futures

- [ ] Dashboard admin: Vue fonds en escrow
- [ ] Automation: Relances vendeurs sans compte
- [ ] Analytics: Taux configuration Stripe vendeurs
- [ ] API: Endpoint transfert manuel mass
- [ ] Compliance: Rapport fiscal automatique

---

Dernière mise à jour: 16 février 2026
