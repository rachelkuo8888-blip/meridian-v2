/**
 * Coach Agent — Trigger Engine
 *
 * Defines all 20 trigger rules (4 categories) and the hourly scan logic.
 * - run_hourly_trigger_scan: checks rules, respects cooldown/caps/priority/subscription
 * - simulate_scan: returns which rules WOULD trigger without side effects
 */

import type {
  TriggerRule,
  TriggerResult,
  UserContext,
  CooldownState,
} from './types';

// ---- All 20 Trigger Rules ----

export const ALL_RULES: TriggerRule[] = [
  // ============================================================
  // Category A — Time-Based (4 rules)
  // ============================================================
  {
    id: 'daily_morning_briefing',
    name: '每日晨间简报',
    category: 'time_based',
    condition: (ctx) => {
      // Trigger at 08:00 local time (default reminder time)
      return ctx.localHour === 8;
    },
    cooldown_hours: 20,
    priority: 8,
    prompt_template_id: 'daily_briefing',
    requires_subscription: false,
    context_needed: ['today_energy_score', 'useful_god_status', 'day_clash_check'],
  },
  {
    id: 'evening_reflection_prompt',
    name: '傍晚复盘提示',
    category: 'time_based',
    condition: (ctx) => {
      // 19:00-21:00 local time AND no check-in today
      return ctx.localHour >= 19 && ctx.localHour <= 21 && !ctx.todayCheckinDone;
    },
    cooldown_hours: 20,
    priority: 5,
    prompt_template_id: 'proactive_checkin',
    requires_subscription: false,
  },
  {
    id: 'weekly_review_ready',
    name: '周报生成提醒',
    category: 'time_based',
    condition: (ctx) => {
      // Sunday 18:00 local AND check-ins this week >= 3
      return ctx.localWeekday === 0 && ctx.localHour === 18 && ctx.thisWeekCheckinCount >= 3;
    },
    cooldown_hours: 144,
    priority: 6,
    prompt_template_id: 'weekly_summary',
    requires_subscription: true,
  },
  {
    id: 'solar_term_arrival',
    name: '节气提醒',
    category: 'time_based',
    condition: (ctx) => {
      // Today is a 24 solar term boundary
      return ctx.isSolarTermToday;
    },
    cooldown_hours: 336, // ~14 days
    priority: 7,
    prompt_template_id: 'discover_content',
    requires_subscription: false,
  },

  // ============================================================
  // Category B — Behavior-Based (6 rules)
  // ============================================================
  {
    id: 'recurring_negative_mood',
    name: '连续负面情绪模式',
    category: 'behavior_based',
    condition: (ctx) => {
      // Same negative tag >= 3 times in 7 days
      const negativeTags = ['焦虑', '烦躁', '低落', '疲惫', '紧张', '愤怒', '沮丧', '压力'];
      const tagCounts = new Map<string, number>();
      for (const tag of ctx.recentTags) {
        if (negativeTags.includes(tag)) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }
      for (const [, count] of tagCounts) {
        if (count >= 3) return true;
      }
      return false;
    },
    cooldown_hours: 168, // 7 days
    priority: 9,
    prompt_template_id: 'pattern_recognition',
    requires_subscription: true,
    context_needed: ['tag_history_7d', 'memory_l3_profile'],
  },
  {
    id: 'streak_broken_recovery',
    name: 'Streak中断挽留',
    category: 'behavior_based',
    condition: (ctx) => {
      // Streak broken yesterday (prev streak >= 3 days, no check-in today)
      return ctx.prevStreak >= 3 && !ctx.todayCheckinDone && ctx.currentStreak === 0;
    },
    cooldown_hours: 24,
    priority: 7,
    prompt_template_id: 'streak_recovery',
    requires_subscription: false,
  },
  {
    id: 'lapsed_user_recall',
    name: '长期未打开挽回',
    category: 'behavior_based',
    condition: (ctx) => {
      // 3+ days since last open
      return ctx.daysSinceLastOpen >= 3;
    },
    cooldown_hours: 72,
    priority: 6,
    prompt_template_id: 'lapsed_recall',
    requires_subscription: false,
  },
  {
    id: 'positive_trend_detected',
    name: '情绪显著改善反馈',
    category: 'behavior_based',
    condition: (ctx) => {
      // Mood score avg improved >= 20% in 14 days vs prior 14 days
      const recent = ctx.moodHistory.slice(0, 14);
      const prior = ctx.moodHistory.slice(14, 28);

      if (recent.length < 3 || prior.length < 3) return false;

      const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
      const avgPrior = prior.reduce((a, b) => a + b, 0) / prior.length;

      if (avgPrior <= 0) return false;
      return (avgRecent - avgPrior) / avgPrior >= 0.2;
    },
    cooldown_hours: 336, // 14 days
    priority: 6,
    prompt_template_id: 'growth_reflection',
    requires_subscription: true,
  },
  {
    id: 'first_week_streak_milestone',
    name: '首次完成7天连续打卡',
    category: 'behavior_based',
    condition: (ctx) => {
      // Streak == 7 for first time ever
      return ctx.currentStreak === 7 && !ctx.firstWeekStreakAchieved;
    },
    cooldown_hours: 999999, // Never repeats
    priority: 8,
    prompt_template_id: 'milestone_celebration',
    requires_subscription: false,
  },
  {
    id: 'followup_after_deep_conversation',
    name: 'Companion深度对话后跟进',
    category: 'behavior_based',
    condition: (ctx) => {
      // User had key decision keywords 24h ago and no follow-up
      return (
        ctx.lastCloseConversationHoursAgo !== null &&
        ctx.lastCloseConversationHoursAgo >= 24 &&
        ctx.lastCloseConversationHoursAgo <= 48
      );
    },
    cooldown_hours: 48,
    priority: 7,
    prompt_template_id: 'decision_followup',
    requires_subscription: true,
  },

  // ============================================================
  // Category C — Chart-Based (6 rules)
  // ============================================================
  {
    id: 'day_clash_natal',
    name: '日柱冲本命日支',
    category: 'chart_based',
    condition: (ctx) => {
      // Today's day pillar clashes with natal day branch (六冲)
      if (!ctx.todayPillar || !ctx.natalChart) return false;
      // Clash pairs (六冲): 子午, 丑未, 寅申, 卯酉, 辰戌, 巳亥
      const clashPairs: Record<string, string> = {
        子: '午', 午: '子',
        丑: '未', 未: '丑',
        寅: '申', 申: '寅',
        卯: '酉', 酉: '卯',
        辰: '戌', 戌: '辰',
        巳: '亥', 亥: '巳',
      };
      const natalChart = ctx.natalChart as Record<string, unknown>;
      const pillars = natalChart.pillars as Record<string, unknown> | undefined;
      const dayPillar = pillars?.day as Record<string, unknown> | undefined;
      const natalDayBranch = dayPillar?.branch as string | undefined;

      if (!natalDayBranch) return false;
      return clashPairs[ctx.todayPillar.branch] === natalDayBranch;
    },
    cooldown_hours: 20,
    priority: 9,
    prompt_template_id: 'clash_warning',
    requires_subscription: false,
    context_needed: ['today_pillar', 'natal_day_pillar'],
  },
  {
    id: 'useful_god_activation',
    name: '今日五行为用神',
    category: 'chart_based',
    condition: (ctx) => {
      // Today's element == user's useful god
      if (!ctx.usefulGod) return false;
      return ctx.todayElement === ctx.usefulGod;
    },
    cooldown_hours: 20,
    priority: 6,
    prompt_template_id: 'favorable_day',
    requires_subscription: false,
  },
  {
    id: 'da_yun_transition_approaching',
    name: '大运转换临近',
    category: 'chart_based',
    condition: () => {
      // Next Da Yun cycle <= 90 days away — requires actual calc engine data
      // For now, return false (will be computed with real user data)
      // NOTE: This depends on Da Yun calculations from the engine
      return false;
    },
    cooldown_hours: 720, // 30 days
    priority: 8,
    prompt_template_id: 'cycle_transition_notice',
    requires_subscription: true,
  },
  {
    id: 'annual_clash_year',
    name: '流年冲太岁',
    category: 'chart_based',
    condition: (ctx) => {
      // Current year clashes with natal year (犯太岁)
      if (!ctx.natalChart) return false;
      const natalChart = ctx.natalChart as Record<number, unknown>;
      const pillars = (natalChart as Record<string, unknown>).pillars as Record<string, unknown> | undefined;
      const yearPillar = pillars?.year as Record<string, unknown> | undefined;
      const natalYearBranch = yearPillar?.branch as string | undefined;

      if (!natalYearBranch) return false;
      // Current year branch — simplified: can't determine without actual year calculation
      // Return false for now; real implementation needs year pillar calculation
      return false;
    },
    cooldown_hours: 8760, // ~1 year
    priority: 7,
    prompt_template_id: 'annual_caution',
    requires_subscription: true,
  },
  {
    id: 'favorable_combination_day',
    name: '三合/半合有利日',
    category: 'chart_based',
    condition: (ctx) => {
      // Today's branch forms triad/half-triad with natal
      if (!ctx.todayPillar || !ctx.natalChart) return false;
      // Triad groups (三合): 申子辰, 亥卯未, 寅午戌, 巳酉丑
      const triads: Record<string, string[]> = {
        申: ['申', '子', '辰'],
        子: ['申', '子', '辰'],
        辰: ['申', '子', '辰'],
        亥: ['亥', '卯', '未'],
        卯: ['亥', '卯', '未'],
        未: ['亥', '卯', '未'],
        寅: ['寅', '午', '戌'],
        午: ['寅', '午', '戌'],
        戌: ['寅', '午', '戌'],
        巳: ['巳', '酉', '丑'],
        酉: ['巳', '酉', '丑'],
        丑: ['巳', '酉', '丑'],
      };

      const natalChart = ctx.natalChart as Record<string, unknown>;
      const pillars = natalChart.pillars as Record<string, unknown> | undefined;
      const dayPillar = pillars?.day as Record<string, unknown> | undefined;
      const natalDayBranch = dayPillar?.branch as string | undefined;

      if (!natalDayBranch) return false;

      const todayBranch = ctx.todayPillar.branch;
      const natalGroup = triads[natalDayBranch];
      if (!natalGroup) return false;

      return natalGroup.includes(todayBranch);
    },
    cooldown_hours: 20,
    priority: 5,
    prompt_template_id: 'favorable_day',
    requires_subscription: false,
  },
  {
    id: 'high_energy_score_day',
    name: '高能量分数日',
    category: 'chart_based',
    condition: (ctx) => {
      // Energy score >= 85
      return ctx.todayEnergyScore >= 85;
    },
    cooldown_hours: 20,
    priority: 6,
    prompt_template_id: 'high_energy_encouragement',
    requires_subscription: false,
  },

  // ============================================================
  // Category D — Lifecycle (4 rules)
  // ============================================================
  {
    id: 'trial_ending_soon',
    name: '试用期即将结束',
    category: 'lifecycle_based',
    condition: (ctx) => {
      // Trial <= 2 days remaining AND active in last 7 days
      return (
        ctx.trialDaysRemaining !== null &&
        ctx.trialDaysRemaining <= 2 &&
        ctx.daysSinceLastOpen <= 7
      );
    },
    cooldown_hours: 999999, // Once per lifecycle
    priority: 9,
    prompt_template_id: 'trial_conversion',
    requires_subscription: false,
  },
  {
    id: 'milestone_30day_report',
    name: '30天里程碑成长报告',
    category: 'lifecycle_based',
    condition: (ctx) => {
      // Registered 30 days ago AND check-ins >= 10
      return ctx.registrationDaysAgo === 30 && ctx.totalCheckins >= 10;
    },
    cooldown_hours: 999999, // Once per lifecycle
    priority: 8,
    prompt_template_id: 'longitudinal_report_30d',
    requires_subscription: true,
  },
  {
    id: 'milestone_180day_report',
    name: '180天/年度里程碑报告',
    category: 'lifecycle_based',
    condition: (ctx) => {
      // Registered 180 days (or 365 multiple)
      return (
        ctx.registrationDaysAgo === 180 ||
        ctx.registrationDaysAgo === 365 ||
        ctx.registrationDaysAgo === 730
      );
    },
    cooldown_hours: 999999, // Once per milestone
    priority: 9,
    prompt_template_id: 'longitudinal_report_180d',
    requires_subscription: true,
  },
  {
    id: 'subscription_expiring_recall',
    name: '订阅即将到期召回',
    category: 'lifecycle_based',
    condition: (ctx) => {
      // Subscription expires in 3 days AND auto_renew=false
      return (
        ctx.subscriptionExpiresInDays !== null &&
        ctx.subscriptionExpiresInDays <= 3 &&
        !ctx.autoRenew
      );
    },
    cooldown_hours: 999999, // Once per expiry event
    priority: 9,
    prompt_template_id: 'renewal_recall',
    requires_subscription: true,
  },
];

// ---- Helper: rule lookup ----

export function getRuleById(id: string): TriggerRule | undefined {
  return ALL_RULES.find((r) => r.id === id);
}

// ---- Cooldown state (in-memory fallback) ----

const cooldownStore = new Map<string, CooldownState>();

/**
 * Check if a rule is in cooldown for a given user.
 * Falls back to in-memory store if no external cooldown state is provided.
 */
export function isInCooldown(
  ruleId: string,
  cooldownHours: number,
  externalState?: CooldownState,
): boolean {
  if (cooldownHours >= 999999) return false; // Never repeats, handled by condition logic

  const state = externalState ?? cooldownStore.get('__default__') ?? {};
  const entry = state[ruleId];
  if (!entry) return false;

  const elapsed = Date.now() - entry.lastTriggeredAt;
  return elapsed < cooldownHours * 60 * 60 * 1000;
}

/**
 * Record that a rule was triggered (set cooldown).
 */
export function recordCooldown(
  ruleId: string,
  state?: CooldownState,
): CooldownState {
  const target = state ?? cooldownStore.get('__default__') ?? {};
  target[ruleId] = { lastTriggeredAt: Date.now() };
  if (!state) {
    cooldownStore.set('__default__', target);
  }
  return target;
}

/**
 * Get the current cooldown state for a user.
 */
export function getCooldownState(userId: string): CooldownState {
  return cooldownStore.get(userId) ?? {};
}

/**
 * Set cooldown state for a user.
 */
export function setCooldownState(userId: string, state: CooldownState): void {
  cooldownStore.set(userId, state);
}

// ---- Daily message count tracking ----

const dailyMessageCounts = new Map<string, number>();

const MAX_DAILY_MESSAGES = 2;

export function getTodayMessageCount(userId: string): number {
  const key = `${userId}_${new Date().toISOString().slice(0, 10)}`;
  return dailyMessageCounts.get(key) ?? 0;
}

export function incrementMessageCount(userId: string): number {
  const key = `${userId}_${new Date().toISOString().slice(0, 10)}`;
  const count = (dailyMessageCounts.get(key) ?? 0) + 1;
  dailyMessageCounts.set(key, count);
  return count;
}

export function resetDailyCounts(): void {
  dailyMessageCounts.clear();
}

// ---- Scan Functions ----

export interface ScanResult {
  triggered: boolean;
  triggeredRules: TriggerResult[];
  dailyCount: number;
}

/**
 * Run the full hourly trigger scan.
 * Checks all 20 rules, respects cooldown/daily cap/priority/subscription.
 * Returns the highest-priority triggered rule's result.
 * Side effect: records cooldown and increments message count.
 */
export async function runHourlyTriggerScan(
  context: UserContext,
  cooldownState?: CooldownState,
): Promise<ScanResult> {
  const candidates: TriggerResult[] = [];
  const effectiveCooldown = cooldownState ?? getCooldownState(context.userId);

  // Check daily cap
  const currentCount = getTodayMessageCount(context.userId);
  if (currentCount >= MAX_DAILY_MESSAGES) {
    return { triggered: false, triggeredRules: [], dailyCount: currentCount };
  }

  for (const rule of ALL_RULES) {
    // Subscription gate
    if (rule.requires_subscription && !context.isSubscribed) continue;

    // Cooldown check
    if (isInCooldown(rule.id, rule.cooldown_hours, effectiveCooldown)) continue;

    // Evaluate condition
    const meetsCondition = await Promise.resolve(rule.condition(context));
    if (!meetsCondition) continue;

    candidates.push({
      ruleId: rule.id,
      name: rule.name,
      category: rule.category,
      priority: rule.priority,
      prompt_template_id: rule.prompt_template_id,
    });
  }

  if (candidates.length === 0) {
    return { triggered: false, triggeredRules: [], dailyCount: currentCount };
  }

  // Priority arbitration: pick highest priority
  candidates.sort((a, b) => b.priority - a.priority);
  const best = candidates[0];

  // Record cooldown and increment message count
  recordCooldown(best.ruleId, effectiveCooldown);
  const newCount = incrementMessageCount(context.userId);

  return {
    triggered: true,
    triggeredRules: candidates,
    dailyCount: newCount,
  };
}

/**
 * Simulate trigger scan — returns which rules WOULD trigger without side effects.
 */
export async function simulateScan(
  context: UserContext,
  cooldownState?: CooldownState,
): Promise<{ rules: TriggerResult[]; total: number }> {
  const candidates: TriggerResult[] = [];
  const effectiveCooldown = cooldownState ?? getCooldownState(context.userId);

  for (const rule of ALL_RULES) {
    // Subscription gate
    if (rule.requires_subscription && !context.isSubscribed) continue;

    // Cooldown check
    if (isInCooldown(rule.id, rule.cooldown_hours, effectiveCooldown)) continue;

    // Evaluate condition
    const meetsCondition = await Promise.resolve(rule.condition(context));
    if (!meetsCondition) continue;

    candidates.push({
      ruleId: rule.id,
      name: rule.name,
      category: rule.category,
      priority: rule.priority,
      prompt_template_id: rule.prompt_template_id,
    });
  }

  // Sort by priority descending for readability
  candidates.sort((a, b) => b.priority - a.priority);

  return { rules: candidates, total: candidates.length };
}
