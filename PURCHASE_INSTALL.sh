#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║         🛒 Installation Flux d'Achat                         ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/dannezri/Desktop/ava

echo "📦 Installation des dépendances..."
echo ""

# Stripe
echo "→ Stripe (client + server + React Elements)..."
npm install @stripe/stripe-js stripe @stripe/react-stripe-js

# Resend
echo "→ Resend (emails)..."
npm install resend

# Radix UI Checkbox
echo "→ Radix UI Checkbox..."
npm install @radix-ui/react-checkbox

echo ""
echo "✅ Toutes les dépendances sont installées !"
echo ""
echo "📝 Prochaines étapes:"
echo ""
echo "1. Configurer les variables d'environnement dans .env.local:"
echo "   - STRIPE_SECRET_KEY"
echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_WEBHOOK_SECRET"
echo "   - RESEND_API_KEY"
echo "   - NEXT_PUBLIC_APP_URL"
echo ""
echo "2. Appliquer les migrations Prisma:"
echo "   npx prisma migrate dev"
echo ""
echo "3. Démarrer le serveur:"
echo "   npm run dev"
echo ""
echo "4. Démarrer Stripe CLI (terminal séparé):"
echo "   stripe listen --forward-to localhost:3000/api/webhooks/stripe"
echo ""
echo "📖 Voir PURCHASE_SETUP.md pour plus de détails"
echo ""
