/**
 * Attendance Management Types
 * Phase 2: Core Enhancement - Attendance Enhancement
 */

import type { SupportedCountryCode } from '../compliance/types';

// ============================================================================
// ATTENDANCE TYPES
// ============================================================================

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'ON_LEAVE'
  | 'HOLIDAY'
  | 'WEEKEND'
  | 'WFH'
  | 'FIELD_DUTY'
  | 'REGULARIZED';

export type PunchType = 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END';

export type PunchSource = 'BIOMETRIC' | 'WEB' | 'MOBILE' | 'GPS' | 'MANUAL' | 'AUTO';

export type OvertimeType = 'NORMAL' | 'NIGHT' | 'WEEKEND' | 'HOLIDAY';

export type RegularizationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

// ============================================================================
// SHIFT CONFIGURATION
// ============================================================================

export interface ShiftType {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  nameAr: string;
  description?: string;

  // Timing
  startTime: string; // HH:MM format
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  breakDuration: number; // in minutes

  // Working Hours
  workingHours: number;
  minHoursForFullDay: number;
  minHoursForHalfDay: number;

  // Grace Period
  graceMinutesIn: number;
  graceMinutesOut: number;

  // Late/Early Marks
  lateMarkAfterMinutes: number;
  earlyOutBeforeMinutes: number;
  maxLateMarksPerMonth: number;

  // Overtime
  overtimeAfterMinutes: number;
  minOvertimeMinutes: number;
  maxOvertimeHours: number;
  requiresOvertimeApproval: boolean;

  // Flexibility
  isFlexible: boolean;
  flexibleWindowMinutes?: number;

  // Night Shift
  isNightShift: boolean;
  nightShiftAllowance?: number;

  // Applicable Countries (for Ramadan shifts)
  applicableCountries: SupportedCountryCode[];
  ramadanVariant?: {
    startTime: string;
    endTime: string;
    workingHours: number;
  };

  isActive: boolean;
}

export interface ShiftAssignment {
  id: string;
  tenantId: string;
  employeeId: string;
  shiftId: string;
  startDate: Date;
  endDate?: Date;
  rotationPattern?: string[]; // Array of shift codes for rotation
  isActive: boolean;
}

// ============================================================================
// WORK LOCATION
// ============================================================================

export interface WorkLocation {
  id: string;
  tenantId: string;
  name: string;
  nameAr: string;
  address: string;

  // GPS Coordinates
  latitude: number;
  longitude: number;
  radiusMeters: number; // Geofence radius

  // IP Restriction
  allowedIPs?: string[];
  requireIPValidation: boolean;

  // Settings
  isHeadOffice: boolean;
  allowRemotePunch: boolean;
  requirePhotoOnPunch: boolean;

  timezone: string;
  isActive: boolean;
}

// ============================================================================
// ATTENDANCE RECORD
// ============================================================================

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  date: string; // YYYY-MM-DD

  // Shift
  shiftId: string;
  shiftName: string;
  scheduledIn: string;
  scheduledOut: string;

  // Punches
  punches: AttendancePunch[];
  firstCheckIn?: string;
  lastCheckOut?: string;

  // Calculated Hours
  totalWorkedMinutes: number;
  totalBreakMinutes: number;
  effectiveWorkedMinutes: number;
  overtimeMinutes: number;

  // Status
  status: AttendanceStatus;
  isLate: boolean;
  isEarlyOut: boolean;
  lateMinutes: number;
  earlyOutMinutes: number;

  // Leave Integration
  leaveRequestId?: string;
  leaveType?: string;

  // Location
  locationId?: string;
  locationName?: string;
  isRemote: boolean;

  // Regularization
  isRegularized: boolean;
  regularizationId?: string;
  originalStatus?: AttendanceStatus;

  // Remarks
  remarks?: string;
  remarksByManager?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

export interface AttendancePunch {
  id: string;
  type: PunchType;
  time: string; // HH:MM:SS
  timestamp: Date;
  source: PunchSource;

  // Location
  latitude?: number;
  longitude?: number;
  locationName?: string;
  isWithinGeofence: boolean;

  // Device
  deviceId?: string;
  deviceName?: string;
  ipAddress?: string;

  // Photo
  photoUrl?: string;

  // Validation
  isValid: boolean;
  validationMessage?: string;
}

// ============================================================================
// OVERTIME
// ============================================================================

export interface OvertimeRecord {
  id: string;
  tenantId: string;
  attendanceRecordId: string;
  employeeId: string;
  date: string;

  // Hours
  overtimeMinutes: number;
  overtimeType: OvertimeType;

  // Rate
  rateMultiplier: number; // 1.25, 1.5, 2.0 etc.
  hourlyRate: number;
  calculatedAmount: number;

  // Status
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  approvedMinutes?: number;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;

  // Payroll
  payrollRunId?: string;
  paidAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface OvertimePolicy {
  id: string;
  tenantId: string;
  countryCode: SupportedCountryCode;

  // Thresholds
  minOvertimeMinutes: number;
  maxDailyHours: number;
  maxWeeklyHours: number;
  maxMonthlyHours: number;
  maxYearlyHours?: number;

  // Rates (from Labour Law)
  normalRate: number;
  nightRate: number;
  weekendRate: number;
  holidayRate: number;

  // Night Shift Definition
  nightStartTime: string;
  nightEndTime: string;

  // Approval
  requiresApproval: boolean;
  autoApproveUpToMinutes: number;
  approvalLevels: number;

  // Compensation
  compensationType: 'PAYMENT' | 'COMP_OFF' | 'CHOICE';
  compOffRatio: number; // OT hours to comp off days

  isActive: boolean;
}

// ============================================================================
// REGULARIZATION
// ============================================================================

export interface RegularizationRequest {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;

  // Date
  date: string;
  attendanceRecordId?: string;

  // Original Data
  originalCheckIn?: string;
  originalCheckOut?: string;
  originalStatus: AttendanceStatus;

  // Requested Change
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  requestedStatus: AttendanceStatus;

  // Reason
  reason: string;
  category: 'FORGOT_PUNCH' | 'DEVICE_FAILURE' | 'WFH' | 'CLIENT_VISIT' | 'OTHER';
  supportingDocument?: string;

  // Approval
  status: RegularizationStatus;
  approvers: RegularizationApprover[];
  currentApproverLevel: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface RegularizationApprover {
  level: number;
  approverId: string;
  approverName: string;
  action?: 'APPROVED' | 'REJECTED' | 'RETURNED';
  comments?: string;
  actionAt?: Date;
}

// ============================================================================
// GPS ATTENDANCE
// ============================================================================

export interface GPSPunchRequest {
  employeeId: string;
  punchType: PunchType;
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  timestamp: Date;
  deviceId?: string;
  photoBase64?: string;
}

export interface GPSValidationResult {
  isValid: boolean;
  nearestLocation?: WorkLocation;
  distanceMeters: number;
  isWithinGeofence: boolean;
  message: string;
  messageAr: string;
}

// ============================================================================
// BIOMETRIC DEVICE
// ============================================================================

export interface BiometricDevice {
  id: string;
  tenantId: string;
  locationId: string;
  deviceCode: string;
  deviceName: string;
  manufacturer: string;
  model: string;

  // Connection
  ipAddress: string;
  port: number;
  protocol: 'TCP' | 'HTTP' | 'SDK';

  // Status
  isOnline: boolean;
  lastHeartbeat?: Date;
  lastSyncAt?: Date;

  // Capabilities
  hasFingerprintReader: boolean;
  hasFaceRecognition: boolean;
  hasCardReader: boolean;
  hasPinEntry: boolean;

  isActive: boolean;
}

export interface BiometricLog {
  id: string;
  deviceId: string;
  employeeId: string;
  punchType: PunchType;
  timestamp: Date;
  verificationMode: 'FINGERPRINT' | 'FACE' | 'CARD' | 'PIN';
  isProcessed: boolean;
  attendanceRecordId?: string;
}

// ============================================================================
// ATTENDANCE PROCESSING
// ============================================================================

export interface AttendanceProcessingInput {
  tenantId: string;
  date: string; // YYYY-MM-DD
  employeeIds?: string[];
  reprocess?: boolean;
}

export interface AttendanceProcessingResult {
  date: string;
  totalEmployees: number;
  processed: number;
  present: number;
  absent: number;
  onLeave: number;
  holiday: number;
  late: number;
  earlyOut: number;
  overtime: number;
  errors: AttendanceProcessingError[];
}

export interface AttendanceProcessingError {
  employeeId: string;
  employeeName: string;
  errorCode: string;
  message: string;
}

// ============================================================================
// ATTENDANCE ANALYTICS
// ============================================================================

export interface AttendanceAnalytics {
  tenantId: string;
  period: string; // YYYY-MM

  // Overall
  totalWorkingDays: number;
  averageAttendance: number;
  absenteeismRate: number;

  // By Status
  statusBreakdown: { status: AttendanceStatus; count: number; percentage: number }[];

  // Punctuality
  onTimePercentage: number;
  latePercentage: number;
  averageLateMinutes: number;

  // Overtime
  totalOvertimeHours: number;
  overtimeEmployees: number;
  averageOvertimePerEmployee: number;

  // By Department
  byDepartment: DepartmentAttendanceStats[];

  // Trends
  dailyTrend: { date: string; present: number; absent: number; late: number }[];

  // Regularizations
  regularizationCount: number;
  regularizationApprovalRate: number;
}

export interface DepartmentAttendanceStats {
  departmentId: string;
  departmentName: string;
  totalEmployees: number;
  averageAttendance: number;
  latePercentage: number;
  overtimeHours: number;
}

// ============================================================================
// ATTENDANCE CALENDAR
// ============================================================================

export interface AttendanceCalendarEntry {
  date: string;
  dayOfWeek: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  workedHours: number;
  isLate: boolean;
  isHoliday: boolean;
  holidayName?: string;
  leaveType?: string;
  remarks?: string;
}

export interface MonthlyAttendanceSummary {
  employeeId: string;
  month: string;
  totalDays: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  holidayDays: number;
  weekendDays: number;
  wfhDays: number;
  lateDays: number;
  earlyOutDays: number;
  totalWorkedHours: number;
  totalOvertimeHours: number;
  lossOfPayDays: number;
  calendar: AttendanceCalendarEntry[];
}
