import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  APPLICABLE_CLASSES,
  gpssaCalculationService,
  gpssaCertificateService,
  gpssaConfigService,
  gpssaProcessService,
  gpssaReconciliationService,
  gpssaRegistrationService,
  GPSSA_RATE_SEEDS,
} from '../gpssa-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.gpssaEstablishment = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'est-1', ...data })),
  };
  m.gpssaContributionRate = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
  };
  m.gpssaEmployeeRegistration = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'reg-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'reg-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.gpssaContributionWage = {
    findUnique: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'w-1', ...create })),
  };
  m.gpssaContribution = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
  };
  m.gpssaPeriodSubmission = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 's-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 's-1', ...data })),
  };
  m.gpssaVariance = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'v-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'v-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.gpssaCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
  m.gpssaTransfer = {
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 't-1', ...data })),
  };
  m.gpssaEvent = {
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ev-1', ...data })),
  };
  m.$transaction = vi
    .fn()
    .mockImplementation(async (fn: any) => (typeof fn === 'function' ? fn(m) : Promise.all(fn)));
});

describe('seed integrity', () => {
  it('applicable classes exclude expats', () => {
    expect(APPLICABLE_CLASSES).toEqual(['UAE_NATIONAL', 'GCC_NATIONAL_OTHER']);
  });

  it('UAE national seed rate is 12.5% employer + 5% employee + 2.5% government', () => {
    const uae = GPSSA_RATE_SEEDS.find((r) => r.nationalityClass === 'UAE_NATIONAL')!;
    expect(uae.employerPct).toBe(12.5);
    expect(uae.employeePct).toBe(5);
    expect(uae.governmentPct).toBe(2.5);
  });

  it('other GCC nationals: no government share', () => {
    const gcc = GPSSA_RATE_SEEDS.find((r) => r.nationalityClass === 'GCC_NATIONAL_OTHER')!;
    expect(gcc.governmentPct).toBe(0);
  });
});

describe('gpssaConfigService', () => {
  it('validates GPSSA number format', () => {
    expect(gpssaConfigService.validateGpssaNumber('123456')).toBe(true);
    expect(gpssaConfigService.validateGpssaNumber('abc')).toBe(false);
  });

  it('createEstablishment refuses invalid number', async () => {
    await expect(
      gpssaConfigService.createEstablishment(
        { gpssaNumber: 'ABC', establishmentName: 'Demo' },
        auth
      )
    ).rejects.toThrow(/digits/);
  });
});

describe('gpssaRegistrationService.register', () => {
  it('refuses to register expats (not applicable to GPSSA)', async () => {
    await expect(
      gpssaRegistrationService.register(
        { employeeId: 'e1', establishmentId: 'est-1', nationalityClass: 'EXPAT' as any },
        auth
      )
    ).rejects.toThrow(/not eligible/);
  });

  it('emiratisationEvidenceCount queries only active UAE_NATIONAL', async () => {
    m.gpssaEmployeeRegistration.count.mockResolvedValue(7);
    const n = await gpssaRegistrationService.emiratisationEvidenceCount('tenant-1');
    expect(n).toBe(7);
    expect(m.gpssaEmployeeRegistration.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE', nationalityClass: 'UAE_NATIONAL' }),
      })
    );
  });

  it('transfer preserves service months and rebinds establishment', async () => {
    await gpssaRegistrationService.transfer(
      {
        employeeId: 'e1',
        fromEstablishmentId: 'est-A',
        toEstablishmentId: 'est-B',
        transferDate: new Date('2026-06-01'),
        serviceMonthsPreserved: 36,
      },
      auth
    );
    expect(m.gpssaTransfer.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ serviceMonthsPreserved: 36 }),
      })
    );
    expect(m.gpssaEmployeeRegistration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ establishmentId: 'est-B' }),
      })
    );
  });
});

describe('gpssaCalculationService.computeContribution', () => {
  it('UAE national: employer 12.5% + employee 5% + government 2.5%', async () => {
    m.gpssaEmployeeRegistration.findUnique.mockResolvedValue({
      employeeId: 'e1',
      establishmentId: 'est-1',
      status: 'ACTIVE',
      nationalityClass: 'UAE_NATIONAL',
    });
    m.gpssaContributionWage.findUnique.mockResolvedValue({ contributionWage: 20000 });
    m.gpssaContributionRate.findMany.mockResolvedValue([
      {
        id: 'r-1',
        employerPct: 12.5,
        employeePct: 5,
        governmentPct: 2.5,
        wageFloor: null,
        wageCeiling: null,
      },
    ]);
    const c = await gpssaCalculationService.computeContribution(
      { employeeId: 'e1', period: '2026-06' },
      auth
    );
    expect(c.employerAmount).toBe(2500); // 20000 * 12.5%
    expect(c.employeeAmount).toBe(1000); // 20000 * 5%
    expect(c.governmentAmount).toBe(500); // 20000 * 2.5%
  });

  it('applies wage ceiling clamp', async () => {
    m.gpssaEmployeeRegistration.findUnique.mockResolvedValue({
      employeeId: 'e1',
      establishmentId: 'est-1',
      status: 'ACTIVE',
      nationalityClass: 'UAE_NATIONAL',
    });
    m.gpssaContributionWage.findUnique.mockResolvedValue({ contributionWage: 100000 });
    m.gpssaContributionRate.findMany.mockResolvedValue([
      {
        id: 'r-1',
        employerPct: 12.5,
        employeePct: 5,
        governmentPct: 2.5,
        wageFloor: 1000,
        wageCeiling: 50000,
      },
    ]);
    const c = await gpssaCalculationService.computeContribution(
      { employeeId: 'e1', period: '2026-06' },
      auth
    );
    expect(c.contributionWage).toBe(50000);
    expect(c.employerAmount).toBe(6250); // 50000 * 12.5%
  });

  it('refuses to compute when no rate is configured', async () => {
    m.gpssaEmployeeRegistration.findUnique.mockResolvedValue({
      employeeId: 'e1',
      establishmentId: 'est-1',
      status: 'ACTIVE',
      nationalityClass: 'UAE_NATIONAL',
    });
    m.gpssaContributionWage.findUnique.mockResolvedValue({ contributionWage: 1000 });
    m.gpssaContributionRate.findMany.mockResolvedValue([]);
    await expect(
      gpssaCalculationService.computeContribution({ employeeId: 'e1', period: '2026-06' }, auth)
    ).rejects.toThrow(/no GPSSA rate/);
  });
});

describe('gpssaReconciliationService', () => {
  it('raises AMOUNT_DIFFERENCE when payroll != gpssa', async () => {
    m.gpssaContribution.findMany.mockResolvedValue([{ employeeId: 'e1', employeeAmount: 1000 }]);
    const r = await gpssaReconciliationService.reconcile(
      {
        establishmentId: 'est-1',
        period: '2026-06',
        payrollRows: [{ employeeId: 'e1', payrollContribution: 1200 }],
      },
      auth
    );
    expect(r.variances).toBe(1);
    expect(m.gpssaVariance.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'AMOUNT_DIFFERENCE' }) })
    );
  });

  it('raises GPSSA_MISSING when payroll deducts without GPSSA', async () => {
    m.gpssaContribution.findMany.mockResolvedValue([]);
    const r = await gpssaReconciliationService.reconcile(
      {
        establishmentId: 'est-1',
        period: '2026-06',
        payrollRows: [{ employeeId: 'e1', payrollContribution: 1000 }],
      },
      auth
    );
    expect(r.variances).toBe(1);
    expect(m.gpssaVariance.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'GPSSA_MISSING' }) })
    );
  });
});

describe('gpssaProcessService.submit', () => {
  it('refuses to submit unless DRAFT or VALIDATED', async () => {
    m.gpssaPeriodSubmission.findUnique.mockResolvedValue({ id: 's-1', status: 'SUBMITTED' });
    await expect(gpssaProcessService.submit('s-1', new Date(), auth)).rejects.toThrow(
      /cannot be submitted/
    );
  });
});

describe('gpssaCertificateService', () => {
  it('generate sets gating reason when critical variances > 0', async () => {
    m.gpssaPeriodSubmission.findMany.mockResolvedValue([]);
    m.gpssaVariance.count.mockImplementation(async ({ where }: any) =>
      where.severity === 'CRITICAL' ? 1 : 0
    );
    const c = await gpssaCertificateService.generate('2026-06', auth);
    expect(c.gatingReason).toMatch(/critical variance/);
  });

  it('sign refuses while gated', async () => {
    m.gpssaCertificate.findUnique.mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked' });
    await expect(gpssaCertificateService.sign('2026-06', [], auth)).rejects.toThrow(/gated/);
  });
});
