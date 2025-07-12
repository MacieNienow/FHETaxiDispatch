import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'btn-base focus-ring',
  {
    variants: {
      variant: {
        default: 'btn-primary',
        destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:scale-105 active:scale-100',
        outline: 'btn-glass',
        secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/20 hover:shadow-gray-500/30 hover:scale-105 active:scale-100',
        ghost: 'btn-glass border-0 hover:bg-[var(--glass-hover)]',
        link: 'text-[var(--accent)] underline-offset-4 hover:underline bg-transparent border-0 p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="spinner" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
