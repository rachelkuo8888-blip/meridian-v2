'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Data } from '@/components/ui/typography'
import { CATEGORY_COLORS } from '@/lib/discover-content'
import type { Article } from '@/lib/discover-content'

interface ArticleCardProps {
  article: Article
  className?: string
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  const badgeColor = CATEGORY_COLORS[article.category] ?? '#C4A96B'

  return (
    <Link href={`/discover/${article.slug}`} className="block">
      <Card
        variant="ivory"
        padding="sm"
        className={cn(
          'group flex h-full flex-col transition-shadow hover:shadow-sm',
          className,
        )}
      >
        {/* Icon placeholder */}
        <div
          className="mb-2 flex h-14 w-full items-center justify-center rounded-sm"
          style={{ backgroundColor: `${badgeColor}15` }}
        >
          <span className="text-lg" style={{ color: badgeColor }}>
            ◆
          </span>
        </div>

        {/* Category badge */}
        <span
          className="mb-1 inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-medium leading-tight"
          style={{
            backgroundColor: `${badgeColor}20`,
            color: badgeColor,
          }}
        >
          {article.category}
        </span>

        {/* Title */}
        <h3 className="font-serif text-[11px] font-medium leading-snug tracking-wide text-meridian-black">
          {article.title}
        </h3>

        {/* Read time */}
        <Data size="xs" className="mt-auto pt-1.5 text-meridian-dust">
          {article.readTime}min
        </Data>
      </Card>
    </Link>
  )
}
