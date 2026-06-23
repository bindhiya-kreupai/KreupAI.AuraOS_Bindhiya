import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  evaluateOtFraud,
  otActualService,
  otBudgetService,
  otCertificateService,
  otPolicyService,
  otRateCardService,
  otRequestService,
  OT_CONSTANTS,
} from '../overtime-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.otPolicy = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'p-1', ...create })),
  };
  m.otRateCard = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
  };
  m.otRequest = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'req-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'req-1', ...data })),
  };
  m.otActual = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi
      .fn()
      .mockResolvedValue({ _sum: { actualHours: 0, computedAmount: 0 }, _count: { _all: 0 } }),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'a-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'a-1', ...data })),
  };
  m.otBudget = {
    findMany: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'b-1', ...data })),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'b-1', ...create })),
  };
  m.otCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
});

describe('evaluateOtFraud', () => {
  const base = {
    hasApprovedRequest: true,
    duplicateExists: false,
    monthlyHoursSoFar: 0,
    maxDailyOtHours: 2,
    maxMonthlyOtHours: 40,
    actualHours: 1,
  };
  it('returns zero score when all signals clean', () => {
    expect(evaluateOtFraud(base)).toEqual({ score: 0, flags: [] });
  });
  it('flags GHOST_HOURS when no approved request', () => {
    const r = evaluateOtFraud({ ...base, hasApprovedRequest: false });
    expect(r.flags).toContain('GHOST_HOURS');
    expect(r.score).toBeGreaterThanOrEqual(40);
  });
  it('flags EXCESSIVE_DAILY when actual > cap', () => {
    const r = evaluateOtFraud({ ...base, actualHours: 5 });
    expect(r.flags).toContain('EXCESSIVE_DAILY');
  });
  it('flags EXCESSIVE_MONTHLY when monthly total > cap', () => {
    const r = evaluateOtFraud({ ...base, monthlyHoursSoFar: 38, actualHours: 5 });
    expect(r.flags).toContain('EXCESSIVE_MONTHLY');
  });
  it('flags DUPLICATE_DATE when duplicate exists', () => {
    const r = evaluateOtFraud({ ...base, duplicateExists: true });
    expect(r.flags).toContain('DUPLICATE_DATE');
  });
});

describe('OT rate card seeding', () => {
  it('seeds all GCC rate-card rows', async () => {
    const result = await otRateCardService.seedDefaults(auth);
    expect(result.created.length).toBe(OT_CONSTANTS.DEFAULT_RATE_CARDS.length);
  });
});

describe('OT request creation', () => {
  it('refuses request when country policy marks ineligible', async () => {
    m.otPolicy.findMany = vi.fn().mockResolvedValue([{ isEligible: false, maxDailyOtHours: 2 }]);
    await expect(
      otRequestService.create(
        {
          employeeId: 'e-1',
          country: 'UAE',
          requestDate: new Date(),
          plannedHours: 1,
          otType: 'WEEKDAY',
        },
        auth
      )
    ).rejects.toThrow(/not eligible/);
  });
  it('refuses when planned hours exceed daily cap', async () => {
    m.otPolicy.findMany = vi.fn().mockResolvedValue([{ isEligible: true, maxDailyOtHours: 2 }]);
    await expect(
      otRequestService.create(
        {
          employeeId: 'e-1',
          country: 'UAE',
          requestDate: new Date(),
          plannedHours: 5,
          otType: 'WEEKDAY',
        },
        auth
      )
    ).rejects.toThrow(/exceeds maxDailyOtHours/);
  });
  it('creates when within caps', async () => {
    m.otPolicy.findMany = vi.fn().mockResolvedValue([{ isEligible: true, maxDailyOtHours: 4 }]);
    const r = await otRequestService.create(
      {
        employeeId: 'e-1',
        country: 'UAE',
        requestDate: new Date(),
        plannedHours: 2,
        otType: 'WEEKDAY',
      },
      auth
    );
    expect(r.status).toBe('PENDING');
  });
});

describe('OT actual posting', () => {
  it('throws when no rate card', async () => {
    m.otRateCard.findMany = vi.fn().mockResolvedValue([]);
    await expect(
      otActualService.post(
        {
          employeeId: 'e-1',
          country: 'UAE',
          otDate: new Date(),
          otType: 'WEEKDAY',
          actualHours: 1,
        },
        auth
      )
    ).rejects.toThrow(/no rate card/);
  });
  it('computes amount with multiplier when hourly rate provided', async () => {
    m.otRateCard.findMany = vi.fn().mockResolvedValue([{ multiplier: 1.5 }]);
    m.otPolicy.findMany = vi
      .fn()
      .mockResolvedValue([{ maxDailyOtHours: 4, maxMonthlyOtHours: 40 }]);
    await otActualService.post(
      {
        employeeId: 'e-1',
        country: 'UAE',
        otDate: new Date(),
        otType: 'WEEKDAY',
        actualHours: 2,
        hourlyRate: 50,
      },
      auth
    );
    const call = m.otActual.upsert.mock.calls[0][0];
    expect(call.create.multiplier).toBe(1.5);
    expect(call.create.computedAmount).toBe(150);
  });
  it('flags GHOST_HOURS when actual posted without approved request', async () => {
    m.otRateCard.findMany = vi.fn().mockResolvedValue([{ multiplier: 1.25 }]);
    m.otPolicy.findMany = vi
      .fn()
      .mockResolvedValue([{ maxDailyOtHours: 4, maxMonthlyOtHours: 40 }]);
    await otActualService.post(
      {
        employeeId: 'e-1',
        country: 'UAE',
        otDate: new Date(),
        otType: 'WEEKDAY',
        actualHours: 1,
      },
      auth
    );
    const call = m.otActual.upsert.mock.calls[0][0];
    expect(call.create.fraudFlags).toContain('GHOST_HOURS');
  });
});

describe('OT certificate', () => {
  it('refuses to sign while gated', async () => {
    m.otCertificate.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked: 2 fraud-flagged actual(s)' });
    await expect(otCertificateService.sign('2026-06', [], auth)).rejects.toThrow(
      /cannot sign while gated/
    );
  });
});
