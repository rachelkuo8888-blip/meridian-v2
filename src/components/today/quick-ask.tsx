'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface QuickAskProps {
  className?: string;
}

const QUERIES = [
  {
    title: 'Ask about\nToday',
    prompt: '帮我解读一下今天',
  },
  {
    title: 'Ask about\nThis Week',
    prompt: '这一周整体怎么样',
  },
] as const;

/**
 * Quick Ask Cards — two side-by-side cards that navigate to /coach
 * with a pre-filled question.
 */
export const QuickAsk = React.memo(function QuickAsk({ className }: QuickAskProps) {
  const router = useRouter();

  return (
    <div className={cn('flex gap-3', className)}>
      {QUERIES.map(({ title, prompt }) => (
        <button
          key={prompt}
          type="button"
          onClick={() => router.push(`/coach?q=${encodeURIComponent(prompt)}`)}
          className={cn(
            'flex-1 bg-meridian-ivory rounded-lg px-4 py-5 text-left',
            'border border-meridian-dust/20 transition-colors',
            'hover:border-meridian-gold/50 focus:outline-none focus:border-meridian-gold/50',
          )}
        >
          <span
            className="font-sans font-bold text-meridian-ink whitespace-pre-line leading-snug"
            style={{ fontSize: 8 }}
          >
            {title}
          </span>
        </button>
      ))}
    </div>
  );
});
