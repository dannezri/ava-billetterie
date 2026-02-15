# 🗄️ Configuration Prisma - AVA Billetterie

**Date:** 15 février 2026  
**Status:** ✅ Base de données configurée et seedée

---

## 📊 Schéma de Base de Données

### Tables Créées (7)

#### 1. **Users** 👥
```prisma
model User {
  id               String   @id @default(uuid())
  email            String   @unique
  name             String?
  phone            String?
  kycStatus        KYCStatus @default(PENDING)
  kycProviderId    String?
  verifiedIdentity Boolean   @default(false)
  stripeAccountId  String?
  trustScore       Int       @default(50)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

**Champs Clés:**
- `email` - Email unique (authentification)
- `name` - Nom complet de l'utilisateur
- `kycStatus` - Statut KYC (PENDING, VERIFIED, REJECTED)
- `verifiedIdentity` - Identité vérifiée via Stripe Identity
- `stripeAccountId` - Compte Stripe Connect
- `trustScore` - Score de confiance (0-100)

---

#### 2. **Events** 🎭
```prisma
model Event {
  id            String    @id @default(uuid())
  title         String
  description   String?
  artist        String?
  venue         String
  city          String
  country       String    @default("France")
  eventDate     DateTime
  doorsOpenTime String?
  category      String?
  imageUrl      String?
  officialUrl   String?
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

**Champs Clés:**
- `title` - Nom de l'événement
- `artist` - Artiste/Équipe (optionnel)
- `venue` - Lieu de l'événement
- `eventDate` - Date et heure de l'événement
- `category` - Catégorie (Concert, Sport, Festival, Spectacle)
- `imageUrl` - Image de l'événement
- `isVerified` - Événement vérifié par la plateforme

---

#### 3. **Tickets** 🎟️
```prisma
model Ticket {
  id                 String   @id @default(uuid())
  eventId            String
  sellerId           String
  status             TicketStatus @default(DRAFT)
  originalPrice      Decimal?
  price              Decimal
  section            String?
  row                String?
  seatNumber         String?
  pdfUrl             String?
  pdfHash            String?
  barcodeNumber      String?
  verificationStatus TicketVerificationStatus @default(PENDING)
  rejectionReason    String?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  expiresAt          DateTime?
}
```

**Statuts Possibles:**
- `DRAFT` - Brouillon (non publié)
- `PENDING_VALIDATION` - En attente de validation
- `ACTIVE` - Actif et disponible à l'achat
- `RESERVED` - Réservé temporairement
- `SOLD` - Vendu
- `CANCELLED` - Annulé
- `FLAGGED` - Signalé (suspect)

**Statuts de Vérification:**
- `PENDING` - En attente de vérification
- `APPROVED` - Vérifié et approuvé
- `REJECTED` - Rejeté

---

#### 4. **Transactions** 💳
```prisma
model Transaction {
  id                    String   @id @default(uuid())
  ticketId              String   @unique
  buyerId               String
  sellerId              String
  amount                Decimal
  platformFee           Decimal
  stripePaymentIntentId String
  stripeTransferId      String?
  status                TransactionStatus @default(PENDING)
  escrowReleaseDate     DateTime
  releasedAt            DateTime?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

**Statuts:**
- `PENDING` - En attente de paiement
- `ESCROWED` - Fonds bloqués en escrow
- `RELEASED` - Fonds transférés au vendeur
- `REFUNDED` - Remboursé à l'acheteur
- `DISPUTED` - En litige

---

#### 5. **Disputes** ⚖️
```prisma
model Dispute {
  id              String   @id @default(uuid())
  transactionId   String   @unique
  reporterId      String
  reason          DisputeReason @default(OTHER)
  description     String
  evidenceUrls    String[]
  status          DisputeStatus @default(OPEN)
  resolutionNotes String?
  resolvedAt      DateTime?
  createdAt       DateTime  @default(now())
}
```

**Raisons:**
- `FAKE_TICKET` - Billet frauduleux
- `NO_ACCESS` - Accès refusé à l'événement
- `DUPLICATE` - Billet en double
- `OTHER` - Autre raison

---

#### 6. **Reviews** ⭐
```prisma
model Review {
  id             String   @id @default(uuid())
  transactionId  String   @unique
  reviewerId     String
  reviewedUserId String
  rating         Int
  comment        String?
  createdAt      DateTime  @default(now())
}
```

**Rating:** 1-5 étoiles

---

#### 7. **AuditLogs** 📝
```prisma
model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    AuditAction @default(ADMIN_ACTION)
  metadata  Json
  ipAddress String
  userAgent String
  createdAt DateTime  @default(now())
}
```

**Actions:**
- `TICKET_UPLOAD` - Upload de billet
- `KYC_ATTEMPT` - Tentative de vérification KYC
- `PAYMENT` - Paiement
- `DISPUTE_CREATED` - Création de litige
- `ADMIN_ACTION` - Action administrateur

---

## 🌱 Données de Seed

### 3 Utilisateurs
1. **Alice Martin** - Vérifiée, Trust Score: 85
2. **Bob Dupont** - Vérifié, Trust Score: 92
3. **Charlie Dubois** - En attente de vérification, Trust Score: 50

### 5 Événements

#### 1. 🎤 The Weeknd - After Hours World Tour
- **Lieu:** Accor Arena, Paris
- **Date:** 15 juin 2026, 20:00
- **Catégorie:** Concert
- **Billets disponibles:** 3

#### 2. 🎾 Roland-Garros 2026 - Finale Homme
- **Lieu:** Stade Roland-Garros, Paris
- **Date:** 7 juin 2026, 15:00
- **Catégorie:** Sport
- **Billets disponibles:** 2

#### 3. 🎵 Daft Punk Reunion Concert
- **Lieu:** Stade de France, Saint-Denis
- **Date:** 14 juillet 2026, 21:00
- **Catégorie:** Concert
- **Billets disponibles:** 2

#### 4. 🎪 Festival Coachella Valley - Pass 3 Jours
- **Lieu:** Empire Polo Club, Indio, États-Unis
- **Date:** 10 avril 2026, 12:00
- **Catégorie:** Festival
- **Billets disponibles:** 2

#### 5. 🎭 Cirque du Soleil - Alegría
- **Lieu:** Chapiteau Grand Palais Éphémère, Paris
- **Date:** 20 mai 2026, 20:30
- **Catégorie:** Spectacle
- **Billets disponibles:** 2

### 11 Billets
- 10 billets actifs (ACTIVE, vérifiés)
- 1 billet en attente de validation (PENDING_VALIDATION)
- Prix: de 85€ à 1200€

---

## 🚀 Commandes Prisma

### Générer le Client
```bash
npm run prisma:generate
# ou
npx prisma generate
```

### Créer/Appliquer les Tables
```bash
npx prisma db push
```

### Seed la Base de Données
```bash
npm run prisma:seed
# ou
npx prisma db seed
```

### Ouvrir Prisma Studio
```bash
npm run prisma:studio
# ou
npx prisma studio
```

Puis ouvrir: http://localhost:5555

### Reset la Base de Données
```bash
npx prisma migrate reset
```
⚠️ **Attention:** Supprime toutes les données et recrée les tables + seed

---

## 🔧 Configuration

### package.json
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### Variables d'environnement
```env
DATABASE_URL="postgresql://..."
```

---

## 📁 Structure des Fichiers

```
prisma/
├── schema.prisma          # Schéma de base de données
├── seed.ts               # Script de seed
└── migrations/           # Historique des migrations
    └── 20260215_init/
        └── migration.sql
```

---

## 🔍 Vérification

### Prisma Studio
Pour visualiser les données:
```bash
npm run prisma:studio
```

### Supabase Dashboard
URL: https://supabase.com/dashboard/project/njogpuyhodyvzppislsb/editor

---

## ✅ Checklist

- [x] Schéma Prisma créé (7 tables)
- [x] Client Prisma généré
- [x] Tables créées dans la base de données
- [x] Script de seed créé
- [x] Base de données seedée (3 users, 5 events, 11 tickets)
- [x] Migration initiale marquée comme appliquée
- [x] Configuration package.json
- [x] Documentation complète

---

## 🎯 Prochaines Étapes

1. **Créer les tRPC routers** pour accéder aux données
2. **Implémenter l'authentification** Supabase + Prisma
3. **Créer les API endpoints** pour les opérations CRUD
4. **Tester les requêtes** avec Prisma Studio
5. **Développer les pages** utilisant les données réelles

---

## 📚 Resources

- **Prisma Documentation:** https://www.prisma.io/docs
- **Prisma Client API:** https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
- **Supabase + Prisma:** https://supabase.com/docs/guides/integrations/prisma

---

**Créé le:** 15 février 2026  
**Status:** ✅ Base de données opérationnelle  
**Environnement:** Production (Supabase)
