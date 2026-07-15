import * as React from 'react'
import { cn } from '@/lib/utils'

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4'

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: HeadingLevel
  variant?: 'serif' | 'sans' | 'mono'
  tracking?: 'tight' | 'normal' | 'wide' | 'wider'
  uppercase?: boolean
}

const headingStyles: Record<HeadingLevel, string> = {
  h1: 'text-4xl md:text-5xl lg:text-6xl leading-tight',
  h2: 'text-3xl md:text-4xl leading-snug',
  h3: 'text-2xl md:text-3xl leading-snug',
  h4: 'text-xl md:text-2xl leading-snug',
}

const fontFamilies = {
  serif: 'font-serif',
  sans: 'font-sans',
  mono: 'font-mono',
}

const letterSpacing = {
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
}

/**
 * Heading component — serif by default (Meridian brand style).
 */
function Heading({
  as: Tag = 'h2',
  variant = 'serif',
  tracking = 'normal',
  uppercase = false,
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Tag
      className={cn(
        headingStyles[Tag],
        fontFamilies[variant],
        letterSpacing[tracking],
        uppercase && 'uppercase',
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
Heading.displayName = 'Heading'

/**
 * Body text component — sans-serif by default.
 */
const Text = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    variant?: 'serif' | 'sans' | 'mono'
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
    muted?: boolean
  }
>(({ className, variant = 'sans', size = 'base', muted, children, ...props }, ref) => {
  const sizeStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg leading-relaxed',
    xl: 'text-xl leading-relaxed',
  }

  return (
    <p
      ref={ref}
      className={cn(
        fontFamilies[variant],
        sizeStyles[size],
        muted && 'text-meridian-dust',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  )
})
Text.displayName = 'Text'

/**
 * Inline code / data text — monospace.
 */
const Data = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { size?: 'xs' | 'sm' | 'base' }
>(({ className, size = 'sm', children, ...props }, ref) => {
  const sizeStyles = { xs: 'text-xs', sm: 'text-sm', base: 'text-base' }
  return (
    <span
      ref={ref}
      className={cn('font-mono', sizeStyles[size], className)}
      {...props}
    >
      {children}
    </span>
  )
})
Data.displayName = 'Data'

export { Heading, Text, Data }
