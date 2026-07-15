'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboarding';
import dynamic from 'next/dynamic';
import { usePageView } from '@/hooks/use-page-view';

const DailyInsight = dynamic(() => import('@/components/today/daily-insight').then((m) => ({ default: m.DailyInsight })), { ssr: false });
const CheckinCard = dynamic(() => import('@/components/today/checkin-card').then((m) => ({ default: m.CheckinCard })), { ssr: false });
const QuickAsk = dynamic(() => import('@/components/today/quick-ask').then((m) => ({ default: m.QuickAsk })), { ssr: false });
const StreakDisplay = dynamic(() => import('@/components/today/streak-display').then((m) => ({ default: m.StreakDisplay })), { ssr: false });

export default function TodayPage() {
  usePageView('today');
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
