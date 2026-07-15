'use client';

import * as React from 'react';
import { track } from '@/lib/analytics/tracker';

/**
 * Track a page view event once per component mount.
 *
 * Usage: usePageView('today') in the page component.
 */
export function usePageView(pageName: string) {
  const tracked = React.useRef(false);

  React.useEffect(() => {
    if (!tracked.current) {
      track('page_view', { page: pageName });
      tracked.current = true;
    }
  }, [pageName]);
}
