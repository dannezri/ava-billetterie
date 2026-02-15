# 🎯 Vercel - Actions Immédiates

## ✅ Déjà Fait

- ✅ Vercel CLI installé
- ✅ Compte Vercel connecté
- ✅ Projet `ava-billetterie-web` lié
- ✅ Variables d'env téléchargées dans `.env.local`
- ✅ Scripts `vercel-build` et `postinstall` ajoutés dans `package.json`

---

## 🚀 5 Actions à Faire MAINTENANT (15 min)

### 1️⃣ Configurer les Variables d'Environnement (5 min) ⚠️ CRITICAL

Aller sur [vercel.com/dashboard](https://vercel.com/dashboard) :

1. Sélectionner le projet **`ava-billetterie-web`**
2. **Settings** > **Environment Variables**
3. Ajouter ces variables **pour Production ET Preview** :

#### Variables Minimales pour Démarrer

```bash
# Database (CRITICAL - sans ça rien ne marche)
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# Next.js
NEXT_PUBLIC_APP_URL=https://ava-billetterie-web.vercel.app
NODE_ENV=production

# NextAuth (générer avec: openssl rand -base64 32)
NEXTAUTH_URL=https://ava-billetterie-web.vercel.app
NEXTAUTH_SECRET=votre-secret-random-32-chars

# Supabase (si vous avez déjà un compte)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (mode test pour commencer)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (à configurer après le déploiement)
```

> **💡 Astuce :** Vous pouvez ajouter les variables manquantes plus tard. DATABASE_URL est le SEUL vraiment critique pour que l'app démarre.

---

### 2️⃣ Connecter GitHub pour Déploiement Auto (3 min)

Sur [vercel.com/dashboard](https://vercel.com/dashboard) :

1. Projet **`ava-billetterie-web`** > **Settings** > **Git**
2. Cliquer **Connect Git Repository**
3. Sélectionner **GitHub**
4. Autoriser Vercel
5. Choisir votre repository `ava`

**Résultat :**
- ✅ Push sur `main` = Déploiement production auto
- ✅ Chaque PR = Déploiement preview auto avec URL unique

---

### 3️⃣ Premier Déploiement (2 min)

#### Option A : Via Git (Recommandé)

```bash
cd /Users/dannezri/Desktop/ava

# Commit les changements package.json
git add package.json VERCEL_CONFIGURATION.md VERCEL_NEXT_STEPS.md
git commit -m "feat: add Vercel deployment configuration"

# Push vers main (si GitHub connecté)
git push origin main

# → Vercel déploie automatiquement
```

#### Option B : Via CLI

```bash
# Déploiement production direct
vercel --prod

# Ou preview d'abord
vercel
```

**Vérifier le déploiement :**
```bash
# Voir les logs en temps réel
vercel logs --follow

# Ou aller sur vercel.com/dashboard et voir l'onglet "Deployments"
```

---

### 4️⃣ Tester le Health Check (1 min)

Une fois déployé :

```bash
# Remplacer par votre URL de déploiement
curl https://ava-billetterie-web.vercel.app/api/health

# Devrait retourner :
# {"success":true,"data":{"status":"healthy",...}}
```

Ou ouvrir dans le navigateur :
```
https://ava-billetterie-web.vercel.app/api/health
```

**Si ça marche :** ✅ Votre app est déployée !  
**Si erreur 500 :** Vérifier les logs : `vercel logs` ou dashboard Vercel

---

### 5️⃣ Configurer les Webhooks Stripe (4 min)

**⚠️ À faire APRÈS le premier déploiement :**

1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com/test/webhooks)
2. Cliquer **Add endpoint**
3. **Endpoint URL :** `https://ava-billetterie-web.vercel.app/api/webhooks/stripe`
4. **Events to send :**
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.succeeded`
   - ✅ `transfer.created`
   - ✅ `identity.verification_session.verified`
   - ✅ `identity.verification_session.requires_input`

5. Copier le **Signing secret** (`whsec_...`)
6. L'ajouter dans Vercel : **Settings** > **Environment Variables** :
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
7. Redéployer : `vercel --prod` ou push sur main

---

## 📊 Vérifications Post-Déploiement

```bash
# 1. Vérifier les variables d'env
vercel env ls

# 2. Vérifier les déploiements
vercel deployments

# 3. Voir les logs
vercel logs

# 4. Tester l'URL de production
curl https://ava-billetterie-web.vercel.app/api/health
```

---

## 🔧 Commandes Vercel Utiles

```bash
# Logs en temps réel
vercel logs --follow

# Logs avec erreurs uniquement
vercel logs --filter error

# Informations du projet
vercel inspect

# Liste des environnements variables
vercel env ls

# Pull les variables localement
vercel env pull .env.local

# Déployer en preview
vercel

# Déployer en production
vercel --prod

# Annuler le dernier déploiement
vercel rollback
```

---

## 🆘 Problèmes Fréquents

### ❌ Build échoue : "Prisma Client not generated"

**Solution :** Le script `postinstall` devrait le gérer. Si ça persiste :

```bash
# Tester localement
npm run vercel-build

# Vérifier package.json contient bien :
# "postinstall": "prisma generate"
```

### ❌ "Cannot connect to database"

**Solution :**
1. Vérifier `DATABASE_URL` dans Vercel Environment Variables
2. S'assurer que votre DB PostgreSQL accepte les connexions externes
3. Vérifier le format : `postgresql://user:pass@host:5432/dbname?schema=public`

### ❌ "Environment variable not found"

**Solution :**
```bash
# Lister toutes les variables
vercel env ls

# Ajouter la variable manquante
vercel env add VARIABLE_NAME

# Redéployer
vercel --prod
```

### ❌ Page 404 / 500

**Solution :**
```bash
# Voir les logs
vercel logs --filter error

# Vérifier le build
vercel build

# Tester localement
npm run build
npm run start
```

---

## 📈 Prochaines Étapes (Après Déploiement)

### Phase 1 : Setup Services Externes
- [ ] **Supabase** : Créer projet + Auth
- [ ] **Stripe** : Activer Connect + Identity
- [ ] **Uploadcare** : Créer compte pour upload PDF
- [ ] **Resend** : Créer compte pour emails

### Phase 2 : Monitoring
- [ ] Activer **Vercel Analytics**
- [ ] Activer **Speed Insights**
- [ ] Configurer **Sentry** (erreurs)
- [ ] Configurer **PostHog** (analytics)

### Phase 3 : Domaine Personnalisé
- [ ] Acheter domaine (ex: `ava-tickets.com`)
- [ ] Ajouter dans Vercel Settings > Domains
- [ ] Configurer DNS
- [ ] Mettre à jour toutes les URLs (Stripe, Supabase, etc.)

---

## ✅ Checklist Finale

- [ ] Variables d'env configurées dans Vercel
- [ ] GitHub repository connecté
- [ ] Premier déploiement réussi
- [ ] Health check retourne 200
- [ ] Webhooks Stripe configurés
- [ ] Logs Vercel sans erreurs
- [ ] Database accessible

---

## 🎉 Bravo !

Une fois ces 5 actions faites, votre application sera **déployée en production** et accessible publiquement !

**URL de votre app :**
`https://ava-billetterie-web.vercel.app`

**Dashboard Vercel :**
`https://vercel.com/dashboard`

---

## 📚 Ressources

- [Documentation complète](./VERCEL_CONFIGURATION.md)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma on Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

**Questions ? Consultez [VERCEL_CONFIGURATION.md](./VERCEL_CONFIGURATION.md) pour le guide détaillé.**

**Let's deploy! 🚀**
