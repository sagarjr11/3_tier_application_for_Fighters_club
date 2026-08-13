/**
 * Redis Connection (ioredis)
 * Used for:
 *   - Session/JWT token storage
 *   - Cart data (fast read/write, temporary)
 *   - Product caching (avoid repeat DB hits)
 *   - Rate limiting
 *   - OTP storage
 */
import Redis from 'ioredis'

declare global {
  var redisClient: Redis | null
}

function createRedisClient(): Redis {
  const client = new Redis({
    host:             process.env.REDIS_HOST     || 'localhost',
    port:   parseInt(process.env.REDIS_PORT      || '6379'),
    password:         process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    lazyConnect: true,
  })

  client.on('connect',  () => console.log('✅ Redis connected'))
  client.on('error',    (err) => console.error('❌ Redis error:', err))
  client.on('close',    () => console.warn('⚠️  Redis connection closed'))

  return client
}

let redis = global.redisClient
if (!redis) {
  redis = global.redisClient = createRedisClient()
}

export default redis!

// ─── Helper utilities ────────────────────────────────────────────────────────

/** Cache a value with optional TTL in seconds */
export async function setCache(key: string, value: unknown, ttlSeconds = 300) {
  await redis!.setex(key, ttlSeconds, JSON.stringify(value))
}

/** Get cached value, returns null on miss */
export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis!.get(key)
  if (!data) return null
  return JSON.parse(data) as T
}

/** Delete a cache key */
export async function deleteCache(key: string) {
  await redis!.del(key)
}

/** Delete all keys matching a pattern — e.g. 'products:*' */
export async function deleteCachePattern(pattern: string) {
  const keys = await redis!.keys(pattern)
  if (keys.length > 0) await redis!.del(...keys)
}

// Cart helpers — stored as hash per user
export const CartCache = {
  key: (userId: string) => `cart:${userId}`,

  async get(userId: string) {
    const data = await redis!.get(CartCache.key(userId))
    return data ? JSON.parse(data) : null
  },

  async set(userId: string, cart: unknown) {
    // Cart expires in 7 days
    await redis!.setex(CartCache.key(userId), 7 * 24 * 60 * 60, JSON.stringify(cart))
  },

  async clear(userId: string) {
    await redis!.del(CartCache.key(userId))
  },
}

// Session helpers
export const SessionCache = {
  key: (token: string) => `session:${token}`,

  async set(token: string, userId: string) {
    await redis!.setex(SessionCache.key(token), 7 * 24 * 60 * 60, userId)
  },

  async get(token: string): Promise<string | null> {
    return redis!.get(SessionCache.key(token))
  },

  async delete(token: string) {
    await redis!.del(SessionCache.key(token))
  },
}
