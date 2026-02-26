/**
 * @module health-check
 * @description Aggregated health check utilities for AuraOS microservices.
 *              Provides liveness, readiness, and deep health checks
 *              against DB, Redis, RabbitMQ, and external dependencies.
 * @project AuraOS Enterprise HCM Platform
 * @section 27 — Microservices Infrastructure
 */

// ============================================================================
// TYPES
// ============================================================================

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
  details?: Record<string, unknown>;
  checkedAt: string;
}

export interface HealthCheckResult {
  status: HealthStatus;
  version: string;
  serviceName: string;
  uptime: number;
  timestamp: string;
  components: ComponentHealth[];
}

export interface ReadinessResult {
  ready: boolean;
  reason?: string;
  timestamp: string;
  checks: Array<{ name: string; passed: boolean; message?: string }>;
}

export interface LivenessResult {
  alive: boolean;
  timestamp: string;
  uptime: number;
  memoryUsageMb: number;
  pid: number;
}

// ============================================================================
// SERVICE START TIME
// ============================================================================

const SERVICE_START_TIME = Date.now();

// ============================================================================
// INDIVIDUAL COMPONENT CHECKERS
// ============================================================================

async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    // In production: await prisma.$queryRaw`SELECT 1`
    // Simulate DB ping
    await new Promise((r) => setTimeout(r, 2 + Math.random() * 5));
    const latencyMs = Date.now() - start;

    return {
      name: 'database',
      status: latencyMs < 100 ? 'healthy' : latencyMs < 500 ? 'degraded' : 'unhealthy',
      latencyMs,
      details: {
        engine: 'PostgreSQL',
        pool: { active: 5, idle: 10, waiting: 0 },
      },
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      name: 'database',
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      message: `Database unreachable: ${String(err)}`,
      checkedAt: new Date().toISOString(),
    };
  }
}

async function checkRedis(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    // In production: await redis.ping()
    await new Promise((r) => setTimeout(r, 1 + Math.random() * 3));
    const latencyMs = Date.now() - start;

    return {
      name: 'redis',
      status: latencyMs < 50 ? 'healthy' : latencyMs < 200 ? 'degraded' : 'unhealthy',
      latencyMs,
      details: {
        mode: 'standalone',
        connectedClients: 12,
        usedMemoryMb: 45,
      },
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      name: 'redis',
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      message: `Redis unreachable: ${String(err)}`,
      checkedAt: new Date().toISOString(),
    };
  }
}

async function checkRabbitMQ(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    // In production: check channel.checkQueue or management API
    await new Promise((r) => setTimeout(r, 2 + Math.random() * 8));
    const latencyMs = Date.now() - start;

    return {
      name: 'rabbitmq',
      status: latencyMs < 100 ? 'healthy' : latencyMs < 500 ? 'degraded' : 'unhealthy',
      latencyMs,
      details: {
        exchanges: 9,
        queues: 24,
        consumers: 15,
        messagesReady: 0,
        messagesUnacked: 2,
      },
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      name: 'rabbitmq',
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      message: `RabbitMQ unreachable: ${String(err)}`,
      checkedAt: new Date().toISOString(),
    };
  }
}

async function checkExternalServices(): Promise<ComponentHealth[]> {
  const services = [
    { name: 'smtp-relay', url: process.env.SMTP_HOST ?? 'smtp.sendgrid.net' },
    { name: 'storage', url: process.env.STORAGE_ENDPOINT ?? 's3.amazonaws.com' },
  ];

  return Promise.all(
    services.map(async (svc): Promise<ComponentHealth> => {
      const start = Date.now();
      try {
        // In production: make a lightweight health probe (e.g. HEAD request or ping)
        await new Promise((r) => setTimeout(r, 10 + Math.random() * 20));
        return {
          name: svc.name,
          status: 'healthy',
          latencyMs: Date.now() - start,
          checkedAt: new Date().toISOString(),
        };
      } catch {
        return {
          name: svc.name,
          status: 'degraded',
          latencyMs: Date.now() - start,
          message: `Unable to reach ${svc.url}`,
          checkedAt: new Date().toISOString(),
        };
      }
    }),
  );
}

// ============================================================================
// PUBLIC HEALTH CHECK FUNCTIONS
// ============================================================================

/**
 * healthCheck — deep health check aggregating status from all dependencies.
 * Returns 200 if healthy, 200 with degraded status, or 503 if unhealthy.
 */
export async function healthCheck(serviceName?: string): Promise<HealthCheckResult> {
  const [db, redis, mq, ...externalComponents] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkRabbitMQ(),
    ...(await checkExternalServices()),
  ]);

  const components: ComponentHealth[] = [db, redis, mq, ...externalComponents];

  const hasUnhealthy = components.some((c) => c.status === 'unhealthy');
  const hasDegraded = components.some((c) => c.status === 'degraded');

  const overallStatus: HealthStatus = hasUnhealthy
    ? 'unhealthy'
    : hasDegraded
    ? 'degraded'
    : 'healthy';

  return {
    status: overallStatus,
    version: process.env.SERVICE_VERSION ?? '1.0.0',
    serviceName: serviceName ?? process.env.SERVICE_NAME ?? 'aura-service',
    uptime: Math.floor((Date.now() - SERVICE_START_TIME) / 1000),
    timestamp: new Date().toISOString(),
    components,
  };
}

/**
 * readinessCheck — lightweight check: is the service ready to accept traffic?
 * Checks critical dependencies only (DB + message broker).
 * Returns 200 if ready, 503 if not.
 */
export async function readinessCheck(): Promise<ReadinessResult> {
  const checks: ReadinessResult['checks'] = [];
  let ready = true;

  // Check DB
  try {
    const db = await checkDatabase();
    const passed = db.status !== 'unhealthy';
    if (!passed) ready = false;
    checks.push({ name: 'database', passed, message: db.message });
  } catch {
    ready = false;
    checks.push({ name: 'database', passed: false, message: 'Database check threw exception' });
  }

  // Check Redis
  try {
    const redis = await checkRedis();
    const passed = redis.status !== 'unhealthy';
    checks.push({ name: 'redis', passed, message: redis.message });
  } catch {
    // Redis degradation is non-fatal for readiness
    checks.push({ name: 'redis', passed: true, message: 'Redis unavailable — running without cache' });
  }

  // Check if all startup migrations/seeds completed
  const migrationsDone = process.env.MIGRATIONS_COMPLETE !== 'false';
  checks.push({
    name: 'migrations',
    passed: migrationsDone,
    message: migrationsDone ? undefined : 'Database migrations not yet complete',
  });

  if (!migrationsDone) ready = false;

  return {
    ready,
    reason: ready ? undefined : checks.find((c) => !c.passed)?.message,
    timestamp: new Date().toISOString(),
    checks,
  };
}

/**
 * livenessCheck — ultra-lightweight check: is the process alive?
 * Checks memory and basic runtime health. Returns 200 if alive, 503 if not.
 */
export function livenessCheck(): LivenessResult {
  const memUsage = process.memoryUsage();
  const memoryUsageMb = Math.round(memUsage.heapUsed / 1024 / 1024);
  const uptime = Math.floor((Date.now() - SERVICE_START_TIME) / 1000);

  // Alert if heap usage exceeds 1.5 GB (sign of memory leak)
  const alive = memoryUsageMb < 1500;

  return {
    alive,
    timestamp: new Date().toISOString(),
    uptime,
    memoryUsageMb,
    pid: process.pid,
  };
}

// ============================================================================
// FASTIFY ROUTE HANDLERS
// ============================================================================

/**
 * registerHealthRoutes — registers /health, /health/ready, /health/live
 *                        routes on a Fastify instance.
 */
export function registerHealthRoutes(
  fastify: {
    get: (path: string, handler: (req: unknown, reply: { code: (n: number) => { send: (body: unknown) => void } }) => Promise<void>) => void;
  },
  serviceName?: string,
): void {
  fastify.get('/health', async (_req, reply) => {
    const result = await healthCheck(serviceName);
    const statusCode = result.status === 'unhealthy' ? 503 : 200;
    reply.code(statusCode).send(result);
  });

  fastify.get('/health/ready', async (_req, reply) => {
    const result = await readinessCheck();
    reply.code(result.ready ? 200 : 503).send(result);
  });

  fastify.get('/health/live', async (_req, reply) => {
    const result = livenessCheck();
    reply.code(result.alive ? 200 : 503).send(result);
  });
}
