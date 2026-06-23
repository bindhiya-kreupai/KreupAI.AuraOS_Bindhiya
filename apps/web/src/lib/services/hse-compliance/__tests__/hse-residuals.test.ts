import { describe, it, expect } from 'vitest';
import {
  evaluateCctvCadence,
  evaluateContractorHse,
  evaluateFirstAidCadence,
  evaluateHrIntegration,
  evaluateHseAccountability,
  evaluateHseChecklist,
  evaluateHseGovernanceMatrix,
  evaluateWelfareFacilityCadence,
} from '../hse-residuals.service';

const NOW = new Date('2026-06-17T00:00:00Z');

describe('EPIC-24 HSE governance matrix', () => {
  it('flags all overdue when no evidence', () => {
    const r = evaluateHseGovernanceMatrix(
      [
        {
          code: 'HSE_REVIEW',
          label: 'Monthly HSE review',
          domain: 'GOVERNANCE',
          cadenceDays: 30,
          evidenceType: 'MINUTE',
          requiredRoles: ['HSE_HEAD'],
        },
      ],
      [],
      NOW
    );
    expect(r.totals.overdue).toBe(1);
    expect(r.totals.coveragePct).toBe(0);
  });

  it('reports on-time when evidence within cadence', () => {
    const r = evaluateHseGovernanceMatrix(
      [
        {
          code: 'X',
          label: 'X',
          domain: 'GOV',
          cadenceDays: 30,
          evidenceType: 'M',
          requiredRoles: ['HSE_HEAD'],
        },
      ],
      [{ controlCode: 'X', evidencedAt: new Date('2026-06-10'), evidencedBy: 'u1' }],
      NOW
    );
    expect(r.statuses[0].overdue).toBe(false);
    expect(r.totals.coveragePct).toBe(100);
  });
});

describe('EPIC-24 HSE accountability', () => {
  it('flags INSUFFICIENT_HEADCOUNT', () => {
    const r = evaluateHseAccountability({
      totalWorkers: 200,
      requiredRatios: { HSE_OFFICER: 50 }, // need 4
      assignments: [{ role: 'HSE_OFFICER', employeeId: 'e1', certified: true, mandated: true }],
    });
    expect(r.gaps.some((g) => g.code === 'INSUFFICIENT_HEADCOUNT')).toBe(true);
  });

  it('flags UNCERTIFIED', () => {
    const r = evaluateHseAccountability({
      totalWorkers: 50,
      requiredRatios: { HSE_OFFICER: 50 }, // need 1
      assignments: [{ role: 'HSE_OFFICER', employeeId: 'e1', certified: false, mandated: true }],
    });
    expect(r.gaps.some((g) => g.code === 'UNCERTIFIED')).toBe(true);
  });

  it('flags NO_MANDATE', () => {
    const r = evaluateHseAccountability({
      totalWorkers: 50,
      requiredRatios: { HSE_OFFICER: 50 },
      assignments: [{ role: 'HSE_OFFICER', employeeId: 'e1', certified: true, mandated: false }],
    });
    expect(r.gaps.some((g) => g.code === 'NO_MANDATE')).toBe(true);
  });

  it('passes when fully covered', () => {
    const r = evaluateHseAccountability({
      totalWorkers: 50,
      requiredRatios: { HSE_OFFICER: 50 },
      assignments: [{ role: 'HSE_OFFICER', employeeId: 'e1', certified: true, mandated: true }],
    });
    expect(r.gaps.length).toBe(0);
    expect(r.totals.coveragePct).toBe(100);
  });
});

describe('EPIC-24 first-aid kit cadence', () => {
  it('flags NEVER_INSPECTED for zones with no record', () => {
    const r = evaluateFirstAidCadence({
      zones: ['LINE_A', 'LINE_B'],
      inspections: [],
      asOf: NOW,
    });
    expect(r.failures.filter((f) => f.code === 'NEVER_INSPECTED').length).toBe(2);
  });

  it('flags OVERDUE when last inspection older than cadence', () => {
    const r = evaluateFirstAidCadence({
      zones: ['LINE_A'],
      inspections: [
        {
          zone: 'LINE_A',
          inspectedAt: new Date('2026-04-01'),
          consumablesValid: true,
          sealed: true,
        },
      ],
      asOf: NOW,
    });
    expect(r.failures[0].code).toBe('OVERDUE');
  });

  it('flags CONSUMABLES_EXPIRED and NOT_SEALED on the latest inspection', () => {
    const r = evaluateFirstAidCadence({
      zones: ['LINE_A'],
      inspections: [
        {
          zone: 'LINE_A',
          inspectedAt: new Date('2026-06-15'),
          consumablesValid: false,
          sealed: false,
        },
      ],
      asOf: NOW,
    });
    expect(r.failures.some((f) => f.code === 'CONSUMABLES_EXPIRED')).toBe(true);
    expect(r.failures.some((f) => f.code === 'NOT_SEALED')).toBe(true);
  });
});

describe('EPIC-24 contractor HSE', () => {
  const baseline = {
    minPpeIssuancePct: 95,
    minTrainingCoveragePct: 90,
    maxIncidentRatePer100k: 2,
  };

  it('flags PPE_BELOW_BASELINE', () => {
    const r = evaluateContractorHse({
      baseline,
      contractors: [
        {
          contractorId: 'C1',
          workers: 100,
          ppeIssuancePct: 80,
          trainingCoveragePct: 95,
          incidentRatePer100k: 1,
        },
      ],
    });
    expect(r.findings.some((f) => f.code === 'PPE_BELOW_BASELINE')).toBe(true);
  });

  it('flags INCIDENT_RATE_HIGH as CRITICAL', () => {
    const r = evaluateContractorHse({
      baseline,
      contractors: [
        {
          contractorId: 'C1',
          workers: 100,
          ppeIssuancePct: 100,
          trainingCoveragePct: 100,
          incidentRatePer100k: 5,
        },
      ],
    });
    const f = r.findings.find((x) => x.code === 'INCIDENT_RATE_HIGH')!;
    expect(f.severity).toBe('CRITICAL');
  });

  it('reports 100% compliance when all contractors meet baseline', () => {
    const r = evaluateContractorHse({
      baseline,
      contractors: [
        {
          contractorId: 'C1',
          workers: 100,
          ppeIssuancePct: 100,
          trainingCoveragePct: 95,
          incidentRatePer100k: 1,
        },
      ],
    });
    expect(r.totals.compliancePct).toBe(100);
  });
});

describe('EPIC-24 welfare facility cadence', () => {
  it('counts a full cross-product of zones × facilities', () => {
    const r = evaluateWelfareFacilityCadence({
      zones: ['Z1', 'Z2'],
      facilities: ['TOILETS', 'DRINKING_WATER'],
      checks: [],
      asOf: NOW,
    });
    expect(r.totals.cellsInScope).toBe(4);
    expect(r.failures.filter((f) => f.code === 'NEVER_CHECKED').length).toBe(4);
  });

  it('flags NOT_FUNCTIONAL as CRITICAL', () => {
    const r = evaluateWelfareFacilityCadence({
      zones: ['Z1'],
      facilities: ['DRINKING_WATER'],
      checks: [
        {
          zone: 'Z1',
          facility: 'DRINKING_WATER',
          checkedAt: new Date('2026-06-15'),
          functional: false,
        },
      ],
      asOf: NOW,
    });
    const f = r.failures.find((x) => x.code === 'NOT_FUNCTIONAL')!;
    expect(f.severity).toBe('CRITICAL');
  });
});

describe('EPIC-24 CCTV cadence', () => {
  it('flags NEVER_CHECKED for unknown cameras', () => {
    const r = evaluateCctvCadence({ cameras: ['CAM_1'], checks: [], asOf: NOW });
    expect(r.failures[0].code).toBe('NEVER_CHECKED');
  });

  it('flags RETENTION_TOO_SHORT', () => {
    const r = evaluateCctvCadence({
      cameras: ['CAM_1'],
      checks: [
        {
          cameraId: 'CAM_1',
          checkedAt: new Date('2026-06-10'),
          functional: true,
          retentionDays: 30,
        },
      ],
      asOf: NOW,
    });
    expect(r.failures.some((f) => f.code === 'RETENTION_TOO_SHORT')).toBe(true);
  });

  it('passes when cameras are recent, functional, and retention sufficient', () => {
    const r = evaluateCctvCadence({
      cameras: ['CAM_1'],
      checks: [
        {
          cameraId: 'CAM_1',
          checkedAt: new Date('2026-06-10'),
          functional: true,
          retentionDays: 120,
        },
      ],
      asOf: NOW,
    });
    expect(r.failures.length).toBe(0);
  });
});

describe('EPIC-24 HR integration', () => {
  it('flags NO_LEAVE when incident has days lost but no leave', () => {
    const r = evaluateHrIntegration([
      {
        incidentId: 'I1',
        employeeId: 'E1',
        incidentAt: new Date('2026-06-10'),
        daysLostExpected: 5,
        leaveCreated: false,
        leaveDaysCovered: 0,
        payAdjusted: true,
        workmanCompFiled: true,
      },
    ]);
    expect(r.failures.some((f) => f.code === 'NO_LEAVE')).toBe(true);
  });

  it('flags LEAVE_UNDER_COVERED', () => {
    const r = evaluateHrIntegration([
      {
        incidentId: 'I1',
        employeeId: 'E1',
        incidentAt: new Date('2026-06-10'),
        daysLostExpected: 5,
        leaveCreated: true,
        leaveDaysCovered: 2,
        payAdjusted: true,
        workmanCompFiled: true,
      },
    ]);
    expect(r.failures.some((f) => f.code === 'LEAVE_UNDER_COVERED')).toBe(true);
  });

  it('flags NO_WORKMAN_COMP when ≥3 days lost', () => {
    const r = evaluateHrIntegration([
      {
        incidentId: 'I1',
        employeeId: 'E1',
        incidentAt: new Date('2026-06-10'),
        daysLostExpected: 5,
        leaveCreated: true,
        leaveDaysCovered: 5,
        payAdjusted: true,
        workmanCompFiled: false,
      },
    ]);
    expect(r.failures.some((f) => f.code === 'NO_WORKMAN_COMP')).toBe(true);
  });

  it('does not flag NO_WORKMAN_COMP for <3 day incidents', () => {
    const r = evaluateHrIntegration([
      {
        incidentId: 'I1',
        employeeId: 'E1',
        incidentAt: new Date('2026-06-10'),
        daysLostExpected: 1,
        leaveCreated: true,
        leaveDaysCovered: 1,
        payAdjusted: true,
        workmanCompFiled: false,
      },
    ]);
    expect(r.failures.some((f) => f.code === 'NO_WORKMAN_COMP')).toBe(false);
  });

  it('reports 100% integration when no failures', () => {
    const r = evaluateHrIntegration([
      {
        incidentId: 'I1',
        employeeId: 'E1',
        incidentAt: new Date('2026-06-10'),
        daysLostExpected: 0,
        leaveCreated: false,
        leaveDaysCovered: 0,
        payAdjusted: false,
        workmanCompFiled: false,
      },
    ]);
    expect(r.totals.integrationPct).toBe(100);
  });
});

describe('EPIC-24 HSE checklist', () => {
  const items = [
    { code: 'A', question: 'PPE OK?', questionAr: '؟', weight: 5, critical: true },
    { code: 'B', question: 'Exit OK?', questionAr: '؟', weight: 5, critical: false },
  ];

  it('returns 100% when all pass and band EXCELLENT', () => {
    const r = evaluateHseChecklist({
      items,
      responses: [
        { code: 'A', pass: true },
        { code: 'B', pass: true },
      ],
    });
    expect(r.scorePct).toBe(100);
    expect(r.band).toBe('EXCELLENT');
    expect(r.pass).toBe(true);
  });

  it('fails when CRITICAL item fails (even if score ≥ 70)', () => {
    const r = evaluateHseChecklist({
      items,
      responses: [
        { code: 'A', pass: false },
        { code: 'B', pass: true },
      ],
    });
    expect(r.pass).toBe(false);
    expect(r.failedItems[0].code).toBe('A');
  });

  it('returns band CRITICAL when very low score', () => {
    const r = evaluateHseChecklist({
      items,
      responses: [
        { code: 'A', pass: false },
        { code: 'B', pass: false },
      ],
    });
    expect(r.band).toBe('CRITICAL');
    expect(r.scorePct).toBe(0);
  });

  it('handles partial responses (unanswered items dont earn weight)', () => {
    const r = evaluateHseChecklist({
      items,
      responses: [{ code: 'A', pass: true }],
    });
    expect(r.totals.answered).toBe(1);
    expect(r.scorePct).toBe(50);
  });
});
