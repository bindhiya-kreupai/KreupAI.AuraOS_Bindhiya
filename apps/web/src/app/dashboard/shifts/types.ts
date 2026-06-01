// Shift Management Module Types

export type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night' | 'split' | 'rotating' | 'flexible' | 'on_call';
export type ShiftStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'late' | 'early_departure';
export type ShiftPatternType = 'fixed' | 'rotating' | 'flexible' | 'compressed' | 'split';
export type SwapStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type CoverageStatus = 'fully_covered' | 'partially_covered' | 'uncovered' | 'overstaffed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Shift {
  id: string;
  shiftCode: string;
  shiftName: string;
  shiftType: ShiftType;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  departmentId: string;
  departmentName: string;
  locationId: string;
  locationName: string;
  positionId?: string;
  positionName?: string;
  requiredSkills: string[];
  minStaffing: number;
  maxStaffing: number;
  currentStaffing: number;
  assignments: ShiftAssignment[];
  breakSchedule: BreakSchedule[];
  overtimeEligible: boolean;
  premiumRate?: number;
  cost?: ShiftCost;
  status: ShiftStatus;
  notes?: string;
  isRecurring: boolean;
  recurringPatternId?: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface ShiftAssignment {
  id: string;
  shiftId: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  assignmentType: 'regular' | 'overtime' | 'on_call' | 'backup';
  status: ShiftStatus;
  checkInTime?: string;
  checkOutTime?: string;
  actualDuration?: number;
  breaks: ShiftBreak[];
  lateMinutes?: number;
  earlyDepartureMinutes?: number;
  overtimeMinutes?: number;
  notes?: string;
  assignedBy: string;
  assignedDate: string;
  lastModified: string;
}

export interface BreakSchedule {
  id: string;
  breakName: string;
  breakType: 'paid' | 'unpaid';
  startOffset: number;
  duration: number;
  isMandatory: boolean;
}

export interface ShiftBreak {
  id: string;
  breakScheduleId: string;
  breakName: string;
  breakType: 'paid' | 'unpaid';
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  duration: number;
  actualDuration?: number;
  isTaken: boolean;
  notes?: string;
}

export interface ShiftCost {
  regularRate: number;
  overtimeRate: number;
  premiumRate?: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalPremiumHours: number;
  totalCost: number;
  currency: string;
}

export interface ShiftPattern {
  id: string;
  patternCode: string;
  patternName: string;
  patternType: ShiftPatternType;
  description: string;
  departmentId: string;
  departmentName: string;
  cycle: ShiftCycle;
  rotationSchedule?: RotationSchedule;
  applicablePositions: string[];
  isActive: boolean;
  effectiveDate: string;
  endDate?: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface ShiftCycle {
  cycleName: string;
  cycleDuration: number;
  cycleUnit: 'days' | 'weeks' | 'months';
  shifts: CycleShift[];
  restDays: number[];
}

export interface CycleShift {
  dayNumber: number;
  shiftTemplateId: string;
  shiftTemplateName: string;
  isWorkDay: boolean;
  isRestDay: boolean;
}

export interface RotationSchedule {
  rotationType: 'weekly' | 'bi_weekly' | 'monthly' | 'custom';
  rotationSequence: string[];
  currentRotation: number;
  nextRotationDate: string;
}

export interface ShiftTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  duration: number;
  breakSchedule: BreakSchedule[];
  departmentId: string;
  departmentName: string;
  requiredSkills: string[];
  overtimeEligible: boolean;
  premiumRate?: number;
  color?: string;
  icon?: string;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface ShiftSwapRequest {
  id: string;
  requestCode: string;
  requestorId: string;
  requestorName: string;
  requestorShiftId: string;
  requestorShift: ShiftSummary;
  requesteeId: string;
  requesteeName: string;
  requesteeShiftId: string;
  requesteeShift: ShiftSummary;
  reason: string;
  status: SwapStatus;
  requestedDate: string;
  approvalRequired: boolean;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectedReason?: string;
  expiryDate?: string;
  createdDate: string;
  lastModified: string;
}

export interface ShiftSummary {
  shiftId: string;
  shiftName: string;
  date: string;
  startTime: string;
  endTime: string;
  departmentName: string;
  locationName: string;
}

export interface ShiftCoverageRequest {
  id: string;
  requestCode: string;
  shiftId: string;
  shift: ShiftSummary;
  requestorId: string;
  requestorName: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
  status: ApprovalStatus;
  acceptedBy?: string;
  acceptedByName?: string;
  acceptedDate?: string;
  expiryDate: string;
  createdDate: string;
}

export interface ShiftPreference {
  id: string;
  employeeId: string;
  employeeName: string;
  preferredShiftTypes: ShiftType[];
  preferredDays: DayOfWeek[];
  unavailableDays: DayOfWeek[];
  preferredStartTime?: string;
  preferredEndTime?: string;
  maxHoursPerWeek?: number;
  maxConsecutiveDays?: number;
  minRestHoursBetweenShifts?: number;
  weekendAvailability: 'always' | 'sometimes' | 'never';
  overtimeWilling: boolean;
  nightShiftWilling: boolean;
  onCallWilling: boolean;
  notes?: string;
  effectiveDate: string;
  endDate?: string;
  createdDate: string;
  lastModified: string;
}

export interface ShiftSchedule {
  id: string;
  scheduleCode: string;
  scheduleName: string;
  departmentId: string;
  departmentName: string;
  locationId: string;
  locationName: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'published' | 'finalized' | 'archived';
  shifts: Shift[];
  totalShifts: number;
  totalAssignments: number;
  coverageAnalysis: CoverageAnalysis;
  publishedBy?: string;
  publishedDate?: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
}

export interface CoverageAnalysis {
  totalRequiredStaff: number;
  totalAssignedStaff: number;
  coveragePercentage: number;
  coverageStatus: CoverageStatus;
  uncoveredShifts: number;
  overstaffedShifts: number;
  dailyCoverage: DailyCoverage[];
  skillGaps: SkillGap[];
}

export interface DailyCoverage {
  date: string;
  dayOfWeek: DayOfWeek;
  requiredStaff: number;
  assignedStaff: number;
  coveragePercentage: number;
  status: CoverageStatus;
  uncoveredShifts: string[];
}

export interface SkillGap {
  skill: string;
  requiredCount: number;
  assignedCount: number;
  gap: number;
  affectedShifts: string[];
}

export interface ShiftBid {
  id: string;
  bidCode: string;
  shiftId: string;
  shift: ShiftSummary;
  employeeId: string;
  employeeName: string;
  bidPriority: number;
  reason?: string;
  status: ApprovalStatus;
  awardedDate?: string;
  expiryDate: string;
  createdDate: string;
}

export interface OvertimeRecord {
  id: string;
  recordCode: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  shiftId?: string;
  date: string;
  regularHours: number;
  overtimeHours: number;
  overtimeType: 'daily' | 'weekly' | 'holiday' | 'emergency';
  overtimeRate: number;
  overtimeAmount: number;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  reason?: string;
  createdDate: string;
}

export interface ShiftConflict {
  id: string;
  conflictType: 'overlap' | 'insufficient_rest' | 'overtime_limit' | 'skill_mismatch' | 'unavailable' | 'other';
  severity: 'low' | 'medium' | 'high';
  employeeId: string;
  employeeName: string;
  shift1Id: string;
  shift1: ShiftSummary;
  shift2Id?: string;
  shift2?: ShiftSummary;
  description: string;
  recommendation?: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedDate?: string;
  resolution?: string;
  createdDate: string;
}

export interface ShiftNotification {
  id: string;
  notificationType: 'assignment' | 'swap_request' | 'swap_approved' | 'coverage_request' | 'schedule_published' | 'shift_cancelled' | 'reminder';
  recipientId: string;
  recipientName: string;
  title: string;
  message: string;
  relatedShiftId?: string;
  relatedRequestId?: string;
  isRead: boolean;
  readDate?: string;
  createdDate: string;
}

export interface ShiftTimeOff {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  affectedShifts: string[];
  coverageArranged: boolean;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedDate?: string;
  createdDate: string;
}

export interface ShiftMetrics {
  totalShifts: number;
  totalAssignments: number;
  averageCoverage: number;
  uncoveredShifts: number;
  totalOvertimeHours: number;
  totalOvertimeCost: number;
  swapRequests: number;
  approvedSwaps: number;
  rejectedSwaps: number;
  averageSwapApprovalTime: number;
  lateCheckIns: number;
  noShows: number;
  earlyDepartures: number;
  onTimePercentage: number;
  utilizationRate: number;
  laborCost: number;
  costPerHour: number;
  shiftsByType: { type: ShiftType; count: number; hours: number }[];
  shiftsByDepartment: { departmentId: string; departmentName: string; shifts: number; hours: number }[];
  coverageByDay: { day: DayOfWeek; coverage: number }[];
  topPerformers: { employeeId: string; employeeName: string; shiftsCompleted: number; onTimeRate: number }[];
  overtimeByEmployee: { employeeId: string; employeeName: string; hours: number; amount: number }[];
  conflictsByType: { type: string; count: number }[];
}

export interface ShiftSettings {
  enableShiftManagement: boolean;
  enableShiftSwaps: boolean;
  enableShiftBidding: boolean;
  enableOvertimeTracking: boolean;
  requireSwapApproval: boolean;
  swapApprovalLevels: number;
  autoPublishSchedule: boolean;
  schedulePublishDays: number;
  allowSelfAssignment: boolean;
  minRestHoursBetweenShifts: number;
  maxConsecutiveShifts: number;
  maxHoursPerWeek: number;
  maxHoursPerDay: number;
  overtimeThresholdDaily: number;
  overtimeThresholdWeekly: number;
  overtimeRateMultiplier: number;
  nightShiftPremium: number;
  weekendPremium: number;
  holidayPremium: number;
  enableBreakTracking: boolean;
  mandatoryBreakDuration: number;
  breakPaidThreshold: number;
  enableGPSCheckIn: boolean;
  gpsRadiusMeters: number;
  enableNotifications: boolean;
  notifyShiftChanges: boolean;
  notifySwapRequests: boolean;
  reminderHoursBefore: number;
  fiscalWeekStart: DayOfWeek;
  defaultCurrency: string;
}

export interface ShiftRule {
  id: string;
  ruleName: string;
  ruleType: 'rest_period' | 'max_hours' | 'skill_requirement' | 'certification' | 'age_restriction' | 'other';
  description: string;
  condition: string;
  threshold?: number;
  action: 'block' | 'warn' | 'require_approval';
  isEnforced: boolean;
  applicableDepartments?: string[];
  applicablePositions?: string[];
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
}

export interface ShiftAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'created' | 'assigned' | 'swapped' | 'cancelled' | 'modified' | 'published' | 'checked_in' | 'checked_out';
  entityType: 'shift' | 'assignment' | 'schedule' | 'swap_request';
  entityId: string;
  details: string;
  changes?: { field: string; oldValue: any; newValue: any }[];
  ipAddress?: string;
}

export interface StaffingRequirement {
  id: string;
  requirementCode: string;
  departmentId: string;
  departmentName: string;
  locationId: string;
  locationName: string;
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlot;
  minStaff: number;
  optimalStaff: number;
  maxStaff: number;
  requiredSkills: string[];
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  effectiveDate: string;
  endDate?: string;
  createdBy: string;
  createdDate: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  duration: number;
}

export interface ShiftReport {
  id: string;
  reportType: 'schedule' | 'coverage' | 'overtime' | 'attendance' | 'labor_cost';
  reportName: string;
  periodStart: string;
  periodEnd: string;
  filters: { [key: string]: any };
  data: any[];
  summary: { [key: string]: any };
  generatedBy: string;
  generatedDate: string;
  fileUrl?: string;
}
/**
 * Toast notification shape — used by the dashboard's Toast/useToast
 * components. Kept consistent across dashboards.
 */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
