import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  auditPlanService,
  calendarCertificateService,
  CATEGORY_SEEDS,
  complianceCalendarService,
  RECURRENCE_RULE_SEEDS,
} from '../compliance-calendar';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.calendarCategory = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cat-1', ...data })),
  };
  m.recurrenceRule = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
  };
  m.holidayCalendar = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'h-1', ...data })),
  };
  m.complianceTask = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 't-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 't-1', ...data })),
  };
  m.auditPlan = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'plan-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'plan-1', ...data })),
  };
  m.auditSample = {
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 's-1', ...data })),
  };
  m.auditTestResult = {
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'tr-1', ...data })),
  };
  m.auditFinding = {
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'f-1', ...data })),
  };
  m.correctiveAction = {
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ca-1', ...data })),
    findMany: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ca-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.managementReview = {
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'mr-1', ...create })),
    findMany: vi.fn().mockResolvedValue([]),
  };
  m.calendarCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cc-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cc-1', ...data })),
  };
});

describe('seed integrity', () => {
  it('category seeds cover the canonical compliance pillars', () => {
    const codes = CATEGORY_SEEDS.map((c) => c.code);
    for (const need of [
      'PAYROLL',
      'WPS',
      'SOCIAL_INSURANCE',
      'IMMIGRATION',
      'NATIONALIZATION',
      'HOLIDAY',
      'BENEFITS',
      'HSE',
      'EMPLOYEE_RELATIONS',
      'DOCUMENT_AUDIT',
    ]) {
      expect(codes).toContain(need);
    }
  });

  it('recurrence rules include WPS submission for all six GCC countries', () => {
    const wps = RECURRENCE_RULE_SEEDS.filter((r) => r.categoryCode === 'WPS');
    const countries = new Set(wps.map((r) => r.countryCode));
    for (const cc of ['AE', 'SA', 'BH', 'QA', 'OM', 'KW']) {
      expect(countries.has(cc)).toBe(true);
    }
  });
});

describe('resolveDueDate', () => {
  it('shifts to previous business day when due date lands on weekend', () => {
    // 2026-01-31 = Saturday. PREVIOUS_BUSINESS_DAY should walk back.
    const due = complianceCalendarService.resolveDueDate(
      {
        cadence: 'MONTHLY',
        dayOfMonth: 31,
        monthOfYear: 1,
        shiftOnHoliday: 'PREVIOUS_BUSINESS_DAY',
      },
      [],
      2026,
      1
    );
    expect(due.getUTCDay()).not.toBe(0);
    expect(due.getUTCDay()).not.toBe(5);
    expect(due.getUTCDay()).not.toBe(6);
  });

  it('shifts away from a public holiday', () => {
    // Force 2026-01-14 as a holiday — UAE WPS day. Should shift back to 13 (Tue if 14 is Wed).
    const due = complianceCalendarService.resolveDueDate(
      { cadence: 'MONTHLY', dayOfMonth: 14, shiftOnHoliday: 'PREVIOUS_BUSINESS_DAY' },
      [new Date('2026-01-14T00:00:00Z')],
      2026,
      1
    );
    expect(due.getUTCDate()).not.toBe(14);
  });

  it('clamps day-of-month to last day of month', () => {
    // February: day 31 should clamp to Feb 28 (2026 non-leap)
    const due = complianceCalendarService.resolveDueDate(
      { cadence: 'MONTHLY', dayOfMonth: 31, shiftOnHoliday: 'PREVIOUS_BUSINESS_DAY' },
      [],
      2026,
      2
    );
    expect(due.getUTCMonth()).toBe(1); // Feb
    expect(due.getUTCDate()).toBeLessThanOrEqual(28);
  });
});

describe('complianceCalendarService.generateTasks', () => {
  it('skips already-generated tasks (unique-constraint idempotency)', async () => {
    m.recurrenceRule.findMany.mockResolvedValue([
      {
        code: 'WPS_AE',
        categoryCode: 'WPS',
        countryCode: 'AE',
        cadence: 'MONTHLY',
        dayOfMonth: 14,
        ownerRole: 'PAYROLL_OFFICER',
        shiftOnHoliday: 'PREVIOUS_BUSINESS_DAY',
      },
    ]);
    let calls = 0;
    m.complianceTask.create.mockImplementation(async ({ data }: any) => {
      calls += 1;
      if (calls > 1) {
        const e = new Error('Unique constraint failed');
        throw e;
      }
      return { id: `t-${calls}`, ...data };
    });
    const { created, skipped } = await complianceCalendarService.generateTasks(
      { monthsAhead: 3 },
      auth
    );
    expect(created).toBe(1);
    expect(skipped).toBe(2);
  });

  it('respects QUARTERLY cadence (only generates in Q1 month within window)', async () => {
    m.recurrenceRule.findMany.mockResolvedValue([
      {
        code: 'Q_RULE',
        categoryCode: 'NATIONALIZATION',
        countryCode: 'SA',
        cadence: 'QUARTERLY',
        dayOfMonth: 1,
        ownerRole: 'HR_MANAGER',
        shiftOnHoliday: 'PREVIOUS_BUSINESS_DAY',
      },
    ]);
    let count = 0;
    m.complianceTask.create.mockImplementation(async ({ data }: any) => {
      count += 1;
      return { id: `t-${count}`, ...data };
    });
    await complianceCalendarService.generateTasks({ monthsAhead: 3 }, auth);
    // At most 1 of the 3 months matches (month-1)%3 === 0
    expect(count).toBeLessThanOrEqual(1);
  });
});

describe('escalateOverdue', () => {
  it('flips OPEN past-due tasks to OVERDUE and routes to escalationRole', async () => {
    m.complianceTask.findMany.mockResolvedValue([{ id: 'task-1', ruleCode: 'WPS_AE' }]);
    m.recurrenceRule.findUnique.mockResolvedValue({ escalationRole: 'COMPLIANCE_OFFICER' });
    const { escalated } = await complianceCalendarService.escalateOverdue(auth);
    expect(escalated).toEqual(['task-1']);
    expect(m.complianceTask.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'OVERDUE', escalatedToRole: 'COMPLIANCE_OFFICER' }),
      })
    );
  });
});

describe('auditPlanService.select', () => {
  it('RISK_BASED picks the highest-weight records', () => {
    const sel = auditPlanService.select(
      [
        { id: 'a', weight: 1 },
        { id: 'b', weight: 5 },
        { id: 'c', weight: 3 },
      ],
      2,
      'RISK_BASED'
    );
    expect(sel.map((s) => s.id)).toEqual(['b', 'c']);
  });

  it('RANDOM returns N distinct records when N ≤ population', () => {
    const sel = auditPlanService.select(
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
      2,
      'RANDOM'
    );
    expect(sel.length).toBe(2);
    expect(new Set(sel.map((s) => s.id)).size).toBe(2);
  });

  it('handles empty population', () => {
    expect(auditPlanService.select([], 5, 'RANDOM')).toEqual([]);
  });
});

describe('calendarCertificateService', () => {
  it('dashboard summarises tasks and flags critical-category overdue', async () => {
    m.complianceTask.findMany.mockResolvedValue([
      { categoryCode: 'WPS', status: 'OVERDUE' },
      { categoryCode: 'PAYROLL', status: 'COMPLETED' },
      { categoryCode: 'PAYROLL', status: 'OPEN' },
    ]);
    const d = await calendarCertificateService.dashboard('tenant-1', '2026-06');
    expect(d.total).toBe(3);
    expect(d.completed).toBe(1);
    expect(d.overdue).toBe(1);
    expect(d.criticalOverdue).toBe(1);
  });

  it('generate sets gating when critical overdue > 0', async () => {
    m.complianceTask.findMany.mockResolvedValue([
      { categoryCode: 'IMMIGRATION', status: 'OVERDUE' },
    ]);
    const cert = await calendarCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/critical/);
  });

  it('sign refuses while gated', async () => {
    m.calendarCertificate.findUnique.mockResolvedValue({
      id: 'cc-1',
      gatingReason: 'Blocked: 1 critical task(s) overdue',
    });
    await expect(calendarCertificateService.sign('2026-06', [], auth)).rejects.toThrow(/gated/);
  });
});
