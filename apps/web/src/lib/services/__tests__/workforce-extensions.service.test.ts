import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@aura/database';
import {
  contractorAssignmentService,
  employeeLoanService,
  uniformPpeIssuanceService,
  accommodationTransportRouteService,
  accommodationClinicService,
  accommodationMaintenanceService,
  equalInstallment,
} from '../workforce-extensions';
import { DEFAULT_CATALOGUE } from '../benefits-compliance';

const prismaMock = prisma as any;
const auth = { tenantId: 'tenant-1', userId: 'user-1' };

beforeEach(() => {
  prismaMock.contractorAssignment = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'c-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'c-1', ...data })),
  };
  prismaMock.employeeLoanSchedule = {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'l-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'l-1', ...data })),
  };
  prismaMock.uniformPpeIssuance = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'u-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'u-1', ...data })),
  };
  prismaMock.accommodationTransportRoute = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 't-1', ...create })),
  };
  prismaMock.accommodationClinic = {
    findMany: vi.fn().mockResolvedValue([]),
    upsert: vi.fn().mockImplementation(async ({ create }: any) => ({ id: 'cl-1', ...create })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'cl-1', ...data })),
  };
  prismaMock.accommodationMaintenanceTicket = {
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'm-1', ...data })),
    update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'm-1', ...data })),
    count: vi.fn().mockResolvedValue(0),
  };
});

describe('Theme E — ContractorAssignmentService', () => {
  it('rejects endDate before startDate', async () => {
    await expect(
      contractorAssignmentService.upsert(
        {
          subjectId: 's-1',
          subjectName: 'Sub',
          domain: 'ATTENDANCE',
          startDate: new Date('2026-09-01'),
          endDate: new Date('2026-08-01'),
        },
        auth
      )
    ).rejects.toThrow(/endDate cannot precede startDate/);
  });

  it('creates ACTIVE assignment for ATTENDANCE domain', async () => {
    const r = await contractorAssignmentService.upsert(
      {
        subjectId: 's-1',
        subjectName: 'Sub',
        domain: 'ATTENDANCE',
        startDate: new Date('2026-09-01'),
      },
      auth
    );
    expect(r.status).toBe('ACTIVE');
    expect(r.domain).toBe('ATTENDANCE');
  });
});

describe('Theme F — equalInstallment helper', () => {
  it('returns principal / n when rate is 0', () => {
    expect(equalInstallment(12000, 0, 12)).toBe(1000);
  });
  it('computes amortized payment for a positive rate', () => {
    const payment = equalInstallment(10000, 12, 12);
    // ~888.49 for 12% annual over 12 months
    expect(payment).toBeGreaterThan(888);
    expect(payment).toBeLessThan(889);
  });
  it('throws for non-positive installments', () => {
    expect(() => equalInstallment(1000, 5, 0)).toThrow();
  });
});

describe('Theme F — EmployeeLoanService', () => {
  it('rejects non-positive principal', async () => {
    await expect(
      employeeLoanService.create(
        {
          employeeId: 'e-1',
          loanCode: 'L-1',
          principal: 0,
          installments: 12,
          startDate: new Date(),
        },
        auth
      )
    ).rejects.toThrow(/principal/);
  });

  it('sets balance to principal on creation', async () => {
    const r = await employeeLoanService.create(
      {
        employeeId: 'e-1',
        loanCode: 'L-1',
        principal: 12000,
        installments: 12,
        startDate: new Date(),
      },
      auth
    );
    expect(r.balance).toBe(12000);
  });

  it('payment reduces balance and marks PAID_OFF when balance hits zero', async () => {
    prismaMock.employeeLoanSchedule.findUnique = vi.fn().mockResolvedValue({
      id: 'l-1',
      tenantId: 'tenant-1',
      balance: 500,
      status: 'ACTIVE',
    });
    const r = await employeeLoanService.recordPayment('l-1', 500, auth);
    expect(r.balance).toBe(0);
    expect(r.status).toBe('PAID_OFF');
  });
});

describe('Theme F — UniformPpeIssuanceService', () => {
  it('rejects non-positive quantity', async () => {
    await expect(
      uniformPpeIssuanceService.issue(
        { employeeId: 'e-1', itemCode: 'IT-1', itemLabel: 'Helmet', quantity: 0 },
        auth
      )
    ).rejects.toThrow(/quantity/);
  });

  it('records UNIFORM by default', async () => {
    const r = await uniformPpeIssuanceService.issue(
      { employeeId: 'e-1', itemCode: 'IT-1', itemLabel: 'Helmet' },
      auth
    );
    expect(r.category).toBe('UNIFORM');
    expect(r.quantity).toBe(1);
  });
});

describe('Theme F — BenefitCatalogue extended seeds', () => {
  it('includes EDUCATION_ASSISTANCE, EMPLOYEE_LOAN, RELOCATION_PACKAGE, UNIFORM_PPE_ISSUANCE, WELLNESS_EAP', () => {
    const codes = DEFAULT_CATALOGUE.map((c) => c.benefitCode);
    expect(codes).toContain('EDUCATION_ASSISTANCE');
    expect(codes).toContain('EMPLOYEE_LOAN');
    expect(codes).toContain('RELOCATION_PACKAGE');
    expect(codes).toContain('UNIFORM_PPE_ISSUANCE');
    expect(codes).toContain('WELLNESS_EAP');
  });
});

describe('Theme I — AccommodationMaintenanceService', () => {
  it('open sets SLA = 4h for CRITICAL severity', async () => {
    const before = Date.now();
    const r = await accommodationMaintenanceService.open(
      {
        siteId: 'site-1',
        ticketCode: 'T-1',
        category: 'PLUMBING',
        severity: 'CRITICAL',
        description: 'Pipe burst',
      },
      auth
    );
    const diff = (r.slaDueAt as Date).getTime() - before;
    expect(diff).toBeGreaterThan(4 * 3600 * 1000 - 1000);
    expect(diff).toBeLessThan(4 * 3600 * 1000 + 1000);
  });

  it('resolve sets RESOLVED status + resolvedAt', async () => {
    const r = await accommodationMaintenanceService.resolve('t-1', 'Fixed', auth);
    expect(r.status).toBe('RESOLVED');
    expect(r.resolvedAt).toBeInstanceOf(Date);
  });
});

describe('Theme I — AccommodationClinicService', () => {
  it('recordInspection updates lastInspectionAt + result', async () => {
    const r = await accommodationClinicService.recordInspection('cl-1', 'PASS', auth);
    expect(r.lastInspectionResult).toBe('PASS');
    expect(r.lastInspectionAt).toBeInstanceOf(Date);
  });
});

describe('Theme I — AccommodationTransportRouteService', () => {
  it('upsert sets isActive = true by default', async () => {
    const r = await accommodationTransportRouteService.upsert(
      {
        siteId: 'site-1',
        routeCode: 'R-1',
        label: 'Camp A → Site',
        capacity: 40,
      },
      auth
    );
    expect(r.isActive).toBe(true);
  });
});
