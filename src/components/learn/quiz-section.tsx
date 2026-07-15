'use client'

import * as React from 'react'
import { Button, Separator } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useLearnStore } from '@/stores/learn'
import type { QuizQuestion } from '@/data/learn-content'

interface QuizSectionProps {
  quizId: string
  pathId: string
  title: string
  questions: QuizQuestion[]
  /** When true, this quiz appears inline at a specific point in the lesson list */
  inline?: boolean
}

/**
 * Quiz component with radio-style multiple choice.
 * Shows feedback after each answer and tracks score.
 */
export function QuizSection({ quizId, pathId, title, questions, inline = false }: QuizSectionProps) {
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null)
  const [hasSubmitted, setHasSubmitted] = React.useState(false)
  const [answers, setAnswers] = React.useState<number[]>([])
  const setQuizScore = useLearnStore((s) => s.setQuizScore)
  const quizScore = useLearnStore((s) => s.quizScores[quizId])
  const completeLesson = useLearnStore((s) => s.completeLesson)

  // Hydration-safe
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const isFinished = quizScore !== undefined
  const q = questions[currentQuestion]
  const isLast = currentQuestion === questions.length - 1

  if (!mounted) return null

  if (isFinished) {
    const total = questions.length
    const pct = Math.round((quizScore / total) * 100)
    return (
      <div className={cn('rounded-sm border border-meridian-dust/30 bg-meridian-ivory p-4', !inline && 'mt-6')}>
        <h4 className="font-serif text-base font-light tracking-wide text-meridian-black">
          {title}
        </h4>
        <div className="mt-3">
          <p className="text-sm text-meridian-dust">
            得分：{quizScore}/{total}（{pct}%）
          </p>
          {pct >= 80 ? (
            <p className="mt-1 text-xs text-green-600">✓ 优秀！掌握得很好</p>
          ) : pct >= 50 ? (
            <p className="mt-1 text-xs text-meridian-gold">📖 不错，建议复习一下薄弱环节</p>
          ) : (
            <p className="mt-1 text-xs text-meridian-dust">🔄 建议重新学习这部分内容</p>
          )}
        </div>
      </div>
    )
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return
    setHasSubmitted(true)
  }

  const handleNext = () => {
    const newAnswers = [...answers, selectedAnswer!]
    setAnswers(newAnswers)
    setSelectedAnswer(null)
    setHasSubmitted(false)

    if (isLast) {
      const correct = newAnswers.reduce((count, ans, idx) => {
        return ans === questions[idx].correctIndex ? count + 1 : count
      }, 0)
      setQuizScore(quizId, correct)
      completeLesson(pathId, quizId)
    } else {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const isCorrect = hasSubmitted && selectedAnswer === q.correctIndex

  return (
    <div className={cn(!inline && 'mt-6')}>
      <Separator variant="subtle" className="mb-4" />
      <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-meridian-dust">
        测验
      </h4>

      <div className="mt-3">
        <p className="font-sans text-sm font-medium text-meridian-black">
          第 {currentQuestion + 1} 题（共 {questions.length} 题）
        </p>

        <p className="mt-2 text-sm text-meridian-ink">{q.question}</p>

        <div className="mt-3 space-y-2">
          {q.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx
            const showCorrect = hasSubmitted && idx === q.correctIndex
            const showWrong = hasSubmitted && isSelected && !isCorrect

            return (
              <button
                key={idx}
                onClick={() => !hasSubmitted && setSelectedAnswer(idx)}
                disabled={hasSubmitted}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm border px-3 py-2 text-left text-sm transition-colors cursor-pointer',
                  isSelected && !hasSubmitted && 'border-meridian-gold bg-meridian-gold/5',
                  !isSelected && !hasSubmitted && 'border-meridian-dust/30 hover:border-meridian-dust/60',
                  showCorrect && 'border-green-500 bg-green-50',
                  showWrong && 'border-red-400 bg-red-50',
                  hasSubmitted && 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'flex-shrink-0 h-4 w-4 rounded-full border flex items-center justify-center',
                    isSelected && !hasSubmitted && 'border-meridian-gold',
                    !isSelected && !hasSubmitted && 'border-meridian-dust',
                    showCorrect && 'border-green-500 bg-green-500',
                    showWrong && 'border-red-400 bg-red-400',
                  )}
                >
                  {isSelected && !hasSubmitted && (
                    <span className="h-2 w-2 rounded-full bg-meridian-gold" />
                  )}
                  {showCorrect && <span className="text-[10px] text-white">✓</span>}
                  {showWrong && <span className="text-[10px] text-white">✗</span>}
                </span>
                <span className="flex-1">{option}</span>
              </button>
            )
          })}
        </div>

        {hasSubmitted && (
          <div className="mt-3 rounded-sm border-l-2 border-meridian-gold bg-meridian-gold/5 px-3 py-2">
            <p className="text-xs text-meridian-ink">{q.explanation}</p>
          </div>
        )}

        <div className="mt-3 flex justify-end">
          {!hasSubmitted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
            >
              确认答案
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleNext}>
              {isLast ? '查看结果' : '下一题'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
