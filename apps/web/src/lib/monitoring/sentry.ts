/**
 * Sentry Error Tracking Utilities
 * Provides helper functions for tracking errors and events
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Capture an exception with additional context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
  });
}

/**
 * Capture a message with severity level
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info',
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    contexts: {
      custom: context,
    },
  });
}

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id: string;
  email?: string;
  username?: string;
  tenantId?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    // Custom attributes
    tenant_id: user.tenantId,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUser() {
  Sentry.setUser(null);
}

/**
 * Set custom tags for filtering errors
 */
export function setTags(tags: Record<string, string>) {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}

/**
 * Set custom context for errors
 */
export function setContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Track database query errors
 */
export function trackDatabaseError(error: Error, query: string, params?: any) {
  Sentry.captureException(error, {
    contexts: {
      database: {
        query,
        params,
      },
    },
    tags: {
      error_type: 'database',
    },
  });
}

/**
 * Track API endpoint errors
 */
export function trackAPIError(
  error: Error,
  endpoint: string,
  method: string,
  statusCode?: number,
  userId?: string
) {
  Sentry.captureException(error, {
    contexts: {
      api: {
        endpoint,
        method,
        status_code: statusCode,
      },
      user: userId ? { id: userId } : undefined,
    },
    tags: {
      error_type: 'api',
      endpoint,
      method,
    },
  });
}

/**
 * Track authentication errors
 */
export function trackAuthError(error: Error, email?: string, reason?: string) {
  Sentry.captureException(error, {
    contexts: {
      authentication: {
        email,
        reason,
      },
    },
    tags: {
      error_type: 'authentication',
    },
  });
}

/**
 * Track tenant isolation violations
 */
export function trackTenantViolation(
  userId: string,
  userTenantId: string,
  resourceTenantId: string,
  resourceType: string,
  resourceId?: string
) {
  Sentry.captureMessage('Tenant isolation violation detected', {
    level: 'error',
    contexts: {
      tenant_violation: {
        user_id: userId,
        user_tenant_id: userTenantId,
        resource_tenant_id: resourceTenantId,
        resource_type: resourceType,
        resource_id: resourceId,
      },
    },
    tags: {
      error_type: 'security',
      violation_type: 'tenant_isolation',
    },
  });
}

/**
 * Track performance metrics
 */
export function trackPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) {
  const transaction = Sentry.startTransaction({
    op: operation,
    name: operation,
  });

  transaction.setMeasurement('duration', duration, 'millisecond');

  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      transaction.setTag(key, String(value));
    });
  }

  transaction.finish();
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: {
    name?: string;
    tags?: Record<string, string>;
    context?: Record<string, any>;
  }
): T {
  return (async (...args: Parameters<T>) => {
    try {
      if (context?.tags) {
        setTags(context.tags);
      }
      if (context?.context) {
        setContext(context.name || 'custom', context.context);
      }

      return await fn(...args);
    } catch (error: any) {
      if (error instanceof Error) {
        captureException(error, context?.context);
      }
      throw error;
    }
  }) as T;
}

/**
 * Create a child span for distributed tracing
 */
export function startSpan(operation: string, description?: string) {
  return Sentry.startSpan(
    {
      op: operation,
      name: description || operation,
    },
    (span) => span
  );
}

/**
 * Track business metrics
 */
export interface BusinessMetric {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
}

export function trackBusinessMetric(metric: BusinessMetric) {
  const transaction = Sentry.startTransaction({
    op: 'metric',
    name: metric.name,
  });

  transaction.setMeasurement(
    metric.name,
    metric.value,
    metric.unit as any || 'none'
  );

  if (metric.tags) {
    Object.entries(metric.tags).forEach(([key, value]) => {
      transaction.setTag(key, value);
    });
  }

  transaction.finish();
}

/**
 * Initialize Sentry with custom configuration
 */
export function initializeSentry(dsn?: string, environment?: string) {
  // Configuration is handled in sentry.*.config.ts files
  // This function is for runtime initialization if needed
  if (dsn) {
    Sentry.init({
      dsn,
      environment: environment || process.env.NODE_ENV,
    });
  }
}

export default {
  captureException,
  captureMessage,
  setUser,
  clearUser,
  setTags,
  setContext,
  addBreadcrumb,
  trackDatabaseError,
  trackAPIError,
  trackAuthError,
  trackTenantViolation,
  trackPerformance,
  withErrorTracking,
  startSpan,
  trackBusinessMetric,
  initializeSentry,
};
