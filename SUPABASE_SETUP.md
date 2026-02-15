# 🗄️ Configuration Supabase - Projet Ava

## ✅ Informations Déjà Configurées

```bash
Project URL: https://njogpuyhodyvzppislsb.supabase.co
Project ID: njogpuyhodyvzppislsb
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qb2dwdXlob2R5dnpwcGlzbHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjMyMjMsImV4cCI6MjA4NjczOTIyM30.BXKLxrYubEEzIzvnBY_Q5jQ4-qBfJX0MNh9JI5zTBU0
```

✅ Déjà ajouté dans `.env.local`

---

## ⚠️ Informations Manquantes (À Récupérer)

### 1️⃣ DATABASE_URL (Connection String) - CRITICAL ⚠️

**Étapes :**

1. Aller sur https://supabase.com/dashboard/project/njogpuyhodyvzppislsb
2. Cliquer sur **Settings** (⚙️ icône engrenage en bas à gauche)
3. Cliquer sur **Database** dans le menu
4. Scroller jusqu'à la section **Connection string**
5. Sélectionner l'onglet **URI** (pas "Pooler" ni "JDBC")
6. Copier la chaîne complète qui ressemble à :
   ```
   postgresql://postgres.njogpuyhodyvzppislsb:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

**⚠️ Important :**
- Remplacer `[YOUR-PASSWORD]` par le mot de passe que vous avez défini lors de la création du projet
- Si vous avez oublié le mot de passe, cliquez sur "Reset database password"

### 2️⃣ Service Role Key (Admin Key)

**Étapes :**

1. Toujours dans **Settings**
2. Cliquer sur **API** dans le menu
3. Scroller jusqu'à **Project API keys**
4. Copier la clé **`service_role`** (Secret)
   - Elle commence par `eyJhbGc...`
   - Elle est **différente** de l'anon key
   - Elle est marquée "⚠️ This key has the ability to bypass Row Level Security"

**⚠️ Sécurité :**
- Ne JAMAIS exposer cette clé côté client
- Ne JAMAIS la commit dans Git
- Uniquement pour usage serveur (API routes, webhooks)

---

## ⚡ Configuration Automatique (Recommandé)

### Option A : Script Bash (5 min)

```bash
cd /Users/dannezri/Desktop/ava

# Rendre le script exécutable
chmod +x scripts/configure-supabase.sh

# Exécuter le script
./scripts/configure-supabase.sh
```

Le script va :
1. ✅ Vous demander la `DATABASE_URL`
2. ✅ Vous demander la `SERVICE_ROLE_KEY`
3. ✅ Ajouter tout dans `.env.local`
4. ✅ (Optionnel) Configurer Vercel automatiquement

---

## 📝 Configuration Manuelle (Alternative)

### Étape 1 : Ajouter dans .env.local

Ouvrir `/Users/dannezri/Desktop/ava/.env.local` et ajouter :

```bash
# ============================================================================
# SUPABASE - Compléter ces variables
# ============================================================================

# Récupéré depuis Settings > Database > Connection string > URI
DATABASE_URL="postgresql://postgres.njogpuyhodyvzppislsb:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Récupéré depuis Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Ces 2 sont déjà configurées ✅
# NEXT_PUBLIC_SUPABASE_URL="https://njogpuyhodyvzppislsb.supabase.co"
# NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
```

### Étape 2 : Ajouter dans Vercel

```bash
cd /Users/dannezri/Desktop/ava

# DATABASE_URL
vercel env add DATABASE_URL
# Coller la connection string complète
# Sélectionner: Production, Preview, Development

# NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Valeur: https://njogpuyhodyvzppislsb.supabase.co
# Sélectionner: Production, Preview, Development

# NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Coller l'anon key
# Sélectionner: Production, Preview, Development

# SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Coller la service role key
# Sélectionner: Production, Preview, Development
```

---

## ✅ Vérification de la Configuration

### Test 1 : Connexion Locale

```bash
cd /Users/dannezri/Desktop/ava

# Générer Prisma Client
npm run prisma:generate

# Créer les tables dans Supabase
npx prisma db push

# Si succès, vous verrez :
# ✓ The database is now in sync with the Prisma schema.
```

### Test 2 : Vérifier Vercel

```bash
# Lister toutes les variables
vercel env ls

# Vous devriez voir :
# DATABASE_URL                    production, preview, development
# NEXT_PUBLIC_SUPABASE_URL        production, preview, development
# NEXT_PUBLIC_SUPABASE_ANON_KEY   production, preview, development
# SUPABASE_SERVICE_ROLE_KEY       production, preview, development
# STRIPE_WEBHOOK_SECRET           production, preview, development
```

### Test 3 : Tables Créées dans Supabase

1. Aller sur https://supabase.com/dashboard/project/njogpuyhodyvzppislsb
2. Cliquer sur **Table Editor** (📊 icône dans le menu)
3. Vous devriez voir vos tables :
   - ✅ `users`
   - ✅ `events`
   - ✅ `tickets`
   - ✅ `transactions`
   - ✅ `disputes`
   - ✅ `reviews`
   - ✅ `audit_logs`

---

## 🔐 Configuration Row Level Security (RLS)

Supabase a RLS activé par défaut. Pour l'instant, on va le désactiver pour les tests :

### Option A : Via Dashboard Supabase (Temporaire pour dev)

1. **Table Editor** > Sélectionner une table
2. Cliquer sur l'icône 🔒 à côté du nom de la table
3. **Disable RLS** (temporairement)
4. Répéter pour toutes les tables

### Option B : Via SQL (Recommandé)

1. **SQL Editor** dans Supabase
2. Exécuter :

```sql
-- Désactiver RLS temporairement pour le développement
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE disputes DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

**⚠️ Important :** En production, réactiver RLS et créer les policies appropriées.

---

## 🚀 Activer Supabase Auth

### Étape 1 : Configurer Auth

1. **Authentication** dans le menu Supabase
2. **Providers** > **Email**
3. Activer **"Enable Email provider"**
4. Désactiver **"Confirm email"** (pour les tests)

### Étape 2 : Configuration URL

Dans **Authentication** > **URL Configuration** :

```
Site URL: https://ava-billetterie-web.vercel.app
Redirect URLs: 
  - http://localhost:3000/**
  - https://ava-billetterie-web.vercel.app/**
```

---

## 📊 Configuration du Schéma Prisma

Votre schéma Prisma (`prisma/schema.prisma`) utilise déjà les bons types pour Supabase.

### Pousser le Schéma vers Supabase

```bash
# Créer les tables
npx prisma db push

# Générer le client Prisma
npm run prisma:generate

# Ouvrir Prisma Studio pour voir les données
npm run prisma:studio
```

---

## 🧪 Test Complet de la Configuration

### Test 1 : Connexion Database

```bash
cd /Users/dannezri/Desktop/ava

# Tester la connexion
npx prisma db execute --stdin <<< "SELECT 1;"

# Si succès : ✓ Database connection successful
```

### Test 2 : Créer un Utilisateur Test

```sql
-- Dans Supabase SQL Editor
INSERT INTO users (id, email, kyc_status, trust_score)
VALUES (
  gen_random_uuid(),
  'test@ava-tickets.com',
  'PENDING',
  50
);

-- Vérifier
SELECT * FROM users;
```

### Test 3 : API Route

Une fois déployé :

```bash
curl https://ava-billetterie-web.vercel.app/api/health

# Devrait retourner :
# {"success":true,"data":{"status":"healthy","services":{"database":"up",...}}}
```

---

## 📋 Checklist Complète

### Variables d'Environnement
- [x] `NEXT_PUBLIC_SUPABASE_URL` (ajouté)
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ajouté)
- [ ] `DATABASE_URL` ⚠️ À AJOUTER
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ⚠️ À AJOUTER

### Configuration Supabase
- [x] Projet créé
- [ ] DATABASE_URL récupéré
- [ ] Service Role Key récupéré
- [ ] Tables créées (via `prisma db push`)
- [ ] RLS désactivé (temporaire dev)
- [ ] Auth activé (Email provider)
- [ ] Redirect URLs configurés

### Configuration Vercel
- [ ] `DATABASE_URL` ajouté
- [ ] `NEXT_PUBLIC_SUPABASE_URL` ajouté
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` ajouté
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ajouté

### Tests
- [ ] `prisma db push` réussi
- [ ] `prisma:studio` fonctionne
- [ ] Test insertion manuelle dans users
- [ ] Health check retourne 200

---

## 🆘 Troubleshooting

### ❌ "Error: P1001 Can't reach database server"

**Causes possibles :**
- Mauvais `DATABASE_URL`
- Mot de passe incorrect dans la connection string
- Firewall/VPN bloque la connexion

**Solution :**
```bash
# Tester la connexion avec psql
psql "postgresql://postgres.njogpuyhodyvzppislsb:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Si ça ne marche pas, réinitialiser le mot de passe :
# Supabase Dashboard > Settings > Database > Reset database password
```

### ❌ "Invalid API key"

**Cause :** Mauvaise anon key ou service role key

**Solution :**
1. Vérifier Settings > API
2. Copier à nouveau les clés
3. Mettre à jour `.env.local` et Vercel

### ❌ Tables ne sont pas créées

**Solution :**
```bash
# Forcer la création
npx prisma db push --force-reset

# Vérifier dans Supabase Table Editor
```

---

## 🎯 Prochaines Étapes

Une fois Supabase configuré :

1. ✅ Déployer sur Vercel
   ```bash
   git add .
   git commit -m "feat: configure Supabase"
   git push origin main
   ```

2. ✅ Tester le health check
   ```bash
   curl https://ava-billetterie-web.vercel.app/api/health
   ```

3. ✅ Configurer les autres services :
   - Stripe Connect + Identity
   - Uploadcare (upload PDF)
   - Resend (emails)

4. ✅ Développer la première feature :
   - Page d'authentification
   - Intégration Supabase Auth
   - Tests login/register

---

## 📚 Ressources

- [Supabase Dashboard](https://supabase.com/dashboard/project/njogpuyhodyvzppislsb)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

## ✨ Résumé

**Ce qui est fait :**
- ✅ Projet Supabase créé
- ✅ Anon key configurée localement
- ✅ URL configurée localement

**Ce qu'il manque (2 variables) :**
- ⚠️ `DATABASE_URL` → À récupérer depuis Settings > Database
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` → À récupérer depuis Settings > API

**Action immédiate :**
1. Récupérer ces 2 variables depuis le dashboard Supabase
2. Exécuter le script : `./scripts/configure-supabase.sh`
3. OU ajouter manuellement dans `.env.local` et Vercel

---

**Une fois configuré, votre app aura une base de données PostgreSQL complète avec Auth intégré ! 🎉**
