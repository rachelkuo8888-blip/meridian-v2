/**
 * Simple local analytics event tracker.
 *
 * In production, this would send to Mixpanel/PostHog.
 * For MVP, it logs to console and stores to localStorage.
 */

import type { AnalyticsEvent } from './types';

const STORAGE_KEY = 'meridian-events';
const MAX_EVENTS = 500;

function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function storeEvents(events: AnalyticsEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // localStorage might be full; silently fail
  }
}

/**
 * Track an analytics event.
 * Stores to localStorage and logs in development.
 */
export function track(
  eventName: string,
  properties?: Record<string, unknown>,
): void {
  const event: AnalyticsEvent = {
    name: eventName,
    properties,
    timestamp: new Date().toISOString(),
  };

  // Store in localStorage
  const stored = getStoredEvents();
  stored.push(event);

  // Keep within limit
  while (stored.length > MAX_EVENTS) {
    stored.shift();
  }

  storeEvents(stored);

  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event.name, properties);
  }
}

/**
 * Get all stored events (for analytics store to consume).
 */
export function getEvents(): AnalyticsEvent[] {
  return getStoredEvents();
}

/**
 * Clear all stored events (for testing).
 */
export function clearEvents(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Re-export Events enum for convenience
export { Events } from './types';
