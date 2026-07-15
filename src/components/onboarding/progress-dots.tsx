'use client';

import { cn } from '@/lib/utils';

interface ProgressDotsProps {
  total: number;
  current: number; // 0-indexed
}

/**
 * Progress dots indicator for multi-step sub-forms.
 * Active dot is filled Gold, others are empty with Gold border.
 */
export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-2 w-2 rounded-full border border-meridian-gold transition-all duration-300',
            i <= current ? 'bg-meridian-gold' : 'bg-transparent',
          )}
        />
      ))}
    </div>
  );
}
