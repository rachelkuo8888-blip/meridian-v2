/**
 * Shared types for Meridian V2 Coach Agent (Sprint 5)
 */

// ---- Trigger Rule Types ----
export type RuleCategory =
  | 'time_based'
  | 'behavior_based'
  | 'chart_based'
  | 'lifecycle_based';

export interface TriggerRule {
  id: string;
  name: string;
  category: RuleCategory;
  condition: (context: UserContext) => boolean | Promise<boolean>;
  cooldown_hours: number;
  priority: number; // 1-10, 10 = highest
  prompt_template_id: string;
  requires_subscription: boolean;
  context_needed?: string[];
}

export interface TriggerResult {
  ruleId: string;
  name: string;
  category: RuleCategory;
  priority: number;
  prompt_template_id: string;
}

// ---- User Context Types ----
export interface UserContext {
  userId: string;
  // Profile
  profile: Record<string, unknown> | null;
  // Chart data (from Calc Engine)
  natalChart: Record<string, unknown> | null;
  todayEnergyScore: number;
  todayPillar: { stem: string; branch: string } | null;
  todayElement: string;
  usefulGod: string | null;
  // Check-in history
  recentCheckins: CheckinRecord[];
  todayCheckinDone: boolean;
  thisWeekCheckinCount: number;
  // Streak
  currentStreak: number;
  prevStreak: number;
  longestStreak: number;
  // Behavior
  daysSinceLastOpen: number;
  lastCloseConversationHoursAgo: number | null;
  recentTags: string[];
  moodHistory: number[];
  // Memory
  memoryProfile: Record<string, unknown> | null;
  // Subscription
  isSubscribed: boolean;
  trialDaysRemaining: number | null;
  subscriptionExpiresInDays: number | null;
  autoRenew: boolean;
  // Account lifecycle
  registrationDaysAgo: number;
  totalCheckins: number;
  isFirstWeekStreak: boolean;
  firstWeekStreakAchieved: boolean;
  // Hour / weekday
  localHour: number;
  localWeekday: number; // 0=Sunday, 6=Saturday
  // Solar term
  isSolarTermToday: boolean;
}

export interface CheckinRecord {
  date: string;
  mood_score: number;
  energy_score: number;
  tags: string[];
  note?: string;
}

// ---- Coach Context (assembled per rule) ----
export interface CoachContext {
  userId: string;
  ruleId: string;
  todayEnergyScore: number;
  todayElement: string;
  todayPillar: { stem: string; branch: string } | null;
  usefulGod: string | null;
  natalDayPillar: { stem: string; branch: string } | null;
  currentStreak: number;
  prevStreak: number;
  totalCheckins: number;
  recentTags: string[];
  moodHistory: number[];
  memoryProfile: Record<string, unknown> | null;
  isSubscribed: boolean;
  trialDaysRemaining: number | null;
  registrationDaysAgo: number;
  thisWeekCheckinCount: number;
  lastCloseConversationHoursAgo: number | null;
}

// ---- Cooldown Types ----
export interface CooldownState {
  [ruleId: string]: {
    lastTriggeredAt: number; // epoch ms
  };
}

export interface DailyMessageCount {
  date: string; // YYYY-MM-DD
  count: number;
}

// ---- Coach Message ----
export interface CoachMessage {
  id: string;
  userId: string;
  ruleId: string;
  text: string;
  createdAt: number; // epoch ms
  read: boolean;
}

// ---- Prompt Template ----
export interface PromptTemplate {
  id: string;
  tone: string;
  systemPrompt: string;
  maxLength: number;
}

export interface GeneratedMessage {
  text: string;
  ruleId: string;
  templateId: string;
}

// ---- Output Validation ----
export interface ValidationResult {
  valid: boolean;
  reason?: string;
}
