import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    redFlagRule: { findUnique: vi.fn() },
    redFlagInstance: { create: vi.fn(), findFirst: vi.fn() },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

vi.mock('../run.service', () => ({
  checklistRunService: { recordAutoEvaluation: vi.fn() },
}));

import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';
import { redFlagService } from '../red-flag.service';

const p = prisma as unknown as any;
const auth = { tenantId: 't1', userId: 'u1' };

beforeEach(() => vi.clearAllMocks());

describe('RedFlagService.evaluateAndRaise (Pattern 8 wiring)', () => {
  it('raises a flag when the rule expression evaluates truthy', async () => {
    p.redFlagRule.findUnique.mockResolvedValue({
      code: 'RF_SALARY_LATE',
      domain: 'PAYROLL',
      severity: 'HIGH',
      expression: 'payslip.creditedAt > payslip.dueDate',
      thresholdJson: {},
      isActive: true,
    });
    p.redFlagInstance.create.mockImplementation(async (a: any) => ({ id: 'flag-1', ...a.data }));

    const out = await redFlagService.evaluateAndRaise(
      {
        ruleCode: 'RF_SALARY_LATE',
        sourceType: 'PAYSLIP',
        sourceId: 'ps-1',
        context: {
          payslip: {
            creditedAt: new Date('2026-06-20T00:00:00Z'),
            dueDate: new Date('2026-06-15T00:00:00Z'),
          },
        },
      },
      auth
    );

    expect(out).not.toBeNull();
    expect(out.ruleCode).toBe('RF_SALARY_LATE');
    expect(p.redFlagInstance.create).toHaveBeenCalledOnce();
  });

  it('does NOT raise a flag when the expression is falsy', async () => {
    p.redFlagRule.findUnique.mockResolvedValue({
      code: 'RF_SALARY_LATE',
      domain: 'PAYROLL',
      severity: 'HIGH',
      expression: 'payslip.creditedAt > payslip.dueDate',
      thresholdJson: {},
      isActive: true,
    });

    const out = await redFlagService.evaluateAndRaise(
      {
        ruleCode: 'RF_SALARY_LATE',
        sourceType: 'PAYSLIP',
        sourceId: 'ps-1',
        context: {
          payslip: {
            creditedAt: new Date('2026-06-10T00:00:00Z'),
            dueDate: new Date('2026-06-15T00:00:00Z'),
          },
        },
      },
      auth
    );

    expect(out).toBeNull();
    expect(p.redFlagInstance.create).not.toHaveBeenCalled();
  });

  it('returns null + does not raise when the rule is inactive', async () => {
    p.redFlagRule.findUnique.mockResolvedValue({
      code: 'RF_OLD',
      domain: 'PAYROLL',
      expression: 'true', // would normally fire
      isActive: false,
    });

    const out = await redFlagService.evaluateAndRaise(
      { ruleCode: 'RF_OLD', sourceType: 'PAYSLIP', sourceId: 'ps-1', context: {} },
      auth
    );

    expect(out).toBeNull();
    expect(p.redFlagInstance.create).not.toHaveBeenCalled();
  });

  it('merges thresholdJson into the evaluation context', async () => {
    p.redFlagRule.findUnique.mockResolvedValue({
      code: 'RF_DELAY',
      domain: 'PAYROLL',
      severity: 'CRITICAL',
      expression: 'payslip.daysLate > thresholds.criticalDays',
      thresholdJson: { criticalDays: 15 },
      isActive: true,
    });
    p.redFlagInstance.create.mockImplementation(async (a: any) => ({ id: 'flag-1', ...a.data }));

    // 20 days late > 15 threshold → fires
    const fired = await redFlagService.evaluateAndRaise(
      {
        ruleCode: 'RF_DELAY',
        sourceType: 'PAYSLIP',
        sourceId: 'ps-1',
        context: { payslip: { daysLate: 20 } },
      },
      auth
    );
    expect(fired).not.toBeNull();

    p.redFlagInstance.create.mockClear();
    // 10 days late < 15 threshold → does not fire
    const calm = await redFlagService.evaluateAndRaise(
      {
        ruleCode: 'RF_DELAY',
        sourceType: 'PAYSLIP',
        sourceId: 'ps-2',
        context: { payslip: { daysLate: 10 } },
      },
      auth
    );
    expect(calm).toBeNull();
    expect(p.redFlagInstance.create).not.toHaveBeenCalled();
  });

  it('swallows a malformed expression and logs it (one bad rule must not block others)', async () => {
    p.redFlagRule.findUnique.mockResolvedValue({
      code: 'RF_BAD',
      domain: 'PAYROLL',
      severity: 'HIGH',
      expression: '"oops > not parseable', // unterminated string
      thresholdJson: {},
      isActive: true,
    });

    const out = await redFlagService.evaluateAndRaise(
      { ruleCode: 'RF_BAD', sourceType: 'PAYSLIP', sourceId: 'ps-1', context: {} },
      auth
    );
    expect(out).toBeNull();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ ruleCode: 'RF_BAD' }),
      expect.stringMatching(/failed to evaluate/)
    );
  });

  it('returns null when the rule code is not found', async () => {
    p.redFlagRule.findUnique.mockResolvedValue(null);
    const out = await redFlagService.evaluateAndRaise(
      { ruleCode: 'NOPE', sourceType: 'PAYSLIP', sourceId: 'ps-1', context: {} },
      auth
    );
    expect(out).toBeNull();
  });
});
