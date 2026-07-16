import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  BRANCH_APPLICABILITY,
  gosiCalculationService,
  gosiCertificateService,
  gosiConfigService,
  gosiProcessService,
  gosiReconciliationService,
  gosiRegistrationService,
  RATE_SEEDS,
} from '../gosi-compliance';

const m = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  m.employee = {
    findFirst: vi.fn().mockResolvedValue({
      id: 'emp-1',
      firstName: 'John',
      lastName: 'Doe',
      employeeCode: 'EMP0001',
      companyId: 'company-1',
      joiningDate: new Date('2020-01-01'),
      isDeleted: false,
      company: { id: 'company-1', name: 'Test Company', status: 'ACTIVE', tenantId: 'tenant-1' },
      status: { name: 'Active' },
    }),
    findMany: vi.fn().mockResolvedValue([
      {
        id: 'emp-1',
        firstName: 'John',
        lastName: 'Doe',
        employeeCode: 'EMP0001',
        companyId: 'company-1',
        joiningDate: new Date('2020-01-01'),
        isDeleted: false,
        company: { id: 'company-1', name: 'Test Company', status: 'ACTIVE', tenantId: 'tenant-1' },
        status: { name: 'Active' },
      },
    ]),
  };
  m.gccLegalEntity = {
    findFirst: vi.fn().mockResolvedValue({
      id: 'est-1',
      tenantId: 'tenant-1',
      companyId: 'company-1',
      countryCode: 'SA',
      legalName: 'Saudi Legal Entity',
      registrationRef: '7001234567',
      registrationType: 'GOSI',
      isActive: true,
      isDeleted: false,
    }),
    findMany: vi.fn().mockResolvedValue([
      {
        id: 'est-1',
        tenantId: 'tenant-1',
        companyId: 'company-1',
        countryCode: 'SA',
        legalName: 'Saudi Legal Entity',
        registrationRef: '7001234567',
        registrationType: 'GOSI',
        isActive: true,
        isDeleted: false,
      },
    ]),
  };
  m.tenant = {
    findUnique: vi.fn().mockResolvedValue({ id: 'tenant-1', status: 'ACTIVE' }),
  };
  m.employeeComplianceDetails = {
    findFirst: vi.fn().mockResolvedValue({
      id: 'comp-1',
      tenantId: 'tenant-1',
      employeeId: 'emp-1',
      nationality: 'SA',
      isDeleted: false,
    }),
  };
  m.gosiEstablishment = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'est-1', ...data })),
  };
  m.gosiBranchConfig = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'b-1', ...data })),
  };
  m.gosiContributionRate = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'r-1', ...data })),
  };
  m.gosiEmployeeRegistration = {
    findUnique: vi.fn().mockResolvedValue(null),
    findFirst: vi.fn().mockImplementation(async () => {
      const mockVal = await m.gosiEmployeeRegistration.findUnique();
      if (mockVal === null) return null;
      return (
        mockVal || {
          id: 'reg-1',
          employeeId: 'emp-1',
          establishmentId: 'est-1',
          status: 'ACTIVE',
          nationalityClass: 'SAUDI',
        }
      );
    }),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'reg-1', ...data })),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'reg-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'reg-1', ...data })),
  };
  m.gosiContributionWage = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'w-1', ...create })),
  };
  m.gosiContribution = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
  };
  m.gosiPeriodSubmission = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 's-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 's-1', ...data })),
  };
  m.gosiVariance = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'v-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'v-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
  m.gosiCertificate = {
    findUnique: vi.fn().mockResolvedValue(null),
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cert-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cert-1', ...data })),
  };
  m.gosiEvent = {
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'ev-1', ...data })),
  };
  m.$transaction = vi
    .fn()
    .mockImplementation(async (fn: any) => (typeof fn === 'function' ? fn(m) : Promise.all(fn)));
});

describe('seed integrity', () => {
  it('OH branch applies to all nationality classes; Annuities to Saudi only', () => {
    expect(BRANCH_APPLICABILITY.ANNUITIES).toEqual(['SAUDI']);
    expect(BRANCH_APPLICABILITY.OCCUPATIONAL_HAZARDS).toEqual([
      'SAUDI',
      'GCC_NATIONAL_OTHER',
      'EXPAT',
    ]);
  });

  it('Saudi Annuities seed rates are 9% employer + 9.75% employee', () => {
    const saudi = RATE_SEEDS.find(
      (r) => r.branch === 'ANNUITIES' && r.nationalityClass === 'SAUDI'
    )!;
    expect(Number(saudi.employerPct)).toBe(9);
    expect(Number(saudi.employeePct)).toBe(9.75);
  });

  it('OH rate for expats is 2% employer with no employee contribution', () => {
    const expat = RATE_SEEDS.find(
      (r) => r.branch === 'OCCUPATIONAL_HAZARDS' && r.nationalityClass === 'EXPAT'
    )!;
    expect(Number(expat.employerPct)).toBe(2);
    expect(Number(expat.employeePct)).toBe(0);
  });
});

describe('gosiConfigService', () => {
  it('rejects bad GOSI numbers', () => {
    expect(gosiConfigService.validateGosiNumber('abc')).toBe(false);
    expect(gosiConfigService.validateGosiNumber('1234')).toBe(false);
  });

  it('accepts 6–12 digit GOSI numbers', () => {
    expect(gosiConfigService.validateGosiNumber('123456')).toBe(true);
    expect(gosiConfigService.validateGosiNumber('123456789012')).toBe(true);
  });

  it('createEstablishment refuses invalid GOSI number', async () => {
    await expect(
      gosiConfigService.createEstablishment({ gosiNumber: 'ABC', establishmentName: 'Demo' }, auth)
    ).rejects.toThrow(/digits/);
  });

  it('resolveRate filters by branch + nationality + effectiveFrom <= asOf', async () => {
    m.gosiContributionRate.findMany.mockResolvedValue([
      { id: 'r-1', employerPct: 9, employeePct: 9.75 },
    ]);
    const r = await gosiConfigService.resolveRate('tenant-1', 'ANNUITIES', 'SAUDI');
    expect(r).toBeTruthy();
    expect(m.gosiContributionRate.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ branch: 'ANNUITIES', nationalityClass: 'SAUDI' }),
      })
    );
  });
});

describe('gosiCalculationService.recordContributionWage', () => {
  it('contributionWage = basic + housing + other', async () => {
    const row = await gosiCalculationService.recordContributionWage(
      {
        employeeId: 'emp-1',
        period: '2026-06',
        basicWage: 4000,
        housingAllowance: 1000,
        otherAllowances: 250,
      },
      auth
    );
    expect(row.contributionWage).toBe(5250);
  });
});

describe('gosiCalculationService.computeContribution', () => {
  it('refuses to compute when employee is not actively registered', async () => {
    m.gosiEmployeeRegistration.findUnique.mockResolvedValue(null);
    await expect(
      gosiCalculationService.computeContribution({ employeeId: 'emp-1', period: '2026-06' }, auth)
    ).rejects.toThrow(/not actively registered/);
  });

  it('Saudi national: annuities + OH applied; employee pct correct', async () => {
    m.gosiEmployeeRegistration.findUnique.mockResolvedValue({
      employeeId: 'emp-1',
      establishmentId: 'est-1',
      status: 'ACTIVE',
      nationalityClass: 'SAUDI',
    });
    m.gosiContributionWage.findUnique.mockResolvedValue({ contributionWage: 5000 });
    m.gosiContributionRate.findMany.mockImplementation(async ({ where }: any) => {
      if (where.branch === 'ANNUITIES')
        return [
          { id: 'ann', employerPct: 9, employeePct: 9.75, wageFloor: null, wageCeiling: null },
        ];
      return [{ id: 'oh', employerPct: 2, employeePct: 0, wageFloor: null, wageCeiling: null }];
    });
    const c = await gosiCalculationService.computeContribution(
      { employeeId: 'emp-1', period: '2026-06' },
      auth
    );
    // Annuities employer = 5000 * 9% = 450; OH employer = 5000 * 2% = 100
    expect(c.annuitiesEmployer).toBe(450);
    expect(c.ohEmployer).toBe(100);
    expect(c.totalEmployer).toBe(550);
    // Employee = 5000 * 9.75% = 487.5
    expect(Number(c.annuitiesEmployee)).toBeCloseTo(487.5);
    expect(c.totalEmployee).toBeCloseTo(487.5);
  });

  it('expat: only OH branch applies (no annuities)', async () => {
    m.gosiEmployeeRegistration.findUnique.mockResolvedValue({
      employeeId: 'emp-2',
      establishmentId: 'est-1',
      status: 'ACTIVE',
      nationalityClass: 'EXPAT',
    });
    m.gosiContributionWage.findUnique.mockResolvedValue({ contributionWage: 4000 });
    m.gosiContributionRate.findMany.mockImplementation(async ({ where }: any) => {
      if (where.branch === 'ANNUITIES') return []; // no annuities for expats
      return [{ id: 'oh', employerPct: 2, employeePct: 0, wageFloor: null, wageCeiling: null }];
    });
    const c = await gosiCalculationService.computeContribution(
      { employeeId: 'emp-2', period: '2026-06' },
      auth
    );
    expect(c.annuitiesEmployer).toBe(0);
    expect(c.ohEmployer).toBe(80); // 4000 * 2%
    expect(c.totalEmployer).toBe(80);
    expect(c.totalEmployee).toBe(0);
  });

  it('applies wage floor and ceiling clamps', async () => {
    m.gosiEmployeeRegistration.findUnique.mockResolvedValue({
      employeeId: 'emp-3',
      establishmentId: 'est-1',
      status: 'ACTIVE',
      nationalityClass: 'SAUDI',
    });
    m.gosiContributionWage.findUnique.mockResolvedValue({ contributionWage: 100000 });
    m.gosiContributionRate.findMany.mockImplementation(async ({ where }: any) => {
      if (where.branch === 'ANNUITIES')
        return [
          { id: 'ann', employerPct: 9, employeePct: 9.75, wageFloor: 1500, wageCeiling: 45000 },
        ];
      return [];
    });
    const c = await gosiCalculationService.computeContribution(
      { employeeId: 'emp-3', period: '2026-06' },
      auth
    );
    // Wage clamped to 45000 ceiling; employer = 45000 * 9% = 4050
    expect(c.annuitiesEmployer).toBe(4050);
  });
});

describe('gosiReconciliationService', () => {
  it('raises AMOUNT_DIFFERENCE variance when payroll != gosi', async () => {
    m.gosiContribution.findMany.mockResolvedValue([{ employeeId: 'emp-1', totalEmployee: 487.5 }]);
    const r = await gosiReconciliationService.reconcile(
      {
        establishmentId: 'est-1',
        period: '2026-06',
        payrollRows: [{ employeeId: 'emp-1', payrollContribution: 600 }],
      },
      auth
    );
    expect(r.variances).toBe(1);
    expect(m.gosiVariance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'AMOUNT_DIFFERENCE' }),
      })
    );
  });

  it('raises PAYROLL_MISSING when GOSI computed but no payroll row', async () => {
    m.gosiContribution.findMany.mockResolvedValue([{ employeeId: 'emp-1', totalEmployee: 100 }]);
    const r = await gosiReconciliationService.reconcile(
      { establishmentId: 'est-1', period: '2026-06', payrollRows: [] },
      auth
    );
    expect(r.variances).toBe(1);
    expect(m.gosiVariance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'PAYROLL_MISSING' }),
      })
    );
  });

  it('raises GOSI_MISSING when payroll deducts but no GOSI calc exists', async () => {
    m.gosiContribution.findMany.mockResolvedValue([]);
    const r = await gosiReconciliationService.reconcile(
      {
        establishmentId: 'est-1',
        period: '2026-06',
        payrollRows: [{ employeeId: 'emp-1', payrollContribution: 100 }],
      },
      auth
    );
    expect(r.variances).toBe(1);
    expect(m.gosiVariance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: 'GOSI_MISSING' }),
      })
    );
  });

  it('within tolerance differences do not raise variances', async () => {
    m.gosiContribution.findMany.mockResolvedValue([{ employeeId: 'emp-1', totalEmployee: 100 }]);
    const r = await gosiReconciliationService.reconcile(
      {
        establishmentId: 'est-1',
        period: '2026-06',
        payrollRows: [{ employeeId: 'emp-1', payrollContribution: 100.005 }],
        tolerance: 0.01,
      },
      auth
    );
    expect(r.variances).toBe(0);
  });
});

describe('gosiProcessService.submit', () => {
  it('refuses to submit unless status is DRAFT or VALIDATED', async () => {
    m.gosiPeriodSubmission.findUnique.mockResolvedValue({ id: 's-1', status: 'SUBMITTED' });
    await expect(gosiProcessService.submit('s-1', new Date(), auth)).rejects.toThrow(
      /cannot be submitted/
    );
  });
});

describe('gosiCertificateService', () => {
  it('generate sets gating reason when critical variances > 0', async () => {
    m.gosiPeriodSubmission.findMany.mockResolvedValue([]);
    m.gosiVariance.count.mockImplementation(async ({ where }: any) =>
      where.severity === 'CRITICAL' ? 1 : 0
    );
    const c = await gosiCertificateService.generate('2026-06', auth);
    expect(c.gatingReason).toMatch(/critical variance/);
  });

  it('sign refuses while gated', async () => {
    m.gosiCertificate.findUnique.mockResolvedValue({
      id: 'cert-1',
      gatingReason: 'Blocked: 1 critical variance(s) open',
    });
    await expect(gosiCertificateService.sign('2026-06', [], auth)).rejects.toThrow(/gated/);
  });
});

describe('gosiRegistrationService', () => {
  it('deregister sets status DEREGISTERED with reason', async () => {
    m.gosiEmployeeRegistration.findUnique.mockResolvedValue({
      id: 'reg-1',
      employeeId: 'emp-1',
      status: 'ACTIVE',
    });
    await gosiRegistrationService.deregister(
      'emp-1',
      { reason: 'Resignation', date: new Date('2026-06-30') },
      auth
    );
    expect(m.gosiEmployeeRegistration.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'DEREGISTERED',
          deregistrationReason: 'Resignation',
        }),
      })
    );
  });
});
