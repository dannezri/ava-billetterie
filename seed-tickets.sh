#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║         🎫 Seed Billets de Test                              ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/dannezri/Desktop/ava

# Vérifier si tsx est installé
if ! npm list tsx &> /dev/null; then
    echo "📦 Installation de tsx..."
    npm install -D tsx
    echo ""
fi

# Vérifier si dotenv est installé
if ! npm list dotenv &> /dev/null; then
    echo "📦 Installation de dotenv..."
    npm install dotenv
    echo ""
fi

echo "🚀 Exécution du script de seed..."
echo ""

npx tsx prisma/seed-tickets.ts

echo ""
echo "✅ Terminé !"
echo ""
echo "💡 Prochaines étapes:"
echo "   1. Visitez http://localhost:3000/events"
echo "   2. Cliquez sur un événement"
echo "   3. Vous devriez voir les billets de test"
echo "   4. Cliquez sur 'Acheter' pour tester le flux d'achat"
echo ""
