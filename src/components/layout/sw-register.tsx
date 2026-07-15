'use client';

import * as React from 'react';

/**
 * ServiceWorkerRegistration — registers the PWA service worker on mount.
 * Only runs in the browser (not SSR).
 */
export function SwRegister() {
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registered:', registration.scope);
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });
    }
  }, []);

  return null;
}
