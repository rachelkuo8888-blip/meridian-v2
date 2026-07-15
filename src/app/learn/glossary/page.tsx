'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui'
import { GlossaryTermCard } from '@/components/learn/glossary-term'
import { glossaryTerms } from '@/data/learn-content'

export default function GlossaryPage() {
  const router = useRouter()
  const [search, setSearch] = React.useState('')

  // Hydration-safe
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const filtered = glossaryTerms.filter((t) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.term.toLowerCase().includes(q) ||
      t.definition.toLowerCase().includes(q) ||
      (t.pinyin ?? '').toLowerCase().includes(q)
    )
  })

  if (!mounted) {
    return <div className="mx-auto max-w-md px-5 pt-8" />
  }

  return (
    <div className="min-h-screen bg-meridian-ivory">
      <div className="mx-auto max-w-md px-5 pt-8 pb-24 animate-page-in">
        {/* Back + Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/learn')}
            className="text-[10px] text-meridian-dust hover:text-meridian-black transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="font-serif text-lg font-light tracking-wide text-meridian-black">
            术语词典
          </h1>
        </div>

        {/* Search */}
        <div className="mt-4">
          <Input
            placeholder="搜索术语..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="ivory"
          />
        </div>

        {/* Terms List */}
        <div className="mt-5 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((term) => (
              <GlossaryTermCard key={term.term} term={term} />
            ))
          ) : (
            <p className="text-xs text-meridian-dust text-center py-8">
              未找到匹配的术语
            </p>
          )}
        </div>

        <p className="mt-8 text-[10px] text-meridian-dust text-center">
          共 {glossaryTerms.length} 个术语
        </p>
      </div>
    </div>
  )
}
