# Conventions de Code - Plateforme Billets Éthique

## Vue d'Ensemble

Ce document définit les conventions de code strictes à respecter pour garantir la cohérence, la maintenabilité et la qualité du projet.

**Principe fondamental** : Le code est lu 10 fois plus souvent qu'il n'est écrit. Privilégiez la clarté à la concision.

---

## Table des Matières

1. [Naming Conventions](#1-naming-conventions)
2. [Structure Fichiers](#2-structure-fichiers)
3. [TypeScript](#3-typescript)
4. [React & Next.js](#4-react--nextjs)
5. [Styling (Tailwind)](#5-styling-tailwind)
6. [API Routes](#6-api-routes)
7. [Base de Données (Prisma)](#7-base-de-données-prisma)
8. [Validation (Zod)](#8-validation-zod)
9. [Gestion d'Erreurs](#9-gestion-derreurs)
10. [Tests](#10-tests)
11. [Git & Commits](#11-git--commits)
12. [Commentaires & Documentation](#12-commentaires--documentation)

---

## 1. Naming Conventions

### Variables & Fonctions

**camelCase** pour variables, fonctions, méthodes :
```typescript
// ✅ CORRECT
const totalAmount = 52.50;
const userId = "user-uuid-1";
function calculatePlatformFee(amount: number) { }
const handleSubmit = async () => { };

// ❌ INCORRECT
const TotalAmount = 52.50;
const user_id = "user-uuid-1";
function CalculatePlatformFee(amount: number) { }
```

**Constantes globales** : UPPER_SNAKE_CASE
```typescript
// ✅ CORRECT
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const PLATFORM_FEE_PERCENT = 0.05;
const RESERVATION_TIMEOUT_MS = 15 * 60 * 1000;

// ❌ INCORRECT
const maxFileSize = 5 * 1024 * 1024;
const platformFeePercent = 0.05;
```

**Booléens** : Préfixer avec `is`, `has`, `should`, `can`
```typescript
// ✅ CORRECT
const isVerified = true;
const hasKYC = user.kyc_status === 'VERIFIED';
const canOpenDispute = checkDisputeEligibility();
const shouldShowBanner = !user.email_verified;

// ❌ INCORRECT
const verified = true;
const kyc = user.kyc_status === 'VERIFIED';
```

---

### Interfaces & Types

**Interfaces** : Préfixe `I` + PascalCase
```typescript
// ✅ CORRECT
interface IUser {
  id: string;
  email: string;
}

interface ITicketCreate {
  event_id: string;
  selling_price: number;
}

interface IEventFilters {
  cities?: string[];
  priceRange?: { min: number; max: number };
}

// ❌ INCORRECT
interface User { } // Pas de préfixe I
interface ticketCreate { } // Pas PascalCase
```

**Types** : PascalCase (sans préfixe)
```typescript
// ✅ CORRECT
type TicketStatus = 'ACTIVE' | 'RESERVED' | 'SOLD';
type TransactionStatus = 'PENDING' | 'ESCROWED' | 'RELEASED';
type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

// ❌ INCORRECT
type ITicketStatus = 'ACTIVE' | 'RESERVED'; // Pas de I pour types
type ticket_status = 'ACTIVE' | 'RESERVED'; // Pas snake_case
```

**Enums** : PascalCase (clés et valeurs UPPER_CASE)
```typescript
// ✅ CORRECT
enum TicketStatus {
  ACTIVE = 'ACTIVE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
}

enum DisputeReason {
  FAKE_TICKET = 'FAKE_TICKET',
  NO_ACCESS = 'NO_ACCESS',
  DUPLICATE = 'DUPLICATE',
}

// ❌ INCORRECT
enum ticketStatus { } // Pas PascalCase
enum TicketStatus {
  active = 'ACTIVE', // Clé pas UPPER_CASE
}
```

---

### Composants React

**PascalCase** pour composants, fichiers `.tsx`
```typescript
// ✅ CORRECT
// Fichier : /src/components/marketplace/EventCard.tsx
export function EventCard({ event }: IEventCardProps) { }

// Fichier : /src/components/buyer/purchases/PurchaseDetail.tsx
export default function PurchaseDetail() { }

// ❌ INCORRECT
// Fichier : eventCard.tsx
export function eventCard() { }
```

**Props Interfaces** : `{ComponentName}Props` avec préfixe `I`
```typescript
// ✅ CORRECT
interface IEventCardProps {
  event: {
    id: string;
    name: string;
  };
  onBuyClick: (eventId: string) => void;
}

export function EventCard({ event, onBuyClick }: IEventCardProps) { }

// ❌ INCORRECT
interface EventCardPropsInterface { } // Trop verbeux
interface Props { } // Trop générique
```

---

### Fichiers

**Composants** : PascalCase.tsx
```
EventCard.tsx
TicketsList.tsx
PurchaseDetail.tsx
```

**Utilities** : kebab-case.ts
```
format-price.ts
calculate-trust-score.ts
generate-presigned-url.ts
```

**Services** : kebab-case.service.ts
```
transaction.service.ts
notification.service.ts
payment.service.ts
```

**Hooks** : camelCase avec préfixe `use`
```
useAuth.ts
useTicket.ts
usePayment.ts
```

**API Routes** : kebab-case ou REST conventions
```
route.ts (pour GET /api/events)
create-intent/route.ts (pour POST /api/payments/create-intent)
[id]/route.ts (pour GET/PATCH /api/tickets/[id])
```

---

## 2. Structure Fichiers

### Organisation Dossiers
```
/src
├── app/                          # Next.js App Router
│   ├── (public)/                 # Route group public
│   │   ├── page.tsx              # Landing page
│   │   ├── events/
│   │   │   ├── page.tsx          # Liste événements
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Détail événement
│   │   └── layout.tsx            # Layout public
│   ├── (auth)/                   # Authentification
│   ├── (buyer)/                  # Pages acheteur
│   ├── (seller)/                 # Pages vendeur
│   ├── (admin)/                  # Pages admin
│   └── api/                      # API Routes
│       ├── events/
│       │   ├── route.ts          # GET /api/events
│       │   └── [id]/
│       │       └── route.ts      # GET /api/events/[id]
│       └── webhooks/
│           └── stripe/
│               └── route.ts
│
├── components/                   # Composants React
│   ├── ui/                       # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── dialog.tsx
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── marketplace/              # Marketplace composants
│   │   ├── EventCard.tsx
│   │   ├── TicketCard.tsx
│   │   └── EventFilters.tsx
│   ├── buyer/                    # Composants acheteur
│   │   └── purchases/
│   │       └── PurchaseDetail.tsx
│   ├── seller/                   # Composants vendeur
│   └── shared/                   # Composants réutilisables
│       ├── Countdown.tsx
│       └── StatusBadge.tsx
│
├── lib/                          # Utilitaires & Services
│   ├── services/                 # Logique métier
│   │   ├── transaction.service.ts
│   │   ├── payment.service.ts
│   │   └── notification.service.ts
│   ├── validations/              # Schémas Zod
│   │   ├── ticket.validation.ts
│   │   └── payment.validation.ts
│   ├── utils.ts                  # Helpers génériques
│   ├── constants.ts              # Constantes globales
│   ├── stripe.ts                 # Client Stripe
│   ├── supabase.ts               # Client Supabase (server)
│   └── prisma.ts                 # Client Prisma singleton
│
├── hooks/                        # Custom React Hooks
│   ├── useAuth.ts
│   ├── useTicket.ts
│   └── usePayment.ts
│
├── types/                        # Types TypeScript
│   ├── ticket.types.ts
│   ├── user.types.ts
│   └── api.types.ts
│
└── config/                       # Configuration
    ├── site.config.ts
    └── stripe.config.ts
```

---

## 3. TypeScript

### Règles Strictes

**tsconfig.json** :
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Interdictions** :
```typescript
// ❌ JAMAIS utiliser any (sauf force majeure documentée)
function processData(data: any) { } // INTERDIT

// ✅ Utiliser unknown et type narrowing
function processData(data: unknown) {
  if (typeof data === 'string') {
    // data est string ici
  }
}

// ❌ Assertions non justifiées
const user = data as IUser; // Dangereux

// ✅ Validation avec Zod
const user = userSchema.parse(data); // Type-safe
```

**Type Inference** : Laisser TypeScript inférer quand évident
```typescript
// ✅ CORRECT (inférence)
const count = 5; // number inféré
const name = "Jean"; // string inféré

// ❌ INUTILE
const count: number = 5;
const name: string = "Jean";

// ✅ NÉCESSAIRE (type non évident)
const prices: number[] = [];
const users: IUser[] = await fetchUsers();
```

**Return Types** : Explicites pour fonctions publiques
```typescript
// ✅ CORRECT (fonction publique)
export function calculateTotal(
  price: number,
  fee: number
): number {
  return price + fee;
}

// ✅ CORRECT (fonction complexe)
async function createTransaction(
  ticketId: string
): Promise<ITransaction> {
  // ...
}

// ⚠️  ACCEPTABLE (fonction interne simple)
function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR');
}
```

---

## 4. React & Next.js

### Server vs Client Components

**Règle** : Server Component par défaut
```typescript
// ✅ Server Component (default)
// Pas de "use client", pas de hooks, pas d'event handlers
export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
  });
  
  return <EventDetails event={event} />;
}

// ✅ Client Component (uniquement si nécessaire)
"use client";
import { useState } from 'react';

export function BuyButton({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    // ...
  };
  
  return <Button onClick={handleClick}>Acheter</Button>;
}
```

**Quand utiliser "use client"** :
- Hooks React (useState, useEffect, useContext)
- Event handlers (onClick, onChange, onSubmit)
- Browser APIs (localStorage, window)
- Libraries client-only (React Hook Form, etc.)

---

### Props Destructuring

**Toujours destructurer** dans signature fonction :
```typescript
// ✅ CORRECT
interface IEventCardProps {
  event: IEvent;
  onBuyClick: (id: string) => void;
}

export function EventCard({ event, onBuyClick }: IEventCardProps) {
  return <div>{event.name}</div>;
}

// ❌ INCORRECT
export function EventCard(props: IEventCardProps) {
  return <div>{props.event.name}</div>; // Verbeux
}
```

**Children** :
```typescript
// ✅ CORRECT
interface ICardProps {
  children: React.ReactNode;
  title: string;
}

export function Card({ children, title }: ICardProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

---

### Conditional Rendering

**Préférer opérateur ternaire** pour JSX simple :
```typescript
// ✅ CORRECT (simple)
{isLoading ? <Spinner /> : <Content />}

// ✅ CORRECT (avec && pour affichage conditionnel)
{error && <ErrorMessage error={error} />}

// ❌ INCORRECT (if/else dans JSX)
{
  if (isLoading) {
    return <Spinner />;
  } else {
    return <Content />;
  }
}

// ✅ CORRECT (complexe : early return)
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage error={error} />;
return <Content />;
```

---

### Event Handlers

**Préfixe `handle`** pour event handlers :
```typescript
// ✅ CORRECT
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ...
};

const handleBuyClick = (ticketId: string) => {
  // ...
};

// ❌ INCORRECT
const onSubmit = () => { }; // Confusion avec props
const submit = () => { }; // Pas clair
```

**Props callbacks** : Préfixe `on`
```typescript
// ✅ CORRECT
interface ICardProps {
  onBuyClick: (id: string) => void;
  onFavoriteToggle: (id: string) => void;
}

<EventCard 
  event={event} 
  onBuyClick={handleBuyClick} 
/>
```

---

### Hooks Custom

**Préfixe `use`** obligatoire :
```typescript
// ✅ CORRECT
// Fichier : /src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<IUser | null>(null);
  // ...
  return { user, isAuthenticated: !!user };
}

// Utilisation
const { user, isAuthenticated } = useAuth();
```

**Organisation** :
```typescript
// ✅ Structure hook complexe
export function useTicket(ticketId: string) {
  // 1. State
  const [ticket, setTicket] = useState<ITicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // 2. Effects
  useEffect(() => {
    fetchTicket();
  }, [ticketId]);
  
  // 3. Handlers
  const handleRefresh = () => {
    fetchTicket();
  };
  
  // 4. Helper functions
  const fetchTicket = async () => {
    // ...
  };
  
  // 5. Return
  return { ticket, loading, error, refresh: handleRefresh };
}
```

---

## 5. Styling (Tailwind)

### Classes Ordering

**Ordre recommandé** (Prettier plugin tailwindcss):
1. Layout (flex, grid, block)
2. Positioning (relative, absolute)
3. Sizing (w-, h-, min-, max-)
4. Spacing (m-, p-)
5. Typography (text-, font-)
6. Colors (bg-, text-, border-)
7. Effects (shadow-, opacity-)
8. Transitions (transition-, duration-)
```typescript
// ✅ CORRECT (ordonné automatiquement par prettier-plugin-tailwindcss)
<div className="flex items-center justify-between w-full p-4 text-lg font-semibold bg-white border border-gray-200 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg">
  Content
</div>

// ❌ INCORRECT (désorganisé)
<div className="shadow-md bg-white p-4 w-full text-lg border-gray-200 flex rounded-lg">
  Content
</div>
```

### Utilisation `cn()` Utility

**Toujours utiliser `cn()`** pour classes conditionnelles :
```typescript
import { cn } from '@/lib/utils';

// ✅ CORRECT
<div className={cn(
  "px-4 py-2 rounded-md",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  Content
</div>

// ❌ INCORRECT (string templates fragiles)
<div className={`px-4 py-2 ${isActive ? 'bg-blue-500' : ''}`}>
  Content
</div>
```

**Définition `cn()`** :
```typescript
// /src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### Éviter Styles Inline
```typescript
// ❌ INCORRECT (styles inline)
<div style={{ marginTop: '20px', color: 'red' }}>
  Content
</div>

// ✅ CORRECT (Tailwind)
<div className="mt-5 text-red-500">
  Content
</div>
```

**Exception** : Valeurs dynamiques calculées
```typescript
// ✅ ACCEPTABLE
<div style={{ width: `${progress}%` }}>
  Progress bar
</div>
```

---

## 6. API Routes

### Structure Handler

**Template standard** :
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

// 1. Schéma validation
const requestSchema = z.object({
  ticket_id: z.string().uuid(),
});

// 2. Handler
export async function POST(request: NextRequest) {
  try {
    // A. Authentification (si requise)
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // B. Parse & Validate body
    const body = await request.json();
    const validated = requestSchema.parse(body);
    
    // C. Logique métier (via service si complexe)
    const result = await TicketService.reserveTicket(
      validated.ticket_id,
      session.user.id
    );
    
    // D. Response
    return NextResponse.json(result, { status: 201 });
    
  } catch (error) {
    // E. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    // Log erreur (Sentry)
    console.error('Ticket reservation failed:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Naming Routes

**REST conventions** :
```
GET    /api/tickets           → Liste
POST   /api/tickets           → Création
GET    /api/tickets/[id]      → Détail
PATCH  /api/tickets/[id]      → Modification
DELETE /api/tickets/[id]      → Suppression

POST   /api/tickets/reserve   → Action spécifique
GET    /api/tickets/favorites → Collection filtrée
```

---

## 7. Base de Données (Prisma)

### Naming Schema

**Tables** : snake_case, pluriel
```prisma
model User {
  @@map("users") // Nom table DB
}

model Transaction {
  @@map("transactions")
}
```

**Colonnes** : snake_case
```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  first_name        String    // ✅ snake_case
  kyc_status        KycStatus
  stripe_account_id String?   // ✅ snake_case
  created_at        DateTime  @default(now())
  
  @@map("users")
}
```

**Relations** : camelCase dans model (Prisma convention)
```prisma
model Transaction {
  id       String @id
  buyer_id String
  
  // ✅ Relation en camelCase
  buyer    User   @relation("BuyerTransactions", fields: [buyer_id], references: [id])
  
  @@map("transactions")
}
```

---

### Requêtes Prisma

**Toujours utiliser** `select` ou `include` explicitement :
```typescript
// ✅ CORRECT (explicite)
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    first_name: true,
    trust_score: true,
  },
});

// ⚠️  ÉVITER (retourne TOUTES colonnes)
const user = await prisma.user.findUnique({
  where: { id: userId },
});
```

**Includes imbriqués** : Limiter profondeur (max 2 niveaux)
```typescript
// ✅ CORRECT
const transaction = await prisma.transaction.findUnique({
  where: { id: transactionId },
  include: {
    ticket: {
      include: {
        event: true, // Niveau 2 max
      },
    },
    buyer: true,
  },
});

// ❌ ÉVITER (trop profond, lent)
include: {
  ticket: {
    include: {
      event: {
        include: {
          venue: {
            include: { city: true }, // Niveau 4 !
          },
        },
      },
    },
  },
}
```

---

### Transactions DB

**Utiliser `$transaction`** pour opérations atomiques :
```typescript
// ✅ CORRECT (atomique)
const result = await prisma.$transaction(async (tx) => {
  const ticket = await tx.ticket.update({
    where: { id: ticketId },
    data: { status: 'RESERVED' },
  });
  
  const transaction = await tx.transaction.create({
    data: {
      ticket_id: ticketId,
      buyer_id: userId,
      status: 'PENDING',
    },
  });
  
  return { ticket, transaction };
});

// ❌ INCORRECT (race condition possible)
const ticket = await prisma.ticket.update({ /* ... */ });
const transaction = await prisma.transaction.create({ /* ... */ });
```

---

## 8. Validation (Zod)

### Naming Schemas

**Suffixe `Schema`** :
```typescript
// ✅ CORRECT
export const ticketCreateSchema = z.object({
  event_id: z.string().uuid(),
  selling_price: z.number().positive(),
  original_price: z.number().positive(),
}).refine(
  (data) => data.selling_price <= data.original_price,
  { message: 'Prix de vente doit être ≤ prix facial' }
);

export const userSignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// ❌ INCORRECT
export const TicketCreate = z.object({ }); // Pas de Schema
export const ticket_create_schema = z.object({ }); // Pas camelCase
```

---

### Inférence Types

**Toujours inférer** types depuis schemas :
```typescript
// ✅ CORRECT
export const ticketCreateSchema = z.object({
  event_id: z.string().uuid(),
  selling_price: z.number(),
});

export type ITicketCreate = z.infer<typeof ticketCreateSchema>;

// Utilisation
function createTicket(data: ITicketCreate) {
  const validated = ticketCreateSchema.parse(data);
  // ...
}

// ❌ INCORRECT (duplication)
interface ITicketCreate {
  event_id: string;
  selling_price: number;
}
// Risque désynchronisation schema vs type
```

---

### Validation API

**Pattern standard** :
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validation
  const result = ticketCreateSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { 
        error: 'Validation failed',
        details: result.error.errors,
      },
      { status: 400 }
    );
  }
  
  // Utiliser result.data (type-safe)
  const ticket = await createTicket(result.data);
  // ...
}
```

---

## 9. Gestion d'Erreurs

### Try/Catch

**Obligatoire** pour API routes et opérations async :
```typescript
// ✅ CORRECT
export async function POST(request: NextRequest) {
  try {
    const result = await processPayment();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment failed:', error);
    
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
```

---

### Error Types

**Différencier** erreurs métier vs techniques :
```typescript
// ✅ CORRECT
class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

// Utilisation
if (ticket.status !== 'ACTIVE') {
  throw new BusinessError(
    'Ce billet n\'est plus disponible',
    'TICKET_NOT_AVAILABLE',
    409
  );
}

// Handler
catch (error) {
  if (error instanceof BusinessError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  // Erreur technique
  Sentry.captureException(error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

### Toast Notifications

**Frontend** : Messages utilisateur-friendly
```typescript
import { toast } from 'sonner';

// ✅ CORRECT (messages clairs)
try {
  await buyTicket(ticketId);
  toast.success('Billet réservé ! Finalisez votre achat.');
} catch (error) {
  if (error.code === 'TICKET_NOT_AVAILABLE') {
    toast.error('Désolé, ce billet vient d\'être vendu.');
  } else {
    toast.error('Une erreur est survenue. Réessayez.');
  }
}

// ❌ INCORRECT (messages techniques)
toast.error('Error: TICKET_NOT_AVAILABLE'); // Pas user-friendly
toast.error(error.message); // Peut exposer détails internes
```

---

## 10. Tests

### Naming

**Pattern** : `{filename}.test.ts` ou `{filename}.spec.ts`
```
/src/lib/services/__tests__/
  ├── transaction.service.test.ts
  ├── payment.service.test.ts
  └── trust-score.service.test.ts
```

**Describe blocks** : Nom fonction/composant
```typescript
// ✅ CORRECT
describe('TransactionService', () => {
  describe('createTransaction', () => {
    it('should create a transaction with PENDING status', async () => {
      // ...
    });
    
    it('should throw error if ticket is not available', async () => {
      // ...
    });
  });
});

// ❌ INCORRECT
describe('transaction tests', () => { }); // Trop vague
```

---

### Test Structure (AAA)

**Arrange - Act - Assert** :
```typescript
it('should calculate platform fee correctly', () => {
  // Arrange
  const ticketPrice = 100;
  const feePercent = 0.05;
  
  // Act
  const fee = calculatePlatformFee(ticketPrice, feePercent);
  
  // Assert
  expect(fee).toBe(5);
});
```

---

## 11. Git & Commits

### Commit Messages

**Format** : `type(scope): message`

**Types** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction bug
- `docs`: Documentation
- `style`: Formatage (pas de changement logique)
- `refactor`: Refactoring
- `test`: Ajout/modification tests
- `chore`: Tâches diverses (deps, config)

**Exemples** :
```bash
# ✅ CORRECT
feat(tickets): add PDF upload validation
fix(payments): correct escrow release date calculation
docs(api): update Stripe webhook documentation
refactor(services): extract payment logic to service
test(transaction): add unit tests for reserve function
chore(deps): upgrade Next.js to 14.2.1

# ❌ INCORRECT
added feature
fix bug
WIP
update
```

**Scope** : Nom module/page/composant (optionnel mais recommandé)

---

### Branches

**Pattern** :
```
main                    # Production
develop                 # Développement
feature/nom-feature     # Nouvelles fonctionnalités
fix/nom-bug             # Corrections bugs
hotfix/nom-urgent       # Corrections urgentes prod
```

**Exemples** :
```
feature/ticket-upload
feature/escrow-release
fix/payment-validation
hotfix/kyc-verification
```

---

## 12. Commentaires & Documentation

### JSDoc

**Fonctions publiques** : Toujours documenter
```typescript
/**
 * Calcule le montant total d'une transaction incluant les frais plateforme
 * 
 * @param ticketPrice - Prix du billet en euros
 * @param platformFeePercent - Pourcentage de frais (0-1, ex: 0.05 pour 5%)
 * @returns Montant total en euros avec 2 décimales
 * 
 * @example
 * ```ts
 * const total = calculateTotalAmount(100, 0.05);
 * // Returns: 105.00
 * ```
 */
export function calculateTotalAmount(
  ticketPrice: number,
  platformFeePercent: number
): number {
  return ticketPrice * (1 + platformFeePercent);
}
```

---

### Commentaires Inline

**Quand commenter** :
- Logique complexe non évidente
- Décisions métier importantes
- Workarounds temporaires
- TODOs
```typescript
// ✅ CORRECT (explique pourquoi)
// Stripe limite les montants à 2 décimales, on arrondit
const amountInCents = Math.round(amount * 100);

// Contrainte légale France : prix vente ≤ prix facial (Art. 313-6-2)
if (selling_price > original_price) {
  throw new Error('Prix illégal');
}

// TODO: Implémenter cache Redis pour Trust Scores (ticket #45)
const trustScore = await calculateTrustScore(userId);

// ❌ INCORRECT (commente l'évident)
// Incrémente i
i++;

// Crée un utilisateur
const user = await prisma.user.create({ data });
```

---

### Self-Documenting Code

**Préférer** code auto-explicatif aux commentaires :
```typescript
// ❌ AVANT (nécessite commentaire)
// Vérifie si l'utilisateur peut ouvrir un litige
const canOpen = 
  now >= oneDayBefore && 
  now <= twoDaysAfter && 
  !transaction.dispute;

// ✅ APRÈS (fonction nommée explicite)
function canOpenDispute(
  transaction: ITransaction,
  eventDate: Date
): boolean {
  const now = new Date();
  const oneDayBefore = new Date(eventDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  const twoDaysAfter = new Date(eventDate);
  twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);
  
  return (
    now >= oneDayBefore &&
    now <= twoDaysAfter &&
    !transaction.dispute
  );
}
```

---

## Checklist Avant Commit

- [ ] Code lint sans erreur (`npm run lint`)
- [ ] Types TypeScript valides (`npm run type-check`)
- [ ] Prettier appliqué (`npm run format`)
- [ ] Pas de `console.log` oubliés (sauf logs intentionnels)
- [ ] Pas de `any` types
- [ ] Pas de `@ts-ignore` (sauf justifié + commentaire)
- [ ] Imports triés (auto ESLint)
- [ ] Commentaires JSDoc sur fonctions publiques
- [ ] Tests passent (si applicable)
- [ ] Commit message respecte format

---

## Ressources

**Linters** :
- ESLint config : `.eslintrc.json`
- Prettier config : `.prettierrc.json`
- TypeScript config : `tsconfig.json`

**Extensions VSCode Recommandées** :
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- Prisma (`prisma.prisma`)

**Documentation Officielle** :
- Next.js : https://nextjs.org/docs
- TypeScript : https://www.typescriptlang.org/docs
- Prisma : https://www.prisma.io/docs
- Zod : https://zod.dev
- Tailwind : https://tailwindcss.com/docs

---

**Dernière mise à jour** : 2025-02-17
**Version** : 1.0.0