import { prisma } from '@/lib/database';
import type { JobProfile, Prisma } from '@prisma/client';

export interface PositionFilterOptions {
  familyId?: string;
  gradeId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePositionDTO {
  familyId: string;
  gradeId?: string;
  code: string;
  title: string;
  description?: string;
  status?: string;
}

export interface UpdatePositionDTO {
  familyId?: string;
  gradeId?: string;
  code?: string;
  title?: string;
  description?: string;
  status?: string;
}

export class PositionService {
  /**
   * Find all positions with filtering and pagination
   */
  async findAll(
    filter: PositionFilterOptions
  ): Promise<PaginatedResult<JobProfile>> {
    const {
      familyId,
      gradeId,
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'title',
      sortOrder = 'asc',
    } = filter;

    // Build where clause
    const where: Prisma.JobProfileWhereInput = {};

    if (familyId) where.familyId = familyId;
    if (gradeId) where.gradeId = gradeId;
    if (status) where.status = status;

    // Search across multiple fields
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Count total records
    const total = await prisma.jobProfile.count({ where });

    // Fetch paginated data with relations
    const positions = await prisma.jobProfile.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            code: true,
            function: { select: { id: true, name: true, code: true } },
          },
        },
        grade: {
          select: { id: true, name: true, code: true, level: true },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    return {
      data: positions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find position by ID
   */
  async findById(id: string): Promise<JobProfile | null> {
    return prisma.jobProfile.findUnique({
      where: { id },
      include: {
        family: {
          include: {
            function: true,
          },
        },
        grade: true,
        employees: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            department: { select: { name: true } },
          },
          orderBy: { firstName: 'asc' },
        },
        _count: {
          select: { employees: true },
        },
      },
    });
  }

  /**
   * Find position by code
   */
  async findByCode(code: string): Promise<JobProfile | null> {
    return prisma.jobProfile.findFirst({
      where: { code },
      include: {
        family: true,
        grade: true,
      },
    });
  }

  /**
   * Create a new position
   */
  async create(data: CreatePositionDTO): Promise<JobProfile> {
    // Check for duplicate code
    const existing = await this.findByCode(data.code);
    if (existing) {
      throw new Error('Position with this code already exists');
    }

    // Validate family exists
    const family = await prisma.jobFamily.findUnique({
      where: { id: data.familyId },
    });

    if (!family) {
      throw new Error('Job family not found');
    }

    // Validate grade if provided
    if (data.gradeId) {
      const grade = await prisma.grade.findUnique({
        where: { id: data.gradeId },
      });

      if (!grade) {
        throw new Error('Grade not found');
      }
    }

    return prisma.jobProfile.create({
      data: {
        ...data,
        status: data.status || 'Active',
      },
      include: {
        family: {
          select: {
            id: true,
            name: true,
            code: true,
            function: { select: { id: true, name: true, code: true } },
          },
        },
        grade: {
          select: { id: true, name: true, code: true, level: true },
        },
      },
    });
  }

  /**
   * Update an existing position
   */
  async update(id: string, data: UpdatePositionDTO): Promise<JobProfile> {
    // Get current position
    const current = await prisma.jobProfile.findUnique({ where: { id } });
    if (!current) {
      throw new Error('Position not found');
    }

    // If code is being updated, check for duplicates
    if (data.code && data.code !== current.code) {
      const existing = await this.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new Error('Position with this code already exists');
      }
    }

    // Validate family if being updated
    if (data.familyId) {
      const family = await prisma.jobFamily.findUnique({
        where: { id: data.familyId },
      });

      if (!family) {
        throw new Error('Job family not found');
      }
    }

    // Validate grade if being updated
    if (data.gradeId) {
      const grade = await prisma.grade.findUnique({
        where: { id: data.gradeId },
      });

      if (!grade) {
        throw new Error('Grade not found');
      }
    }

    return prisma.jobProfile.update({
      where: { id },
      data,
      include: {
        family: {
          select: {
            id: true,
            name: true,
            code: true,
            function: { select: { id: true, name: true, code: true } },
          },
        },
        grade: {
          select: { id: true, name: true, code: true, level: true },
        },
      },
    });
  }

  /**
   * Delete a position (soft delete by setting status to Inactive)
   */
  async delete(id: string): Promise<void> {
    // Check if position has employees
    const position = await prisma.jobProfile.findUnique({
      where: { id },
      include: {
        _count: { select: { employees: true } },
      },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    if (position._count.employees > 0) {
      throw new Error('Cannot delete position with active employees');
    }

    // Soft delete by setting status to Inactive
    await prisma.jobProfile.update({
      where: { id },
      data: { status: 'Inactive' },
    });
  }

  /**
   * Get positions grouped by function and family
   */
  async getGroupedPositions(): Promise<any[]> {
    const functions = await prisma.jobFunction.findMany({
      include: {
        jobFamilies: {
          include: {
            jobProfiles: {
              where: { status: 'Active' },
              include: {
                grade: { select: { name: true, code: true, level: true } },
                _count: { select: { employees: true } },
              },
              orderBy: { title: 'asc' },
            },
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return functions.map((func) => ({
      id: func.id,
      code: func.code,
      name: func.name,
      families: func.jobFamilies.map((family) => ({
        id: family.id,
        code: family.code,
        name: family.name,
        positions: family.jobProfiles.map((profile) => ({
          id: profile.id,
          code: profile.code,
          title: profile.title,
          grade: profile.grade?.name,
          gradeLevel: profile.grade?.level,
          employeeCount: profile._count.employees,
        })),
      })),
    }));
  }
}

export const positionService = new PositionService();
