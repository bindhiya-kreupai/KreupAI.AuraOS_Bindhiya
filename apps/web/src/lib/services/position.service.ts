/**
 * @service PositionService
 * @description Service layer for Position Management
 * @project AURA HCM Platform
 */

import { PrismaClient } from '@aura/database';
import { z } from 'zod';

const prisma = new PrismaClient();

// ========================================
// VALIDATION SCHEMAS
// ========================================

export const createPositionSchema = z.object({
  tenantId: z.string(),
  positionCode: z.string().min(1, 'Position code is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),

  departmentId: z.string().min(1, 'Department is required'),
  locationId: z.string().optional(),
  reportsToPositionId: z.string().optional(),

  jobProfileId: z.string().optional(),
  gradeId: z.string().optional(),

  headcount: z.number().int().min(1).default(1),
  fte: z.number().min(0.1).max(1.0).default(1.0),

  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().default('USD'),
  annualBudget: z.number().optional(),

  status: z.enum(['DRAFT', 'OPEN', 'FILLED', 'FROZEN', 'CLOSED']).default('DRAFT'),
  effectiveDate: z.string().optional(),

  requestedBy: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePositionSchema = createPositionSchema.partial().omit({ tenantId: true });

// ========================================
// TYPES
// ========================================

export interface PositionFilter {
  tenantId: string;
  status?: string;
  departmentId?: string;
  locationId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ========================================
// POSITION SERVICE
// ========================================

export class PositionService {
  /**
   * Find all positions with filtering and pagination
   */
  static async findAll(filter: PositionFilter) {
    const {
      tenantId,
      status,
      departmentId,
      locationId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      isActive: true,
      ...(status && { status }),
      ...(departmentId && { departmentId }),
      ...(locationId && { locationId }),
      ...(search && {
        OR: [
          { positionCode: { contains: search, mode: 'insensitive' } },
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [positions, total] = await Promise.all([
      prisma.position.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          department: true,
          location: true,
          jobProfile: true,
          grade: true,
          reportsToPosition: {
            select: { id: true, title: true, positionCode: true },
          },
          subordinatePositions: {
            select: { id: true, title: true, positionCode: true },
          },
          _count: {
            select: { employees: true },
          },
        },
      }),
      prisma.position.count({ where }),
    ]);

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
  static async findById(id: string, tenantId: string) {
    const position = await prisma.position.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        department: true,
        location: true,
        jobProfile: true,
        grade: true,
        reportsToPosition: true,
        subordinatePositions: true,
        employees: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return position;
  }

  /**
   * Create new position
   */
  static async create(data: z.infer<typeof createPositionSchema>) {
    // Validate input
    const validatedData = createPositionSchema.parse(data);

    // Check for duplicate position code
    const existing = await prisma.position.findUnique({
      where: {
        tenantId_positionCode: {
          tenantId: validatedData.tenantId,
          positionCode: validatedData.positionCode,
        },
      },
    });

    if (existing) {
      throw new Error(`Position with code ${validatedData.positionCode} already exists`);
    }

    // Create position
    const position = await prisma.position.create({
      data: {
        ...validatedData,
        effectiveDate: validatedData.effectiveDate ? new Date(validatedData.effectiveDate) : undefined,
        vacantCount: validatedData.headcount, // Initially all vacant
      },
      include: {
        department: true,
        location: true,
        jobProfile: true,
        grade: true,
      },
    });

    return position;
  }

  /**
   * Update position
   */
  static async update(id: string, tenantId: string, data: z.infer<typeof updatePositionSchema>) {
    // Validate input
    const validatedData = updatePositionSchema.parse(data);

    // Check if position exists
    const existing = await prisma.position.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!existing) {
      throw new Error('Position not found');
    }

    // If position code is being changed, check for duplicates
    if (validatedData.positionCode && validatedData.positionCode !== existing.positionCode) {
      const duplicate = await prisma.position.findUnique({
        where: {
          tenantId_positionCode: {
            tenantId,
            positionCode: validatedData.positionCode,
          },
        },
      });

      if (duplicate) {
        throw new Error(`Position with code ${validatedData.positionCode} already exists`);
      }
    }

    // Update position
    const position = await prisma.position.update({
      where: { id },
      data: {
        ...validatedData,
        effectiveDate: validatedData.effectiveDate ? new Date(validatedData.effectiveDate) : undefined,
      },
      include: {
        department: true,
        location: true,
        jobProfile: true,
        grade: true,
      },
    });

    return position;
  }

  /**
   * Delete position (soft delete)
   */
  static async delete(id: string, tenantId: string) {
    // Check if position exists
    const existing = await prisma.position.findFirst({
      where: { id, tenantId, isActive: true },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!existing) {
      throw new Error('Position not found');
    }

    // Check if position has employees
    if (existing._count.employees > 0) {
      throw new Error('Cannot delete position with assigned employees');
    }

    // Soft delete
    await prisma.position.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true };
  }

  /**
   * Get dashboard statistics
   */
  static async getStats(tenantId: string) {
    const [
      total,
      draft,
      open,
      filled,
      frozen,
      closed,
      totalHeadcount,
      filledHeadcount,
    ] = await Promise.all([
      prisma.position.count({ where: { tenantId, isActive: true } }),
      prisma.position.count({ where: { tenantId, isActive: true, status: 'DRAFT' } }),
      prisma.position.count({ where: { tenantId, isActive: true, status: 'OPEN' } }),
      prisma.position.count({ where: { tenantId, isActive: true, status: 'FILLED' } }),
      prisma.position.count({ where: { tenantId, isActive: true, status: 'FROZEN' } }),
      prisma.position.count({ where: { tenantId, isActive: true, status: 'CLOSED' } }),
      prisma.position.aggregate({
        where: { tenantId, isActive: true },
        _sum: { headcount: true },
      }),
      prisma.position.aggregate({
        where: { tenantId, isActive: true },
        _sum: { filledCount: true },
      }),
    ]);

    const totalHeadcountValue = totalHeadcount._sum.headcount || 0;
    const filledHeadcountValue = filledHeadcount._sum.filledCount || 0;
    const vacantHeadcount = totalHeadcountValue - filledHeadcountValue;

    return {
      total,
      draft,
      open,
      filled,
      frozen,
      closed,
      totalHeadcount: totalHeadcountValue,
      filledHeadcount: filledHeadcountValue,
      vacantHeadcount,
      fillRate: totalHeadcountValue > 0 ? (filledHeadcountValue / totalHeadcountValue) * 100 : 0,
    };
  }

  /**
   * Approve position
   */
  static async approve(id: string, tenantId: string, approvedBy: string) {
    const position = await prisma.position.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    if (position.status !== 'DRAFT') {
      throw new Error('Only draft positions can be approved');
    }

    const updated = await prisma.position.update({
      where: { id },
      data: {
        status: 'OPEN',
        approvedBy,
        approvedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Freeze position
   */
  static async freeze(id: string, tenantId: string) {
    const position = await prisma.position.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    const updated = await prisma.position.update({
      where: { id },
      data: {
        status: 'FROZEN',
      },
    });

    return updated;
  }

  /**
   * Close position
   */
  static async close(id: string, tenantId: string) {
    const position = await prisma.position.findFirst({
      where: { id, tenantId, isActive: true },
    });

    if (!position) {
      throw new Error('Position not found');
    }

    const updated = await prisma.position.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedDate: new Date(),
      },
    });

    return updated;
  }

  /**
   * Get position hierarchy tree
   */
  static async getHierarchy(tenantId: string) {
    const positions = await prisma.position.findMany({
      where: { tenantId, isActive: true },
      include: {
        department: true,
        subordinatePositions: {
          select: { id: true, title: true, positionCode: true },
        },
      },
      orderBy: { title: 'asc' },
    });

    // Build tree structure (positions without reportsToPositionId are root)
    const rootPositions = positions.filter((p) => !p.reportsToPositionId);

    return rootPositions;
  }
}
