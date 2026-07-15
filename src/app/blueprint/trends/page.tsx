/**
 * Trends & Analytics Page — 6.4
 *
 * Shows:
 * - Energy curve (7-day SVG line chart)
 * - Latest check-in mood
 * - 30-day heatmap grid
 * - Insight line
 */

'use client'

import * as React from 'react'
import { EnergyCurve } from '@/components/blueprint/energy-curve'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

// Mock mood data for heatmap (30 days)
const MOCK_MOODS: { score: number | null; label: string }[] = Array.from(
  { length: 30 },
  (_, i) => {
    // More recent days have data
    if (i < 4) return { score: null, label: '' }
    const scores = [3, 4, 2, 5, 3, 4, 4, 5, 3, 2, 5, 5, 4, 3, 4, 5, 2, 3, 4, 4, 5, 3, 4, 5, 5, 4]
    return {
      score: scores[i - 4] ?? null,
      label: '',
    }
  },
)

const MOOD_COLORS: Record<number, string> = {
  1: '#C4443B',
  2: '#B8944A',
  3: '#A0A0A0',
  4: '#4A7C59',
  5: '#3B6B8A',
}

function getMoodColor(score: number | null): string {
  if (score === null) return '#E8E6E1'
  return MOOD_COLORS[score] ?? '#E8E6E1'
}

const recordedDays = MOCK_MOODS.filter((m) => m.score !== null).length

export default function TrendsPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-6 animate-page-in">
      <div className="mb-6">
        <a
          href="/blueprint"
          className="font-sans text-[7pt] tracking-wide text-meridian-dust hover:text-meridian-gold transition-colors"
        >
          ← Blueprint
        </a>
        <h1 className="mt-1 font-serif text-lg tracking-wide text-meridian-black">
          Trends & Analytics
        </h1>
      </div>

      {/* Energy Curve */}
      <Card variant="ivory" padding="md" className="mb-4">
        <EnergyCurve />
      </Card>

      <Separator className="my-4" variant="subtle" />

      {/* Latest Check-in */}
      <Card variant="ivory" padding="md" className="mb-4">
        <h3 className="font-sans text-[8pt] font-bold tracking-[0.09em] uppercase text-meridian-black">
          今日打卡
        </h3>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[18pt]">😊</span>
          <div>
            <p className="font-sans text-[9pt] font-medium text-meridian-black">
              平静
            </p>
            <p className="font-sans text-[7pt] text-meridian-dust">
              A calm and focused day.
            </p>
          </div>
        </div>
      </Card>

      {/* Heatmap */}
      <Card variant="ivory" padding="md" className="mb-4">
        <h3 className="font-sans text-[8pt] font-bold tracking-[0.09em] uppercase text-meridian-black">
          Check-in Heatmap
        </h3>
        <div className="mt-3">
          <div className="grid grid-cols-5 gap-1.5">
            {MOCK_MOODS.map((mood, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm"
                style={{ backgroundColor: getMoodColor(mood.score) }}
                title={
                  mood.score !== null
                    ? `Day ${i + 1}: ${mood.score}/5`
                    : 'No data'
                }
              />
            ))}
          </div>
        </div>
        {/* Insight line */}
        <p className="mt-4 font-sans text-[7pt] tracking-wide text-meridian-dust">
          这30天你记录了{recordedDays}天
        </p>
      </Card>
    </div>
  )
}
