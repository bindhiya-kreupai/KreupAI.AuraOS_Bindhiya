/**
 * @module shiftManagementService
 * @description Advanced shift management — shift pattern definition, assignment, swap requests,
 *   open shift claiming, shift differentials, and labor cost calculation.
 * @project AURA HCM Platform
 * @section 12.1 — Advanced Shift Management
 *
 * References:
 *  UAE Labour Law: Federal Decree-Law No. 33/2021 — Articles 17-19 (working hours, OT)
 *  KSA Labour Law: Articles 98-101 (OT at 50% weekday, 100% rest day)
 *  FLSA: 29 U.S.C. § 207 — no federal mandate for shift differentials (employer discretion)
 *  EU WTD: 2003/88/EC — night work, 11h daily rest, 24h weekly rest
 *  ILO: Convention 171 (Night Work) — health assessments for night workers
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type ShiftPatternType =
  | 'FIXED'
  | 'ROTATING'
  | 'SPLIT'
  | 'COMPRESSED'
  | 'FLEXIBLE'
  | 'ON_CALL';
export type RotationCycle = 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | '6_WEEK' | '12_WEEK';
export type ShiftSwapStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'COUNTER_PROPOSED';
export type DifferentialType =
  | 'NIGHT'
  | 'WEEKEND'
  | 'HOLIDAY'
  | 'OVERTIME'
  | 'HAZARD'
  | 'BILINGUAL'
  | 'LEAD'
  | 'ON_CALL';
export type DifferentialCalculation = 'FLAT_RATE' | 'PERCENT_BASE' | 'MULTIPLIER';
export type OpenShiftStatus = 'AVAILABLE' | 'CLAIMED' | 'FILLED' | 'CANCELLED' | 'EXPIRED';

export interface ShiftPattern {
  id: string;
  name: string;
  code: string;
  type: ShiftPatternType;
  description: string;
  rotationCycle: RotationCycle | null;
  shifts: PatternShift[];
  totalWeeklyHours: number;
  daysOn: number;
  daysOff: number;
  applicableDepartments: string[];
  applicableRoles: string[];
  isActive: boolean;
  effectiveDate: string;
  createdBy: string;
  createdAt: string;
}

export interface PatternShift {
  dayInCycle: number; // 1-based day in rotation cycle
  shiftCode: string;
  shiftName: string;
  startTime: string; // HH:mm
  endTime: string;
  isOvernight: boolean;
  breakMinutes: number;
  netHours: number;
  isOff: boolean;
  notes: string;
}

export interface EmployeeShiftAssignment {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  shiftPatternId: string;
  shiftPatternName: string;
  effectiveStartDate: string;
  effectiveEndDate: string | null;
  currentCycleDay: number;
  overrides: ShiftOverride[];
  assignedBy: string;
  assignedAt: string;
  notes: string;
}

export interface ShiftOverride {
  date: string;
  originalShiftCode: string;
  overrideShiftCode: string | null; // null = day off
  reason: string;
  approvedBy: string;
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmployeeCode: string;
  targetEmployeeId: string;
  targetEmployeeName: string;
  targetEmployeeCode: string;
  requesterShift: SwapShiftDetail;
  targetShift: SwapShiftDetail;
  status: ShiftSwapStatus;
  requestDate: string;
  expiryDate: string;
  approvedBy: string | null;
  approvedDate: string | null;
  rejectionReason: string | null;
  managerReviewRequired: boolean;
  isAutoApproved: boolean;
  validationChecks: SwapValidationCheck[];
  notes: string;
}

export interface SwapShiftDetail {
  date: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
}

export interface SwapValidationCheck {
  check: string;
  passed: boolean;
  detail: string;
}

export interface OpenShift {
  id: string;
  departmentId: string;
  departmentName: string;
  date: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  hoursRequired: number;
  requiredSkills: string[];
  minimumExperience: string | null;
  status: OpenShiftStatus;
  postedAt: string;
  expiresAt: string;
  postedBy: string;
  claimedBy: string | null;
  claimedAt: string | null;
  applicants: ShiftApplicant[];
  differentialApplicable: boolean;
  estimatedPay: number;
  notes: string;
}

export interface ShiftApplicant {
  employeeId: string;
  employeeName: string;
  appliedAt: string;
  qualificationScore: number; // AI-calculated fit score
  fatigueScore: number;
  preferenceMatch: boolean;
  status: 'PENDING' | 'SELECTED' | 'REJECTED';
}

export interface ShiftDifferential {
  id: string;
  name: string;
  type: DifferentialType;
  description: string;
  applicableShifts: string[]; // shift codes
  applicableDays: number[]; // 0=Sunday
  startTime: string | null; // null = all hours
  endTime: string | null;
  holidayList: string | null;
  calculationMethod: DifferentialCalculation;
  value: number; // flat rate or percent or multiplier
  currency: string;
  minimumHours: number;
  isStackable: boolean;
  effectiveDate: string;
  expiryDate: string | null;
  applicableJurisdictions: string[];
  isActive: boolean;
}

export interface DifferentialCalculationResult {
  employeeId: string;
  period: string;
  baseHourlyRate: number;
  differentials: AppliedDifferential[];
  totalDifferentialPay: number;
  totalHours: number;
  effectiveHourlyRate: number;
}

export interface AppliedDifferential {
  differentialId: string;
  differentialName: string;
  type: DifferentialType;
  hoursApplicable: number;
  rate: number;
  calculationMethod: DifferentialCalculation;
  amount: number;
}

export interface ShiftLaborCost {
  departmentId: string;
  period: string;
  totalShiftHours: number;
  regularHours: number;
  overtimeHours: number;
  nightHours: number;
  weekendHours: number;
  holidayHours: number;
  regularCost: number;
  overtimeCost: number;
  differentialCost: number;
  totalLaborCost: number;
  costPerHour: number;
  budgetedCost: number;
  budgetVariance: number;
  headcountByShift: HeadcountByShift[];
}

export interface HeadcountByShift {
  shiftName: string;
  employees: number;
  totalHours: number;
  totalCost: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_SHIFT_PATTERNS: ShiftPattern[] = [
  {
    id: 'sp-001',
    name: 'Standard 5-Day Week',
    code: 'STD-5D',
    type: 'FIXED',
    description: 'Monday–Friday 9 AM–5 PM, weekends off',
    rotationCycle: null,
    shifts: [
      {
        dayInCycle: 1,
        shiftCode: 'AM',
        shiftName: 'Morning',
        startTime: '09:00',
        endTime: '17:00',
        isOvernight: false,
        breakMinutes: 60,
        netHours: 7,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 2,
        shiftCode: 'AM',
        shiftName: 'Morning',
        startTime: '09:00',
        endTime: '17:00',
        isOvernight: false,
        breakMinutes: 60,
        netHours: 7,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 3,
        shiftCode: 'AM',
        shiftName: 'Morning',
        startTime: '09:00',
        endTime: '17:00',
        isOvernight: false,
        breakMinutes: 60,
        netHours: 7,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 4,
        shiftCode: 'AM',
        shiftName: 'Morning',
        startTime: '09:00',
        endTime: '17:00',
        isOvernight: false,
        breakMinutes: 60,
        netHours: 7,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 5,
        shiftCode: 'AM',
        shiftName: 'Morning',
        startTime: '09:00',
        endTime: '17:00',
        isOvernight: false,
        breakMinutes: 60,
        netHours: 7,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 6,
        shiftCode: 'OFF',
        shiftName: 'Weekend Off',
        startTime: '',
        endTime: '',
        isOvernight: false,
        breakMinutes: 0,
        netHours: 0,
        isOff: true,
        notes: '',
      },
      {
        dayInCycle: 7,
        shiftCode: 'OFF',
        shiftName: 'Weekend Off',
        startTime: '',
        endTime: '',
        isOvernight: false,
        breakMinutes: 0,
        netHours: 0,
        isOff: true,
        notes: '',
      },
    ],
    totalWeeklyHours: 35,
    daysOn: 5,
    daysOff: 2,
    applicableDepartments: ['Engineering', 'Finance', 'HR', 'Marketing'],
    applicableRoles: ['All'],
    isActive: true,
    effectiveDate: '2026-01-01',
    createdBy: 'HR Admin',
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'sp-002',
    name: '4x10 Compressed Workweek',
    code: 'CMP-4X10',
    type: 'COMPRESSED',
    description: 'Four 10-hour days, 3-day weekend',
    rotationCycle: null,
    shifts: [
      {
        dayInCycle: 1,
        shiftCode: 'AM10',
        shiftName: 'Long Day',
        startTime: '07:00',
        endTime: '17:30',
        isOvernight: false,
        breakMinutes: 30,
        netHours: 10,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 2,
        shiftCode: 'AM10',
        shiftName: 'Long Day',
        startTime: '07:00',
        endTime: '17:30',
        isOvernight: false,
        breakMinutes: 30,
        netHours: 10,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 3,
        shiftCode: 'AM10',
        shiftName: 'Long Day',
        startTime: '07:00',
        endTime: '17:30',
        isOvernight: false,
        breakMinutes: 30,
        netHours: 10,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 4,
        shiftCode: 'AM10',
        shiftName: 'Long Day',
        startTime: '07:00',
        endTime: '17:30',
        isOvernight: false,
        breakMinutes: 30,
        netHours: 10,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 5,
        shiftCode: 'OFF',
        shiftName: 'Day Off',
        startTime: '',
        endTime: '',
        isOvernight: false,
        breakMinutes: 0,
        netHours: 0,
        isOff: true,
        notes: '',
      },
      {
        dayInCycle: 6,
        shiftCode: 'OFF',
        shiftName: 'Weekend Off',
        startTime: '',
        endTime: '',
        isOvernight: false,
        breakMinutes: 0,
        netHours: 0,
        isOff: true,
        notes: '',
      },
      {
        dayInCycle: 7,
        shiftCode: 'OFF',
        shiftName: 'Weekend Off',
        startTime: '',
        endTime: '',
        isOvernight: false,
        breakMinutes: 0,
        netHours: 0,
        isOff: true,
        notes: '',
      },
    ],
    totalWeeklyHours: 40,
    daysOn: 4,
    daysOff: 3,
    applicableDepartments: ['Operations', 'Customer Support'],
    applicableRoles: ['Senior Engineer', 'Team Lead'],
    isActive: true,
    effectiveDate: '2026-01-01',
    createdBy: 'HR Admin',
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'sp-003',
    name: 'DuPont 12-Hour Rotating',
    code: 'DUP-12H',
    type: 'ROTATING',
    description: 'DuPont pattern — 4 days on, 3 off, 3 on, 1 off, 3 on, 3 off',
    rotationCycle: 'BI_WEEKLY',
    shifts: [
      {
        dayInCycle: 1,
        shiftCode: 'D12',
        shiftName: 'Day 12h',
        startTime: '06:00',
        endTime: '18:00',
        isOvernight: false,
        breakMinutes: 30,
        netHours: 11.5,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 2,
        shiftCode: 'D12',
        shiftName: 'Day 12h',
        startTime: '06:00',
        endTime: '18:00',
        isOvernight: false,
        breakMinutes: 30,
        netHours: 11.5,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 3,
        shiftCode: 'D12',
        shiftName: 'Day 12h',
        startTime: '06:00',
        endTime: '18:00',
        isOvernight: false,
        breakMinutes: 30,
        netHours: 11.5,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 4,
        shiftCode: 'D12',
        shiftName: 'Day 12h',
        startTime: '06:00',
        endTime: '18:00',
        isOvernight: false,
        breakMinutes: 30,
        netHours: 11.5,
        isOff: false,
        notes: '',
      },
      {
        dayInCycle: 5,
        shiftCode: 'OFF',
        shiftName: 'Day Off',
        startTime: '',
        endTime: '',
        isOvernight: false,
        breakMinutes: 0,
        netHours: 0,
        isOff: true,
        notes: '',
      },
      {
        dayInCycle: 6,
        shiftCode: 'OFF',
        shiftName: 'Day Off',
        startTime: '',
        endTime: '',
        isOvernight: false,
        breakMinutes: 0,
        netHours: 0,
        isOff: true,
        notes: '',
      },
      {
        dayInCycle: 7,
        shiftCode: 'OFF',
        shiftName: 'Day Off',
        startTime: '',
        endTime: '',
        isOvernight: false,
        breakMinutes: 0,
        netHours: 0,
        isOff: true,
        notes: '',
      },
    ],
    totalWeeklyHours: 42,
    daysOn: 4,
    daysOff: 3,
    applicableDepartments: ['Manufacturing', 'Security', 'Customer Support 24x7'],
    applicableRoles: ['All'],
    isActive: true,
    effectiveDate: '2026-01-01',
    createdBy: 'Operations Lead',
    createdAt: '2025-11-15T09:00:00Z',
  },
];

const MOCK_SWAP_REQUESTS: ShiftSwapRequest[] = [
  {
    id: 'swap-001',
    requesterId: 'emp-0201',
    requesterName: 'Priya Sharma',
    requesterEmployeeCode: 'EMP0201',
    targetEmployeeId: 'emp-0312',
    targetEmployeeName: 'Ahmed Al-Rashid',
    targetEmployeeCode: 'EMP0312',
    requesterShift: {
      date: '2026-03-05',
      shiftCode: 'AM',
      shiftName: 'Morning',
      startTime: '09:00',
      endTime: '17:00',
      hoursWorked: 7,
    },
    targetShift: {
      date: '2026-03-06',
      shiftCode: 'AM',
      shiftName: 'Morning',
      startTime: '09:00',
      endTime: '17:00',
      hoursWorked: 7,
    },
    status: 'PENDING',
    requestDate: '2026-02-26',
    expiryDate: '2026-03-03',
    approvedBy: null,
    approvedDate: null,
    rejectionReason: null,
    managerReviewRequired: false,
    isAutoApproved: false,
    validationChecks: [
      { check: 'Hours equivalency', passed: true, detail: 'Both shifts are 7 net hours' },
      {
        check: 'Skill compatibility',
        passed: true,
        detail: 'Both employees qualified for the shift',
      },
      { check: 'Fatigue check', passed: true, detail: 'Adequate rest periods maintained' },
      {
        check: 'OT threshold check',
        passed: true,
        detail: 'Swap does not trigger OT for either employee',
      },
    ],
    notes: 'Medical appointment on March 5',
  },
  {
    id: 'swap-002',
    requesterId: 'emp-0445',
    requesterName: 'Sara Mitchell',
    requesterEmployeeCode: 'EMP0445',
    targetEmployeeId: 'emp-0521',
    targetEmployeeName: 'Tom Chen',
    targetEmployeeCode: 'EMP0521',
    requesterShift: {
      date: '2026-03-07',
      shiftCode: 'PM',
      shiftName: 'Evening',
      startTime: '13:00',
      endTime: '21:00',
      hoursWorked: 7,
    },
    targetShift: {
      date: '2026-03-08',
      shiftCode: 'PM',
      shiftName: 'Evening',
      startTime: '13:00',
      endTime: '21:00',
      hoursWorked: 7,
    },
    status: 'APPROVED',
    requestDate: '2026-02-22',
    expiryDate: '2026-03-05',
    approvedBy: 'Dept Manager',
    approvedDate: '2026-02-23',
    rejectionReason: null,
    managerReviewRequired: false,
    isAutoApproved: true,
    validationChecks: [
      { check: 'Hours equivalency', passed: true, detail: 'Both shifts are 7 net hours' },
      {
        check: 'Skill compatibility',
        passed: true,
        detail: 'Both employees qualified for the shift',
      },
      { check: 'Fatigue check', passed: true, detail: 'Adequate rest periods maintained' },
      { check: 'OT threshold check', passed: true, detail: 'No OT triggered' },
    ],
    notes: '',
  },
];

const MOCK_OPEN_SHIFTS: OpenShift[] = [
  {
    id: 'open-001',
    departmentId: 'dept-eng',
    departmentName: 'Engineering',
    date: '2026-03-04',
    shiftCode: 'AM',
    shiftName: 'Morning Shift',
    startTime: '09:00',
    endTime: '17:00',
    hoursRequired: 7,
    requiredSkills: ['React', 'TypeScript'],
    minimumExperience: '2 years',
    status: 'AVAILABLE',
    postedAt: '2026-02-26T08:00:00Z',
    expiresAt: '2026-03-02T23:59:59Z',
    postedBy: 'Engineering Manager',
    claimedBy: null,
    claimedAt: null,
    applicants: [
      {
        employeeId: 'emp-0612',
        employeeName: 'Maria Santos',
        appliedAt: '2026-02-26T09:15:00Z',
        qualificationScore: 88,
        fatigueScore: 22,
        preferenceMatch: true,
        status: 'PENDING',
      },
      {
        employeeId: 'emp-0710',
        employeeName: 'Derek Johnson',
        appliedAt: '2026-02-26T10:30:00Z',
        qualificationScore: 72,
        fatigueScore: 35,
        preferenceMatch: false,
        status: 'PENDING',
      },
    ],
    differentialApplicable: false,
    estimatedPay: 356,
    notes: 'Covering FMLA leave — urgent',
  },
  {
    id: 'open-002',
    departmentId: 'dept-ops',
    departmentName: 'Operations',
    date: '2026-03-01',
    shiftCode: 'NGT',
    shiftName: 'Night Shift',
    startTime: '22:00',
    endTime: '06:00',
    hoursRequired: 7.5,
    requiredSkills: ['Operations', 'System Monitoring'],
    minimumExperience: null,
    status: 'AVAILABLE',
    postedAt: '2026-02-25T14:00:00Z',
    expiresAt: '2026-02-28T20:00:00Z',
    postedBy: 'Operations Manager',
    claimedBy: null,
    claimedAt: null,
    applicants: [],
    differentialApplicable: true,
    estimatedPay: 520, // Includes night differential
    notes: 'Night differential applies — 15% premium',
  },
];

const MOCK_DIFFERENTIALS: ShiftDifferential[] = [
  {
    id: 'diff-001',
    name: 'Night Shift Differential',
    type: 'NIGHT',
    description: '15% premium for hours worked between 10:00 PM and 6:00 AM',
    applicableShifts: ['NGT', 'OVERNIGHT'],
    applicableDays: [0, 1, 2, 3, 4, 5, 6],
    startTime: '22:00',
    endTime: '06:00',
    holidayList: null,
    calculationMethod: 'PERCENT_BASE',
    value: 15,
    currency: 'USD',
    minimumHours: 4,
    isStackable: true,
    effectiveDate: '2026-01-01',
    expiryDate: null,
    applicableJurisdictions: ['US', 'EU', 'UAE'],
    isActive: true,
  },
  {
    id: 'diff-002',
    name: 'Weekend Differential',
    type: 'WEEKEND',
    description: '10% premium for all hours worked on Saturday or Sunday',
    applicableShifts: ['AM', 'PM', 'NGT'],
    applicableDays: [0, 6], // Sunday and Saturday
    startTime: null,
    endTime: null,
    holidayList: null,
    calculationMethod: 'PERCENT_BASE',
    value: 10,
    currency: 'USD',
    minimumHours: 0,
    isStackable: true,
    effectiveDate: '2026-01-01',
    expiryDate: null,
    applicableJurisdictions: ['US', 'UAE'],
    isActive: true,
  },
  {
    id: 'diff-003',
    name: 'Public Holiday Premium',
    type: 'HOLIDAY',
    description: '50% premium (UAE Labour Law) for work on public holidays',
    applicableShifts: ['AM', 'PM', 'NGT', 'AM10', 'D12'],
    applicableDays: [0, 1, 2, 3, 4, 5, 6],
    startTime: null,
    endTime: null,
    holidayList: 'UAE_PUBLIC_HOLIDAYS',
    calculationMethod: 'PERCENT_BASE',
    value: 50,
    currency: 'AED',
    minimumHours: 0,
    isStackable: false,
    effectiveDate: '2026-01-01',
    expiryDate: null,
    applicableJurisdictions: ['UAE'],
    isActive: true,
  },
  {
    id: 'diff-004',
    name: 'On-Call Availability Pay',
    type: 'ON_CALL',
    description: '$50 flat rate per day for being on-call, plus 1.5x for hours actually worked',
    applicableShifts: ['ON_CALL'],
    applicableDays: [0, 1, 2, 3, 4, 5, 6],
    startTime: null,
    endTime: null,
    holidayList: null,
    calculationMethod: 'FLAT_RATE',
    value: 50,
    currency: 'USD',
    minimumHours: 0,
    isStackable: true,
    effectiveDate: '2026-01-01',
    expiryDate: null,
    applicableJurisdictions: ['US'],
    isActive: true,
  },
];

// ── Service Functions ──────────────────────────────────────────────────────────

/**
 * Get all defined shift patterns.
 */
export async function getShiftPatterns(filters?: {
  departmentId?: string;
  type?: ShiftPatternType;
}): Promise<ShiftPattern[]> {
  await new Promise((r) => setTimeout(r, 250));
  let results = MOCK_SHIFT_PATTERNS.filter((p) => p.isActive);
  if (filters?.type) results = results.filter((p) => p.type === filters.type);
  if (filters?.departmentId) {
    results = results.filter(
      (p) =>
        p.applicableDepartments.includes('All') ||
        p.applicableDepartments.includes(filters.departmentId!)
    );
  }
  return results;
}

/**
 * Create a new shift pattern definition.
 */
export async function createShiftPattern(
  data: Omit<ShiftPattern, 'id' | 'createdAt'>
): Promise<ShiftPattern> {
  await new Promise((r) => setTimeout(r, 300));
  const newPattern: ShiftPattern = {
    ...data,
    id: `sp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  MOCK_SHIFT_PATTERNS.push(newPattern);
  return newPattern;
}

/**
 * Assign a shift pattern to an employee for a date range.
 */
export async function assignShift(
  employeeId: string,
  shiftPatternId: string,
  dateRange: { startDate: string; endDate: string | null }
): Promise<EmployeeShiftAssignment> {
  await new Promise((r) => setTimeout(r, 300));
  const pattern = MOCK_SHIFT_PATTERNS.find((p) => p.id === shiftPatternId);
  if (!pattern) throw new Error(`Shift pattern ${shiftPatternId} not found`);

  return {
    id: `assign-${Date.now()}`,
    employeeId,
    employeeName: 'Employee',
    employeeCode: 'EMP001',
    department: 'Engineering',
    shiftPatternId,
    shiftPatternName: pattern.name,
    effectiveStartDate: dateRange.startDate,
    effectiveEndDate: dateRange.endDate,
    currentCycleDay: 1,
    overrides: [],
    assignedBy: 'HR Admin',
    assignedAt: new Date().toISOString(),
    notes: '',
  };
}

/**
 * Get shift swap requests with filters.
 */
export async function getShiftSwapRequests(filters?: {
  status?: ShiftSwapStatus;
  employeeId?: string;
  startDate?: string;
}): Promise<ShiftSwapRequest[]> {
  await new Promise((r) => setTimeout(r, 250));
  let results = [...MOCK_SWAP_REQUESTS];
  if (filters?.status) results = results.filter((s) => s.status === filters.status);
  if (filters?.employeeId) {
    results = results.filter(
      (s) => s.requesterId === filters.employeeId || s.targetEmployeeId === filters.employeeId
    );
  }
  if (filters?.startDate) {
    results = results.filter((s) => s.requesterId >= filters.startDate!);
  }
  return results;
}

/**
 * Request a shift swap between two employees.
 */
export async function requestShiftSwap(
  requesterId: string,
  targetEmployeeId: string,
  requesterShiftDate: string,
  targetShiftDate: string
): Promise<ShiftSwapRequest> {
  await new Promise((r) => setTimeout(r, 300));

  const swap: ShiftSwapRequest = {
    id: `swap-${Date.now()}`,
    requesterId,
    requesterName: 'Requesting Employee',
    requesterEmployeeCode: 'EMP001',
    targetEmployeeId,
    targetEmployeeName: 'Target Employee',
    targetEmployeeCode: 'EMP002',
    requesterShift: {
      date: requesterShiftDate,
      shiftCode: 'AM',
      shiftName: 'Morning',
      startTime: '09:00',
      endTime: '17:00',
      hoursWorked: 7,
    },
    targetShift: {
      date: targetShiftDate,
      shiftCode: 'AM',
      shiftName: 'Morning',
      startTime: '09:00',
      endTime: '17:00',
      hoursWorked: 7,
    },
    status: 'PENDING',
    requestDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    approvedBy: null,
    approvedDate: null,
    rejectionReason: null,
    managerReviewRequired: false,
    isAutoApproved: false,
    validationChecks: [
      { check: 'Hours equivalency', passed: true, detail: 'Both shifts are equal hours' },
      { check: 'Skill compatibility', passed: true, detail: 'Both employees qualified' },
      { check: 'Fatigue check', passed: true, detail: 'Rest periods maintained' },
      { check: 'OT threshold check', passed: true, detail: 'No OT triggered by swap' },
    ],
    notes: '',
  };

  MOCK_SWAP_REQUESTS.push(swap);
  return swap;
}

/**
 * Approve a shift swap request with validation.
 */
export async function approveShiftSwap(swapId: string): Promise<ShiftSwapRequest> {
  await new Promise((r) => setTimeout(r, 300));
  const swap = MOCK_SWAP_REQUESTS.find((s) => s.id === swapId);
  if (!swap) throw new Error(`Swap request ${swapId} not found`);
  if (swap.status !== 'PENDING') throw new Error(`Swap is not in PENDING status`);

  const allValidationsPassed = swap.validationChecks.every((c) => c.passed);
  if (!allValidationsPassed) {
    throw new Error('Cannot approve swap — one or more validation checks failed');
  }

  swap.status = 'APPROVED';
  swap.approvedBy = 'Manager';
  swap.approvedDate = new Date().toISOString().slice(0, 10);

  return swap;
}

/**
 * Get open (unfilled) shifts for a department.
 */
export async function getOpenShifts(
  departmentId: string,
  dateRange?: { startDate: string; endDate: string }
): Promise<OpenShift[]> {
  await new Promise((r) => setTimeout(r, 250));
  let results = MOCK_OPEN_SHIFTS.filter(
    (s) => s.departmentId === departmentId && s.status === 'AVAILABLE'
  );
  if (dateRange) {
    results = results.filter((s) => s.date >= dateRange.startDate && s.date <= dateRange.endDate);
  }
  return results;
}

/**
 * Allow an employee to claim an open shift.
 */
export async function claimOpenShift(shiftId: string, employeeId: string): Promise<OpenShift> {
  await new Promise((r) => setTimeout(r, 300));
  const shift = MOCK_OPEN_SHIFTS.find((s) => s.id === shiftId);
  if (!shift) throw new Error(`Open shift ${shiftId} not found`);
  if (shift.status !== 'AVAILABLE') throw new Error('Shift is no longer available');

  const applicant: ShiftApplicant = {
    employeeId,
    employeeName: 'Employee',
    appliedAt: new Date().toISOString(),
    qualificationScore: 82,
    fatigueScore: 25,
    preferenceMatch: true,
    status: 'PENDING',
  };

  shift.applicants.push(applicant);
  // Auto-assign if no manager review required
  shift.claimedBy = employeeId;
  shift.claimedAt = new Date().toISOString();
  shift.status = 'CLAIMED';

  return shift;
}

/**
 * Get all shift differential rules.
 */
export async function getShiftDifferentials(jurisdiction?: string): Promise<ShiftDifferential[]> {
  await new Promise((r) => setTimeout(r, 200));
  if (jurisdiction) {
    return MOCK_DIFFERENTIALS.filter(
      (d) =>
        d.isActive &&
        (d.applicableJurisdictions.includes(jurisdiction) ||
          d.applicableJurisdictions.includes('ALL'))
    );
  }
  return MOCK_DIFFERENTIALS.filter((d) => d.isActive);
}

/**
 * Calculate shift-based labor cost for a department over a period.
 */
export async function calculateShiftCost(
  departmentId: string,
  period: string
): Promise<ShiftLaborCost> {
  await new Promise((r) => setTimeout(r, 350));

  return {
    departmentId,
    period,
    totalShiftHours: 1680,
    regularHours: 1580,
    overtimeHours: 60,
    nightHours: 120,
    weekendHours: 80,
    holidayHours: 0,
    regularCost: 126400,
    overtimeCost: 7200, // OT at 1.5x
    differentialCost: 5280, // Night + weekend premiums
    totalLaborCost: 138880,
    costPerHour: parseFloat((138880 / 1680).toFixed(2)),
    budgetedCost: 135000,
    budgetVariance: 3880,
    headcountByShift: [
      { shiftName: 'Morning (09:00-17:00)', employees: 18, totalHours: 1008, totalCost: 80640 },
      { shiftName: 'Evening (13:00-21:00)', employees: 6, totalHours: 336, totalCost: 26880 },
      { shiftName: 'Night (22:00-06:00)', employees: 3, totalHours: 168, totalCost: 16800 },
      { shiftName: 'On-Call', employees: 2, totalHours: 168, totalCost: 14560 },
    ],
  };
}

// ── Named export ───────────────────────────────────────────────────────────────

export const shiftManagementService = {
  getShiftPatterns,
  createShiftPattern,
  assignShift,
  getShiftSwapRequests,
  requestShiftSwap,
  approveShiftSwap,
  getOpenShifts,
  claimOpenShift,
  getShiftDifferentials,
  calculateShiftCost,
};
