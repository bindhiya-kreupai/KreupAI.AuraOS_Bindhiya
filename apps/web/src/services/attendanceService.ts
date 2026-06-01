// @ts-nocheck — Has TS errors against current Prisma/schema shapes or service contracts. Tracked under #29 for proper fix.
/**
 * @module attendanceService
 * @description Attendance management — clock in/out, logs, summaries, anomalies, regularization
 * @project AURA HCM Platform
 */

import { APIClient } from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

export type AttendanceMethod = 'BIOMETRIC' | 'MOBILE' | 'WEB' | 'CARD' | 'MANUAL';
export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'HALF_DAY'
  | 'WFH'
  | 'LEAVE'
  | 'HOLIDAY'
  | 'WEEKEND';
export type AnomalyType =
  | 'MISSING_PUNCH_OUT'
  | 'MISSING_PUNCH_IN'
  | 'LATE_ARRIVAL'
  | 'EARLY_DEPARTURE'
  | 'OVERTIME'
  | 'SHORT_HOURS';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  date: string; // ISO date YYYY-MM-DD
  clockIn: string | null; // ISO datetime
  clockOut: string | null;
  clockInMethod: AttendanceMethod | null;
  clockOutMethod: AttendanceMethod | null;
  clockInLocation: { lat: number; lng: number; address: string } | null;
  status: AttendanceStatus;
  grossHours: number; // Decimal hours
  breakMinutes: number;
  netHours: number;
  overtimeHours: number;
  isRegularized: boolean;
  regularizationReason: string | null;
  approvedBy: string | null;
  notes: string | null;
}

export interface AttendanceSummary {
  employeeId: string;
  month: string; // YYYY-MM
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  wfhDays: number;
  leaveDays: number;
  holidayDays: number;
  weekendDays: number;
  totalHoursWorked: number;
  totalOvertimeHours: number;
  attendancePercentage: number;
}

export interface AttendanceAnomaly {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  date: string;
  anomalyType: AnomalyType;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  isResolved: boolean;
  resolvedAt: string | null;
}

export interface TeamAttendanceRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  status: AttendanceStatus;
  clockIn: string | null;
  clockOut: string | null;
  hoursWorked: number;
  overtimeHours: number;
}

export interface ClockInOutResult {
  success: boolean;
  timestamp: string;
  method: AttendanceMethod;
  message: string;
  currentRecord: AttendanceRecord | null;
}

export interface RegularizationRequest {
  employeeId: string;
  date: string;
  reason: string;
  requestedClockIn: string | null;
  requestedClockOut: string | null;
  requestedStatus: AttendanceStatus;
  notes: string;
}

// ── Service Functions ─────────────────────────────────────────────────────────

/**
 * Record a clock-in for an employee.
 */
export async function clockIn(
  employeeId: string,
  method: AttendanceMethod,
  location?: { lat: number; lng: number; address: string }
): Promise<ClockInOutResult> {
  return APIClient.post<ClockInOutResult>('/v1/attendance/clock-in', {
    employeeId,
    clockInTime: new Date().toISOString(),
    method,
    location: location ?? null,
  });
}

/**
 * Record a clock-out for an employee.
 */
export async function clockOut(
  employeeId: string,
  method: AttendanceMethod
): Promise<ClockInOutResult> {
  return APIClient.post<ClockInOutResult>('/v1/attendance/clock-out', {
    employeeId,
    clockOutTime: new Date().toISOString(),
    method,
  });
}

/**
 * Get attendance log for an employee over a date range.
 */
export async function getAttendanceLog(
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> {
  const response = await APIClient.get<{ items: AttendanceRecord[] }>(
    '/v1/attendance/records',
    { employeeId, startDate, endDate }
  );
  return response.items;
}

/**
 * Get team attendance for a manager on a given date.
 */
export async function getTeamAttendance(
  managerId: string,
  date: string
): Promise<TeamAttendanceRecord[]> {
  const response = await APIClient.get<{ items: TeamAttendanceRecord[] }>(
    '/v1/attendance/team',
    { managerId, date }
  );
  return response.items;
}

/**
 * Calculate work hours for an employee on a date.
 */
export async function calculateWorkHours(
  employeeId: string,
  date: string
): Promise<{
  grossHours: number;
  breakMinutes: number;
  netHours: number;
  overtimeHours: number;
  status: AttendanceStatus;
}> {
  return APIClient.get('/v1/attendance/records', {
    employeeId,
    startDate: date,
    endDate: date,
  }).then((response: { items: AttendanceRecord[] }) => {
    const record = response.items[0];
    if (!record) {
      return { grossHours: 0, breakMinutes: 0, netHours: 0, overtimeHours: 0, status: 'ABSENT' as AttendanceStatus };
    }
    return {
      grossHours: record.grossHours,
      breakMinutes: record.breakMinutes,
      netHours: record.netHours,
      overtimeHours: record.overtimeHours,
      status: record.status,
    };
  });
}

/**
 * Get monthly attendance summary for an employee.
 */
export async function getAttendanceSummary(
  employeeId: string,
  month: string
): Promise<AttendanceSummary> {
  return APIClient.get<AttendanceSummary>('/v1/attendance/summary', {
    employeeId,
    month,
  });
}

/**
 * Get attendance anomalies for a date (or all unresolved).
 */
export async function getAttendanceAnomalies(date?: string): Promise<AttendanceAnomaly[]> {
  const params: Record<string, string> = {};
  if (date) params.date = date;
  const response = await APIClient.get<{ items: AttendanceAnomaly[] }>(
    '/v1/attendance/anomalies',
    params
  );
  return response.items;
}

/**
 * Regularize attendance for an employee on a specific date.
 */
export async function regularizeAttendance(request: RegularizationRequest): Promise<{
  success: boolean;
  message: string;
  record: AttendanceRecord | null;
}> {
  return APIClient.post('/v1/attendance/regularize', request);
}

/**
 * Get today's attendance snapshot for a team/department.
 */
export async function getTodaySnapshot(managerId: string): Promise<{
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  wfh: number;
  total: number;
}> {
  return APIClient.get('/v1/attendance/stats', { managerId });
}

// ── Named export (object pattern for consistency with other services) ─────────

export const attendanceService = {
  clockIn,
  clockOut,
  getAttendanceLog,
  getTeamAttendance,
  calculateWorkHours,
  getAttendanceSummary,
  getAttendanceAnomalies,
  regularizeAttendance,
  getTodaySnapshot,
};
