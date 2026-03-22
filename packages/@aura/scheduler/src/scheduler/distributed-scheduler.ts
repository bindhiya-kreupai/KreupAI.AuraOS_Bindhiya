/**
 * @module DistributedScheduler
 * @description Cron-based scheduler with Redis distributed locking.
 *
 * Prevents duplicate job execution across multiple service instances by
 * using Redis SET NX EX ("set if not exists with TTL") for advisory locks.
 *
 * Lock key format: aura:scheduler:lock:{jobName}
 *
 * @project  AURA HCM Platform
 * @section  Sec 26.3 — Distributed Scheduler
 * @reference docs/aura-master-instructions.md
 */

import Redis from 'ioredis';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScheduledJob {
  /** Unique job identifier (used as part of the Redis lock key). */
  name: string;
  /** Standard cron expression, e.g. "0 9 * * *" for 09:00 daily. */
  cron: string;
  /** Async function to execute. Must resolve or reject within lockTtlSeconds. */
  handler: () => Promise<void>;
  /**
   * How long (seconds) to hold the Redis lock.
   * Guards against slow jobs re-triggering before the previous run finishes.
   * Default: 300 seconds (5 minutes).
   */
  lockTtlSeconds?: number;
  /** If false the job is registered but never executed. Default: true. */
  enabled?: boolean;
}

interface JobEntry extends Required<ScheduledJob> {
  /** Node.js interval handle returned by setInterval */
  _intervalHandle: ReturnType<typeof setInterval> | null;
  /** ISO string of the last time this job ran (or null). */
  lastRun: string | null;
  /** ISO string of the last time this job completed successfully (or null). */
  lastSuccess: string | null;
  /** Count of consecutive failures. */
  failureCount: number;
}

// ---------------------------------------------------------------------------
// Cron parser
// ---------------------------------------------------------------------------

/**
 * Minimal cron-expression evaluator.
 *
 * Supports the standard five-field format:
 *   minute  hour  day-of-month  month  day-of-week
 *
 * Wildcards (*), comma-lists (1,2,3) and step values (* /15) are supported.
 * Does NOT support ranges (1-5) other than via expansion.  Extend as needed.
 */
function cronMatches(cron: string, date: Date): boolean {
  const fields = cron.trim().split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`Invalid cron expression "${cron}": must have 5 fields`);
  }

  const [minField, hourField, domField, monField, dowField] = fields;

  const minute  = date.getMinutes();
  const hour    = date.getHours();
  const dom     = date.getDate();          // 1-31
  const month   = date.getMonth() + 1;    // 1-12
  const dow     = date.getDay();           // 0 (Sun) – 6 (Sat)

  return (
    fieldMatches(minField,  minute,  0, 59) &&
    fieldMatches(hourField, hour,    0, 23) &&
    fieldMatches(domField,  dom,     1, 31) &&
    fieldMatches(monField,  month,   1, 12) &&
    fieldMatches(dowField,  dow,     0,  6)
  );
}

function fieldMatches(field: string, value: number, _min: number, _max: number): boolean {
  if (field === '*') return true;

  // Step: */15 or 1/15
  if (field.includes('/')) {
    const [rangeStr, stepStr] = field.split('/');
    const step = parseInt(stepStr, 10);
    if (isNaN(step) || step <= 0) return false;

    if (rangeStr === '*') {
      return value % step === 0;
    }
    const start = parseInt(rangeStr, 10);
    if (isNaN(start)) return false;
    return value >= start && (value - start) % step === 0;
  }

  // Range: 1-5
  if (field.includes('-')) {
    const [startStr, endStr] = field.split('-');
    const start = parseInt(startStr, 10);
    const end   = parseInt(endStr, 10);
    if (isNaN(start) || isNaN(end)) return false;
    return value >= start && value <= end;
  }

  // Comma-list: 1,3,5
  if (field.includes(',')) {
    return field.split(',').some((v) => parseInt(v.trim(), 10) === value);
  }

  // Literal
  const parsed = parseInt(field, 10);
  return !isNaN(parsed) && parsed === value;
}

// ---------------------------------------------------------------------------
// Redis connection helper
// ---------------------------------------------------------------------------

function createRedisClient(): Redis {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  return new Redis({
    host,
    port,
    password,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => Math.min(times * 100, 3000),
    lazyConnect: true,
  });
}

// ---------------------------------------------------------------------------
// DistributedScheduler
// ---------------------------------------------------------------------------

export class DistributedScheduler {
  private readonly redis: Redis;
  private readonly jobs: Map<string, JobEntry> = new Map();
  private running = false;

  /**
   * @param redisClient  Provide an existing ioredis instance (useful in tests).
   *                     If omitted, a new client is created from environment variables.
   */
  constructor(redisClient?: Redis) {
    this.redis = redisClient ?? createRedisClient();
  }

  // --------------------------------------------------------------------------
  // Public API
  // --------------------------------------------------------------------------

  /**
   * Register a scheduled job.
   * If a job with the same name is already registered, it will be replaced.
   */
  registerJob(job: ScheduledJob): void {
    const entry: JobEntry = {
      name:           job.name,
      cron:           job.cron,
      handler:        job.handler,
      lockTtlSeconds: job.lockTtlSeconds ?? 300,
      enabled:        job.enabled ?? true,
      _intervalHandle: null,
      lastRun:        null,
      lastSuccess:    null,
      failureCount:   0,
    };

    // Deregister existing ticker if hot-reloading
    const existing = this.jobs.get(job.name);
    if (existing?._intervalHandle) {
      clearInterval(existing._intervalHandle);
    }

    this.jobs.set(job.name, entry);

    if (this.running && entry.enabled) {
      this.startJobTicker(entry);
    }

    console.log(`[DistributedScheduler] Registered job "${job.name}" (cron: ${job.cron})`);
  }

  /**
   * Start the cron evaluation loop.
   * Connects to Redis and starts a 60-second ticker for each registered job.
   */
  async start(): Promise<void> {
    if (this.running) {
      console.warn('[DistributedScheduler] Already running — ignoring start()');
      return;
    }

    // Ensure Redis is connected
    if (this.redis.status !== 'ready') {
      await this.redis.connect();
    }

    this.running = true;
    console.log(`[DistributedScheduler] Started with ${this.jobs.size} job(s)`);

    for (const entry of this.jobs.values()) {
      if (entry.enabled) {
        this.startJobTicker(entry);
      }
    }

    // Clean up on process exit
    process.once('SIGTERM', () => this.stop());
    process.once('SIGINT',  () => this.stop());
  }

  /**
   * Stop all cron tickers and release the Redis connection.
   */
  async stop(): Promise<void> {
    if (!this.running) return;

    this.running = false;
    console.log('[DistributedScheduler] Stopping...');

    for (const entry of this.jobs.values()) {
      if (entry._intervalHandle) {
        clearInterval(entry._intervalHandle);
        entry._intervalHandle = null;
      }
    }

    try {
      await this.redis.quit();
    } catch {
      // Ignore quit errors during shutdown
    }

    console.log('[DistributedScheduler] Stopped.');
  }

  /**
   * Attempt to acquire a distributed lock for a job.
   *
   * Uses Redis SET NX EX which is atomic: it sets the key only if it does
   * not already exist and assigns a TTL so the lock is auto-released even
   * if the process crashes.
   *
   * @returns true  if the lock was acquired (this instance should run the job)
   * @returns false if another instance already holds the lock
   */
  async acquireLock(jobName: string, ttlSeconds: number): Promise<boolean> {
    const key = this.lockKey(jobName);
    // SET key value NX EX ttl — returns 'OK' on success, null on failure
    const result = await this.redis.set(key, '1', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  /**
   * Release the distributed lock for a job.
   * Safe to call even if the lock does not exist (e.g. already expired).
   */
  async releaseLock(jobName: string): Promise<void> {
    const key = this.lockKey(jobName);
    await this.redis.del(key);
  }

  /** Return a snapshot of all registered jobs (without internal handles). */
  getRegisteredJobs(): Omit<JobEntry, '_intervalHandle'>[] {
    return Array.from(this.jobs.values()).map(({ _intervalHandle, ...rest }) => rest);
  }

  // --------------------------------------------------------------------------
  // Private helpers
  // --------------------------------------------------------------------------

  private lockKey(jobName: string): string {
    return `aura:scheduler:lock:${jobName}`;
  }

  /**
   * Start a per-minute setInterval ticker for a job.
   * On each tick, evaluate whether the cron expression matches the current
   * minute; if so, attempt to acquire the lock and run the handler.
   */
  private startJobTicker(entry: JobEntry): void {
    // Align to the next full minute boundary
    const msUntilNextMinute = 60_000 - (Date.now() % 60_000);

    const startTicking = () => {
      const handle = setInterval(() => {
        const now = new Date();
        // Zero out seconds/ms so the cron evaluation is deterministic
        now.setSeconds(0, 0);

        if (cronMatches(entry.cron, now)) {
          void this.runJobWithLock(entry);
        }
      }, 60_000);

      entry._intervalHandle = handle;
    };

    // First fire at the next full-minute mark, then every 60 s
    setTimeout(startTicking, msUntilNextMinute);
  }

  /** Acquire lock → run handler → release lock. */
  private async runJobWithLock(entry: JobEntry): Promise<void> {
    const lockAcquired = await this.acquireLock(entry.name, entry.lockTtlSeconds);

    if (!lockAcquired) {
      // Another instance is already running this job — skip silently
      return;
    }

    entry.lastRun = new Date().toISOString();
    const start = Date.now();

    console.log(`[DistributedScheduler] Starting job "${entry.name}" at ${entry.lastRun}`);

    try {
      await entry.handler();
      const elapsed = Date.now() - start;
      entry.lastSuccess = new Date().toISOString();
      entry.failureCount = 0;
      console.log(`[DistributedScheduler] Job "${entry.name}" completed in ${elapsed}ms`);
    } catch (err) {
      entry.failureCount++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        `[DistributedScheduler] Job "${entry.name}" failed (consecutive failures: ${entry.failureCount}): ${msg}`,
      );
    } finally {
      // Release early — don't hold the lock for the full TTL
      await this.releaseLock(entry.name);
    }
  }
}

// ---------------------------------------------------------------------------
// Module-level singleton
// ---------------------------------------------------------------------------

let schedulerInstance: DistributedScheduler | null = null;

/**
 * Return (or lazily create) the module-level singleton scheduler.
 * Optionally provide a custom Redis client for testing.
 */
export function getDistributedScheduler(redisClient?: Redis): DistributedScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new DistributedScheduler(redisClient);
  }
  return schedulerInstance;
}

/** Reset the singleton (primarily for tests). */
export function resetDistributedScheduler(): void {
  schedulerInstance = null;
}
