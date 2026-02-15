#!/bin/bash
# Script pour configurer toutes les variables d'environnement Vercel
# Exécuter: bash VERCEL_ENV_COMMANDS.sh

set -e

echo "🚀 Configuration des variables d'environnement Vercel"
echo "====================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  Pour chaque variable, vous devrez sélectionner:${NC}"
echo "   - Production"
echo "   - Preview"
echo "   - Development"
echo ""
read -p "Appuyez sur Entrée pour continuer..."

# DATABASE_URL
echo ""
echo -e "${GREEN}📊 Configuration DATABASE_URL${NC}"
echo "Copiez et collez cette valeur quand demandé:"
echo "postgresql://postgres:Loveshirel02\$@db.njogpuyhodyvzppislsb.supabase.co:5432/postgres"
echo ""
vercel env add DATABASE_URL

# NEXT_PUBLIC_SUPABASE_URL
echo ""
echo -e "${GREEN}🔗 Configuration NEXT_PUBLIC_SUPABASE_URL${NC}"
echo "Copiez et collez cette valeur quand demandé:"
echo "https://njogpuyhodyvzppislsb.supabase.co"
echo ""
vercel env add NEXT_PUBLIC_SUPABASE_URL

# NEXT_PUBLIC_SUPABASE_ANON_KEY
echo ""
echo -e "${GREEN}🔑 Configuration NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}"
echo "Copiez et collez cette valeur quand demandé:"
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qb2dwdXlob2R5dnpwcGlzbHNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjMyMjMsImV4cCI6MjA4NjczOTIyM30.BXKLxrYubEEzIzvnBY_Q5jQ4-qBfJX0MNh9JI5zTBU0"
echo ""
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# SUPABASE_SERVICE_ROLE_KEY
echo ""
echo -e "${GREEN}🔐 Configuration SUPABASE_SERVICE_ROLE_KEY${NC}"
echo "Copiez et collez cette valeur quand demandé:"
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qb2dwdXlob2R5dnpwcGlzbHNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE2MzIyMywiZXhwIjoyMDg2NzM5MjIzfQ.3aRzp_3SL4GzWXM77yM5QMWaDNTjIC53U5RS1d_btVQ"
echo ""
vercel env add SUPABASE_SERVICE_ROLE_KEY

# STRIPE_WEBHOOK_SECRET (déjà configuré normalement mais on vérifie)
echo ""
echo -e "${GREEN}💳 Configuration STRIPE_WEBHOOK_SECRET${NC}"
echo "Copiez et collez cette valeur quand demandé:"
echo "whsec_MK3cndR23fPfdDsGxMXiWqPAGbXniVQE"
echo ""
read -p "Cette variable est déjà configurée ? (y/n): " already_configured
if [ "$already_configured" != "y" ]; then
    vercel env add STRIPE_WEBHOOK_SECRET
fi

echo ""
echo -e "${GREEN}✅ Configuration terminée !${NC}"
echo ""
echo "📋 Vérifier les variables:"
echo "  vercel env ls"
echo ""
echo "🚀 Déployer:"
echo "  git add ."
echo "  git commit -m 'feat: configure Supabase and all env variables'"
echo "  git push origin main"
echo ""
