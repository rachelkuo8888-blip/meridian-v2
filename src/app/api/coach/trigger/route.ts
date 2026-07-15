/**
 * POST /api/coach/trigger
 *
 * Runs the full trigger scan pipeline:
 * 1. Build user context (Context Assembler)
 * 2. Run hourly scan (Trigger Engine)
 * 3. For each triggered rule, assemble coach context
 * 4. Generate message via LLM Gateway (fallback to Template)
 * 5. Validate output
 * 6. Store to Redis and return the message
 * 7. Update cooldown state in Redis
 *
 * Returns: { triggered: boolean, message?: string, ruleId?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  buildUserContext,
  assembleCoachContext,
  getCooldownForUser,
  saveCooldownForUser,
  storeCoachMessage,
} from '@/lib/coach/context-assembler';
import { runHourlyTriggerScan, getRuleById } from '@/lib/coach/trigger-engine';
import { generateCoachMessage, createLLMProvider } from '@/lib/coach/llm-gateway';
import { validateOutput, sanitize } from '@/lib/coach/output-validator';
import { withErrorReporting } from '@/lib/sentry';

async function handler(req: NextRequest) {
  const body = await req.json();
  const { userId } = body;

  if (!userId || typeof userId !== 'string') {
    return NextResponse.json(
      { error: 'Missing or invalid userId' },
      { status: 400 },
    );
  }

  console.log(`[Coach Trigger] Scanning for user: ${userId}`);

  // 1. Build user context
  const userContext = await buildUserContext(userId);

  // 2. Get cooldown state from Redis
  const cooldownState = await getCooldownForUser(userId);

  // 3. Run hourly scan
  const scanResult = await runHourlyTriggerScan(userContext, cooldownState);

  if (!scanResult.triggered) {
    console.log(`[Coach Trigger] No rules triggered for user: ${userId}`);
    return NextResponse.json({
      triggered: false,
      triggeredRules: [],
      message: null,
    });
  }

  const bestRule = scanResult.triggeredRules[0];
  const rule = getRuleById(bestRule.ruleId);

  if (!rule) {
    console.warn(`[Coach Trigger] Rule not found: ${bestRule.ruleId}`);
    return NextResponse.json(
      { error: `Rule not found: ${bestRule.ruleId}` },
      { status: 500 },
    );
  }

  // 4. Assemble coach context for this rule
  const coachContext = await assembleCoachContext(userContext, rule.id);

  // 5. Generate message (LLM if available, fallback to template)
  const llm = createLLMProvider();
  const generated = await generateCoachMessage(rule, coachContext, llm);

  // 6. Validate output
  let finalText = generated.text;
  const validation = validateOutput(finalText);

  if (!validation.valid) {
    console.warn(
      `[Coach Trigger] Validation failed for rule ${rule.id}: ${validation.reason}`,
    );
    // Sanitize and retry
    finalText = sanitize(finalText);
    const retryValidation = validateOutput(finalText);
    if (!retryValidation.valid) {
      console.error(
        `[Coach Trigger] Sanitized output still invalid: ${retryValidation.reason}`,
      );
      return NextResponse.json({
        triggered: true,
        message: finalText,
        ruleId: rule.id,
        warning: `Output did not pass validation: ${retryValidation.reason}`,
      });
    }
  }

  // 7. Store to Redis
  await storeCoachMessage(userId, rule.id, finalText);

  // 8. Save cooldown state to Redis
  await saveCooldownForUser(userId, cooldownState);

  console.log(
    `[Coach Trigger] Message sent for user ${userId}: rule=${rule.id}, text="${finalText.slice(0, 60)}..."`,
  );

  return NextResponse.json({
    triggered: true,
    message: finalText,
    ruleId: rule.id,
    triggeredRules: scanResult.triggeredRules,
  });
}

export const POST = withErrorReporting(handler);
