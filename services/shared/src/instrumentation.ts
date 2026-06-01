/**
 * Shared Sentry instrumentation for AuraOS Fastify services.
 *
 * Each service should call `initInstrumentation(serviceName)` as the
 * FIRST line of its entrypoint, BEFORE any other module loads — even
 * before Fastify is required. This is how @sentry/node captures
 * top-level errors and instruments outbound HTTP calls properly.
 *
 * No-op when SENTRY_DSN is unset (i.e. local dev). This lets services
 * boot identically in dev and prod; the only difference is whether
 * Sentry actually ships events.
 *
 * Usage:
 *   // services/foo-service/src/index.ts
 *   import { initInstrumentation } from '@aura/shared-services/instrumentation';
 *   initInstrumentation('foo-service');
 *   // ... rest of the file
 */

import * as Sentry from '@sentry/node';

let _initialised = false;

export function initInstrumentation(serviceName: string): void {
  if (_initialised) return;
  _initialised = true;

  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    // Dev / test path — don't ship events anywhere, but log once so the
    // operator knows Sentry is off.
    // eslint-disable-next-line no-console
    console.info(`[instrumentation] SENTRY_DSN unset; Sentry disabled for ${serviceName}`);
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || process.env.GIT_COMMIT_SHA,
    serverName: serviceName,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      // Auto-instrument outbound HTTP so cross-service calls show up
      // as child spans of the inbound request.
      Sentry.httpIntegration(),
      // Capture unhandled errors and uncaught promise rejections at
      // process level — Fastify's error handler doesn't catch these.
      Sentry.onUncaughtExceptionIntegration({ exitEvenIfOtherHandlersAreRegistered: false }),
      Sentry.onUnhandledRejectionIntegration({ mode: 'warn' }),
    ],
    beforeSend(event) {
      // Filter dev-environment noise from prod dashboards.
      if (event.environment === 'development') return null;
      return event;
    },
    ignoreErrors: [
      // Fastify validation errors are 4xx; not actionable.
      'FST_ERR_VALIDATION',
      // Service-mesh termination signals — expected during rollouts.
      'AbortError',
    ],
  });
}

export { Sentry };
