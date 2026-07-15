/**
 * Elemental Composition — 6.2: 五行占比
 *
 * Horizontal gold-filled bars showing Five Element distribution.
 */

'use client'

import * as React from 'react'
import type { ElementDistribution } from './types'

interface ElementBarsProps {
  distribution: ElementDistribution
  dayMaster: string
  strength?: string
  usefulGod?: string
}

interface ElementInfo {
  key: string
  label: string
  color: string
  fraction: number
}

const ELEMENT_META: Record<string, { label: string; color: string; classicalColor: string }> = {
  wood: { label: '木', color: '#4A7C59', classicalColor: '#4A7C59' },
  fire: { label: '火', color: '#C4443B', classicalColor: '#C4443B' },
  earth: { label: '土', color: '#B8944A', classicalColor: '#B8944A' },
  metal: { label: '金', color: '#A0A0A0', classicalColor: '#A0A0A0' },
  water: { label: '水', color: '#3B6B8A', classicalColor: '#3B6B8A' },
}

const ORDER = ['wood', 'fire', 'earth', 'metal', 'water'] as const

export function ElementBars({ distribution, dayMaster, strength, usefulGod }: ElementBarsProps) {
  const elements: ElementInfo[] = ORDER.map((key) => {
    const meta = ELEMENT_META[key]
    const fraction = distribution[key] ?? 0
    return {
      key,
      label: meta.label,
      color: meta.classicalColor,
      fraction,
    }
  })

  const maxFraction = Math.max(...elements.map((e) => e.fraction), 0.01)

  // Determine which element corresponds to day master
  const dayMasterElement = (() => {
    const stemFirstChar = dayMaster.charAt(0)
    const woodStems = ['甲', '乙']
    const fireStems = ['丙', '丁']
    const earthStems = ['戊', '己']
    const metalStems = ['庚', '辛']
    const waterStems = ['壬', '癸']
    if (woodStems.includes(stemFirstChar)) return 'wood'
    if (fireStems.includes(stemFirstChar)) return 'fire'
    if (earthStems.includes(stemFirstChar)) return 'earth'
    if (metalStems.includes(stemFirstChar)) return 'metal'
    if (waterStems.includes(stemFirstChar)) return 'water'
    return null
  })()

  const insightParts: string[] = []
  insightParts.push(`日主${dayMaster}${ELEMENT_META[dayMasterElement ?? 'earth']?.label ?? ''}`)
  if (strength) insightParts.push(`${dayMaster}${ELEMENT_META[dayMasterElement ?? 'earth']?.label ?? ''}${strength}`)

  return (
    <div className="space-y-3">
      <h3 className="font-sans text-[8pt] font-bold tracking-[0.09em] uppercase text-meridian-black">
        五行分布
      </h3>
      <div className="space-y-2">
        {elements.map((el) => {
          const pct = Math.round(el.fraction * 100)
          const barWidth = Math.round((el.fraction / maxFraction) * 100)
          const isDayElement = el.key === dayMasterElement
          return (
            <div key={el.key} className="flex items-center gap-2">
              {/* Element label */}
              <span
                className="w-4 text-center font-sans text-[9pt] font-medium"
                style={{ color: el.color }}
              >
                {el.label}
              </span>
              {/* Bar track */}
              <div className="relative flex-1 h-1.5 rounded-full bg-meridian-dust/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: isDayElement ? el.color : el.color,
                    opacity: isDayElement ? 1 : 0.7,
                  }}
                />
                {/* "Now" indicator */}
                {isDayElement && (
                  <span className="absolute -top-3 right-0 font-mono text-[6pt] text-meridian-gold font-medium">
                    Now
                  </span>
                )}
              </div>
              {/* Percentage */}
              <span className="w-8 text-right font-mono text-[7pt] text-meridian-dust">
                {pct}%
              </span>
            </div>
          )
        })}
      </div>
      {/* Insight line */}
      <p className="font-sans text-[7pt] tracking-wide text-meridian-dust">
        {insightParts.join(' · ')}
        {usefulGod && <> · 喜{ELEMENT_META[usefulGod]?.label ?? usefulGod}</>}
      </p>
    </div>
  )
}
