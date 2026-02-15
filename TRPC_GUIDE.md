# 🚀 Guide tRPC - AVA Billetterie

## ✅ Installation Complète

**Date:** 15 février 2026  
**Status:** 🟢 tRPC opérationnel

---

## 📦 Dépendances Installées

### Core Dependencies
```json
{
  "@prisma/client": "^5.14.0",
  "@tanstack/react-query": "^4.36.1",
  "@trpc/server": "^10.45.0",
  "@trpc/client": "^10.45.0",
  "@trpc/react-query": "^10.45.0",
  "@trpc/next": "^10.45.0",
  "prisma": "^5.14.0",
  "superjson": "^2.2.0",
  "zod": "^3.23.0"
}
```

### Pourquoi ces versions ?
- **tRPC v10** : Compatible avec Next.js 14 et React Query v4
- **React Query v4** : Version stable et bien documentée
- **Superjson** : Sérialisation avancée (Date, Map, Set, etc.)
- **Zod** : Validation de schéma TypeScript-first

---

## 🏗️ Architecture tRPC

### Structure des Fichiers

```
src/
├── server/
│   ├── context.ts              # Contexte tRPC (session, prisma, etc.)
│   ├── trpc.ts                 # Initialisation tRPC
│   └── routers/
│       ├── _app.ts             # Router principal
│       ├── event.ts            # Router événements
│       └── ticket.ts           # Router billets
├── lib/
│   └── trpc/
│       ├── client.ts           # Client tRPC pour React
│       ├── server.ts           # Server-side caller
│       ├── provider.tsx        # Provider React
│       └── index.ts            # Exports centralisés
└── components/
    └── examples/
        ├── EventList.tsx       # Exemple Client Component
        └── ServerEventList.tsx # Exemple Server Component

app/
└── api/
    └── trpc/
        └── [trpc]/
            └── route.ts        # API route handler
```

---

## 🎯 Utilisation

### 1. Dans un Client Component

```tsx
'use client';

import { trpc } from '@/lib/trpc/client';

export function MyComponent() {
  // Query
  const { data, isLoading, error } = trpc.event.getAll.useQuery({
    limit: 10,
  });

  // Mutation
  const createTicket = trpc.ticket.create.useMutation({
    onSuccess: (data) => {
      console.log('Ticket créé:', data);
    },
  });

  const handleSubmit = () => {
    createTicket.mutate({
      eventId: 'xxx',
      price: 50,
      // ... autres champs
    });
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      {data?.events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
      <button onClick={handleSubmit}>Créer un billet</button>
    </div>
  );
}
```

### 2. Dans un Server Component

```tsx
import { createCaller } from '@/lib/trpc/server';

export default async function Page() {
  const caller = await createCaller();
  
  // Appel direct côté serveur
  const { events } = await caller.event.getAll({ limit: 10 });

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
    </div>
  );
}
```

### 3. Dans une Server Action

```tsx
'use server';

import { createCaller } from '@/lib/trpc/server';

export async function createTicketAction(formData: FormData) {
  const caller = await createCaller();
  
  const ticket = await caller.ticket.create({
    eventId: formData.get('eventId') as string,
    price: parseFloat(formData.get('price') as string),
    // ...
  });

  return ticket;
}
```

---

## 🔧 Création d'un Nouveau Router

### 1. Créer le fichier router

```tsx
// src/server/routers/user.ts
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';

export const userRouter = router({
  getProfile: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      bio: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),
});
```

### 2. Ajouter au router principal

```tsx
// src/server/routers/_app.ts
import { router } from '../trpc';
import { userRouter } from './user';
import { ticketRouter } from './ticket';
import { eventRouter } from './event';

export const appRouter = router({
  user: userRouter,     // ← Ajouter ici
  ticket: ticketRouter,
  event: eventRouter,
});
```

### 3. Utiliser dans votre app

```tsx
'use client';

import { trpc } from '@/lib/trpc/client';

export function Profile() {
  const { data } = trpc.user.getProfile.useQuery({ userId: 'xxx' });
  const updateProfile = trpc.user.updateProfile.useMutation();

  return <div>{data?.name}</div>;
}
```

---

## 🔐 Authentification

### Procedures Protégées

```tsx
import { protectedProcedure } from '../trpc';

// Cette procedure nécessite une session active
export const myProtectedRoute = protectedProcedure
  .query(async ({ ctx }) => {
    // ctx.session.user est garanti d'exister
    const userId = ctx.session.user.id;
    // ...
  });
```

### Context avec Session

Le contexte tRPC inclut automatiquement :
- `ctx.session` - Session Supabase
- `ctx.prisma` - Client Prisma
- `ctx.supabase` - Client Supabase
- `ctx.req` / `ctx.res` - Objets Next.js

---

## 📝 Validation avec Zod

### Input Validation

```tsx
import { z } from 'zod';

const ticketSchema = z.object({
  eventId: z.string().uuid(),
  price: z.number().positive().max(10000),
  seatNumber: z.string().optional(),
  section: z.string().min(1).max(10),
});

export const createTicket = publicProcedure
  .input(ticketSchema)
  .mutation(async ({ ctx, input }) => {
    // input est typé et validé automatiquement
    return await ctx.prisma.ticket.create({ data: input });
  });
```

### Réutilisation des schémas

Vous pouvez réutiliser les schémas de `src/lib/validations/` :

```tsx
import { ticketSchema } from '@/lib/validations/ticket';

export const createTicket = publicProcedure
  .input(ticketSchema)
  .mutation(async ({ ctx, input }) => {
    // ...
  });
```

---

## 🚀 Fonctionnalités Avancées

### Pagination Infinie

```tsx
'use client';

import { trpc } from '@/lib/trpc/client';

export function InfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpc.event.getAll.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div>
      {data?.pages.map((page) =>
        page.events.map((event) => (
          <div key={event.id}>{event.title}</div>
        ))
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>
          {isFetchingNextPage ? 'Chargement...' : 'Charger plus'}
        </button>
      )}
    </div>
  );
}
```

### Optimistic Updates

```tsx
const utils = trpc.useContext();

const createTicket = trpc.ticket.create.useMutation({
  onMutate: async (newTicket) => {
    // Cancel outgoing fetches
    await utils.ticket.getAll.cancel();

    // Snapshot previous value
    const previousTickets = utils.ticket.getAll.getData();

    // Optimistically update
    utils.ticket.getAll.setData(undefined, (old) => {
      if (!old) return old;
      return {
        ...old,
        tickets: [...old.tickets, newTicket as any],
      };
    });

    return { previousTickets };
  },
  onError: (err, newTicket, context) => {
    // Rollback on error
    utils.ticket.getAll.setData(undefined, context?.previousTickets);
  },
  onSettled: () => {
    // Refetch after error or success
    utils.ticket.getAll.invalidate();
  },
});
```

### Subscriptions (Websockets)

Pour des updates en temps réel, vous pouvez ajouter les subscriptions tRPC :

```tsx
// Installation requise:
// npm install ws @trpc/server

// src/server/routers/ticket.ts
export const ticketRouter = router({
  onNewTicket: publicProcedure
    .subscription(async ({ ctx }) => {
      return observable<Ticket>((emit) => {
        // Logic pour émettre les nouveaux tickets
        const onAdd = (data: Ticket) => emit.next(data);
        
        // Cleanup
        return () => {
          // Unsubscribe
        };
      });
    }),
});

// Client usage
trpc.ticket.onNewTicket.useSubscription(undefined, {
  onData(ticket) {
    console.log('New ticket:', ticket);
  },
});
```

---

## 🧪 Testing

### Tester un Router

```tsx
import { createContext } from '@/server/context';
import { appRouter } from '@/server/routers/_app';

describe('Event Router', () => {
  it('should get all events', async () => {
    const ctx = await createContext({
      req: {} as any,
      res: {} as any,
    });

    const caller = appRouter.createCaller(ctx);
    const { events } = await caller.event.getAll({ limit: 10 });

    expect(events).toBeDefined();
  });
});
```

---

## 📊 Monitoring & Debugging

### Logs de Développement

Les logs sont activés automatiquement en développement grâce au `loggerLink` :

```tsx
// src/lib/trpc/provider.tsx
loggerLink({
  enabled: (opts) =>
    process.env.NODE_ENV === 'development' ||
    (opts.direction === 'down' && opts.result instanceof Error),
})
```

### React Query Devtools

Installez les devtools pour inspecter les queries/mutations :

```bash
npm install @tanstack/react-query-devtools
```

```tsx
// app/layout.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export default function RootLayout({ children }) {
  return (
    <TRPCProvider>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </TRPCProvider>
  );
}
```

---

## 🎯 Routers Disponibles

### 1. Event Router (`trpc.event.*`)

- `getAll({ limit, cursor, search, category })` - Liste tous les événements
- `getById({ id })` - Récupère un événement par ID
- `search({ query, limit })` - Recherche d'événements
- `getUpcoming({ limit })` - Événements à venir
- `getByCategory({ category, limit })` - Par catégorie
- `getStats({ id })` - Statistiques d'un événement

### 2. Ticket Router (`trpc.ticket.*`)

- `getAll({ limit, cursor, eventId })` - Liste tous les billets
- `getById({ id })` - Récupère un billet par ID
- `create({ ... })` - Créer un billet (protégé)
- `updateStatus({ id, status })` - Mettre à jour le statut (protégé)
- `getMySales()` - Mes ventes (protégé)
- `getMyPurchases()` - Mes achats (protégé)

---

## 🔄 Migration depuis REST API

Si vous aviez une API REST, voici comment migrer :

### Avant (REST)
```tsx
// API Route
export async function GET(request: Request) {
  const tickets = await prisma.ticket.findMany();
  return Response.json(tickets);
}

// Client
const response = await fetch('/api/tickets');
const tickets = await response.json();
```

### Après (tRPC)
```tsx
// Router
export const ticketRouter = router({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.ticket.findMany();
  }),
});

// Client
const { data } = trpc.ticket.getAll.useQuery();
```

**Avantages :**
- ✅ Type-safety end-to-end
- ✅ Validation automatique avec Zod
- ✅ Pas de fetch manuel
- ✅ Cache automatique (React Query)
- ✅ Optimistic updates faciles
- ✅ Error handling unifié

---

## 📚 Ressources

### Documentation Officielle
- **tRPC:** https://trpc.io/docs
- **React Query:** https://tanstack.com/query/latest/docs/react/overview
- **Zod:** https://zod.dev
- **Prisma:** https://www.prisma.io/docs

### Exemples dans le Projet
- `src/components/examples/EventList.tsx` - Client Component
- `src/components/examples/ServerEventList.tsx` - Server Component
- `src/server/routers/ticket.ts` - Router complet avec toutes les features

---

## ✅ Checklist Post-Installation

- [x] tRPC installé
- [x] Context configuré (session + prisma)
- [x] Routers créés (event, ticket)
- [x] API route configurée (`/api/trpc/*`)
- [x] Provider ajouté au layout
- [x] Exemples Client/Server créés
- [x] Type-safety end-to-end
- [x] Documentation complète

---

## 🚀 Prochaines Étapes

1. **Créer plus de routers** : user, transaction, dispute, review
2. **Ajouter l'authentification** : Implémenter la logique Supabase Auth
3. **Implémenter les mutations** : Create, Update, Delete pour chaque entité
4. **Ajouter des tests** : Tester les routers et procedures
5. **Optimiser les queries** : Ajouter la pagination, le cache, etc.

---

**Créé le:** 15 février 2026  
**Status:** 🟢 tRPC Opérationnel  
**Prochaine étape:** Développer les features MVP avec tRPC
