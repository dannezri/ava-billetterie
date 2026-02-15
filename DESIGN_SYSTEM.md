# Design System - AVA Platform

## 🎨 Vue d'ensemble

Le Design System AVA est conçu pour garantir une expérience utilisateur cohérente, accessible et professionnelle sur toute la plateforme de revente de billets éthique. Il repose sur des principes de **confiance**, **transparence** et **simplicité**.

### Principes de Design

1. **Confiance** - Les couleurs et composants inspirent la sécurité et la fiabilité
2. **Clarté** - L'interface est intuitive et les actions sont évidentes
3. **Accessibilité** - WCAG 2.1 niveau AA minimum
4. **Performance** - Optimisé pour tous les appareils

---

## 🎨 Palette de Couleurs

### Couleurs Principales

#### Trust Blue (Primaire)
Couleur principale représentant la **confiance**, la **sécurité** et les **transactions**.

```css
--primary: #2B87E3 (hsl(211, 77%, 53%))
```

**Palette complète :**
- `trustBlue.50`: `#EBF5FF` - Backgrounds très clairs
- `trustBlue.100`: `#D6EBFF` - Hover states légers
- `trustBlue.200`: `#B3D9FF` - Borders actifs
- `trustBlue.300`: `#80C1FF` - États intermédiaires
- `trustBlue.400`: `#4DA8FF` - Boutons secondaires
- `trustBlue.500`: `#2B87E3` - **Couleur principale**
- `trustBlue.600`: `#1A6FCC` - Hover principal
- `trustBlue.700`: `#0F54A3` - Active states
- `trustBlue.800`: `#083D7A` - Textes importants
- `trustBlue.900`: `#042952` - Headers/emphase

**Utilisation :**
```tsx
// Bouton principal
<Button variant="default">Acheter</Button>

// Lien
<a className="text-primary hover:text-primary/80">En savoir plus</a>

// Background
<div className="bg-trustBlue-50">...</div>
```

#### Accent Green (Secondaire)
Couleur secondaire représentant le **succès**, la **validation** et la **confiance établie**.

```css
--secondary: #10B981 (hsl(160, 84%, 39%))
```

**Palette complète :**
- `accentGreen.50`: `#ECFDF5` - Success backgrounds
- `accentGreen.100`: `#D1FAE5` - Toast de succès
- `accentGreen.200`: `#A7F3D0` - Borders success
- `accentGreen.300`: `#6EE7B7` - Hover success
- `accentGreen.400`: `#34D399` - États intermédiaires
- `accentGreen.500`: `#10B981` - **Couleur principale**
- `accentGreen.600`: `#059669` - Hover
- `accentGreen.700`: `#047857` - Active
- `accentGreen.800`: `#065F46` - Emphase
- `accentGreen.900`: `#064E3B` - Texte foncé

**Utilisation :**
```tsx
// Bouton de validation
<Button variant="secondary">Valider</Button>

// Badge de succès
<Badge variant="success">Vérifié</Badge>

// Message de confirmation
<div className="bg-accentGreen-50 border-l-4 border-accentGreen-500">
  Votre billet a été mis en vente !
</div>
```

### Couleurs Sémantiques

```tsx
// Succès
--success: #10B981 (même que secondary)

// Erreur/Danger
--destructive: #EF4444

// Attention
--warning: #F59E0B

// Information
--info: #3B82F6
```

### Couleurs Neutres

Utilisées pour les textes, bordures et backgrounds.

```tsx
// Gris (neutral)
neutral.50  → #F9FAFB  // Backgrounds très clairs
neutral.100 → #F3F4F6  // Backgrounds clairs
neutral.200 → #E5E7EB  // Borders
neutral.300 → #D1D5DB  // Borders actifs
neutral.400 → #9CA3AF  // Placeholder
neutral.500 → #6B7280  // Texte secondaire
neutral.600 → #4B5563  // Texte principal
neutral.700 → #374151  // Texte emphase
neutral.800 → #1F2937  // Headers
neutral.900 → #111827  // Texte très foncé
```

### Couleurs de Statut (Spécifiques à la plateforme)

```tsx
// Statuts de billets
status.active    → #10B981 (vert)
status.pending   → #F59E0B (orange)
status.sold      → #6B7280 (gris)
status.rejected  → #EF4444 (rouge)
status.reserved  → #3B82F6 (bleu)

// Statuts de transactions
status.escrowed  → #2B87E3 (Trust Blue)
status.released  → #10B981 (vert)
status.disputed  → #EF4444 (rouge)
```

---

## 📝 Typographie

### Famille de Polices

```css
/* Sans-serif (par défaut) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Monospace (code, numéros de billets) */
font-family: 'Fira Code', Monaco, Consolas, monospace;
```

### Échelle de Tailles

```tsx
text-xs    → 12px  // Labels, badges
text-sm    → 14px  // Texte secondaire, helper text
text-base  → 16px  // Texte principal
text-lg    → 18px  // Sous-titres
text-xl    → 20px  // Titres de cards
text-2xl   → 24px  // Titres de sections
text-3xl   → 30px  // Titres de pages
text-4xl   → 36px  // Hero titles
text-5xl   → 48px  // Landing page
```

### Poids

```tsx
font-light     → 300  // Rarement utilisé
font-normal    → 400  // Texte par défaut
font-medium    → 500  // Emphase légère
font-semibold  → 600  // Titres, boutons
font-bold      → 700  // Headers importants
font-extrabold → 800  // Hero sections
```

### Hiérarchie

```tsx
// H1 - Hero / Page principale
<h1 className="text-4xl lg:text-5xl font-bold">Titre principal</h1>

// H2 - Sections
<h2 className="text-3xl font-semibold">Section</h2>

// H3 - Sous-sections
<h3 className="text-2xl font-semibold">Sous-section</h3>

// H4 - Cards / Groupes
<h4 className="text-xl font-medium">Card Title</h4>

// Paragraphe
<p className="text-base text-foreground">Texte normal...</p>

// Texte secondaire
<p className="text-sm text-muted-foreground">Info additionnelle</p>
```

---

## 📏 Spacing & Layout

### Système d'Espacement

Basé sur une échelle de **4px** (0.25rem).

```tsx
// Tailwind spacing scale
0  → 0px
1  → 4px
2  → 8px
3  → 12px
4  → 16px   // Espacement par défaut
5  → 20px
6  → 24px
8  → 32px
10 → 40px
12 → 48px
16 → 64px
20 → 80px
24 → 96px
```

### Largeurs de Container

```tsx
container-xs  → 475px
container-sm  → 640px
container-md  → 768px
container-lg  → 1024px
container-xl  → 1280px
container-2xl → 1400px  // Max-width principal
```

### Breakpoints (Responsive)

```tsx
xs  → 475px   // Petits smartphones
sm  → 640px   // Smartphones
md  → 768px   // Tablettes
lg  → 1024px  // Laptops
xl  → 1280px  // Desktops
2xl → 1536px  // Large screens
```

---

## 🔲 Composants

### Button

Le composant Button offre plusieurs variantes adaptées aux différents contextes.

#### Variantes

```tsx
import { Button } from '@/components/ui/button';

// Primaire (Trust Blue)
<Button variant="default">Action principale</Button>

// Secondaire (Accent Green)
<Button variant="secondary">Valider</Button>

// Destructive
<Button variant="destructive">Supprimer</Button>

// Outline
<Button variant="outline">Annuler</Button>

// Ghost
<Button variant="ghost">Retour</Button>

// Link
<Button variant="link">En savoir plus</Button>

// Success
<Button variant="success">Confirmer</Button>

// Warning
<Button variant="warning">Attention</Button>

// Info
<Button variant="info">Informations</Button>
```

#### Tailles

```tsx
<Button size="sm">Petit</Button>
<Button size="default">Normal</Button>
<Button size="lg">Grand</Button>
<Button size="xl">Très grand</Button>

// Avec icône
<Button size="icon"><Icon /></Button>
<Button size="icon-sm"><Icon /></Button>
<Button size="icon-lg"><Icon /></Button>
```

#### États et Props

```tsx
// Loading
<Button loading>Chargement...</Button>

// Disabled
<Button disabled>Désactivé</Button>

// Full width
<Button className="w-full">Pleine largeur</Button>

// Avec icônes
<Button leftIcon={<CheckIcon />}>Avec icône gauche</Button>
<Button rightIcon={<ArrowIcon />}>Avec icône droite</Button>
```

#### Exemples d'Utilisation

```tsx
// Achat de billet
<Button variant="default" size="lg" className="w-full">
  Acheter maintenant - 45€
</Button>

// Mise en vente
<Button variant="secondary" loading={isSubmitting}>
  Mettre en vente
</Button>

// Suppression
<Button 
  variant="destructive" 
  onClick={handleDelete}
>
  Supprimer l'annonce
</Button>
```

---

### Input

Composant Input avec support d'icônes, états et validation.

#### Variantes de Base

```tsx
import { Input } from '@/components/ui/input';

// Input par défaut
<Input placeholder="Email" />

// Avec tailles
<Input inputSize="sm" />
<Input inputSize="default" />
<Input inputSize="lg" />
```

#### Avec Icônes

```tsx
import { Mail, Search, Lock } from 'lucide-react';

// Icône à gauche
<Input 
  leftIcon={<Mail />}
  placeholder="votre@email.com"
/>

// Icône à droite
<Input 
  rightIcon={<Search />}
  placeholder="Rechercher..."
/>
```

#### États et Validation

```tsx
// État d'erreur
<Input 
  error="Email invalide"
  placeholder="Email"
/>

// État de succès
<Input 
  success
  placeholder="Email"
/>

// Texte d'aide
<Input 
  helperText="Nous ne partagerons jamais votre email"
  placeholder="Email"
/>

// Désactivé
<Input disabled placeholder="Désactivé" />
```

#### Exemples d'Utilisation

```tsx
// Recherche de billets
<Input 
  leftIcon={<Search />}
  placeholder="Rechercher un événement, artiste..."
  className="max-w-md"
/>

// Prix de vente
<Input 
  type="number"
  leftIcon={<span className="text-muted-foreground">€</span>}
  placeholder="0.00"
  helperText="Prix ≤ prix facial du billet"
/>

// Email avec validation
<Input 
  type="email"
  leftIcon={<Mail />}
  error={errors.email?.message}
  placeholder="votre@email.com"
/>
```

---

### Card

Composant Card flexible pour afficher du contenu structuré.

#### Variantes

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

// Card par défaut
<Card variant="default">
  <CardContent>Contenu</CardContent>
</Card>

// Card élevée (avec ombre)
<Card variant="elevated">
  <CardContent>Contenu</CardContent>
</Card>

// Card outline
<Card variant="outline">
  <CardContent>Contenu</CardContent>
</Card>

// Card interactive (hover effect)
<Card interactive>
  <CardContent>Cliquez-moi</CardContent>
</Card>
```

#### Structure Complète

```tsx
<Card>
  <CardHeader>
    <CardTitle>Titre de la card</CardTitle>
    <CardDescription>Description optionnelle</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu principal de la card
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

#### Avec Badge

```tsx
import { CardBadge } from '@/components/ui/card';

<Card className="relative">
  <CardBadge variant="success">Vérifié</CardBadge>
  <CardContent>...</CardContent>
</Card>
```

#### Exemples d'Utilisation

```tsx
// Card de billet
<Card interactive variant="elevated" className="overflow-hidden">
  <CardHeader>
    <CardBadge variant="success">Disponible</CardBadge>
    <CardTitle as="h4">Concert - Jul</CardTitle>
    <CardDescription>
      Accor Arena, Paris • 15 Mars 2026
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Prix facial</span>
        <span className="font-medium">65€</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Prix de vente</span>
        <span className="font-semibold text-lg text-primary">45€</span>
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button className="w-full">Acheter</Button>
  </CardFooter>
</Card>

// Card de profil vendeur
<Card variant="outline">
  <CardHeader centerContent>
    <Avatar />
    <CardTitle as="h5">Jean Dupont</CardTitle>
    <CardDescription>Vendeur vérifié</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="flex justify-around text-center">
      <div>
        <div className="text-2xl font-bold text-primary">12</div>
        <div className="text-sm text-muted-foreground">Ventes</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-secondary">4.9</div>
        <div className="text-sm text-muted-foreground">Note</div>
      </div>
    </div>
  </CardContent>
</Card>

// Card de transaction
<Card>
  <CardHeader>
    <div className="flex items-start justify-between">
      <div>
        <CardTitle as="h5">Transaction #ABC123</CardTitle>
        <CardDescription>15 Février 2026</CardDescription>
      </div>
      <CardBadge variant="success">Libéré</CardBadge>
    </div>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>Montant</span>
        <span className="font-medium">45.00€</span>
      </div>
      <div className="flex justify-between">
        <span>Frais plateforme</span>
        <span className="font-medium">2.25€</span>
      </div>
      <Separator />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>47.25€</span>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## 🔄 Animations & Transitions

### Durées

```tsx
// Classes Tailwind
transition-fast   → 150ms
transition        → 200ms  // Par défaut
transition-slow   → 300ms
transition-slower → 500ms
```

### Animations Préconçues

```tsx
// Fade
animate-fade-in
animate-fade-out

// Slide
animate-slide-in-top
animate-slide-in-bottom

// Accordéon (Radix UI)
animate-accordion-down
animate-accordion-up
```

### Exemple d'Utilisation

```tsx
<div className="transition-all duration-200 hover:scale-105">
  Card interactive
</div>
```

---

## ♿ Accessibilité

### Principes

1. **Contraste** - Ratio minimum 4.5:1 pour le texte normal
2. **Focus visible** - Tous les éléments interactifs ont un focus ring
3. **Navigation clavier** - Tab order logique
4. **ARIA labels** - Pour les éléments sans texte visible

### Focus States

```tsx
// Classe utilitaire
.focus-ring

// Exemple
<button className="focus-ring">
  Bouton accessible
</button>
```

### Couleurs et Contraste

Toutes les combinaisons de couleurs respectent WCAG 2.1 AA :

```tsx
// ✅ Bon contraste
<div className="bg-primary text-primary-foreground">Texte</div>
<div className="bg-secondary text-secondary-foreground">Texte</div>

// ❌ Mauvais contraste
<div className="bg-primary text-primary">Texte</div>
```

---

## 📦 Import et Utilisation

### Structure des Fichiers

```
src/
├── styles/
│   └── tokens.ts          # Design tokens centralisés
├── components/
│   └── ui/
│       ├── button.tsx     # Composant Button
│       ├── input.tsx      # Composant Input
│       └── card.tsx       # Composant Card
└── app/
    └── globals.css        # Variables CSS globales
```

### Importer les Composants

```tsx
// Composants UI
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

// Design tokens (optionnel)
import { colors, typography, spacing } from '@/styles/tokens';
```

### Utiliser les Design Tokens

```tsx
// Dans un composant
import { colors } from '@/styles/tokens';

const MyComponent = () => (
  <div style={{ color: colors.trustBlue[500] }}>
    Texte en Trust Blue
  </div>
);

// Ou avec Tailwind (recommandé)
<div className="text-trustBlue-500">
  Texte en Trust Blue
</div>
```

---

## 🎯 Bonnes Pratiques

### 1. Cohérence

✅ **Faire :**
```tsx
<Button variant="default">Action principale</Button>
<Button variant="secondary">Action secondaire</Button>
```

❌ **Éviter :**
```tsx
<button className="bg-blue-500 text-white px-4 py-2">
  Action principale
</button>
```

### 2. Accessibilité

✅ **Faire :**
```tsx
<Button aria-label="Fermer la modal" size="icon">
  <X />
</Button>
```

❌ **Éviter :**
```tsx
<button>
  <X />
</button>
```

### 3. Responsive Design

✅ **Faire :**
```tsx
<Card className="w-full md:w-1/2 lg:w-1/3">
  Contenu responsive
</Card>
```

### 4. États de Chargement

✅ **Faire :**
```tsx
<Button loading={isSubmitting}>
  Soumettre
</Button>
```

❌ **Éviter :**
```tsx
<Button disabled={isSubmitting}>
  {isSubmitting ? 'Chargement...' : 'Soumettre'}
</Button>
```

### 5. Validation de Formulaire

✅ **Faire :**
```tsx
<Input 
  error={errors.email?.message}
  {...register('email')}
/>
```

---

## 🚀 Évolution du Design System

### Ajout de Nouveaux Composants

1. Créer le composant dans `src/components/ui/`
2. Utiliser les design tokens existants
3. Suivre les conventions de nommage
4. Ajouter la documentation ici
5. Créer des exemples d'utilisation

### Modification de Tokens

⚠️ **Attention** : Modifier les tokens impacte toute l'application.

1. Modifier `src/styles/tokens.ts`
2. Mettre à jour `app/globals.css` si nécessaire
3. Mettre à jour `tailwind.config.ts`
4. Tester l'impact sur tous les composants
5. Mettre à jour cette documentation

---

## 📞 Support

Pour toute question sur le Design System :

1. Consulter cette documentation
2. Vérifier les exemples dans `src/components/examples/`
3. Consulter le code des composants dans `src/components/ui/`

---

## 📋 Checklist pour les Développeurs

Avant de créer un nouveau composant ou page :

- [ ] J'utilise les couleurs du Design System (Trust Blue, Accent Green)
- [ ] J'utilise les composants existants (Button, Input, Card)
- [ ] Mon composant est accessible (focus, ARIA, contraste)
- [ ] Mon composant est responsive
- [ ] J'utilise l'échelle d'espacement (multiples de 4px)
- [ ] J'utilise la typographie définie (Inter, échelle modulaire)
- [ ] Les états de chargement sont gérés
- [ ] Les erreurs de validation sont affichées clairement
- [ ] Les animations sont subtiles et performantes

---

**Version 1.0.0** - Février 2026
