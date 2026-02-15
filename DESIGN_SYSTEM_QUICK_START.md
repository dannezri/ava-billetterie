# 🎨 Design System - Guide Rapide

## ⚡ Démarrage Rapide

### 1. Visualiser le Design System

Lancez le serveur de développement et accédez à la page de démonstration :

```bash
npm run dev
```

Puis ouvrez : **http://localhost:3000/design-system**

### 2. Importer les Composants

```tsx
// Dans votre composant React
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
```

### 3. Exemples Courants

#### Bouton Principal (Trust Blue)

```tsx
<Button variant="default">
  Action principale
</Button>
```

#### Bouton de Validation (Accent Green)

```tsx
<Button variant="secondary">
  Valider
</Button>
```

#### Input avec Validation

```tsx
<Input 
  leftIcon={<Mail />}
  error="Email invalide"
  placeholder="votre@email.com"
/>
```

#### Card de Billet

```tsx
<Card interactive variant="elevated">
  <CardHeader>
    <CardTitle>Concert - Jul</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold text-primary">45€</p>
  </CardContent>
</Card>
```

## 🎨 Couleurs Principales

### Trust Blue (Primaire)
- Utilisation : Actions principales, liens, confiance
- Classes : `bg-primary`, `text-primary`, `border-primary`
- Couleur : `#2B87E3`

### Accent Green (Secondaire)
- Utilisation : Validation, succès, boutons secondaires
- Classes : `bg-secondary`, `text-secondary`, `border-secondary`
- Couleur : `#10B981`

## 📚 Documentation Complète

- **Documentation complète** : `DESIGN_SYSTEM.md`
- **Design Tokens** : `src/styles/tokens.ts`
- **Composants** : `src/components/ui/`
- **Exemples** : `src/components/examples/DesignSystemShowcase.tsx`

## 🔧 Personnalisation

### Modifier les Couleurs

1. Modifier `app/globals.css` pour les variables CSS
2. Modifier `tailwind.config.ts` pour les classes Tailwind
3. Mettre à jour `src/styles/tokens.ts` pour les tokens

### Ajouter un Nouveau Composant

1. Créer dans `src/components/ui/`
2. Utiliser les design tokens existants
3. Ajouter des exemples dans `DesignSystemShowcase.tsx`
4. Documenter dans `DESIGN_SYSTEM.md`

## ✅ Checklist Avant de Commencer

- [ ] J'ai lu `DESIGN_SYSTEM.md`
- [ ] J'ai visualisé `/design-system` dans le navigateur
- [ ] Je connais les couleurs principales (Trust Blue, Accent Green)
- [ ] Je sais importer les composants Button, Input, Card
- [ ] Je sais utiliser les design tokens

## 🎯 Composants Principaux

| Composant | Import | Usage |
|-----------|--------|-------|
| **Button** | `@/components/ui/button` | Actions utilisateur |
| **Input** | `@/components/ui/input` | Saisie de données |
| **Card** | `@/components/ui/card` | Conteneurs de contenu |
| **Badge** | `@/components/ui/badge` | Indicateurs de statut |
| **Avatar** | `@/components/ui/avatar` | Photos de profil |

## 🚀 Prochaines Étapes

1. Explorez la page `/design-system` dans votre navigateur
2. Testez les différents composants et variantes
3. Consultez la documentation complète dans `DESIGN_SYSTEM.md`
4. Commencez à développer avec les composants !

---

**Besoin d'aide ?** Consultez `DESIGN_SYSTEM.md` pour la documentation complète.
