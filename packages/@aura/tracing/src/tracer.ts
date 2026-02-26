/**
 * @module tracer
 * @description OpenTelemetry SDK initialisation for AuraOS microservices.
 *              Configures OTLP HTTP exporter, resource attributes, and
 *              auto-instrumentation for HTTP, Express, Prisma, Redis, and AMQP.
 */

import { NodeSDK }        from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource }       from '@opentelemetry/resources';
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  trace,
  context,
  type Tracer,
  type Span,
  SpanStatusCode,
} from '@opentelemetry/api';

// ── Types ──────────────────────────────────────────────────────────────────

export interface TracingOptions {
  /** OTLP collector endpoint (default: http://localhost:4318) */
  otlpEndpoint?: string;
  /** Service version (default: process.env.npm_package_version) */
  version?: string;
  /** Deployment environment (default: process.env.NODE_ENV) */
  environment?: string;
  /** Disable specific auto-instrumentations */
  disabledInstrumentations?: string[];
  /** Additional resource attributes */
  resourceAttributes?: Record<string, string>;
}

// ── Global SDK instance ────────────────────────────────────────────────────

let _sdk: NodeSDK | null = null;

// ── initTracing ────────────────────────────────────────────────────────────

/**
 * Initialise OpenTelemetry SDK.
 * Must be called BEFORE requiring any instrumented libraries (HTTP, Express, etc.)
 * Typically called at service entry point before any other imports.
 */
export function initTracing(
  serviceName: string,
  options: TracingOptions = {},
): NodeSDK {
  if (_sdk) {
    console.warn('[AuraTracing] SDK already initialized. Skipping.');
    return _sdk;
  }

  const {
    otlpEndpoint   = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318',
    version        = process.env.npm_package_version ?? '1.0.0',
    environment    = process.env.NODE_ENV ?? 'development',
    resourceAttributes = {},
  } = options;

  const resource = new Resource({
    [SEMRESATTRS_SERVICE_NAME]:           serviceName,
    [SEMRESATTRS_SERVICE_VERSION]:        version,
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: environment,
    'service.instance.id':               `${serviceName}-${process.pid}`,
    'telemetry.sdk.language':            'nodejs',
    ...resourceAttributes,
  });

  const traceExporter = new OTLPTraceExporter({
    url:     `${otlpEndpoint}/v1/traces`,
    headers: {},
  });

  _sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // HTTP instrumentation (covers Express too)
        '@opentelemetry/instrumentation-http': {
          ignoreIncomingRequestHook: (req) => {
            // Ignore health check and metrics endpoints
            const url = req.url ?? '';
            return url === '/health' || url === '/metrics' || url === '/ready';
          },
        },
        // Disable noisy/unsupported auto-instrumentations if requested
        '@opentelemetry/instrumentation-fs': { enabled: false },
        ...Object.fromEntries(
          (options.disabledInstrumentations ?? []).map((name) => [name, { enabled: false }])
        ),
      }),
    ],
  });

  _sdk.start();

  // Graceful shutdown on process exit
  process.on('SIGTERM', () => {
    _sdk?.shutdown()
      .then(() => console.log('[AuraTracing] SDK shut down cleanly'))
      .catch((err) => console.error('[AuraTracing] Error shutting down SDK', err));
  });

  console.log(`[AuraTracing] Initialized for service "${serviceName}" → ${otlpEndpoint}`);
  return _sdk;
}

// ── getTracer ──────────────────────────────────────────────────────────────

/**
 * Get a named tracer instance.
 * The name typically corresponds to the module/component being traced.
 */
export function getTracer(name: string, version?: string): Tracer {
  return trace.getTracer(name, version);
}

// ── createSpan ─────────────────────────────────────────────────────────────

/**
 * Convenience wrapper: creates a span, executes fn within it,
 * and automatically sets error status on exception.
 *
 * @example
 * const result = await createSpan('db.findEmployee', async (span) => {
 *   span.setAttribute('employee.id', id);
 *   return prisma.employee.findUnique({ where: { id } });
 * });
 */
export async function createSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  tracerName = 'auraos',
): Promise<T> {
  const tracer = getTracer(tracerName);

  return tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (err) {
      span.setStatus({
        code:    SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : String(err),
      });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });
}

/**
 * Synchronous version of createSpan.
 */
export function createSpanSync<T>(
  name: string,
  fn: (span: Span) => T,
  tracerName = 'auraos',
): T {
  const tracer = getTracer(tracerName);
  let result!: T;

  tracer.startActiveSpan(name, (span) => {
    try {
      result = fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
    } catch (err) {
      span.setStatus({
        code:    SpanStatusCode.ERROR,
        message: err instanceof Error ? err.message : String(err),
      });
      span.recordException(err as Error);
      throw err;
    } finally {
      span.end();
    }
  });

  return result;
}

// ── getCurrentTraceContext ─────────────────────────────────────────────────

/**
 * Extract the active trace context (traceId, spanId) for structured logging.
 */
export function getCurrentTraceContext(): { traceId: string; spanId: string } {
  const span = trace.getActiveSpan();
  if (!span) return { traceId: '', spanId: '' };
  const ctx = span.spanContext();
  return { traceId: ctx.traceId, spanId: ctx.spanId };
}

export { context as otelContext, trace as otelTrace };
