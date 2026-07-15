import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || ''

let redis: Redis | null = null

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null
        return Math.min(times * 200, 2000)
      },
    })
  }
  return redis
}
