import { prisma } from '@/lib/database';
import type { Employee, Prisma } from '@prisma/client';

export interface EmployeeFilterOptions {
  companyId?: string;
  departmentId?: string;
  locationId?: string;
  statusId?: string;
  managerId?: string;
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

export interface CreateEmployeeDTO {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
  departmentId: string;
  locationId: string;
  jobProfileId: string;
  gradeId: string;
  statusId: string;
  typeId: string;
  joiningDate: Date;
  managerId?: string;
  addressId?: string;
}

export interface UpdateEmployeeDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: string;
  locationId?: string;
  jobProfileId?: string;
  gradeId?: string;
  statusId?: string;
  typeId?: string;
  managerId?: string;
  addressId?: string;
}

export class EmployeeService {
  /**
   * Find all employees with filtering and pagination
   */
  async findAll(
    filter: EmployeeFilterOptions
  ): Promise<PaginatedResult<Employee>> {
    const {
      companyId,
      departmentId,
      locationId,
      statusId,
      managerId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    // Build where clause
    const where: Prisma.EmployeeWhereInput = {};

    if (companyId) where.companyId = companyId;
    if (departmentId) where.departmentId = departmentId;
    if (locationId) where.locationId = locationId;
    if (statusId) where.statusId = statusId;
    if (managerId) where.managerId = managerId;

    // Search across multiple fields
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Count total records
    const total = await prisma.employee.count({ where });

    // Fetch paginated data with relations
    const employees = await prisma.employee.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        company: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true, code: true } },
        location: { select: { id: true, name: true, code: true } },
        jobProfile: { select: { id: true, title: true, code: true } },
        grade: { select: { id: true, name: true, code: true, level: true } },
        status: { select: { id: true, name: true, code: true } },
        type: { select: { id: true, name: true, code: true } },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
          },
        },
      },
    });

    return {
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find employee by ID
   */
  async findById(id: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { id },
      include: {
        company: true,
        department: true,
        location: true,
        jobProfile: true,
        grade: true,
        status: true,
        type: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
          },
        },
        reports: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
            jobProfile: { select: { title: true } },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            lastLogin: true,
          },
        },
      },
    });
  }

  /**
   * Find employee by employee code
   */
  async findByCode(employeeCode: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { employeeCode },
      include: {
        department: true,
        jobProfile: true,
        status: true,
      },
    });
  }

  /**
   * Find employee by email
   */
  async findByEmail(email: string): Promise<Employee | null> {
    return prisma.employee.findUnique({
      where: { email },
      include: {
        department: true,
        jobProfile: true,
        status: true,
      },
    });
  }

  /**
   * Create a new employee
   */
  async create(data: CreateEmployeeDTO): Promise<Employee> {
    // Check for duplicate email
    const existingEmail = await this.findByEmail(data.email);
    if (existingEmail) {
      throw new Error('Employee with this email already exists');
    }

    // Check for duplicate employee code
    const existingCode = await this.findByCode(data.employeeCode);
    if (existingCode) {
      throw new Error('Employee with this code already exists');
    }

    return prisma.employee.create({
      data: {
        ...data,
        joiningDate: new Date(data.joiningDate),
      },
      include: {
        company: true,
        department: true,
        location: true,
        jobProfile: true,
        grade: true,
        status: true,
        type: true,
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
  }

  /**
   * Update an existing employee
   */
  async update(id: string, data: UpdateEmployeeDTO): Promise<Employee> {
    // If email is being updated, check for duplicates
    if (data.email) {
      const existing = await prisma.employee.findUnique({
        where: { email: data.email },
      });

      if (existing && existing.id !== id) {
        throw new Error('Employee with this email already exists');
      }
    }

    return prisma.employee.update({
      where: { id },
      data,
      include: {
        company: true,
        department: true,
        location: true,
        jobProfile: true,
        grade: true,
        status: true,
        type: true,
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
  }

  /**
   * Delete an employee (soft delete by updating status)
   */
  async delete(id: string, terminatedStatusId: string): Promise<void> {
    await prisma.employee.update({
      where: { id },
      data: {
        statusId: terminatedStatusId,
      },
    });
  }

  /**
   * Get direct reports for a manager
   */
  async getDirectReports(managerId: string): Promise<Employee[]> {
    return prisma.employee.findMany({
      where: { managerId },
      include: {
        jobProfile: { select: { title: true } },
        status: { select: { name: true } },
      },
      orderBy: { firstName: 'asc' },
    });
  }

  /**
   * Get org chart data for an employee (manager chain)
   */
  async getOrgChart(employeeId: string): Promise<any> {
    const employee = await this.findById(employeeId);
    if (!employee) return null;

    // Get manager chain
    const managerChain = [];
    let currentManager = employee.manager;

    while (currentManager) {
      const manager = await prisma.employee.findUnique({
        where: { id: currentManager.id },
        include: {
          jobProfile: { select: { title: true } },
          manager: true,
        },
      });

      if (manager) {
        managerChain.push({
          id: manager.id,
          name: `${manager.firstName} ${manager.lastName}`,
          employeeCode: manager.employeeCode,
          jobTitle: manager.jobProfile.title,
        });
        currentManager = manager.manager;
      } else {
        break;
      }
    }

    // Get direct reports
    const directReports = await this.getDirectReports(employeeId);

    return {
      employee: {
        id: employee.id,
        name: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        jobTitle: employee.jobProfile.title,
      },
      managerChain,
      directReports: directReports.map((r) => ({
        id: r.id,
        name: `${r.firstName} ${r.lastName}`,
        employeeCode: r.employeeCode,
        jobTitle: r.jobProfile.title,
      })),
    };
  }

  /**
   * Get employment history for an employee
   * Note: This requires an EmploymentHistory table which needs to be added to schema
   */
  async getEmploymentHistory(employeeId: string): Promise<any[]> {
    // TODO: Implement when EmploymentHistory table is added to schema
    // For now, return basic employee record as history
    const employee = await this.findById(employeeId);
    if (!employee) return [];

    return [
      {
        action: 'HIRED',
        effectiveDate: employee.joiningDate,
        department: employee.department.name,
        jobProfile: employee.jobProfile.title,
        grade: employee.grade.name,
        status: employee.status.name,
      },
    ];
  }
}

export const employeeService = new EmployeeService();
