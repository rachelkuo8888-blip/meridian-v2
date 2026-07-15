/**
 * Blueprint Page — Main Natal Chart Dashboard
 *
 * Combines: Four Pillars + Zi Wei Palaces + Elemental Composition + Da Yun Timeline + Trends preview
 */

'use client'

import * as React from 'react'
import type { ChartData } from '@/components/blueprint/types'
import { usePageView } from '@/hooks/use-page-view'
import { track } from '@/lib/analytics/tracker'
import { FourPillars } from '@/components/blueprint/four-pillars'
import dynamic from 'next/dynamic'

const ZiWeiPalaces = dynamic(() => import('@/components/blueprint/ziwei-palaces').then((m) => ({ default: m.ZiWeiPalaces })), { ssr: false })
const ElementBars = dynamic(() => import('@/components/blueprint/element-bars').then((m) => ({ default: m.ElementBars })), { ssr: false })
import { DaYunTimeline } from '@/components/blueprint/dayun-timeline'
import { LiuNianDisplay } from '@/components/blueprint/liunian-display'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const MOCK_CHART: ChartData = {
  user_id: 'test',
  natal: {
    pillars: {
      year: { stem: '庚', branch: '午' },
      month: { stem: '戊', branch: '寅' },
      day: { stem: '辛', branch: '巳' },
      hour: { stem: '乙', branch: '未' },
    },
    day_master: '辛',
    element_distribution: {
      wood: 0.1,
      fire: 0.25,
      earth: 0.15,
      metal: 0.3,
      water: 0.2,
    },
    useful_god: '火',
    strength: '旺',
    ziwei: {
      life_palace_master: '紫微',
      body_palace_master: '天相',
      palaces: {
        '命': '紫微',
        '兄弟': '天机',
        '夫妻': '破军',
        '子女': '七杀',
        '财帛': '廉贞',
        '疾厄': '太阴',
        '迁移': '贪狼',
        '交友': '巨门',
        '官禄': '天相',
        '田宅': '天梁',
        '福德': '武曲',
        '父母': '天府',
      },
    },
  },
  current_cycle: {
    da_yun: {
      direction: 'forward',
      start_age: 6,
      pillars: [
        { stem: '己', branch: '丑', start_age: 6, end_age: 16 },
        { stem: '庚', branch: '寅', start_age: 16, end_age: 26 },
        { stem: '辛', branch: '卯', start_age: 26, end_age: 36 },
        { stem: '壬', branch: '辰', start_age: 36, end_age: 46 },
        { stem: '癸', branch: '巳', start_age: 46, end_age: 56 },
        { stem: '甲', branch: '午', start_age: 56, end_age: 66 },
      ],
    },
  },
}

export default function BlueprintPage() {
  usePageView('blueprint')
  const [chart, setChart] = React.useState<ChartData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchChart() {
      try {
        const res = await fetch('/api/calc/chart?userId=test', { cache: 'no-store' })
        if (!res.ok) {
          // Fall back to mock data if calc engine unavailable
          console.warn('Calc Engine unavailable, using mock data')
          setChart(MOCK_CHART)
          track('chart_view', { source: 'mock' })
          return
        }
        const data = await res.json()
        setChart(data)
        track('chart_view', { source: 'api' })
      } catch {
        console.warn('Calc Engine unavailable, using mock data')
        setChart(MOCK_CHART)
        track('chart_view', { source: 'mock-error' })
      } finally {
        setLoading(false)
      }
    }
    fetchChart()
  }, [])

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-meridian-gold border-t-transparent" />
          <span className="font-sans text-[8pt] text-meridian-dust">Loading your chart...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center">
        <Card variant="ivory" padding="lg" className="text-center">
          <p className="font-sans text-[9pt] text-meridian-dust">{error}</p>
        </Card>
      </div>
    )
  }

  if (!chart) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md items-center justify-center">
        <Card variant="ivory" padding="lg" className="text-center">
          <p className="font-serif text-[12pt] text-meridian-black">
            Set up your chart
          </p>
          <p className="mt-2 font-sans text-[8pt] text-meridian-dust">
            Complete your birth details to see your Blueprint.
          </p>
        </Card>
      </div>
    )
  }

  const { natal, current_cycle } = chart
  const currentAge = 30 // TODO: compute from birth date

  return (
    <div className="mx-auto max-w-md px-4 py-6 animate-page-in">
      {/* 6.1: Four Pillars + Zi Wei */}
      <Card variant="ivory" padding="md" className="mb-4">
        <FourPillars
          pillars={natal.pillars}
          dayMaster={natal.day_master}
          strength={natal.strength}
          usefulGod={natal.useful_god}
        />
        {natal.ziwei && (
          <>
            <Separator className="my-4" />
            <React.Suspense fallback={<div className="h-32 animate-pulse rounded bg-meridian-smoke" />}>
              <ZiWeiPalaces ziwei={natal.ziwei} />
            </React.Suspense>
          </>
        )}
      </Card>

      {/* 6.2: Elemental Composition */}
      <Card variant="ivory" padding="md" className="mb-4">
        <React.Suspense fallback={<div className="h-32 animate-pulse rounded bg-meridian-smoke" />}>
          <ElementBars
            distribution={natal.element_distribution}
            dayMaster={natal.day_master}
            strength={natal.strength}
            usefulGod={natal.useful_god}
          />
        </React.Suspense>
      </Card>

      {/* 6.3: Da Yun Timeline + Liu Nian */}
      {current_cycle && (
        <Card variant="ivory" padding="md" className="mb-4">
          <DaYunTimeline daYun={current_cycle.da_yun} currentAge={currentAge} />
          <Separator className="my-3" />
          <LiuNianDisplay stem="丙" branch="午" year={2026} />
        </Card>
      )}

      {/* Trends navigation */}
      <Card variant="ivory" padding="md">
        <a
          href="/blueprint/trends"
          className="flex items-center justify-between"
        >
          <span className="font-sans text-[8pt] font-bold tracking-[0.09em] uppercase text-meridian-black">
            查看趋势
          </span>
          <span className="font-sans text-[7pt] text-meridian-gold">
            Trends →
          </span>
        </a>
      </Card>
    </div>
  )
}
