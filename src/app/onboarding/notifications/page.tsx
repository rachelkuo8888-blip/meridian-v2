'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Heading, Text } from '@/components/ui';
import { useOnboardingStore } from '@/stores/onboarding';

export default function NotificationsPage() {
  const router = useRouter();
  const { completeOnboarding } = useOnboardingStore();
  const [time, setTime] = React.useState('08:00');
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleStart = () => {
    // Store notification preference
    localStorage.setItem('meridian-notification-time', time);
    localStorage.setItem('meridian-onboarding-completed', 'true');

    // Mark onboarding as done in store
    completeOnboarding();

    // Redirect to Today Hub
    router.push('/today');
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen flex-col bg-meridian-ivory px-6 pt-16 pb-8">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        {/* Title */}
        <Heading
          as="h1"
          variant="serif"
          className="mb-8 text-center text-2xl leading-snug"
        >
          When should Meridian check in with you?
        </Heading>

        {/* Time picker */}
        <div className="mb-6 flex justify-center">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="block w-48 rounded-sm border border-meridian-dust/50 bg-white px-4 py-3 text-center text-lg text-meridian-black focus:border-meridian-gold focus:outline-none focus:ring-2 focus:ring-meridian-gold/30"
          />
        </div>

        {/* Subtext */}
        <Text
          variant="sans"
          size="xs"
          muted
          className="mb-10 text-center"
        >
          You can change this anytime.
        </Text>

        {/* Start button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleStart}
        >
          Start
        </Button>
      </div>
    </div>
  );
}
