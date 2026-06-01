/**
 * Sentry instrumentation for @aura/notification-service.
 *
 * MUST be imported as the FIRST line of the service entrypoint —
 * before Fastify, before any feature module. @sentry/node patches
 * Node's http module on init; importing it late means outbound
 * HTTP calls from earlier-loaded modules aren't traced.
 *
 * No-op when SENTRY_DSN is unset (local dev). Phase 3 #41.
 */

import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || process.env.GIT_COMMIT_SHA,
    serverName: 'notification-service',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [Sentry.httpIntegration()],
    ignoreErrors: ['FST_ERR_VALIDATION', 'AbortError'],
  });
}

export { Sentry };
