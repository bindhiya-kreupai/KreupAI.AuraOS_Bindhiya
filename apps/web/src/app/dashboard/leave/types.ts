/**
 * Leave Management Module - TypeScript Type Definitions
 * Production-ready type system for comprehensive leave management
 */

// ============================================================================
// LEAVE TYPES & POLICIES
// ============================================================================

/**
 * Leave Type - Categories of leave (Annual, Sick, Casual, etc.)
 */
export interface LeaveType {
    id: string;
    code: string; // e.g., 'AL', 'SL', 'CL', 'ML', 'PL'
    name: string; // e.g., 'Annual Leave', 'Sick Leave'
    description: string;
    color: string; // For calendar display
    icon?: string;

    // Accrual & Limits
    annualQuota: number; // Total days per year
    accrualMethod: AccrualMethod;
    accrualFrequency: AccrualFrequency;
    maxAccrual: number; // Maximum accrual limit

    // Rules
    minDaysNotice: number; // Minimum days notice required
    maxConsecutiveDays: number; // Maximum consecutive days allowed
    requiresApproval: boolean;
    approvalLevels: number;

    // Features
    isPaid: boolean;
    isCarryForwardAllowed: boolean;
    maxCarryForwardDays: number;
    isEncashable: boolean;
    encashmentRules?: EncashmentRules;

    // Availability
    availableFor: EmployeeCategory[]; // Who can avail this leave
    genderSpecific?: 'male' | 'female' | null;

    // Settings
    isActive: boolean;
    effectiveFrom: string;
    effectiveTo?: string;

    createdAt: string;
    updatedAt: string;
}

export type AccrualMethod =
    | 'monthly' // Monthly accrual
    | 'anniversary' // On joining anniversary
    | 'financial_year' // Start of financial year
    | 'calendar_year' // Start of calendar year
    | 'pro_rata'; // Proportional based on joining date

export type AccrualFrequency =
    | 'monthly'
    | 'quarterly'
    | 'annual'
    | 'one_time';

export type EmployeeCategory =
    | 'permanent'
    | 'contract'
    | 'probation'
    | 'intern'
    | 'all';

export interface EncashmentRules {
    minBalanceRequired: number;
    maxEncashableDays: number;
    encashmentRate: number; // Percentage of daily salary
}

/**
 * Leave Policy - Organization-wide leave rules
 */
export interface LeavePolicy {
    id: string;
    name: string;
    description: string;

    // Applicability
    applicableTo: EmployeeCategory[];
    location?: string[];
    department?: string[];

    // Leave Types
    leaveTypes: string[]; // Array of leave type IDs

    // General Rules
    blackoutDates: string[]; // Dates when leave cannot be taken
    minGapBetweenLeaves: number; // Minimum days between two leaves
    weekendCounting: 'include' | 'exclude' | 'sandwich';
    holidayCounting: 'include' | 'exclude';

    // Approval Rules
    managerApprovalRequired: boolean;
    hrApprovalRequired: boolean;
    escalationAfterDays: number;

    // Year-end Processing
    carryForwardDeadline: string; // MM-DD format
    encashmentDeadline: string;

    isActive: boolean;
    effectiveFrom: string;
    effectiveTo?: string;

    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// LEAVE BALANCE
// ============================================================================

/**
 * Leave Balance - Employee's leave quota and usage
 */
export interface LeaveBalance {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveTypeId: string;
    leaveTypeName: string;
    financialYear: string; // e.g., '2024-25'

    // Balance Calculation
    openingBalance: number;
    accrued: number;
    availed: number;
    pending: number; // Requests pending approval
    lapsed: number; // Expired/forfeited leaves
    carriedForward: number;
    encashed: number;

    // Current Status
    availableBalance: number; // opening + accrued + carried - availed - pending

    // Accrual Details
    lastAccrualDate?: string;
    nextAccrualDate?: string;
    accrualPerMonth?: number;

    updatedAt: string;
}

// ============================================================================
// LEAVE REQUEST
// ============================================================================

/**
 * Leave Request - Employee's leave application
 */
export interface LeaveRequest {
    id: string;
    requestNumber: string; // e.g., 'LR-2024-001'

    // Employee Info
    employeeId: string;
    employeeName: string;
    department: string;
    designation: string;
    reportingManager?: string;

    // Leave Details
    leaveTypeId: string;
    leaveTypeName: string;
    fromDate: string;
    toDate: string;
    totalDays: number;
    halfDay: boolean;
    halfDaySession?: 'first_half' | 'second_half';

    // Request Details
    reason: string;
    contactDuringLeave?: string;
    attachments: LeaveAttachment[];

    // Status
    status: LeaveStatus;
    submittedAt: string;

    // Approval Workflow
    approvals: LeaveApproval[];
    currentApprover?: string;

    // Additional Info
    isEmergencyLeave: boolean;
    isLossOfPay: boolean; // If balance insufficient

    // Cancellation
    cancelledBy?: string;
    cancelledAt?: string;
    cancellationReason?: string;

    createdAt: string;
    updatedAt: string;
}

export type LeaveStatus =
    | 'draft'
    | 'submitted'
    | 'pending_manager_approval'
    | 'pending_hr_approval'
    | 'approved'
    | 'rejected'
    | 'cancelled'
    | 'withdrawn';

export interface LeaveAttachment {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
}

export interface LeaveApproval {
    id: string;
    approverRole: 'manager' | 'hr' | 'admin';
    approverId?: string;
    approverName?: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    actionDate?: string;
    level: number; // Approval hierarchy level
}

// ============================================================================
// HOLIDAYS
// ============================================================================

/**
 * Holiday - Public/Company holidays
 */
export interface Holiday {
    id: string;
    name: string;
    date: string;
    type: HolidayType;
    description?: string;

    // Applicability
    applicableLocations: string[]; // All locations or specific
    isOptional: boolean; // Optional holiday (floating)
    isRestricted: boolean; // Restricted holiday

    // Recurrence
    isRecurring: boolean;
    recurrencePattern?: 'annually' | 'lunar_calendar';

    year: number;
    createdAt: string;
    updatedAt: string;
}

export type HolidayType =
    | 'public_holiday'
    | 'festival'
    | 'national_day'
    | 'company_event'
    | 'optional'
    | 'restricted';

/**
 * Holiday Calendar - Collection of holidays for a year
 */
export interface HolidayCalendar {
    id: string;
    year: number;
    location: string;
    totalHolidays: number;
    totalOptionalHolidays: number;
    holidays: Holiday[];
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// LEAVE ENCASHMENT
// ============================================================================

/**
 * Leave Encashment - Request to encash leave balance
 */
export interface LeaveEncashment {
    id: string;
    encashmentNumber: string; // e.g., 'LE-2024-001'

    // Employee Info
    employeeId: string;
    employeeName: string;

    // Encashment Details
    leaveTypeId: string;
    leaveTypeName: string;
    daysToEncash: number;
    ratePerDay: number;
    totalAmount: number;

    // Financial Details
    financialYear: string;
    paymentMonth?: string;
    payrollRunId?: string;

    // Status
    status: EncashmentStatus;
    requestedDate: string;
    approvedBy?: string;
    approvedDate?: string;
    rejectionReason?: string;
    paidDate?: string;

    createdAt: string;
    updatedAt: string;
}

export type EncashmentStatus =
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'processed'
    | 'paid';

// ============================================================================
// COMP-OFF (Compensatory Off)
// ============================================================================

/**
 * Comp-Off - Compensatory off for working on holidays/weekends
 */
export interface CompOff {
    id: string;
    compOffNumber: string; // e.g., 'CO-2024-001'

    // Employee Info
    employeeId: string;
    employeeName: string;

    // Comp-Off Details
    workedDate: string;
    workedReason: string; // Why worked (e.g., 'Project Deadline')
    hoursWorked: number;
    compOffDays: number; // Usually 1 or 0.5

    // Validity
    earnedDate: string;
    expiryDate: string;
    isExpired: boolean;

    // Status
    status: CompOffStatus;
    approvedBy?: string;
    approvedDate?: string;
    rejectionReason?: string;

    // Utilization
    isAvailed: boolean;
    availedDate?: string;
    leaveRequestId?: string; // If availed, link to leave request

    createdAt: string;
    updatedAt: string;
}

export type CompOffStatus =
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'expired'
    | 'availed';

// ============================================================================
// CARRY FORWARD
// ============================================================================

/**
 * Carry Forward - Leave balance carried to next year
 */
export interface CarryForward {
    id: string;

    // Employee Info
    employeeId: string;
    employeeName: string;

    // Carry Forward Details
    leaveTypeId: string;
    leaveTypeName: string;
    fromYear: string; // e.g., '2023-24'
    toYear: string; // e.g., '2024-25'

    // Balance
    eligibleBalance: number; // Total available for carry forward
    maxAllowedCarryForward: number; // Per policy
    actualCarryForward: number; // Min of above two
    lapsedBalance: number; // Not carried forward

    // Processing
    processedDate: string;
    processedBy: string;
    expiryDate?: string; // If carry forward has expiry

    // Status
    status: 'processed' | 'expired' | 'utilized';

    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// LEAVE CALENDAR
// ============================================================================

/**
 * Leave Calendar Entry - For calendar view
 */
export interface LeaveCalendarEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    leaveRequestId: string;
    leaveTypeName: string;
    leaveTypeColor: string;
    fromDate: string;
    toDate: string;
    totalDays: number;
    status: LeaveStatus;
}

// ============================================================================
// LEAVE REPORTS & ANALYTICS
// ============================================================================

/**
 * Leave Statistics - Summary metrics
 */
export interface LeaveStats {
    totalEmployees: number;
    onLeaveToday: number;
    pendingRequests: number;
    upcomingLeaves: number; // Next 7 days

    // By Leave Type
    leaveTypeUsage: LeaveTypeUsage[];

    // By Department
    departmentLeaveUsage: DepartmentLeaveUsage[];

    // Trends
    monthlyLeaveTrend: MonthlyLeaveTrend[];

    // Balances
    averageLeaveBalance: number;
    totalAccruedDays: number;
    totalAvailedDays: number;
    totalLapsedDays: number;
}

export interface LeaveTypeUsage {
    leaveTypeName: string;
    leaveTypeColor: string;
    totalDays: number;
    percentage: number;
}

export interface DepartmentLeaveUsage {
    department: string;
    employeeCount: number;
    totalDaysAvailed: number;
    averageDaysPerEmployee: number;
}

export interface MonthlyLeaveTrend {
    month: string;
    totalLeaves: number;
    approved: number;
    rejected: number;
    pending: number;
}

/**
 * Leave Report Parameters
 */
export interface LeaveReportParams {
    reportType: LeaveReportType;
    fromDate: string;
    toDate: string;
    employeeIds?: string[];
    departments?: string[];
    leaveTypes?: string[];
    status?: LeaveStatus[];
}

export type LeaveReportType =
    | 'leave_register'
    | 'leave_balance'
    | 'leave_utilization'
    | 'pending_requests'
    | 'leave_trend'
    | 'encashment_report'
    | 'lapse_report';

// ============================================================================
// LEAVE SETTINGS
// ============================================================================

/**
 * Leave Settings - Organization-wide leave configuration
 */
export interface LeaveSettings {
    organizationId: string;

    // Financial Year
    financialYearStart: string; // MM-DD format (e.g., '04-01')

    // Accrual Settings
    defaultAccrualMethod: AccrualMethod;
    proRataCalculation: boolean; // For mid-year joiners

    // Leave Counting
    weekendCounting: 'include' | 'exclude' | 'sandwich';
    holidayCounting: 'include' | 'exclude';

    // Approval Settings
    autoApprovalThreshold: number; // Auto-approve if <= X days
    escalationEnabled: boolean;
    escalationAfterDays: number;

    // Carry Forward Settings
    carryForwardEnabled: boolean;
    carryForwardDeadline: string; // MM-DD format
    defaultMaxCarryForwardDays: number;

    // Encashment Settings
    encashmentEnabled: boolean;
    encashmentDeadline: string; // MM-DD format
    encashmentProcessingMonth: string; // MM format

    // Notifications
    notifyManagerOnRequest: boolean;
    notifyEmployeeOnApproval: boolean;
    notifyBeforeExpiry: boolean;
    expiryNotificationDaysBefore: number;

    // Advanced
    negativeLeavesAllowed: boolean;
    maxNegativeLeaveDays: number;

    updatedAt: string;
    updatedBy: string;
}

// ============================================================================
// UI STATE & TOAST
// ============================================================================

/**
 * Toast Notification
 */
export interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}
