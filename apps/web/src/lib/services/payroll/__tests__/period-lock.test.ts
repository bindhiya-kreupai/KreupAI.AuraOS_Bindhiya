import { describe, it, expect } from 'vitest';
import {
  classifyPeriod,
  evaluateChangeAgainstPeriod,
  type PeriodConfig,
} from '../period-lock.service';

const period = (overrides: Partial<PeriodConfig> = {}): PeriodConfig => ({
  period: '2026-06',
  cutOffDate: new Date('2026-06-25T00:00:00Z'),
  processedAt: undefined,
  releasedAt: undefined,
  ...overrides,
});

describe('classifyPeriod — EPIC-10', () => {
  it('OPEN before the cut-off date', () => {
    expect(classifyPeriod(period(), new Date('2026-06-20'))).toBe('OPEN');
  });

  it('CUT_OFF after the cut-off date', () => {
    expect(classifyPeriod(period(), new Date('2026-06-26'))).toBe('CUT_OFF');
  });

  it('LOCKED after the processedAt date', () => {
    expect(
      classifyPeriod(period({ processedAt: new Date('2026-06-28') }), new Date('2026-06-29'))
    ).toBe('LOCKED');
  });

  it('PROCESSED after the releasedAt date', () => {
    expect(
      classifyPeriod(
        period({
          processedAt: new Date('2026-06-28'),
          releasedAt: new Date('2026-06-30'),
        }),
        new Date('2026-07-02')
      )
    ).toBe('PROCESSED');
  });
});

describe('evaluateChangeAgainstPeriod — EPIC-10', () => {
  it('OPEN: pass-through, no gate', () => {
    const v = evaluateChangeAgainstPeriod({
      changeType: 'LEAVE_APPLICATION',
      period: period(),
      appliedAt: new Date('2026-06-20'),
    });
    expect(v.allow).toBe(true);
    expect(v.reason).toBe('OPEN_NO_GATE');
  });

  it('CUT_OFF: allowed but flagged for maker-checker', () => {
    const v = evaluateChangeAgainstPeriod({
      changeType: 'LEAVE_APPLICATION',
      period: period(),
      appliedAt: new Date('2026-06-27'),
    });
    expect(v.allow).toBe(true);
    expect(v.reason).toBe('POST_CUT_OFF_REQUIRES_MAKER_CHECKER');
  });

  it('LOCKED: refused for non-senior actors', () => {
    const v = evaluateChangeAgainstPeriod({
      changeType: 'SALARY_CHANGE',
      period: period({ processedAt: new Date('2026-06-28') }),
      appliedAt: new Date('2026-06-29'),
      actorRole: 'PAYROLL_OFFICER',
      hasJustification: true,
    });
    expect(v.allow).toBe(false);
    expect(v.reason).toBe('ACTOR_ROLE_INSUFFICIENT');
  });

  it('LOCKED: refused when justification is missing (even for senior actor)', () => {
    const v = evaluateChangeAgainstPeriod({
      changeType: 'SALARY_CHANGE',
      period: period({ processedAt: new Date('2026-06-28') }),
      appliedAt: new Date('2026-06-29'),
      actorRole: 'PAYROLL_DIRECTOR',
      hasJustification: false,
    });
    expect(v.allow).toBe(false);
    expect(v.reason).toBe('JUSTIFICATION_MISSING');
  });

  it('LOCKED: allowed with senior role + justification', () => {
    const v = evaluateChangeAgainstPeriod({
      changeType: 'SALARY_CHANGE',
      period: period({ processedAt: new Date('2026-06-28') }),
      appliedAt: new Date('2026-06-29'),
      actorRole: 'PAYROLL_DIRECTOR',
      hasJustification: true,
    });
    expect(v.allow).toBe(true);
    expect(v.reason).toBe('PERIOD_LOCKED_REQUIRES_OVERRIDE');
  });

  it('PROCESSED: always refused (must go through off-cycle)', () => {
    const v = evaluateChangeAgainstPeriod({
      changeType: 'SALARY_CHANGE',
      period: period({
        processedAt: new Date('2026-06-28'),
        releasedAt: new Date('2026-06-30'),
      }),
      appliedAt: new Date('2026-07-01'),
      actorRole: 'CEO',
      hasJustification: true,
    });
    expect(v.allow).toBe(false);
    expect(v.reason).toBe('PERIOD_PROCESSED_BLOCKED');
  });

  it('bilingual reason on every verdict', () => {
    const v = evaluateChangeAgainstPeriod({
      changeType: 'LEAVE_APPLICATION',
      period: period(),
      appliedAt: new Date('2026-06-20'),
    });
    expect(v.reasonEn.length).toBeGreaterThan(0);
    expect(v.reasonAr.length).toBeGreaterThan(0);
    expect(v.reasonEn).not.toBe(v.reasonAr);
  });
});
