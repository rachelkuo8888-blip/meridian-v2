'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { EnergyRing } from './energy-ring';

interface DailyInsightProps {
  className?: string;
}

const INSIGHT_TEXT = '今天的能量支持耐心与协商。';
const FOCUS_ITEMS = ['上午适合推进需要专注的事'];

/**
 * Daily Insight Card — shows the energy ring, a one-line insight quote,
 * today's focus items, separated by Smoke dividers.
 */
export function DailyInsight({ className }: DailyInsightProps) {
  const [name] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('meridian-name') || 'Alex';
    }
    return 'Alex';
  });

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Greeting + Settings */}
      <div className="flex items-center justify-between mb-6">
        <span
          className="font-sans text-meridian-dust"
          style={{ fontSize: 8 }}
        >
          Good morning, {name}.
        </span>
        <button
          type="button"
          aria-label="Settings"
          className="text-meridian-dust hover:text-meridian-ink transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="7" cy="7" r="2.5" />
            <path d="M7 0.5v2M7 11.5v2M0.5 7h2M11.5 7h2M2.1 2.1l1.4 1.4M10.5 10.5l1.4 1.4M2.1 11.9l1.4-1.4M10.5 3.5l1.4-1.4" />
          </svg>
        </button>
      </div>

      {/* Energy Ring */}
      <div className="flex justify-center mb-5">
        <EnergyRing score={82} element="Water" />
      </div>

      {/* Insight quote */}
      <p
        className="font-serif italic text-[11px] text-meridian-ink text-center leading-snug max-w-[250px] mx-auto mb-6"
      >
        &ldquo;{INSIGHT_TEXT}&rdquo;
      </p>

      {/* Today's Focus */}
      <div className="flex flex-col gap-1">
        <span
          className="font-sans font-bold text-meridian-dust uppercase"
          style={{ fontSize: 8, letterSpacing: '0.09em' }}
        >
          Today&rsquo;s Focus
        </span>
        {FOCUS_ITEMS.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-meridian-gold flex-shrink-0 mt-[5px]"
            />
            <span className="font-sans text-meridian-ink" style={{ fontSize: 8.5 }}>
              {item}
            </span>
          </div>
        ))}
      </div>

      {/* Separator after focus section */}
      <Separator variant="default" className="mt-6" />
    </div>
  );
}
