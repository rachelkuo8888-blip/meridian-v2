'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/discover-content'

interface CategoryTabsProps {
  active: string
  onSelect: (category: string) => void
  className?: string
}

const ALL_LABEL = '全部'

export function CategoryTabs({
  active,
  onSelect,
  className,
}: CategoryTabsProps) {
  const tabs = [ALL_LABEL, ...CATEGORIES]

  return (
    <div
      className={cn(
        'no-scrollbar flex gap-4 overflow-x-auto whitespace-nowrap border-b border-meridian-dust/20 pb-2',
        className,
      )}
    >
      {tabs.map((cat) => {
        const isActive = active === cat
        const color = cat === ALL_LABEL ? '#C4A96B' : CATEGORY_COLORS[cat]

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={cn(
              'inline-flex items-center gap-1.5 pb-1 text-xs font-medium transition-colors',
              isActive
                ? 'border-b-2 text-meridian-black'
                : 'text-meridian-dust hover:text-meridian-ink',
            )}
            style={
              isActive
                ? { borderBottomColor: color, color: color }
                : undefined
            }
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
