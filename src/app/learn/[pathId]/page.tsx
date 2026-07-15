'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Separator } from '@/components/ui'
import { LessonItem } from '@/components/learn/lesson-item'
import { getPathById } from '@/data/learn-content'
import { useLearnStore } from '@/stores/learn'

export default function PathDetailPage() {
  const router = useRouter()
  const params = useParams()
  const pathId = params.pathId as string
  const path = getPathById(pathId)

  // Hydration-safe
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const getPathProgress = useLearnStore((s) => s.getPathProgress)
  const startPath = useLearnStore((s) => s.startPath)

  // Mark path as started on first visit
  React.useEffect(() => {
    if (path) {
      startPath(path.id)
    }
  }, [path, startPath])

  if (!mounted || !path) {
    if (!mounted) return <div className="mx-auto max-w-md px-5 pt-8" />
    return (
      <div className="mx-auto max-w-md px-5 pt-8">
        <button
          onClick={() => router.push('/learn')}
          className="text-[10px] text-meridian-dust hover:text-meridian-black transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <p className="mt-4 text-xs text-meridian-dust">Path not found</p>
      </div>
    )
  }

  const { completed, total } = getPathProgress(path.id)

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
          <h1 className="font-serif text-base font-light tracking-wide text-meridian-black">
            {path.title}
          </h1>
        </div>

        {/* Description */}
        <p className="mt-2 text-xs text-meridian-dust">
          {path.description}
        </p>

        {/* Lesson List */}
        <div className="mt-5 rounded-sm border border-meridian-dust/30 bg-meridian-ivory">
          {path.lessons.map((lesson, idx) => (
            <React.Fragment key={lesson.id}>
              {idx > 0 && <Separator variant="subtle" />}
              <LessonItem
                pathId={path.id}
                lessonId={lesson.id}
                title={lesson.title}
                duration={lesson.duration}
                index={idx}
              />
            </React.Fragment>
          ))}

          {/* Quiz entries */}
          {path.quizzes.map((quiz) => (
            <React.Fragment key={quiz.id}>
              <Separator variant="subtle" />
              <LessonItem
                pathId={path.id}
                lessonId={quiz.id}
                title={quiz.title}
                duration={3}
                index={path.lessons.length}
                isQuiz
              />
            </React.Fragment>
          ))}
        </div>

        {/* Progress Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-meridian-dust">
          <span>
            进度：{completed}/{total} 已完成
          </span>
          <span>
            {total > 0 ? Math.round((completed / total) * 100) : 0}%
          </span>
        </div>
        <div className="mt-1 h-1 w-full rounded-full bg-meridian-dust/20">
          <div
            className="h-1 rounded-full bg-meridian-gold transition-all duration-500"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </div>
      </div>
    </div>
  )
}
