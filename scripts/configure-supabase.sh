#!/bin/bash
set -e

echo "🔧 Configuration Supabase pour Ava"
echo "=================================="
echo ""

# Variables Supabase (déjà connues)
SUPABASE_URL="https://njogpuyhodyvzppislsb.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_k_7x73J0sn-fBFbNWp1rrg_R2ECKYAL"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qb2dwdXlob2R5dnpwcGlzbHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjMyMjMsImV4cCI6MjA4NjczOTIyM30.BXKLxrYubEEzIzvnBY_Q5jQ4-qBfJX0MNh9JI5zTBU0"

echo "✅ Project URL: $SUPABASE_URL"
echo "✅ Anon Key: ${SUPABASE_ANON_KEY:0:50}..."
echo ""

# Demander DATABASE_URL
echo "📊 Database Configuration"
echo "========================="
echo ""
echo "Allez sur: https://supabase.com/dashboard/project/njogpuyhodyvzppislsb/settings/database"
echo "Copiez la Connection String (URI format)"
echo ""
read -p "DATABASE_URL (postgresql://...): " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL est requis!"
    exit 1
fi

# Demander Service Role Key
echo ""
echo "🔑 Service Role Key"
echo "==================="
echo ""
echo "Allez sur: https://supabase.com/dashboard/project/njogpuyhodyvzppislsb/settings/api"
echo "Copiez la clé 'service_role'"
echo ""
read -p "SUPABASE_SERVICE_ROLE_KEY (eyJhbG...): " SERVICE_ROLE_KEY

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Service Role Key est requise!"
    exit 1
fi

echo ""
echo "📝 Ajout des variables dans .env.local..."

# Vérifier si .env.local existe
if [ ! -f .env.local ]; then
    echo "# Created by configure-supabase.sh" > .env.local
fi

# Ajouter les variables Supabase
cat >> .env.local << EOF

# ============================================================================
# SUPABASE (Added by configure-supabase.sh on $(date))
# ============================================================================
DATABASE_URL="$DATABASE_URL"
NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"

EOF

echo "✅ Variables ajoutées à .env.local"
echo ""

# Demander si on configure Vercel
read -p "Voulez-vous configurer Vercel maintenant? (y/n): " configure_vercel

if [ "$configure_vercel" = "y" ]; then
    echo ""
    echo "🚀 Configuration Vercel..."
    echo ""
    
    # DATABASE_URL
    echo "📊 Ajout DATABASE_URL..."
    echo "$DATABASE_URL" | vercel env add DATABASE_URL production preview development
    
    # NEXT_PUBLIC_SUPABASE_URL
    echo "📊 Ajout NEXT_PUBLIC_SUPABASE_URL..."
    echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development
    
    # NEXT_PUBLIC_SUPABASE_ANON_KEY
    echo "🔑 Ajout NEXT_PUBLIC_SUPABASE_ANON_KEY..."
    echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development
    
    # SUPABASE_SERVICE_ROLE_KEY
    echo "🔑 Ajout SUPABASE_SERVICE_ROLE_KEY..."
    echo "$SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development
    
    echo ""
    echo "✅ Toutes les variables Vercel configurées!"
else
    echo ""
    echo "ℹ️  Pour configurer Vercel plus tard, exécutez manuellement:"
    echo ""
    echo "vercel env add DATABASE_URL"
    echo "vercel env add NEXT_PUBLIC_SUPABASE_URL"
    echo "vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "vercel env add SUPABASE_SERVICE_ROLE_KEY"
fi

echo ""
echo "🎉 Configuration Supabase terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "  1. Tester la connexion: npm run prisma:generate && npx prisma db push"
echo "  2. Déployer sur Vercel: git add . && git commit -m 'feat: add Supabase config' && git push"
echo "  3. Vérifier le déploiement: vercel logs --follow"
echo ""
