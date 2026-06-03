/**
 * DisasterRecoveryService — state machine + RPO/RTO evaluation tests. (#96)
 */

import { describe, it, expect } from 'vitest';
import {
  DisasterRecoveryService,
  InvalidDROutcomeTransitionError,
} from '../disaster-recovery.service';

const svc = new DisasterRecoveryService();

describe('DisasterRecoveryService.evaluateDrill', () => {
  it('PASS when both RPO and RTO targets met', () => {
    const r = svc.evaluateDrill({
      rpoTargetMin: 15,
      rtoTargetMin: 60,
      actualRpoMin: 10,
      actualRtoMin: 45,
    });
    expect(r.verdict).toBe('PASS');
    expect(r.missed).toEqual([]);
  });

  it('PASS at exact targets (≤ is the boundary)', () => {
    const r = svc.evaluateDrill({
      rpoTargetMin: 15,
      rtoTargetMin: 60,
      actualRpoMin: 15,
      actualRtoMin: 60,
    });
    expect(r.verdict).toBe('PASS');
  });

  it('FAIL when RPO missed', () => {
    const r = svc.evaluateDrill({
      rpoTargetMin: 15,
      rtoTargetMin: 60,
      actualRpoMin: 20,
      actualRtoMin: 45,
    });
    expect(r.verdict).toBe('FAIL');
    expect(r.missed).toEqual([{ metric: 'RPO', target: 15, actual: 20 }]);
  });

  it('FAIL when RTO missed', () => {
    const r = svc.evaluateDrill({
      rpoTargetMin: 15,
      rtoTargetMin: 60,
      actualRpoMin: 10,
      actualRtoMin: 80,
    });
    expect(r.verdict).toBe('FAIL');
    expect(r.missed).toEqual([{ metric: 'RTO', target: 60, actual: 80 }]);
  });

  it('FAIL with both missed → both in missed array', () => {
    const r = svc.evaluateDrill({
      rpoTargetMin: 15,
      rtoTargetMin: 60,
      actualRpoMin: 20,
      actualRtoMin: 80,
    });
    expect(r.verdict).toBe('FAIL');
    expect(r.missed.length).toBe(2);
  });

  it('INCONCLUSIVE when either actual is missing', () => {
    expect(
      svc.evaluateDrill({
        rpoTargetMin: 15,
        rtoTargetMin: 60,
        actualRpoMin: null,
        actualRtoMin: 30,
      }).verdict
    ).toBe('INCONCLUSIVE');
    expect(
      svc.evaluateDrill({
        rpoTargetMin: 15,
        rtoTargetMin: 60,
        actualRpoMin: 10,
        actualRtoMin: null,
      }).verdict
    ).toBe('INCONCLUSIVE');
  });
});

describe('DisasterRecoveryService transitions', () => {
  it('PLANNED → IN_PROGRESS / INCONCLUSIVE only', () => {
    expect(svc.canTransition('PLANNED', 'IN_PROGRESS')).toBe(true);
    expect(svc.canTransition('PLANNED', 'INCONCLUSIVE')).toBe(true);
    expect(svc.canTransition('PLANNED', 'PASS')).toBe(false);
    expect(svc.canTransition('PLANNED', 'FAIL')).toBe(false);
  });

  it('IN_PROGRESS → PASS / FAIL / INCONCLUSIVE', () => {
    expect(svc.canTransition('IN_PROGRESS', 'PASS')).toBe(true);
    expect(svc.canTransition('IN_PROGRESS', 'FAIL')).toBe(true);
    expect(svc.canTransition('IN_PROGRESS', 'INCONCLUSIVE')).toBe(true);
  });

  it('PASS / FAIL / INCONCLUSIVE are terminal', () => {
    for (const t of ['PASS', 'FAIL', 'INCONCLUSIVE'] as const) {
      expect(svc.canTransition(t, 'IN_PROGRESS')).toBe(false);
      expect(svc.canTransition(t, 'PLANNED')).toBe(false);
    }
  });

  it('assertTransition throws on illegal moves', () => {
    expect(() => svc.assertTransition('PLANNED', 'PASS')).toThrow(InvalidDROutcomeTransitionError);
  });
});
