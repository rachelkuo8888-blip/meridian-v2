'use client';

import { create } from 'zustand';
import type { TagStat, UserAnalytics } from './types';
import { Events } from './types';
import { getEvents } from './tracker';

// Key used by the checkin store for localStorage
const CHECKIN_STORAGE_KEY = 'meridian-checkin';

interface AnalyticsStore extends UserAnalytics {
  computeStats: () => void;
}

function getNow(): Date {
  return new Date();
}

function getTodayKey(): string {
  const d = getNow();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeeksAgo(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - weeks * 7);
  return d;
}

/**
 * Compute consecutive check-in streak (in days) from checkin records.
 */
function computeStreaks(
  checkinDates: string[],
  todayKey: string,
): { bestStreak: number; currentStreak: number } {
  if (checkinDates.length === 0) {
    return { bestStreak: 0, currentStreak: 0 };
  }

  // Sort unique dates descending
  const sortedDates = [...new Set(checkinDates)].sort().reverse();

  // Compute current streak (must include today or yesterday)
  const today = new Date(todayKey + 'T00:00:00');
  let currentStreak = 0;
  let bestStreak = 1;
  let streak = 1;

  // Check if the streak starts from today or yesterday
  const latestDate = new Date(sortedDates[0] + 'T00:00:00');
  const diffDays = Math.round((today.getTime() - latestDate.getTime()) / 86400000);
  if (diffDays > 1) {
    // Streak is broken — no current streak
    currentStreak = 0;
  } else {
    currentStreak = 1;
  }

  // Compute all consecutive streaks for best streak
  for (let i = 1; i < sortedDates.length; i++) {
    const curr = new Date(sortedDates[i - 1] + 'T00:00:00');
    const prev = new Date(sortedDates[i] + 'T00:00:00');
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
      if (currentStreak > 0) currentStreak++;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      streak = 1;
      if (currentStreak > 0 && diff > 1) {
        currentStreak = 0; // current streak broken
      }
    }
  }

  if (bestStreak === 1 && sortedDates.length > 0) bestStreak = 1;

  return { bestStreak, currentStreak };
}

/**
 * Compute user-facing analytics stats from localStorage events.
 */
export const useAnalyticsStore = create<AnalyticsStore>()((set) => ({
  totalDays: 0,
  totalCheckins: 0,
  totalCoachMessages: 0,
  avgEnergyScore: 0,
  weeklyCheckins: [0, 0, 0, 0],
  commonTags: [],
  bestStreak: 0,
  currentStreak: 0,

  computeStats: () => {
    // Get all events
    const events = getEvents();
    const now = getNow();
    const todayKey = getTodayKey();

    // Count by event type
    const checkinEvents = events.filter((e) => e.name === Events.CHECKIN_COMPLETE);
    const coachMessages = events.filter((e) => e.name === Events.COACH_MESSAGE);

    // Total days = unique days with any activity
    const uniqueDays = new Set(
      events.map((e) => e.timestamp.slice(0, 10)),
    );

    // Average energy score from checkin store
    let avgEnergyScore = 0;
    try {
      const stored = localStorage.getItem(CHECKIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const checkins: Record<string, { mood?: number }> = parsed?.state?.checkins ?? {};
        const moods = Object.values(checkins)
          .map((c) => c.mood)
          .filter((m): m is number => m != null);
        if (moods.length > 0) {
          avgEnergyScore = Math.round(
            (moods.reduce((a, b) => a + b, 0) / moods.length) * 10,
          );
        }
      }
    } catch {
      // Ignore parse errors
    }

    // Weekly check-ins (last 4 weeks)
    const weeklyCheckins: number[] = [0, 0, 0, 0];
    for (const event of checkinEvents) {
      const eventDate = new Date(event.timestamp);
      for (let w = 0; w < 4; w++) {
        const weekStart = getWeeksAgo(now, w);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        if (eventDate >= weekStart && eventDate < weekEnd) {
          weeklyCheckins[w]++;
        }
      }
    }

    // Common tags from checkin store
    const tagCounts = new Map<string, number>();
    try {
      const stored = localStorage.getItem(CHECKIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const checkins: Record<string, { tags?: string[] }> =
          parsed?.state?.checkins ?? {};
        for (const checkin of Object.values(checkins)) {
          if (checkin.tags) {
            for (const tag of checkin.tags) {
              tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            }
          }
        }
      }
    } catch {
      // Ignore parse errors
    }

    const commonTags: TagStat[] = [...tagCounts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Streaks from checkin store
    let checkinDates: string[] = [];
    try {
      const stored = localStorage.getItem(CHECKIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const checkins: Record<string, unknown> =
          parsed?.state?.checkins ?? {};
        checkinDates = Object.keys(checkins).filter(
          (k) => checkins[k] && typeof checkins[k] === 'object' && (checkins[k] as Record<string, unknown>)?.completed,
        );
      }
    } catch {
      // Ignore
    }

    const { bestStreak, currentStreak } = computeStreaks(checkinDates, todayKey);

    set({
      totalDays: uniqueDays.size,
      totalCheckins: checkinEvents.length,
      totalCoachMessages: coachMessages.length,
      avgEnergyScore,
      weeklyCheckins: weeklyCheckins.reverse(), // most recent last
      commonTags,
      bestStreak,
      currentStreak,
    });
  },
}));
