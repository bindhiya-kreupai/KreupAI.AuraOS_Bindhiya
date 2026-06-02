import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PositionService } from '../position.service';
import { positionService } from '../position.service';
import { prisma } from '@/lib/database';

// Mock Prisma
vi.mock('@/lib/database', () => ({
  prisma: {
    jobProfile: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    jobFamily: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    jobFunction: {
      findMany: vi.fn(),
    },
    grade: {
      findUnique: vi.fn(),
    },
  },
}));

describe('PositionService', () => {
  let service: PositionService;

  // Mock data fixtures
  const mockFunction = {
    id: 'func-1',
    code: 'ENG',
    name: 'Engineering',
  };

  const mockFamily = {
    id: 'family-1',
    code: 'SW-ENG',
    name: 'Software Engineering',
    functionId: 'func-1',
    function: mockFunction,
  };

  const mockGrade = {
    id: 'grade-1',
    code: 'L4',
    name: 'Senior Engineer',
    level: 4,
  };

  const mockPosition = {
    id: 'pos-1',
    code: 'SE-001',
    title: 'Senior Software Engineer',
    description: 'Develops complex software systems',
    familyId: 'family-1',
    gradeId: 'grade-1',
    status: 'Active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    family: mockFamily,
    grade: mockGrade,
    _count: { employees: 10 },
  };

  const mockPosition2 = {
    id: 'pos-2',
    code: 'SE-002',
    title: 'Software Engineer',
    description: 'Develops software systems',
    familyId: 'family-1',
    gradeId: 'grade-2',
    status: 'Active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    family: mockFamily,
    grade: { id: 'grade-2', code: 'L3', name: 'Mid Engineer', level: 3 },
    _count: { employees: 15 },
  };

  beforeEach(() => {
    service = positionService;
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated positions with default parameters', async () => {
      const mockPositions = [mockPosition, mockPosition2];
      vi.mocked(prisma.jobProfile.count).mockResolvedValue(2);
      vi.mocked(prisma.jobProfile.findMany).mockResolvedValue(mockPositions as any);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
      expect(prisma.jobProfile.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 20,
        orderBy: { title: 'asc' },
        include: expect.any(Object),
      });
    });

    it('should filter positions by family ID', async () => {
      vi.mocked(prisma.jobProfile.count).mockResolvedValue(1);
      vi.mocked(prisma.jobProfile.findMany).mockResolvedValue([mockPosition] as any);

      await service.findAll({ familyId: 'family-1' });

      expect(prisma.jobProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { familyId: 'family-1' },
        })
      );
    });

    it('should filter positions by grade ID', async () => {
      vi.mocked(prisma.jobProfile.count).mockResolvedValue(1);
      vi.mocked(prisma.jobProfile.findMany).mockResolvedValue([mockPosition] as any);

      await service.findAll({ gradeId: 'grade-1' });

      expect(prisma.jobProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { gradeId: 'grade-1' },
        })
      );
    });

    it('should filter positions by status', async () => {
      vi.mocked(prisma.jobProfile.count).mockResolvedValue(2);
      vi.mocked(prisma.jobProfile.findMany).mockResolvedValue([mockPosition, mockPosition2] as any);

      await service.findAll({ status: 'Active' });

      expect(prisma.jobProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'Active' },
        })
      );
    });

    it('should search positions by title, code, or description', async () => {
      vi.mocked(prisma.jobProfile.count).mockResolvedValue(1);
      vi.mocked(prisma.jobProfile.findMany).mockResolvedValue([mockPosition] as any);

      await service.findAll({ search: 'Senior' });

      expect(prisma.jobProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'Senior', mode: 'insensitive' } },
              { code: { contains: 'Senior', mode: 'insensitive' } },
              { description: { contains: 'Senior', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    it('should support pagination with custom page and limit', async () => {
      vi.mocked(prisma.jobProfile.count).mockResolvedValue(100);
      vi.mocked(prisma.jobProfile.findMany).mockResolvedValue([mockPosition] as any);

      const result = await service.findAll({ page: 3, limit: 15 });

      expect(result.pagination).toEqual({
        page: 3,
        limit: 15,
        total: 100,
        totalPages: 7,
      });
      expect(prisma.jobProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 30,
          take: 15,
        })
      );
    });

    it('should support sorting by field and order', async () => {
      vi.mocked(prisma.jobProfile.count).mockResolvedValue(2);
      vi.mocked(prisma.jobProfile.findMany).mockResolvedValue([mockPosition] as any);

      await service.findAll({ sortBy: 'code', sortOrder: 'desc' });

      expect(prisma.jobProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { code: 'desc' },
        })
      );
    });

    it('should combine multiple filters', async () => {
      vi.mocked(prisma.jobProfile.count).mockResolvedValue(1);
      vi.mocked(prisma.jobProfile.findMany).mockResolvedValue([mockPosition] as any);

      await service.findAll({
        familyId: 'family-1',
        gradeId: 'grade-1',
        status: 'Active',
        search: 'Engineer',
      });

      expect(prisma.jobProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            familyId: 'family-1',
            gradeId: 'grade-1',
            status: 'Active',
            OR: [
              { title: { contains: 'Engineer', mode: 'insensitive' } },
              { code: { contains: 'Engineer', mode: 'insensitive' } },
              { description: { contains: 'Engineer', mode: 'insensitive' } },
            ],
          },
        })
      );
    });
  });

  describe('findById', () => {
    it('should find position by ID with all relations', async () => {
      const positionWithEmployees = {
        ...mockPosition,
        employees: [
          {
            id: 'emp-1',
            employeeCode: 'EMP001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@company.com',
            department: { name: 'Engineering' },
          },
        ],
      };
      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(positionWithEmployees as any);

      const result = await service.findById('pos-1');

      expect(result).toEqual(positionWithEmployees);
      expect(prisma.jobProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 'pos-1' },
        include: {
          family: {
            include: {
              function: true,
            },
          },
          grade: true,
          employees: expect.any(Object),
          _count: { select: { employees: true } },
        },
      });
    });

    it('should return null if position not found', async () => {
      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should find position by code', async () => {
      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(mockPosition as any);

      const result = await service.findByCode('SE-001');

      expect(result).toEqual(mockPosition);
      expect(prisma.jobProfile.findFirst).toHaveBeenCalledWith({
        where: { code: 'SE-001' },
        include: {
          family: true,
          grade: true,
        },
      });
    });

    it('should return null if code not found', async () => {
      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(null);

      const result = await service.findByCode('NON-EXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createDTO = {
      familyId: 'family-1',
      gradeId: 'grade-1',
      code: 'SE-001',
      title: 'Senior Software Engineer',
      description: 'Develops complex software systems',
    };

    it('should create a new position successfully', async () => {
      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(null); // No duplicate
      vi.mocked(prisma.jobFamily.findUnique).mockResolvedValue(mockFamily as any);
      vi.mocked(prisma.grade.findUnique).mockResolvedValue(mockGrade as any);
      vi.mocked(prisma.jobProfile.create).mockResolvedValue(mockPosition as any);

      const result = await service.create(createDTO);

      expect(result).toEqual(mockPosition);
      expect(prisma.jobProfile.create).toHaveBeenCalledWith({
        data: {
          ...createDTO,
          status: 'Active',
        },
        include: {
          family: expect.any(Object),
          grade: expect.any(Object),
        },
      });
    });

    it('should throw error if position code already exists', async () => {
      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(mockPosition as any);

      await expect(service.create(createDTO)).rejects.toThrow(
        'Position with this code already exists'
      );
    });

    it('should throw error if job family not found', async () => {
      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.jobFamily.findUnique).mockResolvedValue(null);

      await expect(service.create(createDTO)).rejects.toThrow('Job family not found');
    });

    it('should throw error if grade not found', async () => {
      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.jobFamily.findUnique).mockResolvedValue(mockFamily as any);
      vi.mocked(prisma.grade.findUnique).mockResolvedValue(null);

      await expect(service.create(createDTO)).rejects.toThrow('Grade not found');
    });

    it('should create position without grade', async () => {
      const dtoWithoutGrade = {
        familyId: 'family-1',
        code: 'SE-001',
        title: 'Senior Software Engineer',
      };

      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.jobFamily.findUnique).mockResolvedValue(mockFamily as any);
      vi.mocked(prisma.jobProfile.create).mockResolvedValue({
        ...mockPosition,
        gradeId: null,
        grade: null,
      } as any);

      const result = await service.create(dtoWithoutGrade);

      expect(result).toBeDefined();
      expect(prisma.grade.findUnique).not.toHaveBeenCalled();
    });

    it('should set default status to Active if not provided', async () => {
      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.jobFamily.findUnique).mockResolvedValue(mockFamily as any);
      vi.mocked(prisma.grade.findUnique).mockResolvedValue(mockGrade as any);
      vi.mocked(prisma.jobProfile.create).mockResolvedValue(mockPosition as any);

      await service.create(createDTO);

      expect(prisma.jobProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'Active',
          }),
        })
      );
    });

    it('should use provided status', async () => {
      const dtoWithStatus = { ...createDTO, status: 'Inactive' };

      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.jobFamily.findUnique).mockResolvedValue(mockFamily as any);
      vi.mocked(prisma.grade.findUnique).mockResolvedValue(mockGrade as any);
      vi.mocked(prisma.jobProfile.create).mockResolvedValue({
        ...mockPosition,
        status: 'Inactive',
      } as any);

      await service.create(dtoWithStatus);

      expect(prisma.jobProfile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'Inactive',
          }),
        })
      );
    });
  });

  describe('update', () => {
    const updateDTO = {
      title: 'Staff Software Engineer',
      code: 'SE-001-NEW',
    };

    it('should update position successfully', async () => {
      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(mockPosition as any);
      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(null); // No duplicate code
      vi.mocked(prisma.jobProfile.update).mockResolvedValue({
        ...mockPosition,
        ...updateDTO,
      } as any);

      const result = await service.update('pos-1', updateDTO);

      expect(result.title).toBe('Staff Software Engineer');
      expect(result.code).toBe('SE-001-NEW');
    });

    it('should throw error if position not found', async () => {
      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(null);

      await expect(service.update('non-existent', updateDTO)).rejects.toThrow(
        'Position not found'
      );
    });

    it('should allow updating without changing code', async () => {
      const updateWithoutCode = { title: 'Staff Software Engineer' };

      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(mockPosition as any);
      vi.mocked(prisma.jobProfile.update).mockResolvedValue({
        ...mockPosition,
        ...updateWithoutCode,
      } as any);

      const result = await service.update('pos-1', updateWithoutCode);

      expect(result.title).toBe('Staff Software Engineer');
      expect(result.code).toBe('SE-001'); // Original code unchanged
    });

    it('should throw error if new code already exists', async () => {
      const existingPosition = {
        id: 'pos-other',
        code: 'SE-001-NEW',
        title: 'Another Position',
      };

      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(mockPosition as any);
      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(existingPosition as any);

      await expect(service.update('pos-1', { code: 'SE-001-NEW' })).rejects.toThrow(
        'Position with this code already exists'
      );
    });

    it('should allow position to keep its own code', async () => {
      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(mockPosition as any);
      vi.mocked(prisma.jobProfile.findFirst).mockResolvedValue(mockPosition as any);
      vi.mocked(prisma.jobProfile.update).mockResolvedValue(mockPosition as any);

      const result = await service.update('pos-1', { code: 'SE-001' });

      expect(result).toEqual(mockPosition);
    });

    it('should validate family when updating', async () => {
      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(mockPosition as any);
      vi.mocked(prisma.jobFamily.findUnique).mockResolvedValue(null);

      await expect(
        service.update('pos-1', { familyId: 'non-existent' })
      ).rejects.toThrow('Job family not found');
    });

    it('should validate grade when updating', async () => {
      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(mockPosition as any);
      vi.mocked(prisma.grade.findUnique).mockResolvedValue(null);

      await expect(
        service.update('pos-1', { gradeId: 'non-existent' })
      ).rejects.toThrow('Grade not found');
    });

    it('should update with valid family and grade', async () => {
      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(mockPosition as any);
      vi.mocked(prisma.jobFamily.findUnique).mockResolvedValue(mockFamily as any);
      vi.mocked(prisma.grade.findUnique).mockResolvedValue(mockGrade as any);
      vi.mocked(prisma.jobProfile.update).mockResolvedValue(mockPosition as any);

      const result = await service.update('pos-1', {
        familyId: 'family-1',
        gradeId: 'grade-1',
      });

      expect(result).toEqual(mockPosition);
    });
  });

  describe('delete', () => {
    it('should soft delete position successfully', async () => {
      const positionWithNoEmployees = {
        ...mockPosition,
        _count: { employees: 0 },
      };

      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(positionWithNoEmployees as any);
      vi.mocked(prisma.jobProfile.update).mockResolvedValue({
        ...mockPosition,
        status: 'Inactive',
      } as any);

      await service.delete('pos-1');

      expect(prisma.jobProfile.update).toHaveBeenCalledWith({
        where: { id: 'pos-1' },
        data: { status: 'Inactive' },
      });
    });

    it('should throw error if position not found', async () => {
      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow('Position not found');
    });

    it('should throw error if position has active employees', async () => {
      const positionWithEmployees = {
        ...mockPosition,
        _count: { employees: 10 },
      };

      vi.mocked(prisma.jobProfile.findUnique).mockResolvedValue(positionWithEmployees as any);

      await expect(service.delete('pos-1')).rejects.toThrow(
        'Cannot delete position with active employees'
      );
    });
  });

  describe('getGroupedPositions', () => {
    it('should return positions grouped by function and family', async () => {
      const mockFunctions = [
        {
          id: 'func-1',
          code: 'ENG',
          name: 'Engineering',
          jobFamilies: [
            {
              id: 'family-1',
              code: 'SW-ENG',
              name: 'Software Engineering',
              jobProfiles: [
                {
                  id: 'pos-1',
                  code: 'SE-001',
                  title: 'Senior Software Engineer',
                  grade: { name: 'Senior Engineer', code: 'L4', level: 4 },
                  _count: { employees: 10 },
                },
                {
                  id: 'pos-2',
                  code: 'SE-002',
                  title: 'Software Engineer',
                  grade: { name: 'Mid Engineer', code: 'L3', level: 3 },
                  _count: { employees: 15 },
                },
              ],
            },
          ],
        },
      ];

      vi.mocked(prisma.jobFunction.findMany).mockResolvedValue(mockFunctions as any);

      const result = await service.getGroupedPositions();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'func-1',
        code: 'ENG',
        name: 'Engineering',
        families: [
          {
            id: 'family-1',
            code: 'SW-ENG',
            name: 'Software Engineering',
            positions: [
              {
                id: 'pos-1',
                code: 'SE-001',
                title: 'Senior Software Engineer',
                grade: 'Senior Engineer',
                gradeLevel: 4,
                employeeCount: 10,
              },
              {
                id: 'pos-2',
                code: 'SE-002',
                title: 'Software Engineer',
                grade: 'Mid Engineer',
                gradeLevel: 3,
                employeeCount: 15,
              },
            ],
          },
        ],
      });

      expect(prisma.jobFunction.findMany).toHaveBeenCalledWith({
        include: {
          jobFamilies: {
            include: {
              jobProfiles: {
                where: { status: 'Active' },
                include: expect.any(Object),
                orderBy: { title: 'asc' },
              },
            },
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array if no functions found', async () => {
      vi.mocked(prisma.jobFunction.findMany).mockResolvedValue([]);

      const result = await service.getGroupedPositions();

      expect(result).toEqual([]);
    });

    it('should only include active positions', async () => {
      vi.mocked(prisma.jobFunction.findMany).mockResolvedValue([] as any);

      await service.getGroupedPositions();

      expect(prisma.jobFunction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            jobFamilies: expect.objectContaining({
              include: expect.objectContaining({
                jobProfiles: expect.objectContaining({
                  where: { status: 'Active' },
                }),
              }),
            }),
          }),
        })
      );
    });
  });
});
