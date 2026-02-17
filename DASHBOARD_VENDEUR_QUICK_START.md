# Dashboard Vendeur - Guide de démarrage rapide ⚡

## 🚀 Accès rapide

```bash
# 1. Démarrer le serveur
npm run dev

# 2. Ouvrir dans le navigateur
http://localhost:3000/dashboard/seller
```

## 📱 Structure de navigation

```
/dashboard/seller           → Mes Billets (page par défaut)
/dashboard/seller/sales     → Ventes et statistiques
/dashboard/seller/payments  → Paiements et versements
/dashboard/seller/profile   → Profil et paramètres
```

## 🎯 Fonctionnalités implémentées

### ✅ Sidebar de navigation
- **Desktop** : Sidebar fixe sur la gauche (240px)
- **Mobile** : Menu hamburger dans le header
- Navigation active avec indicateur visuel

### ✅ Badge KYC
Affiche le statut de vérification d'identité :
- 🟡 **En attente** (PENDING)
- 🟢 **Vérifié** (VERIFIED)
- 🔴 **Rejeté** (REJECTED)

### ✅ Pages complètes

#### 1. Mes Billets (`/dashboard/seller`)
- Header avec badge KYC
- Bouton "Vendre un billet"
- Grille de billets (vide pour l'instant)
- État vide avec CTA

#### 2. Ventes (`/dashboard/seller/sales`)
- 3 cartes de statistiques
- Liste des transactions
- Badges de statut

#### 3. Paiements (`/dashboard/seller/payments`)
- Carte de solde (disponible + en attente)
- Bouton vers Dashboard Stripe
- Historique des versements

#### 4. Profil (`/dashboard/seller/profile`)
- Formulaire d'informations personnelles
- Section sécurité avec badge KYC
- Trust score avec barre de progression
- Connexion Stripe
- Préférences de notifications

## 🔧 Utiliser les composants

### Import du badge KYC
```tsx
import { KYCStatusBadge } from '@/components/seller';

// Utilisation
<KYCStatusBadge status="VERIFIED" />
```

### Import de la sidebar
```tsx
import { SellerSidebar, MobileSellerSidebar } from '@/components/seller';

// Desktop
<SellerSidebar />

// Mobile
<MobileSellerSidebar />
```

## 📊 Données actuelles (Mock)

Les pages affichent des données mockées :
```typescript
// Exemple dans page.tsx
function useSellerData() {
  return {
    user: {
      kycStatus: 'PENDING' as const,
      name: 'John Doe',
      email: 'john@example.com',
    },
    tickets: [],
    loading: false,
  };
}
```

## 🎨 Personnalisation

### Modifier les couleurs du badge KYC
Fichier : `src/components/seller/KYCStatusBadge.tsx`

```tsx
const statusConfig = {
  PENDING: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  // Modifier les classes Tailwind ici
};
```

### Ajouter une section à la sidebar
Fichier : `src/components/seller/SellerSidebar.tsx`

```tsx
const navItems = [
  {
    title: 'Mes Billets',
    href: '/dashboard/seller',
    icon: Package,
  },
  // Ajouter un nouvel item ici
  {
    title: 'Paramètres',
    href: '/dashboard/seller/settings',
    icon: Settings,
  },
];
```

## 🔌 Intégrer les vraies données

### Étape 1 : Créer le router tRPC
```typescript
// src/server/routers/seller.router.ts
export const sellerRouter = createTRPCRouter({
  getTickets: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.ticket.findMany({
      where: { sellerId: ctx.session.user.id },
    });
  }),
});
```

### Étape 2 : Ajouter au router principal
```typescript
// src/server/routers/index.ts
export const appRouter = createTRPCRouter({
  // ... autres routers
  seller: sellerRouter,
});
```

### Étape 3 : Utiliser dans les pages
```tsx
// app/(protected)/dashboard/seller/page.tsx
function useSellerData() {
  const { data: tickets, isLoading } = trpc.seller.getTickets.useQuery();
  
  return {
    tickets: tickets ?? [],
    loading: isLoading,
  };
}
```

## 🧪 Tests rapides

### Vérifier la navigation
1. Ouvrir `/dashboard/seller`
2. Cliquer sur "Ventes" dans la sidebar
3. Vérifier l'URL : `/dashboard/seller/sales`
4. Vérifier l'indicateur actif dans la sidebar

### Vérifier le responsive
1. Ouvrir DevTools (F12)
2. Mode responsive (Ctrl+Shift+M)
3. Vérifier le menu hamburger s'affiche
4. Tester l'ouverture/fermeture du menu

### Vérifier les états
1. Page vide : pas de billets → message + CTA
2. Loading : squelettes animés
3. Badge KYC : couleur et icône correctes

## ⚡ Commandes utiles

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Format
npm run format

# Build
npm run build
```

## 🐛 Dépannage

### Erreur d'import
```bash
# Vérifier que le serveur est redémarré
npm run dev
```

### Badge KYC ne s'affiche pas
```tsx
// Vérifier que le statut est correct
<KYCStatusBadge status="VERIFIED" /> // OK
<KYCStatusBadge status="verified" />  // ❌ Mauvaise casse
```

### Sidebar ne s'affiche pas
```tsx
// Vérifier le layout
// Le layout doit envelopper toutes les pages du dashboard
```

## 📚 Ressources

- [Documentation complète](./DASHBOARD_VENDEUR_IMPLEMENTATION.md)
- [README du dashboard](./app/(protected)/dashboard/seller/README.md)
- [MVP Specs](./MVP.md)
- [shadcn/ui Components](https://ui.shadcn.com/)

## 🎉 C'est prêt !

Le dashboard vendeur est maintenant fonctionnel avec une structure skeleton complète. Il ne reste plus qu'à connecter les vraies données via tRPC.

**Prochain objectif** : Implémenter les routes tRPC pour récupérer les vraies données depuis la base de données.
