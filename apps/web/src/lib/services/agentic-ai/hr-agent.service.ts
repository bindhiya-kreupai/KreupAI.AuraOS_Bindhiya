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
  PayrollQueryIntent} from './types';
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
   * Get leave balance for employee
   */
  static async getLeaveBalance(
    employeeId: string,
    tenantId: string,
    leaveType?: string
  ): Promise<LeaveBalance[]> {
    // In production, fetch from database
    const allBalances: LeaveBalance[] = [
      {
        leaveType: 'ANNUAL',
        leaveTypeName: 'Annual Leave',
        entitled: 20,
        used: 8,
        pending: 2,
        balance: 10,
        carryForward: 5,
        expiryDate: new Date(new Date().getFullYear() + 1, 2, 31),
      },
      {
        leaveType: 'SICK',
        leaveTypeName: 'Sick Leave',
        entitled: 10,
        used: 2,
        pending: 0,
        balance: 8,
        carryForward: 0,
      },
      {
        leaveType: 'CASUAL',
        leaveTypeName: 'Casual Leave',
        entitled: 8,
        used: 3,
        pending: 1,
        balance: 4,
        carryForward: 0,
      },
      {
        leaveType: 'COMP_OFF',
        leaveTypeName: 'Compensatory Off',
        entitled: 0,
        used: 0,
        pending: 0,
        balance: 2,
        carryForward: 0,
        expiryDate: new Date(new Date().getFullYear(), 11, 31),
      },
      {
        leaveType: 'WFH',
        leaveTypeName: 'Work From Home',
        entitled: 24,
        used: 12,
        pending: 0,
        balance: 12,
        carryForward: 0,
      },
    ];

    if (leaveType) {
      return allBalances.filter(b => b.leaveType === leaveType.toUpperCase());
    }

    return allBalances;
  }

  /**
   * Apply for leave
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
    // Validate leave balance
    const balances = await this.getLeaveBalance(employeeId, tenantId, request.leaveType);
    if (balances.length === 0) {
      throw new Error('Invalid leave type');
    }

    const balance = balances[0];
    const duration = this.calculateLeaveDuration(request.startDate, request.endDate, request.halfDay);

    if (duration > balance.balance) {
      throw new Error(`Insufficient leave balance. Available: ${balance.balance} days, Requested: ${duration} days`);
    }

    // Check for overlapping leaves
    const overlapping = await this.checkOverlappingLeaves(employeeId, request.startDate, request.endDate);
    if (overlapping) {
      throw new Error('You already have a leave request for this period');
    }

    // Create leave request
    const leaveRequest: LeaveRequest = {
      id: `leave_${Date.now()}`,
      employeeId,
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      duration,
      reason: request.reason,
      status: 'PENDING',
      appliedAt: new Date(),
    };

    // In production, save to database and trigger workflow

    return leaveRequest;
  }

  /**
   * Calculate leave duration
   */
  private static calculateLeaveDuration(
    startDate: Date,
    endDate: Date,
    halfDay?: boolean
  ): number {
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
    // In production, check database
    return false;
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
    // In production, fetch from database
    const mockRequests: LeaveRequest[] = [
      {
        id: 'leave_001',
        employeeId,
        leaveType: 'ANNUAL',
        startDate: new Date(2024, 11, 25),
        endDate: new Date(2024, 11, 27),
        duration: 3,
        reason: 'Family vacation',
        status: 'APPROVED',
        appliedAt: new Date(2024, 11, 15),
        approver: 'John Manager',
        approvedAt: new Date(2024, 11, 16),
      },
      {
        id: 'leave_002',
        employeeId,
        leaveType: 'CASUAL',
        startDate: new Date(2024, 11, 30),
        endDate: new Date(2024, 11, 30),
        duration: 1,
        reason: 'Personal work',
        status: 'PENDING',
        appliedAt: new Date(2024, 11, 20),
      },
    ];

    if (filters?.status) {
      return mockRequests.filter(r => r.status === filters.status);
    }

    return mockRequests;
  }

  /**
   * Cancel leave request
   */
  static async cancelLeave(
    leaveId: string,
    employeeId: string,
    reason: string
  ): Promise<LeaveRequest> {
    // In production, fetch and update in database
    const request: LeaveRequest = {
      id: leaveId,
      employeeId,
      leaveType: 'ANNUAL',
      startDate: new Date(),
      endDate: new Date(),
      duration: 1,
      reason: '',
      status: 'CANCELLED',
      appliedAt: new Date(),
      comments: reason,
    };

    return request;
  }

  // ============================================================================
  // ATTENDANCE MANAGEMENT
  // ============================================================================

  /**
   * Get today's attendance
   */
  static async getTodayAttendance(
    employeeId: string,
    tenantId: string
  ): Promise<AttendanceRecord> {
    // In production, fetch from database
    return {
      date: new Date(),
      checkIn: '09:15',
      checkOut: null,
      workingHours: undefined,
      status: 'PRESENT',
      lateBy: 15,
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
    // In production, fetch from database
    const records: AttendanceRecord[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        records.push({
          date: new Date(current),
          checkIn: '09:00',
          checkOut: '18:00',
          workingHours: 9,
          status: 'PRESENT',
        });
      }
      current.setDate(current.getDate() + 1);
    }

    return records;
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
    return {
      totalDays: 22,
      present: 18,
      absent: 0,
      leaves: 2,
      holidays: 2,
      wfh: 4,
      lateCount: 3,
      avgWorkingHours: 8.5,
      overtimeHours: 12,
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
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    return {
      month: monthNames[month - 1],
      year,
      earnings: [
        { component: 'Basic Salary', amount: 42500 },
        { component: 'House Rent Allowance', amount: 17000 },
        { component: 'Special Allowance', amount: 20000 },
        { component: 'Transport Allowance', amount: 1600 },
        { component: 'Medical Allowance', amount: 1250 },
        { component: 'Other Allowances', amount: 2650 },
      ],
      deductions: [
        { component: 'Provident Fund', amount: 5100 },
        { component: 'Professional Tax', amount: 200 },
        { component: 'Income Tax (TDS)', amount: 8500 },
        { component: 'ESI', amount: 0 },
      ],
      grossEarnings: 85000,
      totalDeductions: 13800,
      netPay: 71200,
      bankAccount: 'XXXX-XXXX-1234',
      payDate: new Date(year, month, 1),
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
    return {
      regime: 'OLD',
      grossSalary: 1020000,
      exemptions: 250000,
      taxableIncome: 770000,
      taxPayable: 62400,
      tdsDeducted: 51000,
      balance: 11400,
      monthlyTDS: [
        { month: 'April', amount: 5100 },
        { month: 'May', amount: 5100 },
        { month: 'June', amount: 5100 },
        { month: 'July', amount: 5100 },
        { month: 'August', amount: 5100 },
        { month: 'September', amount: 5100 },
        { month: 'October', amount: 5100 },
        { month: 'November', amount: 5100 },
        { month: 'December', amount: 5100 },
        { month: 'January', amount: 5100 },
      ],
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
    return {
      effectiveDate: new Date(2024, 3, 1),
      annual: [
        { component: 'Basic Salary', amount: 510000, type: 'FIXED' },
        { component: 'House Rent Allowance', amount: 204000, type: 'FIXED' },
        { component: 'Special Allowance', amount: 240000, type: 'FIXED' },
        { component: 'Transport Allowance', amount: 19200, type: 'FIXED' },
        { component: 'Medical Allowance', amount: 15000, type: 'FIXED' },
        { component: 'Bonus', amount: 31800, type: 'VARIABLE' },
      ],
      monthly: [
        { component: 'Basic Salary', amount: 42500 },
        { component: 'House Rent Allowance', amount: 17000 },
        { component: 'Special Allowance', amount: 20000 },
        { component: 'Transport Allowance', amount: 1600 },
        { component: 'Medical Allowance', amount: 1250 },
      ],
      totalCTC: 1020000,
      takeHome: 854400,
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
  ): Promise<{
    id: string;
    title: string;
    category: string;
    summary: string;
    relevance: number;
  }[]> {
    const policies = [
      {
        id: 'pol_001',
        title: 'Leave Policy',
        category: 'Leave Management',
        summary: 'Comprehensive guide to all leave types, entitlements, and application process',
        keywords: ['leave', 'vacation', 'sick', 'casual', 'annual'],
      },
      {
        id: 'pol_002',
        title: 'Work From Home Policy',
        category: 'Attendance',
        summary: 'Guidelines for remote work, eligibility, and approval process',
        keywords: ['wfh', 'remote', 'work from home', 'home'],
      },
      {
        id: 'pol_003',
        title: 'Expense Reimbursement Policy',
        category: 'Finance',
        summary: 'Process for claiming business expenses and reimbursements',
        keywords: ['expense', 'reimbursement', 'claim', 'travel'],
      },
      {
        id: 'pol_004',
        title: 'Code of Conduct',
        category: 'Ethics',
        summary: 'Expected behavior and professional standards for all employees',
        keywords: ['conduct', 'behavior', 'ethics', 'professional'],
      },
      {
        id: 'pol_005',
        title: 'Performance Review Policy',
        category: 'Performance',
        summary: 'Annual and quarterly review process, criteria, and timeline',
        keywords: ['performance', 'review', 'appraisal', 'rating'],
      },
    ];

    const queryLower = query.toLowerCase();
    return policies
      .filter(p =>
        p.keywords.some(k => queryLower.includes(k)) ||
        p.title.toLowerCase().includes(queryLower)
      )
      .map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        summary: p.summary,
        relevance: p.keywords.filter(k => queryLower.includes(k)).length,
      }))
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
    return {
      id: policyId,
      title: 'Leave Policy',
      category: 'Leave Management',
      version: '2.1',
      effectiveDate: new Date(2024, 0, 1),
      content: `
## Leave Entitlements

| Leave Type | Annual Entitlement | Carry Forward | Encashment |
|------------|-------------------|---------------|------------|
| Annual Leave | 20 days | Up to 5 days | Yes |
| Sick Leave | 10 days | No | No |
| Casual Leave | 8 days | No | No |

## Application Process

1. Submit leave request through HRMS portal or HR Agent
2. Manager receives notification for approval
3. Approved leaves are updated in attendance system
4. Rejected requests can be modified and resubmitted

## Advance Notice Required

- Planned Leave: 3 working days
- Sick Leave: Same day or next working day
- Emergency Leave: As soon as possible
      `,
      faqs: [
        {
          question: 'Can I carry forward unused leaves?',
          answer: 'Yes, up to 5 days of annual leave can be carried forward to the next year.',
        },
        {
          question: 'How do I check my leave balance?',
          answer: 'You can check your leave balance through the HRMS portal or by asking the HR Agent.',
        },
      ],
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
    documentType: 'EMPLOYMENT_LETTER' | 'SALARY_CERTIFICATE' | 'EXPERIENCE_LETTER' | 'PAYSLIP' | 'FORM_16',
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
    const estimatedDays: Record<string, number> = {
      EMPLOYMENT_LETTER: 2,
      SALARY_CERTIFICATE: 2,
      EXPERIENCE_LETTER: 3,
      PAYSLIP: 0,
      FORM_16: 1,
    };

    const delivery = new Date();
    delivery.setDate(delivery.getDate() + (estimatedDays[documentType] || 3));

    return {
      requestId: `doc_${Date.now()}`,
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
              prompt: 'Please provide leave details (e.g., "Annual leave from Dec 25 to Dec 27 for family vacation")',
            },
            timestamp: new Date(),
          };
        }

        const leaveRequest = await this.applyLeave(
          context.userId,
          context.tenantId,
          {
            leaveType: intent.leaveType,
            startDate: intent.startDate,
            endDate: intent.endDate,
            reason: intent.reason || 'Personal',
          }
        );
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
        const startDate = intent.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
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
        content = 'To request an attendance correction, please provide the date and the correct check-in/check-out times.';
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
        content = 'To submit a reimbursement, please upload your expense bills through the expense portal or describe your expense.';
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
