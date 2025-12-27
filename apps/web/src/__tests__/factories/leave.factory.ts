/**
 * Leave Test Data Factory
 * Generates consistent test data for leave/time-off entities
 */

import { Leave, LeaveStatus, LeaveType } from '@prisma/client';

let leaveIdCounter = 1;

export interface LeaveFactoryOptions {
  id?: string;
  tenantId?: string;
  employeeId?: string;
  leaveTypeId?: string;
  type?: LeaveType;
  startDate?: Date;
  endDate?: Date;
  days?: number;
  status?: LeaveStatus;
  reason?: string;
  approverId?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export const LeaveFactory = {
  /**
   * Build a single leave object (not saved to database)
   */
  build(overrides: LeaveFactoryOptions = {}): Partial<Leave> {
    const id = leaveIdCounter++;
    const startDate = overrides.startDate || new Date('2025-02-01');
    const endDate = overrides.endDate || new Date('2025-02-03');

    return {
      id: overrides.id || `leave-${id}`,
      tenantId: overrides.tenantId || 'tenant-1',
      employeeId: overrides.employeeId || 'emp-1',
      leaveTypeId: overrides.leaveTypeId || 'type-1',
      type: overrides.type || 'ANNUAL',
      startDate,
      endDate,
      days: overrides.days || 3,
      status: overrides.status || 'PENDING',
      reason: overrides.reason || `Leave request ${id}`,
      approverId: overrides.approverId || null,
      approvedAt: overrides.approvedAt || null,
      rejectionReason: overrides.rejectionReason || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  /**
   * Build multiple leave records
   */
  buildMany(count: number, overrides: LeaveFactoryOptions = {}): Partial<Leave>[] {
    return Array.from({ length: count }, () => this.build(overrides));
  },

  /**
   * Build leave with specific status
   */
  buildPending(overrides: LeaveFactoryOptions = {}) {
    return this.build({ ...overrides, status: 'PENDING' });
  },

  buildApproved(overrides: LeaveFactoryOptions = {}) {
    return this.build({
      ...overrides,
      status: 'APPROVED',
      approverId: overrides.approverId || 'manager-1',
      approvedAt: new Date()
    });
  },

  buildRejected(overrides: LeaveFactoryOptions = {}) {
    return this.build({
      ...overrides,
      status: 'REJECTED',
      approverId: overrides.approverId || 'manager-1',
      rejectionReason: overrides.rejectionReason || 'Insufficient balance'
    });
  },

  buildCancelled(overrides: LeaveFactoryOptions = {}) {
    return this.build({ ...overrides, status: 'CANCELLED' });
  },

  /**
   * Build leave with specific type
   */
  buildAnnual(overrides: LeaveFactoryOptions = {}) {
    return this.build({ ...overrides, type: 'ANNUAL' });
  },

  buildSick(overrides: LeaveFactoryOptions = {}) {
    return this.build({ ...overrides, type: 'SICK' });
  },

  buildEmergency(overrides: LeaveFactoryOptions = {}) {
    return this.build({ ...overrides, type: 'EMERGENCY' });
  },

  buildMaternity(overrides: LeaveFactoryOptions = {}) {
    return this.build({
      ...overrides,
      type: 'MATERNITY',
      days: 90, // Typical maternity leave
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-05-30')
    });
  },

  /**
   * Build leave for date range
   */
  buildForDateRange(startDate: Date, endDate: Date, overrides: LeaveFactoryOptions = {}) {
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return this.build({
      ...overrides,
      startDate,
      endDate,
      days
    });
  },

  /**
   * Reset counter (useful between tests)
   */
  reset() {
    leaveIdCounter = 1;
  }
};
