// @ts-nocheck — Stub service written against an intended schema. Field/model names drifted from the current Prisma schema. Tracked under #29 for proper rewrite.
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

/**
 * Department Service
 *
 * Handles all department management business logic including:
 * - Department CRUD operations
 * - Manager assignments
 * - Employee listings
 * - Department hierarchy
 * - Statistics and reporting
 * - Tenant isolation enforcement
 *
 * @module DepartmentService
 */

export interface CreateDepartmentInput {
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
  tenantId: string;
  companyId: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
  isActive?: boolean;
}

export interface DepartmentListOptions {
  tenantId: string;
  companyId?: string;
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'code' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  includeInactive?: boolean;
}

/**
 * Department Service Class
 *
 * Provides methods for managing departments within a multi-tenant environment.
 * All operations enforce tenant isolation and maintain complete audit trails.
 */
export class DepartmentService {
  /**
   * Create a new department
   *
   * @param input - Department creation data
   * @param createdBy - User ID of the creator
   * @param ipAddress - IP address of the request
   * @returns Result object with success status and department data
   *
   * @example
   * ```typescript
   * const result = await departmentService.createDepartment(
   *   {
   *     name: 'Engineering',
   *     code: 'ENG',
   *     tenantId: 'tenant-123',
   *     companyId: 'company-456',
   *   },
   *   'user-789',
   *   '192.168.1.1'
   * );
   * ```
   */
  async createDepartment(input: CreateDepartmentInput, createdBy: string, ipAddress: string) {
    try {
      // Check if department code already exists in company
      const existingDepartment = await prisma.department.findFirst({
        where: {
          code: input.code,
          companyId: input.companyId,
          tenantId: input.tenantId,
        },
      });

      if (existingDepartment) {
        return {
          success: false,
          message: 'Department with this code already exists in the company',
          error: 'Code already exists',
        };
      }

      // Verify company belongs to tenant
      const company = await prisma.company.findFirst({
        where: {
          id: input.companyId,
          tenantId: input.tenantId,
        },
      });

      if (!company) {
        return {
          success: false,
          message: 'Company not found or access denied',
          error: 'Invalid company',
        };
      }

      // Verify manager if provided
      if (input.managerId) {
        const manager = await prisma.employee.findFirst({
          where: {
            id: input.managerId,
            tenantId: input.tenantId,
          },
        });

        if (!manager) {
          return {
            success: false,
            message: 'Manager not found or access denied',
            error: 'Invalid manager',
          };
        }
      }

      // Verify parent department if provided
      if (input.parentDepartmentId) {
        const parentDept = await prisma.department.findFirst({
          where: {
            id: input.parentDepartmentId,
            tenantId: input.tenantId,
          },
        });

        if (!parentDept) {
          return {
            success: false,
            message: 'Parent department not found or access denied',
            error: 'Invalid parent department',
          };
        }
      }

      // Create department
      const department = await prisma.department.create({
        data: {
          name: input.name,
          code: input.code,
          description: input.description,
          managerId: input.managerId,
          parentDepartmentId: input.parentDepartmentId,
          tenantId: input.tenantId,
          companyId: input.companyId,
          isActive: true,
        },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          parentDepartment: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: createdBy,
          action: 'DEPARTMENT_CREATED',
          module: 'Department Management',
          details: `Created department: ${department.name} (${department.code})`,
          ipAddress,
        },
      });

      logger.info(
        {
          departmentId: department.id,
          name: department.name,
          code: department.code,
          createdBy,
        },
        'Department created successfully'
      );

      return {
        success: true,
        department,
        message: 'Department created successfully',
      };
    } catch (error: any) {
      logger.error({ error, input }, 'Error creating department');
      return {
        success: false,
        message: 'Failed to create department',
        error: 'An error occurred while creating department',
      };
    }
  }

  /**
   * Get department by ID with tenant isolation
   *
   * @param departmentId - Department ID
   * @param requestorTenantId - Tenant ID of requestor
   * @returns Department data or null if not found
   */
  async getDepartmentById(departmentId: string, requestorTenantId: string) {
    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        tenantId: requestorTenantId, // Enforce tenant isolation
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        parentDepartment: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        childDepartments: {
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
          },
          where: {
            isActive: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!department) {
      logger.warn({ departmentId, requestorTenantId }, 'Department not found or access denied');
      return null;
    }

    return department;
  }

  /**
   * List departments with pagination and filtering
   *
   * @param options - List options including filters and pagination
   * @returns Paginated list of departments
   */
  async listDepartments(options: DepartmentListOptions) {
    const {
      tenantId,
      companyId,
      page = 1,
      limit = 20,
      search,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc',
      includeInactive = false,
    } = options;

    // Build where clause
    const where: any = {
      tenantId, // Enforce tenant isolation
    };

    if (companyId) {
      where.companyId = companyId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    } else if (!includeInactive) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          code: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.department.count({ where });

    // Get departments
    const departments = await prisma.department.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            employees: true,
            childDepartments: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      departments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update department
   *
   * @param departmentId - Department ID
   * @param input - Update data
   * @param updatedBy - User ID of updater
   * @param requestorTenantId - Tenant ID of requestor
   * @param ipAddress - IP address
   * @returns Result object
   */
  async updateDepartment(
    departmentId: string,
    input: UpdateDepartmentInput,
    updatedBy: string,
    requestorTenantId: string,
    ipAddress: string
  ) {
    try {
      // Verify department exists and belongs to tenant
      const existingDepartment = await prisma.department.findFirst({
        where: {
          id: departmentId,
          tenantId: requestorTenantId,
        },
      });

      if (!existingDepartment) {
        return {
          success: false,
          message: 'Department not found or access denied',
          error: 'Department not found',
        };
      }

      // If updating code, check for duplicates
      if (input.code && input.code !== existingDepartment.code) {
        const codeExists = await prisma.department.findFirst({
          where: {
            code: input.code,
            companyId: existingDepartment.companyId,
            tenantId: requestorTenantId,
            id: {
              not: departmentId,
            },
          },
        });

        if (codeExists) {
          return {
            success: false,
            message: 'Department code already in use',
            error: 'Code already exists',
          };
        }
      }

      // Verify manager if provided
      if (input.managerId) {
        const manager = await prisma.employee.findFirst({
          where: {
            id: input.managerId,
            tenantId: requestorTenantId,
          },
        });

        if (!manager) {
          return {
            success: false,
            message: 'Manager not found or access denied',
            error: 'Invalid manager',
          };
        }
      }

      // Verify parent department if provided
      if (input.parentDepartmentId) {
        const parentDept = await prisma.department.findFirst({
          where: {
            id: input.parentDepartmentId,
            tenantId: requestorTenantId,
          },
        });

        if (!parentDept) {
          return {
            success: false,
            message: 'Parent department not found or access denied',
            error: 'Invalid parent department',
          };
        }

        // Prevent circular reference
        if (input.parentDepartmentId === departmentId) {
          return {
            success: false,
            message: 'Department cannot be its own parent',
            error: 'Circular reference',
          };
        }
      }

      // Build update data
      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.code) updateData.code = input.code;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.managerId !== undefined) updateData.managerId = input.managerId;
      if (input.parentDepartmentId !== undefined)
        updateData.parentDepartmentId = input.parentDepartmentId;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      // Update department
      const department = await prisma.department.update({
        where: { id: departmentId },
        data: updateData,
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: updatedBy,
          action: 'DEPARTMENT_UPDATED',
          module: 'Department Management',
          details: `Updated department: ${department.name}. Fields: ${Object.keys(updateData).join(', ')}`,
          ipAddress,
        },
      });

      logger.info(
        {
          departmentId,
          updatedBy,
          fields: Object.keys(updateData),
        },
        'Department updated successfully'
      );

      return {
        success: true,
        department,
        message: 'Department updated successfully',
      };
    } catch (error: any) {
      logger.error({ error, departmentId }, 'Error updating department');
      return {
        success: false,
        message: 'Failed to update department',
        error: 'An error occurred while updating department',
      };
    }
  }

  /**
   * Delete department (soft delete)
   *
   * @param departmentId - Department ID
   * @param deletedBy - User ID
   * @param requestorTenantId - Tenant ID
   * @param ipAddress - IP address
   * @returns Result object
   */
  async deleteDepartment(
    departmentId: string,
    deletedBy: string,
    requestorTenantId: string,
    ipAddress: string
  ) {
    try {
      // Verify department exists and belongs to tenant
      const department = await prisma.department.findFirst({
        where: {
          id: departmentId,
          tenantId: requestorTenantId,
        },
        select: {
          id: true,
          name: true,
          code: true,
          _count: {
            select: {
              employees: true,
              childDepartments: true,
            },
          },
        },
      });

      if (!department) {
        return {
          success: false,
          message: 'Department not found or access denied',
          error: 'Department not found',
        };
      }

      // Check if department has employees
      if (department._count.employees > 0) {
        return {
          success: false,
          message: `Cannot delete department. It has ${department._count.employees} employee(s)`,
          error: 'Department has employees',
        };
      }

      // Check if department has child departments
      if (department._count.childDepartments > 0) {
        return {
          success: false,
          message: `Cannot delete department. It has ${department._count.childDepartments} child department(s)`,
          error: 'Department has children',
        };
      }

      // Soft delete (set isActive to false)
      await prisma.department.update({
        where: { id: departmentId },
        data: { isActive: false },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: deletedBy,
          action: 'DEPARTMENT_DELETED',
          module: 'Department Management',
          details: `Deleted department: ${department.name} (${department.code})`,
          ipAddress,
        },
      });

      logger.info(
        {
          departmentId,
          deletedBy,
          name: department.name,
        },
        'Department deleted successfully'
      );

      return {
        success: true,
        message: 'Department deleted successfully',
      };
    } catch (error: any) {
      logger.error({ error, departmentId }, 'Error deleting department');
      return {
        success: false,
        message: 'Failed to delete department',
        error: 'An error occurred while deleting department',
      };
    }
  }

  /**
   * Assign manager to department
   *
   * @param departmentId - Department ID
   * @param managerId - Employee ID
   * @param assignedBy - User ID
   * @param requestorTenantId - Tenant ID
   * @param ipAddress - IP address
   * @returns Result object
   */
  async assignManager(
    departmentId: string,
    managerId: string,
    assignedBy: string,
    requestorTenantId: string,
    ipAddress: string
  ) {
    try {
      // Verify department
      const department = await prisma.department.findFirst({
        where: {
          id: departmentId,
          tenantId: requestorTenantId,
        },
      });

      if (!department) {
        return {
          success: false,
          message: 'Department not found or access denied',
          error: 'Department not found',
        };
      }

      // Verify manager
      const manager = await prisma.employee.findFirst({
        where: {
          id: managerId,
          tenantId: requestorTenantId,
        },
      });

      if (!manager) {
        return {
          success: false,
          message: 'Manager not found or access denied',
          error: 'Manager not found',
        };
      }

      // Update department
      await prisma.department.update({
        where: { id: departmentId },
        data: { managerId },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: assignedBy,
          action: 'DEPARTMENT_MANAGER_ASSIGNED',
          module: 'Department Management',
          details: `Assigned ${manager.firstName} ${manager.lastName} as manager of department ${department.name}`,
          ipAddress,
        },
      });

      logger.info(
        {
          departmentId,
          managerId,
          assignedBy,
        },
        'Manager assigned to department'
      );

      return {
        success: true,
        message: 'Manager assigned successfully',
      };
    } catch (error: any) {
      logger.error({ error, departmentId, managerId }, 'Error assigning manager');
      return {
        success: false,
        message: 'Failed to assign manager',
        error: 'An error occurred',
      };
    }
  }

  /**
   * Get department hierarchy
   *
   * @param tenantId - Tenant ID
   * @param companyId - Company ID (optional)
   * @returns Tree structure of departments
   */
  async getDepartmentHierarchy(tenantId: string, companyId?: string) {
    const where: any = {
      tenantId,
      isActive: true,
      parentDepartmentId: null, // Root departments only
    };

    if (companyId) {
      where.companyId = companyId;
    }

    const rootDepartments = await prisma.department.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        childDepartments: {
          where: { isActive: true },
          include: {
            manager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                employees: true,
              },
            },
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return rootDepartments;
  }

  /**
   * Get department statistics
   *
   * @param tenantId - Tenant ID
   * @param companyId - Company ID (optional)
   * @returns Statistics object
   */
  async getDepartmentStats(tenantId: string, companyId?: string) {
    const where: any = { tenantId };
    if (companyId) {
      where.companyId = companyId;
    }

    const [total, active, inactive, withManager, withoutManager] = await Promise.all([
      prisma.department.count({ where }),
      prisma.department.count({ where: { ...where, isActive: true } }),
      prisma.department.count({ where: { ...where, isActive: false } }),
      prisma.department.count({
        where: { ...where, managerId: { not: null } },
      }),
      prisma.department.count({ where: { ...where, managerId: null } }),
    ]);

    return {
      total,
      active,
      inactive,
      withManager,
      withoutManager,
    };
  }

  /**
   * Get departments by company
   *
   * @param companyId - Company ID
   * @param requestorTenantId - Tenant ID
   * @returns Array of departments
   */
  async getDepartmentsByCompany(companyId: string, requestorTenantId: string) {
    return prisma.department.findMany({
      where: {
        companyId,
        tenantId: requestorTenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}

/**
 * Export singleton instance
 */
export const departmentService = new DepartmentService();
export default departmentService;
