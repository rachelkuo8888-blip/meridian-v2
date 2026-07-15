'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { Heading, Data } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { ArticleCard } from '@/components/discover/article-card'
import { articles, CATEGORY_COLORS } from '@/lib/discover-content'
import type { Article } from '@/lib/discover-content'

// Hydration-safe store subscription
function useHydration() {
  const hydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  return hydrated
}

/** Split markdown-style content into paragraphs and bold lines */
function renderContent(content: string) {
  const lines = content.split('\n')
  return lines.map((line, i) => {
    const trimmed = line.trim()

    // Bold headers: **text**
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      const text = trimmed.replace(/^\*\*/, '').replace(/\*\*$/, '')
      return (
        <h3
          key={i}
          className="mb-2 mt-4 font-sans text-xs font-semibold tracking-wide text-meridian-black"
        >
          {text}
        </h3>
      )
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.replace(/^[-*] /, '')
      return (
        <li
          key={i}
          className="mb-1 ml-3 list-disc text-xs leading-relaxed text-meridian-ink"
        >
          {text}
        </li>
      )
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s/, '')
      return (
        <li
          key={i}
          className="mb-1 ml-3 list-decimal text-xs leading-relaxed text-meridian-ink"
        >
          {text}
        </li>
      )
    }

    // Empty line
    if (!trimmed) {
      return <div key={i} className="h-2" />
    }

    // Regular paragraph
    return (
      <p
        key={i}
        className="mb-2 text-xs leading-relaxed text-meridian-ink"
      >
        {trimmed}
      </p>
    )
  })
}

function getRelatedArticles(
  current: Article,
  count = 2,
): Article[] {
  return articles
    .filter((a) => a.slug !== current.slug && a.category === current.category)
    .slice(0, count)
}

export default function ArticlePage() {
  const params = useParams()
  const hydrated = useHydration()
  const slug = params?.slug as string

  const article = articles.find((a) => a.slug === slug)
  const badgeColor = article
    ? CATEGORY_COLORS[article.category]
    : '#C4A96B'

  if (!hydrated) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-5">
        <Spinner variant="gold" />
      </div>
    )
  }

  if (!article) {
    notFound()
    return null
  }

  const related = getRelatedArticles(article)

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.excerpt,
            datePublished: article.date,
            author: {
              '@type': 'Organization',
              name: 'Meridian',
            },
          }),
        }}
      />

      <div className="mx-auto max-w-md px-5 pt-8 pb-24">
        {/* Back link */}
        <Link
          href="/discover"
          className="mb-6 inline-flex items-center gap-1 font-sans text-[7px] text-meridian-dust transition-colors hover:text-meridian-ink"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Discover
        </Link>

        {/* Category badge */}
        <span
          className="mb-3 inline-block rounded-sm px-2 py-0.5 text-[10px] font-medium leading-tight"
          style={{
            backgroundColor: `${badgeColor}20`,
            color: badgeColor,
          }}
        >
          {article.category}
        </span>

        {/* Title */}
        <Heading
          as="h1"
          variant="serif"
          tracking="wide"
          className="mb-3 text-center text-lg leading-snug"
        >
          {article.title}
        </Heading>

        {/* Meta */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <Data size="xs" className="text-meridian-dust">
            {article.date}
          </Data>
          <span className="text-[6px] text-meridian-dust">·</span>
          <Data size="xs" className="text-meridian-dust">
            {article.readTime} min read
          </Data>
        </div>

        {/* Separator */}
        <Separator variant="subtle" className="mb-6" />

        {/* Article content */}
        <div className="mb-10">{renderContent(article.content)}</div>

        {/* Related Articles */}
        {related.length > 0 && (
          <>
            <Separator variant="default" className="mb-6" />
            <Heading as="h2" variant="sans" className="mb-4 text-xs uppercase" tracking="wide">
              Related Articles
            </Heading>
            <div className="grid grid-cols-2 gap-3">
              {related.map((ra) => (
                <ArticleCard key={ra.slug} article={ra} />
              ))}
            </div>
          </>
        )}

        {/* Footer Nav */}
        <div className="mt-10 border-t border-meridian-dust/20 pt-6">
          <div className="flex items-center justify-center gap-6">
            <Link
              href="/blueprint"
              className="font-sans text-[7px] text-meridian-dust hover:text-meridian-ink transition-colors"
            >
              Blueprint
            </Link>
            <Link
              href="/coach"
              className="font-sans text-[7px] text-meridian-dust hover:text-meridian-ink transition-colors"
            >
              Coach
            </Link>
            <Link
              href="/learn"
              className="font-sans text-[7px] text-meridian-dust hover:text-meridian-ink transition-colors"
            >
              Learn
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
