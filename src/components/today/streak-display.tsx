'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  className?: string;
}

function getInitialStreak(): number {
  if (typeof window === 'undefined') return 12;
  const stored = localStorage.getItem('meridian-streak');
  if (stored !== null) {
    const num = parseInt(stored, 10);
    if (!isNaN(num) && num >= 0) return num;
  }
  return 12;
}

/**
 * Streak Display — fixed bottom bar showing fire emoji + streak count.
 * Reads from localStorage key 'meridian-streak' or defaults to 12.
 */
export function StreakDisplay({ className }: StreakDisplayProps) {
  const [streak] = React.useState(getInitialStreak);

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 flex justify-center pb-6 pt-2',
        className,
      )}
    >
      <span
        className="font-mono text-meridian-gold"
        style={{ fontSize: 10 }}
      >
        &#x1F525; {streak}-day streak
      </span>
    </div>
  );
}
