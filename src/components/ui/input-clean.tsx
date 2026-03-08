import { cn } from '@/lib/utils/index';
import { InputHTMLAttributes, forwardRef } from 'react';

export const InputClean = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 border border-gray-300 rounded-clean bg-white',
          'text-gray-900 placeholder:text-gray-400 text-sm',
          'focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600',
          'transition-all duration-200',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);
InputClean.displayName = 'InputClean';
