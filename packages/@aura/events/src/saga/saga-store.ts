/**
 * Saga State Store — Redis-backed persistence
 *
 * Stores saga state so that:
 *   - Saga progress survives service restarts
 *   - Operations teams can inspect in-flight/failed sagas
 *   - Dead sagas can be manually resumed or compensated
 *
 * Key format:  aura:saga:{sagaId}
 * Index key:   aura:saga:index:{sagaName}  (sorted set, score = createdAt unix)
 *
 * @module @aura/events/saga
 */

import { SagaState } from './saga-orchestrator';

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface SagaStateStore {
  save(state: SagaState): Promise<void>;
  load(sagaId: string): Promise<SagaState | null>;
  listBySaga(sagaName: string, limit?: number): Promise<SagaState[]>;
  listByStatus(status: string, limit?: number): Promise<SagaState[]>;
  delete(sagaId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Redis-backed implementation
// ---------------------------------------------------------------------------

export interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ex?: 'EX', ttl?: number): Promise<unknown>;
  del(key: string): Promise<unknown>;
  zadd(key: string, score: number, member: string): Promise<unknown>;
  zrevrange(key: string, start: number, stop: number): Promise<string[]>;
  keys(pattern: string): Promise<string[]>;
}

const SAGA_KEY_PREFIX = 'aura:saga:';
const SAGA_INDEX_PREFIX = 'aura:saga:index:';
const SAGA_STATUS_INDEX = 'aura:saga:status:';
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export class RedisSagaStore implements SagaStateStore {
  constructor(private readonly redis: RedisLike) {}

  async save(state: SagaState): Promise<void> {
    const key = `${SAGA_KEY_PREFIX}${state.sagaId}`;
    const serialised = JSON.stringify(state);
    const score = state.startedAt.getTime();

    // Store saga state with TTL
    await this.redis.set(key, serialised, 'EX', DEFAULT_TTL_SECONDS);

    // Index by saga name
    const nameIndex = `${SAGA_INDEX_PREFIX}${state.sagaName}`;
    await this.redis.zadd(nameIndex, score, state.sagaId);

    // Index by status
    const statusIndex = `${SAGA_STATUS_INDEX}${state.status}`;
    await this.redis.zadd(statusIndex, score, state.sagaId);
  }

  async load(sagaId: string): Promise<SagaState | null> {
    const key = `${SAGA_KEY_PREFIX}${sagaId}`;
    const raw = await this.redis.get(key);
    if (!raw) return null;

    return this.deserialise(raw);
  }

  async listBySaga(sagaName: string, limit = 50): Promise<SagaState[]> {
    const indexKey = `${SAGA_INDEX_PREFIX}${sagaName}`;
    const ids = await this.redis.zrevrange(indexKey, 0, limit - 1);
    return this.loadMany(ids);
  }

  async listByStatus(status: string, limit = 50): Promise<SagaState[]> {
    const indexKey = `${SAGA_STATUS_INDEX}${status}`;
    const ids = await this.redis.zrevrange(indexKey, 0, limit - 1);
    return this.loadMany(ids);
  }

  async delete(sagaId: string): Promise<void> {
    const key = `${SAGA_KEY_PREFIX}${sagaId}`;
    await this.redis.del(key);
  }

  private async loadMany(ids: string[]): Promise<SagaState[]> {
    const results: SagaState[] = [];
    for (const id of ids) {
      const state = await this.load(id);
      if (state) results.push(state);
    }
    return results;
  }

  private deserialise(raw: string): SagaState {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    // Rehydrate Date fields
    if (typeof parsed.startedAt === 'string') {
      parsed.startedAt = new Date(parsed.startedAt as string);
    }
    if (typeof parsed.completedAt === 'string') {
      parsed.completedAt = new Date(parsed.completedAt as string);
    }
    if (parsed.context && typeof parsed.context === 'object') {
      const ctx = parsed.context as Record<string, unknown>;
      if (typeof ctx.terminationDate === 'string') {
        ctx.terminationDate = new Date(ctx.terminationDate as string);
      }
    }

    return parsed as unknown as SagaState;
  }
}

// ---------------------------------------------------------------------------
// In-memory store (for tests and development)
// ---------------------------------------------------------------------------

export class InMemorySagaStore implements SagaStateStore {
  private store = new Map<string, SagaState>();

  async save(state: SagaState): Promise<void> {
    this.store.set(state.sagaId, { ...state });
  }

  async load(sagaId: string): Promise<SagaState | null> {
    return this.store.get(sagaId) ?? null;
  }

  async listBySaga(sagaName: string, limit = 50): Promise<SagaState[]> {
    return Array.from(this.store.values())
      .filter((s) => s.sagaName === sagaName)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  async listByStatus(status: string, limit = 50): Promise<SagaState[]> {
    return Array.from(this.store.values())
      .filter((s) => s.status === status)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  async delete(sagaId: string): Promise<void> {
    this.store.delete(sagaId);
  }

  /** Returns the number of stored sagas (useful in tests) */
  size(): number {
    return this.store.size;
  }

  /** Clear all stored sagas */
  clear(): void {
    this.store.clear();
  }
}
