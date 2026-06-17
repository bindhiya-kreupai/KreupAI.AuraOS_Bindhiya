import { describe, it, expect } from 'vitest';
import { compareDecision, aggregateReport } from '../rule-simulation.service';

describe('compareDecision — EPIC-36 rule simulation', () => {
  it('marks differs=false when values are deeply equal', () => {
    const d = compareDecision('r1', 'PAYROLL', 'X', 15, 15);
    expect(d.differs).toBe(false);
    expect(d.numericDelta).toBe(0);
  });

  it('marks differs=true for differing numeric values', () => {
    const d = compareDecision('r1', 'PAYROLL', 'X', 15, 7);
    expect(d.differs).toBe(true);
    expect(d.numericDelta).toBe(-8);
  });

  it('handles non-numeric values without a delta', () => {
    const d = compareDecision('r1', 'PAYROLL', 'X', 'MONTHLY', 'WEEKLY');
    expect(d.differs).toBe(true);
    expect(d.numericDelta).toBeNull();
  });

  it('handles object equality via JSON canonicalisation', () => {
    const d = compareDecision('r1', 'PAYROLL', 'X', { a: 1, b: 2 }, { a: 1, b: 2 });
    expect(d.differs).toBe(false);
  });

  it('handles null vs value as a real diff', () => {
    const d = compareDecision('r1', 'PAYROLL', 'X', null, 15);
    expect(d.differs).toBe(true);
  });
});

describe('aggregateReport — EPIC-36', () => {
  const asOf = new Date('2026-06-17T00:00:00Z');

  it('totals sampled / differing / netNumericDelta', () => {
    const rpt = aggregateReport(
      'AE',
      asOf,
      [{ domain: 'PAYROLL', ruleKey: 'X', value: 7 }],
      [
        compareDecision('r1', 'PAYROLL', 'X', 15, 7), // delta -8
        compareDecision('r2', 'PAYROLL', 'X', 15, 7), // delta -8
        compareDecision('r3', 'PAYROLL', 'X', 15, 15), // unchanged
      ]
    );
    expect(rpt.totals.sampled).toBe(3);
    expect(rpt.totals.differing).toBe(2);
    expect(rpt.totals.netNumericDelta).toBe(-16);
  });

  it('records 0/0 totals when nothing was sampled', () => {
    const rpt = aggregateReport('AE', asOf, [], []);
    expect(rpt.totals).toEqual({ sampled: 0, differing: 0, netNumericDelta: 0 });
  });

  it('exposes the overrides + asOf back to the caller', () => {
    const rpt = aggregateReport('AE', asOf, [{ domain: 'PAYROLL', ruleKey: 'X', value: 7 }], []);
    expect(rpt.countryCode).toBe('AE');
    expect(rpt.asOf).toBe(asOf);
    expect(rpt.overrides).toEqual([{ domain: 'PAYROLL', ruleKey: 'X', value: 7 }]);
  });
});
