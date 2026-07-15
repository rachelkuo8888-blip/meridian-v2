'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heading, Text } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'

export interface PaywallOverlayProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  benefits: string[]
}

export function PaywallOverlay({
  isOpen,
  onClose,
  featureName,
  benefits,
}: PaywallOverlayProps) {
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  // Hydration guard — required for client-side rendering
  React.useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (!isOpen) return null

  function handleStartTrial() {
    setLoading(true)
    router.push('/pricing')
  }

  function handleViewAll() {
    setLoading(true)
    router.push('/pricing')
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Unlock ${featureName}`}
    >
      <Card
        variant="ivory"
        padding="lg"
        className="relative mx-auto w-full max-w-sm animate-page-in"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-meridian-dust transition-colors hover:bg-meridian-smoke hover:text-meridian-ink"
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>

        <CardContent className="flex flex-col items-center text-center">
          {/* Lock icon */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-meridian-gold/10">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-meridian-gold"
            >
              <rect x="5" y="11" width="18" height="11" rx="2" />
              <path d="M9 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="14" cy="17" r="1.5" fill="currentColor" />
            </svg>
          </div>

          {/* Title */}
          <Heading
            as="h3"
            variant="serif"
            className="mb-1 text-lg font-light md:text-xl"
          >
            Unlock {featureName}
          </Heading>

          <Text size="xs" muted className="mb-4 max-w-xs leading-relaxed">
            Upgrade to Meridian Plus and unlock the full picture.
          </Text>

          <Separator variant="subtle" className="mb-4" />

          {/* Benefits list */}
          <Text
            size="xs"
            muted
            className="mb-3 w-full text-left font-medium uppercase tracking-wider"
          >
            Plus includes:
          </Text>
          <ul className="mb-6 w-full space-y-2 text-left">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-meridian-gold/10 text-[10px] text-meridian-gold">
                  ✓
                </span>
                <Text size="sm">{benefit}</Text>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            variant="gold"
            size="lg"
            fullWidth
            loading={loading}
            onClick={handleStartTrial}
            className="mb-3"
          >
            Start 7-Day Free Trial
          </Button>

          <Button
            variant="link"
            size="sm"
            disabled={loading}
            onClick={handleViewAll}
          >
            View All Features &rarr;
          </Button>

          {/* Footer */}
          <Text
            size="xs"
            muted
            className="mt-4 text-center text-[10px] leading-relaxed"
          >
            No credit card required &middot; Cancel anytime
          </Text>
        </CardContent>
      </Card>
    </div>
  )
}
