'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui'
import type { LearningPath } from '@/data/learn-content'
import { useLearnStore } from '@/stores/learn'

interface PathCardProps {
  path: LearningPath
  featured?: boolean
}

/**
 * Clickable learning path card.
 * When `featured` is true, renders as a large hero card.
 * Otherwise renders as a compact 2-column grid card.
 */
export function PathCard({ path, featured = false }: PathCardProps) {
  const router = useRouter()
  const isPathStarted = useLearnStore((s) => s.isPathStarted(path.id))
  const { completed, total } = useLearnStore((s) => s.getPathProgress(path.id))
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0

  const handleClick = () => {
    router.push(`/learn/${path.id}`)
  }

  if (featured) {
    return (
      <button
        onClick={handleClick}
        className="w-full text-left block cursor-pointer"
      >
        <Card
          variant="ivory"
          padding="md"
          className="hover:border-meridian-gold/50 transition-colors"
        >
          <CardContent>
            <h3 className="font-serif text-lg font-light tracking-wide text-meridian-black">
              {path.title}
            </h3>
            <p className="mt-1 text-xs text-meridian-dust">
              {path.lessons.length} 课 · {path.quizzes.length} 测验
            </p>
            <p className="mt-1 text-xs text-meridian-ink/70">
              {path.description}
            </p>
            {isPathStarted ? (
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-meridian-dust">
                  <span>{completed}/{total} 已完成</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-meridian-dust/20">
                  <div
                    className="h-1.5 rounded-full bg-meridian-gold transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="mt-2 inline-block rounded-sm border border-meridian-gold px-3 py-1 text-xs text-meridian-gold hover:bg-meridian-gold/5">
                  ▷ 继续学习
                </span>
              </div>
            ) : (
              <span className="mt-2 inline-block rounded-sm border border-meridian-gold px-3 py-1 text-xs text-meridian-gold hover:bg-meridian-gold/5">
                开始学习
              </span>
            )}
          </CardContent>
        </Card>
      </button>
    )
  }

  // Compact card for grid
  return (
    <button
      onClick={handleClick}
      className="w-full text-left block cursor-pointer"
    >
      <Card
        variant="ivory"
        padding="sm"
        className="hover:border-meridian-gold/50 transition-colors h-full"
      >
        <CardContent>
          <h4 className="font-serif text-base font-light tracking-wide text-meridian-black">
            {path.title}
          </h4>
          {isPathStarted && (
            <p className="mt-0.5 text-[10px] text-meridian-dust">
              {completed}/{total} 课
            </p>
          )}
          {!isPathStarted && (
            <p className="mt-0.5 text-[10px] text-meridian-dust">
              {path.lessons.length} 课
            </p>
          )}
        </CardContent>
      </Card>
    </button>
  )
}
