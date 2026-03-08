import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, Check } from 'lucide-react';

import { cn } from '@/lib/utils/index';

const inputVariants = cva(
  'flex w-full rounded-clean border bg-white text-gray-900 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 focus-visible:border-blue-600 focus-visible:ring-blue-600',
        error:
          'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500 text-red-700',
        success:
          'border-emerald-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500',
      },
      inputSize: {
        default: 'h-10 px-3 py-2',
        sm: 'h-9 px-2.5 py-1.5 text-xs rounded-clean-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  success?: boolean;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      inputSize,
      leftIcon,
      rightIcon,
      error,
      success,
      helperText,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasSuccess = success && !hasError;

    // Déterminer la variante à utiliser
    const computedVariant = hasError
      ? 'error'
      : hasSuccess
        ? 'success'
        : variant;

    // Icône à droite (erreur ou succès prend la priorité)
    const rightElement = hasError ? (
      <AlertCircle className="h-4 w-4 text-destructive" />
    ) : hasSuccess ? (
      <Check className="h-4 w-4 text-success" />
    ) : (
      rightIcon
    );

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: computedVariant, inputSize }),
              leftIcon && 'pl-10',
              (rightIcon || hasError || hasSuccess) && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
