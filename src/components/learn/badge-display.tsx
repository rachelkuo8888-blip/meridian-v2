'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { badges } from '@/data/learn-content'
import { useLearnStore } from '@/stores/learn'

/**
 * Horizontal scrolling display of achievement badges.
 */
export function BadgeDisplay() {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const earnedBadgeIds = useLearnStore((s) => s.getEarnedBadgeIds())

  if (!mounted) return null

  return (
    <div className="mt-6">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-meridian-dust">
        成就徽章
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {badges.map((badge) => {
          const earned = earnedBadgeIds.includes(badge.id)
          return (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-1 flex-shrink-0"
              title={badge.description}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm transition-all',
                  earned
                    ? 'bg-meridian-gold/20 text-meridian-gold ring-1 ring-meridian-gold/40'
                    : 'bg-meridian-dust/10 text-meridian-dust/60 ring-1 ring-meridian-dust/20',
                )}
              >
                {earned ? badge.icon : '?'}
              </div>
              <span
                className={cn(
                  'text-[9px] whitespace-nowrap',
                  earned ? 'text-meridian-black' : 'text-meridian-dust/60',
                )}
              >
                {badge.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
