/**
 * APM (Application Performance Monitoring) Configuration
 * Datadog APM integration for AuraOS
 *
 * @module @aura/monitoring
 */

export interface APMConfig {
  serviceName: string;
  environment: string;
  version?: string;
  hostname?: string;
  enableProfiling?: boolean;
  enableRuntimeMetrics?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  sampleRate?: number;
  tags?: Record<string, string>;
}

export interface MetricConfig {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'distribution';
  tags?: Record<string, string>;
  unit?: string;
}

export interface AlertRule {
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  recipients: string[];
}

/**
 * Get APM configuration from environment
 */
export function getAPMConfig(): APMConfig {
  return {
    serviceName: process.env.DD_SERVICE || 'auraos-api',
    environment: process.env.DD_ENV || process.env.NODE_ENV || 'development',
    version: process.env.DD_VERSION || process.env.npm_package_version,
    hostname: process.env.DD_AGENT_HOST || 'localhost',
    enableProfiling: process.env.DD_PROFILING_ENABLED === 'true',
    enableRuntimeMetrics: process.env.DD_RUNTIME_METRICS_ENABLED !== 'false',
    logLevel: (process.env.DD_LOG_LEVEL as any) || 'info',
    sampleRate: parseFloat(process.env.DD_TRACE_SAMPLE_RATE || '1.0'),
    tags: {
      team: 'platform',
      product: 'auraos',
      region: process.env.AWS_REGION || 'us-east-1',
    },
  };
}

/**
 * Custom Business Metrics
 */
export const BUSINESS_METRICS: MetricConfig[] = [
  {
    name: 'aura.users.active',
    type: 'gauge',
    unit: 'users',
    tags: { category: 'engagement' },
  },
  {
    name: 'aura.employees.count',
    type: 'gauge',
    unit: 'employees',
    tags: { category: 'core' },
  },
  {
    name: 'aura.payroll.processed',
    type: 'counter',
    unit: 'payrolls',
    tags: { category: 'payroll' },
  },
  {
    name: 'aura.leaves.approved',
    type: 'counter',
    unit: 'leaves',
    tags: { category: 'leave' },
  },
  {
    name: 'aura.documents.uploaded',
    type: 'counter',
    unit: 'documents',
    tags: { category: 'documents' },
  },
  {
    name: 'aura.api.requests',
    type: 'counter',
    unit: 'requests',
    tags: { category: 'api' },
  },
  {
    name: 'aura.api.latency',
    type: 'histogram',
    unit: 'milliseconds',
    tags: { category: 'api' },
  },
  {
    name: 'aura.db.query.time',
    type: 'histogram',
    unit: 'milliseconds',
    tags: { category: 'database' },
  },
  {
    name: 'aura.cache.hit.rate',
    type: 'gauge',
    unit: 'percent',
    tags: { category: 'cache' },
  },
  {
    name: 'aura.queue.messages.pending',
    type: 'gauge',
    unit: 'messages',
    tags: { category: 'queue' },
  },
];

/**
 * Alert Rules
 */
export const ALERT_RULES: AlertRule[] = [
  {
    name: 'High API Error Rate',
    metric: 'aura.api.error.rate',
    condition: '>',
    threshold: 1.0,
    severity: 'critical',
    recipients: ['platform-oncall@kreupai.com'],
  },
  {
    name: 'High API Latency (P95)',
    metric: 'aura.api.latency.p95',
    condition: '>',
    threshold: 500,
    severity: 'warning',
    recipients: ['platform-team@kreupai.com'],
  },
  {
    name: 'Database Connection Pool Exhaustion',
    metric: 'aura.db.connections.used',
    condition: '>',
    threshold: 80,
    severity: 'critical',
    recipients: ['platform-oncall@kreupai.com'],
  },
  {
    name: 'Low Cache Hit Rate',
    metric: 'aura.cache.hit.rate',
    condition: '<',
    threshold: 70,
    severity: 'warning',
    recipients: ['platform-team@kreupai.com'],
  },
  {
    name: 'Queue Backlog',
    metric: 'aura.queue.messages.pending',
    condition: '>',
    threshold: 1000,
    severity: 'warning',
    recipients: ['platform-team@kreupai.com'],
  },
  {
    name: 'Memory Usage High',
    metric: 'aura.system.memory.usage',
    condition: '>',
    threshold: 85,
    severity: 'critical',
    recipients: ['platform-oncall@kreupai.com'],
  },
];

/**
 * Tracing Configuration
 */
export const TRACING_CONFIG = {
  enabled: process.env.DD_TRACE_ENABLED !== 'false',
  analyticsEnabled: true,
  runtimeMetrics: true,
  profiling: process.env.NODE_ENV === 'production',
  logInjection: true,
  plugins: {
    http: true,
    pg: true,
    redis: true,
    'next.js': true,
  },
};

/**
 * Log Configuration
 */
export const LOG_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  format: 'json',
  forwardLogsToDatadog: process.env.NODE_ENV === 'production',
  includeStackTrace: true,
  redactSensitiveData: true,
  sensitiveFields: [
    'password',
    'token',
    'apiKey',
    'secret',
    'creditCard',
    'ssn',
    'pan',
    'aadhaar',
  ],
};
