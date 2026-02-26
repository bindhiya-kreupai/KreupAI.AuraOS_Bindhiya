/**
 * Centralized Cache Key Definitions
 *
 * All cache keys in AuraOS are defined here to ensure consistency and
 * prevent key collisions across services.
 *
 * Key format convention:
 *   {domain}:{identifier}[:{qualifier}]
 *
 * @module @aura/cache
 */

import { createHash } from 'crypto';

// ---------------------------------------------------------------------------
// Key builders
// ---------------------------------------------------------------------------

/**
 * Compute a short hash of an object for use in list cache keys.
 * Prevents overly long keys when filter objects are used.
 */
function hashObject(obj: Record<string, unknown>): string {
  return createHash('sha256')
    .update(JSON.stringify(obj, Object.keys(obj).sort()))
    .digest('hex')
    .substring(0, 16);
}

// ---------------------------------------------------------------------------
// Employee keys
// ---------------------------------------------------------------------------

export const CACHE_KEYS = {
  // -------------------------------------------------------------------------
  // Employee
  // -------------------------------------------------------------------------

  /** Single employee record: employee:emp_123 */
  employee: (id: string) => `employee:${id}`,

  /** Paginated/filtered employee list: employee:list:a1b2c3d4e5f6g7h8 */
  employeeList: (filters: Record<string, unknown> = {}) =>
    `employee:list:${hashObject(filters)}`,

  /** Employee org chart: employee:org:{tenantId} */
  employeeOrgChart: (tenantId: string) => `employee:org:${tenantId}`,

  /** Employee count by department: employee:dept-count:{tenantId}:{deptId} */
  employeeDeptCount: (tenantId: string, deptId: string) =>
    `employee:dept-count:${tenantId}:${deptId}`,

  // -------------------------------------------------------------------------
  // Payroll
  // -------------------------------------------------------------------------

  /** Single payroll run: payroll:run:run_456 */
  payrollRun: (runId: string) => `payroll:run:${runId}`,

  /** Payroll period summary: payroll:summary:2025-01 */
  payrollSummary: (period: string) => `payroll:summary:${period}`,

  /** Employee payslip: payroll:payslip:{employeeId}:{year}:{month} */
  payslip: (employeeId: string, year: number, month: number) =>
    `payroll:payslip:${employeeId}:${year}:${String(month).padStart(2, '0')}`,

  /** Payroll run list for a tenant: payroll:runs:{tenantId} */
  payrollRunList: (tenantId: string) => `payroll:runs:${tenantId}`,

  // -------------------------------------------------------------------------
  // Leave
  // -------------------------------------------------------------------------

  /** Employee leave balance: leave:balance:emp_123:2025 */
  leaveBalance: (employeeId: string, year: number) =>
    `leave:balance:${employeeId}:${year}`,

  /** Leave request: leave:request:{leaveId} */
  leaveRequest: (leaveId: string) => `leave:request:${leaveId}`,

  /** Pending approvals for a manager: leave:pending:{managerId} */
  leavePendingApprovals: (managerId: string) => `leave:pending:${managerId}`,

  /** Leave calendar for a department: leave:calendar:{deptId}:{year}:{month} */
  leaveCalendar: (deptId: string, year: number, month: number) =>
    `leave:calendar:${deptId}:${year}:${String(month).padStart(2, '0')}`,

  // -------------------------------------------------------------------------
  // Attendance
  // -------------------------------------------------------------------------

  /** Daily attendance record: attendance:daily:emp_123:2025-01-15 */
  attendanceDaily: (employeeId: string, date: string) =>
    `attendance:daily:${employeeId}:${date}`,

  /** Monthly attendance summary: attendance:monthly:emp_123:2025-01 */
  attendanceMonthly: (employeeId: string, period: string) =>
    `attendance:monthly:${employeeId}:${period}`,

  /** Real-time clocked-in employees: attendance:live:{tenantId} */
  attendanceLive: (tenantId: string) => `attendance:live:${tenantId}`,

  // -------------------------------------------------------------------------
  // Compliance
  // -------------------------------------------------------------------------

  /** Compliance status: compliance:status:UAE:2025-01 */
  complianceStatus: (country: string, period: string) =>
    `compliance:status:${country}:${period}`,

  /** Compliance deadlines: compliance:deadlines:{tenantId} */
  complianceDeadlines: (tenantId: string) => `compliance:deadlines:${tenantId}`,

  // -------------------------------------------------------------------------
  // Configuration
  // -------------------------------------------------------------------------

  /** System config value: config:smtp.host */
  config: (key: string) => `config:${key}`,

  /** All configs for a tenant: config:tenant:{tenantId} */
  tenantConfig: (tenantId: string) => `config:tenant:${tenantId}`,

  // -------------------------------------------------------------------------
  // Session
  // -------------------------------------------------------------------------

  /** User session: session:sess_abc123 */
  session: (sessionId: string) => `session:${sessionId}`,

  /** User permissions (RBAC): permissions:{userId} */
  userPermissions: (userId: string) => `permissions:${userId}`,

  /** User profile cache: user:{userId} */
  user: (userId: string) => `user:${userId}`,

  // -------------------------------------------------------------------------
  // Department / Organisation
  // -------------------------------------------------------------------------

  /** Department info: department:{deptId} */
  department: (deptId: string) => `department:${deptId}`,

  /** All departments for a tenant: departments:{tenantId} */
  departments: (tenantId: string) => `departments:${tenantId}`,

  /** Designation list: designations:{tenantId} */
  designations: (tenantId: string) => `designations:${tenantId}`,

  // -------------------------------------------------------------------------
  // Notifications / Reports
  // -------------------------------------------------------------------------

  /** Unread notification count: notifications:unread:{userId} */
  unreadNotifications: (userId: string) => `notifications:unread:${userId}`,

  /** Generated report: report:{reportId} */
  report: (reportId: string) => `report:${reportId}`,
} as const;

// ---------------------------------------------------------------------------
// Default TTL constants (seconds)
// ---------------------------------------------------------------------------

export const CACHE_TTL = {
  /** Short-lived: real-time / frequently changing data */
  REALTIME:     15,      // 15 seconds
  /** Short: session tokens, live attendance */
  SHORT:        60,      // 1 minute
  /** Standard: entity lookups */
  STANDARD:     300,     // 5 minutes
  /** Medium: department/designation lists */
  MEDIUM:       900,     // 15 minutes
  /** Long: payroll summaries, compliance status */
  LONG:         3600,    // 1 hour
  /** Extended: config values, org charts */
  EXTENDED:     86400,   // 24 hours
  /** Session: user sessions */
  SESSION:      1800,    // 30 minutes
} as const;

// ---------------------------------------------------------------------------
// Cache tag constants
// ---------------------------------------------------------------------------

export const CACHE_TAGS = {
  EMPLOYEE:     'employee',
  LEAVE:        'leave',
  PAYROLL:      'payroll',
  ATTENDANCE:   'attendance',
  COMPLIANCE:   'compliance',
  CONFIG:       'config',
  SESSION:      'session',
  DEPARTMENT:   'department',
} as const;
