/**
 * UI Components - Export centralisé
 * 
 * Facilite l'import des composants UI :
 * import { Button, Input, Card } from '@/components/ui';
 */

// Core Components
export { Button, buttonVariants, type ButtonProps } from './button';
export { Input, inputVariants, type InputProps } from './input';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardBadge,
  cardVariants,
  type CardProps,
} from './card';

// Form Components
export { Label } from './label';
export { Textarea } from './textarea';
export { Checkbox } from './checkbox';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';
export {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  useFormField,
} from './form';

// Display Components
export { Badge, badgeVariants } from './badge';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Skeleton } from './skeleton';
export { Separator } from './separator';

// Overlay Components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from './sheet';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu';
export { Popover, PopoverTrigger, PopoverContent } from './popover';

// Feedback Components
export { Toaster } from './toaster';
export { useToast, toast } from '../../hooks/use-toast';
export { Alert, AlertTitle, AlertDescription } from './alert';

// Navigation Components
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
