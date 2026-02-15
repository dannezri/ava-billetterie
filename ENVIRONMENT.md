# Configuration des Environnements

Ce document explique comment configurer et gérer les différents environnements (development, staging, production) pour la plateforme Ava.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Environnements disponibles](#environnements-disponibles)
- [Configuration initiale](#configuration-initiale)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts disponibles](#scripts-disponibles)
- [Déploiement](#déploiement)
- [Sécurité](#sécurité)
- [Troubleshooting](#troubleshooting)

## 🎯 Vue d'ensemble

Le projet utilise un système de configuration multi-environnement avec:

- **Fichiers de configuration**: Templates et fichiers `.env` par environnement
- **Module centralisé**: `src/config/env.ts` pour la validation et l'accès aux variables
- **Scripts d'aide**: Automatisation de la configuration et validation

### Architecture

```
ava/
├── env.template                    # Template pour les variables d'environnement
├── .env.local                      # Development local (gitignored)
├── .env.test                       # Tests (gitignored)
├── src/
│   └── config/
│       ├── env.ts                  # Configuration centralisée avec validation
│       ├── constants.ts            # Constantes de l'application
│       └── index.ts                # Point d'entrée
└── scripts/
    └── setup-env.sh                # Script d'aide pour la configuration
```

## 🌍 Environnements disponibles

### Development (Local)

- **Fichier**: `.env.local`
- **URL**: `http://localhost:3000`
- **Base de données**: PostgreSQL local ou Supabase dev
- **Stripe**: Mode test
- **Monitoring**: Optionnel

### Staging

- **URL**: `https://staging.ava-tickets.com`
- **Base de données**: Instance staging sur Supabase
- **Stripe**: Mode test avec clés dédiées
- **Monitoring**: Actif (Sentry + PostHog)
- **Déploiement**: Via Vercel (branche `staging`)

### Production

- **URL**: `https://ava-tickets.com`
- **Base de données**: Instance production avec backup
- **Stripe**: Mode LIVE
- **Monitoring**: Actif et configuré pour alertes
- **Déploiement**: Via Vercel (branche `main`)

## 🚀 Configuration initiale

### 1. Copier le template

```bash
# Créer le fichier .env.local depuis le template
cp env.template .env.local

# Ou utiliser le script d'aide
npm run env:setup
```

### 2. Remplir les valeurs

Ouvrez `.env.local` et remplissez les valeurs pour chaque variable:

#### Variables essentielles (minimum viable)

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ava_dev

# Supabase (créer un projet sur https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=généré-avec-openssl-rand-base64-32

# Stripe (mode test: https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Générer les secrets

```bash
# Générer un secret NextAuth
npm run env:secret

# Copier le secret généré dans .env.local
```

### 4. Valider la configuration

```bash
# Vérifier que toutes les variables requises sont définies
npm run env:validate

# Tester que l'application démarre
npm run dev
```

## 📝 Variables d'environnement

### Application

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `NODE_ENV` | Environnement Node.js | Oui | `development`, `production` |
| `NEXT_PUBLIC_APP_URL` | URL de l'application | Oui | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Nom de l'application | Non | `Ava` |

### Base de données

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | Oui | `postgresql://...` |

### Supabase

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Oui | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme publique | Oui | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (privée) | Oui | `eyJhbGci...` |

### NextAuth

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `NEXTAUTH_URL` | URL de callback NextAuth | Oui | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret pour JWT | Oui | Généré aléatoirement |

### Stripe

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Clé publique Stripe | Oui | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | Oui | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | Oui | `whsec_...` |
| `STRIPE_IDENTITY_VERIFICATION_SESSION_RETURN_URL` | URL retour KYC | Oui | `http://localhost:3000/kyc/verify` |

### Upload (Uploadcare ou Cloudinary)

**Option 1: Uploadcare (recommandé)**

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY` | Clé publique Uploadcare | Oui* | `demopublickey` |
| `UPLOADCARE_SECRET_KEY` | Clé secrète Uploadcare | Oui* | `demoprivatekey` |

**Option 2: Cloudinary**

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud | Oui* | `your-cloud` |
| `CLOUDINARY_API_KEY` | Clé API | Oui* | `123456789` |
| `CLOUDINARY_API_SECRET` | Secret API | Oui* | `abcdef...` |

*Au moins un des deux providers doit être configuré

### Email (Resend ou SendGrid)

**Option 1: Resend (recommandé)**

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `RESEND_API_KEY` | Clé API Resend | Oui* | `re_...` |

**Option 2: SendGrid**

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `SENDGRID_API_KEY` | Clé API SendGrid | Oui* | `SG....` |

**Configuration commune**

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `NEXT_PUBLIC_EMAIL_FROM` | Adresse email d'envoi | Oui | `noreply@ava-tickets.com` |

*Au moins un des deux providers doit être configuré

### Monitoring (Optionnel)

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `SENTRY_DSN` | DSN Sentry pour tracking erreurs | Non | `https://...@sentry.io/...` |
| `NEXT_PUBLIC_POSTHOG_KEY` | Clé PostHog | Non | `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | Host PostHog | Non | `https://app.posthog.com` |

### Feature Flags

| Variable | Description | Requis | Valeur par défaut |
|----------|-------------|--------|-------------------|
| `NEXT_PUBLIC_ENABLE_DISPUTES` | Activer les litiges | Non | `true` |
| `NEXT_PUBLIC_ENABLE_REVIEWS` | Activer les avis | Non | `false` |
| `NEXT_PUBLIC_MAX_TICKET_PRICE` | Prix max d'un billet | Non | `5000` |

## 🛠️ Scripts disponibles

### Configuration

```bash
# Créer le fichier .env.local depuis le template
npm run env:setup

# Générer un secret pour NextAuth
npm run env:secret

# Valider les variables d'environnement
npm run env:validate
```

### Développement

```bash
# Démarrer en mode développement
npm run dev

# Lancer les tests
npm run test

# Vérifier le code
npm run lint
npm run type-check
```

### Build et déploiement

```bash
# Build pour production
npm run build

# Démarrer en mode production
npm run start

# Build avec analyse du bundle
npm run analyze
```

## 🚢 Déploiement

### Vercel (Recommandé)

#### 1. Configuration des environnements sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Configurer le projet
vercel link
```

#### 2. Ajouter les variables d'environnement

**Pour Development (Preview)**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add DATABASE_URL development
# ... autres variables
```

**Pour Staging (Preview pour la branche staging)**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add DATABASE_URL preview
# ... autres variables
```

**Pour Production**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add DATABASE_URL production
# ... autres variables
```

#### 3. Déployer

```bash
# Déployer en preview
vercel

# Déployer en production
vercel --prod
```

### Configuration des webhooks Stripe

Après le déploiement, configurez les webhooks Stripe:

1. **Development**: Utiliser Stripe CLI

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

2. **Staging/Production**: Configurer sur le dashboard Stripe

- URL: `https://[votre-domaine]/api/webhooks/stripe`
- Événements à écouter:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
  - `identity.verification_session.verified`

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais committer les fichiers `.env*`**
   - Vérifier que `.env*` est dans `.gitignore`
   - Utiliser `env.template` pour la documentation

2. **Utiliser des secrets forts**
   ```bash
   # Générer des secrets cryptographiquement sûrs
   openssl rand -base64 32
   ```

3. **Rotation des clés**
   - Changer `NEXTAUTH_SECRET` régulièrement
   - Utiliser des clés différentes par environnement
   - Ne jamais réutiliser les clés de production

4. **Accès aux clés**
   - Limiter l'accès aux clés de production
   - Utiliser des rôles et permissions appropriés
   - Activer l'audit des accès (Vercel, Stripe, Supabase)

5. **Variables publiques vs privées**
   - Préfixe `NEXT_PUBLIC_` = exposé au client
   - Sans préfixe = serveur uniquement
   - Ne jamais mettre de secrets dans les variables publiques

### Vérification de sécurité

```bash
# Vérifier qu'aucun secret n'est dans le code
git grep -E "(sk_live|sk_test|pk_live|pk_test)" -- ':!env.template'

# Vérifier les variables publiques
git grep "NEXT_PUBLIC" -- ':!env.template' ':!ENVIRONMENT.md'
```

## 🔧 Troubleshooting

### Erreur: "Missing environment variable"

```bash
# Vérifier quelles variables sont manquantes
npm run env:validate

# Vérifier que .env.local existe
ls -la .env.local

# Recharger les variables
source .env.local
```

### L'application ne démarre pas

```bash
# Vérifier la syntaxe du fichier .env.local
cat .env.local | grep -v '^#' | grep '='

# Vérifier les quotes
# ❌ MAUVAIS: KEY="value"
# ✅ BON: KEY=value
```

### Les variables ne sont pas chargées

```bash
# Redémarrer le serveur dev
# Next.js ne recharge pas .env.local à chaud
npm run dev
```

### Problèmes avec Stripe webhooks

```bash
# En local, utiliser Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Tester un webhook
stripe trigger payment_intent.succeeded
```

### Erreurs de connexion à la base de données

```bash
# Vérifier que la DB est accessible
psql $DATABASE_URL -c "SELECT 1;"

# Vérifier les migrations Prisma
npx prisma migrate status
npx prisma generate
```

## 📚 Ressources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Supabase Project Settings](https://supabase.com/docs/guides/api)

## 💡 Conseils

1. **Toujours tester localement avant de déployer**
   ```bash
   npm run build
   npm run start
   ```

2. **Utiliser des valeurs différentes par environnement**
   - Projets Supabase séparés (dev, staging, prod)
   - Comptes Stripe séparés
   - Bases de données séparées

3. **Documenter les changements**
   - Mettre à jour `env.template` pour les nouvelles variables
   - Notifier l'équipe des changements de configuration

4. **Automatiser la validation**
   - Ajouter `npm run env:validate` dans le CI/CD
   - Bloquer le déploiement si des variables manquent

---

**Questions ou problèmes ?** Consultez la [documentation du projet](./README.md) ou contactez l'équipe technique.
