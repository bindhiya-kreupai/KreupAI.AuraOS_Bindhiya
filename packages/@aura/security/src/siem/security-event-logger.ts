/**
 * SecurityEventLogger
 *
 * Structured security event logging for SIEM integration.
 * Records authentication, access control, data, and system events
 * with full audit trail support.
 *
 * @module @aura/security
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SecurityEventType =
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'mfa_challenge'
  | 'mfa_success'
  | 'mfa_failure'
  | 'password_changed'
  | 'password_reset'
  | 'account_locked'
  | 'account_unlocked'
  | 'role_change'
  | 'permission_denied'
  | 'permission_granted'
  | 'data_export'
  | 'data_import'
  | 'data_access'
  | 'data_modification'
  | 'data_deletion'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'api_key_usage'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'ip_blocked'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'csrf_attempt'
  | 'system_config_change'
  | 'service_started'
  | 'service_stopped';

export type SecurityEventSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: Date;
  correlationId?: string;
  userId?: string;
  tenantId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  country?: string;
  resource?: string;
  action?: string;
  outcome: 'success' | 'failure' | 'blocked';
  message: string;
  metadata?: Record<string, unknown>;
  riskScore?: number;
}

export interface SecurityEventFilters {
  type?: SecurityEventType | SecurityEventType[];
  severity?: SecurityEventSeverity | SecurityEventSeverity[];
  userId?: string;
  tenantId?: string;
  ip?: string;
  startTime?: Date;
  endTime?: Date;
  outcome?: 'success' | 'failure' | 'blocked';
  limit?: number;
  offset?: number;
}

export interface SecurityMetrics {
  period: string;
  totalEvents: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  failedLogins: number;
  suspiciousIPs: string[];
  blockedIPs: number;
  dataExports: number;
  roleChanges: number;
  uniqueUsers: number;
  topFailingUsers: Array<{ userId: string; count: number }>;
  topFailingIPs: Array<{ ip: string; count: number }>;
}

export interface SecurityEventLoggerOptions {
  /** Maximum events to retain in memory. Default: 10000 */
  maxEvents?: number;
  /** Log to console. Default: true */
  consoleLogging?: boolean;
  /** External sink (e.g. Elasticsearch, Splunk) */
  externalSink?: (event: SecurityEvent) => Promise<void>;
}

// ---------------------------------------------------------------------------
// SecurityEventLogger
// ---------------------------------------------------------------------------

export class SecurityEventLogger {
  private events: SecurityEvent[] = [];
  private readonly maxEvents: number;
  private readonly consoleLogging: boolean;
  private readonly externalSink?: (event: SecurityEvent) => Promise<void>;

  // Default severity mapping for event types
  private static readonly SEVERITY_MAP: Partial<Record<SecurityEventType, SecurityEventSeverity>> = {
    login_failure:            'warning',
    account_locked:           'warning',
    mfa_failure:              'warning',
    permission_denied:        'warning',
    suspicious_activity:      'error',
    rate_limit_exceeded:      'warning',
    ip_blocked:               'error',
    sql_injection_attempt:    'critical',
    xss_attempt:              'critical',
    csrf_attempt:             'critical',
    data_export:              'info',
    role_change:              'warning',
    api_key_revoked:          'warning',
  };

  constructor(options: SecurityEventLoggerOptions = {}) {
    this.maxEvents      = options.maxEvents      ?? 10_000;
    this.consoleLogging = options.consoleLogging ?? true;
    this.externalSink   = options.externalSink;
  }

  // -------------------------------------------------------------------------
  // Core logging
  // -------------------------------------------------------------------------

  /**
   * Log a security event.
   */
  async logEvent(
    event: Omit<SecurityEvent, 'id' | 'timestamp' | 'severity'> & { severity?: SecurityEventSeverity }
  ): Promise<SecurityEvent> {
    const fullEvent: SecurityEvent = {
      id:          this.generateId(),
      timestamp:   new Date(),
      severity:    event.severity ?? SecurityEventLogger.SEVERITY_MAP[event.type] ?? 'info',
      ...event,
    };

    // Store in memory (circular buffer)
    this.events.push(fullEvent);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Console output
    if (this.consoleLogging) {
      this.writeToConsole(fullEvent);
    }

    // External sink (async, non-blocking)
    if (this.externalSink) {
      this.externalSink(fullEvent).catch((err) => {
        console.error('[SecurityEventLogger] External sink error:', err);
      });
    }

    return fullEvent;
  }

  // -------------------------------------------------------------------------
  // Query & aggregation
  // -------------------------------------------------------------------------

  /**
   * Query security events with optional filters.
   */
  getSecurityEvents(filters: SecurityEventFilters = {}): SecurityEvent[] {
    let result = [...this.events];

    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      result = result.filter((e) => types.includes(e.type));
    }

    if (filters.severity) {
      const severities = Array.isArray(filters.severity) ? filters.severity : [filters.severity];
      result = result.filter((e) => severities.includes(e.severity));
    }

    if (filters.userId)   result = result.filter((e) => e.userId === filters.userId);
    if (filters.tenantId) result = result.filter((e) => e.tenantId === filters.tenantId);
    if (filters.ip)       result = result.filter((e) => e.ip === filters.ip);
    if (filters.outcome)  result = result.filter((e) => e.outcome === filters.outcome);

    if (filters.startTime) {
      result = result.filter((e) => e.timestamp >= filters.startTime!);
    }
    if (filters.endTime) {
      result = result.filter((e) => e.timestamp <= filters.endTime!);
    }

    // Sort newest first
    result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const offset = filters.offset ?? 0;
    const limit  = filters.limit  ?? 100;
    return result.slice(offset, offset + limit);
  }

  /**
   * Aggregate security metrics for a time period.
   */
  getSecurityMetrics(period: 'hour' | 'day' | 'week' | 'month' = 'day'): SecurityMetrics {
    const cutoff = new Date();
    const periodMs: Record<string, number> = {
      hour:  3_600_000,
      day:   86_400_000,
      week:  604_800_000,
      month: 2_592_000_000,
    };
    cutoff.setTime(cutoff.getTime() - (periodMs[period] ?? periodMs.day));

    const periodEvents = this.events.filter((e) => e.timestamp >= cutoff);

    const byType: Record<string, number>     = {};
    const bySeverity: Record<string, number> = {};
    const userFailCounts: Record<string, number> = {};
    const ipFailCounts: Record<string, number>   = {};
    const uniqueUsers = new Set<string>();
    const suspiciousIPs = new Set<string>();

    let failedLogins = 0;
    let dataExports  = 0;
    let roleChanges  = 0;
    let blockedIPs   = 0;

    for (const event of periodEvents) {
      byType[event.type]         = (byType[event.type]         ?? 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] ?? 0) + 1;

      if (event.userId) uniqueUsers.add(event.userId);

      if (event.type === 'login_failure') {
        failedLogins += 1;
        if (event.userId)  userFailCounts[event.userId] = (userFailCounts[event.userId] ?? 0) + 1;
        if (event.ip)      ipFailCounts[event.ip]       = (ipFailCounts[event.ip]       ?? 0) + 1;
      }

      if (event.type === 'suspicious_activity' && event.ip) {
        suspiciousIPs.add(event.ip);
      }

      if (event.type === 'data_export')  dataExports  += 1;
      if (event.type === 'role_change')  roleChanges  += 1;
      if (event.type === 'ip_blocked')   blockedIPs   += 1;
    }

    const topFailingUsers = Object.entries(userFailCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topFailingIPs = Object.entries(ipFailCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      period,
      totalEvents: periodEvents.length,
      byType,
      bySeverity,
      failedLogins,
      suspiciousIPs: Array.from(suspiciousIPs),
      blockedIPs,
      dataExports,
      roleChanges,
      uniqueUsers: uniqueUsers.size,
      topFailingUsers,
      topFailingIPs,
    };
  }

  /**
   * Get the most recent events of a given type.
   */
  getRecentEvents(
    type: SecurityEventType,
    limit = 10
  ): SecurityEvent[] {
    return this.getSecurityEvents({ type, limit });
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  private generateId(): string {
    return `sec-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private writeToConsole(event: SecurityEvent): void {
    const method = event.severity === 'critical' || event.severity === 'error'
      ? console.error
      : event.severity === 'warning'
      ? console.warn
      : console.info;

    method(
      JSON.stringify({
        level:         event.severity,
        timestamp:     event.timestamp.toISOString(),
        type:          event.type,
        outcome:       event.outcome,
        message:       event.message,
        userId:        event.userId,
        ip:            event.ip,
        correlationId: event.correlationId,
        riskScore:     event.riskScore,
      })
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _instance: SecurityEventLogger | null = null;

export function getSecurityEventLogger(
  options?: SecurityEventLoggerOptions
): SecurityEventLogger {
  if (!_instance) {
    _instance = new SecurityEventLogger(options);
  }
  return _instance;
}
