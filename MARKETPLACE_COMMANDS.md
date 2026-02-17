# ⚡ Commandes Rapides - Marketplace

Commandes essentielles pour travailler avec les nouvelles fonctionnalités marketplace.

---

## 🚀 Démarrage

```bash
# Démarrer le serveur de développement
npm run dev

# Ouvrir dans le navigateur
open http://localhost:3000/events
```

---

## 🗄️ Base de Données

```bash
# Voir les données dans Prisma Studio
npx prisma studio

# Seeder la DB avec des événements de test
npx prisma db seed

# Réinitialiser la DB (⚠️ ATTENTION: supprime toutes les données)
npx prisma migrate reset

# Appliquer les migrations
npx prisma migrate dev
```

---

## 🧪 Tests

```bash
# Tester l'API de recherche
curl "http://localhost:3000/api/events/search?q=concert&limit=5"

# Tester l'API des événements
curl "http://localhost:3000/api/events"

# Tester avec des paramètres
curl "http://localhost:3000/api/events?city=Paris&category=Concert"
```

---

## 🔍 Pages à Tester

```bash
# Page liste événements
open http://localhost:3000/events

# Page détail événement (remplacer ID)
open http://localhost:3000/events/[EVENT_ID]

# Page avec recherche pré-remplie
open "http://localhost:3000/events?search=paris"
```

---

## 📝 Édition Rapide

```bash
# Composant SearchBar
code src/components/events/SearchBar.tsx

# Composant TicketCard
code src/components/tickets/TicketCard.tsx

# Composant FilterSidebar
code src/components/events/FilterSidebar.tsx

# Page détail événement
code app/\(public\)/events/\[id\]/page.tsx

# API recherche
code app/api/events/search/route.ts
```

---

## 🎨 Design System

```bash
# Voir le design system
open http://localhost:3000/design-system

# Composants UI disponibles
ls src/components/ui/

# Documentation design
open DESIGN_SYSTEM.md
```

---

## 🐛 Debugging

```bash
# Vérifier les erreurs TypeScript
npm run type-check

# Vérifier les erreurs de linting
npm run lint

# Formater le code
npm run format

# Voir les logs en temps réel
tail -f .next/server/app-paths-manifest.json
```

---

## 📊 Prisma Queries Utiles

```bash
# Compter les événements
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM events;"

# Voir les 5 derniers événements
npx prisma db execute --stdin <<< "SELECT * FROM events ORDER BY created_at DESC LIMIT 5;"

# Voir les billets actifs
npx prisma db execute --stdin <<< "SELECT * FROM tickets WHERE status = 'ACTIVE' LIMIT 10;"
```

---

## 🔧 Maintenance

```bash
# Nettoyer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache Next.js
rm -rf .next

# Rebuild Prisma Client
npx prisma generate

# Tout nettoyer et rebuild
npm run clean && npm install && npx prisma generate && npm run dev
```

---

## 📦 Déploiement

```bash
# Build de production
npm run build

# Démarrer en production
npm start

# Vérifier la build
npm run build && npm start
```

---

## 🎯 Créer de Nouvelles Fonctionnalités

### Nouveau Composant UI

```bash
# Créer un nouveau composant
touch src/components/ui/mon-composant.tsx

# L'ajouter à l'index
echo "export { MonComposant } from './mon-composant';" >> src/components/ui/index.ts
```

### Nouvel Endpoint API

```bash
# Créer une nouvelle route API
mkdir -p app/api/ma-route
touch app/api/ma-route/route.ts
```

### Nouvelle Page

```bash
# Créer une nouvelle page publique
mkdir -p app/\(public\)/ma-page
touch app/\(public\)/ma-page/page.tsx
```

---

## 📚 Documentation

```bash
# Documentation marketplace
open MARKETPLACE_FEATURES.md

# Guide de démarrage rapide
open MARKETPLACE_QUICK_START.md

# Documentation MVP
open MVP.md

# Architecture Prisma
open PRISMA_SETUP.md
```

---

## 🔍 Recherche dans le Code

```bash
# Trouver tous les usages de TicketCard
grep -r "TicketCard" --include="*.tsx" --include="*.ts"

# Trouver les TODO dans le code
grep -r "TODO:" --include="*.tsx" --include="*.ts"

# Trouver les console.log
grep -r "console.log" --include="*.tsx" --include="*.ts"
```

---

## 🎨 Styles & Theming

```bash
# Fichier de configuration Tailwind
code tailwind.config.ts

# Styles globaux
code app/globals.css

# Design tokens
code src/styles/tokens.ts
```

---

## 🚨 En Cas d'Erreur

### Erreur: Port 3000 déjà utilisé

```bash
# Trouver le processus
lsof -ti:3000

# Tuer le processus
kill -9 $(lsof -ti:3000)

# Ou utiliser un autre port
PORT=3001 npm run dev
```

### Erreur: Database connection

```bash
# Vérifier les variables d'environnement
cat .env | grep DATABASE_URL

# Tester la connexion
npx prisma db pull
```

### Erreur: Module not found

```bash
# Réinstaller les dépendances
npm install

# Vérifier les imports
grep -r "from '@/components" --include="*.tsx"
```

---

## 🎯 Aliases de Commandes

Ajoutez dans votre `~/.zshrc` ou `~/.bashrc`:

```bash
# Aliases AVA
alias ava-dev="cd ~/Desktop/ava && npm run dev"
alias ava-studio="cd ~/Desktop/ava && npx prisma studio"
alias ava-seed="cd ~/Desktop/ava && npx prisma db seed"
alias ava-build="cd ~/Desktop/ava && npm run build"
alias ava-test="cd ~/Desktop/ava && npm test"

# Recharger le shell
source ~/.zshrc  # ou source ~/.bashrc
```

Utilisation:
```bash
ava-dev    # Lance le serveur de dev
ava-studio # Ouvre Prisma Studio
ava-seed   # Seed la DB
```

---

## 📊 Statistiques

```bash
# Compter les lignes de code
find . -name "*.tsx" -o -name "*.ts" | xargs wc -l

# Compter les composants
find src/components -name "*.tsx" | wc -l

# Taille du projet
du -sh .

# Dépendances installées
npm list --depth=0
```

---

## 🎉 Raccourcis Utiles

- **⌘ + T** - Nouveau terminal
- **⌘ + K** - Nettoyer le terminal
- **⌘ + /** - Commenter/décommenter
- **⌘ + P** - Rechercher fichier (VS Code)
- **⌘ + Shift + F** - Recherche globale (VS Code)
- **F12** - Console navigateur

---

**Codez bien ! 💻✨**
