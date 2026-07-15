'use client'

import * as React from 'react'
import type { GlossaryTerm } from '@/data/learn-content'

interface GlossaryTermProps {
  term: GlossaryTerm
}

/**
 * Single glossary term card with gold left border.
 */
export function GlossaryTermCard({ term }: GlossaryTermProps) {
  return (
    <div className="border-l-2 border-meridian-gold pl-3 py-2">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-base font-medium text-meridian-black">
          {term.term}
        </span>
        {term.pinyin && (
          <span className="text-[10px] text-meridian-dust italic">
            {term.pinyin}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-xs text-meridian-ink/80 leading-relaxed">
        {term.definition}
      </p>
    </div>
  )
}
