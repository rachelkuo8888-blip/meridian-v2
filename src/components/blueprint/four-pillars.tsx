/**
 * Four Pillars Display — 6.1 Natal Chart Visualization (四柱命盘)
 *
 * Shows the year/month/day/hour pillars with:
 * - Stem (big, bold) on top, Branch (smaller, muted) below
 * - Day pillar highlighted with gold left border
 * - Animal zodiac suffix on each branch
 */

'use client'

import * as React from 'react'
import type { PillarsObject } from './types'

const BRANCH_ZODIAC: Record<string, string> = {
  子: '鼠',
  丑: '牛',
  寅: '虎',
  卯: '兔',
  辰: '龙',
  巳: '蛇',
  午: '马',
  未: '羊',
  申: '猴',
  酉: '鸡',
  戌: '狗',
  亥: '猪',
}

const STEM_ELEMENT_MAP: Record<string, string> = {
  甲: 'wood',
  乙: 'wood',
  丙: 'fire',
  丁: 'fire',
  戊: 'earth',
  己: 'earth',
  庚: 'metal',
  辛: 'metal',
  壬: 'water',
  癸: 'water',
}

const STEM_COLORS: Record<string, string> = {
  wood: '#4A7C59',
  fire: '#C4443B',
  earth: '#B8944A',
  metal: '#A0A0A0',
  water: '#3B6B8A',
}

function getStemColor(stem: string): string {
  const elem = STEM_ELEMENT_MAP[stem] ?? 'earth'
  return STEM_COLORS[elem]
}

const PILLAR_LABELS = ['年柱', '月柱', '日柱', '时柱']

interface FourPillarsProps {
  pillars: PillarsObject
  dayMaster: string
  strength?: string
  usefulGod?: string
}

export function FourPillars({
  pillars,
  dayMaster,
  strength,
  usefulGod,
}: FourPillarsProps) {
  const pillarKeys = ['year', 'month', 'day', 'hour'] as const
  const stems = pillarKeys.map((k) => pillars[k].stem)
  const branches = pillarKeys.map((k) => pillars[k].branch)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-lg tracking-wide text-meridian-black">
          Blueprint
        </h1>
        <button
          type="button"
          className="text-meridian-dust transition-colors hover:text-meridian-gold"
          aria-label="Settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Four Pillars Grid */}
      <div className="grid grid-cols-4 gap-[1px] overflow-hidden rounded-sm border border-meridian-dust/30">
        {/* Labels Row */}
        {PILLAR_LABELS.map((label, i) => (
          <div
            key={label}
            className={`bg-meridian-dust/10 px-2 py-1 text-center font-sans text-[6pt] uppercase tracking-widest text-meridian-dust ${
              i === 2 ? 'bg-meridian-gold/10' : ''
            }`}
          >
            {label}
          </div>
        ))}

        {/* Stems Row */}
        {stems.map((stem, i) => (
          <div
            key={`stem-${i}`}
            className={`flex items-center justify-center px-2 pt-3 pb-0 ${
              i === 2
                ? 'border-l-2 border-meridian-gold bg-meridian-gold/[0.04]'
                : 'bg-meridian-ivory'
            }`}
          >
            <span
              className="font-serif text-[24pt] font-bold leading-none"
              style={{ color: getStemColor(stem) }}
            >
              {stem}
            </span>
          </div>
        ))}

        {/* Branches Row */}
        {branches.map((branch, i) => (
          <div
            key={`branch-${i}`}
            className={`flex flex-col items-center justify-center px-2 pt-1 pb-3 ${
              i === 2
                ? 'border-l-2 border-meridian-gold bg-meridian-gold/[0.04]'
                : 'bg-meridian-ivory'
            }`}
          >
            <span className="font-serif text-[16pt] leading-tight text-meridian-dust">
              {branch}
            </span>
            <span className="font-sans text-[6pt] tracking-wider text-meridian-dust/60">
              {BRANCH_ZODIAC[branch] ?? ''}
            </span>
          </div>
        ))}
      </div>

      {/* Day Master + Strength */}
      <div className="space-y-1 text-center">
        <p className="font-sans text-[8pt] font-medium tracking-wide text-meridian-black">
          日主: <span className="font-serif font-bold">{dayMaster}</span>金
        </p>
        {(strength || usefulGod) && (
          <p className="font-sans text-[7pt] tracking-wide text-meridian-dust">
            {strength && `身${strength}`}
            {strength && usefulGod && ' · '}
            {usefulGod && <>用神: <span className="text-meridian-gold">{usefulGod}</span></>}
          </p>
        )}
      </div>
    </div>
  )
}
