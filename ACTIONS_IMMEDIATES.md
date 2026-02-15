# ⚡ Actions Immédiates - Projet Ava

## ✅ Ce Qui Est Fait

- ✅ Configuration complète du projet (ESLint, Prettier, Husky, CI/CD)
- ✅ Architecture Next.js App Router complète
- ✅ Vercel CLI configuré et projet lié
- ✅ Webhooks Stripe créés (2 endpoints)
- ✅ Code webhook handler déployé
- ✅ `STRIPE_WEBHOOK_SECRET` ajouté localement (.env.local)
- ✅ Documentation exhaustive (10+ fichiers)

---

## 🎯 3 Actions CRITIQUES à Faire MAINTENANT (10 min)

### 1️⃣ Ajouter STRIPE_WEBHOOK_SECRET dans Vercel (2 min) ⚠️

```bash
cd /Users/dannezri/Desktop/ava
vercel env add STRIPE_WEBHOOK_SECRET
```

**Valeur à coller :**
```
whsec_MK3cndR23fPfdDsGxMXiWqPAGbXniVQE
```

**Sélectionner :**
- [x] Production
- [x] Preview  
- [x] Development

---

### 2️⃣ Supprimer un Webhook Stripe (1 min)

Vous avez créé **2 webhooks identiques**. Gardez-en un seul.

**Aller sur :** https://dashboard.stripe.com/test/webhooks

**Supprimer :**
- Soit `whimsical-celebration-snapshot`
- Soit `whimsical-celebration-thin`

**Garder celui qui a tous ces événements :**
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `charge.succeeded`
- ✅ `transfer.created`
- ✅ `identity.verification_session.verified`
- ✅ `identity.verification_session.requires_input`

---

### 3️⃣ Configurer Database PostgreSQL (5 min) ⚠️ CRITICAL

**Sans database, l'app ne peut pas démarrer !**

#### Option A : Supabase (Recommandé)

1. Aller sur https://supabase.com
2. **New project**
3. Nom : `ava-tickets`
4. Database Password : (garder précieusement)
5. Region : `West Europe (Frankfurt)` ou `Paris`
6. Attendre ~2 min que le projet soit créé
7. **Settings** > **Database** > **Connection string** > **URI**
8. Copier la connection string (format: `postgresql://...`)

```bash
# Ajouter dans Vercel
vercel env add DATABASE_URL

# Coller la connection string Supabase
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

#### Option B : Railway

1. https://railway.app
2. New Project > Provision PostgreSQL
3. Copier `DATABASE_URL` depuis l'onglet Connect
4. Ajouter dans Vercel : `vercel env add DATABASE_URL`

#### Option C : Neon

1. https://neon.tech
2. Create Project
3. Copier connection string
4. Ajouter dans Vercel : `vercel env add DATABASE_URL`

---

## 🚀 Après ces 3 Actions : Premier Déploiement

```bash
cd /Users/dannezri/Desktop/ava

# Commit tous les changements
git add .
git commit -m "feat: add Stripe webhooks and Vercel config"

# Si GitHub n'est pas encore configuré :
git init  # (si pas déjà fait)
git remote add origin https://github.com/your-username/ava.git
git branch -M main
git push -u origin main

# → Vercel déploie automatiquement (si GitHub connecté)

# OU déployer directement via CLI :
vercel --prod
```

---

## ✅ Vérifier le Déploiement

### Test 1 : Health Check

```bash
curl https://ava-billetterie-web.vercel.app/api/health
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-02-15T...",
    "services": {
      "database": "up",
      "api": "up"
    }
  }
}
```

### Test 2 : Logs Vercel

```bash
vercel logs --follow
```

**Résultat attendu :** Pas d'erreurs 500

### Test 3 : Webhooks Stripe

1. Aller sur https://dashboard.stripe.com/test/webhooks
2. Cliquer sur votre webhook
3. Cliquer **Send test webhook**
4. Sélectionner `payment_intent.succeeded`
5. Vérifier : Status 200 (succès)

---

## 📋 Checklist Post-Déploiement

- [ ] `STRIPE_WEBHOOK_SECRET` ajouté dans Vercel
- [ ] Webhook Stripe dupliqué supprimé
- [ ] `DATABASE_URL` configuré dans Vercel
- [ ] Code déployé sur Vercel
- [ ] Health check retourne 200
- [ ] Logs Vercel sans erreur
- [ ] Test webhook Stripe réussi (200)

---

## 🔮 Prochaines Étapes (Cette Semaine)

Une fois ces 3 actions faites et déployées :

### Jour 1-2 : Services Auth & Paiements
1. **Supabase Auth** (30 min)
   - Activer Auth sur le projet Supabase
   - Configurer Email/Password provider
   - Ajouter `NEXT_PUBLIC_SUPABASE_URL` et clés dans Vercel

2. **Stripe Connect + Identity** (1h)
   - Activer Connect dans Stripe Dashboard
   - Activer Identity pour KYC
   - Configurer les clés dans Vercel

3. **NextAuth Secret** (5 min)
   ```bash
   openssl rand -base64 32
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL  # https://ava-billetterie-web.vercel.app
   ```

### Jour 3-4 : Storage & Emails
1. **Uploadcare** (15 min)
   - Créer compte uploadcare.com
   - Récupérer clés
   - Configurer dans Vercel

2. **Resend** (15 min)
   - Créer compte resend.com
   - Créer API key
   - Vérifier domaine
   - Configurer dans Vercel

### Jour 5 : Migrations Database
```bash
# Générer migration initiale
npm run prisma:generate
npx prisma migrate dev --name init

# Push vers Vercel → migrations automatiques
git push origin main
```

### Jour 6-7 : Première Feature
- Développer page d'authentification
- Connecter Supabase Auth
- Tester login/register

---

## 🆘 Si Quelque Chose Ne Marche Pas

### Vercel Build Échoue

```bash
# Tester localement d'abord
npm install
npm run build

# Voir les logs détaillés
vercel logs

# Vérifier les variables d'env
vercel env ls
```

### Database Connection Error

```bash
# Vérifier la connection string
# Format attendu :
postgresql://user:password@host:5432/database

# Tester localement
npx prisma db push
```

### Webhooks 500 Error

```bash
# Voir les logs
vercel logs --filter error

# Vérifier que DATABASE_URL est configuré
vercel env ls
```

---

## 📞 Ressources

### Documentation Créée
- [STATUS.md](./STATUS.md) - Progression complète
- [STRIPE_WEBHOOKS_SETUP.md](./STRIPE_WEBHOOKS_SETUP.md) - Config webhooks
- [VERCEL_NEXT_STEPS.md](./VERCEL_NEXT_STEPS.md) - Actions Vercel
- [QUICK_START.md](./QUICK_START.md) - Démarrage rapide

### Dashboards
- Vercel: https://vercel.com/avas-projects-033b4f47/ava-billetterie-web
- Stripe: https://dashboard.stripe.com/test/webhooks
- Supabase: https://supabase.com/dashboard

### Commandes Utiles
```bash
vercel logs --follow          # Logs en temps réel
vercel env ls                 # Lister variables
vercel deployments            # Voir déploiements
vercel --prod                 # Déployer en prod
vercel rollback               # Rollback
```

---

## ✨ Résumé

**Vous êtes à 85% d'avoir une app déployée et fonctionnelle !**

Il ne manque que :
1. ⚡ `STRIPE_WEBHOOK_SECRET` dans Vercel (2 min)
2. ⚡ Supprimer webhook dupliqué (1 min)
3. ⚡ `DATABASE_URL` dans Vercel (5 min)

Puis `git push` et votre app sera **LIVE** ! 🚀

---

**Commencez maintenant :** 
```bash
cd /Users/dannezri/Desktop/ava
vercel env add STRIPE_WEBHOOK_SECRET
```
