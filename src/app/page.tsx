'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if onboarding was completed
    const onboardingCompleted =
      typeof window !== 'undefined' &&
      localStorage.getItem('meridian-onboarding-completed') === 'true';

    if (onboardingCompleted) {
      router.replace('/today');
    } else {
      router.replace('/onboarding/welcome');
    }
  }, [router]);

  return null;
}
