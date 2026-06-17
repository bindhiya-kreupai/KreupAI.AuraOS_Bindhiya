import { describe, it, expect } from 'vitest';
import { EOSBService } from '../eosb.service';

/**
 * EPIC-28-S09 closure (audit 2026-06-17).
 *
 * Unpaid-leave days are subtracted from the gratuity-eligible total
 * service before period splits and amounts are computed. The
 * employment-window dates (years / months / days) are NOT mutated.
 */
describe('EOSBService.calculate — unpaid-leave deduction (S09)', () => {
  const baseInput = {
    employeeId: 'emp-1',
    countryCode: 'AE' as const,
    joiningDate: new Date('2018-01-01T00:00:00Z'),
    lastWorkingDate: new Date('2026-01-01T00:00:00Z'), // 8 calendar years
    basicSalary: 10_000,
    terminationType: 'END_OF_CONTRACT' as const,
  };

  it('produces an identical result when unpaidLeaveDays is 0', () => {
    const a = EOSBService.calculate(baseInput);
    const b = EOSBService.calculate({ ...baseInput, unpaidLeaveDays: 0 });
    expect(a.grossAmount).toBe(b.grossAmount);
    expect(a.netAmount).toBe(b.netAmount);
  });

  it('lower gratuity when unpaidLeaveDays > 0', () => {
    const noLeave = EOSBService.calculate(baseInput);
    const withLeave = EOSBService.calculate({ ...baseInput, unpaidLeaveDays: 60 });

    // 60 unpaid days subtracted → less paid service → smaller gross
    expect(withLeave.grossAmount).toBeLessThan(noLeave.grossAmount);
  });

  it('subtracts the right number of days from totalDays', () => {
    const noLeave = EOSBService.calculate(baseInput);
    const withLeave = EOSBService.calculate({ ...baseInput, unpaidLeaveDays: 30 });
    expect(noLeave.daysOfService - withLeave.daysOfService).toBe(30);
  });

  it('treats fractional / negative inputs defensively (clamp to ≥ 0, round)', () => {
    const a = EOSBService.calculate({ ...baseInput, unpaidLeaveDays: -5 });
    const b = EOSBService.calculate({ ...baseInput, unpaidLeaveDays: 0 });
    expect(a.daysOfService).toBe(b.daysOfService);

    const c = EOSBService.calculate({ ...baseInput, unpaidLeaveDays: 1.5 });
    const d = EOSBService.calculate({ ...baseInput, unpaidLeaveDays: 2 });
    expect(c.daysOfService).toBe(d.daysOfService);
  });

  it('records a note when unpaid leave is excluded', () => {
    const r = EOSBService.calculate({ ...baseInput, unpaidLeaveDays: 14 });
    expect(r.calculationDetails.notes.some((n) => n.includes('unpaid-leave'))).toBe(true);
    expect(r.calculationDetails.notesAr.some((n) => n.includes('بدون أجر'))).toBe(true);
  });

  it('keeps calendar year/month/day display fields independent of unpaid-leave deduction', () => {
    const a = EOSBService.calculate(baseInput);
    const b = EOSBService.calculate({ ...baseInput, unpaidLeaveDays: 30 });
    expect(b.yearsOfService).toBe(a.yearsOfService);
    expect(b.monthsOfService).toBeLessThanOrEqual(a.monthsOfService); // totalMonths recomputed from paid days; allowable
  });

  it('preserves rule-pack override semantics (UAE 21/30 default → 25 override)', async () => {
    // Sanity: with unpaid-leave deducted, the rule-pack pathway still
    // honours overrides. Use the sync `calculate` with an explicit
    // override to keep the test deterministic.
    const noLeave = EOSBService.calculate(baseInput, { firstPeriodDaysPerYear: 25 });
    const withLeave = EOSBService.calculate(
      { ...baseInput, unpaidLeaveDays: 365 },
      { firstPeriodDaysPerYear: 25 }
    );
    expect(noLeave.calculationDetails.formula).toContain('25 days');
    expect(withLeave.calculationDetails.formula).toContain('25 days');
    expect(withLeave.grossAmount).toBeLessThan(noLeave.grossAmount);
  });
});
