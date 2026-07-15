'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { learningPaths, getTotalLessonCount } from '@/data/learn-content'
import { track } from '@/lib/analytics/tracker'

interface LearnState {
  /** Set of completed lesson IDs (format: "pathId/lessonId") */
  completedLessons: string[]
  /** Quiz scores keyed by quiz ID */
  quizScores: Record<string, number>
  /** Set of paths the user has started */
  startedPaths: string[]

  completeLesson: (pathId: string, lessonId: string) => void
  setQuizScore: (quizId: string, score: number) => void
  startPath: (pathId: string) => void
  isLessonCompleted: (pathId: string, lessonId: string) => boolean
  isPathStarted: (pathId: string) => boolean
  getPathProgress: (pathId: string) => { completed: number; total: number }
  getTotalProgress: () => { completed: number; total: number }
  getEarnedBadgeIds: () => string[]
  reset: () => void
}

const lessonKey = (pathId: string, lessonId: string) => `${pathId}/${lessonId}`

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      quizScores: {},
      startedPaths: [],

      completeLesson: (pathId: string, lessonId: string) => {
        const key = lessonKey(pathId, lessonId)
        const wasAlreadyCompleted = get().completedLessons.includes(key)
        const beforeBadges = get().getEarnedBadgeIds().length
        set((state) => ({
          completedLessons: wasAlreadyCompleted
            ? state.completedLessons
            : [...state.completedLessons, key],
          startedPaths: state.startedPaths.includes(pathId)
            ? state.startedPaths
            : [...state.startedPaths, pathId],
        }))
        if (!wasAlreadyCompleted) {
          track('lesson_complete', { pathId, lessonId })
          // Check if any new badges were earned
          const afterBadges = get().getEarnedBadgeIds().length
          if (afterBadges > beforeBadges) {
            track('badge_earned', { pathId, count: afterBadges - beforeBadges })
          }
        }
      },

      setQuizScore: (quizId: string, score: number) => {
        set((state) => ({
          quizScores: { ...state.quizScores, [quizId]: score },
        }))
      },

      startPath: (pathId: string) => {
        set((state) => ({
          startedPaths: state.startedPaths.includes(pathId)
            ? state.startedPaths
            : [...state.startedPaths, pathId],
        }))
      },

      isLessonCompleted: (pathId: string, lessonId: string) => {
        return get().completedLessons.includes(lessonKey(pathId, lessonId))
      },

      isPathStarted: (pathId: string) => {
        return get().startedPaths.includes(pathId)
      },

      getPathProgress: (pathId: string) => {
        const path = learningPaths.find((p) => p.id === pathId)
        if (!path) return { completed: 0, total: 0 }
        const total = path.lessons.length + path.quizzes.length
        const completed = [
          ...path.lessons.map((l) => lessonKey(pathId, l.id)),
          ...path.quizzes.map((q) => lessonKey(pathId, q.id)),
        ].filter((k) => get().completedLessons.includes(k)).length
        return { completed, total }
      },

      getTotalProgress: () => {
        const total = getTotalLessonCount() + learningPaths.reduce((s, p) => s + p.quizzes.length, 0)
        const completed = get().completedLessons.length
        return { completed, total }
      },

      getEarnedBadgeIds: () => {
        const state = get()
        const earned: string[] = []

        // Path-complete badges
        for (const path of learningPaths) {
          const { completed, total } = state.getPathProgress(path.id)
          if (completed >= total) {
            earned.push(`${path.id}-master`)
          }
        }

        // all-paths badge
        const allPathsCompleted = learningPaths.every((p) => {
          const { completed, total } = state.getPathProgress(p.id)
          return completed >= total
        })
        if (allPathsCompleted) {
          earned.push('theorist')
          earned.push('explorer')
        }

        // Days streak badges — simplified: based on unique study days from completed lessons
        // For MVP we use a simplified check: if they've completed all paths, give streak badges too
        if (allPathsCompleted) {
          earned.push('day-7-streak')
          earned.push('day-30-streak')
        }

        return earned
      },

      reset: () => {
        set({
          completedLessons: [],
          quizScores: {},
          startedPaths: [],
        })
      },
    }),
    {
      name: 'meridian-learn',
      partialize: (state) => ({
        completedLessons: state.completedLessons,
        quizScores: state.quizScores,
        startedPaths: state.startedPaths,
      }),
    },
  ),
)
