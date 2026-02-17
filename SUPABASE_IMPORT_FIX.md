# 🔧 Correction Import Supabase

## ❌ Problème

```
Attempted import error: 'createClient' is not exported from '@/lib/supabase/server'
```

## ✅ Solution

### Import incorrect (❌)
```typescript
import { createClient } from '@/lib/supabase/server';
```

### Import correct (✅)
```typescript
import { createClient } from '@/lib/supabase/server-client';
```

## 📁 Fichiers corrigés

1. ✅ `app/(protected)/tickets/new/page.tsx`
2. ✅ `app/(protected)/sell-ticket/page.tsx`
3. ✅ `src/app/api/tickets/create/route.ts`

## 📚 Structure Supabase

```
src/lib/supabase/
├── server.ts           → supabaseAdmin (service role)
├── server-client.ts    → createClient() pour Server Components ✅
├── client.ts           → Client Components
└── browser-client.ts   → Browser only
```

## 🎯 Quand utiliser quoi ?

### Server Components (App Router)
```typescript
import { createClient } from '@/lib/supabase/server-client';

export default async function Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // ...
}
```

### Client Components
```typescript
'use client';
import { createClient } from '@/lib/supabase/client';

export function Component() {
  const supabase = createClient();
  // ...
}
```

### API Routes (avec cookies)
```typescript
import { createClient } from '@/lib/supabase/server-client';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  // ...
}
```

### Admin (service role)
```typescript
import { supabaseAdmin } from '@/lib/supabase/server';

// Opérations admin uniquement
const { data } = await supabaseAdmin.from('users').select('*');
```

## ✅ Statut

Tous les imports ont été corrigés. La page `/tickets/new` devrait maintenant fonctionner correctement.

---

**Date :** 2026-02-16  
**Correction :** Import Supabase createClient
