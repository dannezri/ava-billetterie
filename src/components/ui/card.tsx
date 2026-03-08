import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/index';

const cardVariants = cva(
  'rounded-clean border border-gray-200 bg-white text-gray-900 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'shadow-clean',
        elevated: 'shadow-clean-md hover:shadow-clean-lg',
        outline: 'border-2 border-gray-200',
        ghost: 'border-transparent shadow-none bg-gray-50',
      },
      padding: {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-clean-md hover:border-gray-300',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'none',
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, interactive }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    noPadding?: boolean;
    centerContent?: boolean;
  }
>(({ className, noPadding = false, centerContent = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5',
      !noPadding && 'p-6',
      centerContent && 'items-center text-center',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  }
>(({ className, as: Comp = 'h3', ...props }, ref) => (
  <Comp
    ref={ref as React.Ref<HTMLHeadingElement>}
    className={cn(
      'font-semibold leading-tight tracking-tight text-gray-900',
      Comp === 'h1' && 'text-4xl',
      Comp === 'h2' && 'text-3xl',
      Comp === 'h3' && 'text-2xl',
      Comp === 'h4' && 'text-xl',
      Comp === 'h5' && 'text-lg',
      Comp === 'h6' && 'text-base',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-500 leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    noPadding?: boolean;
  }
>(({ className, noPadding = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(!noPadding && 'p-6 pt-0', className)}
    {...props}
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    noPadding?: boolean;
    align?: 'start' | 'center' | 'end' | 'between';
  }
>(({ className, noPadding = false, align = 'start', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center',
      !noPadding && 'p-6 pt-0',
      align === 'start' && 'justify-start',
      align === 'center' && 'justify-center',
      align === 'end' && 'justify-end',
      align === 'between' && 'justify-between',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

const CardBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'absolute right-4 top-4 rounded-clean-sm px-2.5 py-0.5 text-xs font-medium',
      variant === 'success' && 'bg-emerald-50 text-emerald-700',
      variant === 'warning' && 'bg-amber-50 text-amber-700',
      variant === 'error' && 'bg-red-50 text-red-700',
      variant === 'info' && 'bg-blue-50 text-blue-700',
      variant === 'default' && 'bg-gray-100 text-gray-600',
      className
    )}
    {...props}
  />
));
CardBadge.displayName = 'CardBadge';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardBadge,
  cardVariants,
};
