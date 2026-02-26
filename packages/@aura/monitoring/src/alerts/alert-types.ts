/**
 * Alert Types & Definitions
 *
 * Defines the alert severity levels, channel types, and pre-built alert rule
 * definitions for AuraOS infrastructure monitoring.
 *
 * @module @aura/monitoring
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertChannel = 'email' | 'slack' | 'pagerduty' | 'webhook' | 'log';

export type AlertCondition = '>' | '>=' | '<' | '<=' | '==' | '!=';

// ---------------------------------------------------------------------------
// Alert rule definition
// ---------------------------------------------------------------------------

export interface AlertRule {
  /** Unique identifier for the rule */
  id: string;
  /** Human-readable name */
  name: string;
  /** Metric name to evaluate (matches MetricsCollector metric names) */
  metric: string;
  /** Comparison operator */
  condition: AlertCondition;
  /** Threshold value */
  threshold: number;
  /** Alert severity */
  severity: AlertSeverity;
  /** Notification channels to use */
  channels: AlertChannel[];
  /** Minimum seconds between repeated alerts for the same rule */
  cooldownSeconds?: number;
  /** Optional description for runbooks */
  description?: string;
  /** Tags for grouping/routing */
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Active alert
// ---------------------------------------------------------------------------

export interface Alert {
  alertId: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  metric: string;
  currentValue: number;
  threshold: number;
  condition: AlertCondition;
  triggeredAt: Date;
  resolvedAt?: Date;
  status: 'firing' | 'resolved';
  channels: AlertChannel[];
  message: string;
  details?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Channel configuration
// ---------------------------------------------------------------------------

export interface EmailChannelConfig {
  type: 'email';
  recipients: string[];
  smtpHost?: string;
  from?: string;
}

export interface SlackChannelConfig {
  type: 'slack';
  webhookUrl: string;
  channel?: string;
  mentionOnCritical?: string;  // Slack user/group to @mention
}

export interface PagerDutyChannelConfig {
  type: 'pagerduty';
  integrationKey: string;
  severity?: 'critical' | 'error' | 'warning' | 'info';
}

export interface WebhookChannelConfig {
  type: 'webhook';
  url: string;
  headers?: Record<string, string>;
  method?: 'POST' | 'PUT';
}

export type ChannelConfig =
  | EmailChannelConfig
  | SlackChannelConfig
  | PagerDutyChannelConfig
  | WebhookChannelConfig;

// ---------------------------------------------------------------------------
// Pre-built alert rules
// ---------------------------------------------------------------------------

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  // System resources
  {
    id: 'cpu-high',
    name: 'High CPU Usage',
    metric: 'system.cpu.usage',
    condition: '>',
    threshold: 80,
    severity: 'warning',
    channels: ['slack'],
    cooldownSeconds: 300,
    description: 'CPU usage exceeds 80% — investigate for runaway processes or load spike',
    tags: ['system', 'performance'],
  },
  {
    id: 'memory-high',
    name: 'High Memory Usage',
    metric: 'aura.system.memory.usage',
    condition: '>',
    threshold: 85,
    severity: 'critical',
    channels: ['pagerduty', 'slack'],
    cooldownSeconds: 180,
    description: 'Memory usage above 85% — risk of OOM kill',
    tags: ['system', 'memory'],
  },
  {
    id: 'disk-critical',
    name: 'Critical Disk Usage',
    metric: 'system.disk.usage',
    condition: '>',
    threshold: 90,
    severity: 'critical',
    channels: ['pagerduty', 'email'],
    cooldownSeconds: 600,
    description: 'Disk usage exceeds 90% — immediate cleanup required',
    tags: ['system', 'disk'],
  },

  // API health
  {
    id: 'error-rate-high',
    name: 'High API Error Rate',
    metric: 'aura.api.error.rate',
    condition: '>',
    threshold: 5,
    severity: 'critical',
    channels: ['pagerduty', 'slack'],
    cooldownSeconds: 60,
    description: 'API error rate exceeds 5% — check logs for error patterns',
    tags: ['api', 'reliability'],
  },
  {
    id: 'response-time-slow',
    name: 'Slow API Response Time',
    metric: 'aura.api.latency.p95',
    condition: '>',
    threshold: 2000,
    severity: 'warning',
    channels: ['slack'],
    cooldownSeconds: 300,
    description: 'P95 API latency exceeds 2 seconds — performance degradation detected',
    tags: ['api', 'performance'],
  },

  // Queue health
  {
    id: 'queue-depth-high',
    name: 'Queue Depth High',
    metric: 'aura.queue.messages.pending',
    condition: '>',
    threshold: 1000,
    severity: 'warning',
    channels: ['slack'],
    cooldownSeconds: 300,
    description: 'Message queue depth exceeds 1000 — consumers may be struggling',
    tags: ['queue', 'messaging'],
  },
  {
    id: 'queue-depth-critical',
    name: 'Queue Depth Critical',
    metric: 'aura.queue.messages.pending',
    condition: '>',
    threshold: 5000,
    severity: 'critical',
    channels: ['pagerduty', 'slack'],
    cooldownSeconds: 120,
    description: 'Queue depth critically high — potential consumer failure',
    tags: ['queue', 'messaging'],
  },

  // Database
  {
    id: 'db-connection-pool',
    name: 'Database Connection Pool Near Exhaustion',
    metric: 'aura.db.connections.used',
    condition: '>',
    threshold: 80,
    severity: 'critical',
    channels: ['pagerduty'],
    cooldownSeconds: 120,
    description: 'DB connection pool above 80% capacity — risk of connection timeout',
    tags: ['database', 'reliability'],
  },

  // Cache
  {
    id: 'cache-hit-rate-low',
    name: 'Low Cache Hit Rate',
    metric: 'aura.cache.hit.rate',
    condition: '<',
    threshold: 70,
    severity: 'warning',
    channels: ['slack'],
    cooldownSeconds: 600,
    description: 'Cache hit rate below 70% — increased database load expected',
    tags: ['cache', 'performance'],
  },
];
