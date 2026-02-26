/**
 * Attendance Domain Events
 *
 * @module @aura/events
 */

import { DomainEvent } from '../lib/event-bus';

// ---------------------------------------------------------------------------
// Event type union
// ---------------------------------------------------------------------------

export type AttendanceEventType =
  | 'AttendanceClockIn'
  | 'AttendanceClockOut'
  | 'AttendanceAnomalyDetected'
  | 'AttendanceCorrectionRequested'
  | 'AttendanceCorrectionApproved';

// ---------------------------------------------------------------------------
// Payloads
// ---------------------------------------------------------------------------

export interface AttendanceClockInPayload {
  attendanceId: string;
  employeeId: string;
  employeeName: string;
  clockInTime: Date;
  location?: string;
  deviceId?: string;
  ipAddress?: string;
  isLate: boolean;
  expectedStartTime?: Date;
}

export interface AttendanceClockOutPayload {
  attendanceId: string;
  employeeId: string;
  employeeName: string;
  clockOutTime: Date;
  clockInTime: Date;
  workDurationMinutes: number;
  isEarlyLeave: boolean;
  overtimeMinutes: number;
  location?: string;
  deviceId?: string;
}

export interface AttendanceAnomalyDetectedPayload {
  attendanceId: string;
  employeeId: string;
  employeeName: string;
  anomalyType:
    | 'MISSING_CLOCK_OUT'
    | 'UNUSUAL_HOURS'
    | 'DUPLICATE_ENTRY'
    | 'LOCATION_MISMATCH'
    | 'DEVICE_MISMATCH';
  detectedAt: Date;
  description: string;
  requiresReview: boolean;
}

// ---------------------------------------------------------------------------
// Event creators
// ---------------------------------------------------------------------------

export function createAttendanceClockInEvent(
  tenantId: string,
  userId: string,
  payload: AttendanceClockInPayload
): Omit<DomainEvent<AttendanceClockInPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'AttendanceClockIn',
    aggregateId: payload.attendanceId,
    aggregateType: 'Attendance',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}

export function createAttendanceClockOutEvent(
  tenantId: string,
  userId: string,
  payload: AttendanceClockOutPayload
): Omit<DomainEvent<AttendanceClockOutPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'AttendanceClockOut',
    aggregateId: payload.attendanceId,
    aggregateType: 'Attendance',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}

export function createAttendanceAnomalyDetectedEvent(
  tenantId: string,
  userId: string,
  payload: AttendanceAnomalyDetectedPayload
): Omit<DomainEvent<AttendanceAnomalyDetectedPayload>, 'eventId' | 'timestamp' | 'version'> {
  return {
    eventType: 'AttendanceAnomalyDetected',
    aggregateId: payload.attendanceId,
    aggregateType: 'Attendance',
    tenantId,
    userId,
    payload,
    metadata: {},
  };
}
