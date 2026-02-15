# 🧩 UI Components

Composants UI réutilisables du Design System AVA.

## 📦 Import

```tsx
// Import individuel
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// Import groupé (recommandé)
import { Button, Input, Card } from '@/components/ui';
```

## 🎨 Composants Améliorés (Design System AVA)

### Button
**Fichier:** `button.tsx`

Bouton avec 10 variantes et support des icônes.

```tsx
<Button variant="default">Primaire</Button>
<Button variant="secondary">Secondaire</Button>
<Button loading>Chargement...</Button>
<Button leftIcon={<Icon />}>Avec icône</Button>
```

**Variantes:**
- `default` - Trust Blue (primaire)
- `secondary` - Accent Green
- `success` - Vert
- `destructive` - Rouge
- `warning` - Orange
- `info` - Bleu
- `outline` - Bordure
- `ghost` - Transparent
- `link` - Lien
- `subtle` - Léger

**Tailles:**
- `sm`, `default`, `lg`, `xl`
- `icon`, `icon-sm`, `icon-lg`

### Input
**Fichier:** `input.tsx`

Champ de saisie avec validation et icônes.

```tsx
<Input 
  leftIcon={<Mail />}
  error="Email invalide"
  placeholder="Email"
/>
```

**Props:**
- `variant` - `default`, `error`, `success`
- `inputSize` - `sm`, `default`, `lg`
- `leftIcon` - Icône à gauche
- `rightIcon` - Icône à droite
- `error` - Message d'erreur
- `success` - État de succès
- `helperText` - Texte d'aide

### Card
**Fichier:** `card.tsx`

Conteneur de contenu flexible.

```tsx
<Card variant="elevated" interactive>
  <CardHeader>
    <CardBadge variant="success">Nouveau</CardBadge>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Contenu</CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Variantes:**
- `default` - Ombre légère
- `elevated` - Ombre prononcée + hover
- `outline` - Bordure épaisse
- `ghost` - Sans bordure

**Sub-components:**
- `CardHeader` - En-tête
- `CardTitle` - Titre (h1-h6)
- `CardDescription` - Description
- `CardContent` - Contenu principal
- `CardFooter` - Pied de page
- `CardBadge` - Badge de statut

## 🎨 Composants shadcn/ui

Composants de base fournis par shadcn/ui.

### Form Components
- `Label` - Labels de formulaire
- `Textarea` - Zone de texte multi-lignes
- `Select` - Menu déroulant
- `Form` - Wrapper de formulaire (react-hook-form)

### Display Components
- `Badge` - Badges de statut
- `Avatar` - Photos de profil
- `Skeleton` - Loading placeholders
- `Separator` - Séparateurs visuels

### Overlay Components
- `Dialog` - Modale
- `Sheet` - Panneau latéral
- `DropdownMenu` - Menu déroulant
- `Popover` - Pop-up contextuel

### Feedback Components
- `Toast` - Notifications
- `Alert` - Messages d'alerte

### Navigation Components
- `Tabs` - Onglets

## 📚 Documentation

- **Guide Rapide:** `/DESIGN_SYSTEM_QUICK_START.md`
- **Documentation Complète:** `/DESIGN_SYSTEM.md`
- **Exemples Visuels:** `http://localhost:3000/design-system`

## 🎯 Conventions

### Nommage
- Composants en PascalCase : `Button`, `Input`, `Card`
- Fichiers en kebab-case : `button.tsx`, `input.tsx`, `card.tsx`

### Props
- Utiliser `variant` pour les variantes visuelles
- Utiliser `size` ou `inputSize` pour les tailles
- Props spécifiques avec noms explicites

### Styles
- Utiliser Tailwind CSS
- Utiliser `cn()` pour combiner les classes
- Utiliser `cva()` pour les variantes (class-variance-authority)

### TypeScript
- Typer toutes les props
- Exporter les types avec `export type`
- Utiliser `React.forwardRef` pour les refs

## 🔧 Ajouter un Nouveau Composant

1. Créer le fichier dans `src/components/ui/`
2. Utiliser les design tokens de `/src/styles/tokens.ts`
3. Suivre la structure des composants existants
4. Ajouter l'export dans `index.ts`
5. Documenter dans `/DESIGN_SYSTEM.md`
6. Ajouter un exemple dans `DesignSystemShowcase.tsx`

### Template

```tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/index';

const myComponentVariants = cva(
  'base-classes',
  {
    variants: {
      variant: {
        default: 'default-classes',
        // ... autres variantes
      },
      size: {
        default: 'default-size-classes',
        // ... autres tailles
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface MyComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof myComponentVariants> {
  // Props spécifiques
}

const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(myComponentVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
MyComponent.displayName = 'MyComponent';

export { MyComponent, myComponentVariants };
```

## 🎨 Utiliser les Couleurs du Design System

```tsx
// Classes Tailwind
<div className="bg-primary text-primary-foreground">Trust Blue</div>
<div className="bg-secondary text-secondary-foreground">Accent Green</div>

// Nuances
<div className="bg-trustBlue-500">Trust Blue 500</div>
<div className="bg-accentGreen-500">Accent Green 500</div>

// États
<div className="hover:bg-primary/90">Hover state</div>
<div className="active:scale-[0.98]">Active state</div>
```

## ✅ Checklist

Avant de créer un nouveau composant :

- [ ] J'ai consulté les composants existants
- [ ] J'utilise les design tokens (`tokens.ts`)
- [ ] J'utilise Tailwind CSS
- [ ] J'utilise `cn()` pour combiner les classes
- [ ] J'utilise `cva()` pour les variantes
- [ ] Mon composant est typé (TypeScript)
- [ ] Mon composant supporte les refs (`forwardRef`)
- [ ] Mon composant est accessible (ARIA, focus, keyboard)
- [ ] J'ai ajouté l'export dans `index.ts`
- [ ] J'ai documenté le composant
- [ ] J'ai créé un exemple

## 🚀 Commencer

```bash
# Visualiser les composants
npm run dev
# Ouvrir http://localhost:3000/design-system

# Utiliser dans votre code
import { Button, Input, Card } from '@/components/ui';
```

---

**📖 Pour plus d'informations, consultez `/DESIGN_SYSTEM.md`**
