import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  salaryGradeBandService,
  delegationOfAuthorityService,
  DelegationOfAuthorityService,
  payrollCalendarControlService,
  payrollVarianceService,
  fatigueRuleService,
  FatigueRuleService,
  overtimeFraudService,
  eosSioFundingLinkService,
  returnToWorkPlanService,
  holidayCalendarChangeService,
  redundancyBatchService,
  separationRetentionPolicyService,
  documentPhysicalLocationService,
  auditFindingRiskLinkService,
  unifiedWageFileGeneratorService,
  canReadRecord,
  rollupByCountry,
  canViewExecutiveDomain,
  OT_FRAUD_SIGNALS,
  GRIEVANCE_MEDIATION_STATES,
  UNIFIED_WAGE_FILE_SCOPE,
} from '../structural-extensions';

const prismaMock = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  for (const table of [
    'salaryGradeBand',
    'delegationOfAuthority',
    'payrollCalendarControl',
    'payrollVarianceEntry',
    'fatigueRule',
    'overtimeFraudFlag',
    'eosSioFundingLink',
    'returnToWorkPlan',
    'holidayCalendarChangeRequest',
    'redundancyBatch',
    'separationRetentionPolicy',
    'documentPhysicalLocation',
    'auditFindingRiskLink',
  ]) {
    prismaMock[table] = {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: `${table}-1`, ...data })),
      update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: `${table}-1`, ...data })),
      upsert: vi
        .fn()
        .mockImplementation(async ({ create }: any) => ({ id: `${table}-1`, ...create })),
    };
  }
});

describe('J — SalaryGradeBandService', () => {
  it('rejects min > mid > max violations', async () => {
    await expect(
      salaryGradeBandService.upsert(
        {
          gradeCode: 'G1',
          label: 'Grade 1',
          minSalary: 5000,
          midSalary: 3000,
          maxSalary: 7000,
          effectiveFrom: new Date(),
        },
        auth
      )
    ).rejects.toThrow(/min ≤ mid ≤ max/);
  });
  it('rejects negative salary', async () => {
    await expect(
      salaryGradeBandService.upsert(
        {
          gradeCode: 'G1',
          label: 'G1',
          minSalary: -1,
          midSalary: 0,
          maxSalary: 0,
          effectiveFrom: new Date(),
        },
        auth
      )
    ).rejects.toThrow(/negative/);
  });
  it('accepts valid min ≤ mid ≤ max', async () => {
    const r = await salaryGradeBandService.upsert(
      {
        gradeCode: 'G1',
        label: 'G1',
        minSalary: 3000,
        midSalary: 5000,
        maxSalary: 7000,
        effectiveFrom: new Date(),
      },
      auth
    );
    expect(r.gradeCode).toBe('G1');
  });
});

describe('J — DelegationOfAuthorityService', () => {
  it('rejects level < 1', async () => {
    await expect(
      delegationOfAuthorityService.upsert(
        {
          domain: 'PAYROLL',
          actionCode: 'APPROVE_RUN',
          label: 'Approve',
          level: 0,
          minRole: 'PAYROLL_LEAD',
          effectiveFrom: new Date(),
        },
        auth
      )
    ).rejects.toThrow(/level/);
  });
  it('static resolveLevel picks lowest level matching threshold', () => {
    const rules = [
      { level: 1, thresholdAmount: 1000 },
      { level: 2, thresholdAmount: 5000 },
      { level: 3, thresholdAmount: 50000 },
      { level: 4, thresholdAmount: null },
    ];
    expect(DelegationOfAuthorityService.resolveLevel(rules, 500)).toBe(1);
    expect(DelegationOfAuthorityService.resolveLevel(rules, 3000)).toBe(2);
    expect(DelegationOfAuthorityService.resolveLevel(rules, 100000)).toBe(4);
  });
});

describe('J — PayrollCalendarControlService', () => {
  it('rejects periodStart >= periodEnd', async () => {
    const sameDate = new Date('2026-09-01');
    await expect(
      payrollCalendarControlService.upsert(
        {
          periodCode: 'P-1',
          country: 'AE',
          periodStart: sameDate,
          periodEnd: sameDate,
          cutoffAt: sameDate,
          lockAt: sameDate,
          payAt: sameDate,
        },
        auth
      )
    ).rejects.toThrow(/periodStart must be before periodEnd/);
  });
  it('rejects cutoff > lock > pay violations', async () => {
    await expect(
      payrollCalendarControlService.upsert(
        {
          periodCode: 'P-1',
          country: 'AE',
          periodStart: new Date('2026-09-01'),
          periodEnd: new Date('2026-09-30'),
          cutoffAt: new Date('2026-10-05'),
          lockAt: new Date('2026-10-01'),
          payAt: new Date('2026-10-10'),
        },
        auth
      )
    ).rejects.toThrow(/cutoffAt/);
  });
  it('lock sets LOCKED + lockedBy', async () => {
    const r = await payrollCalendarControlService.lock('cal-1', auth);
    expect(r.status).toBe('LOCKED');
    expect(r.lockedBy).toBe('user-1');
  });
});

describe('J — PayrollVarianceService', () => {
  it('record computes variancePct correctly', async () => {
    const r = await payrollVarianceService.record(
      {
        payrollRunId: 'run-1',
        period: '2026-09',
        varianceCode: 'V-1',
        category: 'EARNING',
        expectedAmount: 1000,
        actualAmount: 1100,
      },
      auth
    );
    expect(r.variancePct).toBe(10);
  });
  it('record handles expected=0 with null variancePct', async () => {
    const r = await payrollVarianceService.record(
      {
        payrollRunId: 'run-1',
        period: '2026-09',
        varianceCode: 'V-2',
        category: 'EARNING',
        expectedAmount: 0,
        actualAmount: 500,
      },
      auth
    );
    expect(r.variancePct).toBeNull();
  });
});

describe('K — FatigueRuleService', () => {
  it('rejects negative restHours', async () => {
    await expect(
      fatigueRuleService.upsert({ ruleCode: 'F-1', minRestHoursBetweenShifts: -1 }, auth)
    ).rejects.toThrow(/cannot be negative/);
  });
  it('breachesRule detects max consecutive days', () => {
    const r = FatigueRuleService.breachesRule(
      { maxConsecutiveDays: 6, minRestHoursBetweenShifts: 11, maxWeeklyHours: 48 },
      { consecutiveDays: 7, restHoursBefore: 12, weeklyHours: 40 }
    );
    expect(r.breaches).toBe(true);
    expect(r.reasons).toContain('MAX_CONSECUTIVE_DAYS(6)');
  });
  it('breachesRule detects insufficient rest', () => {
    const r = FatigueRuleService.breachesRule(
      { maxConsecutiveDays: 6, minRestHoursBetweenShifts: 11, maxWeeklyHours: 48 },
      { consecutiveDays: 3, restHoursBefore: 8, weeklyHours: 40 }
    );
    expect(r.breaches).toBe(true);
    expect(r.reasons).toContain('MIN_REST_HOURS(11)');
  });
  it('breachesRule no breach when within limits', () => {
    const r = FatigueRuleService.breachesRule(
      { maxConsecutiveDays: 6, minRestHoursBetweenShifts: 11, maxWeeklyHours: 48 },
      { consecutiveDays: 3, restHoursBefore: 12, weeklyHours: 40 }
    );
    expect(r.breaches).toBe(false);
  });
});

describe('K — OvertimeFraudService', () => {
  it('exports 6 fraud signal codes', () => {
    expect(OT_FRAUD_SIGNALS.length).toBe(6);
  });
  it('rejects unknown signal codes', async () => {
    await expect(
      overtimeFraudService.raise(
        {
          employeeId: 'e-1',
          evidencePeriod: '2026-09',
          signal: 'NOT_REAL' as any,
        },
        auth
      )
    ).rejects.toThrow(/unknown OT fraud signal/);
  });
  it('resolve requires reason', async () => {
    await expect(overtimeFraudService.resolve('ot-1', '   ', auth)).rejects.toThrow(
      /resolution reason required/
    );
  });
});

describe('K — ReturnToWorkPlanService', () => {
  it('rejects phasedReturnPct outside 0-100', async () => {
    await expect(
      returnToWorkPlanService.create(
        {
          employeeId: 'e-1',
          leaveCode: 'MATERNITY',
          expectedReturnDate: new Date(),
          phasedReturnPct: 150,
        },
        auth
      )
    ).rejects.toThrow(/0-100/);
  });
  it('confirmReturn marks COMPLETED', async () => {
    const r = await returnToWorkPlanService.confirmReturn(
      'rtw-1',
      { actualReturnDate: new Date(), fitnessClearance: true },
      auth
    );
    expect(r.status).toBe('COMPLETED');
    expect(r.fitnessClearance).toBe(true);
  });
});

describe('K — HolidayCalendarChangeService — maker-checker', () => {
  it('requires rationale on request', async () => {
    await expect(
      holidayCalendarChangeService.request(
        {
          calendarCode: 'CAL-AE',
          country: 'AE',
          year: 2026,
          changeType: 'ADD',
          change: {},
          rationale: '   ',
        },
        auth
      )
    ).rejects.toThrow(/rationale required/);
  });
  it('approve refuses when approver equals requester', async () => {
    prismaMock.holidayCalendarChangeRequest.findUnique = vi.fn().mockResolvedValue({
      id: 'hc-1',
      tenantId: 'tenant-1',
      status: 'PENDING_APPROVAL',
      requestedBy: 'user-1',
    });
    await expect(
      holidayCalendarChangeService.approve('hc-1', {
        tenantId: 'tenant-1',
        userId: 'user-1',
      })
    ).rejects.toThrow(/approver must differ from requester/);
  });
});

describe('K — RedundancyBatchService', () => {
  it('rejects negative impactedHeadcount', async () => {
    await expect(
      redundancyBatchService.upsert(
        {
          batchCode: 'R-1',
          label: 'R1',
          country: 'AE',
          scope: 'SITE',
          impactedHeadcount: -5,
        },
        auth
      )
    ).rejects.toThrow(/cannot be negative/);
  });
});

describe('K — SeparationRetentionPolicyService', () => {
  it('rejects negative retentionYears', async () => {
    await expect(
      separationRetentionPolicyService.upsert(
        {
          recordType: 'EOSB_CALC',
          retentionYears: -1,
          effectiveFrom: new Date(),
        },
        auth
      )
    ).rejects.toThrow(/cannot be negative/);
  });
});

describe('K — UnifiedWageFileGeneratorService (EPIC-11-S05)', () => {
  it('exports BAHRAIN, OMAN, KUWAIT in scope', () => {
    expect(UNIFIED_WAGE_FILE_SCOPE).toEqual(['BAHRAIN', 'OMAN', 'KUWAIT']);
  });
  it('generates 1 result per request', async () => {
    const results = await unifiedWageFileGeneratorService.generate([
      { country: 'BAHRAIN', period: '2026-09', payrollRunId: 'r1' },
      { country: 'OMAN', period: '2026-09', payrollRunId: 'r2' },
    ]);
    expect(results.length).toBe(2);
    expect(results[0].fileRef).toMatch(/^WPS-BAHRAIN-/);
  });
  it('rejects duplicate (country, period)', async () => {
    await expect(
      unifiedWageFileGeneratorService.generate([
        { country: 'BAHRAIN', period: '2026-09', payrollRunId: 'r1' },
        { country: 'BAHRAIN', period: '2026-09', payrollRunId: 'r2' },
      ])
    ).rejects.toThrow(/duplicate/);
  });
});

describe('K — GRIEVANCE_MEDIATION_STATES (EPIC-25-S04)', () => {
  it('exports informal/failed/settled states', () => {
    expect(GRIEVANCE_MEDIATION_STATES).toEqual([
      'INFORMAL_MEDIATION',
      'MEDIATION_FAILED',
      'MEDIATION_SETTLED',
    ]);
  });
});

describe('K — canReadRecord (EPIC-30-S07)', () => {
  it('PUBLIC always readable', () => {
    expect(canReadRecord('PUBLIC', [])).toBe(true);
  });
  it('INTERNAL requires at least one scope', () => {
    expect(canReadRecord('INTERNAL', [])).toBe(false);
    expect(canReadRecord('INTERNAL', ['ANY'])).toBe(true);
  });
  it('CONFIDENTIAL requires RECORDS_OFFICER or HR_HEAD', () => {
    expect(canReadRecord('CONFIDENTIAL', ['HR_HEAD'])).toBe(true);
    expect(canReadRecord('CONFIDENTIAL', ['SOMETHING'])).toBe(false);
  });
  it('RESTRICTED requires COMPLIANCE_OFFICER or LEGAL_OFFICER', () => {
    expect(canReadRecord('RESTRICTED', ['LEGAL_OFFICER'])).toBe(true);
    expect(canReadRecord('RESTRICTED', ['HR_HEAD'])).toBe(false);
  });
});

describe('K — rollupByCountry (EPIC-31-S04)', () => {
  it('groups + averages per country', () => {
    const rows = [
      { country: 'AE', score: 80 },
      { country: 'AE', score: 70 },
      { country: 'SA', score: 90 },
      { country: null, score: 60 },
    ];
    const r = rollupByCountry(rows);
    const ae = r.find((x) => x.country === 'AE');
    expect(ae?.count).toBe(2);
    expect(ae?.total).toBe(150);
    expect(ae?.avg).toBe(75);
    expect(r.find((x) => x.country === 'GLOBAL')?.count).toBe(1);
  });
});

describe('K — canViewExecutiveDomain (EPIC-31-S14)', () => {
  it('CEO can view ALL', () => {
    expect(canViewExecutiveDomain('CEO', 'PAYROLL')).toBe(true);
    expect(canViewExecutiveDomain('CEO', 'ANY')).toBe(true);
  });
  it('CFO can view PAYROLL but not COMPLIANCE', () => {
    expect(canViewExecutiveDomain('CFO', 'PAYROLL')).toBe(true);
    expect(canViewExecutiveDomain('CFO', 'COMPLIANCE')).toBe(false);
  });
  it('CCO can view COMPLIANCE / AUDIT', () => {
    expect(canViewExecutiveDomain('CCO', 'COMPLIANCE')).toBe(true);
    expect(canViewExecutiveDomain('CCO', 'AUDIT')).toBe(true);
    expect(canViewExecutiveDomain('CCO', 'PAYROLL')).toBe(false);
  });
});
