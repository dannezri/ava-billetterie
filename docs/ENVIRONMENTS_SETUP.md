# Guide de Configuration des Environnements - Ava Platform

Ce guide détaille la configuration complète des environnements pour la plateforme Ava.

## 📑 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration locale (Development)](#configuration-locale-development)
3. [Configuration Staging](#configuration-staging)
4. [Configuration Production](#configuration-production)
5. [Déploiement sur Vercel](#déploiement-sur-vercel)
6. [Sécurité et bonnes pratiques](#sécurité-et-bonnes-pratiques)
7. [Troubleshooting](#troubleshooting)

## 🎯 Vue d'ensemble

### Architecture des environnements

```
┌─────────────────────────────────────────────────────────────┐
│                     ENVIRONNEMENTS                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Development (Local)                                         │
│  ├─ URL: http://localhost:3000                              │
│  ├─ DB: PostgreSQL local ou Supabase dev                    │
│  ├─ Stripe: Mode test                                       │
│  └─ Fichier: .env.local                                     │
│                                                              │
│  Staging (Preview)                                           │
│  ├─ URL: https://staging.ava-tickets.com                    │
│  ├─ DB: Supabase staging                                    │
│  ├─ Stripe: Mode test (clés dédiées)                        │
│  ├─ Monitoring: Actif                                       │
│  └─ Déploiement: Vercel (branche staging)                   │
│                                                              │
│  Production                                                  │
│  ├─ URL: https://ava-tickets.com                            │
│  ├─ DB: Supabase production (avec backup)                   │
│  ├─ Stripe: Mode LIVE                                       │
│  ├─ Monitoring: Actif avec alertes                          │
│  └─ Déploiement: Vercel (branche main)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Fichiers de configuration

```
ava/
├── env.template                    # Template principal
├── config/
│   ├── env.development.example     # Exemple pour dev
│   ├── env.staging.example         # Exemple pour staging
│   └── env.production.example      # Exemple pour production
├── src/
│   └── config/
│       ├── env.ts                  # Module de configuration
│       ├── constants.ts            # Constantes
│       └── index.ts                # Exports
└── scripts/
    ├── setup-env.sh                # Script de configuration
    └── deploy-vercel.sh            # Script de déploiement
```

## 🛠️ Configuration locale (Development)

### 1. Prérequis

- Node.js >= 18.17.0
- npm >= 9.0.0
- PostgreSQL (optionnel, peut utiliser Supabase)
- Git

### 2. Installation

```bash
# Cloner le repository
git clone https://github.com/votre-org/ava.git
cd ava

# Installer les dépendances
npm install
```

### 3. Configuration des variables d'environnement

```bash
# Créer le fichier .env.local
npm run env:setup

# Générer un secret NextAuth
npm run env:secret
```

### 4. Configurer les services

#### A. Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Aller dans Settings > API
3. Copier les valeurs dans `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Récupérer l'URL de connexion PostgreSQL:
   - Settings > Database > Connection string > URI

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

#### B. Stripe

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Activer le mode test
3. Aller dans Developers > API keys
4. Copier les clés dans `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
```

5. Configurer les webhooks locaux:

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# ou
scoop install stripe                   # Windows

# Se connecter
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

6. Copier le webhook secret affiché:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### C. Uploadcare

1. Créer un compte sur [uploadcare.com](https://uploadcare.com)
2. Aller dans Dashboard > API Keys
3. Copier les clés:

```env
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=demopublickey
UPLOADCARE_SECRET_KEY=demoprivatekey
```

#### D. Resend (Emails)

1. Créer un compte sur [resend.com](https://resend.com)
2. Aller dans API Keys
3. Créer une nouvelle clé:

```env
RESEND_API_KEY=re_...
NEXT_PUBLIC_EMAIL_FROM=dev@localhost
```

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate

# (Optionnel) Ajouter des données de test
npm run prisma:seed
```

### 6. Valider et démarrer

```bash
# Valider la configuration
npm run env:validate

# Démarrer le serveur
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 🌐 Configuration Staging

### 1. Créer les ressources staging

#### A. Supabase Staging

1. Créer un nouveau projet Supabase pour staging
2. Nommer le projet: `ava-staging`
3. Noter les credentials

#### B. Stripe Staging

1. Utiliser le mode test avec des clés dédiées
2. Créer un webhook pour staging:
   - URL: `https://staging.ava-tickets.com/api/webhooks/stripe`
   - Événements: `payment_intent.*`, `charge.*`, `identity.*`

### 2. Configurer sur Vercel

```bash
# Se connecter à Vercel
vercel login

# Lier le projet
vercel link

# Ajouter les variables d'environnement (preview)
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
vercel env add DATABASE_URL preview
vercel env add NEXTAUTH_URL preview
vercel env add NEXTAUTH_SECRET preview
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY preview
vercel env add STRIPE_SECRET_KEY preview
vercel env add STRIPE_WEBHOOK_SECRET preview
# ... autres variables
```

### 3. Déployer

```bash
# Déployer en preview
npm run deploy:preview

# Ou manuellement
vercel
```

## 🚀 Configuration Production

### 1. Créer les ressources production

#### A. Supabase Production

1. Créer un nouveau projet Supabase pour production
2. Nommer le projet: `ava-production`
3. Activer les backups automatiques
4. Configurer les alertes

#### B. Stripe Production

1. **Activer le compte Stripe en mode LIVE**
2. Compléter le KYC de l'entreprise
3. Configurer les webhooks production:
   - URL: `https://ava-tickets.com/api/webhooks/stripe`
   - Événements: `payment_intent.*`, `charge.*`, `identity.*`

#### C. Monitoring

1. **Sentry** (Error tracking)
   - Créer un projet sur [sentry.io](https://sentry.io)
   - Copier le DSN

2. **PostHog** (Analytics)
   - Créer un projet sur [posthog.com](https://posthog.com)
   - Copier la clé API

### 2. Configurer sur Vercel

```bash
# Ajouter les variables d'environnement (production)
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add SENTRY_DSN production
vercel env add NEXT_PUBLIC_POSTHOG_KEY production
# ... autres variables
```

### 3. Déployer

```bash
# Déployer en production
npm run deploy:production

# Ou manuellement
vercel --prod
```

## 📦 Déploiement sur Vercel

### Configuration du projet

1. **Créer le projet sur Vercel**

```bash
vercel link
```

2. **Configurer les branches**

- `main` → Production
- `staging` → Preview (staging)
- Autres branches → Preview (dev)

3. **Configurer les domaines**

- Production: `ava-tickets.com`
- Staging: `staging.ava-tickets.com`

### Workflow de déploiement

```bash
# 1. Développement local
git checkout -b feature/nouvelle-fonctionnalite
# ... développement ...
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite

# 2. Pull Request → Preview deployment automatique
# Vercel crée un déploiement preview

# 3. Merge vers staging
git checkout staging
git merge feature/nouvelle-fonctionnalite
git push origin staging
# → Déploiement automatique sur staging.ava-tickets.com

# 4. Tests sur staging
# ... tests manuels et automatisés ...

# 5. Merge vers main (production)
git checkout main
git merge staging
git push origin main
# → Déploiement automatique sur ava-tickets.com
```

## 🔒 Sécurité et bonnes pratiques

### Gestion des secrets

1. **Ne jamais committer les fichiers `.env*`**

```bash
# Vérifier .gitignore
cat .gitignore | grep .env
```

2. **Utiliser des secrets différents par environnement**

```bash
# Générer un nouveau secret pour chaque environnement
openssl rand -base64 32
```

3. **Rotation des clés**

- Changer `NEXTAUTH_SECRET` tous les 6 mois
- Utiliser Vercel Secrets pour les valeurs sensibles
- Activer l'audit des accès

### Validation

```bash
# Avant chaque déploiement
npm run env:validate
npm run type-check
npm run lint
npm run test:ci
npm run build
```

### Monitoring

1. **Configurer les alertes Sentry**
   - Erreurs critiques → Email + Slack
   - Taux d'erreur > 1% → Alerte

2. **Configurer les alertes Vercel**
   - Build failed → Email
   - Déploiement production → Notification

3. **Health checks**

```bash
# Vérifier l'état de l'application
curl https://ava-tickets.com/api/health
```

## 🔧 Troubleshooting

### Problème: Variables d'environnement non chargées

```bash
# Solution 1: Redémarrer le serveur dev
npm run dev

# Solution 2: Vérifier le fichier
cat .env.local | grep -v '^#'

# Solution 3: Valider la configuration
npm run env:validate
```

### Problème: Erreur Prisma

```bash
# Régénérer le client
npm run prisma:generate

# Vérifier les migrations
npm run prisma:migrate status

# Reset la DB (dev uniquement)
npm run prisma:migrate reset
```

### Problème: Webhooks Stripe ne fonctionnent pas

```bash
# En local: vérifier que Stripe CLI est actif
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Tester un webhook
stripe trigger payment_intent.succeeded

# En staging/prod: vérifier la configuration sur Stripe Dashboard
```

### Problème: Build Vercel échoue

1. Vérifier les variables d'environnement sur Vercel
2. Tester le build localement:

```bash
npm run build
```

3. Vérifier les logs Vercel:

```bash
vercel logs [deployment-url]
```

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Stripe](https://stripe.com/docs)
- [Documentation Supabase](https://supabase.com/docs)

---

**Questions ?** Consultez [ENVIRONMENT.md](../ENVIRONMENT.md) ou contactez l'équipe technique.
