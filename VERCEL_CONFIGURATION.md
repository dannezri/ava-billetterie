# 🚀 Configuration Vercel - Projet Ava

## ✅ Statut : Projet Lié avec Succès !

**Projet Vercel :** `ava-billetterie-web`  
**Organisation :** `avas-projects-033b4f47`  
**Environment :** Variables téléchargées dans `.env.local`

---

## 📋 Prochaines Étapes

### 1️⃣ Configurer les Variables d'Environnement Manquantes

Vercel a téléchargé certaines variables, mais vous devez ajouter celles nécessaires pour votre MVP.

#### A. Via le Dashboard Vercel (Recommandé)

1. Aller sur [vercel.com](https://vercel.com)
2. Sélectionner le projet `ava-billetterie-web`
3. Aller dans **Settings** > **Environment Variables**
4. Ajouter les variables suivantes pour chaque environnement (**Development**, **Preview**, **Production**) :

```bash
# ============================================================================
# DATABASE (Critical)
# ============================================================================
DATABASE_URL=postgresql://user:password@host:5432/database_name

# ============================================================================
# NEXT.JS
# ============================================================================
NEXT_PUBLIC_APP_URL=https://ava-billetterie-web.vercel.app
NODE_ENV=production

# ============================================================================
# SUPABASE (Authentication)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================================
# STRIPE (Payments & KYC)
# ============================================================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_IDENTITY_VERIFICATION_SESSION_RETURN_URL=https://ava-billetterie-web.vercel.app/account/kyc/verify

# ============================================================================
# FILE UPLOAD (Uploadcare)
# ============================================================================
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=demopublickey
UPLOADCARE_SECRET_KEY=demoprivatekey

# ============================================================================
# EMAIL (Resend)
# ============================================================================
RESEND_API_KEY=re_...
NEXT_PUBLIC_EMAIL_FROM=noreply@ava-billetterie-web.vercel.app

# ============================================================================
# NEXTAUTH (Session Management)
# ============================================================================
NEXTAUTH_URL=https://ava-billetterie-web.vercel.app
NEXTAUTH_SECRET=generate-a-random-secret-with-openssl-rand-base64-32

# ============================================================================
# MONITORING (Optional mais recommandé)
# ============================================================================
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

#### B. Via CLI (Alternative)

```bash
# Ajouter une variable pour tous les environnements
vercel env add DATABASE_URL

# Ajouter une variable pour un environnement spécifique
vercel env add STRIPE_SECRET_KEY production
```

---

### 2️⃣ Configurer GitHub Integration (Déploiement Automatique)

#### Option A : Via Dashboard Vercel (Recommandé)

1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet `ava-billetterie-web`
3. Aller dans **Settings** > **Git**
4. Cliquer sur **Connect Git Repository**
5. Sélectionner **GitHub**
6. Autoriser Vercel à accéder à votre repo GitHub
7. Sélectionner le repository `ava`

**Configuration automatique :**
- ✅ Déploiement automatique sur push `main` → Production
- ✅ Déploiement preview sur chaque Pull Request
- ✅ Commentaires automatiques dans les PRs avec URL de preview

#### Option B : Via GitHub (Alternative)

1. Aller dans votre repo GitHub `ava`
2. **Settings** > **Integrations** > **Applications**
3. Installer **Vercel for GitHub**
4. Autoriser l'accès au repository

---

### 3️⃣ Configurer les Secrets GitHub (pour CI/CD)

Pour que les GitHub Actions fonctionnent avec Vercel :

1. Aller dans votre repo GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Ajouter les secrets suivants :

```bash
# Récupérer le token Vercel
vercel token

# Ajouter dans GitHub Secrets :
VERCEL_TOKEN=<votre-token>
VERCEL_ORG_ID=avas-projects-033b4f47
VERCEL_PROJECT_ID=<récupérer-depuis-dashboard>

# Autres secrets nécessaires pour CI
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
```

**Pour récupérer le Project ID :**
```bash
# Via CLI
cat .vercel/project.json

# Ou via Dashboard Vercel
# Settings > General > Project ID
```

---

### 4️⃣ Mettre à Jour le Build Configuration

Vérifier la configuration de build dans le dashboard Vercel :

**Settings** > **General** :

```yaml
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
Node.js Version: 20.x (ou 18.x)
```

**Root Directory:** `.` (racine)

**Environment Variables:**
- Toutes les variables configurées à l'étape 1

---

### 5️⃣ Configurer les Database Migrations

Pour que les migrations Prisma s'exécutent automatiquement :

#### A. Ajouter dans `package.json`

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

#### B. Ou créer un script de build personnalisé

Créer `scripts/vercel-build.sh` :

```bash
#!/bin/bash
set -e

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🗄️ Running Database Migrations..."
npx prisma migrate deploy

echo "🏗️ Building Next.js..."
npm run build

echo "✅ Build completed!"
```

Puis dans `package.json` :
```json
{
  "scripts": {
    "vercel-build": "bash scripts/vercel-build.sh"
  }
}
```

---

### 6️⃣ Tester le Déploiement

#### Déploiement Local Preview

```bash
# Build local comme Vercel le ferait
vercel build

# Vérifier que tout fonctionne
npm run build
```

#### Premier Déploiement sur Vercel

```bash
# Déployer en preview (non-production)
vercel

# Déployer en production
vercel --prod
```

**Ou via Git (recommandé) :**

```bash
# Push sur main → déploiement production automatique
git add .
git commit -m "feat: configure Vercel deployment"
git push origin main

# Créer une PR → déploiement preview automatique
git checkout -b feat/test-deployment
git push origin feat/test-deployment
# Créer PR sur GitHub
```

---

### 7️⃣ Configurer les Webhooks Stripe (Critical)

Une fois déployé en production, configurer les webhooks Stripe :

1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Developers** > **Webhooks**
3. Cliquer sur **Add endpoint**
4. **Endpoint URL :** `https://ava-billetterie-web.vercel.app/api/webhooks/stripe`
5. **Events to send :**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `transfer.created`
   - `identity.verification_session.verified`
   - `identity.verification_session.requires_input`

6. Copier le **Signing secret** (`whsec_...`)
7. L'ajouter dans Vercel Environment Variables : `STRIPE_WEBHOOK_SECRET`

---

### 8️⃣ Configurer le Domaine Personnalisé (Optionnel)

Si vous avez un domaine (ex: `ava-tickets.com`) :

1. Vercel Dashboard > Project > **Settings** > **Domains**
2. Ajouter votre domaine
3. Configurer les DNS selon les instructions Vercel
4. Mettre à jour `NEXT_PUBLIC_APP_URL` avec votre domaine
5. Mettre à jour `NEXTAUTH_URL` avec votre domaine
6. Mettre à jour les callback URLs Stripe

---

## 🧪 Checklist de Vérification Post-Déploiement

Une fois déployé, vérifier :

```bash
# 1. Health check
curl https://ava-billetterie-web.vercel.app/api/health

# Devrait retourner :
# { "success": true, "data": { "status": "healthy", ... } }

# 2. Vérifier les logs Vercel
vercel logs

# 3. Vérifier les environment variables
vercel env ls

# 4. Vérifier la connexion database
# Via l'application : créer un compte test
```

### Checklist Dashboard Vercel

- [ ] **Analytics** : Activé (pour voir le trafic)
- [ ] **Speed Insights** : Activé (pour performances)
- [ ] **Logs** : Aucune erreur 5xx
- [ ] **Deployments** : Build réussi
- [ ] **Environment Variables** : Toutes configurées
- [ ] **Domains** : Correctement configuré
- [ ] **Git Integration** : Repo GitHub connecté

---

## 🔄 Workflow de Déploiement Continu

Une fois tout configuré, voici le workflow :

```bash
# Développement local
npm run dev

# Créer une feature branch
git checkout -b feat/new-feature

# Développer + commits
git commit -m "feat(tickets): add validation"

# Push → Déploiement preview automatique
git push origin feat/new-feature

# Créer PR sur GitHub
# → Vercel commente avec URL preview
# → GitHub Actions exécutent les tests
# → Review + merge

# Merge sur main → Déploiement production automatique
git checkout main
git pull origin main
# → Vercel déploie en production automatiquement
```

---

## 📊 Monitoring Production

### Logs en Temps Réel

```bash
# Voir les logs en temps réel
vercel logs --follow

# Logs d'une fonction spécifique
vercel logs --follow api/tickets

# Logs avec erreurs seulement
vercel logs --filter error
```

### Dashboard Vercel

- **Analytics** : Trafic, pages vues, utilisateurs
- **Speed Insights** : Core Web Vitals, performances
- **Logs** : Erreurs en temps réel
- **Deployments** : Historique des déploiements

---

## 🆘 Troubleshooting Vercel

### Build échoue

```bash
# Vérifier localement
npm run build

# Vérifier les logs Vercel
vercel logs <deployment-url>

# Problèmes fréquents :
# - DATABASE_URL manquant
# - Prisma client non généré
# - Variables d'env manquantes
```

### Erreur "Prisma Client not generated"

Ajouter dans `package.json` :
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Erreur de connexion Database

Vérifier :
- `DATABASE_URL` correctement configuré dans Vercel
- Database accessible depuis l'extérieur (whitelist IP Vercel)
- Connection string correct (SSL mode si nécessaire)

### Variables d'environnement non disponibles

```bash
# Vérifier les variables
vercel env ls

# Pull les variables localement
vercel env pull .env.local

# Redéployer après changement
vercel --prod
```

---

## 🎯 Commandes Utiles Vercel

```bash
# Lister les projets
vercel list

# Voir les infos du projet
vercel inspect

# Voir les déploiements
vercel deployments

# Annuler un déploiement
vercel remove <deployment-url>

# Logs production
vercel logs --prod

# Variables d'environnement
vercel env ls
vercel env add KEY_NAME
vercel env rm KEY_NAME

# Promouvoir un deployment en production
vercel promote <deployment-url>

# Rollback (promouvoir un ancien déploiement)
vercel promote <old-deployment-url>
```

---

## ✅ Résumé : Ce Qui Est Fait

- ✅ Vercel CLI installé et configuré
- ✅ Projet `ava-billetterie-web` lié
- ✅ Variables d'environnement téléchargées dans `.env.local`
- ✅ Prêt pour le déploiement

## 🚀 Prochaines Actions Immédiates

1. **Configurer les variables d'environnement** dans Vercel Dashboard
2. **Connecter GitHub** pour déploiement automatique
3. **Ajouter `vercel-build` script** dans `package.json`
4. **Premier déploiement** : `vercel --prod` ou push sur `main`
5. **Configurer webhooks Stripe** avec URL production

---

## 📚 Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Configuration Vercel terminée ! 🎉**

Passez à la configuration des variables d'environnement dans le dashboard Vercel.
