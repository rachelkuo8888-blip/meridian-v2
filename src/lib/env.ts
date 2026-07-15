import { z } from 'zod';

/**
 * Runtime environment variable validation using Zod.
 * All env vars accessed through `env` are validated at startup.
 *
 * Usage:
 *   import { env } from '@/lib/env'
 *   const dbUrl = env.DATABASE_URL
 */

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(''),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),

  // Redis
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),

  // PostgreSQL
  DATABASE_URL: z
    .string()
    .optional()
    .default('postgresql://postgres@/meridian_memory?host=/var/run/postgresql'),

  // App
  NEXT_PUBLIC_APP_URL: z.string().optional().default('http://localhost:3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),

  // Analytics (optional)
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional().default(''),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional().default(''),

  // LLM Gateway (optional, for Coach Agent)
  LLM_API_KEY: z.string().optional().default(''),
  LLM_API_URL: z.string().optional().default(''),
  LLM_MODEL: z.string().optional().default(''),

  // Stripe (optional, for billing)
  STRIPE_SECRET_KEY: z.string().optional().default(''),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(''),

  // Calculation Engine (optional, for local dev)
  CALCULATION_ENGINE_URL: z
    .string()
    .optional()
    .default('http://localhost:8001'),

  // Memory Service (optional, for local dev)
  MEMORY_SERVICE_URL: z.string().optional().default('http://localhost:8002'),
});

type EnvSchema = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables.
 * Returns defaults for missing vars instead of throwing.
 */
function parseEnv(): EnvSchema {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // Safe: collect path names of issues without deep type inspection
    const issuePaths = parsed.error.issues.map((i) => i.path.join('.'));

    if (process.env.NODE_ENV === 'production') {
      console.error(`[Env] Validation errors for: ${issuePaths.join(', ')}`);
    }

    // Merge defaults with what process.env provides
    const defaults: Record<string, string> = {};
    for (const key of Object.keys(envSchema.shape)) {
      defaults[key] = '';
    }

    const merged = {
      ...defaults,
      ...Object.fromEntries(
        Object.entries(process.env).filter(([key]) => key in envSchema.shape),
      ),
    };

    return envSchema.parse(merged);
  }

  return parsed.data;
}

/** Validated environment variables */
export const env = parseEnv();

export type { EnvSchema };
