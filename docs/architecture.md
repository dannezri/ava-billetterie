# Architecture Technique - Plateforme Billets Éthique

## Vue d'Ensemble

Plateforme Next.js 14 full-stack permettant l'achat-revente éthique de billets de concert en France avec système de séquestre bancaire et vérification KYC obligatoire.

### Contraintes Réglementaires
- **Article 313-6-2 du Code pénal français** : Interdiction stricte de revente avec plus-value
- **Prix de revente DOIT être ≤ prix facial** (validation technique + juridique)
- **KYC obligatoire** pour tous les vendeurs (Stripe Identity)
- **Séquestre bancaire J+2** après l'événement (protection acheteur)

---

## Stack Technique

### Frontend
```
Next.js 14.2+ (App Router)
├── React 18.3+
├── TypeScript 5.4+ (strict mode)
├── Tailwind CSS 3.4+
└── shadcn/ui (composants)
```

**Justifications** :
- **Next.js App Router** : SSR natif, performances optimales, SEO-friendly
- **TypeScript strict** : Sécurité typée critique pour transactions financières
- **Tailwind** : Rapidité développement, bundle optimisé
- **shadcn/ui** : Composants accessibles (ARIA), customisables, pas de dépendance lourde

### Backend
```
Next.js API Routes / Route Handlers
├── Prisma ORM 5.14+
├── PostgreSQL 15+ (Supabase hosted)
├── Zod 3.23+ (validation)
└── tRPC (optionnel, type-safety end-to-end)
```

**Justifications** :
- **Prisma** : Migrations versionnées, typage auto, requêtes type-safe
- **PostgreSQL** : ACID compliance essentiel pour finance
- **Zod** : Validation partagée frontend/backend, inférence types
- **tRPC** : Élimine les erreurs API, DX optimale

### Authentification & Identité
```
Supabase Auth
├── Email/Password
├── OAuth (Google, Apple - optionnel)
├── MFA/2FA (TOTP)
└── Session Management
```

**Flow Auth** :
```
1. Signup → Email verification (lien 24h)
2. Login → Supabase session (JWT)
3. Protected routes → Middleware validation
4. Vendeur → KYC requis (Stripe Identity)
```

### Paiements & Séquestre
```
Stripe Connect (Custom Accounts)
├── Payment Intents (paiements acheteurs)
├── Transfers (séquestre → vendeur J+2)
├── Stripe Identity (KYC)
└── Webhooks (événements asynchrones)
```

**Architecture Séquestre** :
```typescript
// Paiement initial
PaymentIntent {
  amount: ticket_price + platform_fee
  transfer_data: {
    destination: seller_stripe_account_id  // Fonds bloqués chez vendeur
  }
  on_behalf_of: seller_stripe_account_id
  // PAS de transfert automatique → contrôle manuel J+2
}

// Libération J+2 (cron job)
Transfer {
  amount: ticket_price - platform_fee
  destination: seller_stripe_account_id
  transfer_group: transaction_id
}
```

**Alternative évaluée** : Mangopay (spécialisé séquestre EU) → écarté (complexité, moins mature)

### Stockage Fichiers
```
Cloudinary / Uploadcare
├── Upload PDF billets (chiffré)
├── CDN global (latence faible)
├── Transformations images événements
└── Watermarking dynamique (sécurité)
```

### Infrastructure
```
Vercel (Production)
├── Edge Functions (géolocalisation)
├── Serverless API Routes
├── Automatic deployments (Git push)
└── Environment variables management

Supabase (Database + Auth)
├── PostgreSQL managed
├── Realtime subscriptions (optionnel)
├── Storage buckets
└── Edge Functions (backup)
```

### Monitoring & Observabilité
```
Sentry (Error Tracking)
├── Frontend errors
├── API exceptions
├── Performance monitoring
└── Alertes Slack

PostHog (Product Analytics)
├── Event tracking
├── Funnels conversion
├── Feature flags
└── Session recordings

Vercel Analytics (Vitals)
├── Core Web Vitals
├── Edge logs
└── Function metrics
```

---

## Architecture Applicative

### Structure des Dossiers
```
/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (public)/               # Routes publiques
│   │   │   ├── page.tsx            # Landing page
│   │   │   ├── events/
│   │   │   ├── about/
│   │   │   └── help/
│   │   ├── (auth)/                 # Routes authentification
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── verify-email/
│   │   ├── (buyer)/                # Routes acheteur (protégées)
│   │   │   ├── dashboard/
│   │   │   ├── my-purchases/
│   │   │   └── disputes/
│   │   ├── (seller)/               # Routes vendeur (protégées + KYC)
│   │   │   ├── dashboard/
│   │   │   ├── tickets/
│   │   │   ├── sales/
│   │   │   └── payments/
│   │   ├── (admin)/                # Routes admin (protégées + role)
│   │   │   ├── dashboard/
│   │   │   ├── tickets/
│   │   │   ├── users/
│   │   │   └── disputes/
│   │   ├── api/                    # API Routes
│   │   │   ├── auth/
│   │   │   ├── tickets/
│   │   │   ├── payments/
│   │   │   ├── webhooks/
│   │   │   └── cron/
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css
│   │
│   ├── components/                 # Composants React
│   │   ├── ui/                     # shadcn/ui base components
│   │   ├── layout/                 # Header, Footer, Sidebar
│   │   ├── marketplace/            # TicketCard, EventCard, Filters
│   │   ├── seller/                 # Dashboard vendeur, Upload
│   │   ├── admin/                  # Dashboard admin, Moderation
│   │   └── shared/                 # Composants réutilisables
│   │
│   ├── lib/                        # Utilitaires & Services
│   │   ├── services/               # Logique métier
│   │   │   ├── payment.service.ts
│   │   │   ├── ticket.service.ts
│   │   │   ├── kyc.service.ts
│   │   │   ├── dispute.service.ts
│   │   │   ├── trust-score.service.ts
│   │   │   └── notification.service.ts
│   │   ├── validations/            # Schémas Zod
│   │   │   ├── ticket.validation.ts
│   │   │   ├── payment.validation.ts
│   │   │   └── user.validation.ts
│   │   ├── stripe.ts               # Client Stripe
│   │   ├── supabase.ts             # Client Supabase (server)
│   │   ├── supabase-browser.ts     # Client Supabase (browser)
│   │   ├── prisma.ts               # Client Prisma singleton
│   │   ├── utils.ts                # Helpers (formatPrice, cn, etc.)
│   │   └── constants.ts            # Constantes globales
│   │
│   ├── hooks/                      # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useTicket.ts
│   │   ├── usePayment.ts
│   │   └── useToast.ts
│   │
│   ├── types/                      # Types TypeScript
│   │   ├── ticket.types.ts
│   │   ├── user.types.ts
│   │   ├── transaction.types.ts
│   │   ├── dispute.types.ts
│   │   └── api.types.ts
│   │
│   ├── config/                     # Configuration
│   │   ├── site.config.ts          # Métadonnées site
│   │   ├── stripe.config.ts
│   │   └── constants.config.ts
│   │
│   └── middleware.ts               # Next.js Middleware (auth, rate limiting)
│
├── prisma/
│   ├── schema.prisma               # Schéma base de données
│   ├── migrations/                 # Migrations SQL
│   └── seed.ts                     # Seed data (dev)
│
├── public/                         # Assets statiques
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── docs/                           # Documentation projet
│   ├── architecture.md             # Ce fichier
│   ├── database-schema.md
│   ├── api-contracts.md
│   ├── workflows/
│   └── sprints/
│
├── tests/                          # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── [fichiers config]               # .eslintrc, tsconfig, etc.
```

---

## Patterns & Conventions

### Server vs Client Components

**Règle générale** : Server Component par défaut (Next.js 14)

**Client Component (`"use client"`)** uniquement si :
- Hooks React (useState, useEffect, useContext)
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Libraries client-only (React Hook Form, etc.)
```typescript
// ✅ Server Component (default)
export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  return <EventDetails event={event} />;
}

// ✅ Client Component (interactif)
"use client";
export function BuyTicketButton({ ticketId }: { ticketId: string }) {
  const [loading, setLoading] = useState(false);
  const handleBuy = async () => { /* ... */ };
  return <Button onClick={handleBuy}>Acheter</Button>;
}
```

### Data Fetching

**Stratégies par route** :

1. **Pages publiques** (/, /events) :
   - Server Component
   - Fetch direct Prisma
   - Cache: `revalidate: 300` (5 min)

2. **Pages authentifiées** (/dashboard) :
   - Server Component initial
   - Client Components pour interactivité
   - React Query pour mutations

3. **API Routes** :
   - Validation Zod systématique
   - Try/catch obligatoire
   - Logs Sentry sur erreurs
```typescript
// Pattern API Route
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createPaymentIntentSchema } from '@/lib/validations/payment.validation';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse body
    const body = await request.json();
    
    // 2. Validate avec Zod
    const validated = createPaymentIntentSchema.parse(body);
    
    // 3. Logique métier
    const result = await PaymentService.createIntent(validated);
    
    // 4. Response
    return NextResponse.json(result, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    // Log Sentry
    console.error('Payment intent creation failed:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Gestion d'État

**État Local** : useState (composants simples)
**État Formulaire** : React Hook Form + Zod
**État Serveur** : React Query / TanStack Query
**État Global** : Zustand (si nécessaire, éviter Redux)
```typescript
// Exemple React Query (client component)
"use client";
import { useQuery } from '@tanstack/react-query';

export function MyPurchases() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const res = await fetch('/api/transactions/purchases');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    staleTime: 60000, // 1 min
  });
  
  if (isLoading) return <PurchasesSkeleton />;
  if (error) return <ErrorState />;
  
  return <PurchasesList purchases={data} />;
}
```

### Sécurité

**Middleware (src/middleware.ts)** :
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Vérifier session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Routes protégées
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Routes vendeur (KYC requis)
  if (request.nextUrl.pathname.startsWith('/seller')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Vérifier KYC (query Prisma)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { kyc_status: true },
    });
    
    if (user?.kyc_status !== 'verified') {
      return NextResponse.redirect(new URL('/seller/kyc', request.url));
    }
  }
  
  // Routes admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/seller/:path*', '/admin/:path*'],
};
```

**Rate Limiting** (API Routes critiques) :
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 req/min
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // ... suite
}
```

---

## Workflows Critiques

### 1. Achat de Billet (avec Séquestre)
```
┌─────────────┐
│  Acheteur   │
│  clique     │
│  "Acheter"  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend: POST /api/tickets/reserve     │
│ - Vérif ticket.status === 'active'      │
│ - INSERT transaction (status: pending)  │
│ - UPDATE ticket (status: reserved)      │
│ - Timer 15 min                          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend: Stripe Elements (paiement)    │
│ - POST /api/payments/create-intent      │
│ - Stripe PaymentIntent avec séquestre   │
│ - transfer_data.destination = seller    │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Webhook: payment_intent.succeeded       │
│ - UPDATE transaction (status: escrowed) │
│ - UPDATE ticket (status: sold)          │
│ - escrow_release_date = event_date + 2j │
│ - Email acheteur + vendeur              │
│ - Envoi PDF acheteur (lien temporaire)  │
└──────┬──────────────────────────────────┘
       │
       ▼ (Attente J+2)
       │
┌─────────────────────────────────────────┐
│ Cron Job: POST /api/cron/release-escrow │
│ - Query transactions WHERE               │
│   escrow_release_date <= NOW()           │
│   AND status = 'escrowed'                │
│   AND no disputes                        │
│ - Stripe Transfer vers vendeur          │
│ - UPDATE transaction (status: released) │
│ - Email vendeur "Paiement disponible"   │
└─────────────────────────────────────────┘
```

### 2. Vente de Billet (Upload → Validation)
```
┌─────────────┐
│  Vendeur    │
│  upload PDF │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Pré-requis: kyc_status = 'verified'     │
│ Sinon → Redirect /seller/kyc            │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend: Uploadcare Widget             │
│ - Upload direct vers Uploadcare         │
│ - Validation: PDF, max 5MB              │
│ - Callback webhook avec file_url        │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Backend: POST /api/seller/tickets/      │
│          process-pdf                     │
│ - Télécharger PDF depuis Uploadcare     │
│ - Extraction métadonnées (pdf-parse)    │
│   ├─ Code-barres (regex)                │
│   ├─ Prix facial (patterns billetteries)│
│   └─ Nom événement (optionnel)          │
│ - Calcul SHA-256 hash                   │
│ - Query doublon:                         │
│   WHERE pdf_hash = X OR barcode = Y     │
│ - Si doublon → REJECT + flag vendeur    │
│ - Sinon → INSERT ticket                 │
│   (status: pending_validation)          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Admin: GET /admin/tickets/validation    │
│ - Liste tickets pending_validation       │
│ - Affichage PDF + infos extraites       │
│ - Checklist validation manuelle         │
│ - Actions: APPROVE / REJECT / INFO      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Backend: PATCH /admin/tickets/[id]/     │
│          approve                         │
│ - UPDATE ticket (status: active)        │
│ - Email vendeur "Billet approuvé"       │
│ - Billet visible marketplace            │
└─────────────────────────────────────────┘
```

### 3. Litige (Ouverture → Résolution)
```
┌─────────────┐
│  Acheteur   │
│  J-1 à J+2  │
│  "Signaler" │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Frontend: POST /api/disputes/create     │
│ - Type problème (enum)                  │
│ - Description + upload preuves          │
│ - INSERT dispute (status: open)         │
│ - UPDATE transaction (status: disputed) │
│ - BLOQUER libération séquestre          │
│   (manual_review = true)                │
│ - Email vendeur + notification admin    │
│ - Webhook Slack équipe support          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Admin: GET /admin/disputes/[id]         │
│ - Vue complète:                         │
│   ├─ Réclamation acheteur + preuves    │
│   ├─ Réponse vendeur (si fournie)       │
│   ├─ Profils utilisateurs               │
│   └─ Transaction + PDF billet           │
│ - Investigation manuelle                │
│ - Actions possibles:                    │
│   ├─ Rembourser acheteur                │
│   ├─ Libérer vendeur                    │
│   ├─ Remboursement partiel              │
│   └─ Demander + d'infos                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Backend: PATCH /admin/disputes/[id]/    │
│          resolve                         │
│                                          │
│ SI REMBOURSEMENT:                        │
│ - Stripe Refund (full)                  │
│ - UPDATE transaction (status: refunded) │
│ - UPDATE dispute (status: resolved)     │
│ - Pénalité vendeur: trust_score -= 20   │
│ - Email acheteur "Remboursement OK"     │
│                                          │
│ SI LIBÉRATION:                           │
│ - Stripe Transfer vers vendeur          │
│ - UPDATE transaction (status: released) │
│ - UPDATE dispute (status: resolved)     │
│ - Email vendeur "Paiement libéré"       │
└─────────────────────────────────────────┘
```

---

## Performance & Scalabilité

### Optimisations Actuelles

**1. Database** :
- Index sur colonnes fréquemment queryées (voir database-schema.md)
- Prisma connection pooling
- Read replicas (si > 10k req/min)

**2. Cache** :
- Next.js ISR (Incremental Static Regeneration) pour pages événements
- Redis cache (TBD) pour Trust Scores (TTL 1h)
- CDN Cloudinary/Uploadcare pour images

**3. Bundle Size** :
- Tree-shaking automatique Next.js
- Dynamic imports pour composants lourds
- Code splitting par route

**4. Images** :
- Next.js Image component (optimisation auto)
- WebP format prioritaire
- Lazy loading

### Limites Actuelles (MVP)

- **Transactions simultanées** : ~100/sec (limite Vercel Serverless)
- **Upload PDF** : 5MB max (limite client)
- **Users concurrent** : ~10k (limite Supabase tier)

### Plan Scalabilité (Post-MVP)

**Phase 1 (> 1000 transactions/jour)** :
- Migration Supabase → RDS PostgreSQL (Aurora)
- Redis cache (Upstash) pour sessions + Trust Scores
- Queue jobs (BullMQ) pour emails/notifications

**Phase 2 (> 10k transactions/jour)** :
- Microservices extraction PDF (Lambda)
- Elasticsearch pour recherche événements
- CDN edge caching (Vercel Edge Functions)

**Phase 3 (> 100k transactions/jour)** :
- Kubernetes (si besoin, éviter prematurément)
- Database sharding (par région géographique)
- Load balancing multi-région

---

## Déploiement

### Environnements
```
┌─────────────────────────────────────────┐
│ LOCAL (dev)                             │
│ - npm run dev                           │
│ - PostgreSQL local ou Supabase          │
│ - Stripe Test Mode                      │
│ - .env.local                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ STAGING (preprod)                       │
│ - Vercel Preview Deployments           │
│ - Supabase Staging project              │
│ - Stripe Test Mode                      │
│ - .env.staging                          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ PRODUCTION                              │
│ - Vercel Production                     │
│ - Supabase Production project           │
│ - Stripe Live Mode                      │
│ - .env.production                       │
└─────────────────────────────────────────┘
```

### CI/CD Pipeline
```
Git Push (main branch)
       │
       ▼
┌─────────────────────────────────────────┐
│ GitHub Actions                          │
│ - Lint (ESLint)                         │
│ - Type Check (TypeScript)               │
│ - Tests (Jest)                          │
│ - Build (Next.js)                       │
└──────┬──────────────────────────────────┘
       │ (si success)
       ▼
┌─────────────────────────────────────────┐
│ Vercel Auto-Deploy                      │
│ - Build production                      │
│ - Deploy to edge                        │
│ - Health checks                         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Post-Deploy                             │
│ - Prisma migrations (automatiques)      │
│ - Sentry release tracking               │
│ - Slack notification équipe             │
└─────────────────────────────────────────┘
```

### Variables d'Environnement (Checklist)
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # Prisma migrations

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..." # Backend only

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_WEBHOOK_SECRET="whsec_..."

# Uploadcare / Cloudinary
UPLOADCARE_PUBLIC_KEY="..."
UPLOADCARE_SECRET_KEY="..."

# Monitoring
SENTRY_DSN="https://..."
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Emails (Resend)
RESEND_API_KEY="re_..."

# Site
NEXT_PUBLIC_SITE_URL="https://billets-ethiques.fr"
```

---

## Sécurité

### Checklist Conformité

**RGPD** :
- ✅ Consentement cookies (Cookiebot)
- ✅ Export données utilisateur (/api/user/export-data)
- ✅ Droit à l'oubli (/api/user/delete-account → anonymisation)
- ✅ Politique confidentialité (/privacy)
- ✅ Rétention logs : 3 ans max

**DSP2 (Paiements EU)** :
- ✅ Strong Customer Authentication (3D Secure via Stripe)
- ✅ Séquestre conforme régulation bancaire
- ✅ Traçabilité transactions (audit_logs)

**Anti-Blanchiment (LCB-FT)** :
- ✅ KYC obligatoire vendeurs (Stripe Identity)
- ✅ Seuils vigilance : transactions > 1000€ (monitoring admin)
- ✅ Déclaration TRACFIN si suspicion (procédure manuelle)

**Sécurité Applicative** :
- ✅ Rate limiting routes sensibles
- ✅ CSRF protection (Next.js natif)
- ✅ XSS prevention (React escape automatique)
- ✅ SQL Injection impossible (Prisma ORM paramétrisé)
- ✅ Secrets rotation régulière (Vercel/Supabase)
- ✅ HTTPS only (Vercel force SSL)
- ✅ Headers sécurité (CSP, HSTS via next.config.js)

---

## Maintenance & Ops

### Cron Jobs (Vercel Cron)
```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/release-escrow",
      "schedule": "0 2 * * *" // Tous les jours 2h du matin
    },
    {
      "path": "/api/cron/expire-reservations",
      "schedule": "*/5 * * * *" // Toutes les 5 minutes
    },
    {
      "path": "/api/cron/calculate-trust-scores",
      "schedule": "0 3 * * 0" // Dimanche 3h (hebdo)
    },
    {
      "path": "/api/cron/daily-report",
      "schedule": "0 8 * * *" // Tous les jours 8h (email équipe)
    }
  ]
}
```

### Monitoring Dashboards

**Sentry** :
- Alertes : > 10 erreurs/heure → Slack #tech-alerts
- Release tracking : tag version Git

**PostHog** :
- Funnels critiques :
  - Visite → Inscription (target 10%)
  - Inscription → Premier achat (target 20%)
  - Vendeur → KYC → Première vente (target 50%)

**Vercel** :
- Core Web Vitals : LCP < 2.5s, FID < 100ms, CLS < 0.1
- Function logs : erreurs 500, latences > 5s

### Backup & Disaster Recovery

**Database** :
- Backup automatique Supabase (daily, retention 7j)
- Backup manuel avant migrations critiques
- Point-in-time recovery (PITR) disponible

**Files (Uploadcare)** :
- Réplication multi-région automatique
- Pas de backup additionnel nécessaire

**Procédure Rollback** :
```bash
# 1. Revert Git
git revert <commit-hash>
git push origin main

# 2. Vercel redeploy automatique

# 3. Rollback DB si nécessaire
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Glossaire Technique

**GMV** : Gross Merchandise Value (valeur totale transactions)
**KYC** : Know Your Customer (vérification identité)
**2FA/MFA** : Two/Multi-Factor Authentication
**ACID** : Atomicity, Consistency, Isolation, Durability (propriétés DB)
**SSR** : Server-Side Rendering
**ISR** : Incremental Static Regeneration
**CDN** : Content Delivery Network
**PITR** : Point-In-Time Recovery

---

## Contacts & Ressources

**Équipe** :
- CTO : [à définir]
- Lead Dev : [à définir]
- DevOps : [à définir]

**Support Externe** :
- Stripe Support : https://support.stripe.com
- Supabase Support : https://supabase.com/support
- Vercel Support : https://vercel.com/support

**Documentation Officielle** :
- Next.js : https://nextjs.org/docs
- Prisma : https://www.prisma.io/docs
- Stripe : https://stripe.com/docs
- Supabase : https://supabase.com/docs

---

**Dernière mise à jour** : 2025-02-17
**Version** : 1.0.0 (MVP)