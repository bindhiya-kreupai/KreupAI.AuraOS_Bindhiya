/**
 * @module logging
 * @description Structured JSON logger for AuraOS microservices.
 *              Features:
 *              - Correlation ID propagation via AsyncLocalStorage
 *              - OpenTelemetry trace context injection (traceId, spanId)
 *              - Express request/response middleware
 *              - Log levels: debug, info, warn, error
 */

import { AsyncLocalStorage } from 'async_hooks';
import { v4 as uuidv4 }     from 'uuid';
import { getCurrentTraceContext } from './tracer';
// Minimal Express types to avoid requiring @types/express as a dependency
interface Request {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket: { remoteAddress?: string };
}

interface Response {
  statusCode: number;
  setHeader(name: string, value: string): void;
  on(event: string, listener: (...args: unknown[]) => void): void;
}

type NextFunction = (err?: unknown) => void;

// ── Types ──────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp:     string;
  level:         LogLevel;
  service:       string;
  message:       string;
  correlationId: string;
  traceId:       string;
  spanId:        string;
  pid:           number;
  hostname:      string;
  [key: string]: unknown;
}

export interface LoggerContext {
  correlationId: string;
  [key: string]: unknown;
}

export interface AuraLogger {
  debug:  (message: string, context?: Record<string, unknown>) => void;
  info:   (message: string, context?: Record<string, unknown>) => void;
  warn:   (message: string, context?: Record<string, unknown>) => void;
  error:  (message: string, context?: Record<string, unknown>) => void;
  child:  (childContext: Record<string, unknown>) => AuraLogger;
}

// ── AsyncLocalStorage for correlation ID ───────────────────────────────────

const _loggerStorage = new AsyncLocalStorage<LoggerContext>();

/**
 * Run fn within a logger context (sets correlationId for all log calls inside).
 */
export function runWithCorrelationId<T>(
  correlationId: string,
  fn: () => T,
  extraContext: Record<string, unknown> = {},
): T {
  return _loggerStorage.run({ correlationId, ...extraContext }, fn);
}

/**
 * Get the current correlationId from AsyncLocalStorage, or generate a new one.
 */
export function getCorrelationId(): string {
  return _loggerStorage.getStore()?.correlationId ?? '';
}

// ── Log level filtering ────────────────────────────────────────────────────

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info:  1,
  warn:  2,
  error: 3,
};

function getConfiguredLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.toLowerCase();
  if (level && level in LOG_LEVELS) return level as LogLevel;
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

// ── createLogger ───────────────────────────────────────────────────────────

/**
 * Create a structured JSON logger for a service.
 *
 * @example
 * const logger = createLogger('payroll-service');
 * logger.info('Payroll run started', { runId, employeeCount });
 */
export function createLogger(
  serviceName: string,
  baseContext: Record<string, unknown> = {},
): AuraLogger {
  const minLevel    = getConfiguredLevel();
  const hostname    = process.env.HOSTNAME ?? 'unknown';

  function log(
    level: LogLevel,
    message: string,
    context: Record<string, unknown> = {},
  ): void {
    if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) return;

    const store      = _loggerStorage.getStore();
    const traceCtx   = getCurrentTraceContext();

    const entry: LogEntry = {
      timestamp:     new Date().toISOString(),
      level,
      service:       serviceName,
      message,
      correlationId: store?.correlationId ?? '',
      traceId:       traceCtx.traceId,
      spanId:        traceCtx.spanId,
      pid:           process.pid,
      hostname,
      ...baseContext,
      ...store,
      ...context,
    };
    // Ensure correlationId is not overwritten by spread
    entry.correlationId = store?.correlationId ?? '';

    // Remove non-serializable fields from store leakage
    const { correlationId: _cid, ...storeRest } = store ?? {};
    Object.assign(entry, storeRest);
    entry.correlationId = store?.correlationId ?? '';

    const output = JSON.stringify(entry);

    if (level === 'error') {
      process.stderr.write(output + '\n');
    } else {
      process.stdout.write(output + '\n');
    }
  }

  const logger: AuraLogger = {
    debug: (message, context) => log('debug', message, context),
    info:  (message, context) => log('info',  message, context),
    warn:  (message, context) => log('warn',  message, context),
    error: (message, context) => log('error', message, context),

    /** Create a child logger with additional base context fields */
    child: (childContext) => createLogger(serviceName, { ...baseContext, ...childContext }),
  };

  return logger;
}

// ── requestLogger middleware ───────────────────────────────────────────────

/**
 * Express middleware that:
 * 1. Extracts or generates a correlation ID from X-Correlation-ID header
 * 2. Runs the request within an AsyncLocalStorage context (propagates correlationId)
 * 3. Logs request receipt (info) and response finish (info/warn/error)
 *
 * @example
 * app.use(requestLogger('payroll-service'));
 */
export function requestLogger(serviceName: string) {
  const logger = createLogger(serviceName);

  return (req: Request, res: Response, next: NextFunction): void => {
    const correlationId =
      (req.headers['x-correlation-id'] as string | undefined) ??
      (req.headers['x-request-id']     as string | undefined) ??
      uuidv4();

    // Propagate correlation ID back in response headers
    res.setHeader('X-Correlation-ID', correlationId);

    const startHr = process.hrtime();

    runWithCorrelationId(correlationId, () => {
      logger.info('Incoming request', {
        method:    req.method,
        url:       req.url,
        userAgent: req.headers['user-agent'],
        ip:        req.ip ?? req.socket.remoteAddress,
      });

      res.on('finish', () => {
        const [secs, nanos] = process.hrtime(startHr);
        const durationMs    = Math.round(secs * 1000 + nanos / 1e6);
        const level: LogLevel = res.statusCode >= 500 ? 'error'
                              : res.statusCode >= 400 ? 'warn'
                              : 'info';

        runWithCorrelationId(correlationId, () => {
          logger[level]('Request completed', {
            method:     req.method,
            url:        req.url,
            statusCode: res.statusCode,
            durationMs,
          });
        });
      });

      next();
    });
  };
}

// ── Convenience: set correlation ID in current request context ─────────────

/**
 * Wrap an Express route handler to ensure it runs within a correlation context.
 */
export function withCorrelation<
  Req extends Request = Request,
  Res extends Response = Response,
>(
  correlationId: string,
  handler: (req: Req, res: Res, next: NextFunction) => void | Promise<void>,
): (req: Req, res: Res, next: NextFunction) => void {
  return (req, res, next) => {
    runWithCorrelationId(correlationId, () => handler(req, res, next));
  };
}
