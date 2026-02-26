/**
 * Leave Request Test Data Factory
 *
 * @module @aura/testing
 */

import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TestLeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: Date;
  endDate: Date;
  duration: number;          // in days
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'withdrawn';
  approverId: string | null;
  approverName: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  comments: string | null;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestLeaveType {
  id: string;
  name: string;
  code: string;
  isPaid: boolean;
  maxDaysPerYear: number;
  carryForward: boolean;
  maxCarryForwardDays: number;
  tenantId: string;
}

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const LEAVE_TYPES: TestLeaveType[] = [
  { id: 'lt-annual',    name: 'Annual Leave',    code: 'AL',  isPaid: true,  maxDaysPerYear: 30, carryForward: true,  maxCarryForwardDays: 5, tenantId: 'tenant-test-001' },
  { id: 'lt-sick',      name: 'Sick Leave',      code: 'SL',  isPaid: true,  maxDaysPerYear: 15, carryForward: false, maxCarryForwardDays: 0, tenantId: 'tenant-test-001' },
  { id: 'lt-maternity', name: 'Maternity Leave', code: 'ML',  isPaid: true,  maxDaysPerYear: 90, carryForward: false, maxCarryForwardDays: 0, tenantId: 'tenant-test-001' },
  { id: 'lt-emergency', name: 'Emergency Leave', code: 'EL',  isPaid: false, maxDaysPerYear: 3,  carryForward: false, maxCarryForwardDays: 0, tenantId: 'tenant-test-001' },
];

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a test leave request.
 */
export function createLeaveRequest(overrides: Partial<TestLeaveRequest> = {}): TestLeaveRequest {
  const startDate = overrides.startDate ?? new Date('2025-02-10');
  const endDate   = overrides.endDate   ?? new Date('2025-02-14');
  const duration  = overrides.duration  ?? Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return {
    id: overrides.id ?? randomUUID(),
    employeeId: overrides.employeeId ?? 'emp-test-001',
    employeeName: overrides.employeeName ?? 'Alice Smith',
    leaveTypeId: overrides.leaveTypeId ?? 'lt-annual',
    leaveTypeName: overrides.leaveTypeName ?? 'Annual Leave',
    startDate,
    endDate,
    duration,
    reason: overrides.reason ?? 'Family vacation',
    status: overrides.status ?? 'pending',
    approverId: overrides.approverId ?? 'mgr-test-001',
    approverName: overrides.approverName ?? 'Bob Jones',
    approvedAt: overrides.approvedAt ?? null,
    rejectedAt: overrides.rejectedAt ?? null,
    comments: overrides.comments ?? null,
    tenantId: overrides.tenantId ?? 'tenant-test-001',
    createdAt: overrides.createdAt ?? new Date('2025-02-01'),
    updatedAt: overrides.updatedAt ?? new Date('2025-02-01'),
  };
}

/**
 * Create an approved leave request.
 */
export function createApprovedLeaveRequest(
  overrides: Partial<TestLeaveRequest> = {}
): TestLeaveRequest {
  return createLeaveRequest({
    status: 'approved',
    approvedAt: new Date(),
    comments: 'Approved',
    ...overrides,
  });
}

/**
 * Create a rejected leave request.
 */
export function createRejectedLeaveRequest(
  overrides: Partial<TestLeaveRequest> = {}
): TestLeaveRequest {
  return createLeaveRequest({
    status: 'rejected',
    rejectedAt: new Date(),
    comments: 'Insufficient leave balance',
    ...overrides,
  });
}

/**
 * Get a predefined test leave type.
 */
export function getLeaveType(code: 'AL' | 'SL' | 'ML' | 'EL'): TestLeaveType {
  return LEAVE_TYPES.find((lt) => lt.code === code) ?? LEAVE_TYPES[0];
}

export { LEAVE_TYPES };
