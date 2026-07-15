/**
 * Da Yun Timeline — 6.3: 大运周期 vertical timeline
 *
 * Vertical timeline with:
 * - Current Da Yun highlighted with Gold dot
 * - Previous Da Yun: Dust dots, smaller
 * - Upcoming Da Yun: arrow leading into it
 */

'use client'

import * as React from 'react'
import type { DaYunSegment } from './types'

interface DaYunTimelineProps {
  daYun: {
    direction: string
    start_age: number
    pillars: DaYunSegment[]
  }
  currentAge: number
}

function getCurrentDaYunIndex(pillars: DaYunSegment[], currentAge: number): number {
  return pillars.findIndex(
    (p) => currentAge >= p.start_age && currentAge < p.end_age,
  )
}

export function DaYunTimeline({ daYun, currentAge }: DaYunTimelineProps) {
  const { pillars } = daYun
  const currentIndex = getCurrentDaYunIndex(pillars, currentAge)

  if (!pillars || pillars.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="font-sans text-[8pt] font-bold tracking-[0.09em] uppercase text-meridian-black">
          大运周期
        </h3>
        <p className="font-sans text-[7pt] text-meridian-dust">
          No Da Yun data available
        </p>
      </div>
    )
  }

  // Show up to ~5 segments: current, 2 before, 2 after
  const start = Math.max(0, currentIndex - 2)
  const end = Math.min(pillars.length, currentIndex + 3)
  const visiblePillars = pillars.slice(start, end)

  return (
    <div className="space-y-3">
      <h3 className="font-sans text-[8pt] font-bold tracking-[0.09em] uppercase text-meridian-black">
        大运周期
      </h3>
      <div className="space-y-2">
        {visiblePillars.map((segment, idx) => {
          const globalIdx = start + idx
          const isCurrent = globalIdx === currentIndex
          const isPast = globalIdx < currentIndex
          const isFuture = globalIdx > currentIndex

          return (
            <div
              key={`${segment.start_age}-${segment.end_age}`}
              className={`flex items-center gap-3 rounded-sm px-3 py-2 ${
                isCurrent
                  ? 'bg-meridian-gold/[0.06] border-l-2 border-meridian-gold'
                  : ''
              }`}
            >
              {/* Dot */}
              <div className="flex-shrink-0">
                {isCurrent ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-meridian-gold" />
                ) : (
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isPast ? 'bg-meridian-dust/50' : 'bg-meridian-dust/30'
                    }`}
                  />
                )}
              </div>
              {/* Age range */}
              <span
                className={`font-mono text-[8pt] ${
                  isCurrent
                    ? 'text-meridian-black font-medium'
                    : 'text-meridian-dust'
                }`}
              >
                {segment.start_age}-{segment.end_age}
              </span>
              {/* Pillar stem/branch */}
              <span
                className={`ml-auto font-serif text-[10pt] ${
                  isCurrent
                    ? 'text-meridian-black font-medium'
                    : 'text-meridian-dust'
                }`}
              >
                {segment.stem}{segment.branch}
              </span>
              {/* Current badge */}
              {isCurrent && (
                <span className="font-sans text-[6pt] tracking-wider text-meridian-gold uppercase">
                  当前
                </span>
              )}
              {/* Future arrow */}
              {isFuture && idx === visiblePillars.length - 1 && (
                <span className="text-meridian-dust/50 ml-1">→</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
