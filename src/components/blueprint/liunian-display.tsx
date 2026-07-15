/**
 * Liu Nian Display — 6.3: Current year (流年)
 *
 * Shows the current year's pillar stem/branch with year label.
 */

'use client'

import * as React from 'react'

interface LiuNianDisplayProps {
  stem: string
  branch: string
  year: number
}

export function LiuNianDisplay({ stem, branch, year }: LiuNianDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-sans text-[7pt] tracking-wide text-meridian-dust">
        流年:
      </span>
      <span className="font-serif text-[11pt] font-medium text-meridian-gold">
        {stem}{branch}
      </span>
      <span className="font-mono text-[7pt] text-meridian-dust">
        ({year})
      </span>
    </div>
  )
}
