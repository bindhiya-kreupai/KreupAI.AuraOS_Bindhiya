/**
 * Employee Test Data Factory
 *
 * Generates realistic employee data for unit and integration tests.
 * All values are deterministic by default but support overrides.
 *
 * @module @aura/testing
 */

import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Types (mirrors the Prisma Employee model fields used in tests)
// ---------------------------------------------------------------------------

export interface TestEmployee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  department: string;
  designation: string;
  grade: string;
  managerId: string | null;
  joinDate: Date;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Sample data pools
// ---------------------------------------------------------------------------

const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry'];
const LAST_NAMES  = ['Smith', 'Jones', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Clark'];
const DEPARTMENTS = ['Engineering', 'Finance', 'HR', 'Sales', 'Operations', 'Marketing', 'Legal'];
const DESIGNATIONS = ['Software Engineer', 'Senior Engineer', 'Manager', 'Director', 'Analyst', 'Lead'];
const NATIONALITIES = ['Indian', 'Filipino', 'Pakistani', 'Egyptian', 'Jordanian', 'British', 'American'];
const GRADES = ['L1', 'L2', 'L3', 'L4', 'L5', 'M1', 'M2'];

let counter = 1;

function pick<T>(arr: T[]): T {
  return arr[counter % arr.length];
}

function seqNum(): string {
  return String(counter).padStart(6, '0');
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a test employee object with realistic defaults.
 *
 * @param overrides  Partial employee fields to override
 */
export function createEmployee(overrides: Partial<TestEmployee> = {}): TestEmployee {
  const id = overrides.id ?? randomUUID();
  const firstName = overrides.firstName ?? pick(FIRST_NAMES);
  const lastName  = overrides.lastName  ?? pick(LAST_NAMES);
  const empNum    = `EMP${seqNum()}`;
  counter++;

  return {
    id,
    employeeNumber: overrides.employeeNumber ?? empNum,
    firstName,
    lastName,
    email: overrides.email ?? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: overrides.phone ?? `+971-50-${String(Math.floor(1000000 + Math.random() * 9000000))}`,
    dateOfBirth: overrides.dateOfBirth ?? new Date('1990-06-15'),
    gender: overrides.gender ?? 'male',
    nationality: overrides.nationality ?? pick(NATIONALITIES),
    department: overrides.department ?? pick(DEPARTMENTS),
    designation: overrides.designation ?? pick(DESIGNATIONS),
    grade: overrides.grade ?? pick(GRADES),
    managerId: overrides.managerId ?? null,
    joinDate: overrides.joinDate ?? new Date('2022-01-01'),
    employmentType: overrides.employmentType ?? 'full-time',
    status: overrides.status ?? 'active',
    tenantId: overrides.tenantId ?? 'tenant-test-001',
    createdAt: overrides.createdAt ?? new Date('2022-01-01'),
    updatedAt: overrides.updatedAt ?? new Date('2022-01-01'),
  };
}

/**
 * Create multiple test employees.
 *
 * @param count      Number of employees to create
 * @param overrides  Shared overrides applied to all employees
 */
export function createEmployees(count: number, overrides: Partial<TestEmployee> = {}): TestEmployee[] {
  return Array.from({ length: count }, () => createEmployee(overrides));
}

/**
 * Create a test manager employee.
 */
export function createManager(overrides: Partial<TestEmployee> = {}): TestEmployee {
  return createEmployee({
    designation: 'Manager',
    grade: 'M1',
    ...overrides,
  });
}

/** Reset the internal counter (call in beforeEach for predictable IDs) */
export function resetEmployeeFactory(): void {
  counter = 1;
}
