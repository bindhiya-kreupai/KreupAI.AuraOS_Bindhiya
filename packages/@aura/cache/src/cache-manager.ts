/**
 * Cache Manager
 *
 * Redis-backed caching layer for AuraOS.
 * Provides: get/set/delete, glob pattern delete, cache-aside (getOrSet),
 * tag-based invalidation, and function-result wrapping.
 *
 * @module @aura/cache
 */

import Redis, { type RedisOptions } from 'ioredis';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CacheManagerOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTtlSeconds?: number;
  redisOptions?: RedisOptions;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

// ---------------------------------------------------------------------------
// CacheManager
// ---------------------------------------------------------------------------

/**
 * CacheManager
 *
 * Usage:
 *   const cache = new CacheManager({ host: 'localhost', defaultTtlSeconds: 300 });
 *   await cache.connect();
 *
 *   // Simple get/set
 *   await cache.set('my-key', { data: 'value' }, 60);
 *   const val = await cache.get<{ data: string }>('my-key');
 *
 *   // Cache-aside
 *   const employee = await cache.getOrSet(
 *     CACHE_KEYS.employee('emp123'),
 *     () => db.employee.findUnique({ where: { id: 'emp123' } }),
 *     300
 *   );
 *
 *   // Tag-based invalidation
 *   await cache.set('emp:123', data, 300, ['employee', 'emp:123']);
 *   await cache.invalidateTag('employee'); // removes all keys tagged 'employee'
 */
export class CacheManager {
  private redis: Redis;
  private readonly keyPrefix: string;
  private readonly defaultTtl: number;
  private stats: CacheStats = { hits: 0, misses: 0, sets: 0, deletes: 0, hitRate: 0 };

  constructor(options: CacheManagerOptions = {}) {
    const host = options.host ?? process.env.REDIS_HOST ?? 'localhost';
    const port = options.port ?? parseInt(process.env.REDIS_PORT ?? '6379', 10);
    const password = options.password ?? process.env.REDIS_PASSWORD;

    this.keyPrefix = options.keyPrefix ?? 'aura:cache:';
    this.defaultTtl = options.defaultTtlSeconds ?? 300;

    this.redis = new Redis({
      host,
      port,
      password: password || undefined,
      db: options.db ?? 0,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 100, 3000),
      lazyConnect: true,
      ...options.redisOptions,
    });

    this.redis.on('error', (err) => {
      console.error('[CacheManager] Redis error:', err.message);
    });
  }

  async connect(): Promise<void> {
    await this.redis.connect();
    console.info('[CacheManager] Connected to Redis');
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
    console.info('[CacheManager] Disconnected from Redis');
  }

  // -------------------------------------------------------------------------
  // Core operations
  // -------------------------------------------------------------------------

  /**
   * Get a value from cache. Returns null on miss.
   * Automatically deserialises JSON.
   */
  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(this.prefixed(key));

    if (raw === null) {
      this.stats.misses += 1;
      this.updateHitRate();
      return null;
    }

    this.stats.hits += 1;
    this.updateHitRate();

    try {
      return JSON.parse(raw) as T;
    } catch {
      // Raw string value (not JSON)
      return raw as unknown as T;
    }
  }

  /**
   * Set a value in cache with optional TTL.
   * Also optionally associates the key with tags for bulk invalidation.
   */
  async set(
    key: string,
    value: unknown,
    ttlSeconds?: number,
    tags?: string[]
  ): Promise<void> {
    const prefixedKey = this.prefixed(key);
    const serialised = JSON.stringify(value);
    const ttl = ttlSeconds ?? this.defaultTtl;

    if (ttl > 0) {
      await this.redis.set(prefixedKey, serialised, 'EX', ttl);
    } else {
      await this.redis.set(prefixedKey, serialised);
    }

    this.stats.sets += 1;

    // Associate with tags
    if (tags && tags.length > 0) {
      const pipeline = this.redis.pipeline();
      for (const tag of tags) {
        pipeline.sadd(this.tagKey(tag), prefixedKey);
        // Tag sets expire after 2x the value TTL to avoid orphaned sets
        pipeline.expire(this.tagKey(tag), ttl * 2);
      }
      await pipeline.exec();
    }
  }

  /**
   * Delete a single cache key.
   */
  async delete(key: string): Promise<boolean> {
    const result = await this.redis.del(this.prefixed(key));
    if (result > 0) this.stats.deletes += 1;
    return result > 0;
  }

  /**
   * Delete all keys matching a glob pattern.
   * Uses SCAN to avoid blocking Redis.
   *
   * @example cache.deletePattern('employee:*')
   */
  async deletePattern(pattern: string): Promise<number> {
    const fullPattern = this.prefixed(pattern);
    let cursor = '0';
    let deleted = 0;

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        fullPattern,
        'COUNT',
        100
      );
      cursor = nextCursor;

      if (keys.length > 0) {
        const result = await this.redis.del(...keys);
        deleted += result;
        this.stats.deletes += result;
      }
    } while (cursor !== '0');

    return deleted;
  }

  // -------------------------------------------------------------------------
  // Cache-aside pattern
  // -------------------------------------------------------------------------

  /**
   * Get from cache; if missing, call factory, store the result, and return it.
   *
   * @param key         Cache key
   * @param factory     Function that fetches the real value on cache miss
   * @param ttlSeconds  TTL for the cached value
   * @param tags        Optional cache tags
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
    tags?: string[]
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    if (value !== null && value !== undefined) {
      await this.set(key, value, ttlSeconds, tags);
    }
    return value;
  }

  // -------------------------------------------------------------------------
  // Tag-based invalidation
  // -------------------------------------------------------------------------

  /**
   * Delete all cache keys that were tagged with the given tag.
   */
  async invalidateTag(tag: string): Promise<number> {
    const tagKey = this.tagKey(tag);
    const keys = await this.redis.smembers(tagKey);

    if (keys.length === 0) return 0;

    const pipeline = this.redis.pipeline();
    for (const key of keys) {
      pipeline.del(key);
    }
    pipeline.del(tagKey);

    const results = await pipeline.exec();
    const deleted = results ? results.filter((r) => r[0] === null && r[1] === 1).length : 0;

    this.stats.deletes += deleted;
    console.debug(`[CacheManager] Invalidated tag "${tag}": ${keys.length} keys removed`);
    return keys.length;
  }

  // -------------------------------------------------------------------------
  // Function-result caching decorator
  // -------------------------------------------------------------------------

  /**
   * Wrap a function so its result is cached by key for ttl seconds.
   *
   * @example
   *   const cachedGetEmployee = cache.wrap(
   *     (id: string) => CACHE_KEYS.employee(id),
   *     (id: string) => employeeService.findById(id),
   *     300
   *   );
   *   const emp = await cachedGetEmployee('emp_123');
   */
  wrap<TArgs extends unknown[], TReturn>(
    keyFn: (...args: TArgs) => string,
    fn: (...args: TArgs) => Promise<TReturn>,
    ttlSeconds?: number
  ): (...args: TArgs) => Promise<TReturn> {
    return (...args: TArgs) =>
      this.getOrSet<TReturn>(keyFn(...args), () => fn(...args), ttlSeconds);
  }

  // -------------------------------------------------------------------------
  // Existence check
  // -------------------------------------------------------------------------

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(this.prefixed(key));
    return result > 0;
  }

  // -------------------------------------------------------------------------
  // TTL management
  // -------------------------------------------------------------------------

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(this.prefixed(key));
  }

  async refresh(key: string, ttlSeconds?: number): Promise<boolean> {
    const result = await this.redis.expire(
      this.prefixed(key),
      ttlSeconds ?? this.defaultTtl
    );
    return result === 1;
  }

  // -------------------------------------------------------------------------
  // Statistics
  // -------------------------------------------------------------------------

  getStats(): CacheStats {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, hitRate: 0 };
  }

  isConnected(): boolean {
    return this.redis.status === 'ready';
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private prefixed(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private tagKey(tag: string): string {
    return `${this.keyPrefix}__tag__:${tag}`;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let cacheManagerInstance: CacheManager | null = null;

export function getCacheManager(options?: CacheManagerOptions): CacheManager {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager(options);
  }
  return cacheManagerInstance;
}
