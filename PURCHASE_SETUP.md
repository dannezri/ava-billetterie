# 🚀 Configuration Flux d'Achat - Guide Rapide

## 📦 Dépendances à Installer

```bash
cd /Users/dannezri/Desktop/ava

# Stripe (client + server)
npm install @stripe/stripe-js stripe

# Stripe React Elements
npm install @stripe/react-stripe-js

# Resend (emails)
npm install resend

# Radix UI (pour Checkbox)
npm install @radix-ui/react-checkbox
```

---

## 🔑 Variables d'Environnement

Ajouter dans `.env.local`:

```bash
# Stripe Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend API Key
RESEND_API_KEY=re_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Obtenir les Clés

#### Stripe
1. Aller sur https://dashboard.stripe.com/test/apikeys
2. Copier `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copier `Secret key` → `STRIPE_SECRET_KEY`
4. Pour webhook:
   ```bash
   stripe listen --print-secret
   # Copier whsec_... → STRIPE_WEBHOOK_SECRET
   ```

#### Resend
1. Aller sur https://resend.com/api-keys
2. Créer une clé API
3. Copier → `RESEND_API_KEY`

---

## 🗄️ Migrations Base de Données

### Vérifier le Schéma Prisma

Le schéma doit contenir:

```prisma
model Transaction {
  id                    String   @id @default(uuid())
  ticketId              String   @unique @map("ticket_id")
  buyerId               String   @map("buyer_id")
  sellerId              String   @map("seller_id")
  amount                Decimal  @db.Decimal(10, 2)
  platformFee           Decimal  @map("platform_fee") @db.Decimal(10, 2)
  stripePaymentIntentId String?  @map("stripe_payment_intent_id")
  stripeTransferId      String?  @map("stripe_transfer_id")
  status                TransactionStatus @default(PENDING)
  escrowReleaseDate     DateTime? @map("escrow_release_date")
  releasedAt            DateTime? @map("released_at")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  ticket Ticket @relation(fields: [ticketId], references: [id])
  buyer  User   @relation("BuyerTransactions", fields: [buyerId], references: [id])
  seller User   @relation("SellerTransactions", fields: [sellerId], references: [id])

  @@map("transactions")
}

enum TransactionStatus {
  PENDING
  ESCROWED
  RELEASED
  REFUNDED
  DISPUTED
  CANCELLED
}
```

### Appliquer les Migrations

```bash
npx prisma migrate dev --name add_transaction_status
npx prisma generate
```

---

## 🧪 Test Rapide

### 1. Démarrer le Serveur

```bash
npm run dev
```

### 2. Démarrer Stripe Webhook (Terminal 2)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Tester l'Achat

1. Aller sur http://localhost:3000/events
2. Cliquer sur un événement
3. Cliquer "Acheter" sur un billet
4. Accepter les CGU
5. Cliquer "Continuer vers le paiement"
6. Entrer carte test: `4242 4242 4242 4242`
7. Date: n'importe quelle date future
8. CVC: n'importe quel 3 chiffres
9. Cliquer "Payer"

### 4. Vérifier

- ✅ Modal affiche "Paiement réussi !"
- ✅ Console Stripe CLI affiche `payment_intent.succeeded`
- ✅ Emails envoyés (vérifier logs Resend)
- ✅ Billet marqué comme `SOLD` dans la DB

---

## 🐛 Dépannage

### Erreur: "Stripe is not defined"

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### Erreur: "Resend is not defined"

```bash
npm install resend
```

### Erreur: "Checkbox not found"

```bash
npm install @radix-ui/react-checkbox
```

### Webhook ne reçoit pas les événements

```bash
# Vérifier que Stripe CLI écoute
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Vérifier STRIPE_WEBHOOK_SECRET dans .env.local
```

### Emails ne s'envoient pas

1. Vérifier `RESEND_API_KEY` dans `.env.local`
2. Vérifier domaine vérifié dans Resend
3. Vérifier logs serveur pour erreurs

---

## 📝 Checklist Finale

- [ ] Dépendances installées
- [ ] Variables d'environnement configurées
- [ ] Migrations Prisma appliquées
- [ ] Serveur démarré (`npm run dev`)
- [ ] Stripe CLI écoute (`stripe listen`)
- [ ] Test achat réussi
- [ ] Emails reçus

---

## 🎉 Prêt !

Le flux d'achat est maintenant opérationnel ! 🚀

**Documentation complète:** `PURCHASE_FLOW_COMPLETE.md`
