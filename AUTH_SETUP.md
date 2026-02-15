# 🔐 Configuration Authentification - AVA Billetterie

**Date:** 15 février 2026  
**Status:** ✅ Authentification Supabase complète

---

## ✅ Configuration Complète

### 1. Supabase Auth Integration

#### Client Configurations
- ✅ **Browser Client** (`src/lib/supabase/browser-client.ts`) - Pour composants client
- ✅ **Server Client** (`src/lib/supabase/server-client.ts`) - Pour composants serveur
- ✅ **Admin Client** (`src/lib/supabase/server.ts`) - Pour opérations admin

#### Packages Installés
```bash
@supabase/supabase-js  # Client Supabase
@supabase/ssr          # Support SSR Next.js 14
```

---

### 2. Middleware Next.js

**Fichier:** `middleware.ts`

#### Fonctionnalités
- ✅ Refresh automatique de la session
- ✅ Protection des routes privées
- ✅ Redirection automatique si non connecté
- ✅ Redirection vers dashboard si déjà connecté (pages auth)

#### Routes Protégées
```typescript
const protectedPaths = [
  '/dashboard',
  '/tickets/create',
  '/profile'
];
```

#### Routes d'Authentification
```typescript
const authPaths = ['/login', '/signup'];
```

---

### 3. Pages d'Authentification

#### `/login` - Connexion
- ✅ Formulaire avec validation (React Hook Form + Zod)
- ✅ Email + Mot de passe
- ✅ Lien "Mot de passe oublié"
- ✅ Lien vers inscription
- ✅ Redirection automatique après connexion
- ✅ Support paramètre `?redirect=`

**Champs:**
- Email (obligatoire, format email)
- Mot de passe (minimum 6 caractères)

---

#### `/signup` - Inscription
- ✅ Formulaire complet avec validation
- ✅ Nom complet, Email, Mot de passe, Confirmation
- ✅ Vérification correspondance mots de passe
- ✅ Redirection vers `/verify-email` après inscription
- ✅ Email de vérification automatique

**Champs:**
- Nom complet (minimum 2 caractères)
- Email (obligatoire, format email)
- Mot de passe (minimum 8 caractères)
- Confirmation mot de passe (doit correspondre)

**Validation:**
```typescript
password: z.string().min(8, 'Minimum 8 caractères')
confirmPassword: z.string()
// + validation que password === confirmPassword
```

---

#### `/verify-email` - Vérification Email
- ✅ Message explicatif
- ✅ Bouton "Renvoyer l'email"
- ✅ Feedback visuel après renvoi
- ✅ Lien retour connexion

**Fonctionnalités:**
- Affichage instructions vérification
- Renvoi email de vérification
- Toast de confirmation

---

#### `/forgot-password` - Mot de passe oublié
- ✅ Formulaire email
- ✅ Envoi lien de réinitialisation
- ✅ Page de confirmation après envoi
- ✅ Gestion erreurs

**Flow:**
1. Utilisateur entre son email
2. Email envoyé avec lien de réinitialisation
3. Lien redirige vers page de réinitialisation
4. Nouveau mot de passe défini

---

#### `/auth/callback` - Callback OAuth
- ✅ Route API pour gérer les callbacks Supabase
- ✅ Exchange code pour session
- ✅ Redirection automatique vers `next` ou `/dashboard`

**Usage:**
- Email verification callback
- OAuth provider callback
- Magic link callback

---

### 4. Hook d'Authentification

**Fichier:** `src/hooks/use-auth.ts`

#### API Disponible
```typescript
const {
  user,          // User | null
  loading,       // boolean
  signUp,        // (email, password, name?) => Promise
  signIn,        // (email, password) => Promise
  signOut,       // () => Promise
  resetPassword  // (email) => Promise
} = useAuth();
```

#### Fonctionnalités
- ✅ État utilisateur en temps réel
- ✅ Loading state
- ✅ Inscriptions avec métadonnées (nom)
- ✅ Connexion classique
- ✅ Déconnexion
- ✅ Réinitialisation mot de passe
- ✅ Toast notifications intégrées
- ✅ Gestion erreurs automatique
- ✅ Refresh automatique avec `router.refresh()`

---

### 5. Composant Header

**Fichier:** `src/components/layout/Header.tsx`

#### Fonctionnalités
- ✅ Affichage conditionnel selon état auth
- ✅ Avatar utilisateur avec initiales
- ✅ Dropdown menu avec actions
- ✅ Navigation rapide
- ✅ Bouton déconnexion
- ✅ Skeleton loader pendant chargement

#### Menu Utilisateur Connecté
- Dashboard
- Mon profil
- Mes billets
- Se déconnecter

#### État Non Connecté
- Bouton "Se connecter"
- Bouton "Créer un compte"

---

### 6. Page Dashboard Protégée

**Fichier:** `app/(protected)/dashboard/page.tsx`

#### Fonctionnalités
- ✅ Vérification auth côté serveur
- ✅ Redirection automatique si non connecté
- ✅ Affichage données utilisateur
- ✅ Statistiques (billets, achats, ventes)
- ✅ Actions rapides
- ✅ Guide de démarrage

#### Statistiques
- Mes billets (nombre en vente)
- Mes achats (billets achetés)
- Mes ventes (revenus totaux)

---

## 🔧 Configuration Supabase

### Variables d'Environnement

```env
# Public
NEXT_PUBLIC_SUPABASE_URL="https://njogpuyhodyvzppislsb.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_k_..."

# Private (Server-side only)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
```

### Email Templates (Supabase Dashboard)

#### 1. Confirmation Email
- **Subject:** Confirmez votre email - AVA Billetterie
- **Redirect URL:** `https://your-domain.com/auth/callback`

#### 2. Password Reset
- **Subject:** Réinitialisez votre mot de passe - AVA Billetterie
- **Redirect URL:** `https://your-domain.com/auth/reset-password`

#### 3. Magic Link (Optional)
- **Subject:** Connexion à AVA Billetterie
- **Redirect URL:** `https://your-domain.com/auth/callback`

---

## 🎨 Layout et Design

### Auth Layout
**Fichier:** `app/(auth)/layout.tsx`

- Gradient background
- Centrage vertical/horizontal
- Design responsive

### Composants UI Utilisés
- ✅ Card (container principal)
- ✅ Form (React Hook Form integration)
- ✅ Input (champs de saisie)
- ✅ Button (actions)
- ✅ Alert (messages)
- ✅ Separator (séparation visuelle)
- ✅ Avatar (photo profil)
- ✅ Dropdown Menu (menu utilisateur)
- ✅ Skeleton (loading states)

---

## 🚀 Utilisation

### Inscription

```typescript
import { useAuth } from '@/hooks/use-auth';

function SignupForm() {
  const { signUp } = useAuth();
  
  const handleSubmit = async (data) => {
    const { error } = await signUp(
      data.email,
      data.password,
      data.name
    );
    
    if (!error) {
      // Redirection automatique vers /verify-email
    }
  };
}
```

### Connexion

```typescript
import { useAuth } from '@/hooks/use-auth';

function LoginForm() {
  const { signIn } = useAuth();
  
  const handleSubmit = async (data) => {
    const { error } = await signIn(
      data.email,
      data.password
    );
    
    if (!error) {
      // Redirection automatique via middleware
    }
  };
}
```

### Déconnexion

```typescript
import { useAuth } from '@/hooks/use-auth';

function LogoutButton() {
  const { signOut } = useAuth();
  
  return (
    <button onClick={signOut}>
      Se déconnecter
    </button>
  );
}
```

### Vérifier l'état d'authentification

#### Client Component
```typescript
'use client';
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <Skeleton />;
  if (!user) return <LoginPrompt />;
  
  return <AuthenticatedContent user={user} />;
}
```

#### Server Component
```typescript
import { createClient } from '@/lib/supabase/server-client';

async function MyServerComponent() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <div>Hello {user.email}</div>;
}
```

---

## 🔒 Protection des Routes

### Middleware (Automatique)
Les routes listées dans `middleware.ts` sont automatiquement protégées.

### Protection Manuelle (Server Component)
```typescript
import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Page content
}
```

### Protection Manuelle (Client Component)
```typescript
'use client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedClientPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) return <Skeleton />;
  if (!user) return null;
  
  // Page content
}
```

---

## 📊 Flow d'Authentification

### Inscription
```
1. User remplit formulaire /signup
2. signUp() appelé avec email, password, name
3. Supabase crée compte + envoie email de vérification
4. Redirection vers /verify-email
5. User clique lien dans email
6. Redirection vers /auth/callback?code=xxx
7. Session créée automatiquement
8. Redirection vers /dashboard
```

### Connexion
```
1. User remplit formulaire /login
2. signIn() appelé avec email, password
3. Supabase vérifie credentials
4. Session créée
5. Middleware détecte user authentifié
6. Redirection vers /dashboard (ou ?redirect=)
```

### Mot de passe oublié
```
1. User entre email sur /forgot-password
2. resetPassword() appelé
3. Email envoyé avec lien de réinitialisation
4. User clique lien → /auth/reset-password?code=xxx
5. Nouveau mot de passe défini
6. Connexion automatique
7. Redirection vers /dashboard
```

---

## ✅ Checklist

- [x] @supabase/ssr installé
- [x] Browser client configuré
- [x] Server client configuré
- [x] Admin client configuré
- [x] Middleware créé et configuré
- [x] Hook useAuth créé
- [x] Page /login créée
- [x] Page /signup créée
- [x] Page /verify-email créée
- [x] Page /forgot-password créée
- [x] Route /auth/callback créée
- [x] Layout auth créé
- [x] Header avec auth créé
- [x] Dashboard protégé créé
- [x] Protection routes automatique
- [x] Toast notifications intégrées
- [x] Validation formulaires (Zod)
- [x] Loading states gérés
- [x] Error handling complet
- [x] Documentation complète

---

## 🎯 Prochaines Étapes

1. **Synchroniser Supabase Auth avec Prisma**
   - Créer trigger Supabase pour créer User dans Prisma
   - Sync métadonnées (name) avec table users

2. **KYC / Vérification Identité**
   - Intégration Stripe Identity
   - Page de vérification
   - Mise à jour statut KYC

3. **Profil Utilisateur**
   - Page de profil complète
   - Édition informations
   - Upload photo de profil

4. **Connexion OAuth**
   - Google Sign-In
   - GitHub Sign-In (optionnel)

5. **2FA / Sécurité**
   - Authentification à deux facteurs
   - Historique des connexions
   - Gestion des sessions

---

## 📚 Resources

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **Next.js + Supabase:** https://supabase.com/docs/guides/auth/server-side/nextjs
- **@supabase/ssr:** https://github.com/supabase/ssr

---

**Créé le:** 15 février 2026  
**Status:** ✅ Authentification opérationnelle  
**Environnement:** Production (Supabase + Vercel)
