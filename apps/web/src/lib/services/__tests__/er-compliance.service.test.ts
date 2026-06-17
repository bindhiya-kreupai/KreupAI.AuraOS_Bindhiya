import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  erGrievanceService,
  erDisciplinaryService,
  erInvestigationService,
  erAppealService,
  erCertificateService,
  isGrievanceSlaBreached,
  SALARY_DEDUCTION_LIMITS_PCT,
  ER_CONSTANTS,
} from '../er-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.erGrievanceCase = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'g-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'g-1', ...data })),
  };
  m.erDisciplinaryAction = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'd-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'd-1', ...data })),
  };
  m.erInvestigation = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'i-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'i-1', ...data })),
  };
  m.erAppeal = {
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'a-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'a-1', ...data })),
  };
  m.erCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
});

describe('isGrievanceSlaBreached', () => {
  it('returns false for RESOLVED', () => {
    expect(
      isGrievanceSlaBreached({
        raisedAt: new Date(Date.now() - 100 * 24 * 3600 * 1000),
        slaDays: 30,
        status: 'RESOLVED',
      })
    ).toBe(false);
  });
  it('returns true when past SLA', () => {
    expect(
      isGrievanceSlaBreached({
        raisedAt: new Date(Date.now() - 35 * 24 * 3600 * 1000),
        slaDays: 30,
        status: 'OPEN',
      })
    ).toBe(true);
  });
});

describe('SALARY_DEDUCTION_LIMITS_PCT', () => {
  it('exposes correct GCC limits', () => {
    expect(SALARY_DEDUCTION_LIMITS_PCT.UAE).toBe(25);
    expect(SALARY_DEDUCTION_LIMITS_PCT.KSA).toBe(50);
    expect(SALARY_DEDUCTION_LIMITS_PCT.BAHRAIN).toBe(25);
    expect(SALARY_DEDUCTION_LIMITS_PCT.QATAR).toBe(50);
  });
});

describe('erDisciplinaryService.draft', () => {
  it('refuses when salary deduction exceeds country limit', async () => {
    await expect(
      erDisciplinaryService.draft(
        {
          actionNumber: 'D-1',
          employeeId: 'e-1',
          misconductType: 'tardiness',
          actionType: 'SALARY_DEDUCTION',
          salaryDeductionPct: 30,
          country: 'UAE',
        },
        auth
      )
    ).rejects.toThrow(/exceeds UAE limit 25/);
  });
  it('accepts when within country limit', async () => {
    await erDisciplinaryService.draft(
      {
        actionNumber: 'D-2',
        employeeId: 'e-1',
        misconductType: 'tardiness',
        actionType: 'SALARY_DEDUCTION',
        salaryDeductionPct: 20,
        country: 'UAE',
      },
      auth
    );
    expect(m.erDisciplinaryAction.upsert).toHaveBeenCalled();
  });
});

describe('erDisciplinaryService.issue', () => {
  it('refuses to issue without hearing', async () => {
    m.erDisciplinaryAction.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'd-1', tenantId: 'tenant-1', hearingHeld: false });
    await expect(erDisciplinaryService.issue('d-1', new Date(), auth)).rejects.toThrow(
      /hearing not held/
    );
  });
  it('issues when hearing held', async () => {
    m.erDisciplinaryAction.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'd-1', tenantId: 'tenant-1', hearingHeld: true });
    await erDisciplinaryService.issue('d-1', new Date(), auth);
    const call = m.erDisciplinaryAction.update.mock.calls[0][0];
    expect(call.data.status).toBe('ISSUED');
  });
});

describe('erInvestigationService', () => {
  it('increments interview count', async () => {
    await erInvestigationService.addInterview('i-1', auth);
    const call = m.erInvestigation.update.mock.calls[0][0];
    expect(call.data.interviewCount).toEqual({ increment: 1 });
  });
  it('completes with findings + recommendation', async () => {
    await erInvestigationService.complete('i-1', 'breach found', 'final warning', auth);
    const call = m.erInvestigation.update.mock.calls[0][0];
    expect(call.data.findings).toBe('breach found');
    expect(call.data.status).toBe('COMPLETED');
  });
});

describe('erCertificateService', () => {
  it('gates when retaliation cases open', async () => {
    m.erGrievanceCase.count = vi
      .fn()
      .mockResolvedValueOnce(0) // opened
      .mockResolvedValueOnce(0) // closed
      .mockResolvedValueOnce(0) // highSeverity
      .mockResolvedValueOnce(0) // labour-authority
      .mockResolvedValueOnce(3); // retaliation
    const cert = await erCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/RETALIATION/);
  });
  it('gates when disciplinary actions without hearing', async () => {
    m.erDisciplinaryAction.count = vi.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(2);
    const cert = await erCertificateService.generate('2026-06', auth);
    expect(cert.gatingReason).toMatch(/without hearing/);
  });
  it('refuses to sign while gated', async () => {
    m.erCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 1 SLA-breached grievance(s)' });
    await expect(erCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
  it('exposes constants', () => {
    expect(ER_CONSTANTS.SALARY_DEDUCTION_LIMITS_PCT.KSA).toBe(50);
  });
});
