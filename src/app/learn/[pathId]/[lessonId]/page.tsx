'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button, Separator } from '@/components/ui'
import { QuizSection } from '@/components/learn/quiz-section'
import { getPathById, getLessonById, getQuizById } from '@/data/learn-content'
import { useLearnStore } from '@/stores/learn'

export default function LessonDetailPage() {
  const router = useRouter()
  const params = useParams()
  const pathId = params.pathId as string
  const lessonId = params.lessonId as string

  const path = getPathById(pathId)
  const lesson = getLessonById(pathId, lessonId)
  const quiz = getQuizById(pathId, lessonId)
  const isQuizPage = !!quiz

  // Hydration-safe
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const completeLesson = useLearnStore((s) => s.completeLesson)
  const isCompleted = useLearnStore((s) => s.isLessonCompleted(pathId, lessonId))
  const [contentComplete, setContentComplete] = React.useState(false)

  // If it's a quiz page, render the quiz directly
  if (isQuizPage && quiz && mounted) {
    return (
      <div className="min-h-screen bg-meridian-ivory">
        <div className="mx-auto max-w-md px-5 pt-8 pb-24 animate-page-in">
          <button
            onClick={() => router.push(`/learn/${pathId}`)}
            className="text-[10px] text-meridian-dust hover:text-meridian-black transition-colors cursor-pointer"
          >
            ← Back
          </button>

          <div className="mt-4">
            <QuizSection
              quizId={quiz.id}
              pathId={pathId}
              title={quiz.title}
              questions={quiz.questions}
            />
          </div>
        </div>
      </div>
    )
  }

  if (!mounted || !lesson) {
    if (!mounted) return <div className="mx-auto max-w-md px-5 pt-8" />
    return (
      <div className="mx-auto max-w-md px-5 pt-8">
        <button
          onClick={() => router.push(`/learn/${pathId}`)}
          className="text-[10px] text-meridian-dust hover:text-meridian-black transition-colors cursor-pointer"
        >
          ← Back
        </button>
        <p className="mt-4 text-xs text-meridian-dust">Lesson not found</p>
      </div>
    )
  }

  const handleComplete = () => {
    completeLesson(pathId, lessonId)
    setContentComplete(true)
  }

  // Parse content into paragraphs and lists
  const contentLines = lesson.content.split('\n').filter(Boolean)

  return (
    <div className="min-h-screen bg-meridian-ivory">
      <div className="mx-auto max-w-md px-5 pt-8 pb-24 animate-page-in">
        {/* Back + Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/learn/${pathId}`)}
            className="text-[10px] text-meridian-dust hover:text-meridian-black transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="font-serif text-base font-light tracking-wide text-meridian-black">
            {lesson.title}
          </h1>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-3">
          {contentLines.map((line, idx) => {
            if (line.startsWith('•')) {
              return (
                <p key={idx} className="pl-4 text-xs text-meridian-ink/80 font-sans">
                  {line}
                </p>
              )
            }
            if (line.startsWith('**') && line.endsWith('**')) {
              return (
                <h3 key={idx} className="text-xs font-semibold text-meridian-black font-sans pt-1">
                  {line.replace(/\*\*/g, '')}
                </h3>
              )
            }
            return (
              <p key={idx} className="text-sm leading-relaxed text-meridian-ink font-serif">
                {line.replace(/\*\*(.+?)\*\*/g, '$1')}
              </p>
            )
          })}
        </div>

        {/* Tip Cards */}
        {lesson.tips && lesson.tips.length > 0 && (
          <div className="mt-6 space-y-3">
            {lesson.tips.map((tip, idx) => (
              <div
                key={idx}
                className="border-l-2 border-meridian-gold bg-meridian-gold/5 rounded-sm px-4 py-3"
              >
                <p className="text-xs text-meridian-ink/80 leading-relaxed">
                  💡 {tip}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Inline quiz for the last lesson of each path */}
        {lesson.id === 'generating-overcoming' && path?.quizzes.find((q) => q.id === 'five-elements-quiz') ? (
          <QuizSection
            quizId="five-elements-quiz"
            pathId={pathId}
            title="五行入门测验"
            questions={path.quizzes.find((q) => q.id === 'five-elements-quiz')!.questions}
            inline
          />
        ) : lesson.id === 'day-master-five-elements' && path?.quizzes.find((q) => q.id === 'bazi-quiz') ? (
          <QuizSection
            quizId="bazi-quiz"
            pathId={pathId}
            title="八字基础测验"
            questions={path.quizzes.find((q) => q.id === 'bazi-quiz')!.questions}
            inline
          />
        ) : lesson.id === 'ming-palace' && path?.quizzes.find((q) => q.id === 'ziwei-quiz') ? (
          <QuizSection
            quizId="ziwei-quiz"
            pathId={pathId}
            title="十二宫基础测验"
            questions={path.quizzes.find((q) => q.id === 'ziwei-quiz')!.questions}
            inline
          />
        ) : null}

        <Separator variant="subtle" className="my-6" />

        {/* Complete Button */}
        {!isCompleted && !contentComplete ? (
          <div className="flex justify-center">
            <Button
              variant="gold"
              size="md"
              onClick={handleComplete}
            >
              完成 ✓
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-green-600 font-medium">
              ✓ 已完成
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/learn/${pathId}`)}
            >
              返回课程列表
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
