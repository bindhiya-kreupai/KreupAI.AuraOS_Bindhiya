/**
 * @module pool-manager
 * @description PgBouncer-aware connection pool manager for AuraOS.
 *              Provides:
 *              - Pool health statistics
 *              - Slow query detection and logging
 *              - Query performance instrumentation
 *              - PgBouncer configuration generation
 */

import type { PrismaClient } from '@prisma/client';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PoolStats {
  totalConnections:   number;
  activeConnections:  number;
  idleConnections:    number;
  waitingConnections: number;
  maxConnections:     number;
  utilizationPercent: number;
  healthStatus:       'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface SlowQuery {
  query:        string;
  duration:     number;    // ms
  timestamp:    Date;
  database:     string;
  application?: string;
  pid?:         number;
}

export interface QueryPerformanceLog {
  query:       string;
  duration:    number;    // ms
  model?:      string;
  action?:     string;
  rowsAffected?: number;
  timestamp:   Date;
}

export interface PoolManagerConfig {
  minConnections:       number;
  maxConnections:       number;
  idleTimeoutMs:        number;
  connectionTimeoutMs:  number;
  slowQueryThresholdMs: number;
  logSlowQueries:       boolean;
  onSlowQuery?:         (query: SlowQuery) => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: PoolManagerConfig = {
  minConnections:       5,
  maxConnections:       20,
  idleTimeoutMs:        30_000,    // 30 seconds
  connectionTimeoutMs:  5_000,     // 5 seconds
  slowQueryThresholdMs: 500,       // 500ms
  logSlowQueries:       true,
};

// ── PoolManager ────────────────────────────────────────────────────────────

export class PoolManager {
  private _config: PoolManagerConfig;
  private _client: PrismaClient;
  private _slowQueryLog: SlowQuery[] = [];
  private _performanceLog: QueryPerformanceLog[] = [];
  private _maxLogSize = 1000;

  constructor(client: PrismaClient, config: Partial<PoolManagerConfig> = {}) {
    this._client = client;
    this._config = { ...DEFAULT_CONFIG, ...config };
  }

  // ── Pool Stats ─────────────────────────────────────────────────────────

  /**
   * Get current connection pool statistics.
   * Queries pg_stat_activity to obtain connection counts.
   */
  async getPoolStats(): Promise<PoolStats> {
    try {
      const result = await this._client.$queryRaw<
        Array<{
          total:   bigint;
          active:  bigint;
          idle:    bigint;
          waiting: bigint;
        }>
      >`
        SELECT
          count(*)                                                           AS total,
          count(*) FILTER (WHERE state = 'active')                          AS active,
          count(*) FILTER (WHERE state = 'idle')                            AS idle,
          count(*) FILTER (WHERE wait_event_type IS NOT NULL AND state = 'active') AS waiting
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND pid <> pg_backend_pid()
      `;

      const row              = result[0];
      const total            = Number(row.total);
      const active           = Number(row.active);
      const idle             = Number(row.idle);
      const waiting          = Number(row.waiting);
      const utilizationPct   = Math.round((active / this._config.maxConnections) * 100);

      let healthStatus: PoolStats['healthStatus'] = 'HEALTHY';
      if (utilizationPct >= 90) healthStatus = 'CRITICAL';
      else if (utilizationPct >= 70) healthStatus = 'WARNING';

      return {
        totalConnections:   total,
        activeConnections:  active,
        idleConnections:    idle,
        waitingConnections: waiting,
        maxConnections:     this._config.maxConnections,
        utilizationPercent: utilizationPct,
        healthStatus,
      };
    } catch {
      // pg_stat_activity may not be available (RDS, PgBouncer, etc.)
      return {
        totalConnections:   0,
        activeConnections:  0,
        idleConnections:    0,
        waitingConnections: 0,
        maxConnections:     this._config.maxConnections,
        utilizationPercent: 0,
        healthStatus:       'HEALTHY',
      };
    }
  }

  /**
   * Get current slow queries from pg_stat_statements.
   * Requires pg_stat_statements extension.
   */
  async getSlowQueries(thresholdMs = this._config.slowQueryThresholdMs): Promise<SlowQuery[]> {
    try {
      const results = await this._client.$queryRaw<
        Array<{
          query:        string;
          mean_exec_time: number;
          calls:        bigint;
          dbid:         number;
        }>
      >`
        SELECT
          query,
          mean_exec_time,
          calls,
          dbid
        FROM pg_stat_statements
        WHERE mean_exec_time > ${thresholdMs}
          AND query NOT LIKE '%pg_stat_statements%'
          AND query NOT LIKE '%pg_stat_activity%'
        ORDER BY mean_exec_time DESC
        LIMIT 20
      `;

      return results.map((r) => ({
        query:     r.query.trim(),
        duration:  Math.round(r.mean_exec_time),
        timestamp: new Date(),
        database:  'auraos',
      }));
    } catch {
      // Return in-memory slow queries if pg_stat_statements not available
      return this._slowQueryLog
        .filter((q) => q.duration >= thresholdMs)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 20);
    }
  }

  /**
   * Log a query execution with its duration.
   * Call from Prisma middleware or query instrumentation.
   */
  logQueryPerformance(
    query:   string,
    duration: number,
    meta?:   { model?: string; action?: string; rowsAffected?: number },
  ): void {
    const entry: QueryPerformanceLog = {
      query,
      duration,
      model:       meta?.model,
      action:      meta?.action,
      rowsAffected: meta?.rowsAffected,
      timestamp:   new Date(),
    };

    // Add to in-memory log (circular buffer)
    this._performanceLog.push(entry);
    if (this._performanceLog.length > this._maxLogSize) {
      this._performanceLog.shift();
    }

    // Check slow query threshold
    if (this._config.logSlowQueries && duration >= this._config.slowQueryThresholdMs) {
      const slowEntry: SlowQuery = {
        query,
        duration,
        timestamp: new Date(),
        database: 'auraos',
      };

      this._slowQueryLog.push(slowEntry);
      if (this._slowQueryLog.length > this._maxLogSize) {
        this._slowQueryLog.shift();
      }

      // Emit to custom handler if provided
      this._config.onSlowQuery?.(slowEntry);

      console.warn(
        `[PoolManager] Slow query detected: ${duration}ms — ${query.slice(0, 100).replace(/\s+/g, ' ')}…`,
      );
    }
  }

  /**
   * Get recent query performance logs (for monitoring dashboards).
   */
  getPerformanceLogs(limit = 100): QueryPerformanceLog[] {
    return [...this._performanceLog]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get the P95 query duration from recent logs.
   */
  getP95QueryDuration(): number {
    if (this._performanceLog.length === 0) return 0;
    const sorted = [...this._performanceLog].map((l) => l.duration).sort((a, b) => a - b);
    const idx    = Math.floor(sorted.length * 0.95);
    return sorted[idx] ?? 0;
  }

  /**
   * Clear performance and slow query logs.
   */
  clearLogs(): void {
    this._performanceLog = [];
    this._slowQueryLog   = [];
  }

  /**
   * Generate PgBouncer .ini configuration for this pool.
   */
  generatePgBouncerConfig(options?: {
    host?:        string;
    port?:        number;
    dbName?:      string;
    listenPort?:  number;
    authFile?:    string;
  }): string {
    const {
      host       = process.env.DB_HOST       ?? 'localhost',
      port       = parseInt(process.env.DB_PORT ?? '5432', 10),
      dbName     = process.env.DB_NAME       ?? 'auraos',
      listenPort = 6432,
      authFile   = '/etc/pgbouncer/userlist.txt',
    } = options ?? {};

    return `; AuraOS PgBouncer Configuration
; Generated by @aura/database PoolManager
; Environment: ${process.env.NODE_ENV ?? 'development'}

[databases]
${dbName} = host=${host} port=${port} dbname=${dbName}

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = ${listenPort}

; Authentication
auth_type = md5
auth_file = ${authFile}

; Pooling mode — transaction is best for most web workloads
pool_mode = transaction

; Connection limits
max_client_conn = 1000
default_pool_size = ${this._config.maxConnections}
min_pool_size = ${this._config.minConnections}
reserve_pool_size = ${Math.ceil(this._config.maxConnections * 0.25)}
reserve_pool_timeout = 3
max_db_connections = ${this._config.maxConnections + 10}

; Timeouts (seconds)
server_lifetime = 3600
server_idle_timeout = ${this._config.idleTimeoutMs / 1000}
server_connect_timeout = ${this._config.connectionTimeoutMs / 1000}
server_login_retry = 15
query_timeout = 30
query_wait_timeout = 120
client_idle_timeout = 60
client_login_timeout = 60

; Logging
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
log_stats = 1
stats_period = 60

; TLS (enable in production)
; server_tls_sslmode = require
; server_tls_ca_file = /etc/pgbouncer/ca.crt
`.trim();
  }
}

// ── Prisma Middleware Factory ───────────────────────────────────────────────

/**
 * Create a Prisma middleware that automatically logs query performance.
 * Register with client.$use() AFTER creating the PoolManager.
 *
 * @example
 * const poolManager = new PoolManager(prisma);
 * prisma.$use(createPoolMonitoringMiddleware(poolManager));
 */
export function createPoolMonitoringMiddleware(
  poolManager: PoolManager,
) {
  return async (
    params: {
      model?:  string;
      action:  string;
      args:    unknown;
      dataPath: string[];
      runInTransaction: boolean;
    },
    next: (params: unknown) => Promise<unknown>,
  ): Promise<unknown> => {
    const start = Date.now();

    try {
      const result   = await next(params);
      const duration = Date.now() - start;

      poolManager.logQueryPerformance(
        `${params.model ?? 'raw'}.${params.action}`,
        duration,
        { model: params.model, action: params.action },
      );

      return result;
    } catch (err) {
      const duration = Date.now() - start;
      poolManager.logQueryPerformance(
        `${params.model ?? 'raw'}.${params.action} [ERROR]`,
        duration,
        { model: params.model, action: params.action },
      );
      throw err;
    }
  };
}
