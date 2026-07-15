'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui'
import { PathCard } from '@/components/learn/path-card'
import { BadgeDisplay } from '@/components/learn/badge-display'
import { learningPaths } from '@/data/learn-content'
import { useLearnStore } from '@/stores/learn'

export default function LearnPage() {
  const router = useRouter()
  const getTotalProgress = useLearnStore((s) => s.getTotalProgress)

  // Hydration-safe state using useSyncExternalStore
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted) {
    return <div className="mx-auto max-w-md px-5 pt-8" />
  }

  const { completed, total } = getTotalProgress()
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0
  const featured = learningPaths.find((p) => p.featured) ?? learningPaths[0]
  const regularPaths = learningPaths.filter((p) => p.id !== featured.id)

  return (
    <div className="min-h-screen bg-meridian-ivory">
      <div className="mx-auto max-w-md px-5 pt-8 pb-24 animate-page-in">
        {/* Header */}
        <h1 className="font-serif text-xl font-light tracking-wide text-meridian-black">
          Learn
        </h1>

        {/* Progress (only if started) */}
        {completed > 0 && (
          <div className="mt-3">
            <p className="text-[10px] text-meridian-dust">
              进度 {completed}/{total} lessons completed
            </p>
            <div className="mt-1 h-1.5 w-full rounded-full bg-meridian-dust/20">
              <div
                className="h-1.5 rounded-full bg-meridian-gold transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Featured Path Card */}
        <div className="mt-5">
          <PathCard path={featured} featured />
        </div>

        {/* Path Grid (2 columns) */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {regularPaths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>

        {/* Glossary Link */}
        <div className="mt-6">
          <button
            onClick={() => router.push('/learn/glossary')}
            className="text-xs text-meridian-gold hover:text-meridian-gold/80 transition-colors cursor-pointer"
          >
            ※ 术语词典（Glossary）
          </button>
        </div>

        <Separator variant="subtle" className="my-6" />

        {/* Badges */}
        <BadgeDisplay />
      </div>
    </div>
  )
}
