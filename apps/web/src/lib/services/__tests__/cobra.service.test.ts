/**
 * COBRA — pure-logic + state-machine tests.
 *
 * Covers: deadline computation per qualifying-event type, premium uplift
 * formula, transition matrix, and error subclass contracts. No Prisma.
 */

import { describe, it, expect } from 'vitest';
import {
  CobraService,
  InvalidCobraTransitionError,
  ElectionWindowExpiredError,
} from '../cobra.service';

const svc = new CobraService();

describe('CobraService.computeDeadlines', () => {
  const qualifyingDate = new Date('2026-01-01T00:00:00Z');

  it('TERMINATION → 60-day election window + 18-month coverage cap', () => {
    const d = svc.computeDeadlines('TERMINATION', qualifyingDate);
    expect(d.coverageMonths).toBe(18);
    const dayDiff =
      (d.electionDeadline.getTime() - qualifyingDate.getTime()) / (24 * 60 * 60 * 1000);
    expect(dayDiff).toBe(60);
  });

  it('REDUCED_HOURS → 18-month cap (same as termination)', () => {
    const d = svc.computeDeadlines('REDUCED_HOURS', qualifyingDate);
    expect(d.coverageMonths).toBe(18);
  });

  it('DIVORCE / DEPENDENT_LOSS / DEATH / MEDICARE → 36-month cap', () => {
    for (const ev of ['DIVORCE', 'DEPENDENT_LOSS', 'DEATH', 'MEDICARE_ELIGIBILITY'] as const) {
      const d = svc.computeDeadlines(ev, qualifyingDate);
      expect(d.coverageMonths).toBe(36);
    }
  });
});

describe('CobraService.computeCobraPremium', () => {
  it('sums employee+employer and adds 2% admin uplift', () => {
    expect(svc.computeCobraPremium(100, 400)).toBe(510); // (100+400)*1.02
    expect(svc.computeCobraPremium(0, 250)).toBe(255);
  });

  it('rounds to 2 decimals', () => {
    expect(svc.computeCobraPremium(33.33, 66.67)).toBe(102); // 100 * 1.02
    // (123.45 + 234.56) * 1.02 = 365.1702 → round-half-up to 365.17
    expect(svc.computeCobraPremium(123.45, 234.56)).toBe(365.17);
  });
});

describe('CobraService transitions', () => {
  it('PENDING_ELECTION → ELECTED / DECLINED / EXPIRED / CANCELED', () => {
    expect(svc.canTransition('PENDING_ELECTION', 'ELECTED')).toBe(true);
    expect(svc.canTransition('PENDING_ELECTION', 'DECLINED')).toBe(true);
    expect(svc.canTransition('PENDING_ELECTION', 'EXPIRED')).toBe(true);
    expect(svc.canTransition('PENDING_ELECTION', 'CANCELED')).toBe(true);
    expect(svc.canTransition('PENDING_ELECTION', 'ACTIVE')).toBe(false);
    expect(svc.canTransition('PENDING_ELECTION', 'TERMINATED_NONPAYMENT')).toBe(false);
  });

  it('ELECTED → ACTIVE / CANCELED only', () => {
    expect(svc.canTransition('ELECTED', 'ACTIVE')).toBe(true);
    expect(svc.canTransition('ELECTED', 'CANCELED')).toBe(true);
    expect(svc.canTransition('ELECTED', 'PENDING_ELECTION')).toBe(false);
    expect(svc.canTransition('ELECTED', 'DECLINED')).toBe(false);
  });

  it('ACTIVE → TERMINATED_NONPAYMENT / EXPIRED / CANCELED', () => {
    expect(svc.canTransition('ACTIVE', 'TERMINATED_NONPAYMENT')).toBe(true);
    expect(svc.canTransition('ACTIVE', 'EXPIRED')).toBe(true);
    expect(svc.canTransition('ACTIVE', 'CANCELED')).toBe(true);
    expect(svc.canTransition('ACTIVE', 'PENDING_ELECTION')).toBe(false);
  });

  it('terminal states reject everything', () => {
    for (const term of ['TERMINATED_NONPAYMENT', 'EXPIRED', 'DECLINED', 'CANCELED'] as const) {
      expect(svc.canTransition(term, 'ACTIVE')).toBe(false);
      expect(svc.canTransition(term, 'ELECTED')).toBe(false);
    }
  });

  it('assertTransition throws on illegal moves', () => {
    expect(() => svc.assertTransition('EXPIRED', 'ACTIVE')).toThrow(InvalidCobraTransitionError);
    expect(() => svc.assertTransition('PENDING_ELECTION', 'ACTIVE')).toThrow(/PENDING_ELECTION/);
  });
});

describe('COBRA error contracts', () => {
  it('InvalidCobraTransitionError is a real Error subclass', () => {
    const err = new InvalidCobraTransitionError('PENDING_ELECTION', 'ACTIVE');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('InvalidCobraTransitionError');
  });

  it('ElectionWindowExpiredError carries the deadline in the message', () => {
    const err = new ElectionWindowExpiredError(new Date('2026-03-15'));
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ElectionWindowExpiredError');
    expect(err.message).toMatch(/2026-03-15/);
  });
});
