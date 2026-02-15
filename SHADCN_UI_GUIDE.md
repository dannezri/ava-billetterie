# 🎨 Guide shadcn/ui - AVA Billetterie

## ✅ Configuration Complète

**Date:** 15 février 2026  
**Status:** 🟢 shadcn/ui opérationnel

---

## 📦 Composants Installés (19)

### Core Components
- ✅ **Button** - Boutons avec variants (default, destructive, outline, secondary, ghost, link)
- ✅ **Input** - Champs de saisie
- ✅ **Label** - Labels de formulaire
- ✅ **Textarea** - Zones de texte multi-lignes
- ✅ **Select** - Sélecteurs dropdown
- ✅ **Form** - Gestion de formulaires avec React Hook Form + Zod

### Display Components
- ✅ **Card** - Cartes de contenu (header, content, footer)
- ✅ **Badge** - Badges de statut
- ✅ **Avatar** - Images de profil
- ✅ **Alert** - Messages d'alerte
- ✅ **Separator** - Séparateurs visuels
- ✅ **Skeleton** - Loaders de contenu
- ✅ **Tabs** - Onglets de navigation

### Overlay Components
- ✅ **Dialog** - Modales et dialogues
- ✅ **Popover** - Popovers et tooltips
- ✅ **Dropdown Menu** - Menus déroulants
- ✅ **Sheet** - Side panels
- ✅ **Toast** - Notifications toast
- ✅ **Toaster** - Container pour toasts

---

## 🎨 Configuration Tailwind

### Fichiers Configurés

#### `tailwind.config.ts`
- ✅ Dark mode activé (`darkMode: ['class']`)
- ✅ Variables CSS personnalisées (couleurs, radius, animations)
- ✅ Plugin tailwindcss-animate
- ✅ Container responsive

#### `app/globals.css`
- ✅ Variables CSS pour light/dark mode
- ✅ Transitions automatiques
- ✅ Base styles

#### `components.json`
- ✅ Configuration shadcn/ui
- ✅ Aliases de chemins
- ✅ Style: default
- ✅ Base color: slate
- ✅ CSS variables: true

---

## 💡 Utilisation

### Button

```tsx
import { Button } from "@/components/ui/button";

export function Example() {
  return (
    <>
      <Button>Default</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <IconTrash className="h-4 w-4" />
      </Button>
    </>
  );
}
```

### Form avec React Hook Form + Zod

```tsx
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});

export function LoginForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast({
      title: "Connexion réussie",
      description: `Bienvenue ${values.email}`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="vous@exemple.com" {...field} />
              </FormControl>
              <FormDescription>Votre adresse email</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Se connecter</Button>
      </form>
    </Form>
  );
}
```

### Card

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TicketCard({ ticket }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{ticket.event.title}</CardTitle>
        <CardDescription>{ticket.event.venue}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{ticket.price}€</p>
        <p className="text-sm text-muted-foreground">
          Section {ticket.section} - Rang {ticket.row}
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Acheter</Button>
      </CardFooter>
    </Card>
  );
}
```

### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Ouvrir</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Êtes-vous sûr ?</DialogTitle>
          <DialogDescription>
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Annuler</Button>
          <Button variant="destructive">Confirmer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Toast Notifications

```tsx
'use client';

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function ToastExample() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "Succès !",
          description: "Votre billet a été créé.",
        });
      }}
    >
      Afficher notification
    </Button>
  );
}

// Variants
toast({
  title: "Erreur",
  description: "Une erreur est survenue.",
  variant: "destructive",
});

toast({
  title: "Information",
  description: "Votre session expire dans 5 minutes.",
});
```

### Badge

```tsx
import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }) {
  const variants = {
    AVAILABLE: "default",
    SOLD: "secondary",
    RESERVED: "outline",
    CANCELLED: "destructive",
  };

  return (
    <Badge variant={variants[status]}>
      {status}
    </Badge>
  );
}
```

### Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProfileTabs() {
  return (
    <Tabs defaultValue="sales">
      <TabsList>
        <TabsTrigger value="sales">Mes ventes</TabsTrigger>
        <TabsTrigger value="purchases">Mes achats</TabsTrigger>
        <TabsTrigger value="profile">Profil</TabsTrigger>
      </TabsList>
      <TabsContent value="sales">
        <p>Liste de vos billets en vente</p>
      </TabsContent>
      <TabsContent value="purchases">
        <p>Liste de vos achats</p>
      </TabsContent>
      <TabsContent value="profile">
        <p>Informations de profil</p>
      </TabsContent>
    </Tabs>
  );
}
```

### Skeleton Loader

```tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function TicketSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[200px] mb-4" />
        <Skeleton className="h-8 w-[100px]" />
      </CardContent>
    </Card>
  );
}

// Utilisation
export function TicketList() {
  const { data, isLoading } = trpc.ticket.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <TicketSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {data?.tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
```

---

## 🎨 Couleurs et Thèmes

### Variables CSS Disponibles

```css
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--destructive
--destructive-foreground
--border
--input
--ring
--radius
```

### Utilisation dans Tailwind

```tsx
<div className="bg-background text-foreground">
  <div className="bg-card text-card-foreground">
    <p className="text-muted-foreground">Text muted</p>
  </div>
</div>
```

### Dark Mode

Le dark mode est géré automatiquement avec `prefers-color-scheme`.

Pour forcer un mode :

```tsx
// app/layout.tsx
<html lang="fr" className="dark"> {/* Force dark mode */}
```

---

## 🔧 Utilitaires

### cn() - Class Name Merger

```tsx
import { cn } from "@/lib/utils";

export function Example({ className }) {
  return (
    <div className={cn("bg-primary text-white p-4", className)}>
      Content
    </div>
  );
}
```

### Variants avec CVA

Les composants shadcn/ui utilisent `class-variance-authority` :

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

---

## 📱 Responsive Design

Tous les composants sont responsive par défaut.

### Breakpoints Tailwind

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 colonne, Tablet: 2 colonnes, Desktop: 3 colonnes */}
</div>
```

### Container

```tsx
<div className="container mx-auto px-4">
  {/* Content centré avec max-width: 1400px */}
</div>
```

---

## 🎯 Exemples Pratiques pour AVA

### Formulaire de Création de Billet

```tsx
// src/components/forms/CreateTicketForm.tsx
'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ticketSchema } from "@/lib/validations/ticket";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function CreateTicketForm({ eventId }) {
  const { toast } = useToast();
  const utils = trpc.useContext();
  
  const form = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      eventId,
      price: 0,
      section: "",
      row: "",
      seatNumber: "",
    },
  });

  const createTicket = trpc.ticket.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Billet créé !",
        description: "Votre billet est en attente de vérification.",
      });
      utils.ticket.getAll.invalidate();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createTicket.mutate(data))}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (€)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Autres champs... */}
          <Button type="submit" disabled={createTicket.isPending}>
            {createTicket.isPending ? "Création..." : "Créer le billet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Grille de Billets

```tsx
// src/components/tickets/TicketGrid.tsx
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function TicketGrid() {
  const { data, isLoading } = trpc.ticket.getAll.useQuery({ limit: 12 });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data?.tickets.map((ticket) => (
        <Card key={ticket.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{ticket.event.title}</CardTitle>
              <Badge>{ticket.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{ticket.price}€</p>
            <p className="text-sm text-muted-foreground">
              {ticket.section && `Section ${ticket.section}`}
              {ticket.row && ` • Rang ${ticket.row}`}
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Voir le billet</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

---

## 📚 Resources

### Documentation
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Radix UI:** https://www.radix-ui.com/primitives

### Icônes
- **Lucide React:** https://lucide.dev (installé)

### Outils
- **CVA:** https://cva.style/docs
- **Tailwind Merge:** https://github.com/dcastil/tailwind-merge

---

## ✅ Checklist Configuration

- [x] Tailwind CSS installé
- [x] shadcn/ui configuré
- [x] 19 composants UI installés
- [x] Toaster ajouté au layout
- [x] Dark mode configuré
- [x] Variables CSS personnalisées
- [x] Utilitaires (cn, cva)
- [x] Integration React Hook Form + Zod
- [x] Exemples créés

---

## 🚀 Prochaines Étapes

1. **Créer les pages** avec les composants UI
2. **Formulaires** de création de billets, inscription, etc.
3. **Dashboard** avec tabs et cards
4. **Notifications** avec toast
5. **Modales** de confirmation avec dialog

---

**Créé le:** 15 février 2026  
**Status:** 🟢 shadcn/ui Opérationnel  
**Prochaine étape:** Développer les pages du MVP avec les composants UI
