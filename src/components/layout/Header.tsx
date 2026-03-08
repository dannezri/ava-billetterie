/**
 * Header Component with Authentication
 * Mobile-first responsive navigation avec SpaceSwitcher contextuel
 */

'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useCurrentSpace } from '@/hooks/useCurrentSpace';
import { cn } from '@/lib/utils';
import {
    Bell,
    Heart,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    ShoppingBag,
    Ticket,
    User,
} from 'lucide-react';
import { CartIcon } from '@/components/cart/CartIcon';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { SpaceSwitcher } from '@/components/layout/SpaceSwitcher';
import { TestUserSwitcher } from '@/components/dev/TestUserSwitcher';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/events', label: 'Événements' },
  { href: '/how-it-works', label: 'Comment ça marche' },
  { href: '/about', label: 'À propos' },
];

export function Header() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentSpace = useCurrentSpace();

  const getInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isAuthenticated = currentSpace.space === 'buyer' || currentSpace.space === 'seller';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="container flex h-16 items-center justify-between">
        {/* Gauche : SpaceSwitcher (si auth) + Logo */}
        <div className="flex items-center gap-2 md:gap-4">
          {user && <SpaceSwitcher />}

          <Link
            href="/"
            className="flex items-center space-x-2 no-underline"
            onClick={closeMobileMenu}
          >
            <Ticket className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">AVA</span>
          </Link>

          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6 ml-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors no-underline',
                    pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Switcher de profil test (visible uniquement si NEXT_PUBLIC_TEST_USER_SWITCHER=true) */}
          {process.env.NEXT_PUBLIC_TEST_USER_SWITCHER === 'true' && (
            <TestUserSwitcher currentEmail={user?.email} />
          )}
          <CartIcon />
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
                <Link href="/sell-ticket">Vendre un billet</Link>
              </Button>

              <NotificationBell />

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
                    <Link href="/my-purchases">
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
                  <DropdownMenuItem asChild>
                    <Link href="/notifications">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Notifications</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
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
          {user && isAuthenticated && <SpaceSwitcher />}
          <CartIcon />
          {user && <NotificationBell />}
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
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-clean border border-gray-200">
                      <Avatar>
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {getInitials(user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.user_metadata?.name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Navigation Links */}
                <nav className="flex flex-col gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={cn(
                        'flex items-center px-4 py-3 text-sm font-medium rounded-clean transition-colors no-underline',
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
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
                      {[
                        { href: '/sell-ticket', label: 'Vendre un billet', icon: Ticket },
                        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { href: '/profile', label: 'Mon profil', icon: User },
                        { href: '/my-purchases', label: 'Mes achats', icon: ShoppingBag },
                        { href: '/favorites', label: 'Favoris', icon: Heart },
                        { href: '/notifications', label: 'Notifications', icon: Bell },
                        { href: '/profile', label: 'Paramètres', icon: Settings },
                      ].map(({ href, label, icon: Icon }) => (
                        <Link
                          key={`${href}-${label}`}
                          href={href}
                          onClick={closeMobileMenu}
                          className="flex items-center px-4 py-3 text-sm font-medium rounded-clean text-gray-700 hover:bg-gray-100 no-underline transition-colors"
                        >
                          <Icon className="mr-3 h-4 w-4 text-gray-400" />
                          {label}
                        </Link>
                      ))}
                    </div>
                    <Separator />
                    {/* Switcher de profil test (mobile) */}
                    {process.env.NEXT_PUBLIC_TEST_USER_SWITCHER === 'true' && (
                      <div className="px-4 py-2">
                        <p className="text-xs text-orange-500 font-bold uppercase tracking-wide mb-2">
                          Test — Changer de profil
                        </p>
                        <TestUserSwitcher currentEmail={user?.email} />
                      </div>
                    )}
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
