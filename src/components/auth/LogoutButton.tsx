/**
 * Logout Button Component
 * Client component for user logout functionality
 */

'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  className?: string;
}

export function LogoutButton({
  variant = 'outline',
  size = 'default',
  showIcon = true,
  className,
}: LogoutButtonProps) {
  const { signOut } = useAuth();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={signOut}
      className={className}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      Se déconnecter
    </Button>
  );
}
