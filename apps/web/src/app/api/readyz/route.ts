import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { redis } from '@/lib/cache/redis';
import { checkPhase3Health } from '@/lib/init/phase3';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/readyz — Kubernetes readiness probe
 *
 * Answers ONE question: is this pod ready to accept production traffic?
 * Each dependency is probed with a strict timeout. Slow ≠ dead, so any
 * dep that takes longer than CRITICAL_TIMEOUT_MS is treated as unready.
 *
 * Returns:
 *   200 — all critical deps healthy (pod ready)
 *   200 — degraded: non-critical deps unhealthy but pod can still serve
 *         most traffic (returns body with details for monitoring)
 *   503 — at least one CRITICAL dep is unreachable (pod should be
 *         de-registered from the load balancer)
 *
 * Critical (block traffic):  Postgres, Redis
 * Non-critical (warn only):  RabbitMQ, Elasticsearch, event bus
 */

const CRITICAL_TIMEOUT_MS = 1500;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

async function checkPostgres(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const result = await withTimeout(prisma.$queryRaw`SELECT 1`, CRITICAL_TIMEOUT_MS);
    const latencyMs = Date.now() - start;
    if (result === null) return { ok: false, latencyMs, error: 'timeout' };
    return { ok: true, latencyMs };
  } catch (err: any) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'unknown',
    };
  }
}

function checkRedis(): { ok: boolean } {
  // redis.isReady() is sync and reflects the connection state held by the client
  return { ok: redis.isReady() };
}

export async function GET() {
  const startedAt = Date.now();
  const [postgres, redisCheck, phase3] = await Promise.all([
    checkPostgres(),
    Promise.resolve(checkRedis()),
    checkPhase3Health(),
  ]);

  const critical = {
    database: postgres,
    cache: redisCheck,
  };
  const nonCritical = {
    messaging: { ok: phase3.messaging },
    search: { ok: phase3.search },
    events: { ok: phase3.events },
  };

  const criticalOk = critical.database.ok && critical.cache.ok;
  const nonCriticalOk = nonCritical.messaging.ok && nonCritical.search.ok && nonCritical.events.ok;
  const status: 'ready' | 'degraded' | 'not_ready' = !criticalOk
    ? 'not_ready'
    : nonCriticalOk
      ? 'ready'
      : 'degraded';

  const body = {
    status,
    timestamp: new Date().toISOString(),
    checks: {
      ...critical,
      ...nonCritical,
    },
    totalLatencyMs: Date.now() - startedAt,
  };

  // Only critical-deps-down should pull the pod out of the load balancer.
  // Degraded (non-critical missing) still serves traffic — return 200 so k8s
  // keeps routing requests, but the dashboards will see the degraded status.
  const statusCode = criticalOk ? 200 : 503;

  if (statusCode === 503) {
    logger.warn({ body }, 'Readiness probe failing — critical dependency unreachable');
  }

  return NextResponse.json(body, { status: statusCode });
}

export async function HEAD() {
  const postgres = await checkPostgres();
  const cache = checkRedis();
  return new NextResponse(null, { status: postgres.ok && cache.ok ? 200 : 503 });
}
