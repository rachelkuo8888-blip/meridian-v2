'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

const PILLAR_CHARS = ['甲', '丙', '庚', '壬'];
const STATUS_TEXTS = [
  'Calculating your Four Pillars...',
  'Mapping your elemental balance...',
  'Locating your natal chart...',
];

export default function GeneratingPage() {
  const router = useRouter();
  const [revealedPillars, setRevealedPillars] = React.useState(0);
  const [statusIndex, setStatusIndex] = React.useState(0);

  // Sequence: reveal a pillar every 1.2s, auto-advance after ~6s total
  React.useEffect(() => {
    if (revealedPillars < PILLAR_CHARS.length) {
      const timer = setTimeout(() => {
        setRevealedPillars((v) => v + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [revealedPillars]);

  // Update status text as animation progresses
  React.useEffect(() => {
    if (revealedPillars < STATUS_TEXTS.length) {
      const timer = setTimeout(() => {
        setStatusIndex(revealedPillars);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [revealedPillars]);

  // Auto-advance after ~6s when all pillars revealed
  React.useEffect(() => {
    if (revealedPillars === PILLAR_CHARS.length) {
      const timer = setTimeout(() => {
        router.push('/onboarding/insight');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [revealedPillars, router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-deep-navy px-6">
      {/* Decorative background lines */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-0 h-full w-px bg-gradient-to-b from-transparent via-meridian-gold/8 to-transparent" />
        <div className="absolute right-1/3 top-0 h-full w-px bg-gradient-to-b from-transparent via-meridian-gold/5 to-transparent" />
      </div>

      {/* Four Pillars animation */}
      <div className="relative z-10 mb-12 flex items-center justify-center gap-3">
        {PILLAR_CHARS.map((char, i) => (
          <div
            key={i}
            className={`flex h-16 w-16 items-center justify-center rounded-sm border transition-all duration-700 sm:h-20 sm:w-20 ${
              i < revealedPillars
                ? 'border-meridian-gold/60 bg-meridian-gold/10 opacity-100'
                : 'border-meridian-dust/20 opacity-20'
            }`}
          >
            {i < revealedPillars && (
              <span className="font-serif text-2xl text-meridian-gold animate-fade-in sm:text-3xl">
                {char}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Status text */}
      <p className="relative z-10 font-sans text-sm tracking-wide text-meridian-dust">
        {statusIndex < STATUS_TEXTS.length
          ? STATUS_TEXTS[statusIndex]
          : STATUS_TEXTS[STATUS_TEXTS.length - 1]}
      </p>
    </div>
  );
}
