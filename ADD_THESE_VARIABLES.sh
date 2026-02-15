#!/bin/bash
# Script pour ajouter les variables manquantes sur Vercel

echo "🔧 Ajout des variables manquantes sur Vercel..."
echo ""

# NextAuth
echo "1️⃣ Génération du secret NextAuth..."
SECRET=$(openssl rand -base64 32)
echo "vercel env add NEXTAUTH_SECRET production"
echo "$SECRET" | vercel env add NEXTAUTH_SECRET production
echo "$SECRET" | vercel env add NEXTAUTH_SECRET preview
echo "$SECRET" | vercel env add NEXTAUTH_SECRET development

echo ""
echo "2️⃣ Configuration NEXTAUTH_URL..."
echo "https://ava-billetterie-web.vercel.app" | vercel env add NEXTAUTH_URL production
echo "https://ava-billetterie-web.vercel.app" | vercel env add NEXTAUTH_URL preview
echo "http://localhost:3000" | vercel env add NEXTAUTH_URL development

echo ""
echo "3️⃣ Configuration Stripe Identity..."
echo "https://ava-billetterie-web.vercel.app/account/kyc/verify" | vercel env add STRIPE_IDENTITY_VERIFICATION_SESSION_RETURN_URL production
echo "https://ava-billetterie-web.vercel.app/account/kyc/verify" | vercel env add STRIPE_IDENTITY_VERIFICATION_SESSION_RETURN_URL preview
echo "http://localhost:3000/account/kyc/verify" | vercel env add STRIPE_IDENTITY_VERIFICATION_SESSION_RETURN_URL development

echo ""
echo "4️⃣ Configuration Uploadcare (temporaire)..."
echo "demopublickey" | vercel env add NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY production
echo "demopublickey" | vercel env add NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY preview
echo "demopublickey" | vercel env add NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY development
echo "demosecretkey" | vercel env add UPLOADCARE_SECRET_KEY production
echo "demosecretkey" | vercel env add UPLOADCARE_SECRET_KEY preview
echo "demosecretkey" | vercel env add UPLOADCARE_SECRET_KEY development

echo ""
echo "5️⃣ Configuration Email (temporaire)..."
echo "re_placeholder_get_real_key_from_resend" | vercel env add RESEND_API_KEY production
echo "re_placeholder_get_real_key_from_resend" | vercel env add RESEND_API_KEY preview
echo "re_placeholder_get_real_key_from_resend" | vercel env add RESEND_API_KEY development
echo "noreply@ava-billetterie-web.vercel.app" | vercel env add NEXT_PUBLIC_EMAIL_FROM production
echo "noreply@ava-billetterie-web.vercel.app" | vercel env add NEXT_PUBLIC_EMAIL_FROM preview
echo "noreply@localhost" | vercel env add NEXT_PUBLIC_EMAIL_FROM development

echo ""
echo "6️⃣ Configuration APP_URL..."
echo "https://ava-billetterie-web.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production
echo "https://ava-billetterie-web.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL preview
echo "http://localhost:3000" | vercel env add NEXT_PUBLIC_APP_URL development

echo ""
echo "✅ Toutes les variables ont été ajoutées !"
echo ""
echo "🚀 Redéployez maintenant avec :"
echo "   vercel --prod"
