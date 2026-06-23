import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  sioCalculationService,
  sioCertificateService,
  sioConfigService,
  sioProcessService,
  sioReconciliationService,
  sioRegistrationService,
  SIO_BRANCH_APPLICABILITY,
  SIO_RATE_SEEDS,
} from '../sio-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.sioEstablishment = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'est-1', ...data })),
  };
  m.sioBranchConfig = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'b-1', ...data })),
  };
  m.sioContributionRate = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
  };
  m.sioEmployeeRegistration = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'reg-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'reg-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.sioContributionWage = {
    findUnique: vi.fn().mockResolvedValue(null),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'w-1', ...create })),
  };
  m.sioContribution = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
  };
  m.sioPeriodSubmission = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 's-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 's-1', ...data })),
  };
  m.sioVariance = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'v-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'v-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.sioCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
  m.sioEvent = {
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ev-1', ...data })),
  };
  m.$transaction = vi
    .fn()
    .mockImplementation(async (fn: any) => (typeof fn === 'function' ? fn(m) : Promise.all(fn)));
});

describe('seed integrity', () => {
  it('INSURANCE branch applies to Bahrainis only; UNEMPLOYMENT applies to all', () => {
    expect(SIO_BRANCH_APPLICABILITY.INSURANCE).toEqual(['BAHRAINI']);
    expect(SIO_BRANCH_APPLICABILITY.UNEMPLOYMENT).toEqual([
      'BAHRAINI',
      'GCC_NATIONAL_OTHER',
      'EXPAT',
    ]);
  });

  it('Bahraini insurance rate is 12% employer + 7% employee', () => {
    const ins = SIO_RATE_SEEDS.find(
      (r) => r.branch === 'INSURANCE' && r.nationalityClass === 'BAHRAINI'
    )!;
    expect(ins.employerPct).toBe(12);
    expect(ins.employeePct).toBe(7);
  });

  it('Unemployment rate is 1% employer + 1% employee for every class', () => {
    const unemp = SIO_RATE_SEEDS.filter((r) => r.branch === 'UNEMPLOYMENT');
    expect(unemp.length).toBe(3);
    unemp.forEach((r) => {
      expect(r.employerPct).toBe(1);
      expect(r.employeePct).toBe(1);
    });
  });
});

describe('sioConfigService', () => {
  it('validates SIO number format', () => {
    expect(sioConfigService.validateSioNumber('123456')).toBe(true);
    expect(sioConfigService.validateSioNumber('abc')).toBe(false);
  });
  it('createEstablishment refuses invalid number', async () => {
    await expect(
      sioConfigService.createEstablishment({ sioNumber: 'ABC', establishmentName: 'Demo' }, auth)
    ).rejects.toThrow(/digits/);
  });
});

describe('sioRegistrationService.bahrainizationEvidenceCount', () => {
  it('counts active Bahrainis only', async () => {
    m.sioEmployeeRegistration.count.mockResolvedValue(5);
    const n = await sioRegistrationService.bahrainizationEvidenceCount('tenant-1');
    expect(n).toBe(5);
    expect(m.sioEmployeeRegistration.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'ACTIVE', nationalityClass: 'BAHRAINI' }),
      })
    );
  });
});

describe('sioCalculationService.computeContribution', () => {
  it('Bahraini: both INSURANCE + UNEMPLOYMENT branches apply', async () => {
    m.sioEmployeeRegistration.findUnique.mockResolvedValue({
      employeeId: 'e1',
      establishmentId: 'est-1',
      status: 'ACTIVE',
      nationalityClass: 'BAHRAINI',
    });
    m.sioContributionWage.findUnique.mockResolvedValue({ contributionWage: 1000 });
    m.sioContributionRate.findMany.mockImplementation(async ({ where }: any) => {
      if (where.branch === 'INSURANCE')
        return [{ id: 'ins', employerPct: 12, employeePct: 7, wageFloor: null, wageCeiling: null }];
      return [{ id: 'unemp', employerPct: 1, employeePct: 1, wageFloor: null, wageCeiling: null }];
    });
    const c = await sioCalculationService.computeContribution(
      { employeeId: 'e1', period: '2026-06' },
      auth
    );
    // Insurance: 1000 * 12% = 120, * 7% = 70
    // Unemployment: 1000 * 1% = 10, * 1% = 10
    expect(c.insuranceEmployer).toBe(120);
    expect(c.insuranceEmployee).toBe(70);
    expect(c.unemploymentEmployer).toBe(10);
    expect(c.unemploymentEmployee).toBe(10);
    expect(c.totalEmployer).toBe(130);
    expect(c.totalEmployee).toBe(80);
  });

  it('expat: only UNEMPLOYMENT branch applies (no insurance)', async () => {
    m.sioEmployeeRegistration.findUnique.mockResolvedValue({
      employeeId: 'e2',
      establishmentId: 'est-1',
      status: 'ACTIVE',
      nationalityClass: 'EXPAT',
    });
    m.sioContributionWage.findUnique.mockResolvedValue({ contributionWage: 2000 });
    m.sioContributionRate.findMany.mockImplementation(async ({ where }: any) => {
      if (where.branch === 'INSURANCE') return []; // no insurance for expats
      return [{ id: 'unemp', employerPct: 1, employeePct: 1, wageFloor: null, wageCeiling: null }];
    });
    const c = await sioCalculationService.computeContribution(
      { employeeId: 'e2', period: '2026-06' },
      auth
    );
    expect(c.insuranceEmployer).toBe(0);
    expect(c.insuranceEmployee).toBe(0);
    expect(c.unemploymentEmployer).toBe(20);
    expect(c.unemploymentEmployee).toBe(20);
    expect(c.totalEmployer).toBe(20);
    expect(c.totalEmployee).toBe(20);
  });

  it('applies wage ceiling clamp on INSURANCE branch', async () => {
    m.sioEmployeeRegistration.findUnique.mockResolvedValue({
      employeeId: 'e3',
      establishmentId: 'est-1',
      status: 'ACTIVE',
      nationalityClass: 'BAHRAINI',
    });
    m.sioContributionWage.findUnique.mockResolvedValue({ contributionWage: 10000 });
    m.sioContributionRate.findMany.mockImplementation(async ({ where }: any) => {
      if (where.branch === 'INSURANCE')
        return [{ id: 'ins', employerPct: 12, employeePct: 7, wageFloor: 200, wageCeiling: 4000 }];
      return [];
    });
    const c = await sioCalculationService.computeContribution(
      { employeeId: 'e3', period: '2026-06' },
      auth
    );
    // Wage clamped to 4000; 4000 * 12% = 480
    expect(c.insuranceEmployer).toBe(480);
  });
});

describe('sioReconciliationService', () => {
  it('raises AMOUNT_DIFFERENCE when payroll != SIO', async () => {
    m.sioContribution.findMany.mockResolvedValue([{ employeeId: 'e1', totalEmployee: 80 }]);
    const r = await sioReconciliationService.reconcile(
      {
        establishmentId: 'est-1',
        period: '2026-06',
        payrollRows: [{ employeeId: 'e1', payrollContribution: 100 }],
      },
      auth
    );
    expect(r.variances).toBe(1);
    expect(m.sioVariance.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'AMOUNT_DIFFERENCE' }) })
    );
  });

  it('raises SIO_MISSING when payroll deducts but no SIO computed', async () => {
    m.sioContribution.findMany.mockResolvedValue([]);
    const r = await sioReconciliationService.reconcile(
      {
        establishmentId: 'est-1',
        period: '2026-06',
        payrollRows: [{ employeeId: 'e1', payrollContribution: 100 }],
      },
      auth
    );
    expect(r.variances).toBe(1);
    expect(m.sioVariance.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: 'SIO_MISSING' }) })
    );
  });
});

describe('sioProcessService.submit', () => {
  it('refuses to submit unless DRAFT or VALIDATED', async () => {
    m.sioPeriodSubmission.findUnique.mockResolvedValue({ id: 's-1', status: 'SUBMITTED' });
    await expect(sioProcessService.submit('s-1', new Date(), auth)).rejects.toThrow(
      /cannot be submitted/
    );
  });
});

describe('sioCertificateService', () => {
  it('generate sets gating when critical variances > 0', async () => {
    m.sioPeriodSubmission.findMany.mockResolvedValue([]);
    m.sioVariance.count.mockImplementation(async ({ where }: any) =>
      where.severity === 'CRITICAL' ? 1 : 0
    );
    const c = await sioCertificateService.generate('2026-06', auth);
    expect(c.gatingReason).toMatch(/critical variance/);
  });

  it('sign refuses while gated', async () => {
    m.sioCertificate.findUnique.mockResolvedValue({ id: 'c-1', gatingReason: 'Blocked' });
    await expect(sioCertificateService.sign('2026-06', [], auth)).rejects.toThrow(/gated/);
  });
});
