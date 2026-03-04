# 🛒 Implémentation Checkout Stripe - Documentation

## 📋 Vue d'ensemble

Le système de checkout permet aux utilisateurs d'acheter des billets de manière sécurisée avec :
- Réservation temporaire (15 minutes)
- Paiement sécurisé via Stripe Elements
- Séquestre bancaire automatique
- Page de confirmation

---

## 🏗️ Architecture

### Pages créées

1. **`/checkout/[ticketId]`** - Page principale de checkout
   - `app/(public)/checkout/[ticketId]/page.tsx` (Server Component)
   - `app/(public)/checkout/[ticketId]/checkout-client.tsx` (Client Component avec Stripe)

2. **`/checkout/success`** - Page de succès post-paiement
   - `app/(public)/checkout/success/page.tsx`

3. **API Routes**
   - `app/api/tickets/reserve/route.ts` (POST/DELETE - Réservation)
   - `app/api/payments/create-intent/route.ts` (POST - Payment Intent)
   - `app/api/transactions/[id]/route.ts` (GET - Détails transaction)

---

## 🔄 Flow Utilisateur

```
1. User clique "Acheter" sur PurchaseCard
   ↓
2. Redirect vers /checkout/[ticketId]
   ↓
3. Auto-réservation du billet (15 min timer)
   ↓
4. User accepte CGV
   ↓
5. User entre ses infos bancaires (Stripe Elements)
   ↓
6. Paiement traité via Stripe
   ↓
7. Redirect vers /checkout/success
   ↓
8. Confirmation + lien téléchargement billet
```

---

## 🔧 Implémentation Technique

### 1. Réservation de Billet

**Endpoint:** `POST /api/tickets/reserve`

**Request:**
```json
{
  "ticketId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "ticketId": "uuid",
    "expiresAt": "2026-02-17T15:30:00Z",
    "amount": 105.00
  }
}
```

**Logique:**
- Vérifie authentification (Supabase Auth)
- Transaction Prisma atomique :
  1. Vérifie disponibilité (status = ACTIVE)
  2. Vérifie vérification (verificationStatus = APPROVED)
  3. Vérifie que acheteur ≠ vendeur
  4. Met à jour status → RESERVED
  5. Crée transaction (status = PENDING)
  6. Calcule escrowReleaseDate (eventDate + 2 jours)
  7. Crée audit log

**Montants:**
```typescript
const platformFeeRate = 0.05; // 5%
const platformFee = ticketPrice * platformFeeRate;
const totalAmount = ticketPrice + platformFee;
```

---

### 2. Payment Intent Stripe

**Endpoint:** `POST /api/payments/create-intent`

**Request:**
```json
{
  "ticketId": "uuid",
  "transactionId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx"
  }
}
```

**Logique:**
- Récupère transaction (doit être PENDING)
- Convertit montants en centimes
- Vérifie si vendeur a stripeAccountId
- **Si vendeur a Stripe Connect:**
  ```typescript
  {
    amount: 10500, // 105€
    transfer_data: {
      destination: seller.stripeAccountId,
      amount: 10000 // 100€ (après frais)
    },
    on_behalf_of: seller.stripeAccountId
  }
  ```
- **Si vendeur n'a PAS Stripe:**
  - Fonds restent sur compte plateforme
  - Vendeur recevra email pour configurer son compte

---

### 3. Composant Client Checkout

**Fichier:** `checkout-client.tsx`

**États:**
- `loading` : Chargement initial
- `reserve` : Affichage récapitulatif + CGV
- `payment` : Formulaire Stripe Elements
- `processing` : Traitement paiement en cours

**Timer de réservation:**
```typescript
const [timeLeft, setTimeLeft] = useState(15 * 60); // 900 secondes

useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        // Expiration → Redirect
        router.push(`/events/${ticketId}`);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [step, timeLeft]);
```

**Stripe Elements:**
```typescript
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: cardElement,
    },
  }
);

if (paymentIntent?.status === 'succeeded') {
  router.push(`/checkout/success?transactionId=${reservationId}`);
}
```

---

### 4. Page de Succès

**Route:** `/checkout/success?transactionId=xxx`

**Fonctionnalités:**
- Récupère détails transaction via API
- Affiche confirmation visuelle (icône succès)
- Affiche détails événement + placement
- Affiche récapitulatif prix
- Boutons d'action :
  - Télécharger billet
  - Voir autres événements
- Affiche Garantie Sérénité
- Animation confetti (optionnel, nécessite `canvas-confetti`)

---

## 🔐 Sécurité

### Authentification
- **Supabase Auth** vérifié sur toutes les routes
- Redirect automatique vers `/login` si non connecté
- `returnUrl` préservé pour redirection post-login

### Vérifications
```typescript
// Acheteur ≠ Vendeur
if (ticket.sellerId === user.id) {
  throw new Error('Vous ne pouvez pas acheter votre propre billet');
}

// Billet disponible
if (ticket.status !== 'ACTIVE') {
  throw new Error('Ce billet n\'est plus disponible');
}

// Billet vérifié
if (ticket.verificationStatus !== 'APPROVED') {
  throw new Error('Ce billet n\'a pas encore été vérifié');
}
```

### Protection Transaction
- **Transactions atomiques** Prisma (rollback automatique en cas d'erreur)
- **Timer 15 min** : Auto-libération du billet si paiement non finalisé
- **Séquestre Stripe** : Fonds bloqués jusqu'à eventDate + 2 jours

---

## 🎨 UI/UX

### Layout Desktop
```
┌─────────────────────────────────────────────────────────┐
│ Breadcrumb : Événements > Event > Paiement             │
└─────────────────────────────────────────────────────────┘
┌───────────────────────┬─────────────────────────────────┐
│ Gauche (66%)          │ Droite (33%)                    │
│                       │                                 │
│ - Card Événement      │ - Card Récapitulatif (sticky)   │
│ - Card Vendeur        │   • Prix billet                 │
│ - Card CGV/Paiement   │   • Frais plateforme           │
│                       │   • Total                       │
│                       │   • Badge "Réservé"            │
│                       │   • Garantie Sérénité          │
└───────────────────────┴─────────────────────────────────┘
```

### Responsive Mobile
- Layout 1 colonne
- Card récapitulatif devient non-sticky
- Timer affiché en haut de page

### États visuels
- **Loading** : Skeletons shadcn/ui
- **Reserve** : Formulaire CGV + garanties
- **Payment** : Stripe Elements + timer
- **Processing** : Bouton disabled avec loader
- **Success** : Checkmark vert + confetti

---

## 📦 Dépendances

### Packages requis
```json
{
  "@stripe/stripe-js": "^latest",
  "@stripe/react-stripe-js": "^latest",
  "stripe": "^latest" (backend)
}
```

### Optionnel
```bash
npm install canvas-confetti @types/canvas-confetti
```

---

## 🧪 Tests Manuels

### Scénario 1: Achat Réussi
1. ✅ Aller sur `/events/[id]`
2. ✅ Cliquer sur "Acheter" (PurchaseCard)
3. ✅ Vérifier redirect vers `/checkout/[ticketId]`
4. ✅ Vérifier auto-réservation (badge "Réservé" visible)
5. ✅ Accepter CGV
6. ✅ Entrer carte test : `4242 4242 4242 4242`
7. ✅ Soumettre paiement
8. ✅ Vérifier redirect vers `/checkout/success`
9. ✅ Vérifier affichage détails transaction

### Scénario 2: Timer Expiré
1. ✅ Réserver un billet
2. ✅ Attendre 15 minutes (ou modifier le timer pour tester)
3. ✅ Vérifier redirect automatique
4. ✅ Vérifier billet remis en ACTIVE dans DB

### Scénario 3: Non Authentifié
1. ✅ Déconnecté
2. ✅ Accéder `/checkout/[ticketId]`
3. ✅ Vérifier redirect vers `/login?returnUrl=...`
4. ✅ Se connecter
5. ✅ Vérifier redirect vers checkout

### Scénario 4: Achat Propre Billet
1. ✅ Se connecter comme vendeur
2. ✅ Accéder checkout de son propre billet
3. ✅ Vérifier message d'erreur

---

## 🔄 Webhooks Stripe

### Event: `payment_intent.succeeded`

**Handler:** `app/api/webhooks/stripe/route.ts`

**Actions:**
1. Mettre à jour transaction.status → COMPLETED
2. Mettre à jour ticket.status → SOLD
3. Créer audit log
4. Envoyer email confirmation acheteur
5. Envoyer email notification vendeur

---

## 📧 Emails (À implémenter)

### Email Acheteur
**Subject:** "✅ Votre billet pour [Event] est confirmé !"

**Contenu:**
- Confirmation achat
- Détails événement
- QR Code billet
- Lien téléchargement PDF
- Rappel date événement
- Garantie Sérénité

### Email Vendeur
**Subject:** "💰 Votre billet pour [Event] a été vendu"

**Contenu:**
- Notification vente
- Montant net à recevoir (après frais)
- Date de libération séquestre (eventDate + 2 jours)
- Lien tableau de bord vendeur

---

## 🚀 Déploiement

### Variables d'environnement requises
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Database
DATABASE_URL=postgresql://xxx
```

### Webhooks Production
1. Configurer webhook endpoint : `https://votre-domaine.com/api/webhooks/stripe`
2. Sélectionner événements : `payment_intent.succeeded`, `payment_intent.payment_failed`
3. Copier signing secret → `STRIPE_WEBHOOK_SECRET`

---

## 📝 Améliorations Futures

### Court terme
- [ ] Job cron pour libérer réservations expirées
- [ ] Emails transactionnels (Resend)
- [ ] Historique achats utilisateur
- [ ] Page "Mes billets"

### Moyen terme
- [ ] Paiement Apple Pay / Google Pay
- [ ] Sauvegarde carte pour futurs achats
- [ ] Split payment (achat groupé)
- [ ] Codes promo / réductions

### Long terme
- [ ] Système de points fidélité
- [ ] Recommandations personnalisées
- [ ] Programme parrainage

---

## 🐛 Debugging

### Logs à vérifier
```bash
# Terminal serveur
npm run dev

# Logs Stripe (local)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Logs Prisma
DEBUG=prisma:* npm run dev
```

### Erreurs communes

**"Webhook signature failed"**
→ Vérifier `STRIPE_WEBHOOK_SECRET` dans `.env.local`

**"Transaction not found"**
→ Vérifier que la réservation a été créée (check DB)

**"Card declined"**
→ Utiliser cartes test Stripe : https://stripe.com/docs/testing

**"User not authenticated"**
→ Vérifier Supabase Auth session

---

## 📚 Ressources

- [Stripe Elements Docs](https://stripe.com/docs/stripe-js)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Prisma Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions)

---

**Implémenté le 17 février 2026**
**Développé pour Ava Ticketing Platform**
