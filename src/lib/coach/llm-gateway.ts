/**
 * Coach Agent — LLM Gateway
 *
 * Abstraction over LLM providers with:
 * - ClaudeProvider (Anthropic) — stub for now
 * - GPTProvider (OpenAI) — stub for now
 * - TemplateFallbackProvider — always works, no API key required
 * - Rate limiting: max 10 calls/minute/user
 * - Factory function createLLMProvider(config?)
 */

import type { TriggerRule, CoachContext, GeneratedMessage } from './types';
import { generatePrompt, renderTemplate } from './prompt-router';

// ---- Interfaces ----

export interface LLMProvider {
  readonly name: string;
  generate(systemPrompt: string, userContext: string): Promise<string>;
}

export interface LLMConfig {
  provider?: 'claude' | 'gpt' | 'template';
  apiKey?: string;
  apiUrl?: string;
  model?: string;
}

// ---- Rate Limiter ----

interface RateLimitEntry {
  timestamps: number[]; // epoch ms of each call
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MAX = 10; // calls per minute
const RATE_LIMIT_WINDOW = 60_000; // 1 minute in ms

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(userId) ?? { timestamps: [] };

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

  if (entry.timestamps.length >= RATE_LIMIT_MAX) {
    return false; // Rate limited
  }

  entry.timestamps.push(now);
  rateLimitStore.set(userId, entry);
  return true;
}

export function clearRateLimit(userId?: string): void {
  if (userId) {
    rateLimitStore.delete(userId);
  } else {
    rateLimitStore.clear();
  }
}

// ---- ClaudeProvider ----

export class ClaudeProvider implements LLMProvider {
  readonly name = 'Claude';

  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(config?: { apiKey?: string; apiUrl?: string; model?: string }) {
    this.apiKey = config?.apiKey ?? process.env.LLM_API_KEY ?? '';
    this.apiUrl = config?.apiUrl ?? process.env.LLM_API_URL ?? 'https://api.anthropic.com/v1/messages';
    this.model = config?.model ?? process.env.LLM_MODEL ?? 'claude-3-haiku-20240307';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generate(_systemPrompt: string, _userContext: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Not yet configured — ClaudeProvider needs an API key');
    }
    // Stub: placeholder for real Anthropic SDK integration
    throw new Error('Not yet configured — ClaudeProvider is a stub');
  }
}

// ---- GPTProvider ----

export class GPTProvider implements LLMProvider {
  readonly name = 'GPT';

  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(config?: { apiKey?: string; apiUrl?: string; model?: string }) {
    this.apiKey = config?.apiKey ?? process.env.LLM_API_KEY ?? '';
    this.apiUrl = config?.apiUrl ?? process.env.LLM_API_URL ?? 'https://api.openai.com/v1/chat/completions';
    this.model = config?.model ?? process.env.LLM_MODEL ?? 'gpt-4o-mini';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generate(_systemPrompt: string, _userContext: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Not yet configured — GPTProvider needs an API key');
    }
    // Stub: placeholder for real OpenAI SDK integration
    throw new Error('Not yet configured — GPTProvider is a stub');
  }
}

// ---- TemplateFallbackProvider ----

export class TemplateFallbackProvider implements LLMProvider {
  readonly name = 'TemplateFallback';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generate(_systemPrompt: string, _userContext: string): Promise<string> {
    // This provider is used via the renderTemplate path directly.
    // The generate() method is called when the caller wants LLM-style output
    // but no real LLM is available.
    throw new Error(
      'TemplateFallbackProvider does not support generate() — use renderTemplate() instead',
    );
  }
}

// ---- Factory ----

/**
 * Create an LLM provider based on config.
 * If no API key is configured, defaults to TemplateFallbackProvider.
 */
export function createLLMProvider(config?: LLMConfig): LLMProvider {
  const providerName = config?.provider;

  if (providerName === 'claude') {
    return new ClaudeProvider({ apiKey: config?.apiKey });
  }

  if (providerName === 'gpt') {
    return new GPTProvider({ apiKey: config?.apiKey });
  }

  // Auto-detect: if LLM_API_KEY is set, default to GPT
  const apiKey = config?.apiKey ?? process.env.LLM_API_KEY ?? '';

  if (apiKey) {
    // Default to GPT if key is configured but no provider specified
    return new GPTProvider({ apiKey });
  }

  // Fallback to template-based rendering
  return new TemplateFallbackProvider();
}

/**
 * Generate a coach message using the available LLM provider.
 * Falls back to template rendering if no real LLM is available.
 */
export async function generateCoachMessage(
  rule: TriggerRule,
  coachContext: CoachContext,
  provider?: LLMProvider,
): Promise<GeneratedMessage> {
  const llm = provider ?? createLLMProvider();

  if (llm instanceof TemplateFallbackProvider) {
    // No real LLM — use template fallback
    return renderTemplate(rule, coachContext);
  }

  // Check rate limit
  if (!checkRateLimit(coachContext.userId)) {
    // Rate limited — fall back to template
    return renderTemplate(rule, coachContext);
  }

  try {
    const { systemPrompt, userContext } = generatePrompt(rule, coachContext);
    const text = await llm.generate(systemPrompt, userContext);

    return {
      text,
      ruleId: rule.id,
      templateId: rule.prompt_template_id,
    };
  } catch {
    // LLM call failed — fall back to template
    return renderTemplate(rule, coachContext);
  }
}

export type { RateLimitEntry };
