import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8').split('\n');
  envConfig.forEach((line) => {
    // Ignore comments
    if (line.trim().startsWith('#')) return;
    
    // Split by first '='
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      // Join the rest back in case value contains '='
      const value = parts.slice(1).join('=').trim();
      // Remove quotes if present
      const cleanValue = value.replace(/^['"](.*)['"]$/, '$1');
      
      if (key && cleanValue) {
        process.env[key] = cleanValue;
      }
    }
  });
}

const prisma = new PrismaClient();

async function resetUserStripe(email: string) {
  try {
    console.log(`🔍 Recherche de l'utilisateur ${email}...`);
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    if (!user.stripeAccountId) {
      console.log('ℹ️  L\'utilisateur n\'a pas de compte Stripe lié.');
      return;
    }

    console.log(`🔗 Compte Stripe actuel : ${user.stripeAccountId}`);
    
    await prisma.user.update({
      where: { email },
      data: {
        stripeAccountId: null, // Réinitialise le lien Stripe
        kycStatus: 'PENDING',
      },
    });
    console.log(`✅ Compte Stripe découplé pour ${email}`);
    console.log('🚀 Vous pouvez maintenant recommencer l\'onboarding sur /seller/onboarding');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Remplacez par l'email de votre utilisateur de test
const email = process.argv[2];
if (email) {
  resetUserStripe(email);
} else {
  console.log('Usage: npx tsx scripts/reset-stripe-user.ts <email>');
}
