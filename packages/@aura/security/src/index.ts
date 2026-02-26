/**
 * @aura/security
 * AuraOS Security Operations Package
 *
 * Exports:
 *   WAF:
 *     - RateLimiter        — Redis sliding-window rate limiting
 *     - sanitizeInput      — XSS prevention
 *     - validateSQL        — SQL injection detection
 *     - validatePath       — Path traversal prevention
 *     - validateHeaders    — Header injection prevention
 *     - createSecurityMiddleware — Express WAF middleware
 *     - IPFirewall         — IP allow/block list + geo-blocking
 *
 *   SIEM:
 *     - SecurityEventLogger — Structured security audit logging
 *     - ThreatDetector      — Behavioural threat analysis
 */

// WAF — Rate limiting
export { RateLimiter, DEFAULT_LIMITS } from './waf/rate-limiter';
export type {
  RateLimitResult,
  RateLimiterOptions,
  EndpointLimitConfig,
} from './waf/rate-limiter';

// WAF — Input validation
export {
  sanitizeInput,
  detectXSS,
  validateSQL,
  validatePath,
  validateHeaders,
  createSecurityMiddleware,
} from './waf/input-validator';
export type {
  ValidationResult,
  SecurityMiddlewareOptions,
  ExpressRequest,
  ExpressResponse,
  NextFunction,
} from './waf/input-validator';

// WAF — IP Firewall
export { IPFirewall } from './waf/ip-firewall';
export type {
  IPFirewallOptions,
  FirewallDecision,
  FirewallCheckResult,
  GeoIPResult,
} from './waf/ip-firewall';

// SIEM — Security event logging
export {
  SecurityEventLogger,
  getSecurityEventLogger,
} from './siem/security-event-logger';
export type {
  SecurityEventType,
  SecurityEventSeverity,
  SecurityEvent,
  SecurityEventFilters,
  SecurityMetrics,
  SecurityEventLoggerOptions,
} from './siem/security-event-logger';

// SIEM — Threat detection
export {
  ThreatDetector,
  getThreatDetector,
} from './siem/threat-detector';
export type {
  ThreatType,
  ThreatSeverity,
  ThreatAlert,
  LoginPattern,
  GeoLocation,
  RiskAssessment,
  ThreatDetectorOptions,
} from './siem/threat-detector';
