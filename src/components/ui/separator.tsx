import * as React from 'react'
import { cn } from '@/lib/utils'

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'gold' | 'subtle'
}

const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className, orientation = 'horizontal', variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: 'border-meridian-dust/30',
      gold: 'border-meridian-gold/40',
      subtle: 'border-meridian-dust/10',
    }

    return (
      <hr
        ref={ref}
        className={cn(
          orientation === 'horizontal'
            ? 'h-px w-full border-t'
            : 'h-full w-px border-l',
          variantStyles[variant],
          className,
        )}
        {...props}
      />
    )
  },
)
Separator.displayName = 'Separator'

export { Separator }
