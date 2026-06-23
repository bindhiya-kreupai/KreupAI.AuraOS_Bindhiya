import { describe, it, expect } from 'vitest';
import {
  evaluatePpeCoverage,
  evaluateToolboxCoverage,
  evaluateDrillCadence,
  type PpeIssuance,
  type DrillRecord,
} from '../safety-management.service';

const ASOF = new Date('2026-06-17T00:00:00Z');

describe('evaluatePpeCoverage — EPIC-24 PPE', () => {
  it('reports 100% coverage when every requirement is met', () => {
    const issuance: PpeIssuance = {
      employeeId: 'e1',
      ppeType: 'HARDHAT',
      issuedAt: new Date('2026-04-01'),
      expiresAt: new Date('2027-04-01'),
      hasSize: true,
    };
    const rep = evaluatePpeCoverage({
      employees: [{ employeeId: 'e1', role: 'SITE_WORKER' }],
      issuances: [issuance],
      requirements: [{ role: 'SITE_WORKER', ppeType: 'HARDHAT' }],
      asOf: ASOF,
    });
    expect(rep.failures).toHaveLength(0);
    expect(rep.totals.coveragePct).toBe(100);
  });

  it('flags MISSING_PPE', () => {
    const rep = evaluatePpeCoverage({
      employees: [{ employeeId: 'e1', role: 'SITE_WORKER' }],
      issuances: [],
      requirements: [{ role: 'SITE_WORKER', ppeType: 'HARDHAT' }],
      asOf: ASOF,
    });
    expect(rep.failures[0].code).toBe('MISSING_PPE');
  });

  it('flags PPE_EXPIRED', () => {
    const rep = evaluatePpeCoverage({
      employees: [{ employeeId: 'e1', role: 'SITE_WORKER' }],
      issuances: [
        {
          employeeId: 'e1',
          ppeType: 'HARDHAT',
          issuedAt: new Date('2025-01-01'),
          expiresAt: new Date('2026-01-01'),
          hasSize: true,
        },
      ],
      requirements: [{ role: 'SITE_WORKER', ppeType: 'HARDHAT' }],
      asOf: ASOF,
    });
    expect(rep.failures[0].code).toBe('PPE_EXPIRED');
  });

  it('flags SIZE_NOT_RECORDED', () => {
    const rep = evaluatePpeCoverage({
      employees: [{ employeeId: 'e1', role: 'SITE_WORKER' }],
      issuances: [
        {
          employeeId: 'e1',
          ppeType: 'HARDHAT',
          issuedAt: new Date('2026-04-01'),
          expiresAt: new Date('2027-04-01'),
          hasSize: false,
        },
      ],
      requirements: [{ role: 'SITE_WORKER', ppeType: 'HARDHAT' }],
      asOf: ASOF,
    });
    expect(rep.failures[0].code).toBe('SIZE_NOT_RECORDED');
  });

  it('takes the most recent issuance when multiple exist', () => {
    const rep = evaluatePpeCoverage({
      employees: [{ employeeId: 'e1', role: 'SITE_WORKER' }],
      issuances: [
        {
          employeeId: 'e1',
          ppeType: 'HARDHAT',
          issuedAt: new Date('2025-01-01'),
          expiresAt: new Date('2026-01-01'), // expired
          hasSize: true,
        },
        {
          employeeId: 'e1',
          ppeType: 'HARDHAT',
          issuedAt: new Date('2026-04-01'),
          expiresAt: new Date('2027-04-01'), // current
          hasSize: true,
        },
      ],
      requirements: [{ role: 'SITE_WORKER', ppeType: 'HARDHAT' }],
      asOf: ASOF,
    });
    expect(rep.failures).toHaveLength(0);
  });
});

describe('evaluateToolboxCoverage — EPIC-24 toolbox talks', () => {
  it('reports 100% when everyone attended within cadence', () => {
    const rep = evaluateToolboxCoverage({
      employees: [{ employeeId: 'e1' }, { employeeId: 'e2' }],
      attendances: [
        { employeeId: 'e1', attendedAt: new Date('2026-06-15') },
        { employeeId: 'e2', attendedAt: new Date('2026-06-16') },
      ],
      asOf: ASOF,
    });
    expect(rep.totals.overdue).toBe(0);
    expect(rep.totals.coveragePct).toBe(100);
  });

  it('flags employees who never attended', () => {
    const rep = evaluateToolboxCoverage({
      employees: [{ employeeId: 'e1' }, { employeeId: 'e2' }],
      attendances: [{ employeeId: 'e1', attendedAt: new Date('2026-06-15') }],
      asOf: ASOF,
    });
    expect(rep.totals.overdue).toBe(1);
    expect(rep.overdueEmployees[0].employeeId).toBe('e2');
  });

  it('flags overdue (past cadence)', () => {
    const rep = evaluateToolboxCoverage({
      employees: [{ employeeId: 'e1' }],
      attendances: [{ employeeId: 'e1', attendedAt: new Date('2026-05-01') }],
      asOf: ASOF,
    });
    expect(rep.totals.overdue).toBe(1);
    expect(rep.overdueEmployees[0].daysSinceLastTalk).toBeGreaterThan(7);
  });
});

describe('evaluateDrillCadence — EPIC-24 emergency drills', () => {
  it('reports 100% when every drill type is within cadence', () => {
    const within: DrillRecord[] = [
      {
        drillType: 'FIRE',
        conductedAt: new Date('2026-05-01'),
        passed: true,
        attendancePct: 95,
      },
      {
        drillType: 'EARTHQUAKE',
        conductedAt: new Date('2026-01-01'),
        passed: true,
        attendancePct: 80,
      },
      {
        drillType: 'CHEMICAL',
        conductedAt: new Date('2026-05-15'),
        passed: true,
        attendancePct: 90,
      },
      {
        drillType: 'EVACUATION_GENERAL',
        conductedAt: new Date('2026-02-01'),
        passed: true,
        attendancePct: 85,
      },
    ];
    const rep = evaluateDrillCadence({ drills: within, asOf: ASOF });
    expect(rep.totals.overdue).toBe(0);
    expect(rep.totals.coveragePct).toBe(100);
  });

  it('flags overdue drills', () => {
    const rep = evaluateDrillCadence({
      drills: [
        {
          drillType: 'FIRE',
          conductedAt: new Date('2026-01-01'), // > 90 days
          passed: true,
          attendancePct: 95,
        },
      ],
      asOf: ASOF,
    });
    expect(rep.totals.overdue).toBeGreaterThan(0);
    expect(rep.overdueDrills.find((d) => d.drillType === 'FIRE')).toBeTruthy();
  });

  it('treats a FAILED drill as if not conducted', () => {
    const rep = evaluateDrillCadence({
      drills: [
        {
          drillType: 'FIRE',
          conductedAt: new Date('2026-06-01'),
          passed: false,
          attendancePct: 95,
        },
      ],
      asOf: ASOF,
    });
    expect(rep.overdueDrills.find((d) => d.drillType === 'FIRE')).toBeTruthy();
  });
});
