'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Heading, Text } from '@/components/ui/typography'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PricingCard, type PricingFeature } from '@/components/billing/pricing-card'
import { PlanComparison } from '@/components/billing/plan-comparison'
import { PRICES, type PriceKey } from '@/lib/billing/prices'
import type { SubscriptionPlan } from '@/lib/billing/types'

/** FAQ items for the accordion section */
const faqs = [
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes — you can cancel your subscription at any time. Your access continues until the end of the current billing period. No penalties, no hidden fees.',
  },
  {
    question: 'What happens after my free trial ends?',
    answer:
      'After your 7-day trial, you\'ll be charged the subscription price. If you don\'t want to continue, just cancel before the trial ends — no charge at all.',
  },
  {
    question: 'Is my credit card required for the trial?',
    answer:
      'No. You can experience the full Plus features for 7 days without entering any payment information. Your card is only added when you subscribe.',
  },
  {
    question: 'Can I switch between plans?',
    answer:
      'Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately, and downgrades apply at the end of your current billing period.',
  },
  {
    question: 'What if I need help or have a specific question?',
    answer:
      'We\'re here. Send us a message through the app, and someone on the team will get back to you within 24 hours during business days.',
  },
]

/** Feature definitions for three tiers */
const freeFeatures: PricingFeature[] = [
  { label: 'Daily Energy Score', free: true },
  { label: 'Mood Check-in', free: true },
  { label: 'Morning Briefing', free: true },
  { label: 'Companion Conversations', free: true, plus: true },
  { label: 'Birth Chart', free: true },
  { label: 'Trend Analysis', free: false },
  { label: 'All Learning Courses', free: false },
  { label: '30-Day Growth Report', free: false },
]

const plusFeatures: PricingFeature[] = [
  { label: 'Daily Energy Score', plus: true },
  { label: 'Mood Check-in', plus: true },
  { label: 'All Coach Rules & Notifications', plus: true },
  { label: 'Unlimited Companion Conversations', plus: true },
  { label: 'Birth Chart', plus: true },
  { label: 'Full Trend Analysis', plus: true },
  { label: 'All Learning Courses', plus: true },
  { label: '30 & 180-Day Growth Reports', plus: true },
]

const proFeatures: PricingFeature[] = [
  { label: 'Daily Energy Score', pro: true },
  { label: 'Mood Check-in', pro: true },
  { label: 'All Coach Rules (Higher Frequency)', pro: true },
  { label: 'Unlimited + Priority Companion', pro: true },
  { label: 'Birth Chart', pro: true },
  { label: 'Full Trend Analysis', pro: true },
  { label: 'All Courses + Expert Audio (Coming Soon)', pro: true },
  { label: '30, 180 & 365-Day Reports', pro: true },
  { label: 'Circle Multi-Profile (Coming Soon)', pro: true },
  { label: 'Voice Conversations (Coming Soon)', pro: true },
]

export default function PricingPage() {
  const router = useRouter()
  const [isAnnual, setIsAnnual] = React.useState(false)
  const [loadingPrice, setLoadingPrice] = React.useState<PriceKey | null>(null)

  async function handleCtaClick(priceKey: PriceKey) {
    setLoadingPrice(priceKey)

    // For free tier, just redirect
    if (priceKey === 'plus_monthly' || priceKey === 'plus_yearly') {
      // In production, this would call Stripe checkout and redirect
      // For MVP, navigate to a signup or checkout flow
      try {
        const res = await fetch('/api/billing/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: PRICES[priceKey].priceId,
            userId: 'user-placeholder', // In production, get from auth
          }),
        })
        const data = await res.json()

        if (data.sessionUrl) {
          window.location.href = data.sessionUrl
        } else {
          // Fallback — navigate to pricing success or register
          router.push('/pricing')
        }
      } catch {
        router.push('/pricing')
      }
    } else if (priceKey === 'pro_monthly' || priceKey === 'pro_yearly') {
      try {
        const res = await fetch('/api/billing/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            priceId: PRICES[priceKey].priceId,
            userId: 'user-placeholder',
          }),
        })
        const data = await res.json()

        if (data.sessionUrl) {
          window.location.href = data.sessionUrl
        } else {
          router.push('/pricing')
        }
      } catch {
        router.push('/pricing')
      }
    }

    setLoadingPrice(null)
  }

  // Track which loading state applies to which tier
  function isTierLoading(tier: SubscriptionPlan): boolean {
    if (tier === 'free') return false
    const interval = isAnnual ? 'year' : 'month'
    const key = `${tier}_${interval}` as PriceKey
    return loadingPrice === key
  }

  return (
    <main className="mx-auto min-h-screen px-4 pb-20 pt-12 md:px-6 md:pt-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <div className="mb-4 text-center">
          <Heading
            as="h1"
            variant="serif"
            tracking="wide"
            className="text-3xl font-light md:text-4xl"
          >
            Upgrade Your Practice
          </Heading>
          <Text muted className="mt-2 max-w-md mx-auto text-sm md:text-base">
            Go deeper with personalized insights, unlimited conversations, and
            tools to track your growth over time.
          </Text>
        </div>

        {/* Trial banner */}
        <Card variant="ivory" padding="sm" className="mx-auto mb-8 max-w-lg ring-1 ring-meridian-gold/20">
          <CardContent className="flex items-center justify-center gap-2 py-1">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-meridian-gold/10 text-[11px] text-meridian-gold">
              ✓
            </span>
            <Text size="sm" className="font-medium">
              7-day free trial &mdash; no credit card required
            </Text>
          </CardContent>
        </Card>

        {/* Billing toggle */}
        <div className="mb-10 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-meridian-dust/30 bg-meridian-ivory p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                !isAnnual
                  ? 'bg-meridian-black text-meridian-ivory'
                  : 'text-meridian-ink hover:text-meridian-black',
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium transition-colors',
                isAnnual
                  ? 'bg-meridian-black text-meridian-ivory'
                  : 'text-meridian-ink hover:text-meridian-black',
              )}
            >
              Annual{' '}
              <Badge variant="gold" className="ml-1 text-[9px]">
                Save ~45%
              </Badge>
            </button>
          </div>
        </div>

        {/* Pricing cards grid */}
        <div className="mb-16 grid gap-6 md:grid-cols-3 md:gap-4 lg:gap-6">
          {/* Free */}
          <PricingCard
            tier="free"
            isAnnual={false}
            features={freeFeatures}
            currentPlan="free"
            onCtaClick={() => router.push('/onboarding/welcome')}
          />

          {/* Plus — popular */}
          <PricingCard
            tier="plus"
            isAnnual={isAnnual}
            isPopular
            features={plusFeatures}
            onCtaClick={handleCtaClick}
            loading={isTierLoading('plus')}
          />

          {/* Pro */}
          <PricingCard
            tier="pro"
            isAnnual={isAnnual}
            features={proFeatures}
            onCtaClick={handleCtaClick}
            loading={isTierLoading('pro')}
          />
        </div>

        {/* Full comparison table */}
        <PlanComparison className="mb-16" />

        {/* FAQ Section */}
        <section className="mx-auto max-w-2xl">
          <Heading
            as="h2"
            variant="serif"
            tracking="wide"
            className="mb-8 text-center text-xl font-light md:text-2xl"
          >
            Frequently Asked Questions
          </Heading>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

/** Single FAQ accordion item */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Card variant="default" padding="sm" className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-1 py-2 text-left"
      >
        <Text size="sm" className="font-medium">
          {question}
        </Text>
        <span
          className={cn(
            'ml-2 shrink-0 text-meridian-dust transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
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
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <div className="px-1 pb-3">
          <Text size="sm" muted className="leading-relaxed">
            {answer}
          </Text>
        </div>
      )}
    </Card>
  )
}
