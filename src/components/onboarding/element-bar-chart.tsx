'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const ELEMENT_COLORS: Record<string, string> = {
  Wood: 'bg-emerald-600',
  Fire: 'bg-orange-500',
  Earth: 'bg-amber-700',
  Metal: 'bg-meridian-gold',
  Water: 'bg-sky-600',
};

const ELEMENT_BG: Record<string, string> = {
  Wood: 'bg-emerald-50',
  Fire: 'bg-orange-50',
  Earth: 'bg-amber-50',
  Metal: 'bg-yellow-50',
  Water: 'bg-sky-50',
};

interface ElementBarChartProps {
  distribution: Record<string, number>;
  className?: string;
}

/**
 * Simple horizontal bar chart showing the distribution of the Five Elements.
 * Bars rendered with CSS transitions for smooth reveal animation.
 */
export function ElementBarChart({
  distribution,
  className,
}: ElementBarChartProps) {
  const [animate, setAnimate] = React.useState(false);
  const elements = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];

  // Trigger animation on mount
  React.useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(...elements.map((e) => distribution[e] ?? 0));

  return (
    <div className={cn('space-y-4', className)}>
      {elements.map((el) => {
        const value = distribution[el] ?? 0;
        const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;

        return (
          <div key={el} className="flex items-center gap-3">
            {/* Element label */}
            <span className="w-14 text-right font-mono text-xs text-meridian-dust">
              {el}
            </span>

            {/* Bar */}
            <div className="flex-1">
              <div
                className={cn(
                  'h-3 rounded-sm',
                  ELEMENT_BG[el] ?? 'bg-meridian-smoke',
                )}
              >
                <div
                  className={cn(
                    'h-full rounded-sm transition-all duration-1000 ease-out',
                    ELEMENT_COLORS[el] ?? 'bg-meridian-gold',
                  )}
                  style={{
                    width: animate ? `${pct}%` : '0%',
                    minWidth: value > 0 ? '6px' : '0px',
                  }}
                />
              </div>
            </div>

            {/* Value */}
            <span className="w-8 text-right font-mono text-xs text-meridian-ink">
              {value}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
