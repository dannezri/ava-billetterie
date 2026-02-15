# 🧭 Navigation - AVA Billetterie

**Date:** 15 février 2026  
**Status:** ✅ Navigation complète et responsive

---

## ✅ Composants Créés

### 1. Header - Navigation Principale

**Fichier:** `src/components/layout/Header.tsx`

#### Fonctionnalités

**Desktop (≥768px):**
- ✅ Logo AVA avec lien vers home
- ✅ Navigation horizontale (Événements, Comment ça marche, À propos)
- ✅ Highlight du lien actif
- ✅ État conditionnel selon authentification
- ✅ Avatar utilisateur avec dropdown menu
- ✅ Bouton "Vendre un billet"
- ✅ Boutons Login/Signup si non connecté

**Mobile (<768px):**
- ✅ Logo AVA
- ✅ Avatar utilisateur miniature (si connecté)
- ✅ Bouton menu hamburger
- ✅ Drawer/Sheet latéral avec navigation complète
- ✅ Fermeture automatique après navigation
- ✅ Tous les liens accessibles

#### Menu Utilisateur (Dropdown - Desktop)

```tsx
• Nom + Email utilisateur
├─ Dashboard
├─ Mon profil
├─ Paramètres        [NOUVEAU]
├─ Mes billets
├─ Mes achats        [NOUVEAU]
├─ Favoris           [NOUVEAU]
└─ Se déconnecter
```

#### Menu Mobile (Sheet - Mobile)

```tsx
• Avatar + Nom + Email (si connecté)
├─ Événements
├─ Comment ça marche
├─ À propos
├─ ──────────────
├─ Vendre un billet
├─ Dashboard
├─ Mon profil
├─ Paramètres
├─ Mes billets
├─ Mes achats
├─ Favoris
├─ ──────────────
└─ Se déconnecter
```

---

### 2. Footer - Pied de page

**Fichier:** `src/components/layout/Footer.tsx`

#### Sections

**Colonnes:**
1. **Brand**
   - Logo + Description
   - Réseaux sociaux (Twitter, LinkedIn, GitHub)

2. **Produit**
   - Événements
   - Comment ça marche
   - Tarifs
   - FAQ

3. **Entreprise**
   - À propos
   - Blog
   - Carrières
   - Contact

4. **Support**
   - Centre d'aide
   - Sécurité
   - Signaler un problème
   - Statut

5. **Légal**
   - Conditions d'utilisation
   - Politique de confidentialité
   - Mentions légales
   - Cookies

**Bottom:**
- Copyright © 2026 AVA Billetterie
- Email de contact

#### Responsive
- **Mobile:** 2 colonnes
- **Tablet:** 3 colonnes
- **Desktop:** 5 colonnes

---

### 3. MainLayout - Layout Wrapper

**Fichier:** `src/components/layout/MainLayout.tsx`

Composant wrapper qui inclut Header + Content + Footer.

```tsx
<MainLayout showFooter={true}>
  <YourPageContent />
</MainLayout>
```

**Props:**
- `children`: React.ReactNode (obligatoire)
- `showFooter`: boolean (optionnel, default: true)

---

## 🎨 Design System

### Sticky Header
```tsx
className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur"
```

**Features:**
- Sticky position (reste en haut au scroll)
- z-index 50 (au-dessus du contenu)
- Background blur (effet glassmorphism)
- Border bottom (séparation visuelle)

### Active Link Highlighting

```tsx
className={cn(
  'text-sm font-medium transition-colors hover:text-primary',
  pathname === item.href
    ? 'text-primary'           // Active
    : 'text-muted-foreground'  // Inactive
)}
```

### Mobile Menu (Sheet)

**Position:** Right side
**Width:** 300px (mobile), 400px (sm+)
**Content:** Scrollable
**Overlay:** Semi-transparent backdrop

---

## 🔧 Utilisation

### Importer les Composants

```tsx
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MainLayout } from '@/components/layout/MainLayout';
```

Ou via barrel export:

```tsx
import { Header, Footer, MainLayout } from '@/components/layout';
```

### Option 1: Utiliser MainLayout

```tsx
import { MainLayout } from '@/components/layout';

export default function MyPage() {
  return (
    <MainLayout>
      <div className="container py-8">
        <h1>Page Content</h1>
      </div>
    </MainLayout>
  );
}
```

### Option 2: Composants Individuels

```tsx
import { Header, Footer } from '@/components/layout';

export default function MyPage() {
  return (
    <>
      <Header />
      <main>
        <div className="container py-8">
          <h1>Page Content</h1>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

### Option 3: Intégrer dans Root Layout

```tsx
// app/layout.tsx
import { Header, Footer } from '@/components/layout';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

---

## 📱 Responsive Breakpoints

### Tailwind Breakpoints

```tsx
// Mobile-first approach
sm:  640px   // Smartphone landscape
md:  768px   // Tablet
lg:  1024px  // Desktop
xl:  1280px  // Large Desktop
2xl: 1536px  // Extra Large
```

### Navigation Behavior

**Mobile (<768px):**
- Menu hamburger visible
- Navigation desktop cachée
- Sheet/Drawer pour menu complet
- Avatar miniature si connecté

**Tablet (768px - 1023px):**
- Navigation desktop visible
- Bouton "Vendre" caché
- Dropdown menu utilisateur visible

**Desktop (≥1024px):**
- Navigation complète visible
- Bouton "Vendre" visible
- Dropdown menu utilisateur visible

---

## 🎯 États d'Authentification

### Non Connecté

**Desktop:**
```
[Logo AVA]  Événements  Comment ça marche  À propos
                            [Se connecter] [Créer un compte]
```

**Mobile:**
```
[Logo AVA]                                            [Menu ☰]

Sheet:
  • Événements
  • Comment ça marche
  • À propos
  ──────────────
  [Créer un compte]
  [Se connecter]
```

### Connecté

**Desktop:**
```
[Logo AVA]  Événements  Comment ça marche  À propos
                  [Vendre un billet]  [Avatar ▼]

Dropdown:
  Jean Dupont
  jean@exemple.com
  ──────────────
  • Dashboard
  • Mon profil
  • Paramètres
  • Mes billets
  • Mes achats
  • Favoris
  ──────────────
  🚪 Se déconnecter
```

**Mobile:**
```
[Logo AVA]                              [Avatar]  [Menu ☰]

Sheet:
  [Avatar] Jean Dupont
           jean@exemple.com
  ──────────────
  • Événements
  • Comment ça marche
  • À propos
  ──────────────
  • Vendre un billet
  • Dashboard
  • Mon profil
  • Paramètres
  • Mes billets
  • Mes achats
  • Favoris
  ──────────────
  🚪 Se déconnecter
```

---

## 🔗 Liens de Navigation

### Navigation Principale

| Label | Route | Description |
|-------|-------|-------------|
| Événements | `/events` | Liste des événements |
| Comment ça marche | `/how-it-works` | Guide utilisateur |
| À propos | `/about` | À propos d'AVA |

### Menu Utilisateur

| Label | Route | Description |
|-------|-------|-------------|
| Dashboard | `/dashboard` | Tableau de bord |
| Mon profil | `/profile` | Profil utilisateur |
| Paramètres | `/profile/settings` | Paramètres compte |
| Mes billets | `/tickets/my-tickets` | Billets en vente |
| Mes achats | `/purchases` | Historique achats |
| Favoris | `/favorites` | Événements favoris |
| Vendre un billet | `/tickets/create` | Créer une annonce |

### Footer - Produit

| Label | Route |
|-------|-------|
| Événements | `/events` |
| Comment ça marche | `/how-it-works` |
| Tarifs | `/pricing` |
| FAQ | `/faq` |

### Footer - Entreprise

| Label | Route |
|-------|-------|
| À propos | `/about` |
| Blog | `/blog` |
| Carrières | `/careers` |
| Contact | `/contact` |

### Footer - Support

| Label | Route |
|-------|-------|
| Centre d'aide | `/help` |
| Sécurité | `/security` |
| Signaler | `/report` |
| Statut | `/status` |

### Footer - Légal

| Label | Route |
|-------|-------|
| CGU | `/terms` |
| Confidentialité | `/privacy` |
| Mentions légales | `/legal` |
| Cookies | `/cookies` |

---

## 🎨 Composants UI Utilisés

### Header
- ✅ `Button` - Boutons actions
- ✅ `Avatar` + `AvatarFallback` - Photo utilisateur
- ✅ `DropdownMenu` - Menu utilisateur desktop
- ✅ `Sheet` - Menu mobile
- ✅ `Skeleton` - Loading state
- ✅ `Separator` - Séparateurs visuels

### Footer
- ✅ `Separator` - Ligne de séparation
- ✅ Lucide Icons - Icônes

### Icons (Lucide)
```tsx
Ticket           // Logo
Menu             // Hamburger mobile
User             // Profil
Settings         // Paramètres
LayoutDashboard  // Dashboard
ShoppingBag      // Achats
Heart            // Favoris
LogOut           // Déconnexion
Mail             // Contact
Github           // Social
Twitter          // Social
Linkedin         // Social
```

---

## 🔄 État et Navigation

### Hook useAuth

```tsx
const { user, loading, signOut } = useAuth();

// user: User | null
// loading: boolean
// signOut: () => Promise<void>
```

### Hook usePathname

```tsx
import { usePathname } from 'next/navigation';

const pathname = usePathname();
// Utilisé pour highlight lien actif
```

### State Management

```tsx
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

// Fermeture auto après navigation
const closeMobileMenu = () => setMobileMenuOpen(false);
```

---

## ✅ Accessibilité

### Semantic HTML
- `<header>` pour le header
- `<nav>` pour la navigation
- `<footer>` pour le footer
- `<main>` pour le contenu principal

### ARIA Labels
```tsx
<span className="sr-only">Toggle menu</span>
<Button aria-label="Open user menu">
```

### Keyboard Navigation
- Tab navigation
- Enter/Space pour activer
- Escape pour fermer menus

### Focus Visible
- États focus visibles sur tous les éléments interactifs
- Ordre de tabulation logique

---

## 📊 Performance

### Optimisations

**Code Splitting:**
```tsx
'use client'  // Client component seulement pour parties interactives
```

**Lazy Loading:**
- Sheet chargé uniquement si ouvert
- Dropdown chargé à la demande

**Bundle Size:**
- Icônes importées individuellement
- Tree-shaking automatique

---

## 🧪 Test en Local

```bash
npm run dev
```

Ouvrir: http://localhost:3002

**Tester:**
1. Navigation desktop
2. Menu mobile (réduire la fenêtre <768px)
3. Dropdown utilisateur
4. Highlight liens actifs
5. Responsive breakpoints
6. États auth (connecté/déconnecté)

---

## 🎯 Checklist

- [x] Header créé avec auth conditionnelle
- [x] Menu desktop avec navigation
- [x] Menu mobile avec Sheet
- [x] Dropdown utilisateur (6 liens + déconnexion)
- [x] Avatar avec initiales
- [x] Highlight lien actif
- [x] Loading states (Skeleton)
- [x] Footer avec 5 sections
- [x] Réseaux sociaux
- [x] MainLayout wrapper
- [x] Responsive mobile-first
- [x] Accessibilité ARIA
- [x] Icons Lucide
- [x] Export barrel
- [x] Documentation complète

---

## 🚀 Prochaines Étapes

1. **Pages Manquantes**
   - Créer les pages liées (events, about, etc.)
   - Paramètres utilisateur
   - Favoris, Achats

2. **Features**
   - Notifications badge (nombre)
   - Recherche dans header
   - Panier d'achat

3. **Amélioration UX**
   - Animations transitions
   - Micro-interactions
   - Loading states pages

---

**Créé le:** 15 février 2026  
**Status:** ✅ Navigation production-ready  
**Mobile-first:** ✅ Complètement responsive
