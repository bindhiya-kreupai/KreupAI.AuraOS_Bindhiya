/**
 * Next.js instrumentation entrypoint.
 *
 * Next 14 calls register() ONCE per server runtime, before any other code
 * runs. This is the only correct place to initialize error tracking and
 * tracing — putting Sentry.init in a regular module risks loading it
 * AFTER an early request has already failed without instrumentation.
 *
 * Runtime detection:
 *   - 'nodejs'  -> server-side requests (App Router server components,
 *                  route handlers, server actions)
 *   - 'edge'    -> middleware.ts and edge route handlers
 *
 * The sentry.server.config.ts and sentry.edge.config.ts files own the
 * actual init payload (DSN, sample rate, integrations, ignore filters).
 * Keep this file as a thin dispatcher; do not duplicate the config.
 *
 * OpenTelemetry note (Phase 3 #41): a full OTel SDK install would also
 * register here. Deliberately deferred — needs decision on collector
 * target (Datadog Agent vs OTel collector vs Honeycomb) and the
 * @opentelemetry/* dep bundle (~5 packages). Sentry's own integrations
 * provide tracing in the meantime.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    // sentry.edge.config.ts will be loaded here once it exists. Until then
    // edge handlers run without Sentry — acceptable for the small set of
    // middleware paths we have.
  }
}

/**
 * onRequestError forwards uncaught request errors to Sentry early — before
 * Next's own error boundaries can swallow the stack trace. Next 14.2+
 * calls this for every server-side error.
 */
export async function onRequestError(
  err: unknown,
  request: { path: string; method: string; headers: { [key: string]: string | string[] | undefined } },
  context: { routerKind: 'Pages Router' | 'App Router'; routePath: string; routeType: 'render' | 'route' | 'action' | 'middleware' }
) {
  if (process.env.SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureRequestError(err, request, context);
  }
}
