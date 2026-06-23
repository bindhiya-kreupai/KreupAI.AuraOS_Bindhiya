import { describe, it, expect } from 'vitest';
import {
  buildSuccessionHeatmap,
  evaluateGovernanceMatrix,
  reduceRequisitionTrail,
  runScenario,
  type ScenarioAssumptions,
} from '../workforce-planning.service';

const SUBMITTED_AT = new Date('2026-06-10T00:00:00Z');
const APPROVED_AT = new Date('2026-06-12T00:00:00Z');
const REJECTED_AT = new Date('2026-06-13T00:00:00Z');

describe('EPIC-03-S04 requisition maker-checker — reduceRequisitionTrail', () => {
  it('returns null on empty trail', () => {
    expect(reduceRequisitionTrail([])).toBeNull();
  });

  it('reduces SUBMITTED state from the proposal row', () => {
    const r = reduceRequisitionTrail([
      {
        timestamp: SUBMITTED_AT,
        metadata: {
          requisitionId: 'r1',
          status: 'SUBMITTED',
          proposedBy: 'u-maker',
          proposedAt: SUBMITTED_AT.toISOString(),
          justification: 'Add headcount for 2026 plan',
        },
      },
    ])!;
    expect(r.status).toBe('SUBMITTED');
    expect(r.proposedBy).toBe('u-maker');
    expect(r.justification).toBe('Add headcount for 2026 plan');
  });

  it('reduces APPROVED trail (head is approve, tail is propose)', () => {
    const r = reduceRequisitionTrail([
      {
        timestamp: APPROVED_AT,
        metadata: {
          requisitionId: 'r1',
          status: 'APPROVED',
          approvedBy: 'u-checker',
          approvedAt: APPROVED_AT.toISOString(),
        },
      },
      {
        timestamp: SUBMITTED_AT,
        metadata: {
          requisitionId: 'r1',
          status: 'SUBMITTED',
          proposedBy: 'u-maker',
          proposedAt: SUBMITTED_AT.toISOString(),
          justification: 'Need',
        },
      },
    ])!;
    expect(r.status).toBe('APPROVED');
    expect(r.approvedBy).toBe('u-checker');
    expect(r.proposedBy).toBe('u-maker');
  });

  it('reduces REJECTED trail with reason', () => {
    const r = reduceRequisitionTrail([
      {
        timestamp: REJECTED_AT,
        metadata: {
          requisitionId: 'r1',
          status: 'REJECTED',
          rejectedBy: 'u-checker',
          rejectedAt: REJECTED_AT.toISOString(),
          reason: 'Out of budget',
        },
      },
      {
        timestamp: SUBMITTED_AT,
        metadata: {
          requisitionId: 'r1',
          status: 'SUBMITTED',
          proposedBy: 'u-maker',
          proposedAt: SUBMITTED_AT.toISOString(),
          justification: 'Need',
        },
      },
    ])!;
    expect(r.status).toBe('REJECTED');
    expect(r.rejectionReason).toBe('Out of budget');
  });
});

describe('EPIC-03-S05 scenario modelling — runScenario', () => {
  const base: ScenarioAssumptions = {
    startingHeadcount: 100,
    monthlyCostPerRole: { ENG: 10000, OPS: 6000 },
    annualGrowthPctPerRole: { ENG: 0.2, OPS: 0.1 },
    annualAttritionPctPerRole: { ENG: 0.1, OPS: 0.05 },
    horizonMonths: 12,
  };

  it('produces one step per month over the horizon', () => {
    const r = runScenario(base);
    expect(r.steps).toHaveLength(12);
    expect(r.horizonMonths).toBe(12);
  });

  it('grows total headcount when growth > attrition', () => {
    const r = runScenario(base);
    const last = r.steps[r.steps.length - 1];
    expect(last.totalHeadcount).toBeGreaterThan(base.startingHeadcount);
    expect(r.netHires).toBeGreaterThan(0);
  });

  it('shrinks headcount when attrition > growth', () => {
    const shrinking: ScenarioAssumptions = {
      ...base,
      annualGrowthPctPerRole: { ENG: 0.02 },
      annualAttritionPctPerRole: { ENG: 0.3 },
      monthlyCostPerRole: { ENG: 10000 },
      startingHeadcount: 50,
    };
    const r = runScenario(shrinking);
    expect(r.steps[r.steps.length - 1].totalHeadcount).toBeLessThan(50);
    expect(r.netHires).toBeLessThan(0);
  });

  it('reports cumulative cost monotonically increasing', () => {
    const r = runScenario(base);
    for (let i = 1; i < r.steps.length; i++) {
      expect(r.steps[i].cumulativeCost).toBeGreaterThanOrEqual(r.steps[i - 1].cumulativeCost);
    }
    expect(r.totalCost).toBe(r.steps[r.steps.length - 1].cumulativeCost);
  });

  it('floors horizon to at least 1 month', () => {
    expect(runScenario({ ...base, horizonMonths: 0 }).steps).toHaveLength(1);
  });
});

describe('EPIC-03-S06 succession heat-map — buildSuccessionHeatmap', () => {
  it('reports CRITICAL when no successors exist', () => {
    const r = buildSuccessionHeatmap([{ role: 'CFO', successors: [] }]);
    expect(r.cells[0].vacancyRisk).toBe('CRITICAL');
    expect(r.totals.rolesAtRisk).toBe(1);
    expect(r.totals.coveragePct).toBe(0);
  });

  it('reports MEDIUM when only 1 READY_NOW successor', () => {
    const r = buildSuccessionHeatmap([
      { role: 'COO', successors: [{ employeeId: 'e1', readiness: 'READY_NOW' }] },
    ]);
    expect(r.cells[0].vacancyRisk).toBe('MEDIUM');
  });

  it('reports LOW with 2+ READY_NOW', () => {
    const r = buildSuccessionHeatmap([
      {
        role: 'CEO',
        successors: [
          { employeeId: 'e1', readiness: 'READY_NOW' },
          { employeeId: 'e2', readiness: 'READY_NOW' },
        ],
      },
    ]);
    expect(r.cells[0].vacancyRisk).toBe('LOW');
  });

  it('reports HIGH when only future-ready or emergency cover exists', () => {
    const r = buildSuccessionHeatmap([
      {
        role: 'CHRO',
        successors: [
          { employeeId: 'e1', readiness: 'READY_1_YEAR' },
          { employeeId: 'e2', readiness: 'EMERGENCY_COVER' },
        ],
      },
    ]);
    expect(r.cells[0].vacancyRisk).toBe('HIGH');
  });

  it('counts bench depth correctly across readiness bands', () => {
    const r = buildSuccessionHeatmap([
      {
        role: 'X',
        successors: [
          { employeeId: 'e1', readiness: 'READY_NOW' },
          { employeeId: 'e2', readiness: 'READY_1_YEAR' },
          { employeeId: 'e3', readiness: 'READY_2_YEARS' },
          { employeeId: 'e4', readiness: 'EMERGENCY_COVER' },
          { employeeId: 'e5', readiness: 'NO_SUCCESSOR' },
        ],
      },
    ]);
    // emergency and no_successor not counted in benchDepth
    expect(r.cells[0].benchDepth).toBe(3);
  });

  it('computes overall coverage percentage', () => {
    const r = buildSuccessionHeatmap([
      { role: 'A', successors: [{ employeeId: 'e1', readiness: 'READY_NOW' }] },
      { role: 'B', successors: [] },
      { role: 'C', successors: [{ employeeId: 'e2', readiness: 'READY_1_YEAR' }] },
    ]);
    expect(r.totals.coveragePct).toBe(67); // 2 of 3
  });
});

describe('EPIC-03-S07 governance matrix — evaluateGovernanceMatrix', () => {
  const NOW = new Date('2026-06-17T00:00:00Z');

  it('flags every control overdue when no evidence exists', () => {
    const r = evaluateGovernanceMatrix(
      [
        {
          code: 'WP_REVIEW',
          label: 'Quarterly workforce review',
          domain: 'WORKFORCE_PLAN',
          requiredRoles: ['CHRO'],
          cadenceDays: 90,
          evidenceType: 'SIGNED_MINUTE',
        },
      ],
      [],
      NOW
    );
    expect(r.statuses[0].overdue).toBe(true);
    expect(r.totals.overdue).toBe(1);
    expect(r.totals.coveragePct).toBe(0);
  });

  it('reports overdue when last evidence is older than cadence', () => {
    const r = evaluateGovernanceMatrix(
      [
        {
          code: 'WP_REVIEW',
          label: 'X',
          domain: 'WP',
          requiredRoles: ['CHRO'],
          cadenceDays: 90,
          evidenceType: 'S',
        },
      ],
      [
        {
          controlCode: 'WP_REVIEW',
          evidencedAt: new Date('2025-12-01'),
          evidencedBy: 'u1',
        },
      ],
      NOW
    );
    expect(r.statuses[0].overdue).toBe(true);
    expect(r.statuses[0].daysSinceLastEvidence).toBeGreaterThan(90);
  });

  it('reports on-time when last evidence is within cadence', () => {
    const r = evaluateGovernanceMatrix(
      [
        {
          code: 'WP_REVIEW',
          label: 'X',
          domain: 'WP',
          requiredRoles: ['CHRO'],
          cadenceDays: 90,
          evidenceType: 'S',
        },
      ],
      [
        {
          controlCode: 'WP_REVIEW',
          evidencedAt: new Date('2026-04-01'),
          evidencedBy: 'u1',
        },
      ],
      NOW
    );
    expect(r.statuses[0].overdue).toBe(false);
    expect(r.totals.coveragePct).toBe(100);
  });

  it('uses the latest evidence when multiple exist for the same control', () => {
    const r = evaluateGovernanceMatrix(
      [
        {
          code: 'WP_REVIEW',
          label: 'X',
          domain: 'WP',
          requiredRoles: ['CHRO'],
          cadenceDays: 30,
          evidenceType: 'S',
        },
      ],
      [
        {
          controlCode: 'WP_REVIEW',
          evidencedAt: new Date('2026-01-01'),
          evidencedBy: 'u1',
        },
        {
          controlCode: 'WP_REVIEW',
          evidencedAt: new Date('2026-06-10'),
          evidencedBy: 'u1',
        },
      ],
      NOW
    );
    expect(r.statuses[0].overdue).toBe(false);
    expect(r.statuses[0].daysSinceLastEvidence).toBeLessThanOrEqual(7);
  });
});
