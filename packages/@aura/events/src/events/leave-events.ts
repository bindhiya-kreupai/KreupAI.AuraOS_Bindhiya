/**
 * Leave Domain Events
 *
 * @module @aura/events
 */

import { DomainEvent } from '../lib/event-bus';

export type LeaveEventType =
  | 'LeaveRequested'
  | 'LeaveApproved'
  | 'LeaveRejected'
  | 'LeaveCancelled'
  | 'LeaveWithdrawn';

export interface LeaveRequestedPayload {
  leaveId: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  reason: string;
  approverId: string;
  approverName: string;
}

export interface LeaveApprovedPayload {
  leaveId: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  approverId: string;
  approverName: string;
  approvedAt: Date;
  comments?: string;
}

export interface LeaveRejectedPayload {
  leaveId: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  approverId: string;
  approverName: string;
  rejectedAt: Date;
  reason: string;
}

export function createLeaveRequestedEvent(
  tenantId: string,
  userId: string,
  payload: LeaveRequestedPayload
): Omit<DomainEvent<LeaveRequestedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'LeaveRequested',
    aggregateId: payload.leaveId,
    aggregateType: 'Leave',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}

export function createLeaveApprovedEvent(
  tenantId: string,
  userId: string,
  payload: LeaveApprovedPayload
): Omit<DomainEvent<LeaveApprovedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'LeaveApproved',
    aggregateId: payload.leaveId,
    aggregateType: 'Leave',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}
