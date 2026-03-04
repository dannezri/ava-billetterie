# Workflow Upload Billet - Contexte pour Cursor

## Objectif Métier
Permettre à un vendeur vérifié (KYC OK) d'uploader un PDF de billet pour validation manuelle admin.

## Contraintes Légales
- Prix de revente DOIT être ≤ prix facial (Art. 313-6-2 Code pénal français)
- KYC obligatoire avant upload

## Flow Technique

### 1. Pré-requis
- User authentifié (Supabase session)
- `users.kyc_status = 'verified'`
- Redirection vers `/seller/kyc` si non vérifié

### 2. Upload PDF
**Frontend** :
- React Dropzone
- Validation client : PDF uniquement, max 5MB
- Upload direct vers Uploadcare (pas transit serveur)

**Backend** :
- Génération URL présignée Uploadcare
- Callback webhook après upload
- Extraction métadonnées PDF (pdf-parse npm)

### 3. Extraction Données
**À extraire du PDF** :
- Code-barres / Numéro billet (regex patterns)
- Prix facial (patterns billetteries françaises)
- Nom événement (optionnel, validation manuelle)

**Détection doublons** :
- Calcul SHA-256 hash du fichier
- Query DB : `SELECT * FROM tickets WHERE pdf_hash = ? OR barcode_number = ?`
- Rejet immédiat si doublon

### 4. Création Record DB
```typescript
status: 'pending_validation'
seller_id: session.user.id
pdf_url: uploadcare_url
pdf_hash: sha256_hash
barcode_number: extracted_barcode
original_price: extracted_price (si trouvé)
```

### 5. Email Vendeur
"Votre billet a été soumis pour validation. Vous recevrez une réponse sous 24h."

## Fichiers à Créer/Modifier
- `/src/app/seller/tickets/new/page.tsx` (UI form)
- `/src/app/api/seller/tickets/upload/route.ts` (endpoint upload)
- `/src/app/api/seller/tickets/process-pdf/route.ts` (extraction)
- `/src/lib/services/pdf-extractor.service.ts` (logique extraction)
- `/src/lib/services/duplicate-detector.service.ts` (hash + query)

## Types TypeScript
```typescript
// /src/types/ticket.types.ts
export enum TicketStatus {
  DRAFT = 'draft',
  PENDING_VALIDATION = 'pending_validation',
  ACTIVE = 'active',
  SOLD = 'sold',
  REJECTED = 'rejected',
}

export interface ITicketCreate {
  eventId: string;
  sellingPrice: number;
  originalPrice: number;
  seatCategory: string;
  seatNumber?: string;
  pdfUrl: string;
  pdfHash: string;
  barcodeNumber?: string;
}
```

## Dépendances Requises
```json
{
  "uploadcare-widget": "^3.21.0",
  "pdf-parse": "^1.1.1",
  "crypto": "built-in Node.js"
}
```

## Validation Zod
```typescript
export const ticketCreateSchema = z.object({
  eventId: z.string().uuid(),
  sellingPrice: z.number().positive(),
  originalPrice: z.number().positive(),
  seatCategory: z.string().min(1),
  pdfFile: z.instanceof(File)
    .refine((file) => file.type === 'application/pdf')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'Max 5MB'),
}).refine(
  (data) => data.sellingPrice <= data.originalPrice,
  { message: 'Prix de vente doit être ≤ prix facial', path: ['sellingPrice'] }
);
```

## Erreurs à Gérer
- PDF corrompu → "Fichier illisible, veuillez réessayer"
- Doublon détecté → "Ce billet a déjà été listé"
- KYC non vérifié → Redirect `/seller/kyc`
- Uploadcare erreur → "Erreur serveur, réessayez"
```

---

#### **Étape 2 : Prompt Initial à Cursor (Composer)**

Ouvre **Cursor Composer** (`Cmd+I` ou `Ctrl+I`) et colle :
```
Je vais créer le système d'upload de billets PDF pour vendeurs vérifiés.

CONTEXTE :
Lis attentivement le fichier @docs/workflows/upload-billet-workflow.md qui contient tout le contexte métier, les contraintes légales, et le flow technique détaillé.

OBJECTIF SESSION :
Créer le formulaire upload + endpoint API + service extraction PDF.

STACK :
- Next.js 14 App Router
- Prisma ORM (schéma dans @prisma/schema.prisma)
- TypeScript strict
- Uploadcare pour stockage
- Zod pour validation

CONVENTIONS :
Respecte les conventions définies dans @.eslintrc.json et @CONTRIBUTING.md

ÉTAPES :
1. Crée d'abord le type TypeScript ITicketCreate dans /src/types/ticket.types.ts
2. Crée le schéma Zod ticketCreateSchema dans /src/lib/validations/ticket.validation.ts
3. Crée le service pdf-extractor.service.ts avec fonction extractPDFMetadata()
4. Crée l'endpoint API /api/seller/tickets/upload
5. Crée la page UI /seller/tickets/new avec React Hook Form + Uploadcare Widget

Commence par l'étape 1 et attends ma validation avant de passer à la suivante.
```

---

#### **Étape 3 : Itération Progressive**

Cursor va générer le code pour l'étape 1. **VÉRIFIE** :
- Types cohérents avec schema Prisma
- Respect conventions (interface avec `I` prefix)
- Imports corrects

**Valide ou corrige** :
```
✅ Valide, passe à l'étape 2 : schéma Zod

OU

❌ Correction : l'interface ITicketCreate doit inclure sellerId: string
```

**Continue ainsi** jusqu'à la fin des 5 étapes.

---

#### **Étape 4 : Tests & Debugging**

Une fois tout généré, demande :
```
Maintenant, créons les tests unitaires pour pdf-extractor.service.ts

Utilise Jest + @testing-library/react
Mocks : 
- Uploadcare
- Prisma Client
- Crypto (pour hash SHA-256)

Teste les cas :
1. Extraction réussie (PDF valide avec code-barres)
2. PDF corrompu (erreur thrown)
3. Doublon détecté (rejection)
4. Prix facial non trouvé (fallback manuel)

Génère les tests dans /src/lib/services/__tests__/pdf-extractor.service.test.ts
```

---

#### **Étape 5 : Intégration**
```
Vérifions l'intégration complète :

1. La page /seller/tickets/new appelle-t-elle correctement l'API ?
2. Les erreurs sont-elles gérées (toast notifications) ?
3. Le redirect post-upload fonctionne-t-il ?

Ajoute les toasts avec sonner (npm i sonner) et teste le flow end-to-end.
```

---

## 🎨 PROMPTS SPÉCIALISÉS PAR TYPE DE TÂCHE

### **A. Créer un Composant UI**
```
Crée le composant TicketCard pour afficher un billet sur la marketplace.

DESIGN SPECS :
- Utilise shadcn/ui Card component (@/components/ui/card)
- Tailwind CSS uniquement
- Responsive mobile-first

CONTENU :
- Image événement (Next.js Image optimisée)
- Nom événement + date
- Prix (badge avec €)
- Trust Score vendeur (gauge circulaire, lib recharts)
- Bouton "Acheter maintenant" (variant primary)
- Badge "Vérifié" si ticket.verification_status === 'approved'

PROPS :
```typescript
interface ITicketCardProps {
  ticket: {
    id: string;
    event: { name: string; date: Date; imageUrl: string };
    sellingPrice: number;
    seller: { pseudo: string; trustScore: number };
    verificationStatus: 'pending' | 'approved' | 'rejected';
  };
  onBuyClick: (ticketId: string) => void;
}
```

ACCESSIBILITÉ :
- ARIA labels complets
- Focus states visibles
- Screen reader friendly

Génère le fichier /src/components/marketplace/TicketCard.tsx
```

---

### **B. Créer un Endpoint API**
```
Crée l'endpoint API POST /api/payments/create-intent pour initialiser un paiement Stripe avec séquestre.

CONTEXTE MÉTIER :
Lis @docs/workflows/achat-workflow.md section "Paiement avec Séquestre"

FLOW :
1. Récupérer ticketId depuis body
2. Vérifier que ticket.status === 'active' (pas déjà vendu)
3. Créer transaction DB (status: 'pending')
4. Réserver ticket (UPDATE status = 'reserved') avec timer 15min
5. Créer Stripe Payment Intent avec :
   - amount = ticket.sellingPrice + platform_fee (5%)
   - metadata = { ticketId, eventDate }
   - transfer_data = { destination: seller.stripe_account_id }
   - on_behalf_of = seller.stripe_account_id
6. Retourner client_secret

SÉCURITÉ :
- Rate limiting : 5 requêtes/minute (upstash/ratelimit)
- Authentification Supabase obligatoire
- Validation Zod du body

GESTION ERREURS :
- Ticket non trouvé → 404
- Ticket déjà vendu → 409 Conflict
- Stripe erreur → 500 + log Sentry

CODE :
Génère /src/app/api/payments/create-intent/route.ts
Utilise @/lib/stripe (à créer si nécessaire)
```

---

### **C. Créer un Service Métier**
```
Crée le service TrustScoreService pour calculer le Trust Score des vendeurs.

ALGORITHME (décrit dans @docs/workflows/trust-score-algorithm.md) :
Base 70 points + bonus/malus :
- +2 points par vente réussie (max +20)
- -20 points par litige perdu
- +5 points par avis 5 étoiles
- -10 points par avis 1-2 étoiles
- +10 points si KYC vérifié depuis >6 mois
- Score final entre 0 et 100

MÉTHODES :
```typescript
class TrustScoreService {
  async calculateScore(userId: string): Promise<number>
  async recalculateAllScores(): Promise<void> // Cron job
  async getScoreBreakdown(userId: string): Promise<IScoreBreakdown>
}

interface IScoreBreakdown {
  baseScore: number;
  salesBonus: number;
  disputesMalus: number;
  reviewsBonus: number;
  kycBonus: number;
  finalScore: number;
}
```

CONTRAINTES :
- Cache Redis pour éviter recalculs fréquents (TTL 1h)
- Transaction DB atomique lors update users.trust_score
- Logs détaillés (audit)

TESTS :
Génère aussi les tests unitaires avec cas limites (vendeur nouveau, vendeur banni, etc.)

Crée /src/lib/services/trust-score.service.ts
```

---

### **D. Créer une Page Complexe (Dashboard)**
```
Crée le Dashboard Admin principal /admin page.

CONTEXTE :
Lis @docs/architecture.md section "Pages Admin"

LAYOUT :
- Sidebar fixe gauche (navigation admin)
- Header avec user menu + notifications
- Grille 4 colonnes (responsive)

WIDGETS :
1. Métriques Clés (Cards shadcn/ui)
   - Transactions aujourd'hui (montant + nb)
   - Utilisateurs actifs 24h
   - Billets en validation (badge alerte si > 10)
   - Litiges ouverts (badge urgent si > 5)

2. Graphique GMV (recharts LineChart)
   - 30 derniers jours
   - Données depuis /api/admin/analytics/overview

3. Tableau Dernières Transactions
   - 10 dernières transactions
   - Colonnes : ID, Acheteur, Montant, Statut, Date
   - Lien vers détail transaction

4. Alertes Système (liste)
   - Erreurs critiques Sentry (API)
   - Webhooks Stripe échoués

PERMISSIONS :
- Middleware vérification role === 'admin'
- Redirect /dashboard si non admin

ÉTAT :
- React Query pour fetch data
- Loading skeletons (shadcn/ui Skeleton)
- Error boundaries

Génère /src/app/admin/page.tsx + layout.tsx
```

---

## 🔧 PROMPTS POUR DEBUGGING

### **Erreur TypeScript**
```
J'ai une erreur TypeScript dans @src/app/api/tickets/upload/route.ts ligne 42 :

"Type 'string | undefined' is not assignable to type 'string'"

Voici le code concerné :
[colle le code]

CONTEXTE :
La variable barcodeNumber vient de l'extraction PDF et peut être undefined si non trouvé.
Le schéma Prisma définit barcode_number comme String? (optionnel).

Corrige en :
1. Gérant le cas undefined proprement
2. Respectant le typage strict
3. Ajoutant un commentaire explicatif
```

---

### **Bug Logique Métier**
```
Bug détecté : le séquestre se libère immédiatement au lieu d'attendre J+2.

CODE CONCERNÉ :
@src/app/api/cron/release-escrow/route.ts

COMPORTEMENT ATTENDU (workflow) :
@docs/workflows/achat-workflow.md section "Libération Séquestre"

SYMPTÔME :
Les transactions passent de 'escrowed' à 'released' dès la confirmation paiement.

HYPOTHÈSE :
Calcul incorrect de escrow_release_date OU condition WHERE du cron job bugguée.

DEBUG :
1. Vérifie le calcul de escrow_release_date dans /api/payments/create-intent
2. Vérifie la query Prisma dans le cron job
3. Ajoute des logs console.log pour tracer les dates
4. Propose un fix + test unitaire
```

---

### **Performance Problème**
```
La page /events est très lente (3-4 secondes de chargement).

ANALYSE INITIALE :
- 500 événements en DB
- Chaque événement fait une query séparée pour compter les billets disponibles
- Problème N+1 queries

OBJECTIF :
Optimiser pour < 500ms.

PISTES :
1. Utilise Prisma include avec count des billets
2. Ajoute pagination (10 événements par page)
3. Cache Redis côté serveur (TTL 5 min)
4. Optimise les index DB (vérifie @prisma/schema.prisma)

Propose une solution complète avec :
- Code optimisé
- Migrations Prisma si besoin
- Benchmarks avant/après