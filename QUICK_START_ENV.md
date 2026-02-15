# 🚀 Quick Start - Configuration des Environnements

Guide rapide pour configurer votre environnement de développement en 5 minutes.

## ⚡ Configuration rapide (5 minutes)

### 1. Créer le fichier d'environnement

```bash
# Copier le template
npm run env:setup
```

### 2. Générer un secret NextAuth

```bash
# Générer un secret sécurisé
npm run env:secret
```

Copiez le secret généré et ajoutez-le dans `.env.local`:

```env
NEXTAUTH_SECRET=le-secret-généré
```

### 3. Configurer les services essentiels

Ouvrez `.env.local` et remplissez les valeurs minimales:

#### A. Supabase (Base de données + Auth)

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Copier les clés depuis Settings > API

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

#### B. Stripe (Paiements)

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Activer le mode test
3. Copier les clés depuis Developers > API keys

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
```

4. Configurer les webhooks en local:

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copier le webhook secret affiché:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### C. Uploadcare (Upload de fichiers)

1. Créer un compte sur [uploadcare.com](https://uploadcare.com)
2. Copier les clés depuis Dashboard > API Keys

```env
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=demopublickey
UPLOADCARE_SECRET_KEY=demoprivatekey
```

#### D. Resend (Emails)

1. Créer un compte sur [resend.com](https://resend.com)
2. Copier la clé API depuis API Keys

```env
RESEND_API_KEY=re_...
NEXT_PUBLIC_EMAIL_FROM=dev@localhost
```

### 4. Valider la configuration

```bash
# Vérifier que toutes les variables requises sont définies
npm run env:validate
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

### 6. Démarrer l'application

```bash
# Démarrer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## ✅ Checklist de vérification

- [ ] `.env.local` créé et rempli
- [ ] `NEXTAUTH_SECRET` généré
- [ ] Supabase configuré
- [ ] Stripe configuré (mode test)
- [ ] Stripe webhooks actifs (via CLI)
- [ ] Uploadcare configuré
- [ ] Resend configuré
- [ ] Base de données migrée
- [ ] Application démarre sans erreur

## 🔧 Commandes utiles

```bash
# Configuration
npm run env:setup          # Créer .env.local
npm run env:secret         # Générer un secret
npm run env:validate       # Valider les variables

# Développement
npm run dev                # Démarrer le serveur
npm run build              # Build production
npm run start              # Démarrer en mode production

# Base de données
npm run prisma:generate    # Générer le client Prisma
npm run prisma:migrate     # Créer/appliquer les migrations
npm run prisma:studio      # Interface graphique DB
npm run prisma:seed        # Ajouter des données de test

# Tests & Qualité
npm run test               # Lancer les tests
npm run lint               # Vérifier le code
npm run type-check         # Vérifier les types TypeScript
```

## 🆘 Problèmes courants

### Erreur: "Missing environment variable"

```bash
# Vérifier quelles variables manquent
npm run env:validate

# Vérifier le fichier
cat .env.local
```

### Stripe webhooks ne fonctionnent pas

```bash
# Vérifier que Stripe CLI est actif
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Dans un autre terminal
stripe trigger payment_intent.succeeded
```

### Base de données inaccessible

```bash
# Vérifier la connexion
psql $DATABASE_URL -c "SELECT 1;"

# Régénérer le client Prisma
npm run prisma:generate
```

### L'application ne démarre pas

```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run dev
```

## 📚 Documentation complète

Pour plus de détails, consultez:

- [ENVIRONMENT.md](./ENVIRONMENT.md) - Documentation complète des environnements
- [README.md](./README.md) - Documentation générale du projet
- [MVP.md](./MVP.md) - Plan de développement MVP

## 🎯 Prochaines étapes

Une fois votre environnement configuré:

1. Lire [ARCHITECTURE.md](./ARCHITECTURE.md) pour comprendre la structure
2. Consulter [CONTRIBUTING.md](./CONTRIBUTING.md) pour les conventions de code
3. Commencer à développer ! 🚀

---

**Besoin d'aide ?** Consultez la [documentation complète](./ENVIRONMENT.md) ou contactez l'équipe.
