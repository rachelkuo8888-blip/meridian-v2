import Redis from 'ioredis';
import { env } from '@/lib/env';

let redis: Redis | null = null;

const DEFAULT_REDIS_URL = 'redis://localhost:6379';

/**
 * Get or create a Redis connection singleton.
 * Uses REDIS_URL from env, falls back to localhost:6379.
 */
export function getRedis(): Redis {
  if (!redis) {
    const url = env.REDIS_URL || DEFAULT_REDIS_URL;

    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          console.error(`Redis connection failed after ${times} attempts`);
          return null; // Stop retrying
        }
        const delay = Math.min(times * 200, 5000);
        return delay;
      },
      enableReadyCheck: true,
      lazyConnect: false,
      // Default timeouts
      connectTimeout: 10000,
      disconnectTimeout: 5000,
      commandTimeout: 5000,
    });

    redis.on('connect', () => {
      console.log('[Redis] Connected');
    });

    redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });

    redis.on('ready', () => {
      console.log('[Redis] Ready');
    });

    redis.on('close', () => {
      console.warn('[Redis] Connection closed');
    });

    redis.on('reconnecting', (timeToReconnect: number) => {
      console.log(`[Redis] Reconnecting in ${timeToReconnect}ms`);
    });
  }
  return redis;
}

/**
 * Health check: returns whether Redis is connected and responsive.
 */
export async function redisHealthCheck(): Promise<{
  connected: boolean;
  latencyMs: number | null;
}> {
  try {
    const start = Date.now();
    const redis = getRedis();
    await redis.ping();
    return { connected: true, latencyMs: Date.now() - start };
  } catch {
    return { connected: false, latencyMs: null };
  }
}

/**
 * Gracefully close the Redis connection.
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export type { Redis };
