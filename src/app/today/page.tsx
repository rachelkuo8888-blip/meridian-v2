'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboarding';
import { DailyInsight } from '@/components/today/daily-insight';
import { CheckinCard } from '@/components/today/checkin-card';
import { QuickAsk } from '@/components/today/quick-ask';
import { StreakDisplay } from '@/components/today/streak-display';

export default function TodayPage() {
  const router = useRouter();
  const onboardingCompleted = useOnboardingStore((s) => s.onboardingCompleted);

  // Redirect un-onboarded users
  React.useEffect(() => {
    if (!onboardingCompleted) {
      router.replace('/onboarding');
    }
  }, [onboardingCompleted, router]);

  // Don't render anything while redirecting
  if (!onboardingCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-meridian-ivory">
      <main
        className="mx-auto px-5 pt-8 pb-24 max-w-md animate-page-in"
      >
        {/* Daily Insight — greeting, energy ring, insight, focus */}
        <DailyInsight />

        {/* Separator */}
        <div className="my-6 border-t border-meridian-dust/30" />

        {/* Check-in Card */}
        <CheckinCard className="mb-6" />

        {/* Quick Ask Cards */}
        <QuickAsk />
      </main>

      {/* Streak Display — fixed bottom */}
      <StreakDisplay />
    </div>
  );
}
