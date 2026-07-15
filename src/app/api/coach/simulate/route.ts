/**
 * POST /api/coach/simulate
 *
 * Runs simulate_scan — returns which rules WOULD trigger without side effects.
 * Useful for debugging/testing the trigger engine.
 *
 * Returns: { rules: Array<{ ruleId, name, category, priority }>, total: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildUserContext, getCooldownForUser } from '@/lib/coach/context-assembler';
import { simulateScan } from '@/lib/coach/trigger-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid userId' },
        { status: 400 },
      );
    }

    console.log(`[Coach Simulate] Simulating scan for user: ${userId}`);

    // Build user context
    const userContext = await buildUserContext(userId);

    // Get cooldown state
    const cooldownState = await getCooldownForUser(userId);

    // Simulate scan (no side effects)
    const result = await simulateScan(userContext, cooldownState);

    console.log(
      `[Coach Simulate] User ${userId}: ${result.total} rules would trigger`,
    );
    for (const rule of result.rules) {
      console.log(
        `  - [P${rule.priority}] ${rule.ruleId}: ${rule.name} (${rule.category})`,
      );
    }

    return NextResponse.json({
      rules: result.rules.map((r) => ({
        ruleId: r.ruleId,
        name: r.name,
        category: r.category,
        priority: r.priority,
        prompt_template_id: r.prompt_template_id,
      })),
      total: result.total,
      context: {
        userId,
        energyScore: userContext.todayEnergyScore,
        todayElement: userContext.todayElement,
        currentStreak: userContext.currentStreak,
        thisWeekCheckinCount: userContext.thisWeekCheckinCount,
        daysSinceLastOpen: userContext.daysSinceLastOpen,
        isSubscribed: userContext.isSubscribed,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Coach Simulate] Error: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
