// @ts-nocheck — Lib drift / missing typings. Tracked under #29.
/**
 * HR Agent Service
 * Phase 4 Sprint 31-32: Autonomous HR Assistant
 *
 * Handles:
 * - Leave management (balance, apply, status, cancel)
 * - Attendance queries and corrections
 * - Payslip and tax information
 * - Policy queries
 * - Employee profile updates
 */

import type {
  AgentDefinition,
  AgentResponse,
  ConversationContext,
  AgentAction,
  LeaveQueryIntent,
  AttendanceQueryIntent,
  PayrollQueryIntent,
} from './types';
import {
  AgentCapability,
  DetectedIntent,
  HRAgentCapabilities,
  ExecutionPlan,
  ExecutionStep,
} from './types';
import { AgentFrameworkService } from './agent-framework.service';

/**
 * Leave Balance Result
 */
interface LeaveBalance {
  leaveType: string;
  leaveTypeName: string;
  entitled: number;
  used: number;
  pending: number;
  balance: number;
  carryForward: number;
  expiryDate?: Date;
}

/**
 * Leave Request
 */
interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  reason: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  appliedAt: Date;
  approver?: string;
  approvedAt?: Date;
  comments?: string;
}

/**
 * Attendance Record
 */
interface AttendanceRecord {
  date: Date;
  checkIn?: string;
  checkOut?: string;
  workingHours?: number;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY' | 'WFH' | 'HALF_DAY';
  lateBy?: number;
  earlyBy?: number;
  overtimeHours?: number;
}

/**
 * HR Agent Service
 */
export class HRAgentService {
  private static agentDefinition: AgentDefinition = {
    id: 'hr_agent_v1',
    type: 'HR_AGENT',
    name: 'HR Assistant',
    description: 'Your personal HR assistant for leave, attendance, payroll, and HR policies',
    capabilities: [
      {
        id: 'leave_management',
        name: 'Leave Management',
        description: 'Check leave balance, apply for leave, track leave status',
        intents: ['LEAVE_BALANCE', 'LEAVE_APPLY', 'LEAVE_STATUS', 'LEAVE_CANCEL', 'LEAVE_HISTORY'],
        actions: ['QUERY_DATA', 'CREATE_RECORD', 'UPDATE_RECORD', 'SEND_NOTIFICATION'],
        requiredPermissions: ['leave:read', 'leave:write'],
      },
      {
        id: 'attendance_management',
        name: 'Attendance Management',
        description: 'View attendance, request corrections, apply for WFH',
        intents: ['ATTENDANCE_TODAY', 'ATTENDANCE_HISTORY', 'ATTENDANCE_CORRECTION', 'WFH_REQUEST'],
        actions: ['QUERY_DATA', 'CREATE_RECORD', 'SEND_NOTIFICATION'],
        requiredPermissions: ['attendance:read', 'attendance:write'],
      },
      {
        id: 'payroll_queries',
        name: 'Payroll Queries',
        description: 'View payslips, check tax deductions, submit reimbursements',
        intents: ['PAYSLIP_VIEW', 'TAX_DETAILS', 'SALARY_STRUCTURE', 'REIMBURSEMENT'],
        actions: ['QUERY_DATA', 'GENERATE_REPORT', 'CREATE_RECORD'],
        requiredPermissions: ['payroll:read'],
      },
      {
        id: 'policy_queries',
        name: 'HR Policy Queries',
        description: 'Search and explain HR policies',
        intents: ['POLICY_SEARCH', 'POLICY_EXPLAIN'],
        actions: ['QUERY_DATA'],
        requiredPermissions: ['policy:read'],
      },
      {
        id: 'profile_management',
        name: 'Profile Management',
        description: 'Update personal information, request documents',
        intents: ['PROFILE_UPDATE', 'DOCUMENT_REQUEST'],
        actions: ['QUERY_DATA', 'UPDATE_RECORD', 'GENERATE_REPORT'],
        requiredPermissions: ['profile:read', 'profile:write'],
      },
    ],
    permissions: [
      { resource: 'leave', actions: ['read', 'write'] },
      { resource: 'attendance', actions: ['read', 'write'] },
      { resource: 'payroll', actions: ['read'] },
      { resource: 'policy', actions: ['read'] },
      { resource: 'profile', actions: ['read', 'write'] },
    ],
    configuration: {
      maxConcurrentTasks: 5,
      taskTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      autonomyLevel: 'SUPERVISED',
      escalationRules: [
        {
          condition: 'leave.duration > 5',
          action: 'NOTIFY',
          target: 'hr_manager',
          message: 'Long leave request submitted for review',
        },
        {
          condition: 'attendance.correction.count > 3',
          action: 'ESCALATE',
          target: 'supervisor',
          message: 'Multiple attendance corrections requested',
        },
      ],
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  /**
   * Initialize HR Agent
   */
  static initialize(): void {
    AgentFrameworkService.registerAgent(this.agentDefinition);
  }

  /**
   * Get agent definition
   */
  static getDefinition(): AgentDefinition {
    return this.agentDefinition;
  }

  // ============================================================================
  // LEAVE MANAGEMENT
  // ============================================================================

  /**
   * Normalize leave type strings for flexible matching (code, name, or natural language).
   */
  private static normalizeLeaveTypeKey(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /**
   * Match a user/LLM leave type against policy code or display name.
   * Accepts "ANNUAL", "annual leave", "Annual Leave", etc.
   */
  private static leaveTypeMatches(balance: LeaveBalance, leaveType: string): boolean {
    const query = this.normalizeLeaveTypeKey(leaveType);
    if (!query) return false;

    const code = this.normalizeLeaveTypeKey(balance.leaveType);
    const name = this.normalizeLeaveTypeKey(balance.leaveTypeName);

    if (code === query || name === query) return true;

    // Substring match for phrases like "annual" → "Annual Leave" / "ANNUALLEAVE"
    if (query.length >= 3) {
      if (name.includes(query) || code.includes(query)) return true;
      if (query.includes(name) || (code.length >= 3 && query.includes(code))) return true;
    }

    return false;
  }

  /**
   * Match a leave type query against policy code/name.
   */
  private static policyTypeMatches(
    policy: { code: string; name: string },
    leaveType: string
  ): boolean {
    return this.leaveTypeMatches(
      {
        leaveType: policy.code,
        leaveTypeName: policy.name,
        entitled: 0,
        used: 0,
        pending: 0,
        balance: 0,
        carryForward: 0,
      },
      leaveType
    );
  }

  /**
   * Get leave balance for employee. Falls back to the most recent leave year when
   * the current year has no rows (see LeaveService.getBalanceByEmployee).
   */
  static async getLeaveBalance(
    employeeId: string,
    tenantId: string,
    leaveType?: string
  ): Promise<LeaveBalance[]> {
    const { LeaveService } = await import('@/lib/services/leave.service');

    const rows = await LeaveService.getBalanceByEmployee(tenantId, employeeId).catch(() => []);
    const allBalances: LeaveBalance[] = rows.map((b) => ({
      leaveType: b.policy?.code || b.policyId,
      leaveTypeName: b.policy?.name || 'Leave',
      entitled: Number(b.openingBalance) + Number(b.accrued) + Number(b.carriedForward),
      used: Number(b.taken),
      pending: 0,
      balance: Number(b.currentBalance),
      carryForward: Number(b.carriedForward),
    }));

    if (leaveType) {
      return allBalances.filter((b) => this.leaveTypeMatches(b, leaveType));
    }
    return allBalances;
  }

  /**
   * Apply for leave — resolves policy by code/name (balance optional, matches /api/v1/leave/apply).
   */
  static async applyLeave(
    employeeId: string,
    tenantId: string,
    request: {
      leaveType: string;
      startDate: Date;
      endDate: Date;
      reason: string;
      halfDay?: boolean;
      halfDayPeriod?: 'FIRST_HALF' | 'SECOND_HALF';
    }
  ): Promise<LeaveRequest> {
    const { prisma } = await import('@aura/database');
    const { LeaveService } = await import('@/lib/services/leave.service');

    const policies = await prisma.leavePolicy.findMany({
      where: { tenantId, isDeleted: false, isActive: true },
      take: 50,
    });

    const policy =
      policies.find((p) => this.policyTypeMatches(p, request.leaveType)) ||
      (await prisma.leavePolicy.findFirst({
        where: {
          tenantId,
          isDeleted: false,
          OR: [
            { code: { equals: request.leaveType, mode: 'insensitive' } },
            { name: { contains: request.leaveType, mode: 'insensitive' } },
          ],
        },
      }));

    if (!policy) {
      const available = policies.map((p) => `${p.name} (${p.code})`).join(', ');
      throw new Error(
        available
          ? `Invalid leave type "${request.leaveType}". Available: ${available}`
          : `Invalid leave type "${request.leaveType}". No leave policies are configured for your organization.`
      );
    }

    const duration = this.calculateLeaveDuration(
      request.startDate,
      request.endDate,
      request.halfDay
    );

    const leaveYear = request.startDate.getFullYear();
    const balanceRow = await prisma.leaveBalance.findFirst({
      where: {
        tenantId,
        employeeId,
        policyId: policy.id,
        leaveYear,
        isDeleted: false,
      },
    });

    if (
      balanceRow &&
      duration > Number(balanceRow.currentBalance) &&
      !policy.allowNegativeBalance
    ) {
      throw new Error(
        `Insufficient leave balance. Available: ${Number(balanceRow.currentBalance)} days, Requested: ${duration} days`
      );
    }

    const overlapping = await this.checkOverlappingLeaves(
      employeeId,
      request.startDate,
      request.endDate
    );
    if (overlapping) {
      throw new Error('You already have a leave request for this period');
    }

    const created = await LeaveService.createRequest({
      tenantId,
      employeeId,
      leaveTypeId: policy.leaveTypeId,
      policyId: policy.id,
      startDate: request.startDate,
      endDate: request.endDate,
      totalDays: duration,
      halfDayStart: Boolean(request.halfDay),
      reason: request.reason,
    });

    return {
      id: created.id,
      employeeId: created.employeeId,
      leaveType: policy.name || request.leaveType,
      startDate: created.startDate,
      endDate: created.endDate,
      duration: Number(created.totalDays),
      reason: created.reason,
      status: created.status as LeaveRequest['status'],
      appliedAt: created.appliedAt || created.createdAt,
    };
  }

  /**
   * Calculate leave duration
   */
  private static calculateLeaveDuration(startDate: Date, endDate: Date, halfDay?: boolean): number {
    if (halfDay) {
      return 0.5;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    let duration = 0;

    while (start <= end) {
      const day = start.getDay();
      if (day !== 0 && day !== 6) {
        // Exclude weekends
        duration++;
      }
      start.setDate(start.getDate() + 1);
    }

    return duration;
  }

  /**
   * Check for overlapping leaves
   */
  private static async checkOverlappingLeaves(
    employeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    const { prisma } = await import('@aura/database');
    const overlap = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        isDeleted: false,
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });
    return Boolean(overlap);
  }

  /**
   * Get leave requests
   */
  static async getLeaveRequests(
    employeeId: string,
    tenantId: string,
    filters?: {
      status?: LeaveRequest['status'];
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<LeaveRequest[]> {
    const { prisma } = await import('@aura/database');

    const rows = await prisma.leaveRequest
      .findMany({
        where: {
          tenantId,
          employeeId,
          isDeleted: false,
          ...(filters?.status ? { status: filters.status } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })
      .catch(() => []);

    return rows.map((r) => ({
      id: r.id,
      employeeId: r.employeeId,
      leaveType: r.leaveTypeId,
      startDate: r.startDate,
      endDate: r.endDate,
      duration: Number(r.totalDays),
      reason: r.reason || '',
      status: r.status as LeaveRequest['status'],
      appliedAt: r.createdAt,
    }));
  }

  /**
   * Cancel leave request
   */
  static async cancelLeave(
    leaveId: string,
    employeeId: string,
    reason: string
  ): Promise<LeaveRequest> {
    const { prisma } = await import('@aura/database');
    const existing = await prisma.leaveRequest.findFirst({
      where: { id: leaveId, employeeId, isDeleted: false },
    });
    if (!existing) throw new Error('Leave request not found');
    if (!['PENDING', 'APPROVED'].includes(existing.status)) {
      throw new Error('Leave request cannot be cancelled');
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: employeeId,
        cancellationReason: reason,
      },
    });

    return {
      id: updated.id,
      employeeId: updated.employeeId,
      leaveType: updated.leaveTypeId,
      startDate: updated.startDate,
      endDate: updated.endDate,
      duration: Number(updated.totalDays),
      reason: updated.reason || '',
      status: 'CANCELLED',
      appliedAt: updated.appliedAt || updated.createdAt,
      comments: reason,
    };
  }

  // ============================================================================
  // ATTENDANCE MANAGEMENT
  // ============================================================================

  /**
   * Get today's attendance
   */
  static async getTodayAttendance(employeeId: string, tenantId: string): Promise<AttendanceRecord> {
    const { prisma } = await import('@aura/database');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const record = await prisma.attendanceRecord
      .findFirst({
        where: {
          tenantId,
          employeeId,
          isDeleted: false,
          date: { gte: today, lt: tomorrow },
        },
      })
      .catch(() => null);

    if (!record) {
      return { date: new Date(), status: 'ABSENT' };
    }

    return {
      date: record.date,
      checkIn: record.clockIn
        ? record.clockIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : undefined,
      checkOut: record.clockOut
        ? record.clockOut.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : undefined,
      workingHours: record.workHours,
      status: (record.status?.toUpperCase() || 'PRESENT') as AttendanceRecord['status'],
      lateBy: record.isLate ? 15 : undefined,
    };
  }

  /**
   * Get attendance history
   */
  static async getAttendanceHistory(
    employeeId: string,
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AttendanceRecord[]> {
    const { prisma } = await import('@aura/database');
    const rows = await prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        employeeId,
        isDeleted: false,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    return rows.map((record) => ({
      date: record.date,
      checkIn: record.clockIn
        ? record.clockIn.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : undefined,
      checkOut: record.clockOut
        ? record.clockOut.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : undefined,
      workingHours: record.workHours,
      status: (record.status?.toUpperCase() || 'PRESENT') as AttendanceRecord['status'],
      lateBy: record.isLate ? 1 : undefined,
      overtimeHours: record.overtimeHours,
    }));
  }

  /**
   * Get attendance summary
   */
  static async getAttendanceSummary(
    employeeId: string,
    tenantId: string,
    month: number,
    year: number
  ): Promise<{
    totalDays: number;
    present: number;
    absent: number;
    leaves: number;
    holidays: number;
    wfh: number;
    lateCount: number;
    avgWorkingHours: number;
    overtimeHours: number;
  }> {
    const { prisma } = await import('@aura/database');
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const rows = await prisma.attendanceRecord.findMany({
      where: {
        tenantId,
        employeeId,
        isDeleted: false,
        date: { gte: start, lte: end },
      },
    });

    const statusOf = (s: string) => s.toUpperCase();
    const present = rows.filter((r) =>
      ['PRESENT', 'WFH', 'HALF_DAY'].includes(statusOf(r.status))
    ).length;
    const absent = rows.filter((r) => statusOf(r.status) === 'ABSENT').length;
    const leaves = rows.filter((r) => statusOf(r.status) === 'LEAVE').length;
    const holidays = rows.filter((r) => statusOf(r.status) === 'HOLIDAY').length;
    const wfh = rows.filter((r) => statusOf(r.status) === 'WFH').length;
    const lateCount = rows.filter((r) => r.isLate).length;
    const workHours = rows.map((r) => r.workHours || 0);
    const avgWorkingHours = workHours.length
      ? workHours.reduce((a, b) => a + b, 0) / workHours.length
      : 0;
    const overtimeHours = rows.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

    return {
      totalDays: rows.length,
      present,
      absent,
      leaves,
      holidays,
      wfh,
      lateCount,
      avgWorkingHours: Math.round(avgWorkingHours * 10) / 10,
      overtimeHours,
    };
  }

  /**
   * Request attendance correction
   */
  static async requestAttendanceCorrection(
    employeeId: string,
    tenantId: string,
    request: {
      date: Date;
      checkIn?: string;
      checkOut?: string;
      reason: string;
    }
  ): Promise<{ id: string; status: string }> {
    return {
      id: `corr_${Date.now()}`,
      status: 'PENDING_APPROVAL',
    };
  }

  /**
   * Apply for work from home
   */
  static async applyWFH(
    employeeId: string,
    tenantId: string,
    request: {
      date: Date;
      reason: string;
    }
  ): Promise<{ id: string; status: string }> {
    return {
      id: `wfh_${Date.now()}`,
      status: 'PENDING_APPROVAL',
    };
  }

  // ============================================================================
  // PAYROLL QUERIES
  // ============================================================================

  /**
   * Get payslip
   */
  static async getPayslip(
    employeeId: string,
    tenantId: string,
    month: number,
    year: number
  ): Promise<{
    month: string;
    year: number;
    earnings: { component: string; amount: number }[];
    deductions: { component: string; amount: number }[];
    grossEarnings: number;
    totalDeductions: number;
    netPay: number;
    bankAccount: string;
    payDate: Date;
  }> {
    const { prisma } = await import('@aura/database');
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const payrollMonth = `${year}-${String(month).padStart(2, '0')}`;

    const run = await prisma.payrollRun.findFirst({
      where: { tenantId, payrollMonth, isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!run) {
      throw new Error(`No payroll run found for ${monthNames[month - 1]} ${year}`);
    }

    const slip = await prisma.payslip.findFirst({
      where: { payrollRunId: run.id, employeeId, isDeleted: false },
    });

    if (!slip) {
      throw new Error(`No payslip found for ${monthNames[month - 1]} ${year}`);
    }

    const earningsRaw = Array.isArray(slip.earnings) ? slip.earnings : [];
    const deductionsRaw = Array.isArray(slip.deductions) ? slip.deductions : [];

    const earnings = earningsRaw.map((e: unknown) => {
      const item = e as { component?: string; name?: string; amount?: number };
      return {
        component: String(item.component || item.name || 'Earning'),
        amount: Number(item.amount || 0),
      };
    });
    const deductions = deductionsRaw.map((d: unknown) => {
      const item = d as { component?: string; name?: string; amount?: number };
      return {
        component: String(item.component || item.name || 'Deduction'),
        amount: Number(item.amount || 0),
      };
    });

    const profile = await prisma.employeePayrollProfile.findFirst({
      where: { tenantId, employeeId, isDeleted: false },
      select: { bankAccountNumber: true },
    });

    const acct = profile?.bankAccountNumber || '';
    const masked = acct.length > 4 ? `XXXX-XXXX-${acct.slice(-4)}` : 'N/A';

    return {
      month: monthNames[month - 1],
      year,
      earnings,
      deductions,
      grossEarnings: Number(slip.grossSalary),
      totalDeductions: Number(slip.totalDeductions),
      netPay: Number(slip.netSalary),
      bankAccount: masked,
      payDate: run.paidAt || run.processedAt || run.createdAt,
    };
  }

  /**
   * Get tax details
   */
  static async getTaxDetails(
    employeeId: string,
    tenantId: string,
    financialYear: string
  ): Promise<{
    regime: 'OLD' | 'NEW';
    grossSalary: number;
    exemptions: number;
    taxableIncome: number;
    taxPayable: number;
    tdsDeducted: number;
    balance: number;
    monthlyTDS: { month: string; amount: number }[];
  }> {
    const { prisma } = await import('@aura/database');
    // financialYear like "2024-25" → use first year for payrollMonth prefix
    const startYear = Number(String(financialYear).split('-')[0]) || new Date().getFullYear();
    const months: string[] = [];
    for (let m = 4; m <= 12; m++) months.push(`${startYear}-${String(m).padStart(2, '0')}`);
    for (let m = 1; m <= 3; m++) months.push(`${startYear + 1}-${String(m).padStart(2, '0')}`);

    const runs = await prisma.payrollRun.findMany({
      where: { tenantId, payrollMonth: { in: months }, isDeleted: false },
      select: { id: true, payrollMonth: true },
    });

    const runIds = runs.map((r) => r.id);
    const slips = runIds.length
      ? await prisma.payslip.findMany({
          where: { employeeId, payrollRunId: { in: runIds }, isDeleted: false },
          select: { payrollRunId: true, employeeTDS: true, grossSalary: true },
        })
      : [];

    const monthName = (pm: string) => {
      const idx = Number(pm.split('-')[1]) - 1;
      return (
        [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ][idx] || pm
      );
    };

    const runMonth = new Map(runs.map((r) => [r.id, r.payrollMonth]));
    const monthlyTDS = slips.map((s) => ({
      month: monthName(runMonth.get(s.payrollRunId) || ''),
      amount: Number(s.employeeTDS || 0),
    }));

    const grossSalary = slips.reduce((sum, s) => sum + Number(s.grossSalary || 0), 0);
    const tdsDeducted = slips.reduce((sum, s) => sum + Number(s.employeeTDS || 0), 0);

    return {
      regime: 'NEW',
      grossSalary,
      exemptions: 0,
      taxableIncome: grossSalary,
      taxPayable: tdsDeducted,
      tdsDeducted,
      balance: 0,
      monthlyTDS,
    };
  }

  /**
   * Get salary structure
   */
  static async getSalaryStructure(
    employeeId: string,
    tenantId: string
  ): Promise<{
    effectiveDate: Date;
    annual: { component: string; amount: number; type: 'FIXED' | 'VARIABLE' }[];
    monthly: { component: string; amount: number }[];
    totalCTC: number;
    takeHome: number;
  }> {
    const { prisma } = await import('@aura/database');
    const structure = await prisma.employeeSalaryStructure.findFirst({
      where: { tenantId, employeeId, isActive: true, isDeleted: false },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!structure) {
      throw new Error('No active salary structure found for your account');
    }

    const basic = Number(structure.basicSalary);
    const hra = Number(structure.houseRentAllowance);
    const transport = Number(structure.transportAllowance);
    const medical = Number(structure.medicalInsurance);
    const other =
      structure.otherAllowances && typeof structure.otherAllowances === 'object'
        ? Object.entries(structure.otherAllowances as Record<string, unknown>).map(([k, v]) => ({
            component: k,
            amount: Number(v) || 0,
          }))
        : [];

    const monthly = [
      { component: 'Basic Salary', amount: basic },
      { component: 'House Rent Allowance', amount: hra },
      { component: 'Transport Allowance', amount: transport },
      { component: 'Medical Insurance', amount: medical },
      ...other,
    ].filter((c) => c.amount > 0);

    const annual = monthly.map((c) => ({
      component: c.component,
      amount: c.amount * 12,
      type: 'FIXED' as const,
    }));

    return {
      effectiveDate: structure.effectiveFrom,
      annual,
      monthly,
      totalCTC: Number(structure.ctc),
      takeHome: Number(structure.grossSalary) * 12,
    };
  }

  // ============================================================================
  // POLICY QUERIES
  // ============================================================================

  /**
   * Search HR policies
   */
  static async searchPolicies(
    tenantId: string,
    query: string
  ): Promise<
    {
      id: string;
      title: string;
      category: string;
      summary: string;
      relevance: number;
    }[]
  > {
    const { prisma } = await import('@aura/database');
    const q = query.trim();
    const policies = await prisma.policyDocument.findMany({
      where: {
        tenantId,
        isDeleted: false,
        status: { in: ['PUBLISHED', 'ACTIVE', 'Published'] },
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { category: { contains: q, mode: 'insensitive' } },
                { summary: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      take: 20,
      orderBy: { updatedAt: 'desc' },
    });

    const queryLower = q.toLowerCase();
    return policies
      .map((p) => {
        let relevance = 0;
        if (queryLower && p.title.toLowerCase().includes(queryLower)) relevance += 2;
        if (queryLower && p.category.toLowerCase().includes(queryLower)) relevance += 1;
        if (queryLower && (p.summary || '').toLowerCase().includes(queryLower)) relevance += 1;
        return {
          id: p.id,
          title: p.title,
          category: p.category,
          summary: p.summary || '',
          relevance: relevance || 1,
        };
      })
      .sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Get policy details
   */
  static async getPolicyDetails(
    tenantId: string,
    policyId: string
  ): Promise<{
    id: string;
    title: string;
    category: string;
    version: string;
    effectiveDate: Date;
    content: string;
    faqs: { question: string; answer: string }[];
  }> {
    const { prisma } = await import('@aura/database');
    const policy = await prisma.policyDocument.findFirst({
      where: { id: policyId, tenantId, isDeleted: false },
    });
    if (!policy) throw new Error('Policy not found');

    return {
      id: policy.id,
      title: policy.title,
      category: policy.category,
      version: policy.version,
      effectiveDate: policy.effectiveDate || policy.publishedAt || policy.createdAt,
      content: policy.contentMarkdown || policy.summary || '',
      faqs: [],
    };
  }

  // ============================================================================
  // DOCUMENT REQUESTS
  // ============================================================================

  /**
   * Request employment document
   */
  static async requestDocument(
    employeeId: string,
    tenantId: string,
    documentType:
      | 'EMPLOYMENT_LETTER'
      | 'SALARY_CERTIFICATE'
      | 'EXPERIENCE_LETTER'
      | 'PAYSLIP'
      | 'FORM_16',
    options?: {
      addressTo?: string;
      purpose?: string;
      additionalDetails?: string;
    }
  ): Promise<{
    requestId: string;
    documentType: string;
    status: string;
    estimatedDelivery: Date;
  }> {
    // Document generation is supervised: create a tracked request ID only.
    // Actual letter generation happens in the HR documents module after human review.
    const requestId = crypto.randomUUID();
    const estimatedDays: Record<string, number> = {
      EMPLOYMENT_LETTER: 2,
      SALARY_CERTIFICATE: 2,
      EXPERIENCE_LETTER: 3,
      PAYSLIP: 0,
      FORM_16: 1,
    };
    const delivery = new Date();
    delivery.setDate(delivery.getDate() + (estimatedDays[documentType] || 3));

    // Persist audit trail on an agent conversation metadata row when possible
    const { prisma } = await import('@aura/database');
    await prisma.aIAgentConversation
      .create({
        data: {
          tenantId,
          userId: employeeId,
          agentType: 'HR_AGENT',
          sessionId: `doc-request-${requestId}`,
          title: `Document request: ${documentType}`,
          metadata: {
            type: 'DOCUMENT_REQUEST',
            documentType,
            employeeId,
            options: options || {},
            status: documentType === 'PAYSLIP' ? 'READY' : 'PROCESSING',
          },
          createdBy: employeeId,
        },
      })
      .catch(() => null);

    return {
      requestId,
      documentType,
      status: documentType === 'PAYSLIP' ? 'READY' : 'PROCESSING',
      estimatedDelivery: delivery,
    };
  }

  // ============================================================================
  // CONVERSATION HANDLING
  // ============================================================================

  /**
   * Handle leave-related intents
   */
  static async handleLeaveIntent(
    intent: LeaveQueryIntent,
    context: ConversationContext
  ): Promise<AgentResponse> {
    let content = '';
    const actions: AgentAction[] = [];

    switch (intent.type) {
      case 'BALANCE': {
        const balances = await this.getLeaveBalance(
          context.userId,
          context.tenantId,
          intent.leaveType
        );
        content = this.formatLeaveBalance(balances);
        break;
      }

      case 'APPLY': {
        if (!intent.startDate || !intent.endDate || !intent.leaveType) {
          return {
            sessionId: context.sessionId,
            messageId: `msg_${Date.now()}`,
            agentType: 'HR_AGENT',
            content: 'To apply for leave, please provide the leave type, start date, and end date.',
            contentType: 'text',
            requiresInput: {
              type: 'text',
              prompt:
                'Please provide leave details (e.g., "Annual leave from Dec 25 to Dec 27 for family vacation")',
            },
            timestamp: new Date(),
          };
        }

        const leaveRequest = await this.applyLeave(context.userId, context.tenantId, {
          leaveType: intent.leaveType,
          startDate: intent.startDate,
          endDate: intent.endDate,
          reason: intent.reason || 'Personal',
        });
        content = `✅ Leave request submitted successfully!\n\n- **Request ID:** ${leaveRequest.id}\n- **Type:** ${leaveRequest.leaveType}\n- **Duration:** ${leaveRequest.duration} days\n- **Status:** Pending Approval`;
        break;
      }

      case 'STATUS': {
        const requests = await this.getLeaveRequests(context.userId, context.tenantId);
        content = this.formatLeaveRequests(requests);
        break;
      }

      case 'CANCEL': {
        content = 'To cancel a leave request, please provide the leave request ID.';
        break;
      }

      case 'HISTORY': {
        const history = await this.getLeaveRequests(context.userId, context.tenantId);
        content = this.formatLeaveHistory(history);
        break;
      }
    }

    return {
      sessionId: context.sessionId,
      messageId: `msg_${Date.now()}`,
      agentType: 'HR_AGENT',
      content,
      contentType: 'markdown',
      actions,
      suggestions: [
        { id: '1', type: 'quick_reply', label: 'Apply leave', value: 'I want to apply for leave' },
        { id: '2', type: 'quick_reply', label: 'Check attendance', value: 'Show my attendance' },
      ],
      timestamp: new Date(),
    };
  }

  /**
   * Handle attendance-related intents
   */
  static async handleAttendanceIntent(
    intent: AttendanceQueryIntent,
    context: ConversationContext
  ): Promise<AgentResponse> {
    let content = '';

    switch (intent.type) {
      case 'TODAY': {
        const attendance = await this.getTodayAttendance(context.userId, context.tenantId);
        content = this.formatTodayAttendance(attendance);
        break;
      }

      case 'RANGE': {
        const startDate =
          intent.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = intent.endDate || new Date();
        const summary = await this.getAttendanceSummary(
          context.userId,
          context.tenantId,
          startDate.getMonth() + 1,
          startDate.getFullYear()
        );
        content = this.formatAttendanceSummary(summary);
        break;
      }

      case 'SUMMARY': {
        const now = new Date();
        const summary = await this.getAttendanceSummary(
          context.userId,
          context.tenantId,
          now.getMonth() + 1,
          now.getFullYear()
        );
        content = this.formatAttendanceSummary(summary);
        break;
      }

      case 'CORRECTION': {
        content =
          'To request an attendance correction, please provide the date and the correct check-in/check-out times.';
        break;
      }
    }

    return {
      sessionId: context.sessionId,
      messageId: `msg_${Date.now()}`,
      agentType: 'HR_AGENT',
      content,
      contentType: 'markdown',
      timestamp: new Date(),
    };
  }

  /**
   * Handle payroll-related intents
   */
  static async handlePayrollIntent(
    intent: PayrollQueryIntent,
    context: ConversationContext
  ): Promise<AgentResponse> {
    let content = '';
    const now = new Date();
    const month = intent.month || now.getMonth() + 1;
    const year = intent.year || now.getFullYear();

    switch (intent.type) {
      case 'PAYSLIP': {
        const payslip = await this.getPayslip(context.userId, context.tenantId, month, year);
        content = this.formatPayslip(payslip);
        break;
      }

      case 'TAX': {
        const fy = year > 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
        const tax = await this.getTaxDetails(context.userId, context.tenantId, fy);
        content = this.formatTaxDetails(tax);
        break;
      }

      case 'SALARY_STRUCTURE': {
        const structure = await this.getSalaryStructure(context.userId, context.tenantId);
        content = this.formatSalaryStructure(structure);
        break;
      }

      case 'REIMBURSEMENT': {
        content =
          'To submit a reimbursement, please upload your expense bills through the expense portal or describe your expense.';
        break;
      }
    }

    return {
      sessionId: context.sessionId,
      messageId: `msg_${Date.now()}`,
      agentType: 'HR_AGENT',
      content,
      contentType: 'markdown',
      timestamp: new Date(),
    };
  }

  // ============================================================================
  // FORMATTING HELPERS
  // ============================================================================

  private static formatLeaveBalance(balances: LeaveBalance[]): string {
    let result = '**📋 Your Leave Balance**\n\n';
    result += '| Leave Type | Entitled | Used | Pending | Available |\n';
    result += '|------------|----------|------|---------|----------|\n';

    for (const b of balances) {
      result += `| ${b.leaveTypeName} | ${b.entitled} | ${b.used} | ${b.pending} | **${b.balance}** |\n`;
    }

    const total = balances.reduce((sum, b) => sum + b.balance, 0);
    result += `\n**Total Available:** ${total} days`;

    return result;
  }

  private static formatLeaveRequests(requests: LeaveRequest[]): string {
    if (requests.length === 0) {
      return 'You have no pending leave requests.';
    }

    let result = '**📅 Your Leave Requests**\n\n';

    for (const r of requests) {
      const status = r.status === 'APPROVED' ? '✅' : r.status === 'PENDING' ? '⏳' : '❌';
      result += `${status} **${r.leaveType}** - ${r.duration} day(s)\n`;
      result += `   📆 ${this.formatDate(r.startDate)} to ${this.formatDate(r.endDate)}\n`;
      result += `   Status: ${r.status}\n\n`;
    }

    return result;
  }

  private static formatLeaveHistory(history: LeaveRequest[]): string {
    if (history.length === 0) {
      return 'No leave history found.';
    }

    let result = '**📜 Leave History (Last 6 Months)**\n\n';

    for (const r of history) {
      result += `- **${r.leaveType}**: ${this.formatDate(r.startDate)} - ${this.formatDate(r.endDate)} (${r.status})\n`;
    }

    return result;
  }

  private static formatTodayAttendance(attendance: AttendanceRecord): string {
    const statusEmoji = {
      PRESENT: '✅',
      ABSENT: '❌',
      LEAVE: '🏖️',
      HOLIDAY: '🎉',
      WFH: '🏠',
      HALF_DAY: '🌓',
    };

    let result = `**Today's Attendance** ${statusEmoji[attendance.status]}\n\n`;
    result += `- **Status:** ${attendance.status}\n`;
    result += `- **Check-in:** ${attendance.checkIn || 'Not yet'}\n`;
    result += `- **Check-out:** ${attendance.checkOut || 'Not yet'}\n`;

    if (attendance.lateBy && attendance.lateBy > 0) {
      result += `- **Late by:** ${attendance.lateBy} minutes\n`;
    }

    if (attendance.workingHours) {
      result += `- **Working Hours:** ${attendance.workingHours} hours\n`;
    }

    return result;
  }

  private static formatAttendanceSummary(summary: {
    totalDays: number;
    present: number;
    absent: number;
    leaves: number;
    holidays: number;
    wfh: number;
    lateCount: number;
    avgWorkingHours: number;
    overtimeHours: number;
  }): string {
    let result = '**📊 Attendance Summary (This Month)**\n\n';
    result += `| Metric | Value |\n`;
    result += `|--------|-------|\n`;
    result += `| Working Days | ${summary.totalDays} |\n`;
    result += `| Present | ${summary.present} |\n`;
    result += `| Absent | ${summary.absent} |\n`;
    result += `| Leaves | ${summary.leaves} |\n`;
    result += `| WFH Days | ${summary.wfh} |\n`;
    result += `| Late Arrivals | ${summary.lateCount} |\n`;
    result += `| Avg. Working Hours | ${summary.avgWorkingHours}h |\n`;
    result += `| Overtime | ${summary.overtimeHours}h |\n`;

    return result;
  }

  private static formatPayslip(payslip: {
    month: string;
    year: number;
    earnings: { component: string; amount: number }[];
    deductions: { component: string; amount: number }[];
    grossEarnings: number;
    totalDeductions: number;
    netPay: number;
  }): string {
    let result = `**💰 Payslip - ${payslip.month} ${payslip.year}**\n\n`;

    result += '**Earnings:**\n';
    for (const e of payslip.earnings) {
      result += `- ${e.component}: ₹${e.amount.toLocaleString()}\n`;
    }

    result += `\n**Gross Earnings:** ₹${payslip.grossEarnings.toLocaleString()}\n\n`;

    result += '**Deductions:**\n';
    for (const d of payslip.deductions) {
      result += `- ${d.component}: ₹${d.amount.toLocaleString()}\n`;
    }

    result += `\n**Total Deductions:** ₹${payslip.totalDeductions.toLocaleString()}\n`;
    result += `\n---\n**Net Pay:** ₹${payslip.netPay.toLocaleString()}`;

    return result;
  }

  private static formatTaxDetails(tax: {
    regime: string;
    grossSalary: number;
    exemptions: number;
    taxableIncome: number;
    taxPayable: number;
    tdsDeducted: number;
    balance: number;
  }): string {
    let result = `**🧾 Tax Summary (FY 2024-25)**\n\n`;
    result += `- **Tax Regime:** ${tax.regime}\n`;
    result += `- **Gross Salary:** ₹${tax.grossSalary.toLocaleString()}\n`;
    result += `- **Exemptions:** ₹${tax.exemptions.toLocaleString()}\n`;
    result += `- **Taxable Income:** ₹${tax.taxableIncome.toLocaleString()}\n`;
    result += `- **Total Tax:** ₹${tax.taxPayable.toLocaleString()}\n`;
    result += `- **TDS Deducted:** ₹${tax.tdsDeducted.toLocaleString()}\n`;
    result += `- **Balance Due:** ₹${tax.balance.toLocaleString()}`;

    return result;
  }

  private static formatSalaryStructure(structure: {
    totalCTC: number;
    takeHome: number;
    monthly: { component: string; amount: number }[];
  }): string {
    let result = `**💼 Salary Structure**\n\n`;
    result += `**Annual CTC:** ₹${structure.totalCTC.toLocaleString()}\n`;
    result += `**Annual Take Home:** ₹${structure.takeHome.toLocaleString()}\n\n`;

    result += '**Monthly Breakdown:**\n';
    for (const c of structure.monthly) {
      result += `- ${c.component}: ₹${c.amount.toLocaleString()}\n`;
    }

    return result;
  }

  private static formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}

// Initialize on module load
HRAgentService.initialize();
