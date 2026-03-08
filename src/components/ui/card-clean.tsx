import { cn } from '@/lib/utils/index';
import { HTMLAttributes, forwardRef } from 'react';

export const CardClean = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border border-gray-200 rounded-clean shadow-clean',
          'transition-all duration-200',
          'hover:shadow-clean-md hover:border-gray-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardClean.displayName = 'CardClean';
