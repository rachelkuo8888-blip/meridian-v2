'use client'

import * as React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Data, Text } from '@/components/ui/typography'
import { CATEGORY_COLORS } from '@/lib/discover-content'
import type { Article } from '@/lib/discover-content'

interface FeaturedArticleProps {
  article: Article
  className?: string
}

export function FeaturedArticle({ article, className }: FeaturedArticleProps) {
  const badgeColor = CATEGORY_COLORS[article.category] ?? '#C4A96B'

  return (
    <Link href={`/discover/${article.slug}`} className="block">
      <Card
        variant="navy"
        padding="md"
        className={cn(
          'group cursor-pointer transition-shadow hover:shadow-md',
          className,
        )}
      >
        {/* Category badge */}
        <span
          className="mb-3 inline-block rounded-sm px-2 py-0.5 text-[10px] font-medium leading-tight"
          style={{
            backgroundColor: `${badgeColor}25`,
            color: badgeColor,
          }}
        >
          {article.category}
        </span>

        {/* Icon placeholder */}
        <div
          className="mb-3 flex h-20 w-full items-center justify-center rounded-sm opacity-50"
          style={{ backgroundColor: `${badgeColor}10` }}
        >
          <span className="text-2xl" style={{ color: badgeColor }}>
            ◆
          </span>
        </div>

        {/* Title */}
        <h2 className="mb-1 font-serif text-[16px] font-light leading-snug tracking-wide text-meridian-ivory">
          {article.title}
        </h2>

        {/* Excerpt */}
        <Text
          variant="sans"
          size="xs"
          muted
          className="mb-2 line-clamp-2 text-meridian-dust/80"
        >
          {article.excerpt}
        </Text>

        {/* Meta */}
        <div className="flex items-center gap-3">
          <Data size="xs" className="text-meridian-dust">
            {article.readTime} min read
          </Data>
          <span className="text-[6px] text-meridian-dust">·</span>
          <Data size="xs" className="text-meridian-dust">
            {article.date}
          </Data>
        </div>
      </Card>
    </Link>
  )
}
