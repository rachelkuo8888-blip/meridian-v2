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
 * Cache get: retrieve a value from Redis by key.
 * Returns parsed JSON or null on miss/error.
 * Gracefully falls through if Redis is unavailable.
 */
export async function cacheGet<T = unknown>(
  key: string,
): Promise<T | null> {
  try {
    const r = getRedis();
    const raw = await r.get(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[Redis cacheGet] Failed for key "${key}":`, err);
    return null;
  }
}

/**
 * Cache set: store a value in Redis with TTL.
 * Gracefully fails silently if Redis is unavailable.
 */
export async function cacheSet<T = unknown>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  try {
    const r = getRedis();
    const serialized = JSON.stringify(value);
    await r.setex(key, ttlSeconds, serialized);
  } catch (err) {
    console.warn(`[Redis cacheSet] Failed for key "${key}":`, err);
  }
}

/**
 * cacheWrap: get from cache or fetch and cache.
 *
 * @param key - Cache key
 * @param ttlSeconds - Time-to-live in seconds
 * @param fetcher - Async function to fetch data on cache miss
 * @returns Cached or freshly-fetched value
 */
export async function cacheWrap<T = unknown>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  // Try cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const fresh = await fetcher();

  // Store in cache (fire-and-forget, don't block on failure)
  cacheSet(key, fresh, ttlSeconds).catch(() => {
    // Silently ignore — cache is best-effort
  });

  return fresh;
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
