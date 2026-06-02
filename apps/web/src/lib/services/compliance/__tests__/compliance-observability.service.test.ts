/**
 * ComplianceObservabilityService — compliance metrics + alerting tests.
 */

import { describe, it, expect } from 'vitest';
import { ComplianceObservabilityService } from '../compliance-observability.service';

describe('ComplianceObservabilityService.recordMetric', () => {
  it('returns a metric with id, timestamp, and required fields', () => {
    const m = ComplianceObservabilityService.recordMetric(
      'UAE_WPS' as any,
      'SUBMISSION_SUCCESS_RATE' as any,
      97,
      'tenant-A',
      { period: '2026-06' }
    );

    expect(m.id).toMatch(/^METRIC-UAE_WPS-SUBMISSION_SUCCESS_RATE-/);
    expect(m.value).toBe(97);
    expect(m.tenantId).toBe('tenant-A');
    expect(m.tags.period).toBe('2026-06');
    expect(m.timestamp).toBeInstanceOf(Date);
  });

  it('defaults to empty tags object when no tags provided', () => {
    const m = ComplianceObservabilityService.recordMetric(
      'KSA_GOSI' as any,
      'SUBMISSION_LATENCY_MS' as any,
      5000,
      'tenant-A'
    );
    expect(m.tags).toEqual({});
  });
});

describe('ComplianceObservabilityService.getDefaultAlertThresholds', () => {
  it('returns a non-empty array of thresholds', () => {
    const thresholds = ComplianceObservabilityService.getDefaultAlertThresholds();
    expect(thresholds.length).toBeGreaterThan(0);
  });

  it('includes thresholds for all 8 regulators', () => {
    const thresholds = ComplianceObservabilityService.getDefaultAlertThresholds();
    const regulators = new Set(thresholds.map((t) => t.regulatorId));
    expect(regulators.size).toBe(8);
  });

  it('includes WARNING + CRITICAL severities for success rate', () => {
    const thresholds = ComplianceObservabilityService.getDefaultAlertThresholds();
    const uaeWPS = thresholds.filter((t) => t.regulatorId === 'UAE_WPS');
    expect(uaeWPS.some((t) => t.severity === 'WARNING')).toBe(true);
    expect(uaeWPS.some((t) => t.severity === 'CRITICAL')).toBe(true);
  });

  it('all thresholds are enabled by default', () => {
    const thresholds = ComplianceObservabilityService.getDefaultAlertThresholds();
    expect(thresholds.every((t) => t.enabled)).toBe(true);
  });
});

describe('ComplianceObservabilityService.evaluateAlert', () => {
  const successRateThreshold: any = {
    id: 'T-1',
    regulatorId: 'UAE_WPS',
    metricType: 'SUBMISSION_SUCCESS_RATE',
    condition: 'BELOW',
    threshold: 95,
    severity: 'WARNING',
    windowMinutes: 60,
    consecutiveBreaches: 1,
    notificationChannels: ['SLACK'],
    enabled: true,
    description: 'Test',
    descriptionAr: 'Test',
  };

  it('triggers when value is BELOW threshold and condition=BELOW', () => {
    const alert = ComplianceObservabilityService.evaluateAlert(successRateThreshold, 80);
    expect(alert).not.toBeNull();
    expect(alert?.severity).toBe('WARNING');
  });

  it('does NOT trigger when value is at or above threshold', () => {
    expect(ComplianceObservabilityService.evaluateAlert(successRateThreshold, 95)).toBeNull();
    expect(ComplianceObservabilityService.evaluateAlert(successRateThreshold, 99)).toBeNull();
  });

  it('triggers when value is ABOVE threshold and condition=ABOVE', () => {
    const latencyThreshold: any = {
      ...successRateThreshold,
      condition: 'ABOVE',
      threshold: 30000,
      metricType: 'SUBMISSION_LATENCY_MS',
    };
    expect(
      ComplianceObservabilityService.evaluateAlert(latencyThreshold, 45000)
    ).not.toBeNull();
    expect(ComplianceObservabilityService.evaluateAlert(latencyThreshold, 15000)).toBeNull();
  });

  // Note: evaluateAlert in this version does not check `enabled` flag —
  // that's the responsibility of the caller / scheduler.
});

describe('ComplianceObservabilityService.recordRetryOutcome', () => {
  it('records a retry-outcome event', () => {
    const event = ComplianceObservabilityService.recordRetryOutcome(
      'UAE_WPS' as any,
      'tenant-A',
      'SUB-001',
      2,
      'SUCCESS' as any,
      { previousError: 'TIMEOUT' }
    );
    expect(event).toBeDefined();
  });
});

describe('ComplianceObservabilityService.generateFailureDrillbook', () => {
  it('returns a non-empty drillbook', () => {
    const drillbook = ComplianceObservabilityService.generateFailureDrillbook();
    expect(drillbook.length).toBeGreaterThan(0);
  });
});

describe('ComplianceObservabilityService.generateDashboard', () => {
  it('returns a dashboard structure with empty metrics + alerts + retries', () => {
    const dashboard = ComplianceObservabilityService.generateDashboard([], [], []);
    expect(dashboard).toBeDefined();
    expect(typeof dashboard).toBe('object');
  });

  it('aggregates a sample of metrics into the dashboard', () => {
    const metric = ComplianceObservabilityService.recordMetric(
      'UAE_WPS' as any,
      'SUBMISSION_SUCCESS_RATE' as any,
      97,
      'tenant-A'
    );

    const dashboard = ComplianceObservabilityService.generateDashboard([metric], [], []);
    expect(dashboard).toBeDefined();
  });
});
