'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface EnergyRingProps {
  score: number;
  element: string;
  size?: number;
  className?: string;
}

/**
 * Energy Ring — SVG-based circular gauge showing daily energy score.
 * Gold monochrome only. Animates on mount from 0 → target over 1200ms.
 */
export function EnergyRing({
  score,
  element,
  size = 180,
  className,
}: EnergyRingProps) {
  const [animatedScore, setAnimatedScore] = React.useState(0);

  const clampedScore = Math.max(0, Math.min(100, score));

  React.useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    let frameId: number;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * clampedScore));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [clampedScore]);

  // SVG ring geometry
  const center = size / 2;
  const strokeWidth = 6;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  // Show 90% arc (324°), gap at bottom
  const maxArc = 0.9 * circumference;
  const arcLength = (animatedScore / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Ring container — svg + center number absolutely overlaid */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Rotate -90deg so arc starts at 12 o'clock */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0 -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E8E6E1"
            strokeWidth={strokeWidth}
            strokeDasharray={`${maxArc} ${circumference - maxArc}`}
            strokeLinecap="round"
          />
          {/* Data ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#C4A96B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeLinecap="round"
          />
        </svg>

        {/* Center number */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="font-serif font-bold text-meridian-ink leading-none"
            style={{ fontSize: Math.round(size * 0.23) }}
          >
            {animatedScore}
          </span>
        </div>
      </div>

      {/* Element label */}
      <span
        className="font-mono text-meridian-dust mt-1.5 tracking-widest text-center"
        style={{ fontSize: 7, letterSpacing: '0.08em' }}
      >
        {element} Day
      </span>
    </div>
  );
}
