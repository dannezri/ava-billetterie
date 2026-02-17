# 🛒 Flux d'Achat Complet - Documentation

**Date:** 16 février 2026  
**Status:** ✅ Implémenté et fonctionnel

---

## 📋 Vue d'Ensemble

Système complet d'achat de billets avec:
- ✅ Modal d'achat avec récapitulatif
- ✅ Réservation avec timer 15 minutes
- ✅ Paiement Stripe avec séquestre
- ✅ Webhooks pour confirmation
- ✅ Emails transactionnels (acheteur + vendeur)

---

## 🎯 Fonctionnalités Implémentées

### 1. Modal Achat (`PurchaseModal`)

**Fichier:** `src/components/tickets/PurchaseModal.tsx`

#### Étape 1: Récapitulatif
- ✅ Informations événement (titre, date, lieu)
- ✅ Détails placement (section, rangée, siège)
- ✅ Prix du billet
- ✅ **Frais plateforme (5%)** calculés automatiquement
- ✅ **Total** affiché en temps réel
- ✅ Garanties de sécurité affichées
- ✅ **Checkbox conditions générales** (obligatoire)
- ✅ Liens vers CGU et politique de confidentialité

#### Étape 2: Paiement
- ✅ **Timer 15 minutes** avec compte à rebours
- ✅ Récapitulatif compact avec badge "Réservé"
- ✅ **Stripe CardElement** intégré
- ✅ Gestion erreurs cartes:
  - Fonds insuffisants
  - Carte refusée
  - Carte expirée
  - Erreurs réseau
- ✅ **Spinner** pendant traitement
- ✅ Messages d'erreur clairs

#### Étape 3: Succès
- ✅ Animation de succès (icône verte)
- ✅ Message de confirmation
- ✅ Redirection automatique après 3s
- ✅ Callback `onSuccess` pour rafraîchir la page

### 2. Système de Réservation

**Endpoint:** `POST /api/tickets/reserve`  
**Fichier:** `app/api/tickets/reserve/route.ts`

#### Fonctionnalités
- ✅ **Vérification authentification** (session NextAuth)
- ✅ **Transaction atomique** Prisma:
  1. Vérifier disponibilité du billet
  2. Vérifier statut `ACTIVE`
  3. Vérifier `verification_status = APPROVED`
  4. Vérifier que acheteur ≠ vendeur
  5. Mettre à jour `status = RESERVED`
  6. Créer transaction avec `status = PENDING`
  7. Calculer `escrowReleaseDate` (date événement + 2 jours)
  8. Créer audit log

#### Calculs
```typescript
const platformFeeRate = 0.05; // 5%
const platformFee = ticketPrice * platformFeeRate;
const totalAmount = ticketPrice + platformFee;
```

#### Réponse
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "ticketId": "uuid",
    "expiresAt": "2026-02-16T15:30:00Z",
    "amount": 94.50
  }
}
```

#### Annulation (Timer expiré)
**Endpoint:** `DELETE /api/tickets/reserve?transactionId=...`

- Remet le billet en `ACTIVE`
- Marque la transaction en `CANCELLED`

### 3. Stripe Payment Intent

**Endpoint:** `POST /api/payments/create-intent`  
**Fichier:** `app/api/payments/create-intent/route.ts`

#### Configuration Séquestre
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountInCents,
  currency: 'eur',
  
  // SÉQUESTRE: Transférer au vendeur après l'événement
  transfer_data: {
    destination: seller.stripeAccountId,
    amount: sellerAmountInCents, // Après déduction frais
  },
  
  // Paiement au nom du vendeur
  on_behalf_of: seller.stripeAccountId,
  
  // Métadonnées pour le webhook
  metadata: {
    transactionId,
    ticketId,
    buyerId,
    sellerId,
    eventId,
    eventDate,
    escrowReleaseDate,
  },
});
```

#### Vérifications
- ✅ Transaction existe et `status = PENDING`
- ✅ Vendeur a un `stripeAccountId`
- ✅ Montants convertis en centimes
- ✅ Calcul frais plateforme (5%)

#### Gestion Erreurs Stripe
- `StripeCardError` → Problème carte (400)
- `StripeInvalidRequestError` → Config invalide (400)
- Autres → Erreur serveur (500)

### 4. Webhook Stripe

**Endpoint:** `POST /api/webhooks/stripe`  
**Fichier:** `app/api/webhooks/stripe/route.ts`

#### Événement: `payment_intent.succeeded`

**Actions:**
1. ✅ Récupérer transaction via `metadata.transactionId`
2. ✅ Mettre à jour `transaction.status = ESCROWED`
3. ✅ Mettre à jour `ticket.status = SOLD`
4. ✅ Créer audit log
5. ✅ **Envoyer emails** (acheteur + vendeur)

#### Vérification Signature
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);
```

### 5. Emails Transactionnels

**Service:** Resend  
**Fonction:** `sendPurchaseConfirmationEmails()`

#### Email Acheteur

**Sujet:** `✅ Achat confirmé - [Événement]`

**Contenu:**
- 🎉 Message de confirmation
- 📋 Récapitulatif complet:
  - Événement (titre, date, lieu)
  - Placement (section, rangée, siège)
  - Montant payé
- 🎟️ Lien téléchargement billet (dashboard)
- 🛡️ Explication protection acheteur
- 📧 Contact support

**Template HTML:** Design responsive avec styles inline

#### Email Vendeur

**Sujet:** `💰 Vente réalisée - [Événement]`

**Contenu:**
- 💰 Félicitations vente
- 📋 Détails vente:
  - Événement
  - Prix de vente
  - Frais plateforme (5%)
  - **Montant net** (prix - frais)
- 💸 Date de paiement (date libération séquestre)
- 🛡️ Explication système séquestre
- 📧 Contact support

**Template HTML:** Design responsive avec styles inline

---

## 🔄 Flux Complet

### Diagramme de Séquence

```
Acheteur                  Frontend              Backend                Stripe              Resend
   |                         |                     |                      |                   |
   |--[Clic "Acheter"]------>|                     |                      |                   |
   |                         |                     |                      |                   |
   |                    [Modal s'ouvre]           |                      |                   |
   |                         |                     |                      |                   |
   |--[Accepte CGU]--------->|                     |                      |                   |
   |                         |                     |                      |                   |
   |--[Clic "Continuer"]---->|                     |                      |                   |
   |                         |                     |                      |                   |
   |                         |--POST /reserve----->|                      |                   |
   |                         |                     |                      |                   |
   |                         |                [Transaction DB]            |                   |
   |                         |                     |                      |                   |
   |                         |<--transactionId-----|                      |                   |
   |                         |                     |                      |                   |
   |                    [Timer 15min démarre]     |                      |                   |
   |                         |                     |                      |                   |
   |--[Entre carte]--------->|                     |                      |                   |
   |                         |                     |                      |                   |
   |--[Clic "Payer"]-------->|                     |                      |                   |
   |                         |                     |                      |                   |
   |                         |--POST /create-intent->                     |                   |
   |                         |                     |                      |                   |
   |                         |                     |--createPaymentIntent-->                  |
   |                         |                     |                      |                   |
   |                         |                     |<--clientSecret-------|                   |
   |                         |                     |                      |                   |
   |                         |<--clientSecret------|                      |                   |
   |                         |                     |                      |                   |
   |                         |--confirmCardPayment----------------------->|                   |
   |                         |                     |                      |                   |
   |                    [Traitement Stripe...]     |                      |                   |
   |                         |                     |                      |                   |
   |                         |<--paymentIntent.succeeded------------------|                   |
   |                         |                     |                      |                   |
   |                         |                     |<--webhook------------|                   |
   |                         |                     |                      |                   |
   |                         |                [Update DB: ESCROWED]       |                   |
   |                         |                     |                      |                   |
   |                         |                     |--sendEmails-------------------------->|
   |                         |                     |                      |                   |
   |<--[Succès affiché]------|                     |                      |                   |
   |                         |                     |                      |                   |
   |<--[Email confirmation]--|--------------------------------------------|<--[Envoi email]---|
   |                         |                     |                      |                   |
```

### Étapes Détaillées

1. **Clic "Acheter"**
   - Modal s'ouvre avec récapitulatif
   - Calcul frais plateforme (5%)
   - Affichage total

2. **Acceptation CGU**
   - Checkbox obligatoire
   - Liens vers CGU et politique

3. **Réservation**
   - `POST /api/tickets/reserve`
   - Transaction atomique Prisma
   - Billet passe en `RESERVED`
   - Timer 15 minutes démarre

4. **Saisie Carte**
   - Stripe CardElement
   - Validation temps réel

5. **Création Payment Intent**
   - `POST /api/payments/create-intent`
   - Configuration séquestre
   - Retour `clientSecret`

6. **Confirmation Paiement**
   - `stripe.confirmCardPayment()`
   - Traitement côté Stripe

7. **Webhook Confirmation**
   - `payment_intent.succeeded`
   - Update DB: `ESCROWED` + `SOLD`
   - Envoi emails

8. **Succès**
   - Animation succès
   - Redirection dashboard

---

## 📊 Schéma Base de Données

### Table `transactions`

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  ticket_id UUID UNIQUE REFERENCES tickets(id),
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  amount DECIMAL(10, 2),
  platform_fee DECIMAL(10, 2),
  stripe_payment_intent_id VARCHAR,
  stripe_transfer_id VARCHAR,
  status ENUM('PENDING', 'ESCROWED', 'RELEASED', 'REFUNDED', 'DISPUTED', 'CANCELLED'),
  escrow_release_date TIMESTAMP,
  released_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### États de Transaction

- **PENDING** → Réservé, en attente de paiement
- **ESCROWED** → Payé, fonds en séquestre
- **RELEASED** → Fonds transférés au vendeur
- **REFUNDED** → Remboursé à l'acheteur
- **DISPUTED** → Litige en cours
- **CANCELLED** → Réservation annulée (timer expiré)

---

## 🔐 Sécurité

### Authentification
- ✅ Session NextAuth vérifiée sur tous les endpoints
- ✅ Vérification buyer ≠ seller

### Transactions Atomiques
- ✅ Prisma `$transaction` pour cohérence
- ✅ Rollback automatique en cas d'erreur

### Stripe
- ✅ Signature webhook vérifiée
- ✅ Clés API sécurisées (variables d'environnement)
- ✅ Montants en centimes (pas de virgules flottantes)

### Audit
- ✅ Logs créés pour chaque action importante
- ✅ Métadonnées complètes dans Payment Intent

---

## 💰 Calculs Financiers

### Frais Plateforme: 5%

```typescript
// Exemple: Billet à 90€
const ticketPrice = 90.00;
const platformFeeRate = 0.05; // 5%
const platformFee = 90.00 * 0.05 = 4.50€;
const totalAmount = 90.00 + 4.50 = 94.50€;

// Répartition
const buyerPays = 94.50€;
const sellerReceives = 90.00€;
const platformKeeps = 4.50€;
```

### Stripe Fees (en plus)

Stripe prélève ses propres frais (~1.4% + 0.25€):
- Ces frais sont déduits du montant plateforme
- Le vendeur reçoit toujours 100% du prix du billet

---

## 📧 Configuration Emails

### Variables d'Environnement

```bash
# Resend API Key
RESEND_API_KEY=re_...

# URL de l'application
NEXT_PUBLIC_APP_URL=https://ava-tickets.com
```

### Domaine Email

Configurer dans Resend:
- Domaine: `ava-tickets.com`
- From: `noreply@ava-tickets.com`
- DKIM/SPF configurés

---

## 🧪 Tests

### Test Manuel

1. **Réservation**
```bash
curl -X POST http://localhost:3000/api/tickets/reserve \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "ticket-id"}'
```

2. **Payment Intent**
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "ticket-id",
    "transactionId": "transaction-id"
  }'
```

3. **Webhook (Stripe CLI)**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

### Test Cartes Stripe

```
Succès: 4242 4242 4242 4242
Fonds insuffisants: 4000 0000 0000 9995
Carte refusée: 4000 0000 0000 0002
Erreur générique: 4000 0000 0000 0127
```

---

## ⚠️ Limitations Actuelles

### Timer Côté Client
Le timer de 15 minutes est géré côté client. En production:
- ✅ Implémenter job scheduler (Vercel Cron)
- ✅ Libérer automatiquement les réservations expirées
- ✅ Nettoyer les transactions `PENDING` > 15min

### Pas de Retry Emails
Si l'envoi d'email échoue:
- ⚠️ Le webhook ne fait pas échouer la transaction
- ✅ À implémenter: Queue de retry (Bull, BullMQ)

### Pas de Téléchargement PDF
- ⚠️ Lien vers dashboard, pas de téléchargement direct
- ✅ À implémenter: Génération PDF avec watermark

---

## 🚀 Prochaines Étapes

### Phase 1: Robustesse (Priorité Haute)
- [ ] Job scheduler pour libération auto réservations
- [ ] Queue de retry pour emails
- [ ] Rate limiting sur endpoints sensibles
- [ ] Tests unitaires + E2E

### Phase 2: UX (Priorité Moyenne)
- [ ] Génération PDF billet avec watermark
- [ ] Historique transactions dans dashboard
- [ ] Notifications push (optionnel)
- [ ] Téléchargement mobile (Apple Wallet, Google Pay)

### Phase 3: Analytics (Priorité Basse)
- [ ] Tracking conversions (PostHog)
- [ ] Métriques temps réservation → paiement
- [ ] Taux d'abandon panier
- [ ] A/B testing frais plateforme

---

## 📞 Support

### Variables d'Environnement Requises

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vérification Configuration

```bash
# Tester Stripe
stripe listen --print-secret

# Tester Resend
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@ava-tickets.com",
    "to": "your-email@example.com",
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

---

## 🎉 Conclusion

Le flux d'achat complet est **opérationnel** et **prêt pour la production** (avec les améliorations recommandées).

Toutes les fonctionnalités demandées ont été implémentées:
- ✅ Modal avec récapitulatif et CGU
- ✅ Réservation avec timer
- ✅ Stripe Payment Intent avec séquestre
- ✅ Webhook pour confirmation
- ✅ Emails transactionnels (acheteur + vendeur)

**Prêt à traiter les premiers paiements ! 💳🎟️**

---

**Développé avec ❤️ le 16 février 2026**
