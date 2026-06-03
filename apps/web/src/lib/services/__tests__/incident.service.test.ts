/**
 * IncidentService — pure transition + MTTR/MTTA + postmortem-gate tests. (#100)
 */

import { describe, it, expect } from 'vitest';
import { IncidentService, InvalidIncidentTransitionError } from '../incident.service';

const svc = new IncidentService();

describe('IncidentService transitions', () => {
  it('OPEN → INVESTIGATING / MITIGATED / RESOLVED', () => {
    expect(svc.canTransition('OPEN', 'INVESTIGATING')).toBe(true);
    expect(svc.canTransition('OPEN', 'MITIGATED')).toBe(true);
    expect(svc.canTransition('OPEN', 'RESOLVED')).toBe(true);
    expect(svc.canTransition('OPEN', 'POSTMORTEM_PUBLISHED')).toBe(false);
  });

  it('INVESTIGATING → MITIGATED / RESOLVED', () => {
    expect(svc.canTransition('INVESTIGATING', 'MITIGATED')).toBe(true);
    expect(svc.canTransition('INVESTIGATING', 'RESOLVED')).toBe(true);
    expect(svc.canTransition('INVESTIGATING', 'OPEN')).toBe(false);
  });

  it('MITIGATED can re-open investigation or resolve', () => {
    expect(svc.canTransition('MITIGATED', 'INVESTIGATING')).toBe(true);
    expect(svc.canTransition('MITIGATED', 'RESOLVED')).toBe(true);
    expect(svc.canTransition('MITIGATED', 'OPEN')).toBe(false);
  });

  it('RESOLVED → POSTMORTEM_PUBLISHED only', () => {
    expect(svc.canTransition('RESOLVED', 'POSTMORTEM_PUBLISHED')).toBe(true);
    expect(svc.canTransition('RESOLVED', 'OPEN')).toBe(false);
    expect(svc.canTransition('RESOLVED', 'MITIGATED')).toBe(false);
  });

  it('POSTMORTEM_PUBLISHED is terminal', () => {
    expect(svc.canTransition('POSTMORTEM_PUBLISHED', 'RESOLVED')).toBe(false);
    expect(svc.canTransition('POSTMORTEM_PUBLISHED', 'OPEN')).toBe(false);
  });

  it('assertTransition throws on illegal moves', () => {
    expect(() => svc.assertTransition('OPEN', 'POSTMORTEM_PUBLISHED')).toThrow(
      InvalidIncidentTransitionError
    );
  });
});

describe('IncidentService formatting + timing helpers', () => {
  it('formats incident numbers zero-padded to 3 digits', () => {
    expect(svc.formatIncidentNumber(2026, 1)).toBe('INC-2026-001');
    expect(svc.formatIncidentNumber(2026, 42)).toBe('INC-2026-042');
    expect(svc.formatIncidentNumber(2026, 1234)).toBe('INC-2026-1234');
  });

  it('computes MTTR in minutes', () => {
    const detected = new Date('2026-06-02T10:00:00Z');
    const resolved = new Date('2026-06-02T10:42:00Z');
    expect(svc.computeMTTR(detected, resolved)).toBe(42);
  });

  it('returns null MTTR when not yet resolved', () => {
    expect(svc.computeMTTR(new Date(), null)).toBeNull();
    expect(svc.computeMTTR(new Date(), undefined)).toBeNull();
  });

  it('computes MTTA in minutes', () => {
    const detected = new Date('2026-06-02T10:00:00Z');
    const ack = new Date('2026-06-02T10:05:30Z');
    // Math.round of 5.5 → 6
    expect(svc.computeMTTA(detected, ack)).toBe(6);
  });
});
