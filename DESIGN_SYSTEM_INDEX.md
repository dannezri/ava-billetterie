# 🗂️ Index - Design System AVA

## 📍 Navigation Rapide

### 🚀 Démarrer
1. **[Guide Rapide](DESIGN_SYSTEM_QUICK_START.md)** - Commencez ici ! (5 min)
2. **[Documentation Complète](DESIGN_SYSTEM.md)** - Guide détaillé (30 min)
3. **[Récapitulatif](DESIGN_SYSTEM_SUMMARY.md)** - Vue d'ensemble de tout ce qui a été créé

### 🌐 Visualisation
- **URL** : `http://localhost:3000/design-system`
- **Commande** : `npm run dev`

---

## 📁 Structure des Fichiers

### 📚 Documentation

| Fichier | Description | Temps de lecture |
|---------|-------------|------------------|
| **DESIGN_SYSTEM_QUICK_START.md** | Guide de démarrage rapide | 5 min |
| **DESIGN_SYSTEM.md** | Documentation complète | 30 min |
| **DESIGN_SYSTEM_SUMMARY.md** | Récapitulatif de tout | 10 min |
| **DESIGN_SYSTEM_INDEX.md** | Ce fichier | 2 min |

### 🎨 Design Tokens

| Fichier | Contenu |
|---------|---------|
| **src/styles/tokens.ts** | Couleurs, typographie, spacing, bordures, ombres, etc. |

### 🎨 Styles & Configuration

| Fichier | Rôle |
|---------|------|
| **app/globals.css** | Variables CSS, styles globaux, mode sombre |
| **tailwind.config.ts** | Configuration Tailwind avec palettes complètes |

### 🧩 Composants UI

| Composant | Fichier | Variantes |
|-----------|---------|-----------|
| **Button** | `src/components/ui/button.tsx` | 10 variantes, 7 tailles |
| **Input** | `src/components/ui/input.tsx` | 3 variantes, 3 tailles |
| **Card** | `src/components/ui/card.tsx` | 4 variantes, 4 paddings |
| **Export All** | `src/components/ui/index.ts` | Import centralisé |

### 💡 Exemples & Templates

| Fichier | Type | Usage |
|---------|------|-------|
| **DesignSystemShowcase.tsx** | Showcase complet | Visualisation de tous les composants |
| **TemplateExample.tsx** | Template de page | Point de départ pour nouvelles pages |
| **app/design-system/page.tsx** | Page Next.js | Route `/design-system` |

---

## 🎨 Palette de Couleurs

### Trust Blue (Primaire)
```
Couleur principale : #2B87E3
Nuances : 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
Usage : Actions principales, liens, confiance
```

### Accent Green (Secondaire)
```
Couleur principale : #10B981
Nuances : 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
Usage : Validation, succès, boutons secondaires
```

---

## 🧩 Composants Disponibles

### Composants de Base
- ✅ **Button** - Actions utilisateur
- ✅ **Input** - Saisie de données
- ✅ **Card** - Conteneurs de contenu

### Composants Existants (shadcn/ui)
- Badge
- Avatar
- Dialog
- Dropdown Menu
- Popover
- Select
- Separator
- Sheet
- Skeleton
- Tabs
- Textarea
- Toast

---

## 🎯 Par Cas d'Usage

### Créer une Nouvelle Page
1. Copier `src/components/examples/TemplateExample.tsx`
2. Modifier selon vos besoins
3. Utiliser les composants du Design System

### Créer un Formulaire
```tsx
import { Button, Input } from '@/components/ui';

<Input 
  leftIcon={<Mail />}
  error={errors.email?.message}
  placeholder="Email"
/>
<Button variant="default" loading={isSubmitting}>
  Envoyer
</Button>
```

### Créer une Card de Billet
```tsx
import { Card, CardHeader, CardTitle, CardBadge } from '@/components/ui';

<Card interactive variant="elevated">
  <CardBadge variant="success">Disponible</CardBadge>
  <CardHeader>
    <CardTitle>Concert</CardTitle>
  </CardHeader>
  {/* ... */}
</Card>
```

### Afficher un Statut
```tsx
import { Badge } from '@/components/ui';

<Badge className="badge-success">Vérifié</Badge>
<Badge className="badge-warning">En attente</Badge>
<Badge className="badge-error">Rejeté</Badge>
```

---

## 📖 Par Niveau d'Expertise

### 🌱 Débutant
1. Lire **DESIGN_SYSTEM_QUICK_START.md**
2. Ouvrir `/design-system` dans le navigateur
3. Copier les exemples et modifier

### 🌿 Intermédiaire
1. Lire **DESIGN_SYSTEM.md**
2. Étudier les composants dans `src/components/ui/`
3. Utiliser les design tokens de `src/styles/tokens.ts`

### 🌳 Avancé
1. Créer de nouveaux composants
2. Étendre les variantes existantes
3. Modifier les design tokens
4. Contribuer à la documentation

---

## 🔍 Recherche Rapide

### "Je veux..."

#### ...créer un bouton
→ `import { Button } from '@/components/ui';`
→ Voir **DESIGN_SYSTEM.md** section "Button"

#### ...créer un input
→ `import { Input } from '@/components/ui';`
→ Voir **DESIGN_SYSTEM.md** section "Input"

#### ...créer une card
→ `import { Card } from '@/components/ui';`
→ Voir **DESIGN_SYSTEM.md** section "Card"

#### ...utiliser les couleurs
→ Voir **DESIGN_SYSTEM.md** section "Palette de Couleurs"
→ Classes : `bg-primary`, `bg-secondary`, `text-primary`, etc.

#### ...voir des exemples
→ Ouvrir `http://localhost:3000/design-system`
→ Voir `src/components/examples/DesignSystemShowcase.tsx`

#### ...créer une nouvelle page
→ Copier `src/components/examples/TemplateExample.tsx`

---

## 🛠️ Commandes Utiles

```bash
# Démarrer le serveur de dev
npm run dev

# Voir le Design System
# Ouvrir http://localhost:3000/design-system

# Linter
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

---

## 📊 Checklist de Démarrage

### Première Fois
- [ ] J'ai lu **DESIGN_SYSTEM_QUICK_START.md**
- [ ] J'ai ouvert `/design-system` dans mon navigateur
- [ ] J'ai testé les composants Button, Input et Card
- [ ] Je connais les 2 couleurs principales (Trust Blue, Accent Green)

### Avant de Développer
- [ ] Je sais importer les composants : `import { Button } from '@/components/ui';`
- [ ] Je connais les variantes de Button (default, secondary, etc.)
- [ ] Je sais utiliser les classes Tailwind du Design System
- [ ] J'ai consulté **TemplateExample.tsx** pour voir un exemple complet

### Avant de Commiter
- [ ] Mon code utilise les composants du Design System
- [ ] Je n'ai pas créé de boutons/inputs custom
- [ ] Les couleurs utilisées viennent du Design System
- [ ] Mon code est accessible (contraste, focus, keyboard)

---

## 🆘 Aide

### Questions Fréquentes

**Q: Comment importer les composants ?**
```tsx
import { Button, Input, Card } from '@/components/ui';
```

**Q: Quelle couleur pour un bouton principal ?**
```tsx
<Button variant="default"> // Trust Blue
```

**Q: Quelle couleur pour un bouton de validation ?**
```tsx
<Button variant="secondary"> // Accent Green
```

**Q: Comment afficher une erreur dans un Input ?**
```tsx
<Input error="Message d'erreur" />
```

**Q: Comment créer une Card interactive ?**
```tsx
<Card interactive variant="elevated">
```

**Q: Où trouver tous les exemples ?**
→ `http://localhost:3000/design-system`

---

## 🎯 Prochaines Étapes

### Maintenant
1. [ ] Lancer `npm run dev`
2. [ ] Ouvrir `http://localhost:3000/design-system`
3. [ ] Explorer les composants

### Ensuite
1. [ ] Lire **DESIGN_SYSTEM_QUICK_START.md**
2. [ ] Copier **TemplateExample.tsx** pour créer une page
3. [ ] Utiliser les composants dans votre code

### Plus Tard
1. [ ] Lire **DESIGN_SYSTEM.md** en détail
2. [ ] Étudier les design tokens
3. [ ] Créer vos propres composants métier

---

## 📞 Support

- **Documentation** : Voir les fichiers `DESIGN_SYSTEM_*.md`
- **Exemples visuels** : `http://localhost:3000/design-system`
- **Code source** : `src/components/ui/` et `src/components/examples/`

---

**🚀 Prêt à commencer ?**

```bash
npm run dev
# Ouvrir http://localhost:3000/design-system
```

---

**Version 1.0.0** - Design System AVA Platform
