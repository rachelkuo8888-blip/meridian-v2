'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
// import { useOnboardingStore } from '@/stores/onboarding';
import { ProgressDots } from './progress-dots';

interface ScreenWrapperProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: 'ivory' | 'navy';
  /** When provided, shows progress dots in the top area */
  progressDots?: {
    total: number;
    current: number;
  };
}

/**
 * Standard screen wrapper for onboarding pages.
 * Provides consistent padding, background, and progress indicator.
 */
export function ScreenWrapper({
  children,
  className,
  bgColor = 'ivory',
  progressDots,
}: ScreenWrapperProps) {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col px-6 pt-4 pb-8',
        bgColor === 'ivory' ? 'bg-meridian-ivory' : 'bg-deep-navy',
        className,
      )}
    >
      {/* Progress dots at top */}
      {progressDots && (
        <div className="mb-8">
          <ProgressDots total={progressDots.total} current={progressDots.current} />
        </div>
      )}

      {/* Content area with flex growth for spacing */}
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
