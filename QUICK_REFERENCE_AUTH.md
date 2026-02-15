# ⚡ Auth Quick Reference

## 🔐 Pages Créées

- `/login` - Connexion
- `/signup` - Inscription
- `/verify-email` - Vérification email
- `/forgot-password` - Mot de passe oublié
- `/auth/callback` - Callback OAuth/Email
- `/dashboard` - Dashboard protégé

## 🪝 Hook useAuth

```typescript
const { user, loading, signUp, signIn, signOut, resetPassword } = useAuth();
```

## 🛡️ Protection Routes

### Middleware (Automatique)
Routes protégées : `/dashboard`, `/tickets/create`, `/profile`

### Server Component
```typescript
import { createClient } from '@/lib/supabase/server-client';
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

### Client Component
```typescript
const { user, loading } = useAuth();
if (!user) return <LoginPrompt />;
```

## 🎨 Composants

- **Header** - Navigation avec auth
- **useAuth** - Hook authentification
- **Forms** - Login, Signup avec validation

## 📚 Documentation Complète

→ `AUTH_SETUP.md`

**Créé le:** 15 février 2026
