/**
 * Leave Management Types
 * Phase 2: Core Enhancement - Advanced Leave System
 */

import type { SupportedCountryCode } from '../compliance/types';

// ============================================================================
// LEAVE TYPES
// ============================================================================

export type LeaveTypeCode =
  | 'ANNUAL'
  | 'SICK'
  | 'CASUAL'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'BEREAVEMENT'
  | 'HAJJ'
  | 'MARRIAGE'
  | 'STUDY'
  | 'COMP_OFF'
  | 'UNPAID'
  | 'SABBATICAL';

export type LeaveStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'WITHDRAWN';

export type AccrualFrequency =
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'ANNUALLY'
  | 'ON_JOINING';

export type EncashmentTrigger =
  | 'YEAR_END'
  | 'ON_RESIGNATION'
  | 'ON_TERMINATION'
  | 'ON_REQUEST'
  | 'ON_POLICY_MAX';

// ============================================================================
// LEAVE TYPE CONFIGURATION
// ============================================================================

export interface LeaveType {
  id: string;
  tenantId: string;
  code: LeaveTypeCode;
  nameEn: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  isPaid: boolean;
  isCarryForwardAllowed: boolean;
  isEncashmentAllowed: boolean;
  isHalfDayAllowed: boolean;
  isDocumentRequired: boolean;
  documentRequiredAfterDays: number;
  maxConsecutiveDays?: number;
  minNoticeDays: number;
  applicableGenders: ('MALE' | 'FEMALE' | 'ALL')[];
  applicableCountries: SupportedCountryCode[];
  color: string;
  isActive: boolean;
}

// ============================================================================
// LEAVE POLICY
// ============================================================================

export interface LeavePolicy {
  id: string;
  tenantId: string;
  policyName: string;
  policyNameAr: string;
  description?: string;
  countryCode: SupportedCountryCode;
  leaveTypeId: string;
  leaveTypeCode: LeaveTypeCode;

  // Accrual Settings
  accrualType: AccrualFrequency;
  accrualStartDay: number; // Day of month for monthly accrual
  accrualRoundingType: 'UP' | 'DOWN' | 'NEAREST';

  // Entitlements by Years of Service
  entitlements: LeavePolicyEntitlement[];

  // Carry Forward Settings
  carryForward: {
    isAllowed: boolean;
    maxDays: number;
    expiryMonths: number; // Months after which carried leave expires
    useFirstRule: 'FIFO' | 'LIFO'; // Use carried leave first or last
  };

  // Encashment Settings
  encashment: {
    isAllowed: boolean;
    triggers: EncashmentTrigger[];
    maxDays: number;
    minBalanceToRetain: number;
    encashmentRate: number; // Percentage of daily salary
    basis: 'BASIC' | 'GROSS';
  };

  // Probation
  accrualDuringProbation: boolean;
  usageDuringProbation: boolean;

  // Pro-rata
  proRataOnJoining: boolean;
  proRataOnExit: boolean;

  // Negative Balance
  allowNegativeBalance: boolean;
  maxNegativeBalance: number;

  // Sandwich Rule
  sandwichRuleEnabled: boolean; // Count weekends/holidays between leave

  // Cluster/Blackout
  blackoutDates: string[]; // Dates when leave cannot be taken
  maxEmployeesOnLeave?: number; // Per department limit

  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

export interface LeavePolicyEntitlement {
  fromYears: number;
  toYears: number;
  daysPerYear: number;
  daysPerMonth: number;
}

// ============================================================================
// LEAVE BALANCE
// ============================================================================

export interface LeaveBalance {
  id: string;
  tenantId: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeCode: LeaveTypeCode;
  policyId: string;
  year: number;

  // Opening Balance
  openingBalance: number;
  carriedForward: number;

  // Accrued
  accrued: number;
  accruedYTD: number;

  // Adjustments
  adjustmentCredit: number;
  adjustmentDebit: number;

  // Used
  used: number;
  usedYTD: number;
  pending: number; // Approved but not yet taken

  // Encashed
  encashed: number;
  encashedYTD: number;

  // Lapsed
  lapsed: number;

  // Available
  available: number;

  // Future projected (for planning)
  projectedAccrual: number;
  projectedBalance: number;

  lastAccrualDate?: Date;
  lastUpdated: Date;
}

// ============================================================================
// LEAVE REQUEST
// ============================================================================

export interface LeaveRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;

  leaveTypeId: string;
  leaveTypeCode: LeaveTypeCode;
  leaveTypeName: string;

  // Dates
  startDate: Date;
  endDate: Date;
  totalDays: number;
  halfDayStart: boolean;
  halfDayEnd: boolean;

  // Details
  reason: string;
  contactNumber?: string;
  addressDuringLeave?: string;
  delegateTo?: string;

  // Documents
  documents: LeaveDocument[];

  // Status
  status: LeaveStatus;
  appliedAt: Date;
  approvers: LeaveApprover[];
  currentApproverLevel: number;

  // Cancellation
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: Date;
}

export interface LeaveApprover {
  level: number;
  approverId: string;
  approverName: string;
  action?: 'APPROVED' | 'REJECTED' | 'RETURNED';
  comments?: string;
  actionAt?: Date;
}

// ============================================================================
// ACCRUAL PROCESSING
// ============================================================================

export interface AccrualRunInput {
  tenantId: string;
  processDate: Date;
  employeeIds?: string[]; // If empty, process all
  leaveTypeIds?: string[]; // If empty, process all types
  isMonthEnd?: boolean;
}

export interface AccrualResult {
  employeeId: string;
  employeeName: string;
  leaveTypeCode: LeaveTypeCode;
  previousBalance: number;
  accrued: number;
  newBalance: number;
  daysWorked: number;
  proRataFactor: number;
  notes: string[];
}

export interface AccrualRun {
  id: string;
  tenantId: string;
  processDate: Date;
  totalEmployees: number;
  totalAccrued: number;
  byLeaveType: { leaveType: string; totalAccrued: number; employeeCount: number }[];
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED';
  errors: AccrualError[];
  createdAt: Date;
  completedAt?: Date;
}

export interface AccrualError {
  employeeId: string;
  employeeName: string;
  leaveTypeCode: string;
  errorCode: string;
  message: string;
}

// ============================================================================
// ENCASHMENT
// ============================================================================

export interface EncashmentRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeCode: LeaveTypeCode;

  requestedDays: number;
  eligibleDays: number;
  approvedDays: number;

  calculationBasis: 'BASIC' | 'GROSS';
  dailyRate: number;
  totalAmount: number;

  trigger: EncashmentTrigger;
  reason?: string;

  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'PAID';
  approvedBy?: string;
  approvedAt?: Date;
  processedAt?: Date;
  payrollMonth?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface EncashmentCalculation {
  employeeId: string;
  leaveTypeCode: LeaveTypeCode;
  currentBalance: number;
  minRetention: number;
  maxEncashable: number;
  eligibleDays: number;
  dailyRate: number;
  totalAmount: number;
  basis: 'BASIC' | 'GROSS';
  basisAmount: number;
}

// ============================================================================
// CARRY FORWARD
// ============================================================================

export interface CarryForwardRun {
  id: string;
  tenantId: string;
  fromYear: number;
  toYear: number;
  processDate: Date;
  totalEmployees: number;
  totalCarried: number;
  totalLapsed: number;
  byLeaveType: CarryForwardSummary[];
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED';
  errors: CarryForwardError[];
  createdAt: Date;
}

export interface CarryForwardSummary {
  leaveTypeCode: LeaveTypeCode;
  leaveTypeName: string;
  employeeCount: number;
  totalCarried: number;
  totalLapsed: number;
  averageCarried: number;
}

export interface CarryForwardResult {
  employeeId: string;
  employeeName: string;
  leaveTypeCode: LeaveTypeCode;
  previousYearBalance: number;
  carryForwardEligible: number;
  carryForwardApplied: number;
  lapsed: number;
  expiryDate?: Date;
}

export interface CarryForwardError {
  employeeId: string;
  employeeName: string;
  leaveTypeCode: string;
  errorCode: string;
  message: string;
}

// ============================================================================
// LEAVE CALENDAR
// ============================================================================

export interface LeaveCalendarEntry {
  date: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveTypeCode;
  leaveTypeName: string;
  status: LeaveStatus;
  isHalfDay: boolean;
  halfDayType?: 'FIRST_HALF' | 'SECOND_HALF';
  color: string;
}

export interface TeamLeaveCalendar {
  teamId: string;
  teamName: string;
  month: string;
  members: { id: string; name: string }[];
  entries: LeaveCalendarEntry[];
  holidays: { date: string; name: string }[];
  conflicts: LeaveConflict[];
}

export interface LeaveConflict {
  date: string;
  employees: { id: string; name: string; leaveType: string }[];
  departmentCoverage: number; // Percentage of team present
  isBlocked: boolean;
  reason?: string;
}

// ============================================================================
// LEAVE ANALYTICS
// ============================================================================

export interface LeaveAnalytics {
  tenantId: string;
  period: string; // YYYY or YYYY-MM

  // Overall Stats
  totalLeavesTaken: number;
  averagePerEmployee: number;
  mostCommonLeaveType: LeaveTypeCode;

  // By Type
  byLeaveType: LeaveTypeStats[];

  // By Department
  byDepartment: DepartmentLeaveStats[];

  // Trends
  monthlyTrend: { month: string; total: number; paid: number; unpaid: number }[];

  // Encashment
  totalEncashed: number;
  totalEncashedAmount: number;

  // Carry Forward
  totalCarried: number;
  totalLapsed: number;

  // Patterns
  peakLeaveDays: string[]; // Days with most leaves
  lowAttendanceDays: string[];
}

export interface LeaveTypeStats {
  leaveTypeCode: LeaveTypeCode;
  leaveTypeName: string;
  totalDays: number;
  requestCount: number;
  averageDuration: number;
  approvalRate: number;
}

export interface DepartmentLeaveStats {
  departmentId: string;
  departmentName: string;
  totalDays: number;
  totalEmployees: number;
  averagePerEmployee: number;
  utilizationRate: number;
}

// ============================================================================
// COMP OFF (Compensatory Off)
// ============================================================================

export interface CompOffRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;

  // Worked Day
  workedDate: Date;
  workedHours: number;
  reason: string;
  projectCode?: string;
  approvedBy?: string;
  approvedAt?: Date;

  // Comp Off Credit
  creditedDays: number; // 0.5 or 1
  expiryDate: Date;
  isUsed: boolean;
  usedDate?: Date;
  usedLeaveRequestId?: string;

  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'USED';
  createdAt: Date;
  updatedAt: Date;
}
