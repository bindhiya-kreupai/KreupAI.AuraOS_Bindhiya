/**
 * ThreatDetector
 *
 * Behavioural threat detection for AuraOS security operations.
 * Analyzes user activity patterns to detect:
 *   - Brute force attacks
 *   - Credential stuffing
 *   - Impossible travel (geo-anomaly)
 *   - Privilege escalation
 *   - Suspicious data access patterns
 *
 * @module @aura/security
 */

import { SecurityEventLogger, type SecurityEvent, getSecurityEventLogger } from './security-event-logger';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThreatType =
  | 'brute_force'
  | 'credential_stuffing'
  | 'impossible_travel'
  | 'privilege_escalation'
  | 'suspicious_data_access'
  | 'account_takeover'
  | 'insider_threat';

export type ThreatSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ThreatAlert {
  id: string;
  type: ThreatType;
  severity: ThreatSeverity;
  userId?: string;
  ip?: string;
  detectedAt: Date;
  description: string;
  evidence: string[];
  riskScore: number;
  recommended: string[];
  resolved: boolean;
}

export interface LoginPattern {
  userId: string;
  recentFailures: number;
  recentIPs: string[];
  recentCountries: string[];
  lastSuccessTimestamp?: Date;
  lastFailureTimestamp?: Date;
  isLocked: boolean;
}

export interface GeoLocation {
  ip: string;
  country: string;
  countryCode: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timestamp: Date;
}

export interface RiskAssessment {
  userId: string;
  riskScore: number;       // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendation: string;
  assessedAt: Date;
}

export interface ThreatDetectorOptions {
  /** Failures within this window trigger brute force alert. Default: 300s */
  bruteForceWindowSeconds?: number;
  /** Failure count threshold for brute force. Default: 5 */
  bruteForceThreshold?: number;
  /** Failures from different IPs indicating credential stuffing. Default: 10 */
  credentialStuffingIpThreshold?: number;
  /** km/h speed threshold for impossible travel. Default: 800 (max aircraft) */
  impossibleTravelSpeedKph?: number;
  /** AlertManager integration callback */
  onAlert?: (alert: ThreatAlert) => void;
}

// ---------------------------------------------------------------------------
// ThreatDetector
// ---------------------------------------------------------------------------

export class ThreatDetector {
  private readonly logger: SecurityEventLogger;
  private readonly alerts: Map<string, ThreatAlert> = new Map();
  private readonly loginHistory: Map<string, GeoLocation[]> = new Map();

  private readonly bruteForceWindowSeconds: number;
  private readonly bruteForceThreshold: number;
  private readonly credentialStuffingIpThreshold: number;
  private readonly impossibleTravelSpeedKph: number;
  private readonly onAlert?: (alert: ThreatAlert) => void;

  constructor(options: ThreatDetectorOptions = {}) {
    this.logger                          = getSecurityEventLogger();
    this.bruteForceWindowSeconds         = options.bruteForceWindowSeconds         ?? 300;
    this.bruteForceThreshold             = options.bruteForceThreshold             ?? 5;
    this.credentialStuffingIpThreshold   = options.credentialStuffingIpThreshold   ?? 10;
    this.impossibleTravelSpeedKph        = options.impossibleTravelSpeedKph        ?? 800;
    this.onAlert                         = options.onAlert;
  }

  // -------------------------------------------------------------------------
  // Brute force & credential stuffing detection
  // -------------------------------------------------------------------------

  /**
   * Analyze login failure patterns for a user.
   * Detects brute force and credential stuffing.
   */
  analyzeLoginPattern(userId: string): ThreatAlert | null {
    const windowStart = new Date(Date.now() - this.bruteForceWindowSeconds * 1000);

    const failures = this.logger.getSecurityEvents({
      type: 'login_failure',
      userId,
      startTime: windowStart,
      limit: 100,
    });

    if (failures.length === 0) return null;

    const uniqueIPs = new Set(failures.map((e) => e.ip).filter(Boolean));

    // Brute force: many failures from same IP
    if (failures.length >= this.bruteForceThreshold && uniqueIPs.size <= 2) {
      return this.raiseAlert({
        type: 'brute_force',
        severity: failures.length >= 20 ? 'critical' : 'high',
        userId,
        ip: failures[0]?.ip,
        description: `Brute force attack detected for user "${userId}": ${failures.length} failures in ${this.bruteForceWindowSeconds}s`,
        evidence: [
          `${failures.length} failed login attempts`,
          `From ${uniqueIPs.size} unique IP(s): ${Array.from(uniqueIPs).join(', ')}`,
          `Window: ${this.bruteForceWindowSeconds} seconds`,
        ],
        riskScore: Math.min(100, 40 + failures.length * 3),
        recommended: [
          'Temporarily lock the account',
          'Force password reset',
          'Block originating IP(s)',
          'Notify user via secondary channel',
        ],
      });
    }

    // Credential stuffing: failures from many different IPs
    if (uniqueIPs.size >= this.credentialStuffingIpThreshold) {
      return this.raiseAlert({
        type: 'credential_stuffing',
        severity: 'critical',
        userId,
        description: `Credential stuffing detected for user "${userId}": ${failures.length} failures from ${uniqueIPs.size} IPs`,
        evidence: [
          `${failures.length} failed logins from ${uniqueIPs.size} different IPs`,
          `IPs: ${Array.from(uniqueIPs).slice(0, 5).join(', ')}...`,
        ],
        riskScore: 85,
        recommended: [
          'Require MFA immediately',
          'Invalidate all existing sessions',
          'Block high-frequency source IPs',
          'Report to security team',
        ],
      });
    }

    return null;
  }

  // -------------------------------------------------------------------------
  // Geo-anomaly (impossible travel)
  // -------------------------------------------------------------------------

  /**
   * Detect impossible travel by comparing login locations.
   * Flags logins from locations that would require physically
   * impossible travel speeds.
   */
  detectGeoAnomaly(userId: string, ip: string, country = 'Unknown'): ThreatAlert | null {
    const history = this.loginHistory.get(userId) ?? [];
    const now = new Date();

    const newLocation: GeoLocation = {
      ip,
      country,
      countryCode: country.slice(0, 2).toUpperCase(),
      timestamp: now,
    };

    // Compare with most recent login
    const previous = history[history.length - 1];

    // Store this location
    history.push(newLocation);
    if (history.length > 50) history.shift();
    this.loginHistory.set(userId, history);

    if (!previous || previous.countryCode === newLocation.countryCode) {
      return null;
    }

    // Calculate time delta
    const timeDeltaHours = (now.getTime() - previous.timestamp.getTime()) / 3_600_000;

    // Impossible travel check: different countries in very short time
    // Without real coordinates we use a simple heuristic:
    // < 1 hour between logins from different continents/distant countries
    const INTER_CONTINENTAL_HOURS = 8; // minimum realistic flight time
    if (timeDeltaHours < INTER_CONTINENTAL_HOURS) {
      return this.raiseAlert({
        type: 'impossible_travel',
        severity: timeDeltaHours < 1 ? 'critical' : 'high',
        userId,
        ip,
        description: `Impossible travel detected for user "${userId}": ${previous.country} → ${country} in ${timeDeltaHours.toFixed(1)}h`,
        evidence: [
          `Previous login: ${previous.country} (${previous.ip}) at ${previous.timestamp.toISOString()}`,
          `Current login: ${country} (${ip}) at ${now.toISOString()}`,
          `Time elapsed: ${timeDeltaHours.toFixed(1)} hours`,
        ],
        riskScore: timeDeltaHours < 1 ? 95 : 75,
        recommended: [
          'Challenge user with MFA',
          'Notify user of unusual login location',
          'Optionally block session and require re-authentication',
        ],
      });
    }

    return null;
  }

  // -------------------------------------------------------------------------
  // Privilege escalation detection
  // -------------------------------------------------------------------------

  /**
   * Detect unusual permission or role changes.
   */
  detectPrivilegeEscalation(userId: string): ThreatAlert | null {
    const last24h = new Date(Date.now() - 86_400_000);

    const roleChanges = this.logger.getSecurityEvents({
      type: 'role_change',
      userId,
      startTime: last24h,
      limit: 20,
    });

    if (roleChanges.length === 0) return null;

    // Multiple role changes in 24h is suspicious
    if (roleChanges.length >= 3) {
      return this.raiseAlert({
        type: 'privilege_escalation',
        severity: roleChanges.length >= 5 ? 'critical' : 'high',
        userId,
        description: `Potential privilege escalation for user "${userId}": ${roleChanges.length} role changes in 24 hours`,
        evidence: roleChanges.slice(0, 5).map(
          (e) => `Role change at ${e.timestamp.toISOString()}: ${e.message}`
        ),
        riskScore: Math.min(90, 50 + roleChanges.length * 8),
        recommended: [
          'Review role change audit trail',
          'Verify changes were authorized',
          'Temporarily revert suspicious role assignments',
          'Alert CISO',
        ],
      });
    }

    return null;
  }

  // -------------------------------------------------------------------------
  // Risk score
  // -------------------------------------------------------------------------

  /**
   * Calculate an overall risk score (0–100) for a user.
   */
  getRiskScore(userId: string): RiskAssessment {
    const last24h = new Date(Date.now() - 86_400_000);
    const factors: string[] = [];
    let score = 0;

    // Failed logins
    const failures = this.logger.getSecurityEvents({
      type: 'login_failure',
      userId,
      startTime: last24h,
      limit: 50,
    }).length;

    if (failures >= 10) { score += 30; factors.push(`${failures} failed logins in 24h`); }
    else if (failures >= 5) { score += 15; factors.push(`${failures} failed logins in 24h`); }
    else if (failures >= 1) { score += 5; factors.push(`${failures} failed login(s) in 24h`); }

    // Data exports
    const exports = this.logger.getSecurityEvents({
      type: 'data_export',
      userId,
      startTime: last24h,
      limit: 10,
    }).length;

    if (exports >= 5) { score += 25; factors.push(`${exports} data exports in 24h`); }
    else if (exports >= 2) { score += 10; factors.push(`${exports} data exports in 24h`); }

    // Suspicious activity events
    const suspicious = this.logger.getSecurityEvents({
      type: 'suspicious_activity',
      userId,
      startTime: last24h,
      limit: 10,
    }).length;

    score += suspicious * 15;
    if (suspicious > 0) factors.push(`${suspicious} suspicious activity event(s)`);

    // Permission denied
    const denied = this.logger.getSecurityEvents({
      type: 'permission_denied',
      userId,
      startTime: last24h,
      limit: 20,
    }).length;

    if (denied >= 10) { score += 20; factors.push(`${denied} permission denials`); }
    else if (denied >= 3) { score += 8; factors.push(`${denied} permission denials`); }

    // Active threat alerts
    const activeAlerts = Array.from(this.alerts.values()).filter(
      (a) => a.userId === userId && !a.resolved
    );
    score += activeAlerts.length * 20;
    if (activeAlerts.length > 0) factors.push(`${activeAlerts.length} active threat alert(s)`);

    score = Math.min(100, score);

    const riskLevel: RiskAssessment['riskLevel'] =
      score >= 80 ? 'critical' :
      score >= 60 ? 'high' :
      score >= 30 ? 'medium' : 'low';

    const recommendation =
      riskLevel === 'critical' ? 'Immediately lock account and investigate' :
      riskLevel === 'high'     ? 'Force MFA re-authentication and review activity' :
      riskLevel === 'medium'   ? 'Monitor closely and notify user' :
                                 'Normal activity — no action required';

    return {
      userId,
      riskScore: score,
      riskLevel,
      factors: factors.length > 0 ? factors : ['No risk factors detected'],
      recommendation,
      assessedAt: new Date(),
    };
  }

  // -------------------------------------------------------------------------
  // Alert management
  // -------------------------------------------------------------------------

  getActiveAlerts(): ThreatAlert[] {
    return Array.from(this.alerts.values())
      .filter((a) => !a.resolved)
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  getAllAlerts(): ThreatAlert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;
    alert.resolved = true;
    return true;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private raiseAlert(
    data: Omit<ThreatAlert, 'id' | 'detectedAt' | 'resolved'>
  ): ThreatAlert {
    const alert: ThreatAlert = {
      id:         `threat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      detectedAt: new Date(),
      resolved:   false,
      ...data,
    };

    this.alerts.set(alert.id, alert);

    console.warn(`[ThreatDetector] ALERT [${alert.severity.toUpperCase()}] ${alert.type}: ${alert.description}`);

    // Emit to AlertManager if configured
    if (this.onAlert) {
      try { this.onAlert(alert); } catch { /* ignore */ }
    }

    // Log to security event logger
    this.logger.logEvent({
      type:        'suspicious_activity',
      outcome:     'blocked',
      userId:      alert.userId,
      ip:          alert.ip,
      message:     alert.description,
      riskScore:   alert.riskScore,
      metadata:    { alertId: alert.id, alertType: alert.type, evidence: alert.evidence },
    }).catch(() => { /* ignore */ });

    return alert;
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _instance: ThreatDetector | null = null;

export function getThreatDetector(options?: ThreatDetectorOptions): ThreatDetector {
  if (!_instance) {
    _instance = new ThreatDetector(options);
  }
  return _instance;
}
