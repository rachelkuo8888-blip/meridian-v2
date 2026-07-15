'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading } from '@/components/ui';
import { ScreenWrapper } from '@/components/onboarding/screen-wrapper';
import { useOnboardingStore } from '@/stores/onboarding';

export default function BirthDatePage() {
  const router = useRouter();
  const { birthDate, setBirthDate } = useOnboardingStore();
  const [mounted, setMounted] = React.useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
    React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleContinue = () => {
    if (birthDate) {
      router.push('/onboarding/birth-time');
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthDate(e.target.value);
  };

  // Use today as max date (must be born before today)
  const today = new Date().toISOString().split('T')[0];

  if (!mounted) return null;

  return (
    <ScreenWrapper progressDots={{ total: 3, current: 0 }}>
      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto w-full max-w-sm">
          {/* Question */}
          <Heading
            as="h1"
            variant="serif"
            className="mb-8 text-center text-2xl leading-snug"
          >
            When were you born?
          </Heading>

          {/* Date input */}
          <div className="mb-6">
            <input
              type="date"
              value={birthDate ?? ''}
              onChange={handleDateChange}
              max={today}
              className="block w-full rounded-sm border border-meridian-dust/50 bg-white px-4 py-3 text-lg text-meridian-black focus:border-meridian-gold focus:outline-none focus:ring-2 focus:ring-meridian-gold/30"
            />
          </div>

          {/* Continue button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!birthDate}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </ScreenWrapper>
  );
}
