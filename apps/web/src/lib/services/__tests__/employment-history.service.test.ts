/**
 * EmploymentHistoryService — unit tests against the actual API.
 * Service does `new PrismaClient()` at module load, so mock the
 * class as a constructable function that returns a prepared mock.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// vi.mock is hoisted to the top of the file, so we cannot reference
// outer variables inside the factory. Build the mock inside the
// factory and import after.
vi.mock('@aura/database', () => {
  const make = () => ({
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    groupBy: vi.fn(),
  });
  const mockPrisma = {
    employmentHistory: make(),
    employee: make(),
  };
  return {
    prisma: mockPrisma,
    PrismaClient: class {
      constructor() {
        Object.assign(this, mockPrisma);
      }
    },
  };
});

import { EmploymentHistoryService } from '../employment-history.service';
import { prisma as mockPrisma } from '@aura/database';

const TENANT_A = 'tenant-A';
const TENANT_B = 'tenant-B';

const baseRecord: any = {
  id: 'rec-1',
  tenantId: TENANT_A,
  employeeId: 'emp-1',
  changeType: 'PROMOTION',
  status: 'ACTIVE',
  effectiveDate: new Date('2026-01-15'),
  newJobProfileId: 'jp-2',
  newGradeId: 'g-2',
};

describe('EmploymentHistoryService.findAll', () => {
  beforeEach(() => vi.clearAllMocks());

  it('filters by tenant + employee + changeType', async () => {
    mockPrisma.employmentHistory.count.mockResolvedValue(0 as any);
    mockPrisma.employmentHistory.findMany.mockResolvedValue([] as any);

    await EmploymentHistoryService.findAll({
      tenantId: TENANT_A,
      employeeId: 'emp-1',
      changeType: 'PROMOTION',
    } as any);

    const where = (mockPrisma.employmentHistory.findMany as any).mock.calls[0][0].where;
    expect(where.tenantId).toBe(TENANT_A);
    expect(where.employeeId).toBe('emp-1');
    expect(where.changeType).toBe('PROMOTION');
  });

  it('builds effectiveDate range from startDate + endDate', async () => {
    mockPrisma.employmentHistory.count.mockResolvedValue(0 as any);
    mockPrisma.employmentHistory.findMany.mockResolvedValue([] as any);

    await EmploymentHistoryService.findAll({
      tenantId: TENANT_A,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    } as any);

    const where = (mockPrisma.employmentHistory.findMany as any).mock.calls[0][0].where;
    expect(where.effectiveDate.gte).toEqual(new Date('2026-01-01'));
    expect(where.effectiveDate.lte).toEqual(new Date('2026-12-31'));
  });

  it('paginates with default ordering effectiveDate desc', async () => {
    mockPrisma.employmentHistory.count.mockResolvedValue(50 as any);
    mockPrisma.employmentHistory.findMany.mockResolvedValue([] as any);

    const result = await EmploymentHistoryService.findAll({
      tenantId: TENANT_A,
      page: 2,
      limit: 10,
    } as any);

    expect(result.pagination.total).toBe(50);
    expect(result.pagination.totalPages).toBe(5);
    expect(mockPrisma.employmentHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10, orderBy: { effectiveDate: 'desc' } })
    );
  });
});

describe('EmploymentHistoryService.findById — tenant isolation', () => {
  beforeEach(() => vi.clearAllMocks());

  it('scopes by tenantId + id', async () => {
    mockPrisma.employmentHistory.findFirst.mockResolvedValue(baseRecord as any);

    await EmploymentHistoryService.findById('rec-1', TENANT_A);

    expect(mockPrisma.employmentHistory.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'rec-1', tenantId: TENANT_A } })
    );
  });

  it('returns null when tenant mismatch', async () => {
    mockPrisma.employmentHistory.findFirst.mockResolvedValue(null as any);

    const result = await EmploymentHistoryService.findById('rec-1', TENANT_B);
    expect(result).toBeNull();
  });
});

describe('EmploymentHistoryService.getEmployeeTimeline', () => {
  beforeEach(() => vi.clearAllMocks());

  it('queries records for the employee in tenant', async () => {
    mockPrisma.employmentHistory.findMany.mockResolvedValue([baseRecord] as any);

    await EmploymentHistoryService.getEmployeeTimeline('emp-1', TENANT_A);

    const where = (mockPrisma.employmentHistory.findMany as any).mock.calls[0][0].where;
    expect(where.employeeId).toBe('emp-1');
    expect(where.tenantId).toBe(TENANT_A);
  });
});

describe('EmploymentHistoryService.delete', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when record not found', async () => {
    mockPrisma.employmentHistory.findFirst.mockResolvedValue(null as any);

    await expect(
      EmploymentHistoryService.delete('missing', TENANT_A)
    ).rejects.toThrow();
  });
});
