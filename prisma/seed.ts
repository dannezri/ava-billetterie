/**
 * Prisma Seed Script
 * Populates the database with sample data for development
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data (only in development!)
  console.log('🗑️  Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  console.log('👥 Creating users...');

  // alice.demo2@gmail.com est le vendeur principal (tous les billets en vente lui appartiennent)
  const user1 = await prisma.user.create({
    data: {
      email: 'alice.demo2@gmail.com',
      name: 'Alice 2',
      phone: '+33612345678',
      kycStatus: 'VERIFIED',
      verifiedIdentity: true,
      trustScore: 95,
    },
  });

  // Acheteurs de test
  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Dupont',
      phone: '+33698765432',
      kycStatus: 'VERIFIED',
      verifiedIdentity: true,
      trustScore: 92,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      name: 'Charlie Dubois',
      kycStatus: 'PENDING',
      verifiedIdentity: false,
      trustScore: 50,
    },
  });

  console.log(`✅ Created ${3} users (vendeur principal: alice.demo2@gmail.com)`);

  // Create 5 sample events
  console.log('🎭 Creating events...');

  const event1 = await prisma.event.create({
    data: {
      title: 'The Weeknd - After Hours World Tour',
      description:
        'Concert exceptionnel de The Weeknd dans le cadre de sa tournée mondiale After Hours. Une soirée inoubliable avec les plus grands hits !',
      artist: 'The Weeknd',
      venue: 'Accor Arena',
      city: 'Paris',
      country: 'France',
      eventDate: new Date('2026-06-15T20:00:00'),
      doorsOpenTime: '18:30',
      category: 'Concert',
      imageUrl:
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
      officialUrl: 'https://www.theweeknd.com',
      isVerified: true,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Roland-Garros 2026 - Finale Homme',
      description:
        'Assistez à la finale homme du tournoi de tennis le plus prestigieux au monde. Une rencontre historique sur la terre battue parisienne.',
      artist: 'Tennis',
      venue: 'Stade Roland-Garros',
      city: 'Paris',
      country: 'France',
      eventDate: new Date('2026-06-07T15:00:00'),
      doorsOpenTime: '13:00',
      category: 'Sport',
      imageUrl:
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
      officialUrl: 'https://www.rolandgarros.com',
      isVerified: true,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'Daft Punk Reunion Concert',
      description:
        'Le retour tant attendu de Daft Punk ! Concert exceptionnel pour célébrer 30 ans de musique électronique française.',
      artist: 'Daft Punk',
      venue: 'Stade de France',
      city: 'Saint-Denis',
      country: 'France',
      eventDate: new Date('2026-07-14T21:00:00'),
      doorsOpenTime: '19:00',
      category: 'Concert',
      imageUrl:
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
      officialUrl: 'https://www.daftpunk.com',
      isVerified: true,
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: 'Festival Coachella Valley - Pass 3 Jours',
      description:
        'Le festival de musique le plus iconique au monde. 3 jours de musique, art et culture dans le désert californien.',
      artist: 'Various Artists',
      venue: 'Empire Polo Club',
      city: 'Indio',
      country: 'États-Unis',
      eventDate: new Date('2026-04-10T12:00:00'),
      doorsOpenTime: '12:00',
      category: 'Festival',
      imageUrl:
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
      officialUrl: 'https://www.coachella.com',
      isVerified: true,
    },
  });

  const event5 = await prisma.event.create({
    data: {
      title: 'Cirque du Soleil - Alegría',
      description:
        'Spectacle emblématique du Cirque du Soleil mêlant acrobaties, musique live et poésie visuelle. Une expérience magique pour toute la famille.',
      artist: 'Cirque du Soleil',
      venue: 'Chapiteau Grand Palais Éphémère',
      city: 'Paris',
      country: 'France',
      eventDate: new Date('2026-05-20T20:30:00'),
      doorsOpenTime: '19:30',
      category: 'Spectacle',
      imageUrl:
        'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
      officialUrl: 'https://www.cirquedusoleil.com',
      isVerified: true,
    },
  });

  console.log(`✅ Created ${5} events`);

  // Create sample tickets
  console.log('🎟️  Creating tickets...');

  // Tous les billets en vente appartiennent à alice.demo2@gmail.com (user1)
  // Tickets for The Weeknd
  await prisma.ticket.create({
    data: {
      eventId: event1.id,
      sellerId: user1.id,
      status: 'ACTIVE',
      price: 150.0,
      originalPrice: 180.0,
      section: 'Tribune A',
      row: '12',
      seatNumber: '45',
      verificationStatus: 'APPROVED',
    },
  });

  await prisma.ticket.create({
    data: {
      eventId: event1.id,
      sellerId: user1.id,
      status: 'ACTIVE',
      price: 120.0,
      originalPrice: 150.0,
      section: 'Tribune B',
      row: '20',
      seatNumber: '78',
      verificationStatus: 'APPROVED',
    },
  });

  // Tickets for Roland-Garros
  await prisma.ticket.create({
    data: {
      eventId: event2.id,
      sellerId: user1.id,
      status: 'ACTIVE',
      price: 350.0,
      originalPrice: 400.0,
      section: 'Court Central',
      row: '5',
      seatNumber: '22',
      verificationStatus: 'APPROVED',
    },
  });

  await prisma.ticket.create({
    data: {
      eventId: event2.id,
      sellerId: user1.id,
      status: 'ACTIVE',
      price: 280.0,
      section: 'Court Central',
      row: '15',
      seatNumber: '67',
      verificationStatus: 'APPROVED',
    },
  });

  // Tickets for Daft Punk
  await prisma.ticket.create({
    data: {
      eventId: event3.id,
      sellerId: user1.id,
      status: 'ACTIVE',
      price: 200.0,
      originalPrice: 220.0,
      section: 'Pelouse',
      verificationStatus: 'APPROVED',
    },
  });

  await prisma.ticket.create({
    data: {
      eventId: event3.id,
      sellerId: user1.id,
      status: 'ACTIVE',
      price: 320.0,
      section: 'Carré Or',
      row: '8',
      seatNumber: '45',
      verificationStatus: 'APPROVED',
    },
  });

  // Tickets for Coachella
  await prisma.ticket.create({
    data: {
      eventId: event4.id,
      sellerId: user1.id,
      status: 'ACTIVE',
      price: 550.0,
      originalPrice: 599.0,
      section: 'General Admission',
      verificationStatus: 'APPROVED',
    },
  });

  await prisma.ticket.create({
    data: {
      eventId: event4.id,
      sellerId: user1.id,
      status: 'ACTIVE',
      price: 1200.0,
      section: 'VIP Pass',
      verificationStatus: 'APPROVED',
    },
  });

  // Tickets for Cirque du Soleil
  await prisma.ticket.create({
    data: {
      eventId: event5.id,
      sellerId: user1.id,
      status: 'ACTIVE',
      price: 85.0,
      originalPrice: 95.0,
      section: 'Tribune Rouge',
      row: '10',
      seatNumber: '34',
      verificationStatus: 'APPROVED',
    },
  });

  await prisma.ticket.create({
    data: {
      eventId: event5.id,
      sellerId: user1.id,
      status: 'ACTIVE',
      price: 125.0,
      section: 'Tribune Bleue',
      row: '3',
      seatNumber: '12',
      verificationStatus: 'APPROVED',
    },
  });

  // Ticket en attente de vérification (alice aussi)
  await prisma.ticket.create({
    data: {
      eventId: event1.id,
      sellerId: user1.id,
      status: 'PENDING_VALIDATION',
      price: 140.0,
      section: 'Tribune C',
      row: '18',
      seatNumber: '90',
      verificationStatus: 'PENDING',
    },
  });

  console.log(`✅ Created ${11} tickets`);

  console.log('');
  console.log('✨ Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   • ${3} users created`);
  console.log(`   • ${5} events created`);
  console.log(`   • ${11} tickets created`);
  console.log('');
  console.log('🎭 Featured Events:');
  console.log(`   1. ${event1.title} - ${event1.city}`);
  console.log(`   2. ${event2.title} - ${event2.city}`);
  console.log(`   3. ${event3.title} - ${event3.city}`);
  console.log(`   4. ${event4.title} - ${event4.city}`);
  console.log(`   5. ${event5.title} - ${event5.city}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
