# 🔧 Correction Conflit Routes Marketplace

**Date** : 2026-02-17
**Problème** : `Error: You cannot use different slug names for the same dynamic path ('ticketId' !== 'id')`

---

## 🐛 Problème Identifié

Next.js a détecté un conflit de nommage dans les routes dynamiques :

```
/app/api/tickets/[id]/            # Existant (pour download)
/app/api/tickets/[ticketId]/      # Nouveau (créé par moi)
```

Au même niveau de route, **on ne peut pas avoir deux noms de paramètres différents**.

---

## ✅ Solution Appliquée

### 1. API Routes
**Supprimé** : `/app/api/tickets/[ticketId]/`
**Créé** : `/app/api/tickets/[id]/route.ts`

Le code utilise maintenant `params.id` au lieu de `params.ticketId`.

### 2. Pages
**Conservé** : `/app/(public)/events/[id]/tickets/[ticketId]/page.tsx`

Ici c'est OK car les paramètres sont **imbriqués** :
- Premier `[id]` = eventId
- Deuxième `[ticketId]` = ticketId

Next.js accepte des noms différents tant qu'ils ne sont pas au même niveau.

---

## 📁 Structure Finale des Routes

```
app/
├── (public)/
│   └── events/
│       ├── page.tsx                              # /events
│       └── [id]/                                 # /events/:eventId
│           ├── page.tsx                          # /events/:eventId
│           └── tickets/
│               └── [ticketId]/                   # /events/:eventId/tickets/:ticketId
│                   └── page.tsx
│
└── api/
    ├── events/
    │   ├── route.ts                              # GET /api/events
    │   └── [id]/                                 # GET /api/events/:id
    │       └── route.ts
    │
    ├── tickets/
    │   └── [id]/                                 # GET /api/tickets/:id
    │       ├── route.ts                          # ✅ NOUVEAU
    │       └── download/
    │           └── route.ts                      # POST /api/tickets/:id/download
    │
    └── search/
        └── route.ts                              # GET /api/search
```

---

## 🔄 Adaptations Code

### Avant (fichier source)
```typescript
interface RouteContext {
  params: {
    ticketId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const result = await EventService.getTicketById(params.ticketId);
  // ...
}
```

### Après (fichier API)
```typescript
interface RouteContext {
  params: {
    id: string;  // ✅ Changé de ticketId à id
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const result = await EventService.getTicketById(params.id);  // ✅ Utilise id
  // ...
}
```

---

## 🧪 Tests à Effectuer

Après `npm run dev`, vérifier :

1. **API Ticket** :
   ```bash
   curl http://localhost:3000/api/tickets/[un-uuid-valide]
   ```

2. **Page Catalogue** :
   ```
   http://localhost:3000/events
   ```

3. **Page Détail** :
   ```
   http://localhost:3000/events/[un-uuid-valide]
   ```

4. **Page Preview Billet** :
   ```
   http://localhost:3000/events/[event-id]/tickets/[ticket-id]
   ```

5. **Page Recherche** :
   ```
   http://localhost:3000/search
   ```

---

## ✅ Checklist

- [x] Supprimé `/app/api/tickets/[ticketId]/`
- [x] Créé `/app/api/tickets/[id]/route.ts`
- [x] Adapté le code pour utiliser `params.id`
- [x] Vérifié la structure des pages (OK)
- [ ] Redémarrer `npm run dev`
- [ ] Tester les routes
- [ ] Vérifier qu'il n'y a plus d'erreur

---

## 📝 Notes Importantes

### Règle Next.js
> **Au même niveau de route, tous les segments dynamiques doivent avoir le même nom de paramètre.**

**❌ Incorrect** :
```
/api/users/[userId]/
/api/users/[id]/
```

**✅ Correct** :
```
/api/users/[id]/
/api/users/[id]/profile/
```

**✅ Correct (niveaux différents)** :
```
/events/[id]/tickets/[ticketId]/
```

---

## 🚀 Prochaines Étapes

1. Lance `npm run dev` dans ton terminal
2. Vérifie qu'il n'y a plus d'erreur
3. Teste les pages
4. Signale-moi si tu vois d'autres erreurs

---

**Status** : ✅ Corrigé, en attente de test
