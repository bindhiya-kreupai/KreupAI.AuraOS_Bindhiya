import { describe, expect, it } from 'vitest';
import { evaluateGosiObligations, type GosiObligationInput } from '../obligation-calendar.service';

const may2026: GosiObligationInput = { wageMonth: new Date(Date.UTC(2026, 4, 1)) };

describe('EPIC-13 GOSI obligation calendar', () => {
  it('produces two rows per input month (wage filing + settlement)', () => {
    const r = evaluateGosiObligations([may2026]);
    expect(r.rows).toHaveLength(2);
    expect(r.rows.map((x) => x.kind).sort()).toEqual(['CONTRIBUTION_SETTLEMENT', 'WAGE_FILING']);
  });

  it('places wage filing on the 15th of the following month (May → June 15)', () => {
    const r = evaluateGosiObligations([{ ...may2026, asOf: new Date(Date.UTC(2026, 4, 20)) }]);
    const wage = r.rows.find((x) => x.kind === 'WAGE_FILING')!;
    expect(wage.statutoryDeadline.toISOString().slice(0, 10)).toBe('2026-06-15');
  });

  it('shifts a Friday deadline to the next Sunday', () => {
    // March 2026 wages → wage filing statutory 15 April 2026 (Wednesday).
    // Use April 2025 wages → statutory 15 May 2025 (Thursday). Pick a year
    // where the 15th lands on Friday. 15 Aug 2025 is a Friday.
    const jul2025: GosiObligationInput = { wageMonth: new Date(Date.UTC(2025, 6, 1)) };
    const r = evaluateGosiObligations([jul2025]);
    const wage = r.rows.find((x) => x.kind === 'WAGE_FILING')!;
    expect(wage.statutoryDeadline.toISOString().slice(0, 10)).toBe('2025-08-15');
    // 15 Aug 2025 is a Friday; effective should be Sunday 17 Aug 2025.
    expect(wage.effectiveDeadline.toISOString().slice(0, 10)).toBe('2025-08-17');
  });

  it('marks satisfied obligations as OK', () => {
    const r = evaluateGosiObligations([
      {
        wageMonth: new Date(Date.UTC(2026, 4, 1)),
        wageFiled: true,
        contributionSettled: true,
        asOf: new Date(Date.UTC(2027, 0, 1)), // long past
      },
    ]);
    expect(r.rows.every((x) => x.severity === 'OK' && x.satisfied)).toBe(true);
    expect(r.totals.open).toBe(0);
  });

  it('flags OVERDUE before grace ends and PENALTY_ACCRUING after', () => {
    const wageMonth = new Date(Date.UTC(2026, 0, 1)); // Jan 2026
    // Wage filing statutory deadline 15 Feb 2026 → 15 Feb 2026 is a Sunday (no shift in this year).
    // Settlement: 28 Feb 2026 (Saturday) shifts to Sun 1 Mar 2026.
    const overdueDate = new Date(Date.UTC(2026, 1, 20)); // 20 Feb — past wage deadline
    const penaltyDate = new Date(Date.UTC(2026, 3, 5)); // 5 Apr — past settlement+grace
    const r1 = evaluateGosiObligations([{ wageMonth, asOf: overdueDate }]);
    const wage1 = r1.rows.find((x) => x.kind === 'WAGE_FILING')!;
    expect(['OVERDUE', 'PENALTY_ACCRUING']).toContain(wage1.severity);
    const r2 = evaluateGosiObligations([{ wageMonth, asOf: penaltyDate }]);
    const wage2 = r2.rows.find((x) => x.kind === 'WAGE_FILING')!;
    expect(wage2.severity).toBe('PENALTY_ACCRUING');
  });

  it('marks DUE_SOON within 5 days of the effective deadline', () => {
    const wageMonth = new Date(Date.UTC(2026, 4, 1));
    // Wage filing effective deadline 15 Jun 2026 (Mon) → asOf 12 Jun (3 days away).
    const r = evaluateGosiObligations([{ wageMonth, asOf: new Date(Date.UTC(2026, 5, 12)) }]);
    const wage = r.rows.find((x) => x.kind === 'WAGE_FILING')!;
    expect(wage.severity).toBe('DUE_SOON');
  });

  it('produces bilingual reason strings', () => {
    const r = evaluateGosiObligations([may2026]);
    for (const row of r.rows) {
      expect(row.reason.length).toBeGreaterThan(0);
      expect(row.reasonAr.length).toBeGreaterThan(0);
      expect(row.reasonAr).toMatch(/[؀-ۿ]/); // Arabic block
    }
  });

  it('counts totals correctly across multiple months', () => {
    const months = [
      { wageMonth: new Date(Date.UTC(2026, 0, 1)) },
      { wageMonth: new Date(Date.UTC(2026, 1, 1)), wageFiled: true, contributionSettled: true },
      { wageMonth: new Date(Date.UTC(2026, 2, 1)) },
    ];
    const r = evaluateGosiObligations(
      months.map((m) => ({ ...m, asOf: new Date(Date.UTC(2026, 5, 1)) }))
    );
    expect(r.rows).toHaveLength(6);
    // Month 2026-02 satisfied → 2 OK rows. Other 4 are open.
    expect(r.totals.open).toBe(4);
  });
});
