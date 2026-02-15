# ⚡ Prisma Quick Reference

## 🗄️ Tables (7)

- **Users** (email, name, kycStatus, trustScore)
- **Events** (title, venue, city, eventDate, category)
- **Tickets** (eventId, sellerId, price, status)
- **Transactions** (ticketId, buyerId, sellerId, amount, status)
- **Disputes** (transactionId, reason, status)
- **Reviews** (transactionId, rating, comment)
- **AuditLogs** (userId, action, metadata)

## 🌱 Données de Seed

- **3 users** (Alice ✅, Bob ✅, Charlie ⏳)
- **5 events** (The Weeknd, Roland-Garros, Daft Punk, Coachella, Cirque du Soleil)
- **11 tickets** (10 actifs, 1 en attente)

## 🚀 Commandes

```bash
# Générer le client
npm run prisma:generate

# Seed la DB
npm run prisma:seed

# Ouvrir Prisma Studio
npm run prisma:studio

# Push le schéma
npx prisma db push

# Reset (⚠️ supprime tout)
npx prisma migrate reset
```

## 📝 Exemples de Requêtes

```typescript
// Tous les événements avec billets actifs
const events = await prisma.event.findMany({
  include: {
    tickets: {
      where: { status: 'ACTIVE' },
    },
  },
});

// Créer un billet
const ticket = await prisma.ticket.create({
  data: {
    eventId: 'xxx',
    sellerId: 'yyy',
    price: 100,
    status: 'ACTIVE',
  },
});

// User avec ses billets
const user = await prisma.user.findUnique({
  where: { email: 'alice@example.com' },
  include: { ticketsForSale: true },
});
```

## 📚 Documentation Complète

→ `PRISMA_SETUP.md`

**Créé le:** 15 février 2026
