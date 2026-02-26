/**
 * @module attendanceService
 * @description Attendance management — clock in/out, logs, summaries, anomalies, regularization
 * @project AURA HCM Platform
 */

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

// ── Mock Data ──────────────────────────────────────────────────────────────────

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

const MOCK_ATTENDANCE_LOG: AttendanceRecord[] = [
  {
    id: 'att-001',
    employeeId: 'emp-self',
    employeeCode: 'EMP001',
    employeeName: 'Priya Sharma',
    date: today,
    clockIn: `${today}T09:02:00Z`,
    clockOut: null,
    clockInMethod: 'WEB',
    clockOutMethod: null,
    clockInLocation: null,
    status: 'PRESENT',
    grossHours: 0,
    breakMinutes: 0,
    netHours: 0,
    overtimeHours: 0,
    isRegularized: false,
    regularizationReason: null,
    approvedBy: null,
    notes: null,
  },
  {
    id: 'att-002',
    employeeId: 'emp-self',
    employeeCode: 'EMP001',
    employeeName: 'Priya Sharma',
    date: yesterday,
    clockIn: `${yesterday}T09:15:00Z`,
    clockOut: `${yesterday}T18:30:00Z`,
    clockInMethod: 'BIOMETRIC',
    clockOutMethod: 'BIOMETRIC',
    clockInLocation: { lat: 25.2048, lng: 55.2708, address: 'Dubai Marina Office' },
    status: 'LATE',
    grossHours: 9.25,
    breakMinutes: 45,
    netHours: 8.5,
    overtimeHours: 0.5,
    isRegularized: false,
    regularizationReason: null,
    approvedBy: null,
    notes: null,
  },
];

const MOCK_TEAM_ATTENDANCE: TeamAttendanceRecord[] = [
  {
    employeeId: 'emp-001',
    employeeCode: 'EMP001',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    designation: 'Senior Engineer',
    status: 'PRESENT',
    clockIn: `${today}T09:02:00Z`,
    clockOut: null,
    hoursWorked: 7.5,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-002',
    employeeCode: 'EMP002',
    employeeName: 'Rahul Mehta',
    department: 'Engineering',
    designation: 'Tech Lead',
    status: 'PRESENT',
    clockIn: `${today}T08:45:00Z`,
    clockOut: null,
    hoursWorked: 8.25,
    overtimeHours: 0.25,
  },
  {
    employeeId: 'emp-003',
    employeeCode: 'EMP003',
    employeeName: 'Anita Nair',
    department: 'Engineering',
    designation: 'Engineer',
    status: 'WFH',
    clockIn: `${today}T09:30:00Z`,
    clockOut: null,
    hoursWorked: 6.5,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-004',
    employeeCode: 'EMP004',
    employeeName: 'Suresh Kumar',
    department: 'Engineering',
    designation: 'Junior Engineer',
    status: 'ABSENT',
    clockIn: null,
    clockOut: null,
    hoursWorked: 0,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-005',
    employeeCode: 'EMP005',
    employeeName: 'Kavita Singh',
    department: 'Engineering',
    designation: 'QA Engineer',
    status: 'LEAVE',
    clockIn: null,
    clockOut: null,
    hoursWorked: 0,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-006',
    employeeCode: 'EMP006',
    employeeName: 'Ahmed Al-Rashid',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    status: 'LATE',
    clockIn: `${today}T10:45:00Z`,
    clockOut: null,
    hoursWorked: 5.25,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-007',
    employeeCode: 'EMP007',
    employeeName: 'Fatima Al-Hassan',
    department: 'Engineering',
    designation: 'UI Designer',
    status: 'PRESENT',
    clockIn: `${today}T09:00:00Z`,
    clockOut: null,
    hoursWorked: 7.0,
    overtimeHours: 0,
  },
  {
    employeeId: 'emp-008',
    employeeCode: 'EMP008',
    employeeName: 'David Chen',
    department: 'Engineering',
    designation: 'Backend Engineer',
    status: 'PRESENT',
    clockIn: `${today}T09:10:00Z`,
    clockOut: null,
    hoursWorked: 7.8,
    overtimeHours: 0,
  },
];

const MOCK_ANOMALIES: AttendanceAnomaly[] = [
  {
    id: 'anom-001',
    employeeId: 'emp-004',
    employeeCode: 'EMP004',
    employeeName: 'Suresh Kumar',
    department: 'Engineering',
    date: yesterday,
    anomalyType: 'MISSING_PUNCH_OUT',
    description: 'Employee punched in but no clock-out recorded',
    severity: 'MEDIUM',
    isResolved: false,
    resolvedAt: null,
  },
  {
    id: 'anom-002',
    employeeId: 'emp-006',
    employeeCode: 'EMP006',
    employeeName: 'Ahmed Al-Rashid',
    department: 'Engineering',
    date: today,
    anomalyType: 'LATE_ARRIVAL',
    description: 'Arrived 1h 45m after shift start (09:00)',
    severity: 'LOW',
    isResolved: false,
    resolvedAt: null,
  },
  {
    id: 'anom-003',
    employeeId: 'emp-009',
    employeeCode: 'EMP009',
    employeeName: 'Meera Pillai',
    department: 'HR',
    date: yesterday,
    anomalyType: 'MISSING_PUNCH_IN',
    description: 'No clock-in recorded — possible biometric failure',
    severity: 'MEDIUM',
    isResolved: false,
    resolvedAt: null,
  },
];

// ── Helper Functions ───────────────────────────────────────────────────────────

function buildMonthSummary(employeeId: string, month: string): AttendanceSummary {
  return {
    employeeId,
    month,
    totalWorkingDays: 26,
    presentDays: 20,
    absentDays: 1,
    lateDays: 2,
    halfDays: 1,
    wfhDays: 3,
    leaveDays: 1,
    holidayDays: 2,
    weekendDays: 8,
    totalHoursWorked: 170,
    totalOvertimeHours: 4.5,
    attendancePercentage: 92.3,
  };
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
  const now = new Date().toISOString();

  // In production: check for existing open record, write to DB
  const newRecord: AttendanceRecord = {
    id: `att-${Date.now()}`,
    employeeId,
    employeeCode: 'EMP001',
    employeeName: 'Current User',
    date: now.slice(0, 10),
    clockIn: now,
    clockOut: null,
    clockInMethod: method,
    clockOutMethod: null,
    clockInLocation: location ?? null,
    status: 'PRESENT',
    grossHours: 0,
    breakMinutes: 0,
    netHours: 0,
    overtimeHours: 0,
    isRegularized: false,
    regularizationReason: null,
    approvedBy: null,
    notes: null,
  };

  return {
    success: true,
    timestamp: now,
    method,
    message: `Clock-in recorded successfully at ${new Date(now).toLocaleTimeString()}`,
    currentRecord: newRecord,
  };
}

/**
 * Record a clock-out for an employee.
 */
export async function clockOut(
  employeeId: string,
  method: AttendanceMethod
): Promise<ClockInOutResult> {
  const now = new Date().toISOString();

  return {
    success: true,
    timestamp: now,
    method,
    message: `Clock-out recorded successfully at ${new Date(now).toLocaleTimeString()}`,
    currentRecord: null,
  };
}

/**
 * Get attendance log for an employee over a date range.
 */
export async function getAttendanceLog(
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> {
  return MOCK_ATTENDANCE_LOG.filter(
    (r) => r.employeeId === employeeId && r.date >= startDate && r.date <= endDate
  );
}

/**
 * Get team attendance for a manager on a given date.
 */
export async function getTeamAttendance(
  _managerId: string,
  _date: string
): Promise<TeamAttendanceRecord[]> {
  return MOCK_TEAM_ATTENDANCE;
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
  const record = MOCK_ATTENDANCE_LOG.find((r) => r.employeeId === employeeId && r.date === date);
  if (!record)
    return { grossHours: 0, breakMinutes: 0, netHours: 0, overtimeHours: 0, status: 'ABSENT' };

  return {
    grossHours: record.grossHours,
    breakMinutes: record.breakMinutes,
    netHours: record.netHours,
    overtimeHours: record.overtimeHours,
    status: record.status,
  };
}

/**
 * Get monthly attendance summary for an employee.
 */
export async function getAttendanceSummary(
  employeeId: string,
  month: string
): Promise<AttendanceSummary> {
  return buildMonthSummary(employeeId, month);
}

/**
 * Get attendance anomalies for a date (or all unresolved).
 */
export async function getAttendanceAnomalies(date?: string): Promise<AttendanceAnomaly[]> {
  if (!date) return MOCK_ANOMALIES.filter((a) => !a.isResolved);
  return MOCK_ANOMALIES.filter((a) => a.date === date);
}

/**
 * Regularize attendance for an employee on a specific date.
 */
export async function regularizeAttendance(_request: RegularizationRequest): Promise<{
  success: boolean;
  message: string;
  record: AttendanceRecord | null;
}> {
  // In production: create regularization workflow, pending manager approval
  return {
    success: true,
    message: 'Regularization request submitted for approval',
    record: null,
  };
}

/**
 * Get today's attendance snapshot for a team/department.
 */
export async function getTodaySnapshot(_managerId: string): Promise<{
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  wfh: number;
  total: number;
}> {
  const records = MOCK_TEAM_ATTENDANCE;
  return {
    present: records.filter((r) => r.status === 'PRESENT').length,
    absent: records.filter((r) => r.status === 'ABSENT').length,
    late: records.filter((r) => r.status === 'LATE').length,
    onLeave: records.filter((r) => r.status === 'LEAVE').length,
    wfh: records.filter((r) => r.status === 'WFH').length,
    total: records.length,
  };
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
