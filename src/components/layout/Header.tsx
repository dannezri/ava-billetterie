/**
 * Header Component with Authentication
 * Mobile-first responsive navigation
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  User,
  LogOut,
  LayoutDashboard,
  Ticket,
  Menu,
  Settings,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/events', label: 'Événements' },
  { href: '/how-it-works', label: 'Comment ça marche' },
  { href: '/about', label: 'À propos' },
];

export function Header() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-8">
          <Link
            href="/"
            className="flex items-center space-x-2"
            onClick={closeMobileMenu}
          >
            <Ticket className="h-6 w-6" />
            <span className="font-bold text-xl">AVA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? (
            <Skeleton className="h-10 w-24" />
          ) : user ? (
            <>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden lg:flex"
              >
                <Link href="/tickets/create">Vendre un billet</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.name || 'Utilisateur'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tickets/my-tickets">
                      <Ticket className="mr-2 h-4 w-4" />
                      <span>Mes billets</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/purchases">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>Mes achats</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favoris</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={signOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Créer un compte</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(user.email || 'U')}
              </AvatarFallback>
            </Avatar>
          )}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-4 mt-8">
                {/* User Info (if logged in) */}
                {user && (
                  <>
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.user_metadata?.name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={cn(
                        'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                        pathname === item.href
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {user ? (
                  <>
                    <Separator />
                    {/* User Actions */}
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/tickets/create"
                        onClick={closeMobileMenu}
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted"
                      >
                        <Ticket className="mr-3 h-4 w-4" />
                        Vendre un billet
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={closeMobileMenu}
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted"
                      >
                        <LayoutDashboard className="mr-3 h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={closeMobileMenu}
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted"
                      >
                        <User className="mr-3 h-4 w-4" />
                        Mon profil
                      </Link>
                      <Link
                        href="/profile/settings"
                        onClick={closeMobileMenu}
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Paramètres
                      </Link>
                      <Link
                        href="/tickets/my-tickets"
                        onClick={closeMobileMenu}
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted"
                      >
                        <Ticket className="mr-3 h-4 w-4" />
                        Mes billets
                      </Link>
                      <Link
                        href="/purchases"
                        onClick={closeMobileMenu}
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted"
                      >
                        <ShoppingBag className="mr-3 h-4 w-4" />
                        Mes achats
                      </Link>
                      <Link
                        href="/favorites"
                        onClick={closeMobileMenu}
                        className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted"
                      >
                        <Heart className="mr-3 h-4 w-4" />
                        Favoris
                      </Link>
                    </div>
                    <Separator />
                    <Button
                      variant="ghost"
                      className="justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        signOut();
                        closeMobileMenu();
                      }}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Se déconnecter
                    </Button>
                  </>
                ) : (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-2">
                      <Button asChild onClick={closeMobileMenu}>
                        <Link href="/signup">Créer un compte</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        onClick={closeMobileMenu}
                      >
                        <Link href="/login">Se connecter</Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
