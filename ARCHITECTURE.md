# Architecture Next.js - Plateforme de Revente de Billets Éthique

## 📁 Structure des Dossiers

```
ava/
├── .github/                      # GitHub configuration
│   ├── workflows/
│   │   ├── ci.yml               # CI pipeline
│   │   └── deploy.yml           # Deployment pipeline
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODEOWNERS
│   └── settings.yml
│
├── .husky/                       # Git hooks
│   ├── pre-commit               # Linting + formatting
│   ├── commit-msg               # Conventional commits validation
│   └── pre-push                 # Type check + tests
│
├── .vscode/                      # VSCode configuration
│   ├── settings.json
│   └── extensions.json
│
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Seed data
│
├── public/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth group routes
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/         # Dashboard group routes
│   │   │   ├── account/
│   │   │   │   ├── profile/
│   │   │   │   ├── settings/
│   │   │   │   └── kyc/
│   │   │   ├── seller/
│   │   │   │   ├── listings/
│   │   │   │   └── sales/
│   │   │   ├── buyer/
│   │   │   │   ├── tickets/
│   │   │   │   └── purchases/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── admin/               # Admin panel
│   │   │   ├── tickets/
│   │   │   ├── disputes/
│   │   │   ├── users/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── tickets/             # Public ticket routes
│   │   │   ├── [id]/
│   │   │   └── page.tsx
│   │   │
│   │   ├── sell/                # Sell ticket flow
│   │   │   └── page.tsx
│   │   │
│   │   ├── disputes/            # Disputes routes
│   │   │   ├── [id]/
│   │   │   └── page.tsx
│   │   │
│   │   ├── legal/               # Legal pages
│   │   │   ├── terms/
│   │   │   ├── privacy/
│   │   │   └── refund-policy/
│   │   │
│   │   ├── api/                 # API Routes
│   │   │   ├── tickets/
│   │   │   │   ├── route.ts     # GET /api/tickets (list)
│   │   │   │   ├── upload/
│   │   │   │   │   └── route.ts # POST /api/tickets/upload
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts # GET/PATCH /api/tickets/:id
│   │   │   │       └── validate/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── payments/
│   │   │   │   ├── create-intent/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── confirm/
│   │   │   │   │   └── route.ts
│   │   │   │   └── release-escrow/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── kyc/
│   │   │   │   ├── create-session/
│   │   │   │   │   └── route.ts
│   │   │   │   └── check-status/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── disputes/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── resolve/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── webhooks/
│   │   │   │   └── stripe/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   └── health/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   ├── globals.css          # Global styles
│   │   └── not-found.tsx        # 404 page
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navigation.tsx
│   │   │
│   │   ├── tickets/             # Ticket components
│   │   │   ├── TicketCard.tsx
│   │   │   ├── TicketList.tsx
│   │   │   ├── TicketUploadForm.tsx
│   │   │   ├── TicketDetailView.tsx
│   │   │   └── TicketValidationPanel.tsx
│   │   │
│   │   ├── payments/            # Payment components
│   │   │   ├── StripeCheckout.tsx
│   │   │   ├── PaymentSummary.tsx
│   │   │   └── EscrowStatus.tsx
│   │   │
│   │   ├── auth/                # Auth components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── KYCVerificationFlow.tsx
│   │   │
│   │   ├── disputes/            # Dispute components
│   │   │   ├── DisputeForm.tsx
│   │   │   ├── DisputeCard.tsx
│   │   │   └── DisputeResolutionPanel.tsx
│   │   │
│   │   └── forms/               # Reusable form components
│   │       ├── FileUpload.tsx
│   │       ├── DatePicker.tsx
│   │       └── FormError.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useTickets.ts
│   │   ├── usePayment.ts
│   │   ├── useAuth.ts
│   │   ├── useKYC.ts
│   │   ├── useDisputes.ts
│   │   └── useDebounce.ts
│   │
│   ├── services/                # Business logic services
│   │   ├── tickets/
│   │   │   ├── ticketService.ts
│   │   │   ├── ticketValidation.ts
│   │   │   └── barcodeExtraction.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── paymentService.ts
│   │   │   └── stripeService.ts
│   │   │
│   │   ├── escrow/
│   │   │   ├── escrowService.ts
│   │   │   └── releaseJob.ts
│   │   │
│   │   ├── auth/
│   │   │   └── authService.ts
│   │   │
│   │   ├── kyc/
│   │   │   └── kycService.ts
│   │   │
│   │   ├── email/
│   │   │   ├── emailService.ts
│   │   │   └── templates.ts
│   │   │
│   │   └── storage/
│   │       └── fileUploadService.ts
│   │
│   ├── lib/                     # Shared libraries & utilities
│   │   ├── db/
│   │   │   └── prisma.ts        # Prisma client singleton
│   │   │
│   │   ├── stripe/
│   │   │   └── client.ts        # Stripe client
│   │   │
│   │   ├── supabase/
│   │   │   ├── client.ts        # Supabase client
│   │   │   └── server.ts        # Supabase admin client
│   │   │
│   │   ├── utils/
│   │   │   └── index.ts         # Utility functions
│   │   │
│   │   └── validations/         # Zod validation schemas
│   │       ├── ticket.ts
│   │       ├── payment.ts
│   │       ├── dispute.ts
│   │       └── user.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── index.ts             # Main types
│   │   └── env.d.ts             # Environment variables types
│   │
│   ├── config/                  # Configuration files
│   │   └── constants.ts         # App constants
│   │
│   └── styles/                  # Additional styles
│       └── utils.css
│
├── tests/                        # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example                  # Environment variables example
├── .env.local                    # Local environment (gitignored)
├── .eslintrc.json               # ESLint config
├── .prettierrc.json             # Prettier config
├── .prettierignore
├── .editorconfig
├── .gitignore
├── .lintstagedrc.json           # lint-staged config
├── next.config.ts               # Next.js config
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind CSS config
├── postcss.config.mjs           # PostCSS config
├── package.json
├── CONTRIBUTING.md              # Contribution guide
├── ARCHITECTURE.md              # This file
├── MVP.md                       # MVP specification
└── README.md                    # Project documentation
```

## 🏗️ Principes d'Architecture

### 1. **Separation of Concerns**

- **`app/`** : Routing et orchestration (App Router)
- **`components/`** : UI pure, pas de logique métier
- **`services/`** : Logique métier et appels externes
- **`lib/`** : Utilitaires partagés et clients API
- **`hooks/`** : Logique React réutilisable

### 2. **Data Flow**

```
User Action
    ↓
Component (UI)
    ↓
Hook (React Query)
    ↓
API Route (Next.js)
    ↓
Service (Business Logic)
    ↓
Prisma (Database)
```

### 3. **Type Safety**

- TypeScript strict mode activé
- Types partagés entre frontend/backend via `src/types/`
- Zod pour validation runtime
- Prisma pour types auto-générés

### 4. **Error Handling**

```typescript
// Consistent error response format
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable message',
    details?: {}
  }
}
```

### 5. **Authentication Flow**

```
Supabase Auth → NextAuth middleware → Protected routes
```

### 6. **Payment Flow**

```
1. Create Payment Intent (Stripe)
2. Frontend Stripe Elements
3. Confirm Payment
4. Webhook → Update DB
5. Escrow Release Job (Cron)
```

## 🔐 Security Layers

1. **Input Validation** : Zod schemas sur tous les inputs
2. **Authentication** : Supabase Auth + NextAuth
3. **Authorization** : Middleware checks + RBAC
4. **SQL Injection** : Prisma ORM (parameterized queries)
5. **XSS** : React auto-escaping + CSP headers
6. **CSRF** : NextAuth CSRF tokens
7. **Rate Limiting** : Middleware sur API routes
8. **Audit Logs** : Toutes actions critiques loggées

## 📊 Database Access Patterns

### Direct Prisma (Server Components)

```typescript
// app/tickets/[id]/page.tsx
import prisma from '@/lib/db/prisma';

export default async function TicketPage({ params }) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: { event: true, seller: true }
  });
  
  return <TicketDetailView ticket={ticket} />;
}
```

### API Routes (Client Components)

```typescript
// Client component calls API
const { data } = useQuery(['ticket', id], () =>
  fetch(`/api/tickets/${id}`).then(r => r.json())
);
```

## 🎨 UI Component Strategy

### shadcn/ui Base Components

- Utiliser shadcn/ui pour composants de base (Button, Input, etc.)
- Personnaliser via Tailwind CSS
- Composants copiés dans `src/components/ui/`

### Domain Components

- Composants métier dans dossiers dédiés (`tickets/`, `payments/`, etc.)
- Props typées avec interfaces TypeScript
- Utiliser composition pattern

## 📦 Package Management

```json
{
  "dependencies": {
    // Core
    "next": "^14.2.0",
    "react": "^18.3.0",
    
    // Database
    "@prisma/client": "^5.14.0",
    
    // Payments
    "stripe": "^15.8.0",
    "@stripe/stripe-js": "^3.5.0",
    
    // Auth
    "@supabase/supabase-js": "^2.43.0",
    
    // Forms & Validation
    "react-hook-form": "^7.51.0",
    "zod": "^3.23.0",
    
    // State Management
    "@tanstack/react-query": "^5.40.0"
  }
}
```

## 🚀 Deployment Strategy

### Vercel (Recommended)

- **Main branch** → Production automatique
- **PR branches** → Preview deployments
- **Environment variables** : Vercel dashboard
- **Edge Functions** : API routes auto-optimized

### Database Migrations

```bash
# Development
npm run prisma:migrate

# Production (Vercel)
# Migrations run automatically via build command
```

## 📈 Performance Optimizations

1. **Server Components** par défaut
2. **Dynamic imports** pour composants lourds
3. **Image optimization** via next/image
4. **API route caching** (Next.js Cache API)
5. **Database indexes** sur colonnes fréquemment queryées
6. **React Query caching** frontend

## 🧪 Testing Strategy

```
tests/
├── unit/              # Pure functions, utilities
├── integration/       # API routes, services
└── e2e/              # Playwright end-to-end
```

## 📝 Naming Conventions

- **Files** : kebab-case (`ticket-card.tsx`)
- **Components** : PascalCase (`TicketCard`)
- **Functions** : camelCase (`calculatePlatformFee`)
- **Constants** : UPPER_SNAKE_CASE (`MAX_TICKET_PRICE`)
- **Types/Interfaces** : PascalCase, interfaces prefixed with `I` (`IUser`)
- **API Routes** : kebab-case folders

## 🔄 State Management

- **Server State** : React Query (TanStack Query)
- **Form State** : React Hook Form
- **URL State** : Next.js searchParams
- **Local UI State** : useState / useReducer
- **Global State** : Context API (si nécessaire)

## 📚 Documentation Requirements

- **JSDoc** sur fonctions complexes
- **README** dans dossiers services
- **API documentation** (OpenAPI spec planned)
- **Component Storybook** (phase 2)
