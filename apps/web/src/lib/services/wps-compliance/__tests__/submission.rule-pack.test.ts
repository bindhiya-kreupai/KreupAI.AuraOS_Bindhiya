import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aura/database', () => ({
  prisma: {
    wpsPeriodSubmission: { findUnique: vi.fn(), update: vi.fn() },
    wpsEmployeeRow: { findMany: vi.fn() },
    salaryDelayFlag: { create: vi.fn() },
  },
}));

vi.mock('../../gcc-rule-library/rule-pack.service', () => ({
  countryRulePackService: { resolveRule: vi.fn() },
}));

vi.mock('@/lib/logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

import { prisma } from '@aura/database';
import { countryRulePackService } from '../../gcc-rule-library/rule-pack.service';
import { WpsSubmissionService } from '../submission.service';

const fakePrisma = prisma as unknown as {
  wpsPeriodSubmission: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  wpsEmployeeRow: { findMany: ReturnType<typeof vi.fn> };
  salaryDelayFlag: { create: ReturnType<typeof vi.fn> };
};

/**
 * Tier-1 wiring test (audit 2026-06-17 Pattern 1).
 *
 * WpsSubmissionService.submit() raises a SalaryDelayFlag per row when
 * the file is submitted past the country regulatory window. The
 * CRITICAL vs HIGH severity boundary must come from the active country
 * rule pack (PAYROLL / WPS_SALARY_WINDOW_DAYS) so compliance officers
 * can edit it without a deploy. The hardcoded 15-day default must
 * survive as a safety net when no rule pack is seeded or the rule
 * engine errors.
 */
describe('WpsSubmissionService.submit — severity threshold via rule pack', () => {
  const auth = { tenantId: 't1', userId: 'u1' } as any;
  const submissionId = 'sub-1';
  const submittedAt = new Date('2026-01-30T00:00:00.000Z');
  const dueDate = new Date('2026-01-01T00:00:00.000Z'); // 29 days late

  function arrangeSubmission(countryCode: string) {
    fakePrisma.wpsPeriodSubmission.findUnique.mockResolvedValue({
      id: submissionId,
      countryCode,
      period: '2026-01',
      dueDate,
      status: 'VALIDATED',
    });
    fakePrisma.wpsPeriodSubmission.update.mockResolvedValue({});
    fakePrisma.wpsEmployeeRow.findMany.mockResolvedValue([
      { employeeId: 'emp-1' },
      { employeeId: 'emp-2' },
    ]);
    fakePrisma.salaryDelayFlag.create.mockResolvedValue({});
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the rule-pack threshold (KSA → 7) so 29 days late → CRITICAL', async () => {
    arrangeSubmission('SA');
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'PAYROLL',
      ruleKey: 'WPS_SALARY_WINDOW_DAYS',
      value: 7,
    } as any);

    const svc = new WpsSubmissionService();
    await svc.submit(submissionId, submittedAt, auth);

    expect(fakePrisma.salaryDelayFlag.create).toHaveBeenCalledTimes(2);
    const firstCall = fakePrisma.salaryDelayFlag.create.mock.calls[0][0];
    expect(firstCall.data.severity).toBe('CRITICAL');
    expect(firstCall.data.daysLate).toBe(29);
  });

  it('uses the rule-pack threshold (UAE → 15) so 29 days late → CRITICAL', async () => {
    arrangeSubmission('AE');
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'PAYROLL',
      ruleKey: 'WPS_SALARY_WINDOW_DAYS',
      value: 15,
    } as any);

    const svc = new WpsSubmissionService();
    await svc.submit(submissionId, submittedAt, auth);

    const firstCall = fakePrisma.salaryDelayFlag.create.mock.calls[0][0];
    expect(firstCall.data.severity).toBe('CRITICAL');
  });

  it('drops to HIGH (not CRITICAL) when daysLate ≤ threshold', async () => {
    arrangeSubmission('AE');
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({
      domain: 'PAYROLL',
      ruleKey: 'WPS_SALARY_WINDOW_DAYS',
      value: 30, // threshold raised above the 29-day-late submission
    } as any);

    const svc = new WpsSubmissionService();
    await svc.submit(submissionId, submittedAt, auth);

    const firstCall = fakePrisma.salaryDelayFlag.create.mock.calls[0][0];
    expect(firstCall.data.severity).toBe('HIGH');
  });

  it('falls back to the hardcoded 15-day default when no rule pack exists', async () => {
    arrangeSubmission('AE');
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue(null);

    const svc = new WpsSubmissionService();
    await svc.submit(submissionId, submittedAt, auth);

    const firstCall = fakePrisma.salaryDelayFlag.create.mock.calls[0][0];
    // 29 days late > 15 hardcoded → CRITICAL
    expect(firstCall.data.severity).toBe('CRITICAL');
  });

  it('survives a rule-engine error and silently uses the hardcoded fallback', async () => {
    arrangeSubmission('AE');
    vi.mocked(countryRulePackService.resolveRule).mockRejectedValue(new Error('db down'));

    const svc = new WpsSubmissionService();
    await expect(svc.submit(submissionId, submittedAt, auth)).resolves.toBeDefined();
    expect(fakePrisma.salaryDelayFlag.create).toHaveBeenCalledTimes(2);
  });

  it('resolves with the submission countryCode (not a hardcoded constant)', async () => {
    arrangeSubmission('SA');
    vi.mocked(countryRulePackService.resolveRule).mockResolvedValue({ value: 7 } as any);

    const svc = new WpsSubmissionService();
    await svc.submit(submissionId, submittedAt, auth);

    expect(countryRulePackService.resolveRule).toHaveBeenCalledWith(
      'SA',
      'PAYROLL',
      'WPS_SALARY_WINDOW_DAYS',
      expect.any(Date)
    );
  });
});
