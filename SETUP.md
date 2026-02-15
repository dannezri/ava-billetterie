# 🚀 Setup Complet - Projet Ava

**✅ Configuration terminée avec succès !**

Voici ce qui a été mis en place pour votre MVP de plateforme de revente de billets éthique.

---

## 📋 Ce Qui A Été Configuré

### 1️⃣ **Conventions de Code** ✅

#### ESLint & Prettier
- ✅ ESLint configuré avec règles strictes TypeScript
- ✅ Prettier avec plugin Tailwind CSS
- ✅ EditorConfig pour cohérence IDE
- ✅ VSCode settings optimisées
- ✅ Extensions VSCode recommandées

#### Git Hooks (Husky)
- ✅ **pre-commit** : Lint + format automatique
- ✅ **commit-msg** : Validation Conventional Commits
- ✅ **pre-push** : Type-check + tests + build

#### Lint-Staged
- ✅ Formatage automatique des fichiers stagés
- ✅ Vérification TypeScript sur push

---

### 2️⃣ **Git Workflow Trunk-Based** ✅

#### Documentation
- ✅ `CONTRIBUTING.md` : Guide complet de contribution
- ✅ Workflow trunk-based détaillé
- ✅ Convention Conventional Commits

#### GitHub Configuration
- ✅ Templates Pull Request structurés
- ✅ Issue templates (Bug Report + Feature Request)
- ✅ CODEOWNERS pour review automatique
- ✅ Labels organisés (type, priority, status, area)

#### CI/CD Pipelines
- ✅ **ci.yml** : Lint, Type-check, Tests, Build, Security
- ✅ **deploy.yml** : Déploiement automatique Vercel
- ✅ Protection branche main (via `.github/settings.yml`)

#### Protection Branche Main
- ✅ 1 review minimale requise
- ✅ Status checks obligatoires
- ✅ Pas de force push
- ✅ Conversations résolues avant merge
- ✅ Squash merge uniquement

---

### 3️⃣ **Architecture Next.js App Router** ✅

#### Structure de Dossiers Complète

```
src/
├── app/                  # Routes Next.js App Router
│   ├── api/             # API endpoints (REST)
│   │   ├── tickets/
│   │   ├── payments/
│   │   ├── auth/
│   │   ├── kyc/
│   │   ├── disputes/
│   │   ├── webhooks/
│   │   └── health/
│   ├── (auth)/          # Routes auth
│   ├── (dashboard)/     # Routes dashboard
│   ├── admin/           # Panel admin
│   ├── tickets/         # Pages billets publiques
│   └── ...
│
├── components/          # React components
│   ├── ui/             # shadcn/ui base
│   ├── tickets/
│   ├── payments/
│   ├── auth/
│   ├── disputes/
│   └── layout/
│
├── services/           # Business logic
│   ├── tickets/
│   ├── payments/
│   ├── escrow/
│   ├── auth/
│   ├── kyc/
│   ├── email/
│   └── storage/
│
├── lib/                # Shared utilities
│   ├── db/            # Prisma client
│   ├── stripe/        # Stripe client
│   ├── supabase/      # Supabase client
│   ├── utils/         # Helpers
│   └── validations/   # Zod schemas
│
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
├── config/             # Configuration
└── styles/             # Styles globaux
```

#### Fichiers Créés

**Configuration :**
- ✅ `tsconfig.json` : TypeScript strict mode
- ✅ `next.config.ts` : Next.js avec headers sécurité
- ✅ `tailwind.config.ts` : Tailwind + shadcn/ui
- ✅ `jest.config.ts` : Tests unitaires
- ✅ `components.json` : shadcn/ui config
- ✅ `.env.example` : Variables d'environnement

**Types & Validations :**
- ✅ `src/types/index.ts` : Types complets (User, Ticket, Transaction, Dispute, etc.)
- ✅ `src/types/env.d.ts` : Types variables env
- ✅ `src/lib/validations/ticket.ts` : Zod schemas billets
- ✅ `src/lib/validations/payment.ts` : Zod schemas paiements
- ✅ `src/lib/validations/dispute.ts` : Zod schemas litiges

**Configuration Clients :**
- ✅ `src/lib/db/prisma.ts` : Prisma singleton
- ✅ `src/lib/stripe/client.ts` : Stripe client
- ✅ `src/lib/supabase/client.ts` : Supabase client
- ✅ `src/lib/supabase/server.ts` : Supabase admin

**Utilitaires :**
- ✅ `src/lib/utils/index.ts` : Helpers (formatCurrency, formatDate, etc.)
- ✅ `src/config/constants.ts` : Constantes métier (règles, routes, etc.)

**Database :**
- ✅ `prisma/schema.prisma` : Schéma DB complet (Users, Events, Tickets, Transactions, Disputes, Reviews, AuditLogs)

**API :**
- ✅ `src/app/api/health/route.ts` : Health check endpoint

**Documentation :**
- ✅ `README.md` : Documentation projet complète
- ✅ `ARCHITECTURE.md` : Architecture détaillée
- ✅ `CONTRIBUTING.md` : Guide de contribution
- ✅ `MVP.md` : Spécifications MVP (existant)
- ✅ `SETUP.md` : Ce fichier

---

## 🎯 Prochaines Étapes

### 1. Initialiser Git & Husky

```bash
# Initialiser le repo git (si pas déjà fait)
git init

# Installer Husky
npm run prepare

# Tester les hooks
git add .
git commit -m "feat: initial project setup"
```

### 2. Configurer les Variables d'Environnement

```bash
# Copier le template
cp .env.example .env.local

# Éditer avec vos clés API
code .env.local
```

**Variables critiques à configurer :**
- `DATABASE_URL` : PostgreSQL connection string
- `STRIPE_SECRET_KEY` : Stripe API key
- `NEXT_PUBLIC_SUPABASE_URL` : Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Supabase anon key
- `RESEND_API_KEY` : Resend email API key

### 3. Installer les Dépendances

```bash
npm install
```

### 4. Setup Database

```bash
# Générer Prisma Client
npm run prisma:generate

# Créer et appliquer les migrations
npm run prisma:migrate

# (Optionnel) Seed la DB avec données de test
npm run prisma:seed
```

### 5. Lancer le Projet

```bash
# Mode développement
npm run dev

# Ouvrir http://localhost:3000
```

### 6. Setup GitHub

#### A. Créer le Repository

```bash
# Créer un repo sur GitHub
# Puis :
git remote add origin https://github.com/your-org/ava.git
git branch -M main
git push -u origin main
```

#### B. Configurer Branch Protection

**Option 1 : Via GitHub UI**
1. Aller dans Settings > Branches
2. Add rule pour `main`
3. Activer :
   - ✅ Require pull request before merging
   - ✅ Require 1 approval
   - ✅ Require status checks to pass
   - ✅ Require conversation resolution
   - ❌ Disable force push
   - ❌ Disable branch deletion

**Option 2 : Via GitHub CLI**
```bash
gh repo create ava --private
gh repo deploy-key add
```

#### C. Configurer GitHub Secrets

Settings > Secrets and variables > Actions :
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- Etc.

### 7. Setup Vercel Deployment

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Lier le projet
vercel link

# Configurer les variables d'env dans le dashboard Vercel
```

**Variables d'environnement Vercel :**
- Aller sur vercel.com > Project Settings > Environment Variables
- Ajouter toutes les variables de `.env.example`

### 8. Setup Services Externes

#### Stripe
1. Créer compte sur stripe.com
2. Activer Stripe Connect (Custom Accounts)
3. Activer Stripe Identity
4. Configurer webhooks :
   - `payment_intent.succeeded`
   - `identity.verification_session.verified`
   - `transfer.created`

#### Supabase
1. Créer projet sur supabase.com
2. Récupérer URL et anon key
3. Créer service role key

#### Uploadcare
1. Créer compte sur uploadcare.com
2. Récupérer public et secret keys

#### Resend
1. Créer compte sur resend.com
2. Récupérer API key
3. Vérifier domaine d'envoi

---

## 🧪 Vérifications

### Tests Locaux

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Formatage
npm run format:check

# Tests
npm run test

# Build
npm run build
```

### Vérifier Git Hooks

```bash
# Test pre-commit
git add .
git commit -m "test: verify hooks"
# → Devrait formatter et linter automatiquement

# Test commit-msg
git commit -m "invalid message"
# → Devrait rejeter (pas de type conventional)

# Test pre-push
git push
# → Devrait exécuter type-check + tests + lint
```

### Vérifier CI/CD

Une fois poussé sur GitHub :
1. Ouvrir une PR
2. Vérifier que les 4 checks passent :
   - ✅ Lint & Format Check
   - ✅ TypeScript Type Check
   - ✅ Unit Tests
   - ✅ Build Application
3. Merger → Déploiement automatique Vercel

---

## 📚 Commandes Utiles

### Développement
```bash
npm run dev              # Serveur dev (hot reload)
npm run prisma:studio    # Interface DB Prisma
npm run lint:fix         # Fix linting automatique
npm run format           # Formater tout le code
```

### Database
```bash
npm run prisma:generate  # Générer Prisma Client
npm run prisma:migrate   # Créer/appliquer migrations
npm run prisma:seed      # Seed la DB
```

### Testing
```bash
npm run test             # Tests en mode watch
npm run test:ci          # Tests pour CI (sans watch)
npm run test:coverage    # Tests avec coverage
```

### Production
```bash
npm run build            # Build production
npm run start            # Serveur production local
npm run analyze          # Analyser bundle size
```

---

## 🎨 Installer shadcn/ui Components

```bash
# Ajouter des composants au fur et à mesure
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add toast
# etc.
```

Les composants seront installés dans `src/components/ui/`

---

## 📖 Documentation Disponible

- **README.md** : Vue d'ensemble projet
- **ARCHITECTURE.md** : Architecture détaillée, patterns, conventions
- **CONTRIBUTING.md** : Guide contribution, Git workflow
- **MVP.md** : Spécifications MVP complètes
- **SETUP.md** : Ce guide de setup

---

## 🆘 Troubleshooting

### Erreur Prisma "Client not generated"
```bash
npm run prisma:generate
```

### Erreur "Module not found @/..."
Vérifier `tsconfig.json` > `compilerOptions.paths`

### Husky hooks ne fonctionnent pas
```bash
rm -rf .husky
npm run prepare
chmod +x .husky/pre-commit .husky/commit-msg .husky/pre-push
```

### Erreur Stripe "Invalid API Key"
Vérifier que `.env.local` contient `STRIPE_SECRET_KEY=sk_test_...`

### Build Vercel échoue
1. Vérifier variables d'env dans dashboard Vercel
2. Vérifier que `DATABASE_URL` est configuré
3. Vérifier les logs de build

---

## ✅ Checklist Finale

Avant de commencer le développement :

- [ ] Git initialisé avec remote GitHub
- [ ] `.env.local` configuré avec toutes les clés API
- [ ] Dependencies installées (`npm install`)
- [ ] Prisma client généré (`npm run prisma:generate`)
- [ ] Database migrée (`npm run prisma:migrate`)
- [ ] Serveur dev lance sans erreur (`npm run dev`)
- [ ] Husky hooks fonctionnent (test commit)
- [ ] GitHub repo créé avec protection main
- [ ] GitHub Actions configurées
- [ ] Vercel projet lié avec variables d'env
- [ ] Comptes Stripe/Supabase/Uploadcare/Resend créés

---

## 🚀 Vous Êtes Prêt !

Votre projet est maintenant **100% configuré** avec :

✅ **Conventions de code** strictes et automatisées  
✅ **Git workflow** trunk-based professionnel  
✅ **Architecture Next.js** scalable et structurée  
✅ **CI/CD** automatique sur GitHub Actions  
✅ **Type safety** end-to-end (TypeScript + Prisma + Zod)  
✅ **Documentation** complète  

**Prochaine étape :** Commencer le développement des fonctionnalités MVP ! 🎉

```bash
# Créer votre première feature branch
git checkout -b feat/auth-kyc-integration

# Happy coding! 🚀
```

---

**Questions ? Consultez :**
- [ARCHITECTURE.md](./ARCHITECTURE.md) pour comprendre la structure
- [CONTRIBUTING.md](./CONTRIBUTING.md) pour le workflow Git
- [MVP.md](./MVP.md) pour les spécifications fonctionnelles

**Bon développement ! 💪**
