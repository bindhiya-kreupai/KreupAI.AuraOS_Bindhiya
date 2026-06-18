import { describe, it, expect } from 'vitest';
import {
  evaluateCarbonPerEmployee,
  evaluateDisclosureChecklist,
  evaluateDiversityMetrics,
  type DiversityEmployee,
} from '../esg-compliance.service';

describe('EPIC-30 ESG — evaluateDiversityMetrics', () => {
  const mkEmp = (over: Partial<DiversityEmployee> = {}): DiversityEmployee => ({
    employeeId: 'e',
    gender: 'M',
    nationality: 'SAU',
    ageBracket: '30-50',
    jobLevel: 'PROFESSIONAL',
    ...over,
  });

  it('computes overall percentages', () => {
    const r = evaluateDiversityMetrics([
      mkEmp({ employeeId: 'e1', gender: 'M', nationality: 'SAU', jobLevel: 'EXEC' }),
      mkEmp({ employeeId: 'e2', gender: 'F', nationality: 'SAU', jobLevel: 'MANAGER' }),
      mkEmp({ employeeId: 'e3', gender: 'F', nationality: 'IND', jobLevel: 'PROFESSIONAL' }),
      mkEmp({ employeeId: 'e4', gender: 'M', nationality: 'IND', isPwd: true }),
    ]);
    expect(r.totals.headcount).toBe(4);
    expect(r.totals.femalePct).toBe(50);
    expect(r.totals.nationalsPct).toBe(50);
    expect(r.totals.pwdPct).toBe(25);
    expect(r.totals.femaleInLeadershipPct).toBe(50); // 1F of 2 leaders
  });

  it('flags female% below target', () => {
    const r = evaluateDiversityMetrics(
      [mkEmp({ gender: 'M' }), mkEmp({ gender: 'M' }), mkEmp({ gender: 'F' })],
      { minFemalePct: 0.5 }
    );
    expect(r.flags.some((f) => f.code === 'FEMALE_PCT_BELOW_TARGET')).toBe(true);
  });

  it('flags nationals% below target with custom country', () => {
    const r = evaluateDiversityMetrics(
      [mkEmp({ nationality: 'IND' }), mkEmp({ nationality: 'IND' }), mkEmp({ nationality: 'ARE' })],
      { minNationalsPct: 0.5, nationalCountry: 'ARE' }
    );
    expect(r.flags.some((f) => f.code === 'NATIONALS_PCT_BELOW_TARGET')).toBe(true);
  });

  it('does not flag when targets are met', () => {
    const r = evaluateDiversityMetrics(
      [mkEmp({ gender: 'F' }), mkEmp({ gender: 'F' }), mkEmp({ gender: 'M' })],
      { minFemalePct: 0.6 }
    );
    expect(r.flags).toHaveLength(0);
  });

  it('handles empty employee list', () => {
    const r = evaluateDiversityMetrics([]);
    expect(r.totals.headcount).toBe(0);
    expect(r.totals.femalePct).toBe(0);
  });

  it('handles zero leadership headcount cleanly', () => {
    const r = evaluateDiversityMetrics([mkEmp({ jobLevel: 'OPERATIONAL', gender: 'F' })]);
    expect(r.totals.femaleInLeadershipPct).toBe(0);
  });
});

describe('EPIC-30 ESG — evaluateCarbonPerEmployee', () => {
  it('computes per-FTE intensity and scope %', () => {
    const r = evaluateCarbonPerEmployee({
      headcount: 100,
      scope1: 50,
      scope2: 30,
      scope3: 20,
    });
    expect(r.totalEmissionsTco2e).toBe(100);
    expect(r.perEmployeeTco2e).toBe(1);
    expect(r.scope1Pct).toBe(50);
    expect(r.scope2Pct).toBe(30);
    expect(r.scope3Pct).toBe(20);
    expect(r.intensityBand).toBe('NO_BENCHMARK');
  });

  it('classifies LOW when below 80% of benchmark', () => {
    const r = evaluateCarbonPerEmployee({
      headcount: 100,
      scope1: 50,
      scope2: 10,
      benchmarkPerFte: 1.0,
    });
    expect(r.perEmployeeTco2e).toBe(0.6);
    expect(r.intensityBand).toBe('LOW');
    expect(r.vsBenchmarkPct).toBeLessThan(0);
  });

  it('classifies HIGH when above 120% of benchmark', () => {
    const r = evaluateCarbonPerEmployee({
      headcount: 100,
      scope1: 100,
      scope2: 50,
      benchmarkPerFte: 1.0,
    });
    expect(r.intensityBand).toBe('HIGH');
    expect(r.vsBenchmarkPct).toBeGreaterThan(0);
  });

  it('floors headcount to 1 to avoid divide-by-zero', () => {
    const r = evaluateCarbonPerEmployee({ headcount: 0, scope1: 10, scope2: 0 });
    expect(r.perEmployeeTco2e).toBe(10);
  });
});

describe('EPIC-30 ESG — evaluateDisclosureChecklist', () => {
  const NOW = new Date('2026-06-17T00:00:00Z');

  it('marks every mandatory disclosure as MISSING when nothing filed', () => {
    const r = evaluateDisclosureChecklist(
      [{ code: 'GHG_INVENTORY', label: 'GHG Inventory', mandatory: true, filed: false }],
      NOW
    );
    expect(r.results[0].status).toBe('MISSING');
    expect(r.totals.missing).toBe(1);
    expect(r.totals.coveragePct).toBe(0);
  });

  it('marks STALE if last filing exceeds cadence', () => {
    const r = evaluateDisclosureChecklist(
      [
        {
          code: 'BOARD_COMP',
          label: 'Board comp disclosure',
          mandatory: true,
          filed: true,
          filedAt: new Date('2025-01-01'),
          cadenceDays: 365,
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('STALE');
    expect(r.totals.stale).toBe(1);
  });

  it('marks OK when filed within cadence', () => {
    const r = evaluateDisclosureChecklist(
      [
        {
          code: 'AC_REPORT',
          label: 'Audit committee report',
          mandatory: true,
          filed: true,
          filedAt: new Date('2026-03-01'),
          cadenceDays: 365,
        },
      ],
      NOW
    );
    expect(r.results[0].status).toBe('OK');
    expect(r.totals.coveragePct).toBe(100);
  });

  it('skips non-mandatory disclosures from coverage denominator', () => {
    const r = evaluateDisclosureChecklist(
      [
        { code: 'X', label: 'Optional', mandatory: false, filed: false },
        {
          code: 'Y',
          label: 'Required',
          mandatory: true,
          filed: true,
          filedAt: new Date('2026-06-01'),
          cadenceDays: 90,
        },
      ],
      NOW
    );
    expect(r.totals.mandatory).toBe(1);
    expect(r.totals.coveragePct).toBe(100);
  });
});
