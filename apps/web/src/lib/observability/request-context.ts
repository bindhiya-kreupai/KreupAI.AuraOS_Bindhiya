import { AsyncLocalStorage } from 'node:async_hooks';
import logger from '@/lib/logger';

/**
 * Per-request correlation context propagated through the call stack via
 * AsyncLocalStorage. Every log line emitted inside a request handler — at any
 * depth, including from service layers — automatically inherits the
 * request/tenant/user identifiers so on-call can pivot from a single log row
 * to "everything this request did" without having to thread an id parameter.
 *
 * The contract used by #82 dashboards:
 *   requestId — UUID per inbound HTTP request
 *   tenantId  — the resolved tenant (after auth)
 *   userId    — the authenticated user (after auth)
 *   route     — Next.js route pattern (e.g. "/api/v1/employees/[id]")
 *   method    — HTTP method
 */
export interface RequestContext {
  requestId: string;
  tenantId?: string;
  userId?: string;
  route?: string;
  method?: string;
  startedAtMs: number;
}

const storage = new AsyncLocalStorage<RequestContext>();

/**
 * Return the current request context or null when called outside a request
 * scope (e.g. from a background job that ran its own runWith).
 */
export function getRequestContext(): RequestContext | null {
  return storage.getStore() ?? null;
}

/**
 * Run a callback inside a fresh request context. Used by the request wrapper
 * at the auth boundary and by tests / background jobs that want a scoped
 * logger.
 */
export function runWithRequestContext<T>(ctx: RequestContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

/**
 * Patch in tenantId/userId once auth has resolved them. The auth wrappers
 * (withEnhancedAuth, createProtectedRoute) call this so the rest of the
 * request inherits the identifiers without us touching the handler signature.
 */
export function setAuthIdentifiers(tenantId?: string, userId?: string): void {
  const ctx = storage.getStore();
  if (!ctx) return;
  if (tenantId) ctx.tenantId = tenantId;
  if (userId) ctx.userId = userId;
}

/**
 * Return a child logger seeded with the current request context. Falls back
 * to the base logger when called outside a request scope.
 */
export function ctxLogger() {
  const ctx = storage.getStore();
  if (!ctx) return logger;
  return logger.child({
    requestId: ctx.requestId,
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    route: ctx.route,
    method: ctx.method,
  });
}

/**
 * Pure: redact PII-shaped values from a request URL so it can safely land in
 * dashboards. Email-shaped tokens are masked; UUIDs are kept (they're the
 * primary key our routes use). Used by the request wrapper before emitting
 * the access log line.
 */
export function sanitiseUrlForLog(url: string): string {
  return url.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email-redacted]');
}

/**
 * Pure: derive a Next.js-style route pattern from a request URL. Replaces
 * UUIDs and pure-numeric segments with [id]/[n] so the metric cardinality
 * stays bounded (#82 acceptance: per-route latency dashboards).
 */
export function deriveRoutePattern(pathname: string): string {
  return pathname
    .split('/')
    .map((seg) => {
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg)) {
        return '[id]';
      }
      if (/^\d+$/.test(seg)) return '[n]';
      return seg;
    })
    .join('/');
}
