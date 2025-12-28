import pino from 'pino';
import { env, isDevelopment } from '@/lib/config/env';

/**
 * Logger Configuration
 *
 * Uses Pino for high-performance structured logging
 * Supports multiple log levels and formatted output
 */

// Configure logger based on environment
const logger = pino({
  level: env.LOG_LEVEL,

  // Pretty print in development
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,

  // Base configuration
  base: {
    env: env.NODE_ENV,
    revision: env.VERCEL_GIT_COMMIT_SHA,
  },

  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,

  // Redact sensitive fields
  redact: {
    paths: [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      'authorization',
      'cookie',
      '*.password',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
    ],
    remove: true,
  },

  // Serializers for common objects
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

/**
 * Create a child logger with context
 *
 * @example
 * const serviceLogger = createLogger({ service: 'UserService' });
 * serviceLogger.info('User created');
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context);
}

/**
 * Log levels:
 * - trace: Very detailed information (rarely used)
 * - debug: Detailed debugging information
 * - info: General informational messages
 * - warn: Warning messages for potentially harmful situations
 * - error: Error messages for serious problems
 * - fatal: Critical errors that may cause application termination
 */

/**
 * HTTP Request Logger Middleware
 * Logs all incoming HTTP requests
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  userId?: string
) {
  logger.info({
    type: 'http',
    method,
    url,
    statusCode,
    duration,
    userId,
  }, `${method} ${url} ${statusCode} - ${duration}ms`);
}

/**
 * Database Query Logger
 * Logs slow database queries
 */
export function logQuery(
  query: string,
  duration: number,
  model?: string,
  operation?: string
) {
  if (duration > 1000) {
    logger.warn({
      type: 'slow-query',
      query,
      duration,
      model,
      operation,
    }, `Slow query detected: ${duration}ms`);
  } else if (isDevelopment) {
    logger.debug({
      type: 'query',
      query,
      duration,
      model,
      operation,
    }, `Query executed: ${duration}ms`);
  }
}

/**
 * Service Error Logger
 * Logs service layer errors with context
 */
export function logServiceError(
  service: string,
  method: string,
  error: Error | unknown,
  context?: Record<string, any>
) {
  logger.error({
    type: 'service-error',
    service,
    method,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    ...context,
  }, `${service}.${method} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

/**
 * Authentication Event Logger
 * Logs authentication-related events
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'refresh' | 'failed-login' | 'mfa-enabled' | 'mfa-disabled',
  userId?: string,
  email?: string,
  ipAddress?: string,
  reason?: string
) {
  const level = event === 'failed-login' ? 'warn' : 'info';

  logger[level]({
    type: 'auth',
    event,
    userId,
    email,
    ipAddress,
    reason,
  }, `Auth event: ${event} - ${email || userId || 'unknown'}`);
}

/**
 * Audit Log Event
 * Logs audit trail events
 */
export function logAudit(
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
  module: string,
  userId: string,
  details: string,
  resourceId?: string,
  ipAddress?: string
) {
  logger.info({
    type: 'audit',
    action,
    module,
    userId,
    details,
    resourceId,
    ipAddress,
  }, `Audit: ${action} ${module} - ${details}`);
}

/**
 * Performance Metric Logger
 * Logs performance metrics
 */
export function logMetric(
  metric: string,
  value: number,
  unit: 'ms' | 'count' | 'bytes',
  tags?: Record<string, string>
) {
  logger.info({
    type: 'metric',
    metric,
    value,
    unit,
    tags,
  }, `Metric: ${metric} = ${value}${unit}`);
}

/**
 * Business Event Logger
 * Logs business-critical events
 */
export function logBusinessEvent(
  event: string,
  data: Record<string, any>
) {
  logger.info({
    type: 'business-event',
    event,
    ...data,
  }, `Business event: ${event}`);
}

// Export the base logger for direct use
export { logger };
export default logger;
