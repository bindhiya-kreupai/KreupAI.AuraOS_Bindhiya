/**
 * In-Memory Redis Mock
 *
 * Implements the subset of ioredis/Redis API used by @aura/cache and
 * @aura/scheduler in tests.  No external dependencies.
 *
 * Supports: get, set, del, exists, expire, ttl, keys, scan,
 *           sadd, smembers, zadd, zrevrange, pipeline, quit, ping
 *
 * @module @aura/testing
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RedisMockEntry {
  value: string;
  expiresAt: number | null;  // Unix ms, null = no expiry
}

// ---------------------------------------------------------------------------
// InMemoryRedisMock
// ---------------------------------------------------------------------------

export class InMemoryRedisMock {
  private store = new Map<string, RedisMockEntry>();
  private sets  = new Map<string, Set<string>>();
  private sortedSets = new Map<string, Map<string, number>>();
  public status: string = 'ready';

  // -------------------------------------------------------------------------
  // Basic string operations
  // -------------------------------------------------------------------------

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(
    key: string,
    value: string,
    exMode?: 'EX' | 'PX',
    ttl?: number
  ): Promise<'OK'> {
    let expiresAt: number | null = null;
    if (exMode === 'EX' && ttl) expiresAt = Date.now() + ttl * 1000;
    if (exMode === 'PX' && ttl) expiresAt = Date.now() + ttl;
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) count++;
      this.sets.delete(key);
      this.sortedSets.delete(key);
    }
    return count;
  }

  async exists(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.store.has(key) || this.sets.has(key) || this.sortedSets.has(key)) count++;
    }
    return count;
  }

  async expire(key: string, seconds: number): Promise<0 | 1> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2;
    if (entry.expiresAt === null) return -1;
    const remaining = Math.ceil((entry.expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  // -------------------------------------------------------------------------
  // Key pattern matching
  // -------------------------------------------------------------------------

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      '^' +
      pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.') +
      '$'
    );
    return [...this.store.keys(), ...this.sets.keys(), ...this.sortedSets.keys()]
      .filter((k) => regex.test(k));
  }

  async scan(
    cursor: string,
    matchCmd: string,
    pattern: string,
    countCmd: string,
    count: number
  ): Promise<[string, string[]]> {
    const allKeys = await this.keys(pattern);
    const start = parseInt(cursor, 10);
    const batch = allKeys.slice(start, start + count);
    const nextCursor = start + count >= allKeys.length ? '0' : String(start + count);
    return [nextCursor, batch];
  }

  // -------------------------------------------------------------------------
  // Set operations
  // -------------------------------------------------------------------------

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.sets.has(key)) this.sets.set(key, new Set());
    const set = this.sets.get(key)!;
    let added = 0;
    for (const m of members) {
      if (!set.has(m)) { set.add(m); added++; }
    }
    return added;
  }

  async smembers(key: string): Promise<string[]> {
    return [...(this.sets.get(key) ?? [])];
  }

  // -------------------------------------------------------------------------
  // Sorted set operations
  // -------------------------------------------------------------------------

  async zadd(key: string, score: number, member: string): Promise<number> {
    if (!this.sortedSets.has(key)) this.sortedSets.set(key, new Map());
    const ss = this.sortedSets.get(key)!;
    const added = !ss.has(member) ? 1 : 0;
    ss.set(member, score);
    return added;
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    const ss = this.sortedSets.get(key);
    if (!ss) return [];
    const sorted = [...ss.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([member]) => member);
    const end = stop === -1 ? sorted.length : stop + 1;
    return sorted.slice(start, end);
  }

  // -------------------------------------------------------------------------
  // Connection
  // -------------------------------------------------------------------------

  async ping(): Promise<'PONG'> {
    return 'PONG';
  }

  async quit(): Promise<'OK'> {
    this.status = 'end';
    return 'OK';
  }

  async connect(): Promise<void> {
    this.status = 'ready';
  }

  on(_event: string, _handler: unknown): this {
    return this;
  }

  // -------------------------------------------------------------------------
  // Pipeline (sequential mock)
  // -------------------------------------------------------------------------

  pipeline(): RedisMockPipeline {
    return new RedisMockPipeline(this);
  }

  // -------------------------------------------------------------------------
  // Test helpers
  // -------------------------------------------------------------------------

  /** Flush all data (call in beforeEach/afterEach) */
  flushAll(): void {
    this.store.clear();
    this.sets.clear();
    this.sortedSets.clear();
  }

  /** Return all stored keys (for test assertions) */
  allKeys(): string[] {
    return [...this.store.keys(), ...this.sets.keys(), ...this.sortedSets.keys()];
  }

  size(): number {
    return this.store.size + this.sets.size + this.sortedSets.size;
  }
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

type PipelineCommand = () => Promise<unknown>;

export class RedisMockPipeline {
  private commands: PipelineCommand[] = [];

  constructor(private readonly redis: InMemoryRedisMock) {}

  set(key: string, value: string, ...args: unknown[]): this {
    const [exMode, ttl] = args as [('EX' | 'PX')?, number?];
    this.commands.push(() => this.redis.set(key, value, exMode, ttl));
    return this;
  }

  del(...keys: string[]): this {
    this.commands.push(() => this.redis.del(...keys));
    return this;
  }

  expire(key: string, seconds: number): this {
    this.commands.push(() => this.redis.expire(key, seconds));
    return this;
  }

  sadd(key: string, ...members: string[]): this {
    this.commands.push(() => this.redis.sadd(key, ...members));
    return this;
  }

  zadd(key: string, score: number, member: string): this {
    this.commands.push(() => this.redis.zadd(key, score, member));
    return this;
  }

  async exec(): Promise<Array<[null, unknown]>> {
    const results: Array<[null, unknown]> = [];
    for (const cmd of this.commands) {
      const result = await cmd();
      results.push([null, result]);
    }
    return results;
  }
}
