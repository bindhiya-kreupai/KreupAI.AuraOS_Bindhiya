import { randomUUID } from 'node:crypto';
import type { NextRequest } from 'next/server';
import {
  ctxLogger,
  deriveRoutePattern,
  runWithRequestContext,
  sanitiseUrlForLog,
} from './request-context';

/**
 * Wrap a Next.js route handler so every call runs inside a fresh request
 * context with a UUID requestId. The wrapper:
 *
 *   1. Reads / generates the requestId (honours `x-request-id` from upstream
 *      reverse proxies so traces stitch across hops)
 *   2. Derives the route pattern (`/api/v1/employees/[id]`) for bounded
 *      metric cardinality
 *   3. Emits one access log line per request with duration + status
 *   4. Sets `x-request-id` on the response so the browser / Sentry can
 *      surface it to operators
 *
 * Compose this before the auth wrapper so the auth events also carry the
 * requestId (`withCorrelation(withEnhancedAuth(handler))`).
 */
export function withCorrelation<
  H extends (request: NextRequest, context?: unknown) => Promise<Response>,
>(handler: H): H {
  const wrapped = async (request: NextRequest, context?: unknown): Promise<Response> => {
    const incomingId = request.headers.get('x-request-id');
    const requestId = incomingId && isUuid(incomingId) ? incomingId : randomUUID();
    const url = new URL(request.url);
    const route = deriveRoutePattern(url.pathname);
    const startedAtMs = Date.now();

    return runWithRequestContext(
      { requestId, route, method: request.method, startedAtMs },
      async () => {
        const log = ctxLogger();
        try {
          const response = await handler(request, context);
          const durationMs = Date.now() - startedAtMs;
          log.info(
            {
              type: 'http',
              status: response.status,
              durationMs,
              url: sanitiseUrlForLog(url.pathname + url.search),
            },
            `${request.method} ${route} ${response.status} ${durationMs}ms`
          );
          response.headers.set('x-request-id', requestId);
          return response;
        } catch (err) {
          const durationMs = Date.now() - startedAtMs;
          log.error(
            {
              type: 'http-error',
              durationMs,
              url: sanitiseUrlForLog(url.pathname + url.search),
              err,
            },
            `${request.method} ${route} threw after ${durationMs}ms`
          );
          throw err;
        }
      }
    );
  };
  return wrapped as H;
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
