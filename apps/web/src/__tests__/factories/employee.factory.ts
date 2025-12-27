/**
 * Employee Test Data Factory
 * Generates consistent test data for employee entities
 */

import { Employee, EmploymentStatus } from '@prisma/client';

let employeeIdCounter = 1;

export interface EmployeeFactoryOptions {
  id?: string;
  tenantId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  employeeCode?: string;
  status?: EmploymentStatus;
  joinDate?: Date;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  workLocation?: string;
  employmentType?: string;
}

export const EmployeeFactory = {
  /**
   * Build a single employee object (not saved to database)
   */
  build(overrides: EmployeeFactoryOptions = {}): Partial<Employee> {
    const id = employeeIdCounter++;
    const firstName = overrides.firstName || `Employee${id}`;
    const lastName = overrides.lastName || `LastName${id}`;

    return {
      id: overrides.id || `emp-${id}`,
      tenantId: overrides.tenantId || 'tenant-1',
      firstName,
      lastName,
      email: overrides.email || `employee${id}@test.com`,
      phone: overrides.phone || `+1-555-000-${String(id).padStart(4, '0')}`,
      employeeCode: overrides.employeeCode || `EMP${String(id).padStart(5, '0')}`,
      status: overrides.status || 'ACTIVE',
      joinDate: overrides.joinDate || new Date('2024-01-01'),
      departmentId: overrides.departmentId || 'dept-1',
      positionId: overrides.positionId || 'pos-1',
      managerId: overrides.managerId || null,
      workLocation: overrides.workLocation || 'HQ',
      employmentType: overrides.employmentType || 'FULL_TIME',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  /**
   * Build multiple employee objects
   */
  buildMany(count: number, overrides: EmployeeFactoryOptions = {}): Partial<Employee>[] {
    return Array.from({ length: count }, () => this.build(overrides));
  },

  /**
   * Build employee with specific status
   */
  buildActive(overrides: EmployeeFactoryOptions = {}) {
    return this.build({ ...overrides, status: 'ACTIVE' });
  },

  buildInactive(overrides: EmployeeFactoryOptions = {}) {
    return this.build({ ...overrides, status: 'INACTIVE' });
  },

  buildTerminated(overrides: EmployeeFactoryOptions = {}) {
    return this.build({ ...overrides, status: 'TERMINATED' });
  },

  buildOnProbation(overrides: EmployeeFactoryOptions = {}) {
    return this.build({ ...overrides, status: 'PROBATION' });
  },

  /**
   * Build manager with subordinates
   */
  buildManager(subordinateCount: number = 3, overrides: EmployeeFactoryOptions = {}) {
    const manager = this.build({ ...overrides });
    const subordinates = this.buildMany(subordinateCount, { managerId: manager.id });

    return {
      manager,
      subordinates
    };
  },

  /**
   * Reset counter (useful between tests)
   */
  reset() {
    employeeIdCounter = 1;
  }
};
