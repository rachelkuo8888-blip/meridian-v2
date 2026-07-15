'use client'

import * as React from 'react'
import { Heading, Data } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { CategoryTabs } from '@/components/discover/category-tabs'
import { ArticleCard } from '@/components/discover/article-card'
import { FeaturedArticle } from '@/components/discover/featured-article'
import { articles } from '@/lib/discover-content'

// Hydration-safe store subscription
function useHydration() {
  const hydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  return hydrated
}

const PAGE_SIZE = 6

export default function DiscoverPage() {
  const hydrated = useHydration()
  const [activeCategory, setActiveCategory] = React.useState('全部')

  // Use key to reset pagination on category change — key={activeCategory}
  // This is the clean React way: remount the grid section
  return (
    <div className="mx-auto min-h-screen max-w-md px-5 pt-8 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Heading as="h1" variant="serif" tracking="wide" className="text-lg">
          Discover
        </Heading>
        <button
          type="button"
          className="text-meridian-dust hover:text-meridian-ink"
          aria-label="Search"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      {/* Category Tabs */}
      <CategoryTabs
        active={activeCategory}
        onSelect={setActiveCategory}
        className="mb-6"
      />

      {!hydrated ? (
        <div className="mx-auto flex min-h-[40vh] max-w-md items-center justify-center">
          <Spinner variant="gold" />
        </div>
      ) : (
        <ArticlesSection
          key={activeCategory}
          activeCategory={activeCategory}
        />
      )}
    </div>
  )
}

function ArticlesSection({
  activeCategory,
}: {
  activeCategory: string
}) {
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE)

  const filtered =
    activeCategory === '全部'
      ? articles
      : articles.filter((a) => a.category === activeCategory)

  const featured = filtered.length > 0 ? filtered[0] : articles[0]
  const remaining = filtered.filter((a) => a.slug !== featured.slug)
  const visible = remaining.slice(0, visibleCount)
  const hasMore = visibleCount < remaining.length

  return (
    <>
      {/* Featured Article */}
      {featured && (
        <div className="mb-8">
          <FeaturedArticle article={featured} />
        </div>
      )}

      {/* Separator */}
      <Separator variant="subtle" className="mb-6" />

      {/* Article Grid (2 columns) */}
      {visible.length > 0 ? (
        <div className="mb-8 grid grid-cols-2 gap-3">
          {visible.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Data size="sm" className="text-meridian-dust">
            No articles yet
          </Data>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  )
}
