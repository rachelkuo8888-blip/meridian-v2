'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CoachChatInputProps {
  initialQuery?: string | null;
}

/**
 * CoachChatInput — sticky input bar with text field and send button.
 * Extracted for lazy loading on the Coach page.
 */
export const CoachChatInput = React.memo(function CoachChatInput({
  initialQuery,
}: CoachChatInputProps) {
  const [inputValue, setInputValue] = React.useState(initialQuery ?? '');

  return (
    <div className="sticky bottom-0 px-5 py-4 bg-meridian-ivory border-t border-meridian-dust/20">
      <div className="flex items-center gap-2 max-w-md mx-auto">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Meridian anything..."
          className={cn(
            'flex-1 bg-surface border border-meridian-dust/30 rounded-lg px-4 py-3',
            'font-sans text-sm text-meridian-ink placeholder:text-meridian-dust',
            'focus:outline-none focus:border-meridian-gold/50 transition-colors',
          )}
        />
        <button
          type="button"
          disabled={!inputValue.trim()}
          className={cn(
            'bg-meridian-ink text-meridian-ivory rounded-lg px-4 py-3',
            'font-sans text-xs font-medium transition-opacity',
            'hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed',
            'focus:outline-none',
          )}
        >
          Send
        </button>
      </div>
    </div>
  );
});
