/**
 * Health Checker
 *
 * Provides a composable health check system for AuraOS microservices.
 * Aggregates results from individual checkers (database, Redis, RabbitMQ,
 * disk space, memory) into a single response suitable for Kubernetes liveness
 * and readiness probes.
 *
 * @module @aura/monitoring
 */

import { performance } from 'perf_hooks';
import * as os from 'os';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  latencyMs: number;
  details?: Record<string, unknown>;
  error?: string;
}

export interface HealthResponse {
  status: HealthStatus;
  uptimeSeconds: number;
  timestamp: string;
  checks: HealthCheckResult[];
  version?: string;
  service?: string;
}

export type HealthCheckFn = () => Promise<{
  status: HealthStatus;
  details?: Record<string, unknown>;
}>;

// ---------------------------------------------------------------------------
// HealthChecker
// ---------------------------------------------------------------------------

/**
 * HealthChecker
 *
 * Usage:
 *   const checker = new HealthChecker({ service: 'payroll-service', version: '1.0.0' });
 *   checker.addCheck('database', checkDatabase);
 *   checker.addCheck('redis', checkRedis);
 *   const result = await checker.runChecks();
 */
export class HealthChecker {
  private checks = new Map<string, HealthCheckFn>();
  private readonly startTime: number;
  private readonly options: { service?: string; version?: string };

  constructor(options: { service?: string; version?: string } = {}) {
    this.options = options;
    this.startTime = Date.now();

    // Register built-in system checks
    this.addCheck('memory', this.checkMemory.bind(this));
    this.addCheck('disk', this.checkDisk.bind(this));
  }

  // -------------------------------------------------------------------------
  // Registration
  // -------------------------------------------------------------------------

  /**
   * Register a named health check.
   * Built-in names: 'memory', 'disk' (auto-registered)
   */
  addCheck(name: string, checker: HealthCheckFn): void {
    this.checks.set(name, checker);
  }

  /**
   * Remove a health check by name.
   */
  removeCheck(name: string): void {
    this.checks.delete(name);
  }

  // -------------------------------------------------------------------------
  // Execution
  // -------------------------------------------------------------------------

  /**
   * Run all registered health checks in parallel.
   * Returns aggregate status:
   *   - unhealthy if any check returns unhealthy
   *   - degraded if any check returns degraded
   *   - healthy if all checks pass
   */
  async runChecks(): Promise<HealthResponse> {
    const results = await Promise.all(
      Array.from(this.checks.entries()).map(async ([name, checker]) => {
        const start = performance.now();
        try {
          const result = await Promise.race([
            checker(),
            this.timeout(5000, name),
          ]);
          const latencyMs = Math.round(performance.now() - start);
          return {
            name,
            status: result.status,
            latencyMs,
            details: result.details,
          } satisfies HealthCheckResult;
        } catch (err) {
          const latencyMs = Math.round(performance.now() - start);
          return {
            name,
            status: 'unhealthy' as HealthStatus,
            latencyMs,
            error: err instanceof Error ? err.message : String(err),
          } satisfies HealthCheckResult;
        }
      })
    );

    const overallStatus = this.aggregateStatus(results);
    const uptimeSeconds = Math.round((Date.now() - this.startTime) / 1000);

    return {
      status: overallStatus,
      uptimeSeconds,
      timestamp: new Date().toISOString(),
      checks: results,
      version: this.options.version,
      service: this.options.service,
    };
  }

  // -------------------------------------------------------------------------
  // Built-in checks
  // -------------------------------------------------------------------------

  private async checkMemory(): Promise<{ status: HealthStatus; details: Record<string, unknown> }> {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usagePercent = Math.round((used / total) * 100);

    let status: HealthStatus = 'healthy';
    if (usagePercent > 95) status = 'unhealthy';
    else if (usagePercent > 85) status = 'degraded';

    return {
      status,
      details: {
        totalMb: Math.round(total / 1024 / 1024),
        usedMb: Math.round(used / 1024 / 1024),
        freeMb: Math.round(free / 1024 / 1024),
        usagePercent,
        processHeapMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
    };
  }

  private async checkDisk(): Promise<{ status: HealthStatus; details: Record<string, unknown> }> {
    // On Linux/Mac we can use statvfs; this is a simplified approximation
    try {
      const { execSync } = await import('child_process');
      const output = execSync("df -k / | tail -1 | awk '{print $5}'")
        .toString()
        .trim()
        .replace('%', '');
      const usagePercent = parseInt(output, 10);

      let status: HealthStatus = 'healthy';
      if (usagePercent > 95) status = 'unhealthy';
      else if (usagePercent > 90) status = 'degraded';

      return {
        status,
        details: { usagePercent, path: '/' },
      };
    } catch {
      return {
        status: 'healthy',
        details: { message: 'Disk check unavailable on this platform' },
      };
    }
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  private aggregateStatus(results: HealthCheckResult[]): HealthStatus {
    if (results.some((r) => r.status === 'unhealthy')) return 'unhealthy';
    if (results.some((r) => r.status === 'degraded')) return 'degraded';
    return 'healthy';
  }

  private timeout(ms: number, name: string): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Health check "${name}" timed out after ${ms}ms`)),
        ms
      )
    );
  }
}

// ---------------------------------------------------------------------------
// Built-in check factories
// ---------------------------------------------------------------------------

/**
 * Create a Prisma database health check.
 *
 * @param prismaClient  Your PrismaClient instance
 */
export function createDatabaseCheck(prismaClient: {
  $queryRaw(query: TemplateStringsArray): Promise<unknown>;
}): HealthCheckFn {
  return async () => {
    await prismaClient.$queryRaw`SELECT 1`;
    return { status: 'healthy' as const, details: { engine: 'postgresql' } };
  };
}

/**
 * Create a Redis health check.
 *
 * @param redisClient  An ioredis or compatible client with a .ping() method
 */
export function createRedisCheck(redisClient: {
  ping(): Promise<string>;
  status?: string;
}): HealthCheckFn {
  return async () => {
    const pong = await redisClient.ping();
    const status = pong === 'PONG' ? ('healthy' as const) : ('degraded' as const);
    return {
      status,
      details: { response: pong, clientStatus: redisClient.status ?? 'unknown' },
    };
  };
}

/**
 * Create a RabbitMQ health check.
 *
 * @param isConnectedFn  Function that returns whether the bus is connected
 */
export function createRabbitMQCheck(isConnectedFn: () => boolean): HealthCheckFn {
  return async () => {
    const connected = isConnectedFn();
    return {
      status: connected ? ('healthy' as const) : ('unhealthy' as const),
      details: { connected },
    };
  };
}
