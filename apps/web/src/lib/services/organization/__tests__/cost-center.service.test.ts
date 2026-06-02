import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CostCenterService } from '../cost-center.service';
import { costCenterService } from '../cost-center.service';
import { prisma } from '@/lib/database';

// Mock Prisma
vi.mock('@/lib/database', () => ({
  prisma: {
    costCenter: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('CostCenterService', () => {
  let service: CostCenterService;

  // Mock data fixtures
  const mockDepartment = {
    id: 'dept-1',
    code: 'ENG',
    name: 'Engineering',
    company: { id: 'company-1', name: 'Acme Corp', code: 'ACME' },
    _count: { employees: 25 },
  };

  const mockCostCenter = {
    id: 'cc-1',
    code: 'ENG-CC',
    name: 'Engineering Cost Center',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    departments: [mockDepartment],
  };

  const mockCostCenter2 = {
    id: 'cc-2',
    code: 'HR-CC',
    name: 'HR Cost Center',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    departments: [],
  };

  beforeEach(() => {
    service = costCenterService;
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated cost centers with default parameters', async () => {
      const mockCostCenters = [mockCostCenter, mockCostCenter2];
      vi.mocked(prisma.costCenter.count).mockResolvedValue(2);
      vi.mocked(prisma.costCenter.findMany).mockResolvedValue(mockCostCenters as any);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
      expect(prisma.costCenter.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: { name: 'asc' },
        include: {
          departments: expect.any(Object),
        },
      });
    });

    it('should search cost centers by name or code', async () => {
      vi.mocked(prisma.costCenter.count).mockResolvedValue(1);
      vi.mocked(prisma.costCenter.findMany).mockResolvedValue([mockCostCenter] as any);

      await service.findAll({ search: 'Engineering' });

      expect(prisma.costCenter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'Engineering', mode: 'insensitive' } },
              { code: { contains: 'Engineering', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    it('should support pagination with custom page and limit', async () => {
      vi.mocked(prisma.costCenter.count).mockResolvedValue(30);
      vi.mocked(prisma.costCenter.findMany).mockResolvedValue([mockCostCenter] as any);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 30,
        totalPages: 3,
      });
      expect(prisma.costCenter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should support sorting by field and order', async () => {
      vi.mocked(prisma.costCenter.count).mockResolvedValue(2);
      vi.mocked(prisma.costCenter.findMany).mockResolvedValue([mockCostCenter] as any);

      await service.findAll({ sortBy: 'code', sortOrder: 'desc' });

      expect(prisma.costCenter.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { code: 'desc' },
        })
      );
    });

    it('should include departments with cost centers', async () => {
      vi.mocked(prisma.costCenter.count).mockResolvedValue(1);
      vi.mocked(prisma.costCenter.findMany).mockResolvedValue([mockCostCenter] as any);

      const result = await service.findAll({});

      expect(result.data[0].departments).toBeDefined();
      expect(result.data[0].departments).toHaveLength(1);
      expect(result.data[0].departments[0]).toEqual(mockDepartment);
    });
  });

  describe('findById', () => {
    it('should find cost center by ID with all relations', async () => {
      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(mockCostCenter as any);

      const result = await service.findById('cc-1');

      expect(result).toEqual(mockCostCenter);
      expect(prisma.costCenter.findUnique).toHaveBeenCalledWith({
        where: { id: 'cc-1' },
        include: {
          departments: {
            select: {
              id: true,
              code: true,
              name: true,
              company: { select: { id: true, name: true, code: true } },
              _count: { select: { employees: true } },
            },
            orderBy: { name: 'asc' },
          },
        },
      });
    });

    it('should return null if cost center not found', async () => {
      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should find cost center by code', async () => {
      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(mockCostCenter as any);

      const result = await service.findByCode('ENG-CC');

      expect(result).toEqual(mockCostCenter);
      expect(prisma.costCenter.findUnique).toHaveBeenCalledWith({
        where: { code: 'ENG-CC' },
        include: {
          departments: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      });
    });

    it('should return null if code not found', async () => {
      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(null);

      const result = await service.findByCode('NON-EXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createDTO = {
      code: 'ENG-CC',
      name: 'Engineering Cost Center',
    };

    it('should create a new cost center successfully', async () => {
      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(null); // No duplicate
      vi.mocked(prisma.costCenter.create).mockResolvedValue(mockCostCenter as any);

      const result = await service.create(createDTO);

      expect(result).toEqual(mockCostCenter);
      expect(prisma.costCenter.create).toHaveBeenCalledWith({
        data: createDTO,
        include: {
          departments: {
            select: {
              id: true,
              code: true,
              name: true,
              company: { select: { name: true } },
            },
          },
        },
      });
    });

    it('should throw error if cost center code already exists', async () => {
      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(mockCostCenter as any);

      await expect(service.create(createDTO)).rejects.toThrow(
        'Cost center with this code already exists'
      );
    });
  });

  describe('update', () => {
    const updateDTO = {
      name: 'Updated Engineering Cost Center',
      code: 'ENG-CC-NEW',
    };

    it('should update cost center successfully', async () => {
      vi.mocked(prisma.costCenter.findUnique)
        .mockResolvedValueOnce(mockCostCenter as any) // Current cost center
        .mockResolvedValueOnce(null); // No duplicate code

      vi.mocked(prisma.costCenter.update).mockResolvedValue({
        ...mockCostCenter,
        ...updateDTO,
      } as any);

      const result = await service.update('cc-1', updateDTO);

      expect(result.name).toBe('Updated Engineering Cost Center');
      expect(result.code).toBe('ENG-CC-NEW');
    });

    it('should throw error if cost center not found', async () => {
      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(null);

      await expect(service.update('non-existent', updateDTO)).rejects.toThrow(
        'Cost center not found'
      );
    });

    it('should allow updating without changing code', async () => {
      const updateWithoutCode = { name: 'Updated Engineering Cost Center' };

      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(mockCostCenter as any);
      vi.mocked(prisma.costCenter.update).mockResolvedValue({
        ...mockCostCenter,
        ...updateWithoutCode,
      } as any);

      const result = await service.update('cc-1', updateWithoutCode);

      expect(result.name).toBe('Updated Engineering Cost Center');
      expect(result.code).toBe('ENG-CC'); // Original code unchanged
    });

    it('should throw error if new code already exists', async () => {
      const existingCostCenter = {
        id: 'cc-other',
        code: 'ENG-CC-NEW',
        name: 'Another Cost Center',
      };

      vi.mocked(prisma.costCenter.findUnique)
        .mockResolvedValueOnce(mockCostCenter as any) // Current cost center
        .mockResolvedValueOnce(existingCostCenter as any); // Duplicate code found

      await expect(service.update('cc-1', { code: 'ENG-CC-NEW' })).rejects.toThrow(
        'Cost center with this code already exists'
      );
    });

    it('should allow cost center to keep its own code', async () => {
      vi.mocked(prisma.costCenter.findUnique)
        .mockResolvedValueOnce(mockCostCenter as any) // Current cost center
        .mockResolvedValueOnce(mockCostCenter as any); // Same cost center found

      vi.mocked(prisma.costCenter.update).mockResolvedValue(mockCostCenter as any);

      const result = await service.update('cc-1', { code: 'ENG-CC' });

      expect(result).toEqual(mockCostCenter);
    });
  });

  describe('delete', () => {
    it('should delete cost center successfully', async () => {
      const emptyCC = {
        ...mockCostCenter,
        departments: [],
      };

      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(emptyCC as any);
      vi.mocked(prisma.costCenter.delete).mockResolvedValue(mockCostCenter as any);

      await service.delete('cc-1');

      expect(prisma.costCenter.delete).toHaveBeenCalledWith({ where: { id: 'cc-1' } });
    });

    it('should throw error if cost center not found', async () => {
      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow('Cost center not found');
    });

    it('should throw error if cost center has assigned departments', async () => {
      const ccWithDepartments = {
        ...mockCostCenter,
        departments: [{ id: 'dept-1' }],
      };

      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(ccWithDepartments as any);

      await expect(service.delete('cc-1')).rejects.toThrow(
        'Cannot delete cost center with assigned departments'
      );
    });
  });

  describe('getSummary', () => {
    it('should return cost center summary with statistics', async () => {
      const ccWithMultipleDepts = {
        ...mockCostCenter,
        departments: [
          {
            id: 'dept-1',
            code: 'ENG',
            name: 'Engineering',
            company: { name: 'Acme Corp' },
            _count: { employees: 25 },
          },
          {
            id: 'dept-2',
            code: 'QA',
            name: 'Quality Assurance',
            company: { name: 'Acme Corp' },
            _count: { employees: 15 },
          },
        ],
      };

      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(ccWithMultipleDepts as any);

      const result = await service.getSummary('cc-1');

      expect(result).toEqual({
        id: 'cc-1',
        code: 'ENG-CC',
        name: 'Engineering Cost Center',
        stats: {
          totalDepartments: 2,
          totalEmployees: 40,
        },
        departments: [
          {
            id: 'dept-1',
            code: 'ENG',
            name: 'Engineering',
            company: 'Acme Corp',
            employeeCount: 25,
          },
          {
            id: 'dept-2',
            code: 'QA',
            name: 'Quality Assurance',
            company: 'Acme Corp',
            employeeCount: 15,
          },
        ],
      });
    });

    it('should return null if cost center not found', async () => {
      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(null);

      const result = await service.getSummary('non-existent');

      expect(result).toBeNull();
    });

    it('should handle cost center with no departments', async () => {
      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(mockCostCenter2 as any);

      const result = await service.getSummary('cc-2');

      expect(result).toEqual({
        id: 'cc-2',
        code: 'HR-CC',
        name: 'HR Cost Center',
        stats: {
          totalDepartments: 0,
          totalEmployees: 0,
        },
        departments: [],
      });
    });

    it('should handle departments with undefined employee count', async () => {
      const ccWithNoCounts = {
        ...mockCostCenter,
        departments: [
          {
            id: 'dept-1',
            code: 'ENG',
            name: 'Engineering',
            company: { name: 'Acme Corp' },
            _count: undefined,
          },
        ],
      };

      vi.mocked(prisma.costCenter.findUnique).mockResolvedValue(ccWithNoCounts as any);

      const result = await service.getSummary('cc-1');

      expect(result.stats.totalEmployees).toBe(0);
      expect(result.departments[0].employeeCount).toBe(0);
    });
  });
});
