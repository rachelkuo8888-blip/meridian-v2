/**
 * Coach Agent — Context Assembler
 *
 * Builds UserContext (all user data for trigger evaluation) from various sources:
 * - Supabase (profile, subscription, check-ins)
 * - Calc Engine (natal chart, daily energy)
 * - Memory Service (memory profile, tag history)
 * - Redis (cooldown state, message counts)
 *
 * Graceful degradation: if any service is down, falls back to defaults.
 */

import type {
  UserContext,
  CoachContext,
  CheckinRecord,
  CooldownState,
} from './types';
import { getCooldownState } from './trigger-engine';
type SupabaseClient = ReturnType<typeof createClient>;
import { createClient } from '@supabase/supabase-js';
import { calcClient } from '@/lib/services/calc-client';
import { getRedis } from '@/lib/redis';
import type { NatalChart } from '@/types/chart';

// ---- Defaults for graceful degradation ----
const DEFAULTS = {
  energyScore: 50,
  todayElement: 'Earth',
  usefulGod: null,
  pillars: null,
  recentTags: [] as string[],
  moodHistory: [] as number[],
  memoryProfile: null,
};

function elementFromBranch(branch: string): string {
  const map: Record<string, string> = {
    子: 'Water', 丑: 'Earth', 寅: 'Wood', 卯: 'Wood',
    辰: 'Earth', 巳: 'Fire', 午: 'Fire', 未: 'Earth',
    申: 'Metal', 酉: 'Metal', 戌: 'Earth', 亥: 'Water',
  };
  return map[branch] ?? 'Earth';
}

// ---- Local Supabase client (safe for server-side only) ----
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    throw new Error('Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ---- Cache for mock/solar-term data ----

function computeSolarTerm(): boolean {
  // MVP: return false (no solar term server yet)
  // In production, this would call the Calendar Engine
  return false;
}

// ---- Main builder ----

/**
 * Build full UserContext for a user.
 * Fetches from all sources with graceful degradation.
 */
export async function buildUserContext(userId: string): Promise<UserContext> {
  // Parallel fetches with fallback for each source
  let sb;
  try {
    sb = getSupabase();
  } catch {
    sb = null;
  }

  const [profileResult, chartResult, energyResult, checkinsResult, streakResult, memoryResult] =
    await Promise.allSettled([
      sb ? fetchProfile(sb, userId) : Promise.resolve(null),
      sb ? fetchNatalChart(sb, userId) : Promise.resolve(null),
      sb ? fetchDailyEnergy(sb, userId) : Promise.resolve(null),
      sb ? fetchRecentCheckins(sb, userId) : Promise.resolve([]),
      sb ? fetchStreak(sb, userId) : Promise.resolve({ current: 0, prev: 0, longest: 0 }),
      fetchMemoryProfile(userId),
    ]);

  const profile = profileResult.status === 'fulfilled' ? profileResult.value : null;
  const natalChart = chartResult.status === 'fulfilled' ? chartResult.value : null;
  const dailyEnergy = energyResult.status === 'fulfilled' ? energyResult.value : null;
  const checkins = checkinsResult.status === 'fulfilled' ? checkinsResult.value : [];
  const streak = streakResult.status === 'fulfilled' ? streakResult.value : { current: 0, prev: 0, longest: 0 };
  const memoryProfile = memoryResult.status === 'fulfilled' ? memoryResult.value : DEFAULTS.memoryProfile;

  const now = new Date();
  const localHour = now.getHours();
  const localWeekday = now.getDay(); // 0 = Sunday

  // Today's date as YYYY-MM-DD
  const todayStr = now.toISOString().slice(0, 10);

  // Check-in analysis
  const todayCheckinDone = checkins.some(
    (c: CheckinRecord) => c.date === todayStr,
  );

  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - localWeekday);
  const thisWeekStartStr = thisWeekStart.toISOString().slice(0, 10);
  const thisWeekCheckinCount = checkins.filter(
    (c: CheckinRecord) => c.date >= thisWeekStartStr,
  ).length;

  // Tag analysis from last 7 days & 14 days
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);

  const recentTags = checkins
    .filter((c: CheckinRecord) => c.date >= sevenDaysAgoStr)
    .flatMap((c: CheckinRecord) => c.tags);

  // Mood history: last 28 days
  const twentyEightDaysAgo = new Date(now);
  twentyEightDaysAgo.setDate(now.getDate() - 28);
  const twentyEightDaysAgoStr = twentyEightDaysAgo.toISOString().slice(0, 10);
  const moodHistory = checkins
    .filter((c: CheckinRecord) => c.date >= twentyEightDaysAgoStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c: CheckinRecord) => c.mood_score);

  // Days since last open
  const lastActiveStr = profile?.last_active_at ?? null;
  const daysSinceLastOpen = lastActiveStr
    ? Math.floor(
        (now.getTime() - new Date(lastActiveStr).getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  // Total checkins count
  const totalCheckins = streak.longest > 0 ? Math.max(streak.current, streak.longest) : checkins.length;

  // Subscription info
  const isSubscribed = profile?.is_subscribed ?? false;
  const trialEndStr = profile?.trial_ends_at ?? null;
  const trialDaysRemaining = trialEndStr
    ? Math.max(
        0,
        Math.ceil(
          (new Date(trialEndStr).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const subscriptionExpiresStr = profile?.subscription_ends_at ?? null;
  const subscriptionExpiresInDays = subscriptionExpiresStr
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscriptionExpiresStr).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : null;
  const autoRenew = profile?.auto_renew ?? true;

  // Registration age
  const registeredStr = profile?.created_at ?? null;
  const registrationDaysAgo = registeredStr
    ? Math.floor(
        (now.getTime() - new Date(registeredStr).getTime()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  // First week streak tracking
  const firstWeekStreakAchieved = profile?.first_week_streak_achieved ?? false;

  // Last close conversation (from memory service)
  const lastCloseConversationHoursAgo = null; // MVP: not yet tracked

  // Energy data
  const todayEnergyScore = dailyEnergy?.score ?? DEFAULTS.energyScore;
  const todayPillar = dailyEnergy?.today_pillar ?? null;
  const todayElement = todayPillar?.branch
    ? elementFromBranch(todayPillar.branch)
    : DEFAULTS.todayElement;

  // Chart data
  const usefulGod = natalChart?.useful_god ?? DEFAULTS.usefulGod;

  return {
    userId,
    profile,
    natalChart: (natalChart as unknown as Record<string, unknown>) ?? null,
    todayEnergyScore,
    todayPillar,
    todayElement,
    usefulGod,
    recentCheckins: checkins,
    todayCheckinDone,
    thisWeekCheckinCount,
    currentStreak: streak.current,
    prevStreak: streak.prev,
    longestStreak: streak.longest,
    daysSinceLastOpen,
    lastCloseConversationHoursAgo,
    recentTags,
    moodHistory,
    memoryProfile,
    isSubscribed,
    trialDaysRemaining,
    subscriptionExpiresInDays,
    autoRenew,
    registrationDaysAgo,
    totalCheckins,
    isFirstWeekStreak: streak.current === 7 && !firstWeekStreakAchieved,
    firstWeekStreakAchieved,
    localHour,
    localWeekday,
    isSolarTermToday: computeSolarTerm(),
  };
}

// ---- Fetch helpers ----

async function fetchProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

async function fetchNatalChart(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('natal_charts')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) {
    // Try fetching via Calc Engine as fallback
    try {
      const result = await calcClient.health();
      if (result.status === 'ok') {
        // Engine is alive but chart may not exist — return null
        return null;
      }
    } catch {
      // Engine down
    }
  }
  return data as unknown as NatalChart | null;
}

async function fetchDailyEnergy(
  supabase: SupabaseClient,
  userId: string,
) {
  try {
    // Try fetching natal chart first
    const chart = await fetchNatalChart(supabase, userId);
    if (!chart) return null;

    const today = new Date().toISOString().slice(0, 10);
    const result = await calcClient.dailyEnergy({
      natal_chart: chart as unknown as Record<string, unknown>,
      target_date: today,
    });
    return result;
  } catch {
    return null; // Graceful degradation
  }
}

async function fetchRecentCheckins(
  supabase: SupabaseClient,
  userId: string,
) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .gte('date', fromDate)
    .order('date', { ascending: false })
    .limit(30);

  if (error) {
    console.warn(`[ContextAssembler] Failed to fetch checkins: ${error.message}`);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    date: row.date as string,
    mood_score: (row.mood_score as number) ?? 5,
    energy_score: (row.energy_score as number) ?? 5,
    tags: (row.tags as string[]) ?? [],
    note: (row.note as string) ?? undefined,
  })) as CheckinRecord[];
}

async function fetchStreak(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from('streaks')
    .select('current_streak, prev_streak, longest_streak')
    .eq('user_id', userId)
    .single();

  if (error) {
    return { current: 0, prev: 0, longest: 0 };
  }

  return {
    current: data?.current_streak ?? 0,
    prev: data?.prev_streak ?? 0,
    longest: data?.longest_streak ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchMemoryProfile(_userId: string) {
  try {
    // Memory service — fetch L3 memory profile
    const { memoryHealth } = await import('@/lib/services/memory-client');
    const health = await memoryHealth();
    if (health.status === 'ok') {
      // In production, would call episodicMemory.search or semanticMemory.get
      return null; // MVP: not yet implemented
    }
  } catch {
    // Memory service down — graceful degradation
  }
  return DEFAULTS.memoryProfile;
}

// ---- Coach Context Assembly ----

/**
 * Assemble the specific context subset needed for a given rule.
 * Used for prompt generation.
 */
export async function assembleCoachContext(
  context: UserContext,
  ruleId: string,
): Promise<CoachContext> {
  const natalChart = context.natalChart as Record<string, unknown> | null;
  const pillars = natalChart?.pillars as Record<string, unknown> | undefined;
  const dayPillar = pillars?.day as { stem: string; branch: string } | undefined;

  return {
    userId: context.userId,
    ruleId,
    todayEnergyScore: context.todayEnergyScore,
    todayElement: context.todayElement,
    todayPillar: context.todayPillar,
    usefulGod: context.usefulGod,
    natalDayPillar: dayPillar ?? null,
    currentStreak: context.currentStreak,
    prevStreak: context.prevStreak,
    totalCheckins: context.totalCheckins,
    recentTags: context.recentTags,
    moodHistory: context.moodHistory,
    memoryProfile: context.memoryProfile,
    isSubscribed: context.isSubscribed,
    trialDaysRemaining: context.trialDaysRemaining,
    registrationDaysAgo: context.registrationDaysAgo,
    thisWeekCheckinCount: context.thisWeekCheckinCount,
    lastCloseConversationHoursAgo: context.lastCloseConversationHoursAgo,
  };
}

/**
 * Get cooldown state from Redis or in-memory fallback.
 */
export async function getCooldownForUser(
  userId: string,
): Promise<CooldownState> {
  try {
    const redis = getRedis();
    const raw = await redis.get(`coach:cooldown:${userId}`);
    if (raw) return JSON.parse(raw);
    return {};
  } catch {
    // Redis unavailable — use in-memory fallback
    return getCooldownState(userId);
  }
}

/**
 * Save cooldown state to Redis.
 */
export async function saveCooldownForUser(
  userId: string,
  state: CooldownState,
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(`coach:cooldown:${userId}`, JSON.stringify(state), 'EX', 86400 * 30);
  } catch {
    // Redis unavailable — in-memory is already updated
  }
}

/**
 * Get today's message count from Redis.
 */
export async function getDailyMessageCount(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `coach:msgcount:${userId}:${today}`;

  try {
    const redis = getRedis();
    const raw = await redis.get(key);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    // Redis unavailable — use in-memory
    const { getTodayMessageCount } = await import('./trigger-engine');
    return getTodayMessageCount(userId);
  }
}

/**
 * Increment daily message count in Redis.
 */
export async function incrementMessageCountRedis(
  userId: string,
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `coach:msgcount:${userId}:${today}`;

  try {
    const redis = getRedis();
    const count = await redis.incr(key);
    await redis.expire(key, 86400); // TTL 24h
    return count;
  } catch {
    // Redis unavailable — use in-memory
    const { incrementMessageCount } = await import('./trigger-engine');
    return incrementMessageCount(userId);
  }
}

/**
 * Store a coach message in Redis.
 */
export async function storeCoachMessage(
  userId: string,
  ruleId: string,
  text: string,
): Promise<void> {
  const message = {
    id: `${ruleId}_${Date.now()}`,
    userId,
    ruleId,
    text,
    createdAt: Date.now(),
    read: false,
  };

  try {
    const redis = getRedis();
    const key = `coach:messages:${userId}`;
    await redis.lpush(key, JSON.stringify(message));
    await redis.ltrim(key, 0, 99); // Keep last 100 messages
    await redis.expire(key, 86400 * 90); // 90 day TTL
  } catch {
    console.warn(`[Coach] Failed to store message for user ${userId}`);
  }
}

/**
 * Get recent coach messages from Redis.
 */
export async function getCoachMessages(
  userId: string,
  limit = 20,
): Promise<Array<{
  id: string;
  ruleId: string;
  text: string;
  createdAt: number;
  read: boolean;
}>> {
  try {
    const redis = getRedis();
    const key = `coach:messages:${userId}`;
    const raw = await redis.lrange(key, 0, limit - 1);
    return raw.map((r) => JSON.parse(r)).reverse();
  } catch {
    return [];
  }
}
