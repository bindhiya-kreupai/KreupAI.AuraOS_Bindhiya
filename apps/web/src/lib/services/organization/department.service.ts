import { prisma } from '@/lib/database';
import type { Department, Prisma } from '@prisma/client';

export interface DepartmentFilterOptions {
  companyId?: string;
  parentId?: string;
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

export interface CreateDepartmentDTO {
  companyId: string;
  code: string;
  name: string;
  parentId?: string;
  costCenterId?: string;
}

export interface UpdateDepartmentDTO {
  code?: string;
  name?: string;
  parentId?: string;
  costCenterId?: string;
}

export class DepartmentService {
  /**
   * Find all departments with filtering and pagination
   */
  async findAll(
    filter: DepartmentFilterOptions
  ): Promise<PaginatedResult<Department>> {
    const {
      companyId,
      parentId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filter;

    // Build where clause
    const where: Prisma.DepartmentWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (parentId !== undefined) {
      // If parentId is null, get only root departments
      where.parentId = parentId || null;
    }

    // Search across multiple fields
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Count total records
    const total = await prisma.department.count({ where });

    // Fetch paginated data with relations
    const departments = await prisma.department.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        company: { select: { id: true, name: true, code: true } },
        parent: { select: { id: true, name: true, code: true } },
        children: {
          select: { id: true, name: true, code: true },
          orderBy: { name: 'asc' },
        },
        costCenter: { select: { id: true, name: true, code: true } },
        _count: {
          select: { employees: true },
        },
      },
    });

    return {
      data: departments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find department by ID
   */
  async findById(id: string): Promise<Department | null> {
    return prisma.department.findUnique({
      where: { id },
      include: {
        company: true,
        parent: true,
        children: {
          orderBy: { name: 'asc' },
        },
        costCenter: true,
        employees: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            jobProfile: { select: { title: true } },
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
   * Find department by code (within company)
   */
  async findByCode(companyId: string, code: string): Promise<Department | null> {
    return prisma.department.findUnique({
      where: {
        companyId_code: {
          companyId,
          code,
        },
      },
    });
  }

  /**
   * Create a new department
   */
  async create(data: CreateDepartmentDTO): Promise<Department> {
    // Check for duplicate code within company
    const existing = await this.findByCode(data.companyId, data.code);
    if (existing) {
      throw new Error('Department with this code already exists in this company');
    }

    // If parentId is provided, validate it exists and belongs to same company
    if (data.parentId) {
      const parent = await prisma.department.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new Error('Parent department not found');
      }

      if (parent.companyId !== data.companyId) {
        throw new Error('Parent department must belong to the same company');
      }
    }

    return prisma.department.create({
      data,
      include: {
        company: { select: { id: true, name: true, code: true } },
        parent: { select: { id: true, name: true, code: true } },
        costCenter: { select: { id: true, name: true, code: true } },
      },
    });
  }

  /**
   * Update an existing department
   */
  async update(id: string, data: UpdateDepartmentDTO): Promise<Department> {
    // Get current department
    const current = await prisma.department.findUnique({ where: { id } });
    if (!current) {
      throw new Error('Department not found');
    }

    // If code is being updated, check for duplicates
    if (data.code && data.code !== current.code) {
      const existing = await this.findByCode(current.companyId, data.code);
      if (existing && existing.id !== id) {
        throw new Error('Department with this code already exists in this company');
      }
    }

    // If parentId is being updated, validate
    if (data.parentId) {
      // Prevent self-reference
      if (data.parentId === id) {
        throw new Error('Department cannot be its own parent');
      }

      const parent = await prisma.department.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new Error('Parent department not found');
      }

      if (parent.companyId !== current.companyId) {
        throw new Error('Parent department must belong to the same company');
      }

      // Prevent circular references (child cannot be ancestor)
      const isCircular = await this.checkCircularReference(id, data.parentId);
      if (isCircular) {
        throw new Error('Circular reference detected: selected parent is a child of this department');
      }
    }

    return prisma.department.update({
      where: { id },
      data,
      include: {
        company: { select: { id: true, name: true, code: true } },
        parent: { select: { id: true, name: true, code: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        children: {
          select: { id: true, name: true, code: true },
        },
      },
    });
  }

  /**
   * Delete a department
   */
  async delete(id: string): Promise<void> {
    // Check if department has employees
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: { select: { employees: true } },
        children: { select: { id: true } },
      },
    });

    if (!department) {
      throw new Error('Department not found');
    }

    if (department._count.employees > 0) {
      throw new Error('Cannot delete department with active employees');
    }

    if (department.children.length > 0) {
      throw new Error('Cannot delete department with child departments');
    }

    await prisma.department.delete({ where: { id } });
  }

  /**
   * Get department hierarchy (tree structure)
   */
  async getHierarchy(companyId: string): Promise<any[]> {
    // Get all root departments (no parent)
    const rootDepartments = await prisma.department.findMany({
      where: {
        companyId,
        parentId: null,
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true, // Up to 3 levels deep
              },
            },
          },
        },
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return rootDepartments.map((dept) => this.buildTreeNode(dept));
  }

  /**
   * Helper: Build tree node recursively
   */
  private buildTreeNode(dept: any): any {
    return {
      id: dept.id,
      code: dept.code,
      name: dept.name,
      employeeCount: dept._count?.employees || 0,
      children: dept.children?.map((child: any) => this.buildTreeNode(child)) || [],
    };
  }

  /**
   * Helper: Check for circular reference in hierarchy
   */
  private async checkCircularReference(
    departmentId: string,
    proposedParentId: string
  ): Promise<boolean> {
    let currentId: string | null = proposedParentId;

    // Traverse up the hierarchy to check if we encounter the departmentId
    while (currentId) {
      if (currentId === departmentId) {
        return true; // Circular reference detected
      }

      const dept = await prisma.department.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = dept?.parentId || null;
    }

    return false;
  }
}

export const departmentService = new DepartmentService();
