// Attendance Module Types
// Complete type system for time and attendance management

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'half_day'
  | 'late'
  | 'early_departure'
  | 'on_leave'
  | 'holiday'
  | 'weekend';

export type ShiftType =
  'morning' | 'afternoon' | 'evening' | 'night' | 'general' | 'flexible' | 'rotational';

export type CheckType = 'check_in' | 'check_out' | 'break_start' | 'break_end';

export type OvertimeType = 'regular' | 'weekend' | 'holiday' | 'compensatory';

export type OvertimeStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'comp_off_granted';

export type RegularizationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export type RegularizationType =
  'missed_punch' | 'late_arrival' | 'early_departure' | 'incorrect_punch';

export type BiometricDeviceType = 'fingerprint' | 'face_recognition' | 'card_reader' | 'iris_scan';

export type AttendanceReportType = 'daily' | 'weekly' | 'monthly' | 'custom';

// ============================================================================
// SHIFT MANAGEMENT
// ============================================================================

export interface Shift {
  id: string;
  shiftCode: string;
  shiftName: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  graceTimeIn: number;
  graceTimeOut: number;
  halfDayHours: number;
  fullDayHours: number;
  breakDuration: number;
  weeklyOffDays: number[];
  isActive: boolean;
  allowFlexibleTiming: boolean;
  flexWindowMinutes?: number;
  overtimeAllowed: boolean;
  maxOvertimeHours?: number;
  nightShiftAllowance?: number;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftId: string;
  shiftName: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  assignedBy: string;
  assignedDate: string;
  notes?: string;
}

export interface ShiftRotation {
  id: string;
  rotationName: string;
  rotationType: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  rotationCycle: ShiftRotationCycle[];
  applicableEmployees: string[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
}

export interface ShiftRotationCycle {
  sequenceNumber: number;
  shiftId: string;
  shiftName: string;
  durationDays: number;
}

// ============================================================================
// ATTENDANCE RECORDS
// ============================================================================

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  date: string;
  shiftId: string;
  shiftName: string;
  scheduledIn: string;
  scheduledOut: string;
  actualIn?: string;
  actualOut?: string;
  status: AttendanceStatus;
  hoursWorked?: number;
  overtimeHours?: number;
  lateBy?: number;
  earlyBy?: number;
  breakDuration?: number;
  isPaid: boolean;
  isRegularized: boolean;
  regularizationId?: string;
  leaveId?: string;
  remarks?: string;
  location?: string;
  deviceId?: string;
  createdDate: string;
  lastModified: string;
}

export interface AttendanceCheck {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkType: CheckType;
  checkTime: string;
  deviceId?: string;
  deviceType?: BiometricDeviceType;
  location?: string;
  latitude?: number;
  longitude?: number;
  isManual: boolean;
  photoUrl?: string;
  notes?: string;
  createdDate: string;
}

// ============================================================================
// REGULARIZATION
// ============================================================================

export interface AttendanceRegularization {
  id: string;
  requestCode: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  date: string;
  regularizationType: RegularizationType;
  scheduledIn: string;
  scheduledOut: string;
  actualIn?: string;
  actualOut?: string;
  requestedIn?: string;
  requestedOut?: string;
  reason: string;
  status: RegularizationStatus;
  submittedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewComments?: string;
  attachments?: string[];
}

// ============================================================================
// OVERTIME
// ============================================================================

export interface OvertimeRequest {
  id: string;
  requestCode: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  date: string;
  overtimeType: OvertimeType;
  startTime: string;
  endTime: string;
  requestedHours: number;
  approvedHours?: number;
  reason: string;
  workDescription: string;
  status: OvertimeStatus;
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  paymentRate?: number;
  paymentAmount?: number;
  paidDate?: string;
  compOffGranted?: boolean;
  compOffDate?: string;
  estimatedPayout?: number;
  hourlyRate?: number;
  multiplier?: number;
}

// ============================================================================
// BIOMETRIC DEVICES
// ============================================================================

export interface BiometricDevice {
  id: string;
  deviceCode: string;
  deviceName: string;
  deviceType: BiometricDeviceType;
  location: string;
  ipAddress?: string;
  serialNumber?: string;
  isActive: boolean;
  lastSyncDate?: string;
  employeeCount?: number;
  installationDate: string;
  maintenanceDate?: string;
  notes?: string;
}

export interface BiometricEnrollment {
  id: string;
  employeeId: string;
  employeeName: string;
  deviceId: string;
  deviceName: string;
  enrollmentDate: string;
  biometricData: string;
  isActive: boolean;
  lastUsed?: string;
}

// ============================================================================
// ATTENDANCE POLICIES
// ============================================================================

export interface AttendancePolicy {
  id: string;
  policyName: string;
  description: string;
  isActive: boolean;
  graceTimeIn: number;
  graceTimeOut: number;
  halfDayThreshold: number;
  fullDayThreshold: number;
  lateMarkAfter: number;
  absentMarkAfter: number;
  maxLatesPerMonth: number;
  deductionPerLate: number;
  deductionPerAbsent: number;
  requireRegularization: boolean;
  regularizationDeadlineDays: number;
  overtimeRounding: number;
  minimumOvertimeMinutes: number;
  weekendOvertimeMultiplier: number;
  holidayOvertimeMultiplier: number;
  allowNegativeBalance: boolean;
  trackBreakTime: boolean;
  maxBreakDuration: number;
  requireManagerApprovalForOT: boolean;
  autoApproveRegularization: boolean;
  applicableDepartments: string[];
  applicableLocations: string[];
  effectiveFrom: string;
  effectiveTo?: string;
  createdBy: string;
  createdDate: string;
}

// ============================================================================
// LOCATION TRACKING
// ============================================================================

export interface WorkLocation {
  id: string;
  locationCode: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  geofenceRadius?: number;
  isActive: boolean;
  timezone: string;
  hasDevices: boolean;
  deviceIds?: string[];
}

export interface GeoFenceAttendance {
  id: string;
  employeeId: string;
  employeeName: string;
  locationId: string;
  locationName: string;
  checkType: CheckType;
  checkTime: string;
  latitude: number;
  longitude: number;
  isWithinGeofence: boolean;
  distance?: number;
  deviceInfo?: string;
  ipAddress?: string;
}

// ============================================================================
// WORK FROM HOME
// ============================================================================

export interface WFHRequest {
  id: string;
  requestCode: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  requiresCheckIn: boolean;
  checkInRequired?: string;
  checkOutRequired?: string;
}

// ============================================================================
// ANALYTICS & REPORTS
// ============================================================================

export interface AttendanceMetrics {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  lateToday: number;
  averageAttendanceRate: number;
  averagePunctualityRate: number;
  totalOvertimeHours: number;
  pendingRegularizations: number;
  pendingOvertimeRequests: number;
  departmentAttendance: DepartmentAttendance[];
  attendanceTrend: AttendanceTrend[];
  topAbsentees: EmployeeAttendanceSummary[];
  topLatecomers: EmployeeAttendanceSummary[];
  overtimeByDepartment: OvertimeSummary[];
}

export interface DepartmentAttendance {
  departmentId: string;
  departmentName: string;
  totalEmployees: number;
  present: number;
  absent: number;
  onLeave: number;
  attendanceRate: number;
}

export interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
  onLeave: number;
  late: number;
  attendanceRate: number;
}

export interface EmployeeAttendanceSummary {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  leaveDays: number;
  overtimeHours: number;
  attendanceRate: number;
  punctualityRate: number;
}

export interface OvertimeSummary {
  departmentId: string;
  departmentName: string;
  totalOvertimeHours: number;
  totalOvertimeCost: number;
  employeesWithOT: number;
}

export interface MonthlyAttendanceReport {
  employeeId: string;
  employeeName: string;
  departmentName: string;
  month: string;
  year: number;
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  lateDays: number;
  leaveDays: number;
  holidayDays: number;
  weekendDays: number;
  hoursWorked: number;
  overtimeHours: number;
  attendancePercentage: number;
  punctualityPercentage: number;
  regularizations: number;
}

// ============================================================================
// SETTINGS
// ============================================================================

export interface AttendanceSettings {
  workingDaysPerWeek: number;
  weekendDays: number[];
  standardWorkingHours: number;
  gracePeriodMinutes: number;
  earlyExitBufferMinutes: number;
  enableBiometric: boolean;
  enableGeofencing: boolean;
  enableMobileCheckIn: boolean;
  requirePhotoOnCheckIn: boolean;
  autoMarkAbsent: boolean;
  autoMarkAbsentAfterHours: number;
  enableOvertimeTracking: boolean;
  overtimeAutoApproval: boolean;
  maxOvertimeHoursPerDay: number;
  maxOvertimeHoursPerMonth: number;
  enableShiftRotation: boolean;
  enableAttendanceRegularization: boolean;
  regularizationRequiresApproval: boolean;
  regularizationDeadlineDays: number;
  enableWFH: boolean;
  wfhRequiresApproval: boolean;
  maxWFHDaysPerMonth: number;
  notificationEmail: string;
  hrNotificationEmail: string;
  managerNotificationEmail: string;
  sendDailySummary: boolean;
  sendWeeklySummary: boolean;
  sendMonthlySummary: boolean;
}
