'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CATEGORY_COLORS } from '@/lib/discover-content';

interface ArticleThumbnailProps {
  category: string;
  className?: string;
}

/**
 * ArticleThumbnail — colored placeholder for article thumbnails.
 *
 * No actual images needed for MVP; this renders a category-colored
 * background with a text icon.
 */
export function ArticleThumbnail({ category, className }: ArticleThumbnailProps) {
  const color = CATEGORY_COLORS[category] ?? '#C4A96B';

  return (
    <div
      className={cn('flex h-full w-full items-center justify-center rounded-sm', className)}
      style={{ backgroundColor: `${color}15` }}
    >
      <span className="text-lg" style={{ color }}>
        ◆
      </span>
    </div>
  );
}
