'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

const LINES = [
  'You were born with a pattern.',
  'Not a fortune. A structure.',
  'Meridian helps you see it — every day.',
];

export default function WelcomePage() {
  const router = useRouter();
  const [visibleLines, setVisibleLines] = React.useState<number>(0);

  React.useEffect(() => {
    if (visibleLines < LINES.length) {
      const timer = setTimeout(() => setVisibleLines((v) => v + 1), 800);
      return () => clearTimeout(timer);
    }
  }, [visibleLines]);

  const handleContinue = () => {
    router.push('/onboarding/birth-date');
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-deep-navy px-8">
      {/* Decorative diagonal gold lines — subtle background animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[200%] w-px origin-bottom-left -translate-x-1/2 rotate-12 bg-gradient-to-b from-transparent via-meridian-gold/10 to-transparent" />
        <div className="absolute right-1/4 top-0 h-[200%] w-px origin-bottom-right -translate-y-1/4 -translate-x-1/2 -rotate-12 bg-gradient-to-b from-transparent via-meridian-gold/8 to-transparent" />
        <div className="absolute left-1/2 top-0 h-[200%] w-px origin-bottom -translate-x-1/2 rotate-6 bg-gradient-to-b from-transparent via-meridian-gold/6 to-transparent" />
      </div>

      {/* Tagline lines fading in */}
      <div className="relative z-10 mb-16 space-y-4 text-center">
        {LINES.map((line, i) => (
          <p
            key={line}
            className={`font-serif text-xl leading-relaxed tracking-wide text-meridian-ivory transition-all duration-700 sm:text-2xl ${
              i < visibleLines
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            {line}
          </p>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 mt-auto mb-12 w-full max-w-xs">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          className="border-meridian-gold text-meridian-gold hover:bg-meridian-gold/10"
          onClick={handleContinue}
        >
          Continue →
        </Button>
      </div>
    </div>
  );
}
