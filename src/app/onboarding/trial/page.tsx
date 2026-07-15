'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Text } from '@/components/ui';

const FEATURES = [
  'Unlimited Coach conversations',
  'Full pattern analysis',
  'Weekly & monthly insight reports',
];

export default function TrialPage() {
  const router = useRouter();
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleStartTrial = () => {
    router.push('/onboarding/notifications');
  };

  const handleSkip = () => {
    router.push('/onboarding/notifications');
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col bg-meridian-ivory px-6 pt-16 pb-8">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        {/* Title */}
        <Heading
          as="h1"
          variant="serif"
          className="mb-3 text-center text-2xl leading-snug"
        >
          Try everything free for 7 days
        </Heading>

        {/* Subtitle */}
        <Text
          variant="sans"
          size="sm"
          muted
          className="mb-8 text-center"
        >
          No credit card. Cancel anytime — or don&apos;t, if it&apos;s useful.
        </Text>

        {/* Features list */}
        <div className="mb-10 space-y-4">
          {FEATURES.map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-meridian-gold text-xs text-meridian-gold">
                ✓
              </span>
              <Text variant="sans" size="sm" className="text-meridian-ink">
                {feature}
              </Text>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mb-4"
          onClick={handleStartTrial}
        >
          Start My 7 Days →
        </Button>

        {/* Secondary skip */}
        <button
          onClick={handleSkip}
          className="w-full text-center text-xs text-meridian-dust underline underline-offset-2 transition-colors hover:text-meridian-ink"
        >
          Continue with limited free version
        </button>
      </div>
    </div>
  );
}
