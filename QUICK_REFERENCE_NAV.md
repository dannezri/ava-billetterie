# ⚡ Navigation Quick Reference

## 🧭 Composants

- **Header** - Navigation principale (desktop + mobile)
- **Footer** - Pied de page avec liens
- **MainLayout** - Wrapper Header + Content + Footer

## 📱 Responsive

- **Mobile (<768px):** Menu hamburger + Sheet
- **Desktop (≥768px):** Navigation horizontale + Dropdown

## 🔗 Import

```typescript
import { Header, Footer, MainLayout } from '@/components/layout';
```

## 🎨 Utilisation

```tsx
<MainLayout>
  <YourContent />
</MainLayout>
```

## 🔑 Menu Utilisateur

**Desktop Dropdown:**
- Dashboard, Profil, Paramètres
- Mes billets, Mes achats, Favoris
- Se déconnecter

**Mobile Sheet:**
- Même menu + Navigation principale
- Avatar + Nom + Email
- Fermeture auto après clic

## 📚 Documentation

→ `NAVIGATION_SETUP.md`

**Créé le:** 15 février 2026
