/**
 * Energy Curve — 6.4: Simple SVG line chart (7 days)
 *
 * Displays a weekly energy trend as a simple SVG line chart.
 * Uses mock data for MVP.
 */

'use client'

import * as React from 'react'

interface EnergyPoint {
  day: string
  value: number // 0-100
  label: string
}

interface EnergyCurveProps {
  data?: EnergyPoint[]
}

const DEFAULT_DATA: EnergyPoint[] = [
  { day: 'Mo', value: 65, label: 'Mon' },
  { day: 'Tu', value: 82, label: 'Tue' },
  { day: 'We', value: 70, label: 'Wed' },
  { day: 'Th', value: 45, label: 'Thu' },
  { day: 'Fr', value: 58, label: 'Fri' },
  { day: 'Sa', value: 75, label: 'Sat' },
  { day: 'Su', value: 80, label: 'Sun' },
]

export function EnergyCurve({ data = DEFAULT_DATA }: EnergyCurveProps) {
  const width = 280
  const height = 100
  const padding = { top: 8, right: 8, bottom: 24, left: 8 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Scale points to chart dimensions
  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - (d.value / 100) * chartHeight,
    value: d.value,
    day: d.day,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`

  return (
    <div className="space-y-1">
      <h3 className="font-sans text-[8pt] font-bold tracking-[0.09em] uppercase text-meridian-black">
        本周能量曲线
      </h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-xs"
        aria-label="Weekly energy curve"
      >
        {/* Area fill */}
        <path d={areaPath} fill="url(#energyGradient)" opacity={0.15} />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C4A96B" />
            <stop offset="100%" stopColor="#C4A96B" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#C4A96B"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2.5"
            fill="#F7F5F0"
            stroke="#C4A96B"
            strokeWidth="1.5"
          />
        ))}
        {/* Day labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={padding.top + chartHeight + 16}
            textAnchor="middle"
            className="font-mono text-[7pt]"
            fill="#8A8780"
          >
            {p.day}
          </text>
        ))}
      </svg>
    </div>
  )
}
