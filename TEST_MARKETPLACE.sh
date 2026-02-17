#!/bin/bash

# Script de test rapide pour les fonctionnalités marketplace
# Usage: ./TEST_MARKETPLACE.sh

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║         🎟️  TEST MARKETPLACE AVA                            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis la racine du projet AVA"
    exit 1
fi

echo "${BLUE}📋 Vérification de l'environnement...${NC}"
echo ""

# Vérifier Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

# Vérifier npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Vérifier les dépendances
if [ -d "node_modules" ]; then
    echo "✅ node_modules installé"
else
    echo "⚠️  node_modules manquant - Installation..."
    npm install
fi

echo ""
echo "${BLUE}📦 Vérification des fichiers créés...${NC}"
echo ""

# Liste des fichiers à vérifier
FILES=(
    "app/api/events/search/route.ts"
    "src/components/tickets/TicketCard.tsx"
    "src/components/events/SearchBar.tsx"
    "src/components/events/FilterSidebar.tsx"
    "MARKETPLACE_README.md"
    "MARKETPLACE_FEATURES.md"
    "MARKETPLACE_QUICK_START.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (manquant)"
    fi
done

echo ""
echo "${BLUE}🧪 Tests API...${NC}"
echo ""

# Vérifier si le serveur est déjà lancé
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Serveur déjà en cours d'exécution sur le port 3000"
    
    echo ""
    echo "${YELLOW}Test 1: API Events${NC}"
    curl -s "http://localhost:3000/api/events" | jq -r '.success' > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ GET /api/events fonctionne"
    else
        echo "⚠️  GET /api/events - Réponse inattendue"
    fi
    
    echo ""
    echo "${YELLOW}Test 2: API Search${NC}"
    curl -s "http://localhost:3000/api/events/search?q=concert" | jq -r '.success' > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ GET /api/events/search fonctionne"
    else
        echo "⚠️  GET /api/events/search - Réponse inattendue"
    fi
    
    echo ""
    echo "${GREEN}✅ Tests API terminés${NC}"
    echo ""
    echo "${BLUE}🌐 URLs à tester dans le navigateur:${NC}"
    echo ""
    echo "  📋 Liste des événements:"
    echo "     http://localhost:3000/events"
    echo ""
    echo "  🔍 Recherche pré-remplie:"
    echo "     http://localhost:3000/events?search=concert"
    echo ""
    echo "  🎟️  Détail événement (remplacer [ID]):"
    echo "     http://localhost:3000/events/[ID]"
    echo ""
    
else
    echo "⚠️  Serveur non lancé sur le port 3000"
    echo ""
    echo "${YELLOW}Pour démarrer le serveur:${NC}"
    echo "  npm run dev"
    echo ""
    echo "${YELLOW}Puis relancez ce script pour tester les API${NC}"
fi

echo ""
echo "${BLUE}📖 Documentation disponible:${NC}"
echo ""
echo "  🎯 Démarrage rapide (5 min):"
echo "     cat MARKETPLACE_QUICK_START.md"
echo ""
echo "  📚 Documentation complète:"
echo "     cat MARKETPLACE_FEATURES.md"
echo ""
echo "  📋 Vue d'ensemble:"
echo "     cat MARKETPLACE_README.md"
echo ""
echo "  ⚡ Commandes CLI:"
echo "     cat MARKETPLACE_COMMANDS.md"
echo ""
echo "  📊 Résumé visuel:"
echo "     cat MARKETPLACE_SUMMARY.txt"
echo ""

echo ""
echo "${BLUE}🚀 Prochaines étapes:${NC}"
echo ""
echo "  1. Démarrer le serveur (si pas déjà fait):"
echo "     ${YELLOW}npm run dev${NC}"
echo ""
echo "  2. Ouvrir dans le navigateur:"
echo "     ${YELLOW}open http://localhost:3000/events${NC}"
echo ""
echo "  3. Tester les fonctionnalités:"
echo "     • Recherche avec autocomplete"
echo "     • Filtres de prix et catégories"
echo "     • Cartes billets avec trust score"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║              ✅ Vérification terminée !                      ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
