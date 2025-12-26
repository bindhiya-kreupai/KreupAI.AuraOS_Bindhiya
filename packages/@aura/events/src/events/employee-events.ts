/**
 * Employee Domain Events
 *
 * @module @aura/events
 */

import { DomainEvent } from '../lib/event-bus';

// Event Types
export type EmployeeEventType =
  | 'EmployeeCreated'
  | 'EmployeeUpdated'
  | 'EmployeeTerminated'
  | 'EmployeeReinstated'
  | 'EmployeePromoted'
  | 'EmployeeDemoted'
  | 'EmployeeDepartmentChanged'
  | 'EmployeeManagerChanged'
  | 'EmployeeSalaryChanged';

// Event Payloads
export interface EmployeeCreatedPayload {
  employeeId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  managerId?: string;
  joinDate: Date;
}

export interface EmployeeUpdatedPayload {
  employeeId: string;
  changes: Record<string, { old: unknown; new: unknown }>;
}

export interface EmployeeTerminatedPayload {
  employeeId: string;
  employeeName: string;
  exitDate: Date;
  exitReason: string;
  finalSettlement?: {
    lastWorkingDay: Date;
    noticePeriodDays: number;
    gratuity: number;
    leaveEncashment: number;
  };
}

export interface EmployeePromotedPayload {
  employeeId: string;
  employeeName: string;
  oldDesignation: string;
  newDesignation: string;
  oldSalary: number;
  newSalary: number;
  effectiveDate: Date;
}

export interface EmployeeDepartmentChangedPayload {
  employeeId: string;
  employeeName: string;
  oldDepartment: string;
  newDepartment: string;
  oldManager?: string;
  newManager?: string;
  effectiveDate: Date;
}

// Event Creators
export function createEmployeeCreatedEvent(
  tenantId: string,
  userId: string,
  payload: EmployeeCreatedPayload
): Omit<DomainEvent<EmployeeCreatedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'EmployeeCreated',
    aggregateId: payload.employeeId,
    aggregateType: 'Employee',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}

export function createEmployeeTerminatedEvent(
  tenantId: string,
  userId: string,
  payload: EmployeeTerminatedPayload
): Omit<DomainEvent<EmployeeTerminatedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'EmployeeTerminated',
    aggregateId: payload.employeeId,
    aggregateType: 'Employee',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}

export function createEmployeePromotedEvent(
  tenantId: string,
  userId: string,
  payload: EmployeePromotedPayload
): Omit<DomainEvent<EmployeePromotedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'EmployeePromoted',
    aggregateId: payload.employeeId,
    aggregateType: 'Employee',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}
