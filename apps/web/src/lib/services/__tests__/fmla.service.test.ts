/**
 * FMLAService — pure-logic tests (eligibility, period computation, state machine).
 */

import { describe, it, expect } from 'vitest';
import {
  FMLAService,
  InvalidFMLATransitionError,
  IneligibleForFMLAError,
  EntitlementExceededError,
  evaluateEligibility,
  computePeriod,
} from '../fmla.service';

const svc = new FMLAService();

describe('FMLA eligibility (§ 825.110)', () => {
  it('FMLA requires ≥12 months tenure AND ≥1250 hours in prior year', () => {
    expect(
      evaluateEligibility({ tenureMonths: 12, hoursWorkedPrev12Mo: 1250, framework: 'FMLA' })
        .eligible
    ).toBe(true);
    expect(
      evaluateEligibility({ tenureMonths: 11, hoursWorkedPrev12Mo: 1250, framework: 'FMLA' })
        .eligible
    ).toBe(false);
    expect(
      evaluateEligibility({ tenureMonths: 12, hoursWorkedPrev12Mo: 1249, framework: 'FMLA' })
        .eligible
    ).toBe(false);
  });

  it('CFRA mirrors FMLA thresholds', () => {
    expect(
      evaluateEligibility({ tenureMonths: 12, hoursWorkedPrev12Mo: 1250, framework: 'CFRA' })
        .eligible
    ).toBe(true);
    expect(
      evaluateEligibility({ tenureMonths: 11, hoursWorkedPrev12Mo: 1250, framework: 'CFRA' })
        .eligible
    ).toBe(false);
  });

  it('OFLA only requires 6 months tenure, no hours minimum', () => {
    expect(
      evaluateEligibility({ tenureMonths: 6, hoursWorkedPrev12Mo: 0, framework: 'OFLA' }).eligible
    ).toBe(true);
    expect(
      evaluateEligibility({ tenureMonths: 5, hoursWorkedPrev12Mo: 5000, framework: 'OFLA' })
        .eligible
    ).toBe(false);
  });

  it('returns a human-readable reason on ineligibility', () => {
    const r = evaluateEligibility({
      tenureMonths: 6,
      hoursWorkedPrev12Mo: 1250,
      framework: 'FMLA',
    });
    expect(r.eligible).toBe(false);
    expect(r.reason).toMatch(/6mo/);
    expect(r.reason).toMatch(/12mo/);
  });
});

describe('FMLA period computation (§ 825.200)', () => {
  const startDate = new Date('2026-08-15T00:00:00Z');

  it('CALENDAR_YEAR — Jan 1 → Dec 31 of the start year', () => {
    const r = computePeriod({ method: 'CALENDAR_YEAR', startDate });
    expect(r.periodStart.getMonth()).toBe(0);
    expect(r.periodStart.getDate()).toBe(1);
    expect(r.periodEnd.getMonth()).toBe(11);
    expect(r.periodEnd.getDate()).toBe(31);
    expect(r.effectiveEntitlementHours).toBe(480);
  });

  it('ROLLING_FORWARD — start date → 365 days later', () => {
    const r = computePeriod({ method: 'ROLLING_FORWARD', startDate });
    expect(r.periodStart.toISOString().slice(0, 10)).toBe('2026-08-15');
    expect(r.periodEnd.getFullYear()).toBe(2027);
    expect(r.effectiveEntitlementHours).toBe(480);
  });

  it('ROLLING_BACKWARD — effective entitlement reduced by prior-year usage', () => {
    const r = computePeriod({
      method: 'ROLLING_BACKWARD',
      startDate,
      rollingPriorUsage: 120,
    });
    expect(r.effectiveEntitlementHours).toBe(360);
  });

  it('ROLLING_BACKWARD with no prior usage gives full 480h', () => {
    const r = computePeriod({ method: 'ROLLING_BACKWARD', startDate });
    expect(r.effectiveEntitlementHours).toBe(480);
  });

  it('ROLLING_BACKWARD never goes negative when prior usage > 480', () => {
    const r = computePeriod({ method: 'ROLLING_BACKWARD', startDate, rollingPriorUsage: 600 });
    expect(r.effectiveEntitlementHours).toBe(0);
  });

  it('EMPLOYEE_ANNIVERSARY — uses the most recent anniversary on/before the start', () => {
    const r = computePeriod({
      method: 'EMPLOYEE_ANNIVERSARY',
      startDate,
      joiningDate: new Date('2022-03-10'),
    });
    // Most recent anniversary on/before 2026-08-15 is 2026-03-10.
    // computePeriod constructs the anniversary in local time; compare the local
    // date so the test is timezone-robust.
    expect(r.periodStart.getFullYear()).toBe(2026);
    expect(r.periodStart.getMonth()).toBe(2); // March (0-indexed)
    expect(r.periodStart.getDate()).toBe(10);
  });
});

describe('FMLA case transitions', () => {
  it('DRAFT → NOTICE_SENT / DENIED / CANCELED only', () => {
    expect(svc.canTransition('DRAFT', 'NOTICE_SENT')).toBe(true);
    expect(svc.canTransition('DRAFT', 'DENIED')).toBe(true);
    expect(svc.canTransition('DRAFT', 'CANCELED')).toBe(true);
    expect(svc.canTransition('DRAFT', 'ACTIVE')).toBe(false);
    expect(svc.canTransition('DRAFT', 'APPROVED')).toBe(false);
  });

  it('NOTICE_SENT → CERTIFIED / DENIED / CANCELED only', () => {
    expect(svc.canTransition('NOTICE_SENT', 'CERTIFIED')).toBe(true);
    expect(svc.canTransition('NOTICE_SENT', 'DENIED')).toBe(true);
    expect(svc.canTransition('NOTICE_SENT', 'CANCELED')).toBe(true);
    expect(svc.canTransition('NOTICE_SENT', 'APPROVED')).toBe(false);
  });

  it('ACTIVE ↔ INTERMITTENT', () => {
    expect(svc.canTransition('ACTIVE', 'INTERMITTENT')).toBe(true);
    expect(svc.canTransition('INTERMITTENT', 'ACTIVE')).toBe(true);
  });

  it('EXHAUSTED → COMPLETED only', () => {
    expect(svc.canTransition('EXHAUSTED', 'COMPLETED')).toBe(true);
    expect(svc.canTransition('EXHAUSTED', 'ACTIVE')).toBe(false);
    expect(svc.canTransition('EXHAUSTED', 'CANCELED')).toBe(false);
  });

  it('terminal states reject all transitions', () => {
    for (const t of ['COMPLETED', 'DENIED', 'CANCELED'] as const) {
      expect(svc.canTransition(t, 'DRAFT')).toBe(false);
      expect(svc.canTransition(t, 'APPROVED')).toBe(false);
    }
  });

  it('assertTransition throws on illegal moves', () => {
    expect(() => svc.assertTransition('DRAFT', 'ACTIVE')).toThrow(InvalidFMLATransitionError);
    expect(() => svc.assertTransition('DENIED', 'APPROVED')).toThrow(/DENIED/);
  });
});

describe('FMLA error contracts', () => {
  it('IneligibleForFMLAError carries reason', () => {
    const err = new IneligibleForFMLAError('Tenure 6mo < required 12mo');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('IneligibleForFMLAError');
    expect(err.reason).toMatch(/6mo/);
  });

  it('EntitlementExceededError carries attempted + remaining', () => {
    const err = new EntitlementExceededError(40, 16);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('EntitlementExceededError');
    expect(err.attempted).toBe(40);
    expect(err.remaining).toBe(16);
    expect(err.message).toMatch(/40h/);
    expect(err.message).toMatch(/16h remaining/);
  });

  it('InvalidFMLATransitionError is a real Error subclass', () => {
    const err = new InvalidFMLATransitionError('DRAFT', 'ACTIVE');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('InvalidFMLATransitionError');
  });
});
