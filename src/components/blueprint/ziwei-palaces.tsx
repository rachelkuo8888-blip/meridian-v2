/**
 * Zi Wei Palaces — 6.1: 12 palaces in a compact 3×4 grid
 */

'use client'

import * as React from 'react'
import type { ZiWeiData } from './types'

interface ZiWeiPalacesProps {
  ziwei: ZiWeiData
}

const PALACE_ORDER = ['命', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母']

export function ZiWeiPalaces({ ziwei }: ZiWeiPalacesProps) {
  const palaces = ziwei.palaces ?? {}

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="h-px flex-1 bg-meridian-dust/30" />
        <span className="font-sans text-[7pt] tracking-widest text-meridian-dust/60 uppercase">
          紫微命盘
        </span>
        <span className="h-px flex-1 bg-meridian-dust/30" />
      </div>
      <div className="grid grid-cols-3 gap-[1px] overflow-hidden rounded-sm border border-meridian-dust/20 bg-meridian-dust/20">
        {PALACE_ORDER.map((palaceName) => {
          const master = palaces[palaceName]
          const isLifePalace = palaceName === '命'
          return (
            <div
              key={palaceName}
              className={`flex flex-col items-center justify-center px-2 py-2.5 text-center ${
                isLifePalace
                  ? 'bg-meridian-gold/[0.06]'
                  : 'bg-meridian-ivory'
              }`}
            >
              <span
                className={`font-sans text-[6pt] tracking-wider ${
                  isLifePalace ? 'text-meridian-gold font-semibold' : 'text-meridian-dust'
                }`}
              >
                {palaceName}宫
              </span>
              {master && (
                <span className="font-sans text-[7pt] font-medium text-meridian-black mt-0.5">
                  {master}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
