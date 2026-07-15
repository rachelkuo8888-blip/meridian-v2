import * as React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'gold' | 'ivory' | 'dark'
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
}

const variantMap = {
  default: 'border-meridian-dust/20 border-t-meridian-black',
  gold: 'border-meridian-gold/20 border-t-meridian-gold',
  ivory: 'border-meridian-ivory/20 border-t-meridian-ivory',
  dark: 'border-meridian-dust/20 border-t-meridian-black',
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full',
          sizeMap[size],
          variantMap[variant],
          className,
        )}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    )
  },
)
Spinner.displayName = 'Spinner'

export { Spinner }
