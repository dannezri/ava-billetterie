# Dashboard Vendeur

Structure complète du dashboard vendeur avec sidebar et gestion du statut KYC.

## 📁 Structure

```
app/(protected)/dashboard/seller/
├── layout.tsx          # Layout avec sidebar de navigation
├── page.tsx            # Page "Mes Billets" (par défaut)
├── sales/
│   └── page.tsx        # Page "Ventes"
├── payments/
│   └── page.tsx        # Page "Paiements"
└── profile/
    └── page.tsx        # Page "Profil"
```

## 🎨 Composants

### SellerSidebar
Sidebar de navigation pour le dashboard vendeur avec 4 sections :
- **Mes Billets** - Liste des billets en vente
- **Ventes** - Historique des transactions
- **Paiements** - Gestion des paiements et versements
- **Profil** - Informations personnelles et paramètres

### KYCStatusBadge
Badge d'affichage du statut KYC avec 3 états :
- `PENDING` - En attente (jaune)
- `VERIFIED` - Vérifié (vert)
- `REJECTED` - Rejeté (rouge)

### MobileSellerSidebar
Version mobile de la sidebar avec menu hamburger.

## 🔐 Protection

Toutes les pages sont protégées par le composant `SellerProtection` qui :
- Vérifie l'authentification de l'utilisateur
- Vérifie l'existence d'un compte Stripe Connect
- Redirige vers l'onboarding si nécessaire

## 🚀 Utilisation

### Accès au dashboard
```
/dashboard/seller
```

### Navigation
La sidebar permet de naviguer entre les différentes sections sans rechargement de page (Next.js App Router).

### Responsive
- **Desktop** : Sidebar fixe sur la gauche
- **Mobile** : Menu hamburger dans le header

## 📊 État actuel (Skeleton)

Les pages affichent actuellement des données mockées :
- Statistiques à 0
- Listes vides avec messages d'état
- Formulaires fonctionnels mais non connectés

## ✅ TODO : Intégration avec tRPC

Pour connecter le dashboard aux vraies données :

1. **Créer les routes tRPC** dans `src/server/routers/`
   ```typescript
   // seller.router.ts
   export const sellerRouter = createTRPCRouter({
     getTickets: protectedProcedure.query(async ({ ctx }) => {
       // Récupérer les billets du vendeur
     }),
     getSales: protectedProcedure.query(async ({ ctx }) => {
       // Récupérer les ventes
     }),
     getPayments: protectedProcedure.query(async ({ ctx }) => {
       // Récupérer les paiements
     }),
     getProfile: protectedProcedure.query(async ({ ctx }) => {
       // Récupérer le profil
     }),
   });
   ```

2. **Remplacer les hooks mockés**
   ```typescript
   // Remplacer
   function useSellerData() {
     return { user: {...}, tickets: [], loading: false };
   }
   
   // Par
   function useSellerData() {
     const { data, isLoading } = trpc.seller.getTickets.useQuery();
     return { tickets: data ?? [], loading: isLoading };
   }
   ```

3. **Ajouter les mutations pour les actions**
   ```typescript
   const updateProfile = trpc.seller.updateProfile.useMutation();
   ```

## 🎯 Conformité MVP

Cette structure respecte le MVP.md :
- ✅ Affichage du statut KYC (badge visible)
- ✅ Navigation claire entre sections
- ✅ Protection par authentification
- ✅ Intégration Stripe Connect
- ✅ Design moderne avec Tailwind + shadcn/ui

## 🔗 Liens utiles

- [MVP.md](/MVP.md) - Spécifications complètes
- [Composants UI](/src/components/ui/) - shadcn/ui components
- [tRPC Guide](/TRPC_GUIDE.md) - Documentation tRPC
