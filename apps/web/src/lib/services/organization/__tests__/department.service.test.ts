import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { DepartmentService } from '../department.service';
import { departmentService } from '../department.service';
import { prisma } from '@/lib/database';

// Mock Prisma
vi.mock('@/lib/database', () => ({
  prisma: {
    department: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('DepartmentService', () => {
  let service: DepartmentService;

  // Mock data fixtures
  const mockCompany = {
    id: 'company-1',
    name: 'Acme Corp',
    code: 'ACME',
  };

  const mockCostCenter = {
    id: 'cc-1',
    name: 'Engineering CC',
    code: 'ENG-CC',
  };

  const mockDepartment = {
    id: 'dept-1',
    companyId: 'company-1',
    code: 'ENG',
    name: 'Engineering',
    parentId: null,
    costCenterId: 'cc-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    company: mockCompany,
    parent: null,
    children: [],
    costCenter: mockCostCenter,
    _count: { employees: 5 },
  };

  const mockChildDepartment = {
    id: 'dept-2',
    companyId: 'company-1',
    code: 'ENG-FE',
    name: 'Frontend Engineering',
    parentId: 'dept-1',
    costCenterId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    company: mockCompany,
    parent: { id: 'dept-1', name: 'Engineering', code: 'ENG' },
    children: [],
    costCenter: null,
    _count: { employees: 3 },
  };

  beforeEach(() => {
    service = departmentService;
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated departments with default parameters', async () => {
      const mockDepartments = [mockDepartment, mockChildDepartment];
      vi.mocked(prisma.department.count).mockResolvedValue(2);
      vi.mocked(prisma.department.findMany).mockResolvedValue(mockDepartments as any);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
      expect(prisma.department.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: { name: 'asc' },
        include: expect.any(Object),
      });
    });

    it('should filter departments by company ID', async () => {
      vi.mocked(prisma.department.count).mockResolvedValue(1);
      vi.mocked(prisma.department.findMany).mockResolvedValue([mockDepartment] as any);

      await service.findAll({ companyId: 'company-1' });

      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'company-1' },
        })
      );
    });

    it('should filter departments by parent ID', async () => {
      vi.mocked(prisma.department.count).mockResolvedValue(1);
      vi.mocked(prisma.department.findMany).mockResolvedValue([mockChildDepartment] as any);

      await service.findAll({ parentId: 'dept-1' });

      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: 'dept-1' },
        })
      );
    });

    it('should get root departments when parentId is null', async () => {
      vi.mocked(prisma.department.count).mockResolvedValue(1);
      vi.mocked(prisma.department.findMany).mockResolvedValue([mockDepartment] as any);

      await service.findAll({ parentId: null });

      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: null },
        })
      );
    });

    it('should search departments by name or code', async () => {
      vi.mocked(prisma.department.count).mockResolvedValue(1);
      vi.mocked(prisma.department.findMany).mockResolvedValue([mockDepartment] as any);

      await service.findAll({ search: 'Engineering' });

      expect(prisma.department.findMany).toHaveBeenCalledWith(
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
      vi.mocked(prisma.department.count).mockResolvedValue(50);
      vi.mocked(prisma.department.findMany).mockResolvedValue([mockDepartment] as any);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
      });
      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should support sorting by field and order', async () => {
      vi.mocked(prisma.department.count).mockResolvedValue(2);
      vi.mocked(prisma.department.findMany).mockResolvedValue([mockDepartment] as any);

      await service.findAll({ sortBy: 'code', sortOrder: 'desc' });

      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { code: 'desc' },
        })
      );
    });

    it('should combine multiple filters', async () => {
      vi.mocked(prisma.department.count).mockResolvedValue(1);
      vi.mocked(prisma.department.findMany).mockResolvedValue([mockChildDepartment] as any);

      await service.findAll({
        companyId: 'company-1',
        parentId: 'dept-1',
        search: 'Frontend',
      });

      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            companyId: 'company-1',
            parentId: 'dept-1',
            OR: [
              { name: { contains: 'Frontend', mode: 'insensitive' } },
              { code: { contains: 'Frontend', mode: 'insensitive' } },
            ],
          },
        })
      );
    });
  });

  describe('findById', () => {
    it('should find department by ID with all relations', async () => {
      const departmentWithEmployees = {
        ...mockDepartment,
        employees: [
          {
            id: 'emp-1',
            employeeCode: 'EMP001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@company.com',
            jobProfile: { title: 'Software Engineer' },
          },
        ],
      };
      vi.mocked(prisma.department.findUnique).mockResolvedValue(departmentWithEmployees as any);

      const result = await service.findById('dept-1');

      expect(result).toEqual(departmentWithEmployees);
      expect(prisma.department.findUnique).toHaveBeenCalledWith({
        where: { id: 'dept-1' },
        include: {
          company: true,
          parent: true,
          children: { orderBy: { name: 'asc' } },
          costCenter: true,
          employees: expect.any(Object),
          _count: { select: { employees: true } },
        },
      });
    });

    it('should return null if department not found', async () => {
      vi.mocked(prisma.department.findUnique).mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should find department by company ID and code', async () => {
      vi.mocked(prisma.department.findUnique).mockResolvedValue(mockDepartment as any);

      const result = await service.findByCode('company-1', 'ENG');

      expect(result).toEqual(mockDepartment);
      expect(prisma.department.findUnique).toHaveBeenCalledWith({
        where: {
          companyId_code: {
            companyId: 'company-1',
            code: 'ENG',
          },
        },
      });
    });

    it('should return null if code not found', async () => {
      vi.mocked(prisma.department.findUnique).mockResolvedValue(null);

      const result = await service.findByCode('company-1', 'NON-EXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createDTO = {
      companyId: 'company-1',
      code: 'ENG',
      name: 'Engineering',
      costCenterId: 'cc-1',
    };

    it('should create a new department successfully', async () => {
      vi.mocked(prisma.department.findUnique).mockResolvedValue(null); // No duplicate
      vi.mocked(prisma.department.create).mockResolvedValue(mockDepartment as any);

      const result = await service.create(createDTO);

      expect(result).toEqual(mockDepartment);
      expect(prisma.department.create).toHaveBeenCalledWith({
        data: createDTO,
        include: {
          company: { select: { id: true, name: true, code: true } },
          parent: { select: { id: true, name: true, code: true } },
          costCenter: { select: { id: true, name: true, code: true } },
        },
      });
    });

    it('should throw error if department code already exists in company', async () => {
      vi.mocked(prisma.department.findUnique).mockResolvedValue(mockDepartment as any);

      await expect(service.create(createDTO)).rejects.toThrow(
        'Department with this code already exists in this company'
      );
    });

    it('should create child department with valid parent', async () => {
      const childDTO = {
        companyId: 'company-1',
        code: 'ENG-FE',
        name: 'Frontend Engineering',
        parentId: 'dept-1',
      };

      vi.mocked(prisma.department.findUnique)
        .mockResolvedValueOnce(null) // No duplicate code
        .mockResolvedValueOnce(mockDepartment as any); // Valid parent

      vi.mocked(prisma.department.create).mockResolvedValue(mockChildDepartment as any);

      const result = await service.create(childDTO);

      expect(result).toEqual(mockChildDepartment);
    });

    it('should throw error if parent department not found', async () => {
      const childDTO = {
        companyId: 'company-1',
        code: 'ENG-FE',
        name: 'Frontend Engineering',
        parentId: 'non-existent',
      };

      vi.mocked(prisma.department.findUnique)
        .mockResolvedValueOnce(null) // No duplicate code
        .mockResolvedValueOnce(null); // Parent not found

      await expect(service.create(childDTO)).rejects.toThrow('Parent department not found');
    });

    it('should throw error if parent belongs to different company', async () => {
      const childDTO = {
        companyId: 'company-1',
        code: 'ENG-FE',
        name: 'Frontend Engineering',
        parentId: 'dept-other',
      };

      const differentCompanyParent = {
        ...mockDepartment,
        id: 'dept-other',
        companyId: 'company-2', // Different company
      };

      vi.mocked(prisma.department.findUnique)
        .mockResolvedValueOnce(null) // No duplicate code
        .mockResolvedValueOnce(differentCompanyParent as any); // Different company parent

      await expect(service.create(childDTO)).rejects.toThrow(
        'Parent department must belong to the same company'
      );
    });
  });

  describe('update', () => {
    const updateDTO = {
      name: 'Updated Engineering',
      code: 'ENG-NEW',
    };

    it('should update department successfully', async () => {
      vi.mocked(prisma.department.findUnique)
        .mockResolvedValueOnce(mockDepartment as any) // Current department
        .mockResolvedValueOnce(null); // No duplicate code

      vi.mocked(prisma.department.update).mockResolvedValue({
        ...mockDepartment,
        ...updateDTO,
      } as any);

      const result = await service.update('dept-1', updateDTO);

      expect(result.name).toBe('Updated Engineering');
      expect(result.code).toBe('ENG-NEW');
    });

    it('should throw error if department not found', async () => {
      vi.mocked(prisma.department.findUnique).mockResolvedValue(null);

      await expect(service.update('non-existent', updateDTO)).rejects.toThrow(
        'Department not found'
      );
    });

    it('should allow updating without changing code', async () => {
      const updateWithoutCode = { name: 'Updated Engineering' };

      vi.mocked(prisma.department.findUnique).mockResolvedValue(mockDepartment as any);
      vi.mocked(prisma.department.update).mockResolvedValue({
        ...mockDepartment,
        ...updateWithoutCode,
      } as any);

      const result = await service.update('dept-1', updateWithoutCode);

      expect(result.name).toBe('Updated Engineering');
      expect(result.code).toBe('ENG'); // Original code unchanged
    });

    it('should throw error if new code already exists in company', async () => {
      const existingDepartment = {
        id: 'dept-other',
        companyId: 'company-1',
        code: 'ENG-NEW',
        name: 'Another Department',
      };

      vi.mocked(prisma.department.findUnique)
        .mockResolvedValueOnce(mockDepartment as any) // Current department
        .mockResolvedValueOnce(existingDepartment as any); // Duplicate code found

      await expect(service.update('dept-1', { code: 'ENG-NEW' })).rejects.toThrow(
        'Department with this code already exists in this company'
      );
    });

    it('should allow department to keep its own code', async () => {
      vi.mocked(prisma.department.findUnique)
        .mockResolvedValueOnce(mockDepartment as any) // Current department
        .mockResolvedValueOnce(mockDepartment as any); // Same department found

      vi.mocked(prisma.department.update).mockResolvedValue(mockDepartment as any);

      const result = await service.update('dept-1', { code: 'ENG' });

      expect(result).toEqual(mockDepartment);
    });

    it('should throw error if department tries to be its own parent', async () => {
      vi.mocked(prisma.department.findUnique).mockResolvedValue(mockDepartment as any);

      await expect(service.update('dept-1', { parentId: 'dept-1' })).rejects.toThrow(
        'Department cannot be its own parent'
      );
    });

    it('should throw error if new parent not found', async () => {
      vi.mocked(prisma.department.findUnique)
        .mockResolvedValueOnce(mockDepartment as any) // Current department
        .mockResolvedValueOnce(null); // Parent not found

      await expect(service.update('dept-1', { parentId: 'non-existent' })).rejects.toThrow(
        'Parent department not found'
      );
    });

    it('should throw error if new parent belongs to different company', async () => {
      const differentCompanyParent = {
        id: 'dept-other',
        companyId: 'company-2',
        code: 'OTHER',
        name: 'Other Department',
      };

      vi.mocked(prisma.department.findUnique)
        .mockResolvedValueOnce(mockDepartment as any) // Current department
        .mockResolvedValueOnce(differentCompanyParent as any); // Different company

      await expect(service.update('dept-1', { parentId: 'dept-other' })).rejects.toThrow(
        'Parent department must belong to the same company'
      );
    });

    it('should detect circular reference when updating parent', async () => {
      // dept-1 -> dept-2 -> dept-3
      // Trying to set dept-1's parent to dept-3 would create a circle
      const grandchildDept = {
        id: 'dept-3',
        companyId: 'company-1',
        parentId: 'dept-2',
      };

      vi.mocked(prisma.department.findUnique)
        .mockResolvedValueOnce(mockDepartment as any) // Current dept (dept-1)
        .mockResolvedValueOnce(grandchildDept as any) // New parent (dept-3)
        .mockResolvedValueOnce(mockChildDepartment as any) // dept-3's parent (dept-2)
        .mockResolvedValueOnce(mockDepartment as any); // dept-2's parent (dept-1) - circular!

      await expect(service.update('dept-1', { parentId: 'dept-3' })).rejects.toThrow(
        'Circular reference detected'
      );
    });
  });

  describe('delete', () => {
    it('should delete department successfully', async () => {
      const emptyDepartment = {
        ...mockDepartment,
        _count: { employees: 0 },
        children: [],
      };

      vi.mocked(prisma.department.findUnique).mockResolvedValue(emptyDepartment as any);
      vi.mocked(prisma.department.delete).mockResolvedValue(mockDepartment as any);

      await service.delete('dept-1');

      expect(prisma.department.delete).toHaveBeenCalledWith({ where: { id: 'dept-1' } });
    });

    it('should throw error if department not found', async () => {
      vi.mocked(prisma.department.findUnique).mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow('Department not found');
    });

    it('should throw error if department has active employees', async () => {
      const departmentWithEmployees = {
        ...mockDepartment,
        _count: { employees: 5 },
        children: [],
      };

      vi.mocked(prisma.department.findUnique).mockResolvedValue(departmentWithEmployees as any);

      await expect(service.delete('dept-1')).rejects.toThrow(
        'Cannot delete department with active employees'
      );
    });

    it('should throw error if department has child departments', async () => {
      const departmentWithChildren = {
        ...mockDepartment,
        _count: { employees: 0 },
        children: [{ id: 'dept-2' }],
      };

      vi.mocked(prisma.department.findUnique).mockResolvedValue(departmentWithChildren as any);

      await expect(service.delete('dept-1')).rejects.toThrow(
        'Cannot delete department with child departments'
      );
    });
  });

  describe('getHierarchy', () => {
    it('should return department hierarchy tree', async () => {
      const mockHierarchy = [
        {
          ...mockDepartment,
          children: [
            {
              ...mockChildDepartment,
              children: [],
            },
          ],
        },
      ];

      vi.mocked(prisma.department.findMany).mockResolvedValue(mockHierarchy as any);

      const result = await service.getHierarchy('company-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'dept-1',
        code: 'ENG',
        name: 'Engineering',
        employeeCount: 5,
        children: [
          {
            id: 'dept-2',
            code: 'ENG-FE',
            name: 'Frontend Engineering',
            employeeCount: 3,
            children: [],
          },
        ],
      });

      expect(prisma.department.findMany).toHaveBeenCalledWith({
        where: {
          companyId: 'company-1',
          parentId: null,
        },
        include: expect.any(Object),
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array if no root departments found', async () => {
      vi.mocked(prisma.department.findMany).mockResolvedValue([]);

      const result = await service.getHierarchy('company-1');

      expect(result).toEqual([]);
    });

    it('should build tree with multiple levels', async () => {
      const level3Dept = {
        id: 'dept-3',
        code: 'ENG-FE-UI',
        name: 'UI Team',
        _count: { employees: 2 },
        children: [],
      };

      const mockDeepHierarchy = [
        {
          ...mockDepartment,
          children: [
            {
              ...mockChildDepartment,
              children: [level3Dept],
            },
          ],
        },
      ];

      vi.mocked(prisma.department.findMany).mockResolvedValue(mockDeepHierarchy as any);

      const result = await service.getHierarchy('company-1');

      expect(result[0].children[0].children).toHaveLength(1);
      expect(result[0].children[0].children[0]).toEqual({
        id: 'dept-3',
        code: 'ENG-FE-UI',
        name: 'UI Team',
        employeeCount: 2,
        children: [],
      });
    });
  });
});
