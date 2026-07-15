'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useLearnStore } from '@/stores/learn'

interface LessonItemProps {
  pathId: string
  lessonId: string
  title: string
  duration: number
  index: number
  isQuiz?: boolean
}

/**
 * Single lesson row showing status (not started / in progress / completed).
 */
export const LessonItem = React.memo(function LessonItem({ pathId, lessonId, title, duration, isQuiz = false }: LessonItemProps) {
  const router = useRouter()
  const isCompleted = useLearnStore((s) => s.isLessonCompleted(pathId, lessonId))

  const statusIcon = isCompleted ? '●' : '○'

  const handleClick = () => {
    if (isQuiz) {
      router.push(`/learn/${pathId}/${lessonId}`)
    } else {
      router.push(`/learn/${pathId}/${lessonId}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-meridian-smoke/50 cursor-pointer"
    >
      <span
        className={cn(
          'flex-shrink-0 text-base leading-none',
          isCompleted
            ? 'text-meridian-gold'
            : 'text-meridian-dust',
        )}
      >
        {statusIcon}
      </span>
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'text-sm',
            isCompleted
              ? 'text-meridian-black font-medium'
              : 'text-meridian-ink',
          )}
        >
          {title}
        </span>
      </div>
      <span className="flex-shrink-0 text-[10px] text-meridian-dust">
        {duration}min
      </span>
    </button>
  )
})
