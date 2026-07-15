/**
 * Analytics types — user-facing stats computed from local events
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: string;
}

export interface TagStat {
  tag: string;
  count: number;
}

export interface UserAnalytics {
  totalDays: number;
  totalCheckins: number;
  totalCoachMessages: number;
  avgEnergyScore: number;
  weeklyCheckins: number[]; // Last 4 weeks — number of check-ins per week (max 7)
  commonTags: TagStat[];
  bestStreak: number;
  currentStreak: number;
}

/** Predefined event names used across the app */
export const Events = {
  PAGE_VIEW: 'page_view',
  CHECKIN_COMPLETE: 'checkin_complete',
  COACH_MESSAGE: 'coach_message',
  CHART_VIEW: 'chart_view',
  SUBSCRIPTION_START: 'subscription_start',
  SUBSCRIPTION_COMPLETE: 'subscription_complete',
  TRIAL_START: 'trial_start',
  INVITE_SENT: 'invite_sent',
  LESSON_COMPLETE: 'lesson_complete',
  BADGE_EARNED: 'badge_earned',
} as const;
