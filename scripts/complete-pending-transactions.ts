/**
 * Script pour finaliser les transactions PENDING
 * Simule le comportement du webhook payment_intent.succeeded
 * Usage: npx tsx scripts/complete-pending-transactions.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function completePendingTransactions() {
  console.log('🔄 Finalisation des transactions PENDING...\n');

  try {
    // Récupérer toutes les transactions PENDING
    const pendingTransactions = await prisma.transaction.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
      },
    });

    if (pendingTransactions.length === 0) {
      console.log('✅ Aucune transaction PENDING à traiter\n');
      return;
    }

    console.log(`📊 ${pendingTransactions.length} transaction(s) à finaliser\n`);

    for (const transaction of pendingTransactions) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Transaction: ${transaction.id}`);
      console.log(`Montant: ${transaction.amount}€`);
      console.log(`Événement: ${transaction.ticket.event.title}`);

      // Calculer la date de libération du séquestre
      const eventDate = new Date(transaction.ticket.event.eventDate);
      const escrowReleaseDate = new Date(eventDate);
      escrowReleaseDate.setDate(escrowReleaseDate.getDate() + 2); // Event date + 2 jours

      // Mettre à jour la transaction
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'ESCROWED',
          escrowReleaseDate: escrowReleaseDate,
        },
      });

      // Mettre à jour le statut du billet
      await prisma.ticket.update({
        where: { id: transaction.ticketId },
        data: {
          status: 'SOLD',
        },
      });

      console.log(`✅ Transaction → ESCROWED`);
      console.log(`✅ Billet → SOLD`);
      console.log(`📅 Libération séquestre: ${escrowReleaseDate.toLocaleDateString('fr-FR')}`);
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✨ ${pendingTransactions.length} transaction(s) finalisée(s)!\n`);
    console.log('💡 Rechargez la page /my-purchases pour voir les changements\n');
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    throw error;
  }
}

completePendingTransactions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
