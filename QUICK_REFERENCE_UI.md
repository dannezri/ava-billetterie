# ⚡ shadcn/ui Quick Reference

## 🎨 Composants Installés (19)

### Core
```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Form } from "@/components/ui/form";
```

### Display
```tsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
```

### Overlay
```tsx
import { Dialog } from "@/components/ui/dialog";
import { Popover } from "@/components/ui/popover";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Sheet } from "@/components/ui/sheet";
import { Toast, Toaster } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
```

## 🚀 Usage Rapide

### Button Variants
```tsx
<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Toast
```tsx
const { toast } = useToast();

toast({
  title: "Success!",
  description: "Operation completed.",
});
```

### Form avec Validation
```tsx
const form = useForm({
  resolver: zodResolver(schema),
});

<Form {...form}>
  <FormField
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

## 📚 Documentation Complète

→ `SHADCN_UI_GUIDE.md`

**Créé le:** 15 février 2026
