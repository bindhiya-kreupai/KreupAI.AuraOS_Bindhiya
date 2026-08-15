/**
 * Sentry Server-Side Configuration
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || 'development';
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuildPhase) {
  Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  integrations: [
    Sentry.prismaIntegration(),
    Sentry.httpIntegration(),
  ],

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  beforeSend(event, hint) {
    // Filter out errors in development
    if (SENTRY_ENVIRONMENT === 'development') {
      console.error('Sentry event (not sent in dev):', event);
      return null;
    }

    // Add custom context
    if (event.request) {
      // Add tenant information if available
      const tenantId = event.request.headers?.['x-tenant-id'];
      if (tenantId) {
        event.contexts = {
          ...event.contexts,
          tenant: {
            id: tenantId,
          },
        };
      }
    }

    return event;
  },

  ignoreErrors: [
    // Ignore expected errors
    'TenantIsolationError',
    'ValidationError',
  ],
});
}
