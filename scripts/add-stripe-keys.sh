#!/bin/bash

# Script pour ajouter les clés Stripe à Vercel
# Usage: bash scripts/add-stripe-keys.sh

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║     📦 Configuration Clés Stripe sur Vercel              ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Vérifier que les variables sont définies
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "❌ ERREUR: STRIPE_SECRET_KEY n'est pas définie"
  echo ""
  echo "Usage:"
  echo "  export STRIPE_SECRET_KEY='sk_test_...'"
  echo "  export STRIPE_PUBLISHABLE_KEY='pk_test_...'"
  echo "  bash scripts/add-stripe-keys.sh"
  exit 1
fi

if [ -z "$STRIPE_PUBLISHABLE_KEY" ]; then
  echo "❌ ERREUR: STRIPE_PUBLISHABLE_KEY n'est pas définie"
  echo ""
  echo "Usage:"
  echo "  export STRIPE_SECRET_KEY='sk_test_...'"
  echo "  export STRIPE_PUBLISHABLE_KEY='pk_test_...'"
  echo "  bash scripts/add-stripe-keys.sh"
  exit 1
fi

cd "$(dirname "$0")/.."

echo "🔑 Ajout de STRIPE_SECRET_KEY..."
echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY production
echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY preview
echo "$STRIPE_SECRET_KEY" | vercel env add STRIPE_SECRET_KEY development
echo "✅ STRIPE_SECRET_KEY ajoutée"
echo ""

echo "🔑 Ajout de NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY..."
echo "$STRIPE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
echo "$STRIPE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY preview
echo "$STRIPE_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY development
echo "✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ajoutée"
echo ""

echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║     ✅ Clés Stripe configurées avec succès !             ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Prochaine étape : vercel --prod"
