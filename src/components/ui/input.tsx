import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex w-full rounded-sm border bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-meridian-dust focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meridian-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-meridian-dust/50 text-meridian-black',
        ivory: 'border-meridian-dust/30 bg-meridian-ivory text-meridian-black',
        dark: 'border-charcoal bg-surface-dark text-meridian-ivory placeholder:text-meridian-dust/50',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
      hasError: {
        true: 'border-red-500 focus-visible:ring-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  hasError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, hasError, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size, hasError, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

/**
 * Label component that pairs with Input.
 */
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'mb-1 block text-sm font-medium text-meridian-ink',
      className,
    )}
    {...props}
  />
))
Label.displayName = 'Label'

export { Input, Label, inputVariants }
