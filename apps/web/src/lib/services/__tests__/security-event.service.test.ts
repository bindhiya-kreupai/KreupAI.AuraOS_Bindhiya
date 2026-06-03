/**
 * SecurityEventService — pure escalation + hotspot ranking tests. (#113)
 */

import { describe, it, expect } from 'vitest';
import { SecurityEventService } from '../security-event.service';

const svc = new SecurityEventService();

describe('SecurityEventService.shouldEscalate', () => {
  it('escalates on HIGH/CRITICAL regardless of event type', () => {
    expect(svc.shouldEscalate('HIGH', 'SQL_INJECTION')).toBe(true);
    expect(svc.shouldEscalate('CRITICAL', 'XSS')).toBe(true);
    expect(svc.shouldEscalate('HIGH', 'RATE_LIMIT_HIT')).toBe(true);
  });

  it('does NOT escalate on INFO/LOW/MEDIUM for generic types', () => {
    expect(svc.shouldEscalate('INFO', 'RATE_LIMIT_HIT')).toBe(false);
    expect(svc.shouldEscalate('LOW', 'LOGIN_ANOMALY')).toBe(false);
    expect(svc.shouldEscalate('MEDIUM', 'XSS')).toBe(false);
  });

  it('always escalates priv-esc, MFA bypass, and data exfil suspicion', () => {
    expect(svc.shouldEscalate('INFO', 'PRIV_ESCAL')).toBe(true);
    expect(svc.shouldEscalate('LOW', 'MFA_BYPASS_ATTEMPT')).toBe(true);
    expect(svc.shouldEscalate('MEDIUM', 'DATA_EXFIL_SUSPICION')).toBe(true);
  });
});

describe('SecurityEventService.rankHotspots', () => {
  const t0 = new Date('2026-06-03T10:00:00Z');
  const t1 = new Date('2026-06-03T10:05:00Z');
  const t2 = new Date('2026-06-03T10:10:00Z');

  it('returns empty array when no events', () => {
    expect(svc.rankHotspots([])).toEqual([]);
  });

  it('ranks by event count descending', () => {
    const ranked = svc.rankHotspots([
      { sourceIp: '1.1.1.1', severity: 'LOW', detectedAt: t0 },
      { sourceIp: '2.2.2.2', severity: 'HIGH', detectedAt: t0 },
      { sourceIp: '1.1.1.1', severity: 'MEDIUM', detectedAt: t1 },
      { sourceIp: '1.1.1.1', severity: 'CRITICAL', detectedAt: t2 },
      { sourceIp: '2.2.2.2', severity: 'LOW', detectedAt: t2 },
    ]);
    expect(ranked).toHaveLength(2);
    expect(ranked[0].sourceIp).toBe('1.1.1.1');
    expect(ranked[0].eventCount).toBe(3);
    expect(ranked[1].sourceIp).toBe('2.2.2.2');
    expect(ranked[1].eventCount).toBe(2);
  });

  it('tracks firstSeen and lastSeen across events', () => {
    const ranked = svc.rankHotspots([
      { sourceIp: '1.1.1.1', severity: 'LOW', detectedAt: t1 },
      { sourceIp: '1.1.1.1', severity: 'CRITICAL', detectedAt: t0 },
      { sourceIp: '1.1.1.1', severity: 'MEDIUM', detectedAt: t2 },
    ]);
    expect(ranked[0].firstSeen.getTime()).toBe(t0.getTime());
    expect(ranked[0].lastSeen.getTime()).toBe(t2.getTime());
  });

  it('collects distinct severities only', () => {
    const ranked = svc.rankHotspots([
      { sourceIp: '1.1.1.1', severity: 'LOW', detectedAt: t0 },
      { sourceIp: '1.1.1.1', severity: 'LOW', detectedAt: t1 },
      { sourceIp: '1.1.1.1', severity: 'CRITICAL', detectedAt: t2 },
    ]);
    expect(ranked[0].severitiesSeen.sort()).toEqual(['CRITICAL', 'LOW']);
  });

  it('skips events with null sourceIp', () => {
    const ranked = svc.rankHotspots([
      { sourceIp: null, severity: 'LOW', detectedAt: t0 },
      { sourceIp: '1.1.1.1', severity: 'LOW', detectedAt: t0 },
    ]);
    expect(ranked).toHaveLength(1);
    expect(ranked[0].sourceIp).toBe('1.1.1.1');
  });

  it('respects the limit', () => {
    const events = ['a', 'b', 'c', 'd', 'e'].flatMap((ip, i) =>
      Array(i + 1)
        .fill(0)
        .map(() => ({
          sourceIp: ip,
          severity: 'LOW' as const,
          detectedAt: t0,
        }))
    );
    const ranked = svc.rankHotspots(events, 3);
    expect(ranked).toHaveLength(3);
    expect(ranked[0].sourceIp).toBe('e');
    expect(ranked[1].sourceIp).toBe('d');
    expect(ranked[2].sourceIp).toBe('c');
  });
});
