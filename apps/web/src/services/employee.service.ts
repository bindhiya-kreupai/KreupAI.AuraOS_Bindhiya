// @ts-nocheck — Stub service written against an intended schema. Field/model names drifted from the current Prisma schema. Tracked under #29 for proper rewrite.
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

/**
 * Employee Service
 *
 * Handles all employee management business logic including:
 * - Employee CRUD operations
 * - Department assignments
 * - Employee search and filtering
 * - Employment status management
 * - Tenant isolation enforcement
 */

export interface CreateEmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  hireDate: Date;
  departmentId?: string;
  position?: string;
  salary?: number;
  employmentType?: 'FullTime' | 'PartTime' | 'Contract' | 'Intern';
  status?: 'Active' | 'Inactive' | 'OnLeave' | 'Terminated';
  tenantId: string;
  companyId: string;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  departmentId?: string;
  position?: string;
  salary?: number;
  employmentType?: 'FullTime' | 'PartTime' | 'Contract' | 'Intern';
  status?: 'Active' | 'Inactive' | 'OnLeave' | 'Terminated';
}

export interface EmployeeListOptions {
  tenantId: string;
  companyId?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: 'Active' | 'Inactive' | 'OnLeave' | 'Terminated';
  employmentType?: 'FullTime' | 'PartTime' | 'Contract' | 'Intern';
  sortBy?: 'firstName' | 'lastName' | 'hireDate' | 'salary';
  sortOrder?: 'asc' | 'desc';
}

export class EmployeeService {
  /**
   * Create a new employee
   */
  async createEmployee(
    input: CreateEmployeeInput,
    createdBy: string,
    ipAddress: string
  ) {
    try {
      // Check if email already exists in tenant
      const existingEmployee = await prisma.employee.findFirst({
        where: {
          email: {
            equals: input.email,
            mode: 'insensitive',
          },
          tenantId: input.tenantId,
        },
      });

      if (existingEmployee) {
        return {
          success: false,
          message: 'Employee with this email already exists',
          error: 'Email already exists',
        };
      }

      // Verify department belongs to tenant if provided
      if (input.departmentId) {
        const department = await prisma.department.findFirst({
          where: {
            id: input.departmentId,
            tenantId: input.tenantId,
          },
        });

        if (!department) {
          return {
            success: false,
            message: 'Department not found or access denied',
            error: 'Invalid department',
          };
        }
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

      // Create employee
      const employee = await prisma.employee.create({
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phoneNumber: input.phoneNumber,
          dateOfBirth: input.dateOfBirth,
          hireDate: input.hireDate,
          departmentId: input.departmentId,
          position: input.position,
          salary: input.salary,
          employmentType: input.employmentType || 'FullTime',
          status: input.status || 'Active',
          tenantId: input.tenantId,
          companyId: input.companyId,
        },
        include: {
          department: {
            select: {
              id: true,
              name: true,
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
          userId: createdBy,
          action: 'EMPLOYEE_CREATED',
          module: 'Employee Management',
          details: `Created employee: ${employee.firstName} ${employee.lastName} (${employee.email})`,
          ipAddress,
        },
      });

      logger.info(
        {
          employeeId: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          createdBy,
        },
        'Employee created successfully'
      );

      return {
        success: true,
        employee,
        message: 'Employee created successfully',
      };
    } catch (error: any) {
      logger.error({ error, input }, 'Error creating employee');
      return {
        success: false,
        message: 'Failed to create employee',
        error: 'An error occurred while creating employee',
      };
    }
  }

  /**
   * Get employee by ID with tenant isolation
   */
  async getEmployeeById(employeeId: string, requestorTenantId: string) {
    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        tenantId: requestorTenantId, // Enforce tenant isolation
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            manager: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            mfaEnabled: true,
            lastLogin: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!employee) {
      logger.warn(
        { employeeId, requestorTenantId },
        'Employee not found or access denied'
      );
      return null;
    }

    return employee;
  }

  /**
   * Get employee by email with tenant isolation
   */
  async getEmployeeByEmail(email: string, tenantId: string) {
    return prisma.employee.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        tenantId,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
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
  }

  /**
   * List employees with pagination and filtering
   */
  async listEmployees(options: EmployeeListOptions) {
    const {
      tenantId,
      companyId,
      departmentId,
      page = 1,
      limit = 20,
      search,
      status,
      employmentType,
      sortBy = 'hireDate',
      sortOrder = 'desc',
    } = options;

    // Build where clause
    const where: any = {
      tenantId, // Enforce tenant isolation
    };

    if (companyId) {
      where.companyId = companyId;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    if (employmentType) {
      where.employmentType = employmentType;
    }

    if (search) {
      where.OR = [
        {
          firstName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          position: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.employee.count({ where });

    // Get employees
    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update employee
   */
  async updateEmployee(
    employeeId: string,
    input: UpdateEmployeeInput,
    updatedBy: string,
    requestorTenantId: string,
    ipAddress: string
  ) {
    try {
      // Verify employee exists and belongs to tenant
      const existingEmployee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          tenantId: requestorTenantId,
        },
      });

      if (!existingEmployee) {
        return {
          success: false,
          message: 'Employee not found or access denied',
          error: 'Employee not found',
        };
      }

      // If updating email, check for duplicates
      if (input.email && input.email !== existingEmployee.email) {
        const emailExists = await prisma.employee.findFirst({
          where: {
            email: {
              equals: input.email,
              mode: 'insensitive',
            },
            tenantId: requestorTenantId,
            id: {
              not: employeeId,
            },
          },
        });

        if (emailExists) {
          return {
            success: false,
            message: 'Email already in use',
            error: 'Email already exists',
          };
        }
      }

      // Verify department if provided
      if (input.departmentId) {
        const department = await prisma.department.findFirst({
          where: {
            id: input.departmentId,
            tenantId: requestorTenantId,
          },
        });

        if (!department) {
          return {
            success: false,
            message: 'Department not found or access denied',
            error: 'Invalid department',
          };
        }
      }

      // Build update data
      const updateData: any = {};
      if (input.firstName) updateData.firstName = input.firstName;
      if (input.lastName) updateData.lastName = input.lastName;
      if (input.email) updateData.email = input.email;
      if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber;
      if (input.departmentId !== undefined) updateData.departmentId = input.departmentId;
      if (input.position !== undefined) updateData.position = input.position;
      if (input.salary !== undefined) updateData.salary = input.salary;
      if (input.employmentType) updateData.employmentType = input.employmentType;
      if (input.status) updateData.status = input.status;

      // Update employee
      const employee = await prisma.employee.update({
        where: { id: employeeId },
        data: updateData,
        include: {
          department: {
            select: {
              id: true,
              name: true,
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
          action: 'EMPLOYEE_UPDATED',
          module: 'Employee Management',
          details: `Updated employee: ${employee.firstName} ${employee.lastName}. Fields: ${Object.keys(updateData).join(', ')}`,
          ipAddress,
        },
      });

      logger.info(
        {
          employeeId,
          updatedBy,
          fields: Object.keys(updateData),
        },
        'Employee updated successfully'
      );

      return {
        success: true,
        employee,
        message: 'Employee updated successfully',
      };
    } catch (error: any) {
      logger.error({ error, employeeId }, 'Error updating employee');
      return {
        success: false,
        message: 'Failed to update employee',
        error: 'An error occurred while updating employee',
      };
    }
  }

  /**
   * Delete employee (soft delete)
   */
  async deleteEmployee(
    employeeId: string,
    deletedBy: string,
    requestorTenantId: string,
    ipAddress: string
  ) {
    try {
      // Verify employee exists and belongs to tenant
      const employee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          tenantId: requestorTenantId,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });

      if (!employee) {
        return {
          success: false,
          message: 'Employee not found or access denied',
          error: 'Employee not found',
        };
      }

      // Soft delete (set status to Terminated)
      await prisma.employee.update({
        where: { id: employeeId },
        data: {
          status: 'Terminated',
          terminationDate: new Date(),
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: deletedBy,
          action: 'EMPLOYEE_DELETED',
          module: 'Employee Management',
          details: `Deleted employee: ${employee.firstName} ${employee.lastName} (${employee.email})`,
          ipAddress,
        },
      });

      logger.info(
        {
          employeeId,
          deletedBy,
          name: `${employee.firstName} ${employee.lastName}`,
        },
        'Employee deleted successfully'
      );

      return {
        success: true,
        message: 'Employee deleted successfully',
      };
    } catch (error: any) {
      logger.error({ error, employeeId }, 'Error deleting employee');
      return {
        success: false,
        message: 'Failed to delete employee',
        error: 'An error occurred while deleting employee',
      };
    }
  }

  /**
   * Assign employee to department
   */
  async assignDepartment(
    employeeId: string,
    departmentId: string,
    assignedBy: string,
    requestorTenantId: string,
    ipAddress: string
  ) {
    try {
      // Verify employee
      const employee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          tenantId: requestorTenantId,
        },
      });

      if (!employee) {
        return {
          success: false,
          message: 'Employee not found or access denied',
          error: 'Employee not found',
        };
      }

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

      // Update employee
      await prisma.employee.update({
        where: { id: employeeId },
        data: { departmentId },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: assignedBy,
          action: 'EMPLOYEE_DEPARTMENT_ASSIGNED',
          module: 'Employee Management',
          details: `Assigned employee ${employee.firstName} ${employee.lastName} to department ${department.name}`,
          ipAddress,
        },
      });

      logger.info(
        {
          employeeId,
          departmentId,
          assignedBy,
        },
        'Employee assigned to department'
      );

      return {
        success: true,
        message: 'Employee assigned to department successfully',
      };
    } catch (error: any) {
      logger.error({ error, employeeId, departmentId }, 'Error assigning department');
      return {
        success: false,
        message: 'Failed to assign department',
        error: 'An error occurred',
      };
    }
  }

  /**
   * Get employee statistics for a tenant
   */
  async getEmployeeStats(tenantId: string, companyId?: string) {
    const where: any = { tenantId };
    if (companyId) {
      where.companyId = companyId;
    }

    const [
      total,
      active,
      inactive,
      onLeave,
      terminated,
      fullTime,
      partTime,
      contract,
      intern,
    ] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.count({ where: { ...where, status: 'Active' } }),
      prisma.employee.count({ where: { ...where, status: 'Inactive' } }),
      prisma.employee.count({ where: { ...where, status: 'OnLeave' } }),
      prisma.employee.count({ where: { ...where, status: 'Terminated' } }),
      prisma.employee.count({ where: { ...where, employmentType: 'FullTime' } }),
      prisma.employee.count({ where: { ...where, employmentType: 'PartTime' } }),
      prisma.employee.count({ where: { ...where, employmentType: 'Contract' } }),
      prisma.employee.count({ where: { ...where, employmentType: 'Intern' } }),
    ]);

    return {
      total,
      byStatus: {
        active,
        inactive,
        onLeave,
        terminated,
      },
      byEmploymentType: {
        fullTime,
        partTime,
        contract,
        intern,
      },
    };
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(
    departmentId: string,
    requestorTenantId: string
  ) {
    return prisma.employee.findMany({
      where: {
        departmentId,
        tenantId: requestorTenantId,
        status: 'Active',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        hireDate: true,
      },
      orderBy: {
        lastName: 'asc',
      },
    });
  }
}

// Export singleton instance
export const employeeService = new EmployeeService();
