import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Load .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8').split('\n');
  envConfig.forEach((line) => {
    if (line.trim().startsWith('#')) return;
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      const cleanValue = value.replace(/^['"](.*)['"]$/, '$1');
      if (key && cleanValue) {
        process.env[key] = cleanValue;
      }
    }
  });
}

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        stripeAccountId: true,
        kycStatus: true,
      },
    });

    console.log('📋 Utilisateurs trouvés :', users.length);
    console.table(users);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
