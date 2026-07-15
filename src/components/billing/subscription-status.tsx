'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Data } from '@/components/ui/typography'
import type { SubscriptionPlan, SubscriptionStatus } from '@/lib/billing/types'

export interface SubscriptionStatusProps {
  plan: SubscriptionPlan
  status: SubscriptionStatus
  customerId?: string
  trialEnd?: string
  currentPeriodEnd?: string
  className?: string
  onUpgrade?: () => void
}

const planBadgeVariant: Record<SubscriptionPlan, 'default' | 'gold' | 'outline'> = {
  free: 'outline',
  plus: 'gold',
  pro: 'default',
}

const planLabels: Record<SubscriptionPlan, string> = {
  free: 'Free',
  plus: 'Plus',
  pro: 'Pro',
}

export function SubscriptionStatus({
  plan,
  status,
  customerId,
  trialEnd,
  currentPeriodEnd,
  className,
  onUpgrade,
}: SubscriptionStatusProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)

  const isPaid = plan === 'plus' || plan === 'pro'
  const isTrialing = status === 'trialing'
  const isCanceled = status === 'canceled'

  async function handleManageSubscription() {
    if (!customerId) {
      router.push('/pricing')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/billing/portal?customerId=${encodeURIComponent(customerId)}`)
      const data = await res.json()

      if (data.portalUrl) {
        window.location.href = data.portalUrl
      } else {
        router.push('/pricing')
      }
    } catch {
      router.push('/pricing')
    } finally {
      setLoading(false)
    }
  }

  function handleUpgrade() {
    if (onUpgrade) {
      onUpgrade()
    } else {
      router.push('/pricing')
    }
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Plan badge */}
      <Badge variant={planBadgeVariant[plan]} className="text-[10px] uppercase tracking-wider">
        {planLabels[plan]}
        {isTrialing && ' Trial'}
      </Badge>

      {/* Status indicators */}
      <div className="hidden items-center gap-2 sm:flex">
        {isTrialing && trialEnd && (
          <Data size="xs" className="text-meridian-dust">
            Trial until {new Date(trialEnd).toLocaleDateString()}
          </Data>
        )}
        {isCanceled && (
          <Data size="xs" className="text-meridian-dust">
            Cancels {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString() : ''}
          </Data>
        )}
        {isPaid && currentPeriodEnd && !isCanceled && (
          <Data size="xs" className="text-meridian-dust">
            Renews {new Date(currentPeriodEnd).toLocaleDateString()}
          </Data>
        )}
      </div>

      {/* Action button */}
      {isPaid ? (
        <Button
          variant="ghost"
          size="sm"
          loading={loading}
          onClick={handleManageSubscription}
        >
          Manage
        </Button>
      ) : (
        <Button
          variant="gold"
          size="sm"
          loading={loading}
          onClick={handleUpgrade}
        >
          Upgrade
        </Button>
      )}
    </div>
  )
}
