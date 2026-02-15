# ⚡ ACTIONS IMMÉDIATES - 10 Minutes

## ✅ Ce Qui Est Déjà Fait

- ✅ Supabase projet créé : `njogpuyhodyvzppislsb`
- ✅ `NEXT_PUBLIC_SUPABASE_URL` ajouté dans `.env.local`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ajouté dans `.env.local`
- ✅ Script de configuration créé

---

## 🎯 IL VOUS MANQUE 2 INFORMATIONS (5 min)

### 1️⃣ DATABASE_URL

**Aller ici :** https://supabase.com/dashboard/project/njogpuyhodyvzppislsb/settings/database

**Étapes :**
1. Scroller jusqu'à "Connection string"
2. Cliquer sur l'onglet **URI**
3. Copier la chaîne complète
4. Remplacer `[YOUR-PASSWORD]` par votre vrai mot de passe

**Format attendu :**
```
postgresql://postgres.njogpuyhodyvzppislsb:[VOTRE-MOT-DE-PASSE]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

### 2️⃣ SERVICE_ROLE_KEY

**Aller ici :** https://supabase.com/dashboard/project/njogpuyhodyvzppislsb/settings/api

**Étapes :**
1. Scroller jusqu'à "Project API keys"
2. Copier la clé **service_role** (commence par `eyJhbGc...`)
3. C'est **différent** de l'anon key que vous m'avez déjà donnée

---

## 🚀 Configuration Automatique (3 min)

Une fois que vous avez ces 2 informations :

```bash
cd /Users/dannezri/Desktop/ava

# Exécuter le script
./scripts/configure-supabase.sh
```

Le script va :
1. Vous demander la `DATABASE_URL` → coller
2. Vous demander la `SERVICE_ROLE_KEY` → coller
3. Ajouter tout dans `.env.local`
4. (Optionnel) Configurer Vercel automatiquement

---

## 📝 OU Configuration Manuelle (5 min)

Si le script ne marche pas :

### A. Ajouter dans .env.local

```bash
cd /Users/dannezri/Desktop/ava

# Éditer .env.local
code .env.local

# Ajouter ces 2 lignes (remplacer les valeurs) :
DATABASE_URL="postgresql://postgres.njogpuyhodyvzppislsb:[VOTRE-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
```

### B. Ajouter dans Vercel

```bash
# DATABASE_URL
vercel env add DATABASE_URL
# Coller la connection string
# Sélectionner: Production, Preview, Development

# Service Role Key
vercel env add SUPABASE_SERVICE_ROLE_KEY  
# Coller la service role key
# Sélectionner: Production, Preview, Development

# Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Valeur: https://njogpuyhodyvzppislsb.supabase.co
# Sélectionner: Production, Preview, Development

# Anon Key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Coller: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qb2dwdXlob2R5dnpwcGlzbHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjMyMjMsImV4cCI6MjA4NjczOTIyM30.BXKLxrYubEEzIzvnBY_Q5jQ4-qBfJX0MNh9JI5zTBU0
# Sélectionner: Production, Preview, Development
```

---

## ✅ Tester la Configuration (2 min)

```bash
cd /Users/dannezri/Desktop/ava

# 1. Générer Prisma Client
npm run prisma:generate

# 2. Créer les tables dans Supabase
npx prisma db push

# ✅ Si vous voyez "The database is now in sync", c'est bon !

# 3. (Optionnel) Voir les tables créées
npm run prisma:studio
# Ouvre http://localhost:5555 avec toutes vos tables
```

---

## 🚀 Déployer (1 min)

```bash
# Commit tout
git add .
git commit -m "feat: configure Supabase database"

# Push vers GitHub (si connecté)
git push origin main

# → Vercel déploie automatiquement

# OU déployer directement
vercel --prod
```

---

## 🧪 Vérifier le Déploiement

```bash
# Test health check
curl https://ava-billetterie-web.vercel.app/api/health

# Devrait retourner :
# {"success":true,"data":{"status":"healthy","services":{"database":"up"}}}
```

---

## 📋 Checklist Rapide

- [ ] Récupéré `DATABASE_URL` depuis Supabase Dashboard
- [ ] Récupéré `SUPABASE_SERVICE_ROLE_KEY` depuis Supabase Dashboard
- [ ] Exécuté `./scripts/configure-supabase.sh` (ou config manuelle)
- [ ] Testé avec `npx prisma db push`
- [ ] 7 tables créées dans Supabase (users, events, tickets, transactions, disputes, reviews, audit_logs)
- [ ] Variables ajoutées dans Vercel
- [ ] Code déployé
- [ ] Health check retourne 200

---

## 🎯 Résumé Ultra-Rapide

**Vous êtes à 2 copier-coller de pouvoir déployer ! 🚀**

1. Récupérer `DATABASE_URL` depuis https://supabase.com/dashboard/project/njogpuyhodyvzppislsb/settings/database
2. Récupérer `SERVICE_ROLE_KEY` depuis https://supabase.com/dashboard/project/njogpuyhodyvzppislsb/settings/api
3. Exécuter `./scripts/configure-supabase.sh`
4. `git push origin main`
5. ✅ Votre app est LIVE avec database !

---

## 📚 Documentation

- **Guide complet :** [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- **Troubleshooting :** [SUPABASE_SETUP.md#troubleshooting](./SUPABASE_SETUP.md#troubleshooting)
- **Status projet :** [STATUS.md](./STATUS.md)

---

**Dites-moi une fois que vous avez récupéré ces 2 informations et je vous aide à finaliser ! 💪**
