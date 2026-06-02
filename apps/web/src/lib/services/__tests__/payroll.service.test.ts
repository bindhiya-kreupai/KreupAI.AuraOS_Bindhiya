/**
 * PayrollService (root) — payroll run / salary structure / tax declaration tests.
 * Targets `src/lib/services/payroll.service.ts`.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@aura/database', () => {
  const make = () => ({
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  });
  return {
    prisma: {
      payrollRun: make(),
      employeeSalaryStructure: make(),
      taxDeclaration: make(),
      employeeBenefit: make(),
      payrollAdjustment: make(),
      payslip: make(),
      statutoryPayment: make(),
    },
  };
});

import { PayrollService } from '../payroll.service';
import { prisma } from '@aura/database';

const TENANT_A = 'tenant-A';
const TENANT_B = 'tenant-B';

describe('PayrollService.findAllRuns', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters by tenantId + status + paginates', async () => {
    (prisma.payrollRun.count as any).mockResolvedValue(0);
    (prisma.payrollRun.findMany as any).mockResolvedValue([]);

    await PayrollService.findAllRuns({
      tenantId: TENANT_A,
      status: 'DRAFT',
      page: 1,
      limit: 10,
    });

    const where = (prisma.payrollRun.findMany as any).mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.status).toBe('DRAFT');
  });

  it('computes pagination correctly', async () => {
    (prisma.payrollRun.count as any).mockResolvedValue(50);
    (prisma.payrollRun.findMany as any).mockResolvedValue([]);

    const result = await PayrollService.findAllRuns({
      tenantId: TENANT_A,
      page: 3,
      limit: 5,
    });

    expect(result.meta.total).toBe(50);
    expect(result.meta.totalPages).toBe(10);
    expect(prisma.payrollRun.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
  });
});

describe('PayrollService.findRunById — tenant isolation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes by tenantId + id', async () => {
    (prisma.payrollRun.findFirst as any).mockResolvedValue(null);

    await PayrollService.findRunById('run-1', TENANT_A);

    expect(prisma.payrollRun.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'run-1', tenantId: TENANT_A } })
    );
  });

  it('returns null for foreign tenant', async () => {
    (prisma.payrollRun.findFirst as any).mockResolvedValue(null);

    const result = await PayrollService.findRunById('run-1', TENANT_B);
    expect(result).toBeNull();
  });
});

describe('PayrollService.processPayroll', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sets status to CALCULATED and processedAt timestamp', async () => {
    (prisma.payrollRun.update as any).mockResolvedValue({});

    await PayrollService.processPayroll('run-1', TENANT_A);

    const update = (prisma.payrollRun.update as any).mock.calls[0][0].data;
    expect(update.status).toBe('CALCULATED');
    expect(update.processedAt).toBeInstanceOf(Date);
  });
});

describe('PayrollService.approveRun', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sets status to APPROVED with approvedBy + approvedAt', async () => {
    (prisma.payrollRun.update as any).mockResolvedValue({});

    await PayrollService.approveRun('run-1', TENANT_A, 'approver-1');

    const update = (prisma.payrollRun.update as any).mock.calls[0][0].data;
    expect(update.approvedBy).toBe('approver-1');
    expect(update.status).toBe('APPROVED');
    expect(update.approvedAt).toBeInstanceOf(Date);
  });
});

describe('PayrollService.getRunStatistics', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns counts per status (total, draft, processing, approved)', async () => {
    (prisma.payrollRun.count as any)
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(2) // DRAFT
      .mockResolvedValueOnce(3) // PROCESSING
      .mockResolvedValueOnce(4); // APPROVED

    const stats = await PayrollService.getRunStatistics(TENANT_A);

    expect(stats.total).toBe(10);
    expect(stats.draft).toBe(2);
    expect(stats.processing).toBe(3);
    expect(stats.approved).toBe(4);
  });
});

describe('PayrollService.findAllStructures', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters by tenant', async () => {
    (prisma.employeeSalaryStructure.count as any).mockResolvedValue(0);
    (prisma.employeeSalaryStructure.findMany as any).mockResolvedValue([]);

    await PayrollService.findAllStructures({ tenantId: TENANT_A });

    const where = (prisma.employeeSalaryStructure.findMany as any).mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
  });
});

describe('PayrollService.submitDeclaration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates status to SUBMITTED', async () => {
    (prisma.taxDeclaration.update as any).mockResolvedValue({});

    await PayrollService.submitDeclaration('decl-1', TENANT_A);

    const update = (prisma.taxDeclaration.update as any).mock.calls[0][0].data;
    expect(update.status).toBe('SUBMITTED');
    expect(update.submittedAt).toBeInstanceOf(Date);
  });
});

describe('PayrollService.verifyDeclaration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates status to VERIFIED with verifier', async () => {
    (prisma.taxDeclaration.update as any).mockResolvedValue({});

    await PayrollService.verifyDeclaration('decl-1', TENANT_A, 'verifier-1');

    const update = (prisma.taxDeclaration.update as any).mock.calls[0][0].data;
    expect(update.status).toBe('VERIFIED');
    expect(update.verifiedBy).toBe('verifier-1');
    expect(update.verifiedAt).toBeInstanceOf(Date);
  });
});

describe('PayrollService.findAllBenefits', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters by tenant + employeeId', async () => {
    (prisma.employeeBenefit.count as any).mockResolvedValue(0);
    (prisma.employeeBenefit.findMany as any).mockResolvedValue([]);

    await PayrollService.findAllBenefits({ tenantId: TENANT_A, employeeId: 'emp-1' });

    const where = (prisma.employeeBenefit.findMany as any).mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.employeeId).toBe('emp-1');
  });
});

describe('PayrollService.findAllAdjustments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters by tenant + employeeId + payrollMonth', async () => {
    (prisma.payrollAdjustment.count as any).mockResolvedValue(0);
    (prisma.payrollAdjustment.findMany as any).mockResolvedValue([]);

    await PayrollService.findAllAdjustments({
      tenantId: TENANT_A,
      employeeId: 'emp-1',
      payrollMonth: '2026-06',
    });

    const where = (prisma.payrollAdjustment.findMany as any).mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.employeeId).toBe('emp-1');
    expect(where.payrollMonth).toBe('2026-06');
  });
});
