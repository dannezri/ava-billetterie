#!/bin/bash
# Script de déploiement automatique - Projet Ava

set -e

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║   🚀  DÉPLOIEMENT AUTOMATIQUE - PROJET AVA  🚀                   ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis le dossier du projet"
    exit 1
fi

# Vérifier que Git est initialisé
if [ ! -d ".git" ]; then
    echo "📦 Initialisation de Git..."
    git init
    echo "✅ Git initialisé"
fi

# Vérifier qu'il y a une remote
if ! git remote | grep -q "origin"; then
    echo ""
    echo "⚠️  Aucune remote Git configurée."
    echo ""
    read -p "URL du repository GitHub (ex: https://github.com/username/ava.git): " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ URL requise. Déploiement annulé."
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo "✅ Remote origin configurée"
fi

echo ""
echo "📝 Vérification des fichiers modifiés..."
git status --short

echo ""
read -p "Continuer le déploiement? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "❌ Déploiement annulé"
    exit 0
fi

echo ""
echo "📦 Ajout des fichiers..."
git add .

echo ""
echo "💬 Création du commit..."
git commit -m "feat: complete MVP infrastructure setup

- Configuration Supabase database (7 tables)
- Stripe webhooks handler
- Vercel environment variables
- Complete Next.js architecture
- CI/CD pipelines
- Documentation (17 files)

Ready for deployment 🚀" || echo "ℹ️  Aucun changement à commiter"

echo ""
echo "🚀 Push vers GitHub..."
git push -u origin main || git push origin main

echo ""
echo "✅ Code poussé vers GitHub!"
echo ""
echo "📊 Vercel va maintenant déployer automatiquement..."
echo ""
echo "🔍 Voir les logs en temps réel:"
echo "   vercel logs --follow"
echo ""
echo "🧪 Tester le déploiement:"
echo "   curl https://ava-billetterie-web.vercel.app/api/health"
echo ""
echo "🎉 Déploiement lancé avec succès!"
