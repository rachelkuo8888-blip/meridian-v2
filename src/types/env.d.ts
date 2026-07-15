/**
 * Type declarations for process.env to provide type safety
 * when accessing environment variables directly.
 *
 * NOTE: Prefer using `import { env } from '@/lib/env'` for validated access.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;

    // Redis
    REDIS_URL?: string;

    // PostgreSQL
    DATABASE_URL?: string;

    // App
    NEXT_PUBLIC_APP_URL?: string;
    NODE_ENV?: 'development' | 'production' | 'test';

    // Analytics
    NEXT_PUBLIC_ANALYTICS_ID?: string;
    NEXT_PUBLIC_POSTHOG_KEY?: string;

    // LLM Gateway
    LLM_API_KEY?: string;
    LLM_API_URL?: string;
    LLM_MODEL?: string;

    // Stripe
    STRIPE_SECRET_KEY?: string;
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;

    // Calculation Engine
    CALCULATION_ENGINE_URL?: string;

    // Memory Service
    MEMORY_SERVICE_URL?: string;
  }
}
