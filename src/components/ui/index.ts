// Design System — Meridian
//
// Usage:
//   import { Button, Card, Heading, Text } from '@/components/ui'
//
// Components follow the Meridian Brand Guide:
//   - Colors: Meridian Black #0D0D0D, Ivory #F7F5F0, Gold #C4A96B, Deep Navy #0E1117
//   - Typography: Serif (headings), Sans (body), Mono (data)
//   - KISS principles: simple, precise, no mysticism, maximum readability

export { Button, buttonVariants } from './button'
export type { ButtonProps } from './button'

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
} from './card'
export type { CardProps } from './card'

export { Badge, badgeVariants } from './badge'
export type { BadgeProps } from './badge'

export { Input, Label, inputVariants } from './input'
export type { InputProps } from './input'

export { Heading, Text, Data } from './typography'

export { Separator } from './separator'

export { Spinner } from './spinner'
