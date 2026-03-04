/**
 * Script de seed pour ajouter des billets de test
 * Usage: npx tsx prisma/seed-tickets.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed des billets de test...\n');

  try {
    // 1. Récupérer tous les événements
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'asc' },
    });

    if (events.length === 0) {
      console.log('⚠️  Aucun événement trouvé. Veuillez d\'abord créer des événements.');
      return;
    }

    console.log(`📅 ${events.length} événement(s) trouvé(s)\n`);

    // 2. Utiliser alice.demo2@gmail.com comme vendeur unique pour tous les billets
    const alice = await prisma.user.upsert({
      where: { email: 'alice.demo2@gmail.com' },
      update: { kycStatus: 'VERIFIED', trustScore: 95 },
      create: {
        email: 'alice.demo2@gmail.com',
        name: 'Alice 2',
        kycStatus: 'VERIFIED',
        trustScore: 95,
      },
    });

    // Utiliser un tableau pour garder la compatibilité avec le code existant
    const sellers = [alice, alice, alice, alice];

    console.log(`👥 Vendeur unique: ${alice.email}\n`);

    // 3. Créer des billets pour chaque événement
    let totalTickets = 0;

    for (const event of events) {
      console.log(`🎫 Création de billets pour: ${event.title}`);

      // Calculer un prix de base basé sur l'événement
      const basePrice = 50 + Math.random() * 100; // Entre 50€ et 150€

      const ticketsData = [
        // Fosse - Prix élevé
        {
          eventId: event.id,
          sellerId: sellers[0].id,
          status: 'ACTIVE' as const,
          price: Math.round(basePrice * 1.5 * 100) / 100,
          originalPrice: Math.round(basePrice * 2 * 100) / 100,
          section: 'Fosse',
          verificationStatus: 'APPROVED' as const,
        },
        {
          eventId: event.id,
          sellerId: sellers[1].id,
          status: 'ACTIVE' as const,
          price: Math.round(basePrice * 1.4 * 100) / 100,
          originalPrice: Math.round(basePrice * 1.8 * 100) / 100,
          section: 'Fosse',
          verificationStatus: 'APPROVED' as const,
        },
        // Gradins - Prix moyen
        {
          eventId: event.id,
          sellerId: sellers[2].id,
          status: 'ACTIVE' as const,
          price: Math.round(basePrice * 1.0 * 100) / 100,
          originalPrice: Math.round(basePrice * 1.3 * 100) / 100,
          section: 'Gradins',
          row: 'Rang 12',
          seatNumber: 'Siège 15',
          verificationStatus: 'APPROVED' as const,
        },
        {
          eventId: event.id,
          sellerId: sellers[0].id,
          status: 'ACTIVE' as const,
          price: Math.round(basePrice * 0.9 * 100) / 100,
          originalPrice: Math.round(basePrice * 1.2 * 100) / 100,
          section: 'Gradins',
          row: 'Rang 8',
          seatNumber: 'Siège 22',
          verificationStatus: 'APPROVED' as const,
        },
        // Balcon - Prix bas
        {
          eventId: event.id,
          sellerId: sellers[3].id,
          status: 'ACTIVE' as const,
          price: Math.round(basePrice * 0.6 * 100) / 100,
          section: 'Balcon',
          row: 'Rang 5',
          seatNumber: 'Siège 8',
          verificationStatus: 'APPROVED' as const,
        },
        // VIP - Prix très élevé
        {
          eventId: event.id,
          sellerId: sellers[1].id,
          status: 'ACTIVE' as const,
          price: Math.round(basePrice * 2.5 * 100) / 100,
          originalPrice: Math.round(basePrice * 3 * 100) / 100,
          section: 'VIP',
          row: 'Rang 1',
          seatNumber: 'Siège 10',
          verificationStatus: 'APPROVED' as const,
        },
        // Billet en attente de vérification
        {
          eventId: event.id,
          sellerId: sellers[2].id,
          status: 'ACTIVE' as const,
          price: Math.round(basePrice * 1.2 * 100) / 100,
          section: 'Parterre',
          verificationStatus: 'PENDING' as const,
        },
      ];

      // Créer les billets
      const createdTickets = await Promise.all(
        ticketsData.map((ticket) =>
          prisma.ticket.create({
            data: ticket,
          })
        )
      );

      totalTickets += createdTickets.length;
      console.log(`   ✅ ${createdTickets.length} billets créés`);
    }

    console.log(`\n✨ Seed terminé avec succès!`);
    console.log(`📊 Résumé:`);
    console.log(`   - ${events.length} événements`);
    console.log(`   - ${sellers.length} vendeurs`);
    console.log(`   - ${totalTickets} billets créés`);
    console.log(`\n💡 Vous pouvez maintenant tester le flux d'achat sur /events\n`);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
