import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/index';

const badgeVariants = cva(
  'inline-flex items-center rounded-clean-sm border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-blue-600 text-white hover:bg-blue-700',
        secondary:
          'border-transparent bg-emerald-500 text-white hover:bg-emerald-600',
        destructive:
          'border-transparent bg-red-500 text-white hover:bg-red-600',
        outline:
          'border-gray-300 text-gray-700 bg-white',
        // Clean Tech variants
        blue:
          'border-blue-200 bg-blue-50 text-blue-700',
        green:
          'border-emerald-200 bg-emerald-50 text-emerald-700',
        red:
          'border-red-200 bg-red-50 text-red-700',
        amber:
          'border-amber-200 bg-amber-50 text-amber-700',
        gray:
          'border-gray-200 bg-gray-100 text-gray-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
