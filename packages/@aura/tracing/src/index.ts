/**
 * @package @aura/tracing
 * @description OpenTelemetry tracing, Prometheus metrics, and structured logging for AuraOS.
 */

// Tracer
export {
  initTracing,
  getTracer,
  createSpan,
  createSpanSync,
  getCurrentTraceContext,
  otelContext,
  otelTrace,
  type TracingOptions,
} from './tracer';

// Metrics
export {
  initMetrics,
  getMetrics,
  createCounter,
  createHistogram,
  createGauge,
  metricsMiddleware,
  metricsHandler,
  measureDbQuery,
  type MetricsInstance,
} from './metrics';

// Logging
export {
  createLogger,
  requestLogger,
  runWithCorrelationId,
  getCorrelationId,
  withCorrelation,
  type AuraLogger,
  type LogLevel,
  type LogEntry,
  type LoggerContext,
} from './logging';
