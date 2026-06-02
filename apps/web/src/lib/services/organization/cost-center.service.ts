import { prisma } from '@/lib/database';
import type { CostCenter, Prisma } from '@prisma/client';

export interface CostCenterFilterOptions {
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

export interface CreateCostCenterDTO {
  code: string;
  name: string;
}

export interface UpdateCostCenterDTO {
  code?: string;
  name?: string;
}

export class CostCenterService {
  /**
   * Find all cost centers with filtering and pagination
   */
  async findAll(
    filter: CostCenterFilterOptions
  ): Promise<PaginatedResult<CostCenter>> {
    const {
      search,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filter;

    // Build where clause
    const where: Prisma.CostCenterWhereInput = {};

    // Search across multiple fields
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Count total records
    const total = await prisma.costCenter.count({ where });

    // Fetch paginated data with relations
    const costCenters = await prisma.costCenter.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        departments: {
          select: {
            id: true,
            code: true,
            name: true,
            company: { select: { name: true } },
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    return {
      data: costCenters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find cost center by ID
   */
  async findById(id: string): Promise<any> {
    return prisma.costCenter.findUnique({
      where: { id },
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
  }

  /**
   * Find cost center by code
   */
  async findByCode(code: string): Promise<CostCenter | null> {
    return prisma.costCenter.findUnique({
      where: { code },
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
  }

  /**
   * Create a new cost center
   */
  async create(data: CreateCostCenterDTO): Promise<CostCenter> {
    // Check for duplicate code
    const existing = await this.findByCode(data.code);
    if (existing) {
      throw new Error('Cost center with this code already exists');
    }

    return prisma.costCenter.create({
      data,
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
  }

  /**
   * Update an existing cost center
   */
  async update(id: string, data: UpdateCostCenterDTO): Promise<CostCenter> {
    // Get current cost center
    const current = await prisma.costCenter.findUnique({ where: { id } });
    if (!current) {
      throw new Error('Cost center not found');
    }

    // If code is being updated, check for duplicates
    if (data.code && data.code !== current.code) {
      const existing = await this.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new Error('Cost center with this code already exists');
      }
    }

    return prisma.costCenter.update({
      where: { id },
      data,
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
  }

  /**
   * Delete a cost center
   */
  async delete(id: string): Promise<void> {
    // Check if cost center has departments
    const costCenter = await prisma.costCenter.findUnique({
      where: { id },
      include: {
        departments: { select: { id: true } },
      },
    });

    if (!costCenter) {
      throw new Error('Cost center not found');
    }

    if (costCenter.departments.length > 0) {
      throw new Error('Cannot delete cost center with assigned departments');
    }

    await prisma.costCenter.delete({ where: { id } });
  }

  /**
   * Get cost center with department summary
   */
  async getSummary(id: string): Promise<any> {
    const costCenter = await this.findById(id);
    if (!costCenter) return null;

    // Calculate total employees across all departments
    const totalEmployees = costCenter.departments.reduce(
      (sum: any, dept: any) => sum + (dept._count?.employees || 0),
      0
    );

    return {
      id: costCenter.id,
      code: costCenter.code,
      name: costCenter.name,
      stats: {
        totalDepartments: costCenter.departments.length,
        totalEmployees,
      },
      departments: costCenter.departments.map((dept: any) => ({
        id: dept.id,
        code: dept.code,
        name: dept.name,
        company: dept.company.name,
        employeeCount: dept._count?.employees || 0,
      })),
    };
  }
}

export const costCenterService = new CostCenterService();
