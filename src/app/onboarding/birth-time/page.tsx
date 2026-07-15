'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Text } from '@/components/ui';
import { ScreenWrapper } from '@/components/onboarding/screen-wrapper';
import { useOnboardingStore, type BirthTimeConfidence } from '@/stores/onboarding';
import { cn } from '@/lib/utils';

const UNCERTAIN_OPTIONS: { value: BirthTimeConfidence; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
  { value: 'skip', label: 'Skip entirely' },
];

export default function BirthTimePage() {
  const router = useRouter();
  const {
    birthTime,
    birthTimeConfidence,
    setBirthTime,
    setBirthTimeConfidence,
  } = useOnboardingStore();
  const [showUncertain, setShowUncertain] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
    React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleContinue = () => {
    if (birthTime || birthTimeConfidence) {
      router.push('/onboarding/birth-location');
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthTime(e.target.value);
    setBirthTimeConfidence('exact');
    setShowUncertain(false);
  };

  const handleUncertainSelect = (value: BirthTimeConfidence) => {
    setBirthTimeConfidence(value);
    setShowUncertain(false);
  };

  const handleNotSure = () => {
    setShowUncertain(true);
  };

  if (!mounted) return null;

  const hasTime = birthTime || birthTimeConfidence;

  return (
    <ScreenWrapper progressDots={{ total: 3, current: 1 }}>
      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto w-full max-w-sm">
          {/* Question */}
          <Heading
            as="h1"
            variant="serif"
            className="mb-8 text-center text-2xl leading-snug"
          >
            What time, if you know it?
          </Heading>

          {/* Time input */}
          <div className="mb-4">
            <input
              type="time"
              value={birthTime ?? ''}
              onChange={handleTimeChange}
              className="block w-full rounded-sm border border-meridian-dust/50 bg-white px-4 py-3 text-lg text-meridian-black focus:border-meridian-gold focus:outline-none focus:ring-2 focus:ring-meridian-gold/30"
            />
          </div>

          {/* "I'm not sure" link */}
          {!showUncertain && (
            <button
              onClick={handleNotSure}
              className="mb-6 block w-full text-center text-sm text-meridian-dust underline underline-offset-2 transition-colors hover:text-meridian-gold"
            >
              I&apos;m not sure
            </button>
          )}

          {/* Uncertain options */}
          {showUncertain && (
            <div className="mb-6 space-y-2">
              <Text
                size="xs"
                muted
                className="mb-3 text-center italic"
              >
                That&apos;s okay. Try your best guess — even &quot;morning&quot; or
                &quot;evening&quot; helps.
              </Text>
              <div className="flex flex-wrap justify-center gap-2">
                {UNCERTAIN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleUncertainSelect(opt.value)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm transition-all',
                      birthTimeConfidence === opt.value
                        ? 'border-meridian-gold bg-meridian-gold/10 text-meridian-black'
                        : 'border-meridian-dust/40 text-meridian-dust hover:border-meridian-gold/60 hover:text-meridian-gold',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Continue button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!hasTime}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </ScreenWrapper>
  );
}
