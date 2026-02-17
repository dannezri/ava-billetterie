# 🔧 Correction Event Handlers - Client Component

## ❌ Erreur

```
Error: Event handlers cannot be passed to Client Component props.
  <... onSuccess={function onSuccess} ...>
```

## 🔍 Cause

Un **Server Component** (page Next.js) essayait de passer des fonctions (`onSuccess`, `onError`) directement à un **Client Component** (`CreateTicketForm`).

En React Server Components, on ne peut pas passer de fonctions comme props depuis un Server Component vers un Client Component.

## ✅ Solution

Création d'un **wrapper Client Component** qui gère les callbacks :

### 1. Nouveau fichier : `CreateTicketFormWrapper.tsx`

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { CreateTicketForm } from './CreateTicketForm';

export function CreateTicketFormWrapper({ events }) {
  const router = useRouter();

  const handleSuccess = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  const handleError = (error: string) => {
    console.error('Erreur création billet:', error);
  };

  return (
    <CreateTicketForm
      events={events}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

### 2. Mise à jour de la page

```typescript
// ❌ Avant (Server Component passant des fonctions)
<CreateTicketForm
  events={eventOptions}
  onSuccess={(ticketId) => { ... }}
  onError={(error) => { ... }}
/>

// ✅ Après (Wrapper Client Component)
<CreateTicketFormWrapper events={eventOptions} />
```

## 📚 Architecture

```
Server Component (page.tsx)
    ↓ passe données (events)
Client Component Wrapper (CreateTicketFormWrapper.tsx)
    ↓ gère callbacks (onSuccess, onError)
Client Component (CreateTicketForm.tsx)
    ↓ affiche formulaire
```

## 🎯 Avantages

1. ✅ **Séparation claire** : Server Component pour les données, Client Component pour l'interactivité
2. ✅ **Type-safe** : Tous les types TypeScript préservés
3. ✅ **Performances** : Server Component reste côté serveur
4. ✅ **Navigation** : Utilise `useRouter()` de Next.js pour navigation côté client

## 🔄 Comportement

### Après succès
```
Création billet → Success → router.push(`/tickets/${ticketId}`) → Navigation
```

### Après erreur
```
Création billet → Error → console.error() → Message affiché dans le formulaire
```

## ✅ Résultat

L'erreur est corrigée et le formulaire devrait maintenant fonctionner correctement !

---

**Date :** 2026-02-16  
**Correction :** Event handlers Client Component
