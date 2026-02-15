# ⚡ tRPC Quick Reference

## 🚀 Usage Rapide

### Client Component
```tsx
'use client';
import { trpc } from '@/lib/trpc/client';

export function MyComponent() {
  const { data } = trpc.event.getAll.useQuery({ limit: 10 });
  const create = trpc.ticket.create.useMutation();
  
  return <div>{data?.events.map(...)}</div>;
}
```

### Server Component
```tsx
import { createCaller } from '@/lib/trpc/server';

export default async function Page() {
  const caller = await createCaller();
  const { events } = await caller.event.getAll({ limit: 10 });
  return <div>{events.map(...)}</div>;
}
```

## 📋 Procedures Disponibles

### Events
- `trpc.event.getAll({ limit, cursor, search, category })`
- `trpc.event.getById({ id })`
- `trpc.event.search({ query, limit })`
- `trpc.event.getUpcoming({ limit })`
- `trpc.event.getByCategory({ category, limit })`
- `trpc.event.getStats({ id })`

### Tickets
- `trpc.ticket.getAll({ limit, cursor, eventId })`
- `trpc.ticket.getById({ id })`
- `trpc.ticket.create({ ... })` [AUTH REQUIRED]
- `trpc.ticket.updateStatus({ id, status })` [AUTH REQUIRED]
- `trpc.ticket.getMySales()` [AUTH REQUIRED]
- `trpc.ticket.getMyPurchases()` [AUTH REQUIRED]

## 📚 Documentation Complète

→ `TRPC_GUIDE.md`

**Créé le:** 15 février 2026
