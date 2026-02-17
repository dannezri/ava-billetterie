#!/bin/bash

# Script pour nettoyer les clés Uploadcare en double dans .env.local

echo "🔧 Nettoyage des clés Uploadcare dans .env.local..."
echo ""

# Créer une copie de sauvegarde
cp .env.local .env.local.backup
echo "✅ Sauvegarde créée : .env.local.backup"
echo ""

# Supprimer les lignes avec demopublickey et demosecretkey
sed -i '' '/demopublickey/d' .env.local
sed -i '' '/demosecretkey/d' .env.local

echo "✅ Clés 'demo' supprimées"
echo ""

# Afficher les clés restantes
echo "📋 Clés Uploadcare restantes :"
grep UPLOADCARE .env.local
echo ""

echo "✅ Nettoyage terminé !"
echo ""
echo "⚠️  ACTION REQUISE :"
echo "   1. Arrêter le serveur Next.js (Ctrl+C)"
echo "   2. Relancer : npm run dev"
echo "   3. Rafraîchir la page /tickets/new"
echo ""
