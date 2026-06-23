import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  nationalisationRequisitionTagService,
  nationalisationJobTagService,
  nationalisationRetentionService,
  nationalisationDevelopmentPlanService,
  nationalisationArtificialRiskService,
  saudiProfessionService,
  ARTIFICIAL_RISK_SIGNALS,
  riskBandFromSignals,
  NATIONALISATION_PROGRAMS,
} from '../nationalisation-overlay';
import { daysBetween, isEarlyAttrition } from '../nationalisation-overlay/retention.service';

const prismaMock = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  prismaMock.nationalisationRequisitionTag = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'rt-1', ...create })),
    deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    count: vi.fn().mockResolvedValue(0),
  };
  prismaMock.nationalisationJobTag = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'jt-1', ...create })),
    deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
  };
  prismaMock.nationalisationRetentionEvent = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 're-1', ...data })),
  };
  prismaMock.nationalisationDevelopmentPlan = {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'dp-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'dp-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  prismaMock.nationalisationArtificialRiskFlag = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'ar-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ar-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  prismaMock.saudiProfessionLocalization = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'sp-1', ...create })),
    count: vi.fn().mockResolvedValue(0),
  };
});

describe('NATIONALISATION_PROGRAMS', () => {
  it('lists all 5 GCC nationalisation programs', () => {
    expect(NATIONALISATION_PROGRAMS).toContain('EMIRATISATION');
    expect(NATIONALISATION_PROGRAMS).toContain('NITAQAT');
    expect(NATIONALISATION_PROGRAMS).toContain('BAHRAINIZATION');
    expect(NATIONALISATION_PROGRAMS).toContain('OMANISATION');
    expect(NATIONALISATION_PROGRAMS).toContain('QATARISATION');
  });
});

describe('NationalisationRequisitionTagService', () => {
  it('rejects targetShareNationals outside 0-100', async () => {
    await expect(
      nationalisationRequisitionTagService.upsert(
        { requisitionId: 'r-1', program: 'EMIRATISATION', targetShareNationals: 150 },
        auth
      )
    ).rejects.toThrow(/0 and 100/);
  });

  it('accepts valid target share', async () => {
    const result = await nationalisationRequisitionTagService.upsert(
      { requisitionId: 'r-1', program: 'EMIRATISATION', targetShareNationals: 75 },
      auth
    );
    expect(result.targetShareNationals).toBe(75);
  });
});

describe('NationalisationJobTagService', () => {
  it('rejects negative reservedSeats', async () => {
    await expect(
      nationalisationJobTagService.upsert(
        { targetType: 'POSITION', targetId: 'p-1', program: 'NITAQAT', reservedSeats: -1 },
        auth
      )
    ).rejects.toThrow(/negative/);
  });
});

describe('Retention helpers', () => {
  it('daysBetween computes positive day count for later events', () => {
    expect(daysBetween(new Date('2026-06-10'), new Date('2026-06-01'))).toBe(9);
  });

  it('isEarlyAttrition true when exit within threshold', () => {
    expect(isEarlyAttrition('RESIGNED', 100, 365)).toBe(true);
  });

  it('isEarlyAttrition false for non-exit event', () => {
    expect(isEarlyAttrition('CONFIRMED', 100, 365)).toBe(false);
  });

  it('isEarlyAttrition false when days >= threshold', () => {
    expect(isEarlyAttrition('TERMINATED', 400, 365)).toBe(false);
  });

  it('isEarlyAttrition false when daysFromHire null', () => {
    expect(isEarlyAttrition('RESIGNED', null, 365)).toBe(false);
  });
});

describe('NationalisationRetentionService.record', () => {
  it('flags early attrition for exits within 365 days', async () => {
    const result = await nationalisationRetentionService.record(
      {
        employeeId: 'emp-1',
        program: 'EMIRATISATION',
        nationalityFlag: 'NATIONAL',
        eventType: 'RESIGNED',
        eventDate: new Date('2026-09-01'),
        hireDate: new Date('2026-03-01'),
      },
      auth
    );
    expect(result.isEarlyAttrition).toBe(true);
    expect(result.daysFromHire).toBeGreaterThan(0);
  });

  it('does not flag exits beyond threshold', async () => {
    const result = await nationalisationRetentionService.record(
      {
        employeeId: 'emp-2',
        program: 'NITAQAT',
        nationalityFlag: 'NATIONAL',
        eventType: 'RESIGNED',
        eventDate: new Date('2027-09-01'),
        hireDate: new Date('2025-01-01'),
      },
      auth
    );
    expect(result.isEarlyAttrition).toBe(false);
  });
});

describe('NationalisationRetentionService.kpis', () => {
  it('computes earlyAttritionPct = early / exits', async () => {
    prismaMock.nationalisationRetentionEvent.findMany = vi.fn().mockResolvedValue([
      { eventType: 'HIRED', isEarlyAttrition: false },
      { eventType: 'HIRED', isEarlyAttrition: false },
      { eventType: 'HIRED', isEarlyAttrition: false },
      { eventType: 'RESIGNED', isEarlyAttrition: true },
      { eventType: 'TERMINATED', isEarlyAttrition: false },
    ]);
    const result = await nationalisationRetentionService.kpis('tenant-1', 'EMIRATISATION', {
      from: new Date('2026-01-01'),
      to: new Date('2026-12-31'),
    });
    expect(result.hires).toBe(3);
    expect(result.exits).toBe(2);
    expect(result.earlyAttritionCount).toBe(1);
    expect(result.earlyAttritionPct).toBe(50);
    expect(result.netGrowth).toBe(1);
  });
});

describe('NationalisationDevelopmentPlanService', () => {
  it('rejects completionPct outside 0-100', async () => {
    prismaMock.nationalisationDevelopmentPlan.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'dp-1', tenantId: 'tenant-1' });
    await expect(
      nationalisationDevelopmentPlanService.setStatus(
        'dp-1',
        { status: 'ACTIVE', completionPct: 150 },
        auth
      )
    ).rejects.toThrow(/0 and 100/);
  });

  it('sets completionPct = 100 + completedAt when marking COMPLETED', async () => {
    prismaMock.nationalisationDevelopmentPlan.findUnique = vi
      .fn()
      .mockResolvedValue({ id: 'dp-1', tenantId: 'tenant-1' });
    const result = await nationalisationDevelopmentPlanService.setStatus(
      'dp-1',
      { status: 'COMPLETED' },
      auth
    );
    expect(result.completionPct).toBe(100);
    expect(result.completedAt).toBeInstanceOf(Date);
  });
});

describe('riskBandFromSignals', () => {
  it('returns LOW for 0-1 signals', () => {
    expect(riskBandFromSignals(0)).toBe('LOW');
    expect(riskBandFromSignals(1)).toBe('LOW');
  });
  it('returns MEDIUM for 2 signals', () => {
    expect(riskBandFromSignals(2)).toBe('MEDIUM');
  });
  it('returns HIGH for 3 signals', () => {
    expect(riskBandFromSignals(3)).toBe('HIGH');
  });
  it('returns CRITICAL for 4+ signals', () => {
    expect(riskBandFromSignals(4)).toBe('CRITICAL');
    expect(riskBandFromSignals(9)).toBe('CRITICAL');
  });
});

describe('NationalisationArtificialRiskService', () => {
  it('rejects unknown signal codes', async () => {
    await expect(
      nationalisationArtificialRiskService.upsert(
        {
          employeeId: 'emp-1',
          program: 'EMIRATISATION',
          evidenceMonth: '2026-09',
          triggeredSignals: ['NOT_A_REAL_SIGNAL' as any],
        },
        auth
      )
    ).rejects.toThrow(/unknown signal/);
  });

  it('derives correct band from signal list', async () => {
    const result = await nationalisationArtificialRiskService.upsert(
      {
        employeeId: 'emp-1',
        program: 'NITAQAT',
        evidenceMonth: '2026-09',
        triggeredSignals: ['NO_PAYROLL', 'NO_SOCIAL_INSURANCE', 'NO_ATTENDANCE', 'NO_WPS_PAYMENT'],
      },
      auth
    );
    expect(result.signalCount).toBe(4);
    expect(result.riskBand).toBe('CRITICAL');
  });

  it('requires resolution reason on resolve', async () => {
    await expect(
      nationalisationArtificialRiskService.resolve('ar-1', { resolutionReason: '   ' }, auth)
    ).rejects.toThrow(/resolutionReason required/);
  });
});

describe('SaudiProfessionService', () => {
  it('rejects minimumNationalisationPct outside 0-100', async () => {
    await expect(
      saudiProfessionService.upsert(
        {
          professionCode: 'P-1',
          professionNameEn: 'Test',
          effectiveFrom: new Date(),
          minimumNationalisationPct: 200,
        },
        auth
      )
    ).rejects.toThrow(/0 and 100/);
  });

  it('upsert succeeds with valid input', async () => {
    const result = await saudiProfessionService.upsert(
      {
        professionCode: 'P-2',
        professionNameEn: 'Cashier',
        professionNameAr: 'صراف',
        reservedForSaudis: true,
        minimumNationalisationPct: 100,
        effectiveFrom: new Date('2026-09-01'),
        regulatorRef: 'MHRSD Decree 1234',
      },
      auth
    );
    expect(result.reservedForSaudis).toBe(true);
    expect(result.minimumNationalisationPct).toBe(100);
  });

  it('resolve returns latest effective row', async () => {
    prismaMock.saudiProfessionLocalization.findMany = vi.fn().mockResolvedValue([
      { id: 'sp-2026', effectiveFrom: new Date('2026-01-01') },
      { id: 'sp-2025', effectiveFrom: new Date('2025-01-01') },
    ]);
    const result = await saudiProfessionService.resolve('tenant-1', 'P-1', new Date('2026-06-01'));
    expect(result.id).toBe('sp-2026');
  });
});

describe('ARTIFICIAL_RISK_SIGNALS', () => {
  it('exposes the 9 expected signal codes', () => {
    expect(ARTIFICIAL_RISK_SIGNALS).toContain('NO_PAYROLL');
    expect(ARTIFICIAL_RISK_SIGNALS).toContain('NO_SOCIAL_INSURANCE');
    expect(ARTIFICIAL_RISK_SIGNALS).toContain('NO_WPS_PAYMENT');
    expect(ARTIFICIAL_RISK_SIGNALS).toContain('NO_ATTENDANCE');
    expect(ARTIFICIAL_RISK_SIGNALS).toContain('SHARED_BANK_ACCOUNT');
    expect(ARTIFICIAL_RISK_SIGNALS.length).toBe(9);
  });
});
