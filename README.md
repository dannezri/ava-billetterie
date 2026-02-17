# 🎫 Ava - Plateforme de Revente de Billets Éthique

> Marketplace sécurisée de revente de billets avec séquestre Stripe, anti-scalping, et vérification KYC.

[![CI](https://github.com/your-org/ava/workflows/CI/badge.svg)](https://github.com/your-org/ava/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 Objectif MVP

Permettre à **10 vendeurs** de lister **50 billets** et réaliser **20 transactions sécurisées** avec séquestre fonctionnel en **12 semaines**.

---

## ✨ Fonctionnalités Clés

### 🔐 Sécurité & Conformité
- ✅ **KYC obligatoire** (Stripe Identity) avant vente
- ✅ **Détection doublons** via hash PDF et code-barres
- ✅ **Validation manuelle** de chaque billet par équipe
- ✅ **Séquestre Stripe** : paiement bloqué jusqu'à J+2 après événement
- ✅ **Audit logs** : traçabilité complète des actions

### 🎫 Gestion des Billets
- 📤 **Upload PDF sécurisé** via Uploadcare (max 5 MB, PDF uniquement) ✅
- 🔍 Extraction automatique métadonnées (code-barres, prix)
- 🚫 **Prix plafonné** : revente ≤ prix facial (anti-scalping)
- ⏱️ Réservation 15 minutes avant expiration
- 🔄 **Détection doublons** : hash PDF + code-barres ✅

### 💳 Paiements & Séquestre
- 💰 Stripe Connect (Custom Accounts)
- 🔒 Fonds bloqués en séquestre
- 📅 Libération automatique **J+2** après événement
- 🛡️ Système de litiges intégré

### 🏛️ Gestion des Litiges
- ⚠️ Ouverture possible **J-1 à J+2**
- 📸 Upload de preuves (photos, vidéos)
- 👨‍⚖️ Résolution manuelle par équipe support
- 💸 Remboursement automatique si litige validé

### 📊 Scoring de Confiance
- 🎯 Score initial : 50/100
- ➕ +5 par vente réussie
- ➖ -20 par litige perdu
- 🚫 Suspension si score < 20

---

## 🛠️ Stack Technique

### Frontend
- **Next.js 14+** (App Router) - SSR, routing, API routes
- **TypeScript** - Type safety
- **Tailwind CSS + shadcn/ui** - UI moderne et accessible
- **React Hook Form + Zod** - Validation formulaires

### Backend
- **Next.js API Routes** - Backend TypeScript type-safe
- **Prisma ORM** - Database ORM avec migrations versionnées
- **PostgreSQL** - Base de données ACID-compliant

### Paiements & Identité
- **Stripe Connect (Custom Accounts)** - Séquestre et paiements vendeurs
- **Stripe Identity** - KYC réglementaire
- **Uploadcare / Cloudinary** - Upload PDF sécurisé

> 📘 **Nouveau** : [Guide Stripe Connect](./STRIPE_CONNECT_QUICK_START.md) - Configuration en 5 minutes

### Auth & Sécurité
- **Supabase Auth** - Authentification (MFA, email verification)
- **NextAuth.js** - Session management

### Infrastructure
- **Vercel** - Hosting & déploiement
- **Sentry** - Error monitoring
- **PostHog** - Product analytics
- **Resend / SendGrid** - Emails transactionnels

---

## 📁 Structure du Projet

```
ava/
├── src/
│   ├── app/              # Next.js App Router (routes + API)
│   ├── components/       # React components (UI pure)
│   ├── services/         # Business logic (tickets, payments, escrow)
│   ├── lib/              # Shared utilities (Prisma, Stripe, Supabase)
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types
│   ├── config/           # Configuration & constants
│   └── styles/           # Global styles
├── prisma/
│   └── schema.prisma     # Database schema
├── .github/
│   └── workflows/        # CI/CD pipelines
└── tests/                # Unit, integration, e2e tests
```

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour la documentation complète.

---

## 🚀 Getting Started

### Prérequis

- **Node.js** >= 18.17.0
- **npm** >= 9.0.0
- **PostgreSQL** 14+
- **Comptes** : Stripe, Supabase, Uploadcare

### Installation

```bash
# Clone le repo
git clone https://github.com/your-org/ava.git
cd ava

# Installer les dépendances
npm install

# Configurer les variables d'environnement
npm run env:setup
npm run env:secret
# Éditer .env.local avec vos clés API (voir QUICK_START_ENV.md)

# Setup Husky (git hooks)
npm run prepare

# Générer Prisma Client
npm run prisma:generate

# Créer la base de données
npm run prisma:migrate

# Seed la base (données de test)
npm run prisma:seed

# Valider la configuration
npm run env:validate
```

### Développement

```bash
# Lancer le serveur dev
npm run dev

# Ouvrir http://localhost:3000
```

### Scripts Disponibles

```bash
npm run dev              # Serveur de développement
npm run build            # Build production
npm run start            # Serveur production
npm run lint             # Linting
npm run lint:fix         # Fix linting automatique
npm run format           # Format avec Prettier
npm run type-check       # Vérifier les types TypeScript
npm run test             # Tests en mode watch
npm run test:ci          # Tests pour CI
npm run prisma:studio    # Interface Prisma Studio

# Configuration environnement
npm run env:setup        # Créer .env.local
npm run env:secret       # Générer secret NextAuth
npm run env:validate     # Valider les variables

# Déploiement
npm run deploy:preview      # Déployer en staging
npm run deploy:production   # Déployer en production
```

---

## 🔧 Configuration

### Variables d'Environnement

**📖 Documentation complète:** [ENVIRONMENT.md](./ENVIRONMENT.md)  
**⚡ Guide rapide (5 min):** [QUICK_START_ENV.md](./QUICK_START_ENV.md)

```bash
# Créer le fichier .env.local
npm run env:setup

# Générer un secret sécurisé
npm run env:secret

# Valider la configuration
npm run env:validate
```

Voir [env.template](./env.template) pour la liste complète des variables.

### Stripe Setup

1. Créer un compte Stripe Connect
2. Activer Stripe Identity
3. Configurer webhooks :
   - `payment_intent.succeeded`
   - `identity.verification_session.verified`
   - `transfer.created`

---

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests avec coverage
npm run test:coverage

# Tests e2e (Playwright)
npx playwright test
```

---

## 🚢 Déploiement

### Vercel (Recommandé)

1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Le déploiement se fait automatiquement sur chaque push `main`

```bash
# Preview deployment sur chaque PR
# Production deployment sur merge vers main
```

### Migrations de Production

```bash
# Les migrations Prisma s'exécutent automatiquement via
# le build command dans Vercel
npx prisma migrate deploy
```

---

## 🤝 Contribution

Nous suivons **Trunk-Based Development**. Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour :

- Workflow Git
- Convention de commits (Conventional Commits)
- Code review process
- Standards de qualité

### Quick Start

```bash
# Créer une branche feature
git checkout -b feat/my-feature

# Commits fréquents et atomiques
git commit -m "feat(tickets): add barcode validation"

# Push et créer une PR
git push origin feat/my-feature
```

---

## 📊 Workflow de Sécurité

### Upload Billet (Vendeur)

1. **KYC vérifié** requis
2. Upload PDF → Scan antivirus
3. Extraction métadonnées (code-barres, prix)
4. Détection doublons via hash
5. **Validation manuelle** équipe
6. Mise en vente si approuvé

### Achat (Acheteur)

1. Réservation 15 minutes
2. Paiement Stripe Elements
3. **Séquestre** : fonds bloqués
4. PDF envoyé à l'acheteur
5. Événement se déroule
6. **J+2** : Libération automatique vers vendeur

### Litiges

1. Acheteur ouvre litige (J-1 à J+2)
2. Upload preuves
3. Séquestre gelé
4. Investigation équipe
5. Résolution : remboursement ou libération

Voir [MVP.md](./MVP.md) pour le workflow détaillé.

---

## 📈 Roadmap

### Phase 1 (MVP) - Semaines 1-12 ✅
- [x] Setup projet & CI/CD
- [ ] Auth & KYC (Stripe Identity)
- [ ] Upload & validation billets
- [ ] Marketplace & recherche
- [ ] Paiements & séquestre
- [ ] Système de litiges
- [ ] Dashboard admin

### Phase 2 - Semaines 13-20
- [ ] Notifications push
- [ ] Système de reviews
- [ ] Analytics vendeur
- [ ] Mobile app (React Native)
- [ ] Multi-devises (GBP, USD)

### Phase 3 - Après 6 mois
- [ ] API publique
- [ ] Intégration billetteries officielles
- [ ] IA détection faux billets
- [ ] Assurance billets

---

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée
- [MVP.md](./MVP.md) - Spécifications MVP complètes
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guide de contribution
- [API Docs](./docs/api.md) - Documentation API (à venir)

---

## 🔒 Sécurité

### Reporting Vulnerabilities

Si vous découvrez une vulnérabilité de sécurité :

1. **NE PAS** ouvrir une issue publique
2. Envoyer un email à : security@ava-tickets.com
3. Inclure : description, steps to reproduce, impact potentiel

Nous nous engageons à répondre sous **48h**.

### Security Best Practices

- ✅ Input validation (Zod)
- ✅ Prepared statements (Prisma)
- ✅ CSP headers
- ✅ Rate limiting
- ✅ Audit logs
- ✅ Secrets via env vars (jamais hardcodés)

---

## 📄 License

[MIT License](LICENSE) - Voir le fichier LICENSE pour détails.

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Stripe](https://stripe.com/) - Infrastructure paiements
- [Prisma](https://www.prisma.io/) - ORM TypeScript
- [shadcn/ui](https://ui.shadcn.com/) - Composants UI
- [Vercel](https://vercel.com/) - Hosting & déploiement

---

## 📞 Support

- 📧 Email : support@ava-tickets.com
- 💬 Discord : [Join our server](https://discord.gg/ava)
- 🐦 Twitter : [@ava_tickets](https://twitter.com/ava_tickets)
- 📖 Docs : [docs.ava-tickets.com](https://docs.ava-tickets.com)

---

**Made with ❤️ by the Ava Team**
