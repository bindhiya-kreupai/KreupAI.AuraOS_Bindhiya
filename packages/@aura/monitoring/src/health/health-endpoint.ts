/**
 * Health Endpoint Middleware Factory
 *
 * Creates an Express-compatible middleware that exposes the health check
 * results as a JSON endpoint.
 *
 * Usage (Express):
 *   app.get('/health', createHealthEndpoint(checker));
 *   app.get('/health/live', createLivenessEndpoint());
 *   app.get('/health/ready', createReadinessEndpoint(checker));
 *
 * Usage (Fastify):
 *   app.get('/health', { schema: { response: { 200: healthSchema } } },
 *     fastifyHealthHandler(checker));
 *
 * @module @aura/monitoring
 */

import { HealthChecker, HealthResponse, HealthStatus } from './health-checker';

// ---------------------------------------------------------------------------
// HTTP status code mapping
// ---------------------------------------------------------------------------

const STATUS_CODES: Record<HealthStatus, number> = {
  healthy:   200,
  degraded:  200,  // Degraded is still "up" — let orchestrator decide
  unhealthy: 503,
};

// ---------------------------------------------------------------------------
// Express-compatible types (no express dep — use structural typing)
// ---------------------------------------------------------------------------

export interface ExpressRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
}

export interface ExpressResponse {
  status(code: number): ExpressResponse;
  json(body: unknown): void;
  set?(header: string, value: string): ExpressResponse;
}

export type ExpressNextFn = (err?: unknown) => void;

export type ExpressMiddleware = (
  req: ExpressRequest,
  res: ExpressResponse,
  next?: ExpressNextFn
) => Promise<void> | void;

// ---------------------------------------------------------------------------
// Middleware factories
// ---------------------------------------------------------------------------

/**
 * Full health check endpoint — returns all check results.
 * HTTP 200 for healthy/degraded, HTTP 503 for unhealthy.
 *
 * @param checker  HealthChecker instance with all checks registered
 */
export function createHealthEndpoint(checker: HealthChecker): ExpressMiddleware {
  return async (_req, res) => {
    const result: HealthResponse = await checker.runChecks();
    const httpStatus = STATUS_CODES[result.status];

    if (typeof res.set === 'function') {
      res.set('Cache-Control', 'no-cache, no-store');
      res.set('Content-Type', 'application/json');
    }

    res.status(httpStatus).json(result);
  };
}

/**
 * Liveness probe — returns 200 if the process is alive.
 * Does NOT run health checks — just confirms the process is responsive.
 */
export function createLivenessEndpoint(): ExpressMiddleware {
  return (_req, res) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
    });
  };
}

/**
 * Readiness probe — returns 200 only when all checks are healthy/degraded.
 * Returns 503 when unhealthy (i.e. not ready to serve traffic).
 *
 * @param checker  HealthChecker instance
 */
export function createReadinessEndpoint(checker: HealthChecker): ExpressMiddleware {
  return async (_req, res) => {
    const result = await checker.runChecks();
    const httpStatus = result.status === 'unhealthy' ? 503 : 200;

    res.status(httpStatus).json({
      status: result.status,
      timestamp: result.timestamp,
      service: result.service,
    });
  };
}

// ---------------------------------------------------------------------------
// Fastify-compatible handler (returns value directly)
// ---------------------------------------------------------------------------

export interface FastifyRequest {
  method: string;
  url: string;
}

export interface FastifyReply {
  status(code: number): FastifyReply;
  send(body: unknown): void;
  code(code: number): FastifyReply;
}

export function fastifyHealthHandler(
  checker: HealthChecker
): (req: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async (_req, reply) => {
    const result = await checker.runChecks();
    const httpStatus = STATUS_CODES[result.status];
    reply.code(httpStatus).send(result);
  };
}
