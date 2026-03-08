import { cn } from '@/lib/utils/index';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonCleanProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const ButtonClean = forwardRef<HTMLButtonElement, ButtonCleanProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'rounded-clean transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',

          variant === 'primary' && [
            'bg-blue-600 text-white shadow-clean',
            'hover:bg-blue-700 hover:shadow-clean-hover',
            'focus:ring-blue-500',
          ],
          variant === 'secondary' && [
            'bg-white border border-gray-300 text-gray-700 shadow-clean',
            'hover:bg-gray-50 hover:border-gray-400',
            'focus:ring-gray-400',
          ],
          variant === 'ghost' && [
            'text-gray-700',
            'hover:bg-gray-100 hover:text-gray-900',
            'focus:ring-gray-400',
          ],

          size === 'sm' && 'px-4 py-2 text-sm',
          size === 'md' && 'px-6 py-2.5 text-sm',
          size === 'lg' && 'px-8 py-3 text-base',

          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ButtonClean.displayName = 'ButtonClean';
