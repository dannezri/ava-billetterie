Plan de Développement MVP - Plateforme de Revente de Billets Éthique
Roadmap 12 Semaines | CTO & Product Strategy

I. STACK TECHNIQUE JUSTIFIÉE
Frontend

Next.js 14+ (App Router) : SSR pour SEO, performances optimales, routing natif
TypeScript : Sécurité typée critique pour transactions financières
Tailwind CSS + shadcn/ui : Rapidité de développement, composants accessibles
React Hook Form + Zod : Validation frontend/backend partagée

Backend

Next.js API Routes / tRPC : Type-safety end-to-end, réduction des erreurs
Prisma ORM : Migrations versionnées, typage automatique
PostgreSQL (Supabase/Railway) : ACID compliance pour transactions financières

Paiements & Séquestre

Stripe Connect (Custom Accounts) :

Séquestre natif via transfer_data.on_behalf_of
Libération programmée via webhooks
Conformité DSP2 européenne


Mangopay (alternative) : Spécialisé séquestre EU, mais plus complexe

Sécurité & Identité

Supabase Auth : MFA, email verification
Stripe Identity / Onfido : KYC réglementaire
Uploadcare / Cloudinary : Upload PDF sécurisé avec analyse métadonnées

Infrastructure

Vercel : Déploiement, edge functions
Sentry : Monitoring erreurs
PostHog : Analytics produit
Resend / SendGrid : Emails transactionnels


II. SCHÉMA BASE DE DONNÉES
┌─────────────────────────────────────────────────────────────┐
│ USERS                                                        │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ email (unique, indexed)                                      │
│ phone (nullable)                                             │
│ kyc_status (enum: pending, verified, rejected)              │
│ kyc_provider_id (stripe_identity_id)                        │
│ stripe_account_id (nullable, pour vendeurs)                 │
│ trust_score (int, 0-100) → calcul algorithmique             │
│ created_at, updated_at                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EVENTS                                                       │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ name, artist, venue, city                                    │
│ event_date (datetime, indexed)                              │
│ doors_open_time                                              │
│ official_url (lien billetterie originale)                   │
│ is_verified (bool) → validation manuelle équipe             │
│ created_at                                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TICKETS                                                      │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ event_id (FK → events)                                      │
│ seller_id (FK → users)                                      │
│ status (enum: draft, pending_validation, active,            │
│         reserved, sold, cancelled, flagged)                 │
│ original_price (decimal, 2 décimales)                       │
│ selling_price (decimal) → DOIT être ≤ original_price        │
│ seat_category (string)                                       │
│ seat_number (nullable)                                       │
│ pdf_url (encrypted storage)                                 │
│ pdf_hash (SHA-256 du fichier) → détection doublons         │
│ barcode_number (extracted, indexed) → détection doublons   │
│ verification_status (enum: pending, approved, rejected)     │
│ rejection_reason (text, nullable)                           │
│ created_at, updated_at, expires_at                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TRANSACTIONS                                                 │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ ticket_id (FK → tickets, unique)                            │
│ buyer_id (FK → users)                                       │
│ seller_id (FK → users)                                      │
│ amount (decimal) → prix billet + frais plateforme           │
│ platform_fee (decimal)                                       │
│ stripe_payment_intent_id                                     │
│ stripe_transfer_id (nullable, après libération)             │
│ status (enum: pending, escrowed, released, refunded,        │
│         disputed)                                            │
│ escrow_release_date (datetime) → event_date + 2 jours      │
│ released_at (datetime, nullable)                            │
│ created_at, updated_at                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DISPUTES                                                     │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ transaction_id (FK → transactions)                          │
│ reporter_id (FK → users) → acheteur généralement           │
│ reason (enum: fake_ticket, no_access, duplicate, other)    │
│ description (text)                                           │
│ evidence_urls (jsonb) → photos, vidéos                      │
│ status (enum: open, investigating, resolved_refund,         │
│         resolved_release, closed)                           │
│ resolution_notes (text, nullable)                           │
│ resolved_at (datetime, nullable)                            │
│ created_at                                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ REVIEWS (post-transaction)                                   │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ transaction_id (FK → transactions, unique)                  │
│ reviewer_id (FK → users)                                    │
│ reviewed_user_id (FK → users)                               │
│ rating (int, 1-5)                                           │
│ comment (text, nullable)                                     │
│ created_at                                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AUDIT_LOGS (compliance & sécurité)                          │
├─────────────────────────────────────────────────────────────┤
│ id (uuid, PK)                                               │
│ user_id (FK → users, nullable)                              │
│ action (enum: ticket_upload, kyc_attempt, payment,          │
│         dispute_created, admin_action)                      │
│ metadata (jsonb) → détails contextuels                      │
│ ip_address, user_agent                                       │
│ created_at                                                   │
└─────────────────────────────────────────────────────────────┘
Index critiques :

tickets.barcode_number + tickets.pdf_hash (détection doublons)
transactions.escrow_release_date (job automatique libération)
events.event_date (requêtes temporelles)


III. WORKFLOW DE SÉCURITÉ DÉTAILLÉ
A. Upload et Validation du Billet (Vendeur)
Étape 1 : Pré-requis KYC

Le vendeur doit avoir kyc_status = verified pour accéder à la vente
Si non vérifié : redirection vers Stripe Identity (selfie + pièce d'identité)
Webhook Stripe → mise à jour users.kyc_status

Étape 2 : Upload PDF

Frontend : React Dropzone avec validation client

Taille max : 5 MB
Format : PDF uniquement
Scan antivirus via Uploadcare


Backend API /api/tickets/upload :

   ├─ Génération URL présignée (Cloudinary/S3)
   ├─ Upload direct depuis client (pas de transit serveur)
   ├─ Callback webhook avec file_id
   ├─ Extraction métadonnées PDF :
   │  ├─ Recherche patterns : "code-barres", "numéro de billet"
   │  ├─ OCR léger (Tesseract.js) si nécessaire
   │  └─ Extraction prix facial (regex patterns billetteries connues)
   ├─ Calcul SHA-256 hash du PDF
   ├─ Vérification doublon dans DB :
   │  └─ Query : tickets WHERE pdf_hash = X OR barcode_number = Y
   ├─ Si doublon détecté → REJET immédiat + flag compte vendeur
   └─ Création record TICKETS (status = pending_validation)
Étape 3 : Validation Manuelle (Équipe)

Dashboard admin avec queue de tickets à valider
Checklist :

✓ PDF lisible, code-barres visible
✓ Prix de vente ≤ prix facial
✓ Événement correspond à la DB
✓ Pas de signes de manipulation (Photoshop)


Actions possibles :

APPROUVER → status = active, billet visible sur marketplace
REJETER → status = rejected, email au vendeur avec raison
DEMANDER INFO → statut suspendu, conversation in-app



B. Achat et Séquestre (Acheteur)
Étape 4 : Réservation

Acheteur clique "Acheter maintenant"
Backend : Transaction atomique

sql   BEGIN;
   UPDATE tickets SET status = 'reserved' WHERE id = X AND status = 'active';
   INSERT INTO transactions (buyer_id, ticket_id, status = 'pending');
   COMMIT;

Timer 15 minutes : si paiement non complété → status = active (libération)

Étape 5 : Paiement avec Séquestre Stripe

Frontend : Stripe Elements (Payment Intent)
Backend /api/payments/create-intent :

javascript   const paymentIntent = await stripe.paymentIntents.create({
     amount: (ticket.selling_price + platform_fee) * 100,
     currency: 'eur',
     payment_method_types: ['card', 'sepa_debit'],
     metadata: {
       ticket_id: ticket.id,
       event_date: event.event_date
     },
     // SÉQUESTRE : fonds bloqués, pas de transfert immédiat
     transfer_data: {
       destination: seller.stripe_account_id, // Compte Connect vendeur
     },
     on_behalf_of: seller.stripe_account_id,
     // Important : pas de transfert automatique
     transfer_group: transaction.id
   });
```
3. Confirmation paiement → Webhook `payment_intent.succeeded` :
```
   ├─ Update transactions.status = 'escrowed'
   ├─ Update tickets.status = 'sold'
   ├─ Calcul escrow_release_date = event.event_date + 2 jours
   ├─ Email acheteur : "Billet acheté, PDF disponible dans 'Mes Billets'"
   ├─ Email vendeur : "Vente confirmée, paiement disponible le [date]"
   └─ Envoi PDF à l'acheteur via email sécurisé (lien temporaire 48h)
```

**Étape 6 : Accès au PDF (Acheteur)**
- Acheteur : Section "Mes Billets"
- Bouton "Télécharger le billet" :
```
  ├─ Génération URL présignée temporaire (expire 1h)
  ├─ Watermark dynamique sur PDF (ID transaction + "NON REMBOURSABLE")
  ├─ Audit log : "PDF téléchargé par buyer_id à [timestamp]"
  └─ Pas de copie serveur permanente (RGPD)
C. Libération du Séquestre (Post-Concert)
Étape 7 : Job Automatique J+2

Cron job quotidien (Vercel Cron / GitHub Actions)
Query :

sql  SELECT * FROM transactions 
  WHERE status = 'escrowed' 
  AND escrow_release_date <= NOW()
  AND NOT EXISTS (
    SELECT 1 FROM disputes 
    WHERE transaction_id = transactions.id 
    AND status IN ('open', 'investigating')
  )

Pour chaque transaction :

javascript  const transfer = await stripe.transfers.create({
    amount: transaction.amount - platform_fee,
    currency: 'eur',
    destination: seller.stripe_account_id,
    transfer_group: transaction.id
  });
  
  // Update DB
  UPDATE transactions SET 
    status = 'released',
    stripe_transfer_id = transfer.id,
    released_at = NOW();
  
  // Email vendeur : "💸 Paiement libéré : X€ disponible sur votre compte"
```

### D. Gestion des Litiges

**Étape 8 : Ouverture Litige (J-1 à J+2)**
- Acheteur peut ouvrir litige si :
  - Billet refusé à l'entrée
  - Code-barres déjà scanné (doublon)
  - Événement annulé
- Formulaire litige :
```
  ├─ Type de problème (enum)
  ├─ Description détaillée
  ├─ Upload preuves (photos refus, email producteur)
  └─ Timestamp GPS (optionnel, proof of presence)
```
- Backend :
```
  ├─ INSERT INTO disputes
  ├─ UPDATE transactions SET status = 'disputed'
  ├─ BLOQUER libération séquestre (flag manual_review = true)
  ├─ Notification équipe support (Slack webhook)
  └─ Email vendeur : "Un litige a été ouvert, votre paiement est suspendu"
Étape 9 : Résolution Manuelle

Dashboard admin avec toutes preuves
Décisions possibles :

REMBOURSEMENT ACHETEUR :



javascript    await stripe.refunds.create({
      payment_intent: transaction.stripe_payment_intent_id
    });
    // Pénalité vendeur : trust_score -= 20
    // 3 litiges perdus → suspension compte
```
  - **LIBÉRATION VENDEUR** :
```
    ├─ Preuves insuffisantes de l'acheteur
    ├─ Libération séquestre normale
    └─ Close dispute avec notes

IV. ROADMAP DE DÉVELOPPEMENT (12 SEMAINES)
🎯 Objectif MVP :
Permettre à 10 vendeurs de lister 50 billets et réaliser 20 transactions sécurisées avec séquestre fonctionnel.