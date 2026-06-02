// @ts-nocheck — Dev/demo seed data, intentionally loose-typed.
// Shift Management Sample Data
import type {
  Shift,
  ShiftTemplate,
  ShiftPattern,
  ShiftSwapRequest,
  ShiftPreference,
  ShiftMetrics,
  ShiftSettings
} from './types';

export const sampleTemplates: ShiftTemplate[] = [
  {
    id: 'tmpl-001',
    templateCode: 'TMPL-MORNING',
    templateName: 'Morning Shift',
    shiftType: 'morning',
    startTime: '06:00',
    endTime: '14:00',
    duration: 8,
    breakSchedule: [
      {
        id: 'break-001',
        breakName: 'Mid-Morning Break',
        breakType: 'paid',
        startOffset: 120,
        duration: 15,
        isMandatory: true
      },
      {
        id: 'break-002',
        breakName: 'Lunch Break',
        breakType: 'unpaid',
        startOffset: 240,
        duration: 30,
        isMandatory: true
      }
    ],
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    requiredSkills: ['Technical Support'],
    overtimeEligible: true,
    color: '#FFE5B4',
    icon: '🌅',
    isActive: true,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  },
  {
    id: 'tmpl-002',
    templateCode: 'TMPL-AFTERNOON',
    templateName: 'Afternoon Shift',
    shiftType: 'afternoon',
    startTime: '14:00',
    endTime: '22:00',
    duration: 8,
    breakSchedule: [
      {
        id: 'break-003',
        breakName: 'Mid-Afternoon Break',
        breakType: 'paid',
        startOffset: 120,
        duration: 15,
        isMandatory: true
      },
      {
        id: 'break-004',
        breakName: 'Dinner Break',
        breakType: 'unpaid',
        startOffset: 240,
        duration: 30,
        isMandatory: true
      }
    ],
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    requiredSkills: ['Technical Support'],
    overtimeEligible: true,
    premiumRate: 0.10,
    color: '#FFD700',
    icon: '🌤️',
    isActive: true,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  },
  {
    id: 'tmpl-003',
    templateCode: 'TMPL-NIGHT',
    templateName: 'Night Shift',
    shiftType: 'night',
    startTime: '22:00',
    endTime: '06:00',
    duration: 8,
    breakSchedule: [
      {
        id: 'break-005',
        breakName: 'Midnight Break',
        breakType: 'paid',
        startOffset: 180,
        duration: 15,
        isMandatory: true
      },
      {
        id: 'break-006',
        breakName: 'Night Meal Break',
        breakType: 'unpaid',
        startOffset: 300,
        duration: 30,
        isMandatory: true
      }
    ],
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    requiredSkills: ['Technical Support'],
    overtimeEligible: true,
    premiumRate: 0.15,
    color: '#4169E1',
    icon: '🌙',
    isActive: true,
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  }
];

export const sampleShifts: Shift[] = [
  {
    id: 'shift-001',
    shiftCode: 'SHIFT-2024-12-16-M1',
    shiftName: 'Morning Shift',
    shiftType: 'morning',
    date: '2024-12-16',
    startTime: '06:00',
    endTime: '14:00',
    duration: 8,
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    locationId: 'loc-001',
    locationName: 'Corporate HQ',
    positionId: 'pos-003',
    positionName: 'Technical Support Engineer',
    requiredSkills: ['Technical Support'],
    minStaffing: 3,
    maxStaffing: 5,
    currentStaffing: 3,
    assignments: [
      {
        id: 'assign-001',
        shiftId: 'shift-001',
        employeeId: 'emp-001',
        employeeName: 'Jane Doe',
        employeeEmail: 'jane.doe@company.com',
        assignmentType: 'regular',
        status: 'scheduled',
        breaks: [],
        assignedBy: 'mgr-001',
        assignedDate: '2024-12-10T10:00:00Z',
        lastModified: '2024-12-10T10:00:00Z'
      },
      {
        id: 'assign-002',
        shiftId: 'shift-001',
        employeeId: 'emp-002',
        employeeName: 'John Smith',
        employeeEmail: 'john.smith@company.com',
        assignmentType: 'regular',
        status: 'scheduled',
        breaks: [],
        assignedBy: 'mgr-001',
        assignedDate: '2024-12-10T10:00:00Z',
        lastModified: '2024-12-10T10:00:00Z'
      },
      {
        id: 'assign-003',
        shiftId: 'shift-001',
        employeeId: 'emp-003',
        employeeName: 'Alice Johnson',
        employeeEmail: 'alice.johnson@company.com',
        assignmentType: 'regular',
        status: 'scheduled',
        breaks: [],
        assignedBy: 'mgr-001',
        assignedDate: '2024-12-10T10:00:00Z',
        lastModified: '2024-12-10T10:00:00Z'
      }
    ],
    breakSchedule: sampleTemplates[0].breakSchedule,
    overtimeEligible: true,
    cost: {
      regularRate: 25,
      overtimeRate: 37.5,
      totalRegularHours: 24,
      totalOvertimeHours: 0,
      totalPremiumHours: 0,
      totalCost: 600,
      currency: 'USD'
    },
    status: 'scheduled',
    isRecurring: false,
    createdBy: 'mgr-001',
    createdDate: '2024-12-10T10:00:00Z',
    lastModified: '2024-12-10T10:00:00Z'
  },
  {
    id: 'shift-002',
    shiftCode: 'SHIFT-2024-12-16-A1',
    shiftName: 'Afternoon Shift',
    shiftType: 'afternoon',
    date: '2024-12-16',
    startTime: '14:00',
    endTime: '22:00',
    duration: 8,
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    locationId: 'loc-001',
    locationName: 'Corporate HQ',
    requiredSkills: ['Technical Support'],
    minStaffing: 2,
    maxStaffing: 4,
    currentStaffing: 2,
    assignments: [
      {
        id: 'assign-004',
        shiftId: 'shift-002',
        employeeId: 'emp-004',
        employeeName: 'Bob Wilson',
        employeeEmail: 'bob.wilson@company.com',
        assignmentType: 'regular',
        status: 'scheduled',
        breaks: [],
        assignedBy: 'mgr-001',
        assignedDate: '2024-12-10T10:00:00Z',
        lastModified: '2024-12-10T10:00:00Z'
      },
      {
        id: 'assign-005',
        shiftId: 'shift-002',
        employeeId: 'emp-005',
        employeeName: 'Carol Martinez',
        employeeEmail: 'carol.martinez@company.com',
        assignmentType: 'regular',
        status: 'scheduled',
        breaks: [],
        assignedBy: 'mgr-001',
        assignedDate: '2024-12-10T10:00:00Z',
        lastModified: '2024-12-10T10:00:00Z'
      }
    ],
    breakSchedule: sampleTemplates[1].breakSchedule,
    overtimeEligible: true,
    premiumRate: 0.10,
    cost: {
      regularRate: 25,
      overtimeRate: 37.5,
      premiumRate: 2.5,
      totalRegularHours: 16,
      totalOvertimeHours: 0,
      totalPremiumHours: 16,
      totalCost: 440,
      currency: 'USD'
    },
    status: 'scheduled',
    isRecurring: false,
    createdBy: 'mgr-001',
    createdDate: '2024-12-10T10:00:00Z',
    lastModified: '2024-12-10T10:00:00Z'
  },
  {
    id: 'shift-003',
    shiftCode: 'SHIFT-2024-12-16-N1',
    shiftName: 'Night Shift',
    shiftType: 'night',
    date: '2024-12-16',
    startTime: '22:00',
    endTime: '06:00',
    duration: 8,
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    locationId: 'loc-001',
    locationName: 'Corporate HQ',
    requiredSkills: ['Technical Support'],
    minStaffing: 2,
    maxStaffing: 3,
    currentStaffing: 1,
    assignments: [
      {
        id: 'assign-006',
        shiftId: 'shift-003',
        employeeId: 'emp-006',
        employeeName: 'David Lee',
        employeeEmail: 'david.lee@company.com',
        assignmentType: 'regular',
        status: 'scheduled',
        breaks: [],
        assignedBy: 'mgr-001',
        assignedDate: '2024-12-10T10:00:00Z',
        lastModified: '2024-12-10T10:00:00Z'
      }
    ],
    breakSchedule: sampleTemplates[2].breakSchedule,
    overtimeEligible: true,
    premiumRate: 0.15,
    cost: {
      regularRate: 25,
      overtimeRate: 37.5,
      premiumRate: 3.75,
      totalRegularHours: 8,
      totalOvertimeHours: 0,
      totalPremiumHours: 8,
      totalCost: 230,
      currency: 'USD'
    },
    status: 'scheduled',
    notes: 'Need one more staff member',
    isRecurring: false,
    createdBy: 'mgr-001',
    createdDate: '2024-12-10T10:00:00Z',
    lastModified: '2024-12-10T10:00:00Z'
  }
];

export const samplePatterns: ShiftPattern[] = [
  {
    id: 'pattern-001',
    patternCode: 'PATTERN-247',
    patternName: '24/7 Rotating Shifts',
    patternType: 'rotating',
    description: 'Three 8-hour shifts covering 24 hours, 7 days a week',
    departmentId: 'dept-002',
    departmentName: 'Engineering',
    cycle: {
      cycleName: 'Weekly Rotation',
      cycleDuration: 7,
      cycleUnit: 'days',
      shifts: [
        { dayNumber: 1, shiftTemplateId: 'tmpl-001', shiftTemplateName: 'Morning Shift', isWorkDay: true, isRestDay: false },
        { dayNumber: 2, shiftTemplateId: 'tmpl-001', shiftTemplateName: 'Morning Shift', isWorkDay: true, isRestDay: false },
        { dayNumber: 3, shiftTemplateId: 'tmpl-001', shiftTemplateName: 'Morning Shift', isWorkDay: true, isRestDay: false },
        { dayNumber: 4, shiftTemplateId: 'tmpl-001', shiftTemplateName: 'Morning Shift', isWorkDay: true, isRestDay: false },
        { dayNumber: 5, shiftTemplateId: 'tmpl-001', shiftTemplateName: 'Morning Shift', isWorkDay: true, isRestDay: false },
        { dayNumber: 6, shiftTemplateId: 'tmpl-001', shiftTemplateName: 'Morning Shift', isWorkDay: false, isRestDay: true },
        { dayNumber: 7, shiftTemplateId: 'tmpl-001', shiftTemplateName: 'Morning Shift', isWorkDay: false, isRestDay: true }
      ],
      restDays: [6, 7]
    },
    rotationSchedule: {
      rotationType: 'weekly',
      rotationSequence: ['tmpl-001', 'tmpl-002', 'tmpl-003'],
      currentRotation: 0,
      nextRotationDate: '2024-12-23'
    },
    applicablePositions: ['pos-003'],
    isActive: true,
    effectiveDate: '2024-01-01',
    createdBy: 'admin',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  }
];

export const sampleSwapRequests: ShiftSwapRequest[] = [
  {
    id: 'swap-001',
    requestCode: 'SWAP-2024-001',
    requestorId: 'emp-001',
    requestorName: 'Jane Doe',
    requestorShiftId: 'shift-001',
    requestorShift: {
      shiftId: 'shift-001',
      shiftName: 'Morning Shift',
      date: '2024-12-16',
      startTime: '06:00',
      endTime: '14:00',
      departmentName: 'Engineering',
      locationName: 'Corporate HQ'
    },
    requesteeId: 'emp-004',
    requesteeName: 'Bob Wilson',
    requesteeShiftId: 'shift-002',
    requesteeShift: {
      shiftId: 'shift-002',
      shiftName: 'Afternoon Shift',
      date: '2024-12-16',
      startTime: '14:00',
      endTime: '22:00',
      departmentName: 'Engineering',
      locationName: 'Corporate HQ'
    },
    reason: 'Personal appointment in the afternoon',
    status: 'pending',
    requestedDate: '2024-12-13',
    approvalRequired: true,
    expiryDate: '2024-12-15',
    createdDate: '2024-12-13T09:00:00Z',
    lastModified: '2024-12-13T09:00:00Z'
  }
];

export const samplePreferences: ShiftPreference[] = [
  {
    id: 'pref-001',
    employeeId: 'emp-001',
    employeeName: 'Jane Doe',
    preferredShiftTypes: ['morning', 'afternoon'],
    preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    unavailableDays: ['saturday', 'sunday'],
    preferredStartTime: '06:00',
    preferredEndTime: '15:00',
    maxHoursPerWeek: 40,
    maxConsecutiveDays: 5,
    minRestHoursBetweenShifts: 12,
    weekendAvailability: 'never',
    overtimeWilling: false,
    nightShiftWilling: false,
    onCallWilling: true,
    notes: 'Prefers not to work weekends due to family commitments',
    effectiveDate: '2024-01-01',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  },
  {
    id: 'pref-002',
    employeeId: 'emp-006',
    employeeName: 'David Lee',
    preferredShiftTypes: ['night'],
    preferredDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    unavailableDays: [],
    maxHoursPerWeek: 48,
    maxConsecutiveDays: 6,
    minRestHoursBetweenShifts: 8,
    weekendAvailability: 'always',
    overtimeWilling: true,
    nightShiftWilling: true,
    onCallWilling: true,
    notes: 'Prefers night shifts, willing to work weekends for premium pay',
    effectiveDate: '2024-01-01',
    createdDate: '2024-01-01',
    lastModified: '2024-01-01'
  }
];

export const sampleMetrics: ShiftMetrics = {
  totalShifts: 285,
  totalAssignments: 620,
  averageCoverage: 92.5,
  uncoveredShifts: 12,
  totalOvertimeHours: 85,
  totalOvertimeCost: 3187.50,
  swapRequests: 23,
  approvedSwaps: 18,
  rejectedSwaps: 3,
  averageSwapApprovalTime: 1.5,
  lateCheckIns: 15,
  noShows: 3,
  earlyDepartures: 8,
  onTimePercentage: 94.2,
  utilizationRate: 88.5,
  laborCost: 125000,
  costPerHour: 28.50,
  shiftsByType: [
    { type: 'morning', count: 95, hours: 760 },
    { type: 'afternoon', count: 95, hours: 760 },
    { type: 'night', count: 95, hours: 760 }
  ],
  shiftsByDepartment: [
    { departmentId: 'dept-002', departmentName: 'Engineering', shifts: 180, hours: 1440 },
    { departmentId: 'dept-005', departmentName: 'Sales & Marketing', shifts: 60, hours: 480 },
    { departmentId: 'dept-003', departmentName: 'Human Resources', shifts: 45, hours: 360 }
  ],
  coverageByDay: [
    { day: 'monday', coverage: 95 },
    { day: 'tuesday', coverage: 94 },
    { day: 'wednesday', coverage: 96 },
    { day: 'thursday', coverage: 93 },
    { day: 'friday', coverage: 92 },
    { day: 'saturday', coverage: 88 },
    { day: 'sunday', coverage: 87 }
  ],
  topPerformers: [
    { employeeId: 'emp-001', employeeName: 'Jane Doe', shiftsCompleted: 22, onTimeRate: 100 },
    { employeeId: 'emp-006', employeeName: 'David Lee', shiftsCompleted: 24, onTimeRate: 98.5 }
  ],
  overtimeByEmployee: [
    { employeeId: 'emp-002', employeeName: 'John Smith', hours: 12, amount: 450 },
    { employeeId: 'emp-004', employeeName: 'Bob Wilson', hours: 8, amount: 300 }
  ],
  conflictsByType: [
    { type: 'overlap', count: 5 },
    { type: 'insufficient_rest', count: 8 },
    { type: 'overtime_limit', count: 3 }
  ]
};

export const sampleSettings: ShiftSettings = {
  enableShiftManagement: true,
  enableShiftSwaps: true,
  enableShiftBidding: false,
  enableOvertimeTracking: true,
  requireSwapApproval: true,
  swapApprovalLevels: 1,
  autoPublishSchedule: false,
  schedulePublishDays: 14,
  allowSelfAssignment: false,
  minRestHoursBetweenShifts: 8,
  maxConsecutiveShifts: 6,
  maxHoursPerWeek: 48,
  maxHoursPerDay: 12,
  overtimeThresholdDaily: 8,
  overtimeThresholdWeekly: 40,
  overtimeRateMultiplier: 1.5,
  nightShiftPremium: 0.15,
  weekendPremium: 0.10,
  holidayPremium: 0.20,
  enableBreakTracking: true,
  mandatoryBreakDuration: 30,
  breakPaidThreshold: 6,
  enableGPSCheckIn: false,
  gpsRadiusMeters: 100,
  enableNotifications: true,
  notifyShiftChanges: true,
  notifySwapRequests: true,
  reminderHoursBefore: 24,
  fiscalWeekStart: 'monday',
  defaultCurrency: 'USD'
};

export const shiftData = {
  shifts: sampleShifts,
  templates: sampleTemplates,
  patterns: samplePatterns,
  swapRequests: sampleSwapRequests,
  preferences: samplePreferences,
  metrics: sampleMetrics,
  settings: sampleSettings
};
