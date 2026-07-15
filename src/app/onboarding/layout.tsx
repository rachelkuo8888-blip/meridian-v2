'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboarding';

/**
 * Onboarding layout — wraps all onboarding screens.
 * Handles page transition animations and redirect logic.
 */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const onboardingCompleted = useOnboardingStore((s) => s.onboardingCompleted);
  const [mounted, setMounted] = React.useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
    React.useEffect(() => {
    setMounted(true);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
    React.useEffect(() => {
    if (mounted && onboardingCompleted) {
      router.replace('/today');
    }
  }, [mounted, onboardingCompleted, router]);

  // Show nothing while checking redirect on first mount
  if (!mounted) return null;

  return (
    <div className="animate-page-in flex min-h-screen flex-col">
      {children}
    </div>
  );
}
