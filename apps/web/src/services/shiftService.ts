/**
 * @module shiftService
 * @description Advanced Shift & Overtime Management — shift patterns, roster management,
 *   shift swaps, overtime requests, country-specific OT pay calculations.
 * @project AURA HCM Platform
 * @section 12.1-12.2 — Advanced Time & Shift Management
 * @legal UAE Labour Law Federal Decree-Law No. 33 of 2021 — Articles 17-20 (working hours),
 *   Article 19 (overtime at 25% weekday, 50% Friday/public holiday);
 *   KSA Labour Law Articles 98-101 (50% weekday OT, 100% rest day OT)
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type ShiftType =
  | 'Morning'
  | 'Evening'
  | 'Night'
  | 'Rotational'
  | 'Flexible'
  | 'Split'
  | 'Day';
export type OvertimeType = 'Weekday' | 'Weekend' | 'Public Holiday' | 'Night Premium';
export type SwapStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Counter Proposed';
export type OvertimeStatus = 'Pending' | 'Approved' | 'Rejected' | 'Processed';
export type Country = 'UAE' | 'KSA' | 'India' | 'Global';

export interface ShiftPattern {
  id: string;
  name: string;
  code: string;
  type: ShiftType;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  gracePeriodMinutes: number;
  breakMinutes: number;
  workingHours: number;
  isOvernight: boolean;
  colorCode: string; // Tailwind bg color class
  applicableDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  country: Country | 'All';
  isActive: boolean;
  minimumRestHours: number; // required rest between shifts (11h by default in UAE)
  notes: string;
}

export interface RosterEntry {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  departmentId: string;
  designation: string;
  shiftId: string | null;
  shiftName: string | null;
  shiftType: ShiftType | 'Off' | 'Leave' | 'Holiday';
  date: string; // YYYY-MM-DD
  isSwapped: boolean;
  swapRequestId: string | null;
  notes: string;
}

export interface ShiftRoster {
  departmentId: string;
  weekStartDate: string;
  weekEndDate: string;
  entries: RosterEntry[];
  employees: RosterEmployee[];
}

export interface RosterEmployee {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  defaultShiftId: string;
  defaultShiftName: string;
  avatarInitials: string;
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmployeeCode: string;
  targetEmployeeId: string;
  targetEmployeeName: string;
  requesterShiftDate: string;
  requesterShiftId: string;
  requesterShiftName: string;
  targetShiftDate: string;
  targetShiftId: string;
  targetShiftName: string;
  reason: string;
  status: SwapStatus;
  managerId: string;
  managerName: string;
  requestedDate: string;
  approvedDate: string | null;
  approvedBy: string | null;
  managerComments: string;
  expiresAt: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  managerId: string;
  managerName: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  overtimeType: OvertimeType;
  reason: string;
  projectCode: string | null;
  status: OvertimeStatus;
  requestedDate: string;
  approvedDate: string | null;
  approvedBy: string | null;
  rejectionReason: string | null;
  payRate: number; // multiplier e.g. 1.25
  estimatedPay: number;
  actualPay: number | null;
  country: Country;
  isProcessedInPayroll: boolean;
}

export interface OvertimeSummary {
  employeeId: string;
  employeeName: string;
  month: string;
  weekdayOTHours: number;
  weekendOTHours: number;
  holidayOTHours: number;
  totalOTHours: number;
  totalOTPay: number;
  otBudgetAllocated: number;
  otBudgetUsed: number;
  pendingRequests: number;
  department: string;
}

export interface CreateShiftData {
  name: string;
  code: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  breakMinutes: number;
  applicableDays: number[];
  country: Country | 'All';
  minimumRestHours: number;
  notes: string;
}

export interface ShiftConflict {
  type: 'Double Booking' | 'Insufficient Rest' | 'Overtime Limit' | 'Day Off Violated';
  description: string;
  employeeId: string;
  date: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_SHIFT_PATTERNS: ShiftPattern[] = [
  {
    id: 'shift-morning',
    name: 'Morning Shift',
    code: 'MS',
    type: 'Morning',
    startTime: '07:00',
    endTime: '15:00',
    gracePeriodMinutes: 10,
    breakMinutes: 30,
    workingHours: 7.5,
    isOvernight: false,
    colorCode: 'bg-sky-100 text-sky-800 border-sky-300',
    applicableDays: [0, 1, 2, 3, 4],
    country: 'All',
    isActive: true,
    minimumRestHours: 11,
    notes: 'Standard morning shift',
  },
  {
    id: 'shift-day',
    name: 'Day Shift',
    code: 'DS',
    type: 'Day',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMinutes: 15,
    breakMinutes: 60,
    workingHours: 8,
    isOvernight: false,
    colorCode: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    applicableDays: [0, 1, 2, 3, 4],
    country: 'All',
    isActive: true,
    minimumRestHours: 11,
    notes: 'Standard 9-to-5 office shift',
  },
  {
    id: 'shift-evening',
    name: 'Evening Shift',
    code: 'ES',
    type: 'Evening',
    startTime: '15:00',
    endTime: '23:00',
    gracePeriodMinutes: 10,
    breakMinutes: 30,
    workingHours: 7.5,
    isOvernight: false,
    colorCode: 'bg-amber-100 text-amber-800 border-amber-300',
    applicableDays: [0, 1, 2, 3, 4, 5],
    country: 'All',
    isActive: true,
    minimumRestHours: 11,
    notes: 'Evening customer support shift',
  },
  {
    id: 'shift-night',
    name: 'Night Shift',
    code: 'NS',
    type: 'Night',
    startTime: '23:00',
    endTime: '07:00',
    gracePeriodMinutes: 10,
    breakMinutes: 45,
    workingHours: 7.25,
    isOvernight: true,
    colorCode: 'bg-purple-100 text-purple-800 border-purple-300',
    applicableDays: [0, 1, 2, 3, 4, 5, 6],
    country: 'All',
    isActive: true,
    minimumRestHours: 12,
    notes: 'Night security and operations shift. Night premium applies.',
  },
  {
    id: 'shift-flexible',
    name: 'Flexible Hours',
    code: 'FX',
    type: 'Flexible',
    startTime: '08:00',
    endTime: '20:00',
    gracePeriodMinutes: 60,
    breakMinutes: 60,
    workingHours: 8,
    isOvernight: false,
    colorCode: 'bg-teal-100 text-teal-800 border-teal-300',
    applicableDays: [0, 1, 2, 3, 4],
    country: 'All',
    isActive: true,
    minimumRestHours: 11,
    notes: 'Core hours 10:00-16:00. Employee chooses start/end within window.',
  },
];

const today = new Date();
const getWeekDates = (weekOffset = 0) => {
  const dates: string[] = [];
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
};

const THIS_WEEK = getWeekDates(0);

const MOCK_ROSTER_EMPLOYEES: RosterEmployee[] = [
  {
    employeeId: 'emp-001',
    employeeCode: 'EMP001',
    employeeName: 'Rahul Mehta',
    designation: 'Tech Lead',
    defaultShiftId: 'shift-day',
    defaultShiftName: 'Day Shift',
    avatarInitials: 'RM',
  },
  {
    employeeId: 'emp-002',
    employeeCode: 'EMP002',
    employeeName: 'Priya Sharma',
    designation: 'HR Manager',
    defaultShiftId: 'shift-day',
    defaultShiftName: 'Day Shift',
    avatarInitials: 'PS',
  },
  {
    employeeId: 'emp-003',
    employeeCode: 'EMP003',
    employeeName: 'Anita Nair',
    designation: 'Engineer',
    defaultShiftId: 'shift-morning',
    defaultShiftName: 'Morning Shift',
    avatarInitials: 'AN',
  },
  {
    employeeId: 'emp-004',
    employeeCode: 'EMP004',
    employeeName: 'Suresh Kumar',
    designation: 'Junior Engineer',
    defaultShiftId: 'shift-day',
    defaultShiftName: 'Day Shift',
    avatarInitials: 'SK',
  },
  {
    employeeId: 'emp-005',
    employeeCode: 'EMP005',
    employeeName: 'Kavita Singh',
    designation: 'QA Engineer',
    defaultShiftId: 'shift-evening',
    defaultShiftName: 'Evening Shift',
    avatarInitials: 'KS',
  },
  {
    employeeId: 'emp-006',
    employeeCode: 'EMP006',
    employeeName: 'Ahmed Al-Rashid',
    designation: 'DevOps Engineer',
    defaultShiftId: 'shift-night',
    defaultShiftName: 'Night Shift',
    avatarInitials: 'AA',
  },
  {
    employeeId: 'emp-007',
    employeeCode: 'EMP007',
    employeeName: 'Fatima Al-Hassan',
    designation: 'UI Designer',
    defaultShiftId: 'shift-flexible',
    defaultShiftName: 'Flexible Hours',
    avatarInitials: 'FA',
  },
  {
    employeeId: 'emp-008',
    employeeCode: 'EMP008',
    employeeName: 'David Chen',
    designation: 'Backend Engineer',
    defaultShiftId: 'shift-day',
    defaultShiftName: 'Day Shift',
    avatarInitials: 'DC',
  },
];

function buildRosterEntries(): RosterEntry[] {
  const entries: RosterEntry[] = [];
  const shiftAssignments: Record<string, (string | null)[]> = {
    'emp-001': [null, 'shift-day', 'shift-day', 'shift-day', 'shift-day', 'shift-day', null],
    'emp-002': [null, 'shift-day', 'shift-day', 'shift-day', 'shift-day', 'shift-day', null],
    'emp-003': [
      null,
      'shift-morning',
      'shift-morning',
      'shift-morning',
      'shift-morning',
      'shift-morning',
      null,
    ],
    'emp-004': [null, 'shift-day', 'shift-day', null, 'shift-day', 'shift-day', null], // Wednesday off
    'emp-005': [
      null,
      'shift-evening',
      'shift-evening',
      'shift-evening',
      'shift-evening',
      'shift-evening',
      null,
    ],
    'emp-006': [
      'shift-night',
      null,
      'shift-night',
      'shift-night',
      null,
      'shift-night',
      'shift-night',
    ],
    'emp-007': [
      null,
      'shift-flexible',
      'shift-flexible',
      'shift-flexible',
      'shift-flexible',
      'shift-flexible',
      null,
    ],
    'emp-008': [null, 'shift-day', 'shift-day', 'shift-day', 'shift-day', 'shift-day', null],
  };

  MOCK_ROSTER_EMPLOYEES.forEach((emp) => {
    THIS_WEEK.forEach((date, dayIndex) => {
      const shiftId = shiftAssignments[emp.employeeId]?.[dayIndex] ?? null;
      const shift = shiftId ? MOCK_SHIFT_PATTERNS.find((s) => s.id === shiftId) : null;
      const isWeekend = dayIndex === 0 || dayIndex === 6;

      entries.push({
        id: `re-${emp.employeeId}-${date}`,
        employeeId: emp.employeeId,
        employeeCode: emp.employeeCode,
        employeeName: emp.employeeName,
        department: 'Engineering',
        departmentId: 'dept-001',
        designation: emp.designation,
        shiftId,
        shiftName: shift?.name ?? null,
        shiftType: isWeekend ? 'Off' : shift ? shift.type : 'Off',
        date,
        isSwapped: emp.employeeId === 'emp-003' && dayIndex === 2,
        swapRequestId: emp.employeeId === 'emp-003' && dayIndex === 2 ? 'swap-001' : null,
        notes: '',
      });
    });
  });

  return entries;
}

const MOCK_SHIFT_SWAP_REQUESTS: ShiftSwapRequest[] = [
  {
    id: 'swap-001',
    requesterId: 'emp-003',
    requesterName: 'Anita Nair',
    requesterEmployeeCode: 'EMP003',
    targetEmployeeId: 'emp-001',
    targetEmployeeName: 'Rahul Mehta',
    requesterShiftDate: THIS_WEEK[2],
    requesterShiftId: 'shift-morning',
    requesterShiftName: 'Morning Shift',
    targetShiftDate: THIS_WEEK[2],
    targetShiftId: 'shift-day',
    targetShiftName: 'Day Shift',
    reason: 'Doctor appointment in the afternoon. Can cover morning slot.',
    status: 'Approved',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    requestedDate: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
    approvedDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    approvedBy: 'Rahul Mehta',
    managerComments: 'Approved. Please confirm with colleague.',
    expiresAt: THIS_WEEK[2],
  },
  {
    id: 'swap-002',
    requesterId: 'emp-005',
    requesterName: 'Kavita Singh',
    requesterEmployeeCode: 'EMP005',
    targetEmployeeId: 'emp-003',
    targetEmployeeName: 'Anita Nair',
    requesterShiftDate: THIS_WEEK[3],
    requesterShiftId: 'shift-evening',
    requesterShiftName: 'Evening Shift',
    targetShiftDate: THIS_WEEK[3],
    targetShiftId: 'shift-morning',
    targetShiftName: 'Morning Shift',
    reason: 'School event for my child in the afternoon.',
    status: 'Pending',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    requestedDate: today.toISOString().slice(0, 10),
    approvedDate: null,
    approvedBy: null,
    managerComments: '',
    expiresAt: THIS_WEEK[3],
  },
  {
    id: 'swap-003',
    requesterId: 'emp-006',
    requesterName: 'Ahmed Al-Rashid',
    requesterEmployeeCode: 'EMP006',
    targetEmployeeId: 'emp-008',
    targetEmployeeName: 'David Chen',
    requesterShiftDate: THIS_WEEK[4],
    requesterShiftId: 'shift-night',
    requesterShiftName: 'Night Shift',
    targetShiftDate: THIS_WEEK[4],
    targetShiftId: 'shift-day',
    targetShiftName: 'Day Shift',
    reason: 'Infrastructure deployment requires daytime coordination.',
    status: 'Pending',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    requestedDate: today.toISOString().slice(0, 10),
    approvedDate: null,
    approvedBy: null,
    managerComments: '',
    expiresAt: THIS_WEEK[4],
  },
  {
    id: 'swap-004',
    requesterId: 'emp-004',
    requesterName: 'Suresh Kumar',
    requesterEmployeeCode: 'EMP004',
    targetEmployeeId: 'emp-007',
    targetEmployeeName: 'Fatima Al-Hassan',
    requesterShiftDate: THIS_WEEK[1],
    requesterShiftId: 'shift-day',
    requesterShiftName: 'Day Shift',
    targetShiftDate: THIS_WEEK[1],
    targetShiftId: 'shift-flexible',
    targetShiftName: 'Flexible Hours',
    reason: 'Need flexible start time for visa medical appointment.',
    status: 'Rejected',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    requestedDate: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
    approvedDate: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10),
    approvedBy: 'Rahul Mehta',
    managerComments: 'Insufficient coverage for the day. Please apply for short leave instead.',
    expiresAt: THIS_WEEK[1],
  },
  {
    id: 'swap-005',
    requesterId: 'emp-008',
    requesterName: 'David Chen',
    requesterEmployeeCode: 'EMP008',
    targetEmployeeId: 'emp-001',
    targetEmployeeName: 'Rahul Mehta',
    requesterShiftDate: THIS_WEEK[5],
    requesterShiftId: 'shift-day',
    requesterShiftName: 'Day Shift',
    targetShiftDate: THIS_WEEK[5],
    targetShiftId: 'shift-day',
    targetShiftName: 'Day Shift',
    reason: 'Cross-training for production release coverage.',
    status: 'Pending',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    requestedDate: today.toISOString().slice(0, 10),
    approvedDate: null,
    approvedBy: null,
    managerComments: '',
    expiresAt: THIS_WEEK[5],
  },
  {
    id: 'swap-006',
    requesterId: 'emp-007',
    requesterName: 'Fatima Al-Hassan',
    requesterEmployeeCode: 'EMP007',
    targetEmployeeId: 'emp-002',
    targetEmployeeName: 'Priya Sharma',
    requesterShiftDate: THIS_WEEK[1],
    requesterShiftId: 'shift-flexible',
    requesterShiftName: 'Flexible Hours',
    targetShiftDate: THIS_WEEK[1],
    targetShiftId: 'shift-day',
    targetShiftName: 'Day Shift',
    reason: 'Design review meeting scheduled at 8 AM.',
    status: 'Counter Proposed',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    requestedDate: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    approvedDate: null,
    approvedBy: null,
    managerComments: 'Counter: Can you both take day shift and adjust times internally?',
    expiresAt: THIS_WEEK[1],
  },
  {
    id: 'swap-007',
    requesterId: 'emp-002',
    requesterName: 'Priya Sharma',
    requesterEmployeeCode: 'EMP002',
    targetEmployeeId: 'emp-004',
    targetEmployeeName: 'Suresh Kumar',
    requesterShiftDate: THIS_WEEK[4],
    requesterShiftId: 'shift-day',
    requesterShiftName: 'Day Shift',
    targetShiftDate: THIS_WEEK[4],
    targetShiftId: 'shift-day',
    targetShiftName: 'Day Shift',
    reason: 'Board prep session requires late stay. Need coverage for early tasks.',
    status: 'Approved',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    requestedDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    approvedDate: new Date(Date.now() - 1 * 86400000).toISOString().slice(0, 10),
    approvedBy: 'Rahul Mehta',
    managerComments: 'Approved.',
    expiresAt: THIS_WEEK[4],
  },
  {
    id: 'swap-008',
    requesterId: 'emp-006',
    requesterName: 'Ahmed Al-Rashid',
    requesterEmployeeCode: 'EMP006',
    targetEmployeeId: 'emp-005',
    targetEmployeeName: 'Kavita Singh',
    requesterShiftDate: THIS_WEEK[5],
    requesterShiftId: 'shift-night',
    requesterShiftName: 'Night Shift',
    targetShiftDate: THIS_WEEK[5],
    targetShiftId: 'shift-evening',
    targetShiftName: 'Evening Shift',
    reason: 'Attending security certification exam Friday morning.',
    status: 'Pending',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    requestedDate: today.toISOString().slice(0, 10),
    approvedDate: null,
    approvedBy: null,
    managerComments: '',
    expiresAt: THIS_WEEK[5],
  },
];

const MOCK_OVERTIME_REQUESTS: OvertimeRequest[] = [
  {
    id: 'ot-001',
    employeeId: 'emp-001',
    employeeCode: 'EMP001',
    employeeName: 'Rahul Mehta',
    department: 'Engineering',
    designation: 'Tech Lead',
    managerId: 'emp-admin',
    managerName: 'CTO',
    overtimeDate: THIS_WEEK[1],
    startTime: '18:00',
    endTime: '21:00',
    hours: 3,
    overtimeType: 'Weekday',
    reason: 'Product launch hotfix deployment',
    projectCode: 'PROJ-AOS-001',
    status: 'Approved',
    requestedDate: THIS_WEEK[0],
    approvedDate: THIS_WEEK[0],
    approvedBy: 'CTO',
    rejectionReason: null,
    payRate: 1.25,
    estimatedPay: 562.5,
    actualPay: 562.5,
    country: 'UAE',
    isProcessedInPayroll: false,
  },
  {
    id: 'ot-002',
    employeeId: 'emp-006',
    employeeCode: 'EMP006',
    employeeName: 'Ahmed Al-Rashid',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    overtimeDate: THIS_WEEK[2],
    startTime: '08:00',
    endTime: '10:00',
    hours: 2,
    overtimeType: 'Weekday',
    reason: 'Critical server migration before business hours',
    projectCode: 'PROJ-INFRA-003',
    status: 'Approved',
    requestedDate: THIS_WEEK[1],
    approvedDate: THIS_WEEK[1],
    approvedBy: 'Rahul Mehta',
    rejectionReason: null,
    payRate: 1.25,
    estimatedPay: 312.5,
    actualPay: null,
    country: 'UAE',
    isProcessedInPayroll: false,
  },
  {
    id: 'ot-003',
    employeeId: 'emp-003',
    employeeCode: 'EMP003',
    employeeName: 'Anita Nair',
    department: 'Engineering',
    designation: 'Engineer',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    overtimeDate: THIS_WEEK[5],
    startTime: '15:00',
    endTime: '19:00',
    hours: 4,
    overtimeType: 'Weekend',
    reason: 'UAT testing for client demo on Monday',
    projectCode: 'PROJ-AOS-001',
    status: 'Pending',
    requestedDate: today.toISOString().slice(0, 10),
    approvedDate: null,
    approvedBy: null,
    rejectionReason: null,
    payRate: 1.5,
    estimatedPay: 900,
    actualPay: null,
    country: 'UAE',
    isProcessedInPayroll: false,
  },
  {
    id: 'ot-004',
    employeeId: 'emp-008',
    employeeCode: 'EMP008',
    employeeName: 'David Chen',
    department: 'Engineering',
    designation: 'Backend Engineer',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    overtimeDate: THIS_WEEK[4],
    startTime: '18:00',
    endTime: '22:00',
    hours: 4,
    overtimeType: 'Weekday',
    reason: 'API performance optimization — deadline-critical',
    projectCode: 'PROJ-API-002',
    status: 'Pending',
    requestedDate: today.toISOString().slice(0, 10),
    approvedDate: null,
    approvedBy: null,
    rejectionReason: null,
    payRate: 1.25,
    estimatedPay: 750,
    actualPay: null,
    country: 'UAE',
    isProcessedInPayroll: false,
  },
  {
    id: 'ot-005',
    employeeId: 'emp-005',
    employeeCode: 'EMP005',
    employeeName: 'Kavita Singh',
    department: 'Engineering',
    designation: 'QA Engineer',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    overtimeDate: THIS_WEEK[3],
    startTime: '23:00',
    endTime: '02:00',
    hours: 3,
    overtimeType: 'Night Premium',
    reason: 'Release regression testing window',
    projectCode: 'PROJ-AOS-001',
    status: 'Approved',
    requestedDate: THIS_WEEK[2],
    approvedDate: THIS_WEEK[2],
    approvedBy: 'Rahul Mehta',
    rejectionReason: null,
    payRate: 1.5,
    estimatedPay: 675,
    actualPay: null,
    country: 'UAE',
    isProcessedInPayroll: false,
  },
  {
    id: 'ot-006',
    employeeId: 'emp-004',
    employeeCode: 'EMP004',
    employeeName: 'Suresh Kumar',
    department: 'Engineering',
    designation: 'Junior Engineer',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    overtimeDate: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
    startTime: '18:00',
    endTime: '20:00',
    hours: 2,
    overtimeType: 'Weekday',
    reason: 'Training module completion',
    projectCode: null,
    status: 'Rejected',
    requestedDate: new Date(Date.now() - 8 * 86400000).toISOString().slice(0, 10),
    approvedDate: null,
    approvedBy: null,
    rejectionReason:
      'Training does not qualify for overtime. Please use learning hours budget instead.',
    payRate: 1.25,
    estimatedPay: 225,
    actualPay: null,
    country: 'UAE',
    isProcessedInPayroll: false,
  },
  {
    id: 'ot-007',
    employeeId: 'emp-007',
    employeeCode: 'EMP007',
    employeeName: 'Fatima Al-Hassan',
    department: 'Engineering',
    designation: 'UI Designer',
    managerId: 'emp-001',
    managerName: 'Rahul Mehta',
    overtimeDate: THIS_WEEK[1],
    startTime: '19:00',
    endTime: '21:30',
    hours: 2.5,
    overtimeType: 'Weekday',
    reason: 'Design system documentation — client presentation',
    projectCode: 'PROJ-DESIGN-001',
    status: 'Pending',
    requestedDate: today.toISOString().slice(0, 10),
    approvedDate: null,
    approvedBy: null,
    rejectionReason: null,
    payRate: 1.25,
    estimatedPay: 468.75,
    actualPay: null,
    country: 'UAE',
    isProcessedInPayroll: false,
  },
  {
    id: 'ot-008',
    employeeId: 'emp-002',
    employeeCode: 'EMP002',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    designation: 'HR Manager',
    managerId: 'emp-admin',
    managerName: 'CEO',
    overtimeDate: THIS_WEEK[3],
    startTime: '18:00',
    endTime: '20:00',
    hours: 2,
    overtimeType: 'Weekday',
    reason: 'Payroll processing month-end',
    projectCode: null,
    status: 'Processed',
    requestedDate: THIS_WEEK[2],
    approvedDate: THIS_WEEK[2],
    approvedBy: 'CEO',
    rejectionReason: null,
    payRate: 1.25,
    estimatedPay: 500,
    actualPay: 500,
    country: 'UAE',
    isProcessedInPayroll: true,
  },
];

// ── OT Pay Calculation (Country-Specific) ─────────────────────────────────────

/**
 * Calculate overtime pay amount based on country-specific rules.
 * @legal UAE: Weekday OT = 25% premium; Friday/Holiday OT = 50% premium (Art. 19)
 *        KSA: Weekday OT = 50% premium; Rest day OT = 100% premium (Art. 101)
 *        India: Factory Act — OT = 2x normal rate (beyond 9h/day or 48h/week)
 */
export function calculateOvertimePay(
  baseMonthlySalary: number,
  hours: number,
  overtimeType: OvertimeType,
  country: Country
): { hourlyRate: number; multiplier: number; overtimePay: number; legalReference: string } {
  const hourlyRate = baseMonthlySalary / (26 * 8); // ~208 working hours/month

  let multiplier = 1.25;
  let legalReference = '';

  if (country === 'UAE') {
    if (overtimeType === 'Weekday') {
      multiplier = 1.25;
      legalReference = 'UAE Labour Law Art. 19(1) — 25% OT premium on basic+HRA';
    } else if (overtimeType === 'Weekend' || overtimeType === 'Public Holiday') {
      multiplier = 1.5;
      legalReference = 'UAE Labour Law Art. 19(2) — 50% OT premium for Friday/holiday';
    } else if (overtimeType === 'Night Premium') {
      multiplier = 1.5;
      legalReference = 'UAE Labour Law Art. 19(3) — night work premium';
    }
  } else if (country === 'KSA') {
    if (overtimeType === 'Weekday') {
      multiplier = 1.5;
      legalReference = 'KSA Labour Law Art. 107(2) — 50% OT premium on hourly wage';
    } else if (overtimeType === 'Weekend' || overtimeType === 'Public Holiday') {
      multiplier = 2.0;
      legalReference = 'KSA Labour Law Art. 107(3) — 100% for rest day work';
    } else {
      multiplier = 1.5;
      legalReference = 'KSA Labour Law Art. 107';
    }
  } else if (country === 'India') {
    multiplier = 2.0; // Factories Act 1948, Section 59
    legalReference = 'India Factories Act 1948, Section 59 — double rate for OT beyond 9h/day';
  } else {
    multiplier = 1.25;
    legalReference = 'Standard 25% OT premium';
  }

  return {
    hourlyRate: parseFloat(hourlyRate.toFixed(2)),
    multiplier,
    overtimePay: parseFloat((hourlyRate * hours * multiplier).toFixed(2)),
    legalReference,
  };
}

// ── Service ────────────────────────────────────────────────────────────────────

export class ShiftService {
  /**
   * Get all shift patterns.
   */
  static async getShiftPatterns(): Promise<ShiftPattern[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_SHIFT_PATTERNS.filter((s) => s.isActive);
  }

  /**
   * Create a new shift pattern.
   */
  static async createShiftPattern(data: CreateShiftData): Promise<ShiftPattern> {
    await new Promise((r) => setTimeout(r, 200));
    const hours = (() => {
      const [sh, sm] = data.startTime.split(':').map(Number);
      const [eh, em] = data.endTime.split(':').map(Number);
      const diff = (eh * 60 + em - sh * 60 - sm + 1440) % 1440;
      return parseFloat(((diff - data.breakMinutes) / 60).toFixed(2));
    })();

    const newShift: ShiftPattern = {
      id: `shift-${Date.now()}`,
      name: data.name,
      code: data.code,
      type: data.type,
      startTime: data.startTime,
      endTime: data.endTime,
      gracePeriodMinutes: data.gracePeriodMinutes,
      breakMinutes: data.breakMinutes,
      workingHours: hours,
      isOvernight: (() => {
        const sh = parseInt(data.startTime.split(':')[0]);
        const eh = parseInt(data.endTime.split(':')[0]);
        return sh > eh;
      })(),
      colorCode: 'bg-gray-100 text-gray-800 border-gray-300',
      applicableDays: data.applicableDays,
      country: data.country,
      isActive: true,
      minimumRestHours: data.minimumRestHours,
      notes: data.notes,
    };
    MOCK_SHIFT_PATTERNS.push(newShift);
    return newShift;
  }

  /**
   * Assign a shift to an employee for a date range.
   */
  static async assignShift(
    _employeeId: string,
    _shiftId: string,
    _startDate: string,
    _endDate: string
  ): Promise<{ success: boolean; conflicts: ShiftConflict[] }> {
    await new Promise((r) => setTimeout(r, 200));
    // In production: check conflicts and write to DB
    return { success: true, conflicts: [] };
  }

  /**
   * Get weekly shift roster for a department.
   */
  static async getShiftRoster(departmentId: string, weekStartDate: string): Promise<ShiftRoster> {
    await new Promise((r) => setTimeout(r, 200));
    const entries = buildRosterEntries();
    const weekEnd = new Date(weekStartDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return {
      departmentId,
      weekStartDate,
      weekEndDate: weekEnd.toISOString().slice(0, 10),
      entries,
      employees: MOCK_ROSTER_EMPLOYEES,
    };
  }

  /**
   * Submit a shift swap request.
   */
  static async requestShiftSwap(data: Partial<ShiftSwapRequest>): Promise<ShiftSwapRequest> {
    await new Promise((r) => setTimeout(r, 200));
    const newSwap: ShiftSwapRequest = {
      id: `swap-${Date.now()}`,
      requesterId: data.requesterId ?? '',
      requesterName: data.requesterName ?? '',
      requesterEmployeeCode: data.requesterEmployeeCode ?? '',
      targetEmployeeId: data.targetEmployeeId ?? '',
      targetEmployeeName: data.targetEmployeeName ?? '',
      requesterShiftDate: data.requesterShiftDate ?? '',
      requesterShiftId: data.requesterShiftId ?? '',
      requesterShiftName: data.requesterShiftName ?? '',
      targetShiftDate: data.targetShiftDate ?? '',
      targetShiftId: data.targetShiftId ?? '',
      targetShiftName: data.targetShiftName ?? '',
      reason: data.reason ?? '',
      status: 'Pending',
      managerId: data.managerId ?? '',
      managerName: data.managerName ?? '',
      requestedDate: new Date().toISOString().slice(0, 10),
      approvedDate: null,
      approvedBy: null,
      managerComments: '',
      expiresAt: data.requesterShiftDate ?? '',
    };
    MOCK_SHIFT_SWAP_REQUESTS.push(newSwap);
    return newSwap;
  }

  /**
   * Approve or reject a shift swap request.
   */
  static async approveShiftSwap(
    swapId: string,
    approved: boolean,
    comments: string,
    approvedBy: string
  ): Promise<ShiftSwapRequest> {
    await new Promise((r) => setTimeout(r, 200));
    const swap = MOCK_SHIFT_SWAP_REQUESTS.find((s) => s.id === swapId);
    if (!swap) throw new Error(`Swap request ${swapId} not found`);

    swap.status = approved ? 'Approved' : 'Rejected';
    swap.managerComments = comments;
    swap.approvedDate = new Date().toISOString().slice(0, 10);
    swap.approvedBy = approvedBy;
    return swap;
  }

  /**
   * Get all shift swap requests (optionally filter by status).
   */
  static async getSwapRequests(filters?: {
    status?: SwapStatus[];
    employeeId?: string;
    managerId?: string;
  }): Promise<ShiftSwapRequest[]> {
    await new Promise((r) => setTimeout(r, 200));
    let result = [...MOCK_SHIFT_SWAP_REQUESTS];

    if (filters?.status?.length) {
      result = result.filter((s) => filters.status!.includes(s.status));
    }
    if (filters?.employeeId) {
      result = result.filter(
        (s) => s.requesterId === filters.employeeId || s.targetEmployeeId === filters.employeeId
      );
    }
    if (filters?.managerId) {
      result = result.filter((s) => s.managerId === filters.managerId);
    }

    return result;
  }

  /**
   * Get overtime requests with optional filters.
   */
  static async getOvertimeRequests(filters?: {
    status?: OvertimeStatus[];
    employeeId?: string;
    managerId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<OvertimeRequest[]> {
    await new Promise((r) => setTimeout(r, 200));
    let result = [...MOCK_OVERTIME_REQUESTS];

    if (filters?.status?.length) {
      result = result.filter((o) => filters.status!.includes(o.status));
    }
    if (filters?.employeeId) {
      result = result.filter((o) => o.employeeId === filters.employeeId);
    }
    if (filters?.managerId) {
      result = result.filter((o) => o.managerId === filters.managerId);
    }
    if (filters?.startDate) {
      result = result.filter((o) => o.overtimeDate >= filters.startDate!);
    }
    if (filters?.endDate) {
      result = result.filter((o) => o.overtimeDate <= filters.endDate!);
    }

    return result.sort(
      (a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime()
    );
  }

  /**
   * Submit an overtime request.
   */
  static async submitOvertimeRequest(data: Partial<OvertimeRequest>): Promise<OvertimeRequest> {
    await new Promise((r) => setTimeout(r, 200));
    const otCalc = calculateOvertimePay(
      data.estimatedPay ?? 150000,
      data.hours ?? 0,
      data.overtimeType ?? 'Weekday',
      data.country ?? 'UAE'
    );

    const newOT: OvertimeRequest = {
      id: `ot-${Date.now()}`,
      employeeId: data.employeeId ?? '',
      employeeCode: data.employeeCode ?? '',
      employeeName: data.employeeName ?? '',
      department: data.department ?? '',
      designation: data.designation ?? '',
      managerId: data.managerId ?? '',
      managerName: data.managerName ?? '',
      overtimeDate: data.overtimeDate ?? '',
      startTime: data.startTime ?? '',
      endTime: data.endTime ?? '',
      hours: data.hours ?? 0,
      overtimeType: data.overtimeType ?? 'Weekday',
      reason: data.reason ?? '',
      projectCode: data.projectCode ?? null,
      status: 'Pending',
      requestedDate: new Date().toISOString().slice(0, 10),
      approvedDate: null,
      approvedBy: null,
      rejectionReason: null,
      payRate: otCalc.multiplier,
      estimatedPay: otCalc.overtimePay,
      actualPay: null,
      country: data.country ?? 'UAE',
      isProcessedInPayroll: false,
    };
    MOCK_OVERTIME_REQUESTS.push(newOT);
    return newOT;
  }

  /**
   * Calculate overtime pay for given parameters.
   */
  static calculateOvertimePay = calculateOvertimePay;

  /**
   * Get overtime summary per employee for a month.
   */
  static async getOvertimeSummaries(month: string): Promise<OvertimeSummary[]> {
    await new Promise((r) => setTimeout(r, 200));
    const employees = MOCK_ROSTER_EMPLOYEES;
    return employees.map((emp) => {
      const empOT = MOCK_OVERTIME_REQUESTS.filter(
        (o) => o.employeeId === emp.employeeId && o.status !== 'Rejected'
      );
      return {
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        month,
        weekdayOTHours: empOT
          .filter((o) => o.overtimeType === 'Weekday')
          .reduce((s, o) => s + o.hours, 0),
        weekendOTHours: empOT
          .filter((o) => o.overtimeType === 'Weekend')
          .reduce((s, o) => s + o.hours, 0),
        holidayOTHours: empOT
          .filter((o) => o.overtimeType === 'Public Holiday')
          .reduce((s, o) => s + o.hours, 0),
        totalOTHours: empOT.reduce((s, o) => s + o.hours, 0),
        totalOTPay: empOT.reduce((s, o) => s + o.estimatedPay, 0),
        otBudgetAllocated: 5000,
        otBudgetUsed: empOT.reduce((s, o) => s + o.estimatedPay, 0),
        pendingRequests: empOT.filter((o) => o.status === 'Pending').length,
        department: emp.designation,
      };
    });
  }
}
