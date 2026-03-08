import { cn } from '@/lib/utils/index';

interface BadgeCleanProps {
  variant?: 'default' | 'blue' | 'green' | 'red' | 'amber';
  children: React.ReactNode;
  className?: string;
}

export function BadgeClean({ variant = 'default', children, className }: BadgeCleanProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-clean-sm text-xs font-medium',
        variant === 'default' && 'bg-gray-100 text-gray-700',
        variant === 'blue'    && 'bg-blue-50 text-blue-700',
        variant === 'green'   && 'bg-emerald-50 text-emerald-700',
        variant === 'red'     && 'bg-red-50 text-red-700',
        variant === 'amber'   && 'bg-amber-50 text-amber-700',
        className
      )}
    >
      {children}
    </span>
  );
}
