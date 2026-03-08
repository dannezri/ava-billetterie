import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils/index';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary — Trust Blue solid
        default:
          'bg-blue-600 text-white shadow-clean rounded-clean hover:bg-blue-700 hover:shadow-clean-hover active:scale-[0.98]',
        // Secondary — white outlined
        secondary:
          'bg-white border border-gray-300 text-gray-700 shadow-clean rounded-clean hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98]',
        // Destructive
        destructive:
          'bg-red-500 text-white shadow-clean rounded-clean hover:bg-red-600 active:scale-[0.98]',
        // Outline (alias to secondary for shadcn compat)
        outline:
          'bg-white border border-gray-300 text-gray-700 shadow-clean rounded-clean hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98]',
        // Ghost
        ghost: 'rounded-clean text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        // Link
        link: 'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700',
        // Success
        success:
          'bg-emerald-500 text-white shadow-clean rounded-clean hover:bg-emerald-600 active:scale-[0.98]',
        // Warning
        warning:
          'bg-amber-500 text-white shadow-clean rounded-clean hover:bg-amber-600 active:scale-[0.98]',
        // Info
        info:
          'bg-blue-50 text-blue-700 border border-blue-200 rounded-clean hover:bg-blue-100 active:scale-[0.98]',
        // Subtle
        subtle:
          'bg-gray-100 text-gray-700 rounded-clean hover:bg-gray-200 active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-5 py-2 text-sm',
        sm: 'h-8 px-4 py-1.5 text-xs rounded-clean-sm',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            {children}
          </>
        ) : (
          <>
            {leftIcon && leftIcon}
            {children}
            {rightIcon && rightIcon}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
