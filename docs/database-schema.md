# Schéma Base de Données - Plateforme Billets Éthique

## Vue d'Ensemble

Base de données PostgreSQL 15+ hébergée sur Supabase, gérée via Prisma ORM.

**Principes de conception** :
- ✅ Normalisation 3NF (éviter redondance)
- ✅ Relations strictes avec foreign keys
- ✅ Index sur colonnes fréquemment queryées
- ✅ Timestamps automatiques (created_at, updated_at)
- ✅ Soft deletes (deleted_at) pour données critiques
- ✅ Enums pour valeurs fixes (status, types)

---

## Tables Principales

### 1. USERS (Utilisateurs)

Stocke tous les utilisateurs : acheteurs, vendeurs, admins.
```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique @db.VarChar(255)
  email_verified_at DateTime?
  phone             String?   @db.VarChar(20)
  first_name        String    @db.VarChar(100)
  last_name         String    @db.VarChar(100)
  avatar_url        String?   @db.Text
  
  // Authentification (gérée par Supabase Auth)
  supabase_user_id  String    @unique @db.Uuid
  
  // Rôle
  role              UserRole  @default(BUYER)
  
  // KYC (Know Your Customer)
  kyc_status        KycStatus @default(PENDING)
  kyc_provider_id   String?   @db.VarChar(255) // Stripe Identity ID
  kyc_verified_at   DateTime?
  kyc_rejected_reason String? @db.Text
  
  // Stripe Connect (pour vendeurs)
  stripe_account_id String?   @unique @db.VarChar(255)
  stripe_onboarding_completed Boolean @default(false)
  
  // Réputation (vendeurs)
  trust_score       Int       @default(70) // 0-100
  total_sales       Int       @default(0)
  total_purchases   Int       @default(0)
  
  // Préférences
  notification_email Boolean  @default(true)
  notification_sms   Boolean  @default(false)
  
  // Timestamps
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  deleted_at        DateTime? // Soft delete
  
  // Relations
  tickets_sold      Ticket[]         @relation("SellerTickets")
  transactions_buyer Transaction[]   @relation("BuyerTransactions")
  transactions_seller Transaction[]  @relation("SellerTransactions")
  disputes_reported Dispute[]        @relation("Reporter")
  reviews_given     Review[]         @relation("Reviewer")
  reviews_received  Review[]         @relation("ReviewedUser")
  notifications     Notification[]
  audit_logs        AuditLog[]
  
  @@index([email])
  @@index([stripe_account_id])
  @@index([kyc_status])
  @@index([trust_score])
  @@map("users")
}

enum UserRole {
  BUYER      // Acheteur standard
  SELLER     // Vendeur (KYC vérifié)
  ADMIN      // Administrateur plateforme
  MODERATOR  // Modérateur (validation billets)
}

enum KycStatus {
  PENDING   // En attente vérification
  VERIFIED  // Vérifié
  REJECTED  // Rejeté
  EXPIRED   // Expiré (à renouveler)
}
```

**Index justifications** :
- `email` : Recherche login, unicité
- `stripe_account_id` : Lookup paiements fréquent
- `kyc_status` : Filtrage vendeurs actifs
- `trust_score` : Tri marketplace

**Contraintes métier** :
- ✅ `trust_score` BETWEEN 0 AND 100
- ✅ `kyc_status = VERIFIED` requis pour créer billets
- ✅ `stripe_account_id` obligatoire si role = SELLER

---

### 2. EVENTS (Événements)

Concerts, festivals, spectacles.
```prisma
model Event {
  id              String    @id @default(uuid())
  
  // Informations événement
  name            String    @db.VarChar(255)
  slug            String    @unique @db.VarChar(255) // SEO-friendly URL
  description     String?   @db.Text
  artist          String    @db.VarChar(255)
  genre           String?   @db.VarChar(100) // Rock, Pop, Jazz, etc.
  
  // Lieu
  venue_name      String    @db.VarChar(255)
  venue_address   String    @db.Text
  city            String    @db.VarChar(100)
  postal_code     String    @db.VarChar(10)
  country         String    @default("FR") @db.VarChar(2)
  
  // Coordonnées GPS (pour carte)
  latitude        Float?
  longitude       Float?
  
  // Date & heure
  event_date      DateTime  @db.Timestamp
  doors_open_time String?   @db.VarChar(5) // "19:00"
  
  // Métadonnées
  image_url       String?   @db.Text
  official_url    String?   @db.Text // Lien billetterie originale
  
  // Validation
  is_verified     Boolean   @default(false) // Vérifié par admin
  verified_by     String?   @db.Uuid // Admin user ID
  verified_at     DateTime?
  
  // Statistiques (dénormalisées pour perfs)
  tickets_available Int     @default(0)
  min_price       Decimal?  @db.Decimal(10, 2)
  max_price       Decimal?  @db.Decimal(10, 2)
  
  // Timestamps
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  deleted_at      DateTime?
  
  // Relations
  tickets         Ticket[]
  
  @@index([event_date])
  @@index([city])
  @@index([slug])
  @@index([is_verified])
  @@index([artist])
  @@map("events")
}
```

**Index justifications** :
- `event_date` : Filtrage événements à venir (requête la plus fréquente)
- `city` : Recherche géographique
- `slug` : URLs SEO (/events/coldplay-paris-2025)
- `is_verified` : Marketplace affiche uniquement vérifiés
- `artist` : Recherche par artiste

**Contraintes métier** :
- ✅ `event_date` > NOW() pour créer billets (validation app)
- ✅ `slug` unique, généré automatiquement depuis `name`
- ✅ `tickets_available` recalculé via trigger/job

---

### 3. TICKETS (Billets)

Billets en vente sur la plateforme.
```prisma
model Ticket {
  id                  String        @id @default(uuid())
  
  // Relations
  event_id            String        @db.Uuid
  event               Event         @relation(fields: [event_id], references: [id])
  seller_id           String        @db.Uuid
  seller              User          @relation("SellerTickets", fields: [seller_id], references: [id])
  
  // Statut
  status              TicketStatus  @default(PENDING_VALIDATION)
  
  // Prix (en centimes pour éviter problèmes virgule flottante)
  original_price      Decimal       @db.Decimal(10, 2) // Prix facial
  selling_price       Decimal       @db.Decimal(10, 2) // Prix de revente
  
  // Contrainte légale France
  // ⚠️ CRITIQUE : selling_price DOIT être <= original_price (Art. 313-6-2)
  
  // Informations billet
  seat_category       String        @db.VarChar(100) // "Fosse", "Carré Or", "Cat 1"
  seat_number         String?       @db.VarChar(50)  // "A12", "Rang 5 Siège 23"
  barcode_type        String?       @db.VarChar(20)  // "QR", "EAN13", "PDF417"
  
  // Fichier PDF
  pdf_url             String        @db.Text // URL Uploadcare/Cloudinary (chiffré)
  pdf_hash            String        @unique @db.VarChar(64) // SHA-256 (détection doublons)
  pdf_size_bytes      Int?
  
  // Extraction données (automatique)
  barcode_number      String?       @unique @db.VarChar(255) // Détection doublons
  extracted_price     Decimal?      @db.Decimal(10, 2) // Prix extrait du PDF
  extraction_confidence Float?       // 0-1 (confiance algo)
  
  // Validation admin
  verification_status VerificationStatus @default(PENDING)
  verified_by         String?       @db.Uuid // Admin user ID
  verified_at         DateTime?
  rejection_reason    String?       @db.Text
  
  // Métadonnées
  views_count         Int           @default(0)
  favorites_count     Int           @default(0)
  
  // Timestamps
  created_at          DateTime      @default(now())
  updated_at          DateTime      @updatedAt
  expires_at          DateTime?     // Si événement passé, archivage auto
  deleted_at          DateTime?
  
  // Relations
  transaction         Transaction?
  
  @@index([event_id])
  @@index([seller_id])
  @@index([status])
  @@index([pdf_hash])
  @@index([barcode_number])
  @@index([verification_status])
  @@index([selling_price])
  @@map("tickets")
}

enum TicketStatus {
  DRAFT                // Brouillon (pas soumis)
  PENDING_VALIDATION   // En attente validation admin
  ACTIVE               // En vente sur marketplace
  RESERVED             // Réservé par acheteur (15 min)
  SOLD                 // Vendu
  CANCELLED            // Annulé par vendeur
  REJECTED             // Rejeté par admin
  FLAGGED              // Signalé (suspicion fraude)
  EXPIRED              // Événement passé
}

enum VerificationStatus {
  PENDING   // En attente
  APPROVED  // Approuvé
  REJECTED  // Rejeté
}
```

**Index justifications** :
- `event_id` : Liste billets d'un événement (très fréquent)
- `seller_id` : Dashboard vendeur
- `status` : Marketplace (filtre ACTIVE)
- `pdf_hash` + `barcode_number` : **CRITIQUE** détection doublons fraude
- `selling_price` : Tri par prix

**Contraintes métier** :
- ✅ `selling_price <= original_price` (validation Zod + DB constraint)
- ✅ `pdf_hash` unique (même PDF = fraude)
- ✅ `barcode_number` unique (même code-barres = fraude)
- ✅ Statut `RESERVED` expire après 15 min (job cron)

**Triggers DB** :
```sql
-- Empêcher vente au-dessus du prix facial (contrainte légale)
CREATE OR REPLACE FUNCTION check_ticket_price()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.selling_price > NEW.original_price THEN
    RAISE EXCEPTION 'Prix de revente ne peut pas dépasser le prix facial (Art. 313-6-2)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_legal_price
BEFORE INSERT OR UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION check_ticket_price();
```

---

### 4. TRANSACTIONS (Transactions)

Achats de billets avec séquestre bancaire.
```prisma
model Transaction {
  id                    String            @id @default(uuid())
  
  // Relations
  ticket_id             String            @unique @db.Uuid // 1 billet = 1 transaction
  ticket                Ticket            @relation(fields: [ticket_id], references: [id])
  buyer_id              String            @db.Uuid
  buyer                 User              @relation("BuyerTransactions", fields: [buyer_id], references: [id])
  seller_id             String            @db.Uuid
  seller                User              @relation("SellerTransactions", fields: [seller_id], references: [id])
  
  // Montants (en centimes)
  ticket_price          Decimal           @db.Decimal(10, 2) // Prix billet
  platform_fee          Decimal           @db.Decimal(10, 2) // Frais plateforme (5%)
  total_amount          Decimal           @db.Decimal(10, 2) // ticket_price + platform_fee
  seller_net_amount     Decimal           @db.Decimal(10, 2) // Ce que reçoit le vendeur
  
  // Stripe IDs
  stripe_payment_intent_id String         @unique @db.VarChar(255)
  stripe_charge_id         String?        @db.VarChar(255)
  stripe_transfer_id       String?        @db.VarChar(255) // Après libération séquestre
  
  // Statut transaction
  status                TransactionStatus @default(PENDING)
  
  // Séquestre
  escrow_release_date   DateTime?         @db.Timestamp // event_date + 2 jours
  released_at           DateTime?
  manual_review         Boolean           @default(false) // Si litige, bloquer libération
  
  // Métadonnées paiement
  payment_method        String?           @db.VarChar(50) // "card", "sepa_debit"
  card_last4            String?           @db.VarChar(4)
  card_brand            String?           @db.VarChar(20) // "visa", "mastercard"
  
  // Timestamps
  created_at            DateTime          @default(now())
  updated_at            DateTime          @updatedAt
  
  // Relations
  dispute               Dispute?
  review                Review?
  
  @@index([buyer_id])
  @@index([seller_id])
  @@index([status])
  @@index([escrow_release_date])
  @@index([stripe_payment_intent_id])
  @@map("transactions")
}

enum TransactionStatus {
  PENDING    // Paiement en cours
  ESCROWED   // Paiement confirmé, fonds en séquestre
  RELEASED   // Fonds libérés au vendeur (J+2)
  REFUNDED   // Remboursé (litige en faveur acheteur)
  CANCELLED  // Annulé (timeout réservation)
  DISPUTED   // En litige
  FAILED     // Échec paiement
}
```

**Index justifications** :
- `buyer_id` / `seller_id` : Historique transactions utilisateur
- `status` : Dashboard admin (filtrage)
- `escrow_release_date` : **CRITIQUE** job cron libération quotidien
- `stripe_payment_intent_id` : Webhooks Stripe lookup

**Contraintes métier** :
- ✅ `total_amount = ticket_price + platform_fee`
- ✅ `seller_net_amount = ticket_price - platform_fee` (si commission vendeur)
- ✅ `escrow_release_date` calculé automatiquement : `event.event_date + INTERVAL '2 days'`
- ✅ Si `manual_review = true` → libération bloquée (litige)

**Calcul Frais Plateforme** :
```typescript
// Exemple : billet 50€
const PLATFORM_FEE_PERCENT = 0.05; // 5%

const ticketPrice = 50.00;
const platformFee = ticketPrice * PLATFORM_FEE_PERCENT; // 2.50€
const totalAmount = ticketPrice + platformFee; // 52.50€
const sellerNetAmount = ticketPrice; // 50€ (vendeur reçoit prix billet)

// Plateforme garde platformFee (2.50€)
```

---

### 5. DISPUTES (Litiges)

Réclamations acheteurs si problème avec billet.
```prisma
model Dispute {
  id                  String        @id @default(uuid())
  
  // Relations
  transaction_id      String        @unique @db.Uuid
  transaction         Transaction   @relation(fields: [transaction_id], references: [id])
  reporter_id         String        @db.Uuid // Généralement l'acheteur
  reporter            User          @relation("Reporter", fields: [reporter_id], references: [id])
  
  // Type de litige
  reason              DisputeReason
  description         String        @db.Text
  
  // Preuves (URLs vers images/vidéos/docs)
  evidence_urls       Json?         // Array de strings
  
  // Statut
  status              DisputeStatus @default(OPEN)
  
  // Résolution
  resolution_notes    String?       @db.Text // Notes admin/équipe
  resolved_by         String?       @db.Uuid // Admin user ID
  resolved_at         DateTime?
  resolution_outcome  ResolutionOutcome?
  
  // Timestamps
  created_at          DateTime      @default(now())
  updated_at          DateTime      @updatedAt
  
  @@index([transaction_id])
  @@index([reporter_id])
  @@index([status])
  @@index([created_at])
  @@map("disputes")
}

enum DisputeReason {
  FAKE_TICKET        // Billet faux
  DUPLICATE          // Billet déjà utilisé (doublon)
  NO_ACCESS          // Refusé à l'entrée
  EVENT_CANCELLED    // Événement annulé
  WRONG_TICKET       // Billet ne correspond pas (mauvais événement)
  SELLER_NO_RESPONSE // Vendeur injoignable
  OTHER              // Autre raison
}

enum DisputeStatus {
  OPEN          // Ouvert
  INVESTIGATING // En investigation admin
  RESOLVED      // Résolu
  CLOSED        // Fermé (sans suite)
}

enum ResolutionOutcome {
  REFUND_BUYER    // Remboursement acheteur (litige gagné)
  RELEASE_SELLER  // Libération vendeur (litige perdu acheteur)
  PARTIAL_REFUND  // Remboursement partiel (compromis)
}
```

**Index justifications** :
- `transaction_id` : Unique (1 transaction = max 1 litige)
- `status` : Dashboard admin (queue litiges ouverts)
- `created_at` : Tri par ancienneté (SLA 48h résolution)

**Contraintes métier** :
- ✅ Litige ouvrable uniquement entre J-1 et J+2 de l'événement
- ✅ Ouverture litige → `transaction.manual_review = true` (bloque séquestre)
- ✅ Résolution → impact Trust Score vendeur si perte

**Workflow Litige** :
```
OPEN → INVESTIGATING → RESOLVED
                    ↘ CLOSED (sans suite)
```

---

### 6. REVIEWS (Avis)

Avis post-transaction (acheteur note vendeur).
```prisma
model Review {
  id                  String    @id @default(uuid())
  
  // Relations
  transaction_id      String    @unique @db.Uuid
  transaction         Transaction @relation(fields: [transaction_id], references: [id])
  reviewer_id         String    @db.Uuid // Celui qui laisse l'avis
  reviewer            User      @relation("Reviewer", fields: [reviewer_id], references: [id])
  reviewed_user_id    String    @db.Uuid // Celui qui est noté (vendeur généralement)
  reviewed_user       User      @relation("ReviewedUser", fields: [reviewed_user_id], references: [id])
  
  // Notation
  rating              Int       // 1-5 étoiles
  comment             String?   @db.Text
  
  // Modération
  is_published        Boolean   @default(false) // Modération avant publication
  moderated_by        String?   @db.Uuid
  moderated_at        DateTime?
  is_flagged          Boolean   @default(false) // Signalé comme inapproprié
  
  // Timestamps
  created_at          DateTime  @default(now())
  updated_at          DateTime  @updatedAt
  
  @@index([reviewed_user_id])
  @@index([rating])
  @@index([is_published])
  @@map("reviews")
}
```

**Index justifications** :
- `reviewed_user_id` : Profil vendeur (affichage avis)
- `rating` : Calcul moyenne rapide
- `is_published` : Filtrage avis visibles

**Contraintes métier** :
- ✅ `rating` BETWEEN 1 AND 5
- ✅ Avis laissable uniquement J+3 après événement (délai réflexion)
- ✅ 1 transaction = max 1 avis (unique constraint)
- ✅ Modération manuelle avant publication (prévenir spam/insultes)

---

### 7. NOTIFICATIONS (Notifications Utilisateur)

Notifications in-app + emails.
```prisma
model Notification {
  id                  String            @id @default(uuid())
  
  // Relations
  user_id             String            @db.Uuid
  user                User              @relation(fields: [user_id], references: [id])
  
  // Contenu
  type                NotificationType
  title               String            @db.VarChar(255)
  message             String            @db.Text
  link_url            String?           @db.Text // Lien action (ex: /my-purchases/123)
  
  // Métadonnées
  metadata            Json?             // Données additionnelles (transaction_id, etc.)
  
  // Statut
  is_read             Boolean           @default(false)
  read_at             DateTime?
  
  // Envoi email
  email_sent          Boolean           @default(false)
  email_sent_at       DateTime?
  
  // Timestamps
  created_at          DateTime          @default(now())
  expires_at          DateTime?         // Notification temporaire (ex: promo)
  
  @@index([user_id])
  @@index([is_read])
  @@index([created_at])
  @@map("notifications")
}

enum NotificationType {
  PURCHASE_CONFIRMED     // Achat confirmé
  TICKET_APPROVED        // Billet approuvé (vendeur)
  TICKET_REJECTED        // Billet rejeté (vendeur)
  ESCROW_RELEASED        // Paiement libéré (vendeur)
  DISPUTE_OPENED         // Litige ouvert
  DISPUTE_RESOLVED       // Litige résolu
  REVIEW_REQUEST         // Demande avis J+3
  PRICE_ALERT            // Alerte prix (favoris)
  EVENT_REMINDER         // Rappel événement (J-1)
  KYC_VERIFIED           // KYC validé
  SYSTEM_ANNOUNCEMENT    // Annonce plateforme
}
```

**Index justifications** :
- `user_id` : Fetch notifications utilisateur
- `is_read` : Compteur notifications non lues (badge)
- `created_at` : Tri chronologique

---

### 8. AUDIT_LOGS (Logs Audit)

Traçabilité toutes actions sensibles (compliance).
```prisma
model AuditLog {
  id                  String    @id @default(uuid())
  
  // Utilisateur (nullable si action système)
  user_id             String?   @db.Uuid
  user                User?     @relation(fields: [user_id], references: [id])
  
  // Action
  action              AuditAction
  entity_type         String    @db.VarChar(50) // "Ticket", "Transaction", "User"
  entity_id           String?   @db.Uuid
  
  // Contexte
  metadata            Json?     // Détails action (avant/après, etc.)
  ip_address          String?   @db.VarChar(45) // IPv4/IPv6
  user_agent          String?   @db.Text
  
  // Timestamp
  created_at          DateTime  @default(now())
  
  @@index([user_id])
  @@index([action])
  @@index([created_at])
  @@map("audit_logs")
}

enum AuditAction {
  // Tickets
  TICKET_CREATED
  TICKET_UPDATED
  TICKET_APPROVED
  TICKET_REJECTED
  TICKET_DELETED
  
  // Transactions
  PAYMENT_INITIATED
  PAYMENT_SUCCEEDED
  PAYMENT_FAILED
  ESCROW_RELEASED
  TRANSACTION_REFUNDED
  
  // Litiges
  DISPUTE_OPENED
  DISPUTE_RESOLVED
  
  // KYC
  KYC_ATTEMPTED
  KYC_VERIFIED
  KYC_REJECTED
  
  // Admin
  ADMIN_LOGIN
  USER_SUSPENDED
  USER_DELETED
  TRUST_SCORE_MODIFIED
  
  // Système
  CRON_JOB_EXECUTED
  WEBHOOK_RECEIVED
}
```

**Rétention** : 3 ans (compliance bancaire + RGPD)

---

## Relations & Cardinalités
```
┌─────────┐
│  User   │
└────┬────┘
     │
     ├─── 1:N ──→ Ticket (seller)
     ├─── 1:N ──→ Transaction (buyer)
     ├─── 1:N ──→ Transaction (seller)
     ├─── 1:N ──→ Dispute (reporter)
     ├─── 1:N ──→ Review (reviewer)
     ├─── 1:N ──→ Review (reviewed_user)
     └─── 1:N ──→ Notification

┌─────────┐
│  Event  │
└────┬────┘
     │
     └─── 1:N ──→ Ticket

┌─────────┐
│ Ticket  │
└────┬────┘
     │
     └─── 1:1 ──→ Transaction

┌──────────────┐
│ Transaction  │
└──────┬───────┘
       │
       ├─── 1:1? ──→ Dispute
       └─── 1:1? ──→ Review
```

---

## Migrations Prisma

### Commandes Essentielles
```bash
# Créer migration
npx prisma migrate dev --name add_tickets_table

# Appliquer migrations production
npx prisma migrate deploy

# Générer Prisma Client
npx prisma generate

# Ouvrir Prisma Studio (GUI DB)
npx prisma studio

# Reset DB (dev uniquement, DANGER)
npx prisma migrate reset
```

### Exemple Migration Manuelle

Si besoin d'ajouter contrainte SQL custom :
```sql
-- migrations/20250217_add_price_constraint.sql

-- Empêcher prix de revente > prix facial
ALTER TABLE tickets
ADD CONSTRAINT check_legal_price 
CHECK (selling_price <= original_price);

-- Index pour performance recherche
CREATE INDEX idx_tickets_event_status 
ON tickets(event_id, status) 
WHERE status = 'ACTIVE';
```

---

## Seed Data (Développement)

Fichier `prisma/seed.ts` pour données de test.
```typescript
import { Prisma Client } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  await prisma.user.create({
    data: {
      email: 'admin@billets-ethiques.fr',
      supabase_user_id: '...',
      first_name: 'Admin',
      last_name: 'Platform',
      role: 'ADMIN',
      kyc_status: 'VERIFIED',
    },
  });

  // Événement test
  const event = await prisma.event.create({
    data: {
      name: 'Coldplay - Music of the Spheres World Tour',
      slug: 'coldplay-paris-2025',
      artist: 'Coldplay',
      genre: 'Pop Rock',
      venue_name: 'Stade de France',
      venue_address: 'ZAC du Cornillon Nord, Saint-Denis',
      city: 'Paris',
      postal_code: '93200',
      country: 'FR',
      event_date: new Date('2025-07-15T20:00:00Z'),
      doors_open_time: '19:00',
      is_verified: true,
    },
  });

  // Vendeur test
  const seller = await prisma.user.create({
    data: {
      email: 'vendeur@test.fr',
      supabase_user_id: '...',
      first_name: 'Jean',
      last_name: 'Vendeur',
      role: 'SELLER',
      kyc_status: 'VERIFIED',
      stripe_account_id: 'acct_test123',
      trust_score: 85,
    },
  });

  // Billet test
  await prisma.ticket.create({
    data: {
      event_id: event.id,
      seller_id: seller.id,
      status: 'ACTIVE',
      original_price: 89.50,
      selling_price: 85.00,
      seat_category: 'Carré Or',
      seat_number: 'A12',
      pdf_url: 'https://cdn.uploadcare.com/test.pdf',
      pdf_hash: 'abc123...',
      barcode_number: '123456789',
      verification_status: 'APPROVED',
    },
  });

  console.log('✅ Seed completed');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

**Exécution** :
```bash
npx prisma db seed
```

---

## Optimisations Performance

### 1. Index Composites (Requêtes Fréquentes)
```prisma
// Marketplace: événements à venir avec billets actifs
@@index([event_date, city, is_verified])

// Dashboard vendeur: billets actifs triés par date
@@index([seller_id, status, created_at])

// Admin: queue validation triée par ancienneté
@@index([verification_status, created_at])
```

### 2. Dénormalisation Contrôlée

Colonnes calculées pour éviter COUNT() coûteux :
```prisma
model Event {
  // ...
  tickets_available Int @default(0) // Recalculé via trigger
}

model User {
  // ...
  total_sales Int @default(0) // Incrémenté à chaque vente
}
```

### 3. Partitioning (Si > 1M transactions)
```sql
-- Partitioning par mois (PostgreSQL 12+)
CREATE TABLE transactions_2025_01 PARTITION OF transactions
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE transactions_2025_02 PARTITION OF transactions
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

---

## Backup & Restore

### Backup Automatique Supabase

- Fréquence : Quotidien (2h du matin)
- Rétention : 7 jours (tier gratuit), 30 jours (tier payant)
- Point-in-Time Recovery : Dernières 24h

### Backup Manuel (Avant Migration Critique)
```bash
# Backup via pg_dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20250217.sql
```

---

## Monitoring DB

### Métriques à Surveiller

- ✅ **Connexions actives** : Max 100 (Supabase default)
- ✅ **Requêtes lentes** : > 1s → optimiser
- ✅ **Taille DB** : Alerte si > 80% quota
- ✅ **Index usage** : Vérifier si utilisés (pg_stat_user_indexes)

### Requêtes Utiles
```sql
-- Top 10 requêtes lentes
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Index non utilisés (à supprimer)
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Taille tables
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Checklist Avant Production

- [ ] Toutes migrations appliquées (`prisma migrate deploy`)
- [ ] Seed data supprimé (pas de données test)
- [ ] Index créés sur colonnes critiques
- [ ] Contraintes légales actives (check_legal_price)
- [ ] Backup automatique configuré
- [ ] Monitoring Supabase activé
- [ ] Logs erreurs Sentry configurés
- [ ] Foreign keys vérifiées (intégrité référentielle)
- [ ] Enums synchronisés frontend/backend
- [ ] Documentation mise à jour

---

**Dernière mise à jour** : 2025-02-17
**Version schéma** : 1.0.0 (MVP)
**Prisma version** : 5.14+