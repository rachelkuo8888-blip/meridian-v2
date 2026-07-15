'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heading, Text, Data } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import type { SubscriptionPlan } from '@/lib/billing/types'
import { PRICES, annualSavingsPercent, type PriceKey } from '@/lib/billing/prices'

export interface PricingFeature {
  label: string
  included?: boolean
  free?: boolean
  plus?: boolean
  pro?: boolean
}

export interface PricingCardProps {
  tier: SubscriptionPlan
  isAnnual: boolean
  isPopular?: boolean
  features: PricingFeature[]
  currentPlan?: SubscriptionPlan
  onCtaClick: (priceKey: PriceKey) => void
  loading?: boolean
  className?: string
}

const tierLabels: Record<SubscriptionPlan, { title: string; badge: string }> = {
  free: { title: 'Free', badge: 'Basic' },
  plus: { title: 'Plus', badge: 'Most Popular' },
  pro: { title: 'Pro', badge: 'Full Power' },
}

function getMonthlyPrice(tier: SubscriptionPlan): number {
  if (tier === 'free') return 0
  return tier === 'plus' ? PRICES.plus_monthly.amount : PRICES.pro_monthly.amount
}

function getYearlyPrice(tier: SubscriptionPlan): number {
  if (tier === 'free') return 0
  return tier === 'plus' ? PRICES.plus_yearly.amount : PRICES.pro_yearly.amount
}

function getPriceKey(tier: SubscriptionPlan, isAnnual: 'month' | 'year'): PriceKey {
  if (tier === 'plus') return isAnnual === 'year' ? 'plus_yearly' : 'plus_monthly'
  if (tier === 'pro') return isAnnual === 'year' ? 'pro_yearly' : 'pro_monthly'
  return 'plus_monthly' // fallback
}

export function PricingCard({
  tier,
  isAnnual,
  isPopular,
  features,
  currentPlan,
  onCtaClick,
  loading,
  className,
}: PricingCardProps) {
  const monthlyPrice = getMonthlyPrice(tier)
  const yearlyPrice = getYearlyPrice(tier)
  const isCurrentPlan = currentPlan === tier
  const savingsPercent = tier !== 'free' ? annualSavingsPercent(tier as 'plus' | 'pro') : 0

  function getCtaLabel(): string {
    if (isCurrentPlan && tier !== 'free') {
      return isAnnual ? 'Current Plan (Annual)' : 'Current Plan'
    }
    if (isCurrentPlan && tier === 'free') return 'Current Plan'
    if (tier === 'free') return 'Get Started'
    if (tier === 'plus') return 'Start 7-Day Free Trial'
    return 'Upgrade to Pro'
  }

  function getCtaVariant(): 'primary' | 'secondary' | 'gold' | 'outline' {
    if (isCurrentPlan) return 'outline'
    if (isPopular) return 'gold'
    if (tier === 'free') return 'outline'
    return 'primary'
  }

  return (
    <Card
      variant={isPopular ? 'ivory' : 'default'}
      padding="md"
      className={cn(
        'relative flex flex-col transition-shadow hover:shadow-md',
        isPopular && 'ring-1 ring-meridian-gold/30',
        className,
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <Badge variant="gold" className="px-4 py-1 text-xs font-medium">
            Most Popular
          </Badge>
        </div>
      )}

      <CardContent className="flex flex-1 flex-col">
        {/* Tier header */}
        <div className="mb-4 flex items-center justify-between">
          <Heading as="h3" variant="serif" className="text-xl">
            {tierLabels[tier].title}
          </Heading>
          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
            {tierLabels[tier].badge}
          </Badge>
        </div>

        {/* Price */}
        <div className="mb-1 flex items-baseline gap-1">
          {tier === 'free' ? (
            <Heading as="h4" variant="serif" className="text-4xl font-normal">
              $0
            </Heading>
          ) : isAnnual ? (
            <>
              <Heading as="h4" variant="serif" className="text-3xl font-bold">
                ${yearlyPrice}
              </Heading>
              <Data size="xs" className="text-meridian-dust">
                /yr
              </Data>
            </>
          ) : (
            <>
              <Heading as="h4" variant="serif" className="text-4xl font-bold">
                ${monthlyPrice}
              </Heading>
              <Data size="xs" className="text-meridian-dust">
                /mo
              </Data>
            </>
          )}
        </div>

        {/* Annual savings badge */}
        {tier !== 'free' && isAnnual && (
          <Badge variant="gold" className="mb-4 w-fit text-[10px]">
            Save {savingsPercent}%
          </Badge>
        )}

        {/* Annual equivalent */}
        {tier !== 'free' && !isAnnual && (
          <Text size="xs" muted className="mb-4">
            ${(yearlyPrice / 12).toFixed(2)}/mo billed annually
          </Text>
        )}

        {tier === 'free' && (
          <Text size="xs" muted className="mb-4">
            Always free
          </Text>
        )}

        <Separator variant="subtle" className="mb-4" />

        {/* Features list */}
        <ul className="mb-6 flex-1 space-y-2.5">
          {features.map((feature, index) => {
            // Determine if this feature is included for this tier
            const included =
              feature.included ??
              (tier === 'free' ? feature.free : tier === 'plus' ? feature.plus : feature.pro) ??
              false

            return (
              <li key={index} className="flex items-start gap-2">
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px]',
                    included
                      ? 'bg-meridian-gold/10 text-meridian-gold'
                      : 'bg-meridian-dust/10 text-meridian-dust',
                  )}
                >
                  {included ? '✓' : '—'}
                </span>
                <Text
                  size="sm"
                  className={cn(
                    'leading-5',
                    !included && 'text-meridian-dust line-through',
                  )}
                >
                  {feature.label}
                </Text>
              </li>
            )
          })}
        </ul>
      </CardContent>

      <CardFooter className="mt-auto">
        <Button
          variant={getCtaVariant()}
          fullWidth
          size="md"
          disabled={isCurrentPlan}
          loading={loading}
          onClick={() => {
            const interval = isAnnual ? 'year' : 'month'
            const key = getPriceKey(tier, interval)
            onCtaClick(key)
          }}
        >
          {getCtaLabel()}
        </Button>
      </CardFooter>
    </Card>
  )
}
