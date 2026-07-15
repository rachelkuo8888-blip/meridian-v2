'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Heading, Text, Data } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { PRICES } from '@/lib/billing/prices'

interface FeatureRow {
  category: string
  features: {
    label: string
    free: boolean | string
    plus: boolean | string
    pro: boolean | string
  }[]
}

const featureRows: FeatureRow[] = [
  {
    category: 'Daily Check-in',
    features: [
      { label: 'Daily Energy Score', free: true, plus: true, pro: true },
      { label: 'Mood Check-in', free: true, plus: true, pro: true },
      { label: 'Check-in Streak', free: true, plus: true, pro: true },
    ],
  },
  {
    category: 'Coach & Companion',
    features: [
      { label: 'Morning Briefing', free: true, plus: true, pro: true },
      { label: 'All Coach Rules', free: false, plus: true, pro: true },
      { label: 'Companion Conversations', free: '3/day', plus: 'Unlimited', pro: 'Unlimited + Priority' },
    ],
  },
  {
    category: 'Blueprint & Analytics',
    features: [
      { label: 'Birth Chart', free: true, plus: true, pro: true },
      { label: 'Trend Analysis', free: false, plus: true, pro: true },
      { label: '30-Day Growth Report', free: false, plus: true, pro: true },
      { label: '180/365-Day Report', free: false, plus: true, pro: true },
    ],
  },
  {
    category: 'Learning',
    features: [
      { label: 'Courses', free: 'Lesson 1', plus: 'All', pro: 'All + Expert Audio' },
      { label: 'Discover Content', free: true, plus: true, pro: true },
    ],
  },
  {
    category: 'Advanced',
    features: [
      { label: 'Data Export', free: true, plus: true, pro: true },
      { label: 'Circle Multi-Profile', free: false, plus: false, pro: true },
      { label: 'Voice Conversations', free: false, plus: false, pro: true },
    ],
  },
]

const tiers = ['free', 'plus', 'pro'] as const

export function PlanComparison({ className }: { className?: string }) {
  return (
    <div className={cn('w-full', className)}>
      {/* Header row */}
      <div className="mb-6 grid grid-cols-[1fr_80px_80px_80px] gap-2 md:grid-cols-[1fr_120px_120px_120px]">
        <Heading as="h3" variant="serif" className="text-base md:text-lg">
          Full Feature Comparison
        </Heading>
        {tiers.map((tier) => (
          <div key={tier} className="text-center">
            <Heading
              as="h4"
              variant="sans"
              uppercase
              className="text-[10px] tracking-widest md:text-xs"
            >
              {tier === 'free' ? 'Free' : tier === 'plus' ? 'Plus' : 'Pro'}
            </Heading>
          </div>
        ))}
      </div>

      {/* Feature rows by category */}
      {featureRows.map((section, si) => (
        <div key={si} className="mb-6">
          <Text
            size="xs"
            muted
            className="mb-3 font-medium uppercase tracking-wider"
          >
            {section.category}
          </Text>

          {section.features.map((feature, fi) => (
            <div
              key={fi}
              className="grid grid-cols-[1fr_80px_80px_80px] gap-2 border-b border-meridian-dust/10 py-3 md:grid-cols-[1fr_120px_120px_120px]"
            >
              <Text size="sm" className="self-center">
                {feature.label}
              </Text>
              {tiers.map((tier) => {
                const val = feature[tier]
                return (
                  <div
                    key={tier}
                    className="flex items-center justify-center"
                  >
                    {typeof val === 'boolean' ? (
                      <span
                        className={cn(
                          'inline-flex h-5 w-5 items-center justify-center rounded-full text-xs',
                          val
                            ? 'bg-meridian-gold/10 text-meridian-gold'
                            : 'bg-meridian-dust/10 text-meridian-dust',
                        )}
                      >
                        {val ? '✓' : '—'}
                      </span>
                    ) : (
                      <Data size="xs" className="text-center">
                        {val}
                      </Data>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      ))}

      <Separator className="my-6" />

      {/* Price summary */}
      <div className="grid grid-cols-3 gap-4 text-center">
        {tiers.map((tier, i) => (
          <div key={tier}>
            <Text size="xs" muted className="mb-1">
              {i === 0 ? 'Always Free' : 'Monthly'}
            </Text>
            <Heading as="h4" variant="serif" className="text-lg">
              {i === 0 ? '$0' : i === 1 ? `$${PRICES.plus_monthly.amount}` : `$${PRICES.pro_monthly.amount}`}
            </Heading>
            <Text size="xs" muted>
              {i === 0 ? '' : `or $${i === 1 ? PRICES.plus_yearly.amount : PRICES.pro_yearly.amount}/yr`}
            </Text>
          </div>
        ))}
      </div>
    </div>
  )
}
