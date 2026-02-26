/**
 * @module overtimeService
 * @description Overtime management — jurisdiction-specific OT policies, calculation engine,
 *   pre-approval workflows, OT forecasting, budget tracking, and detailed reporting.
 * @project AURA HCM Platform
 * @section 12.2 — Overtime Management
 *
 * Legal References:
 *  FLSA (US): 29 U.S.C. § 207 — 1.5x after 40 hours/week; no daily OT (federal)
 *  California (CA): Cal. Lab. Code § 510 — 1.5x after 8h/day or 40h/week; 2x after 12h/day
 *  EU Working Time Directive: 2003/88/EC — max 48h/week average; OT rates per member state
 *  UAE Labour Law: Federal Decree-Law No. 33/2021, Art. 19 — 25% premium weekdays, 50% Fridays/holidays
 *  KSA Labour Law: Art. 107 — 50% premium for OT hours
 *  India: Factories Act 1948, § 59 — 2x rate for OT hours
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type OTJurisdiction =
  | 'FLSA_FEDERAL'
  | 'CA'
  | 'NY'
  | 'TX'
  | 'EU_GENERAL'
  | 'UK'
  | 'UAE'
  | 'KSA'
  | 'INDIA'
  | 'AUSTRALIA';
export type OTThresholdType = 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'FLUCTUATING';
export type OTApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DENIED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PROCESSED';
export type OTPayType = 'STRAIGHT_TIME' | 'TIME_AND_HALF' | 'DOUBLE_TIME' | 'DOUBLE_TIME_AND_HALF';

export interface OvertimePolicy {
  jurisdiction: OTJurisdiction;
  jurisdictionLabel: string;
  thresholds: OTThreshold[];
  nightDifferential: number | null; // % above base
  weekendDifferential: number | null;
  holidayDifferential: number | null;
  dailyMaxHours: number | null;
  weeklyMaxHours: number;
  dailyRestRequired: number; // hours
  weeklyRestRequired: number; // hours
  compTimeAllowed: boolean; // compensatory time instead of OT pay
  compTimeRatio: number; // hours of comp time per OT hour
  preApprovalRequired: boolean;
  notes: string;
  legalReference: string;
}

export interface OTThreshold {
  thresholdType: OTThresholdType;
  hoursThreshold: number;
  payType: OTPayType;
  multiplier: number;
  label: string;
  description: string;
}

export interface OvertimeCalculation {
  employeeId: string;
  employeeName: string;
  period: string;
  jurisdiction: OTJurisdiction;
  classification: 'EXEMPT' | 'NON_EXEMPT';
  regularHoursWorked: number;
  overtimeHoursWorked: number;
  doubleTimeHoursWorked: number;
  regularRate: number; // per hour
  weeklyHoursTotal: number;
  dailyBreakdown: DailyHourBreakdown[];
  payBreakdown: OTPayBreakdown;
  totalGrossPay: number;
  isCompliant: boolean;
  complianceNotes: string[];
}

export interface DailyHourBreakdown {
  date: string;
  dayOfWeek: string;
  hoursWorked: number;
  regularHours: number;
  OT1Hours: number; // 1.5x hours
  OT2Hours: number; // 2x hours
  isHoliday: boolean;
  isWeekend: boolean;
  appliedRate: OTPayType;
}

export interface OTPayBreakdown {
  regularPay: number;
  OT1Pay: number; // time and a half
  OT2Pay: number; // double time
  nightDiffPay: number;
  weekendDiffPay: number;
  holidayPay: number;
  totalOTPay: number;
  totalGrossPay: number;
}

export interface OvertimeApprovalRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  managerId: string;
  managerName: string;
  requestDate: string;
  overtimeDate: string;
  requestedHours: number;
  startTime: string;
  endTime: string;
  reason: string;
  workDescription: string;
  projectCode: string | null;
  estimatedCost: number;
  status: OTApprovalStatus;
  approvedHours: number | null;
  approvedBy: string | null;
  approvedDate: string | null;
  denialReason: string | null;
  expiryDate: string;
  isUrgent: boolean;
  requiresSecondApproval: boolean;
  secondApproverId: string | null;
  secondApproverStatus: OTApprovalStatus | null;
  actualHoursWorked: number | null;
  notes: string;
}

export interface OvertimeForecast {
  departmentId: string;
  period: string;
  forecastGeneratedAt: string;
  currentWeekOTHours: number;
  projectedMonthOTHours: number;
  projectedMonthOTCost: number;
  budgetedMonthOTCost: number;
  forecastAccuracy: number; // % accuracy of prior forecasts
  driverAnalysis: OTDriver[];
  employeeForecasts: EmployeeOTProjection[];
  weeklyTrend: WeeklyOTTrend[];
  alertLevel: 'GREEN' | 'YELLOW' | 'RED';
  alerts: string[];
}

export interface OTDriver {
  driver: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedHoursImpact: number;
  estimatedCostImpact: number;
  mitigationOption: string;
}

export interface EmployeeOTProjection {
  employeeId: string;
  employeeName: string;
  currentHoursThisWeek: number;
  projectedHoursThisMonth: number;
  projectedOTHours: number;
  projectedOTCost: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  drivingFactor: string;
}

export interface WeeklyOTTrend {
  weekStart: string;
  actualOTHours: number;
  projectedOTHours: number;
  budgetedOTHours: number;
  variance: number;
}

export interface OvertimeBudget {
  departmentId: string;
  departmentName: string;
  fiscalYear: number;
  annualOTBudget: number;
  ytdOTSpend: number;
  ytdOTHours: number;
  remainingBudget: number;
  percentUsed: number;
  projectedYearEndSpend: number;
  projectedOverBudget: boolean;
  projectedOverBudgetAmount: number;
  monthlyActuals: MonthlyOTActual[];
}

export interface MonthlyOTActual {
  month: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
  hours: number;
}

export interface OvertimeReport {
  departmentId: string;
  period: string;
  totalOTHours: number;
  totalOTCost: number;
  avgOTHoursPerEmployee: number;
  employeeBreakdown: EmployeeOTRecord[];
  topOTReasons: OTReasonSummary[];
  complianceFlags: string[];
  budgetSummary: { budgeted: number; actual: number; variance: number };
}

export interface EmployeeOTRecord {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  classification: 'EXEMPT' | 'NON_EXEMPT';
  totalHoursWorked: number;
  overtimeHours: number;
  overtimeCost: number;
  preApprovedHours: number;
  unapprovedOTHours: number;
  weeklyMaxExceeded: boolean;
}

export interface OTReasonSummary {
  reason: string;
  occurrences: number;
  totalHours: number;
  totalCost: number;
  percentOfTotal: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const OT_POLICIES: Record<OTJurisdiction, OvertimePolicy> = {
  FLSA_FEDERAL: {
    jurisdiction: 'FLSA_FEDERAL',
    jurisdictionLabel: 'United States — Federal FLSA',
    thresholds: [
      {
        thresholdType: 'WEEKLY',
        hoursThreshold: 40,
        payType: 'TIME_AND_HALF',
        multiplier: 1.5,
        label: 'OT after 40h/week',
        description: 'Standard federal overtime at 1.5x after 40 hours per workweek',
      },
    ],
    nightDifferential: null,
    weekendDifferential: null,
    holidayDifferential: null,
    dailyMaxHours: null,
    weeklyMaxHours: 168, // No federal limit
    dailyRestRequired: 0, // No federal requirement
    weeklyRestRequired: 0,
    compTimeAllowed: false, // Only for government employees
    compTimeRatio: 1.5,
    preApprovalRequired: true,
    notes:
      'Federal FLSA — no daily OT; no mandatory breaks; comp time prohibited for private sector',
    legalReference: '29 U.S.C. § 207(a)(1)',
  },
  CA: {
    jurisdiction: 'CA',
    jurisdictionLabel: 'California State',
    thresholds: [
      {
        thresholdType: 'DAILY',
        hoursThreshold: 8,
        payType: 'TIME_AND_HALF',
        multiplier: 1.5,
        label: 'Daily OT (hours 8-12)',
        description: '1.5x for hours 8 through 12 in a day',
      },
      {
        thresholdType: 'DAILY',
        hoursThreshold: 12,
        payType: 'DOUBLE_TIME',
        multiplier: 2.0,
        label: 'Daily Double Time (over 12h)',
        description: '2x for hours beyond 12 in a single workday',
      },
      {
        thresholdType: 'WEEKLY',
        hoursThreshold: 40,
        payType: 'TIME_AND_HALF',
        multiplier: 1.5,
        label: 'Weekly OT',
        description: '1.5x for hours beyond 40 per workweek',
      },
      {
        thresholdType: 'WEEKLY',
        hoursThreshold: 0,
        payType: 'DOUBLE_TIME',
        multiplier: 2.0,
        label: '7th Consecutive Day OT',
        description: '1.5x for first 8 hours; 2x for over 8 hours on 7th consecutive day',
      },
    ],
    nightDifferential: null,
    weekendDifferential: null,
    holidayDifferential: null,
    dailyMaxHours: null,
    weeklyMaxHours: 168,
    dailyRestRequired: 0,
    weeklyRestRequired: 0,
    compTimeAllowed: false,
    compTimeRatio: 1.5,
    preApprovalRequired: true,
    notes:
      'California has both daily and weekly OT thresholds; most employee-favorable state OT rules',
    legalReference: 'Cal. Lab. Code § 510; IWC Wage Orders',
  },
  NY: {
    jurisdiction: 'NY',
    jurisdictionLabel: 'New York State',
    thresholds: [
      {
        thresholdType: 'WEEKLY',
        hoursThreshold: 40,
        payType: 'TIME_AND_HALF',
        multiplier: 1.5,
        label: 'OT after 40h/week',
        description: '1.5x after 40 hours per workweek (follows FLSA)',
      },
    ],
    nightDifferential: null,
    weekendDifferential: null,
    holidayDifferential: null,
    dailyMaxHours: null,
    weeklyMaxHours: 168,
    dailyRestRequired: 0,
    weeklyRestRequired: 0,
    compTimeAllowed: false,
    compTimeRatio: 1.5,
    preApprovalRequired: true,
    notes: 'NY follows FLSA for OT; NYC Fair Workweek adds scheduling rules',
    legalReference: 'NYLL § 650 et seq.; 12 NYCRR 142',
  },
  TX: {
    jurisdiction: 'TX',
    jurisdictionLabel: 'Texas',
    thresholds: [
      {
        thresholdType: 'WEEKLY',
        hoursThreshold: 40,
        payType: 'TIME_AND_HALF',
        multiplier: 1.5,
        label: 'OT after 40h/week',
        description: 'Texas follows federal FLSA — 1.5x after 40h/week',
      },
    ],
    nightDifferential: null,
    weekendDifferential: null,
    holidayDifferential: null,
    dailyMaxHours: null,
    weeklyMaxHours: 168,
    dailyRestRequired: 0,
    weeklyRestRequired: 0,
    compTimeAllowed: false,
    compTimeRatio: 1.5,
    preApprovalRequired: true,
    notes: 'Texas has no state-specific OT laws — follows FLSA entirely',
    legalReference: 'Texas Payday Law; 29 U.S.C. § 207',
  },
  EU_GENERAL: {
    jurisdiction: 'EU_GENERAL',
    jurisdictionLabel: 'European Union (General)',
    thresholds: [
      {
        thresholdType: 'WEEKLY',
        hoursThreshold: 48,
        payType: 'TIME_AND_HALF',
        multiplier: 1.5,
        label: 'EU Maximum 48h/week',
        description: 'Maximum 48h average per week; OT rate varies by member state',
      },
    ],
    nightDifferential: 25,
    weekendDifferential: null,
    holidayDifferential: null,
    dailyMaxHours: null,
    weeklyMaxHours: 48,
    dailyRestRequired: 11,
    weeklyRestRequired: 24,
    compTimeAllowed: true,
    compTimeRatio: 1.0,
    preApprovalRequired: true,
    notes:
      'EU WTD sets maximum working hours and rest requirements; OT pay varies by country and CBA',
    legalReference: 'Directive 2003/88/EC (Working Time Directive)',
  },
  UK: {
    jurisdiction: 'UK',
    jurisdictionLabel: 'United Kingdom',
    thresholds: [
      {
        thresholdType: 'WEEKLY',
        hoursThreshold: 48,
        payType: 'STRAIGHT_TIME',
        multiplier: 1.0,
        label: 'Max 48h/week (opt-out available)',
        description: '48h maximum; employee may voluntarily opt out; OT rate per contract',
      },
    ],
    nightDifferential: null,
    weekendDifferential: null,
    holidayDifferential: null,
    dailyMaxHours: null,
    weeklyMaxHours: 48,
    dailyRestRequired: 11,
    weeklyRestRequired: 24,
    compTimeAllowed: true,
    compTimeRatio: 1.0,
    preApprovalRequired: false,
    notes: 'UK Working Time Regulations 1998 — employees can opt out of 48h maximum in writing',
    legalReference: 'Working Time Regulations 1998 (SI 1998/1833); ERA 1996',
  },
  UAE: {
    jurisdiction: 'UAE',
    jurisdictionLabel: 'United Arab Emirates',
    thresholds: [
      {
        thresholdType: 'DAILY',
        hoursThreshold: 8,
        payType: 'TIME_AND_HALF',
        multiplier: 1.25,
        label: 'UAE OT Weekday (25% premium)',
        description: '25% premium on top of basic wage for weekday overtime',
      },
      {
        thresholdType: 'DAILY',
        hoursThreshold: 8,
        payType: 'TIME_AND_HALF',
        multiplier: 1.5,
        label: 'UAE OT Friday/Holiday (50% premium)',
        description: '50% premium on top of basic wage for Friday or public holiday work',
      },
    ],
    nightDifferential: null,
    weekendDifferential: 50,
    holidayDifferential: 50,
    dailyMaxHours: 2, // Max 2 OT hours per day
    weeklyMaxHours: 48, // 8h/day × 6 days = 48h
    dailyRestRequired: 11,
    weeklyRestRequired: 24, // Friday or equivalent weekly rest
    compTimeAllowed: true,
    compTimeRatio: 1.25,
    preApprovalRequired: true,
    notes: 'UAE max 2h OT per day; Ramadan working hours reduced by 2h/day; max 10h including OT',
    legalReference: 'Federal Decree-Law No. 33/2021, Articles 17-20; Cabinet Decision No. 1/2022',
  },
  KSA: {
    jurisdiction: 'KSA',
    jurisdictionLabel: 'Kingdom of Saudi Arabia',
    thresholds: [
      {
        thresholdType: 'DAILY',
        hoursThreshold: 8,
        payType: 'TIME_AND_HALF',
        multiplier: 1.5,
        label: 'KSA OT (50% premium)',
        description: '50% premium on hourly wage for overtime hours',
      },
      {
        thresholdType: 'WEEKLY',
        hoursThreshold: 40,
        payType: 'DOUBLE_TIME',
        multiplier: 2.0,
        label: 'KSA Rest Day Work (100% premium)',
        description: '100% premium when working on rest day',
      },
    ],
    nightDifferential: null,
    weekendDifferential: 100,
    holidayDifferential: 100,
    dailyMaxHours: null,
    weeklyMaxHours: 48,
    dailyRestRequired: 11,
    weeklyRestRequired: 24,
    compTimeAllowed: false,
    compTimeRatio: 1.0,
    preApprovalRequired: true,
    notes:
      'KSA Labour Law — Ramadan working hours reduced to 6h/day; weekly rest on Fridays mandatory',
    legalReference: 'Saudi Labour Law Royal Decree M/51, Articles 107-108',
  },
  INDIA: {
    jurisdiction: 'INDIA',
    jurisdictionLabel: 'India',
    thresholds: [
      {
        thresholdType: 'DAILY',
        hoursThreshold: 9,
        payType: 'DOUBLE_TIME',
        multiplier: 2.0,
        label: 'India OT (2x rate)',
        description: 'Double rate for overtime hours under Factories Act',
      },
      {
        thresholdType: 'WEEKLY',
        hoursThreshold: 48,
        payType: 'DOUBLE_TIME',
        multiplier: 2.0,
        label: 'Weekly OT threshold',
        description: '2x for hours beyond 48 per week under Factories Act',
      },
    ],
    nightDifferential: null,
    weekendDifferential: null,
    holidayDifferential: null,
    dailyMaxHours: 2, // Max 2 OT hours per day under Factories Act
    weeklyMaxHours: 60, // Max 48 regular + 12 OT
    dailyRestRequired: 12, // 12h between shifts in factories
    weeklyRestRequired: 24,
    compTimeAllowed: false,
    compTimeRatio: 1.0,
    preApprovalRequired: true,
    notes: 'India — OT rules vary by Act (Factories Act, Shops & Establishments varies by state)',
    legalReference: 'Factories Act 1948 §§ 51, 59; various State Shops & Establishments Acts',
  },
  AUSTRALIA: {
    jurisdiction: 'AUSTRALIA',
    jurisdictionLabel: 'Australia',
    thresholds: [
      {
        thresholdType: 'WEEKLY',
        hoursThreshold: 38,
        payType: 'TIME_AND_HALF',
        multiplier: 1.5,
        label: 'Australia OT (1.5x first 3h)',
        description: '1.5x for first 3 hours overtime per day',
      },
      {
        thresholdType: 'DAILY',
        hoursThreshold: 11,
        payType: 'DOUBLE_TIME',
        multiplier: 2.0,
        label: 'Australia OT (2x thereafter)',
        description: '2x for overtime beyond 3 hours per day',
      },
    ],
    nightDifferential: 15,
    weekendDifferential: 50,
    holidayDifferential: 100,
    dailyMaxHours: null,
    weeklyMaxHours: 38,
    dailyRestRequired: 10,
    weeklyRestRequired: 24,
    compTimeAllowed: true,
    compTimeRatio: 1.5,
    preApprovalRequired: true,
    notes:
      'National Employment Standards (NES) — max 38h ordinary hours; OT rates set by Modern Awards/EAs',
    legalReference: 'Fair Work Act 2009 § 62; National Employment Standards',
  },
};

const MOCK_OT_REQUESTS: OvertimeApprovalRequest[] = [
  {
    id: 'otr-001',
    employeeId: 'emp-0612',
    employeeName: 'Maria Santos',
    employeeCode: 'EMP0612',
    department: 'Engineering',
    managerId: 'emp-mgr-001',
    managerName: 'Dev Manager',
    requestDate: '2026-02-24',
    overtimeDate: '2026-02-26',
    requestedHours: 3,
    startTime: '17:00',
    endTime: '20:00',
    reason: 'Critical release deadline — P0 bug fix required before market open',
    workDescription: 'Fixing authentication token expiry issue affecting production users',
    projectCode: 'PROJ-AUTH-2026',
    estimatedCost: 217.5,
    status: 'PENDING',
    approvedHours: null,
    approvedBy: null,
    approvedDate: null,
    denialReason: null,
    expiryDate: '2026-02-25',
    isUrgent: true,
    requiresSecondApproval: false,
    secondApproverId: null,
    secondApproverStatus: null,
    actualHoursWorked: null,
    notes: 'Urgent — release is scheduled for Thursday 6 AM',
  },
  {
    id: 'otr-002',
    employeeId: 'emp-0710',
    employeeName: 'Derek Johnson',
    employeeCode: 'EMP0710',
    department: 'Engineering',
    managerId: 'emp-mgr-001',
    managerName: 'Dev Manager',
    requestDate: '2026-02-20',
    overtimeDate: '2026-02-22',
    requestedHours: 2,
    startTime: '17:00',
    endTime: '19:00',
    reason: 'Sprint review preparation — demo environment setup',
    workDescription: 'Setting up staging environment for Q1 sprint review demo',
    projectCode: 'PROJ-SPRINT-Q1',
    estimatedCost: 80.77,
    status: 'APPROVED',
    approvedHours: 2,
    approvedBy: 'Dev Manager',
    approvedDate: '2026-02-21',
    denialReason: null,
    expiryDate: '2026-02-22',
    isUrgent: false,
    requiresSecondApproval: false,
    secondApproverId: null,
    secondApproverStatus: null,
    actualHoursWorked: 1.8,
    notes: 'Completed — actual hours slightly under estimate',
  },
  {
    id: 'otr-003',
    employeeId: 'emp-0201',
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP0201',
    department: 'Engineering',
    managerId: 'emp-mgr-001',
    managerName: 'Dev Manager',
    requestDate: '2026-02-18',
    overtimeDate: '2026-02-20',
    requestedHours: 4,
    startTime: '18:00',
    endTime: '22:00',
    reason: 'Architecture document completion — board review deadline',
    workDescription: 'Completing Q2 infrastructure architecture document for board review',
    projectCode: null,
    estimatedCost: 317.31,
    status: 'DENIED',
    approvedHours: null,
    approvedBy: 'Dev Manager',
    approvedDate: '2026-02-19',
    denialReason:
      'Architecture document deadline is non-urgent and can be completed during regular hours next week',
    expiryDate: '2026-02-20',
    isUrgent: false,
    requiresSecondApproval: false,
    secondApproverId: null,
    secondApproverStatus: null,
    actualHoursWorked: null,
    notes: '',
  },
];

// ── Service Functions ──────────────────────────────────────────────────────────

/**
 * Get overtime policy rules for a specific jurisdiction.
 */
export async function getOvertimePolicy(jurisdiction: OTJurisdiction): Promise<OvertimePolicy> {
  await new Promise((r) => setTimeout(r, 200));
  const policy = OT_POLICIES[jurisdiction];
  if (!policy) throw new Error(`No overtime policy defined for jurisdiction: ${jurisdiction}`);
  return policy;
}

/**
 * Calculate overtime with full pay breakdown for an employee in a period.
 */
export async function calculateOvertime(
  employeeId: string,
  period: string
): Promise<OvertimeCalculation> {
  await new Promise((r) => setTimeout(r, 400));

  const empData: Record<
    string,
    {
      name: string;
      salary: number;
      classification: 'EXEMPT' | 'NON_EXEMPT';
      jurisdiction: OTJurisdiction;
    }
  > = {
    'emp-0612': {
      name: 'Maria Santos',
      salary: 52000,
      classification: 'NON_EXEMPT',
      jurisdiction: 'CA',
    },
    'emp-0710': {
      name: 'Derek Johnson',
      salary: 41600,
      classification: 'NON_EXEMPT',
      jurisdiction: 'FLSA_FEDERAL',
    },
    'emp-0201': {
      name: 'Priya Sharma',
      salary: 165000,
      classification: 'EXEMPT',
      jurisdiction: 'FLSA_FEDERAL',
    },
  };

  const emp = empData[employeeId] ?? {
    name: 'Employee',
    salary: 65000,
    classification: 'NON_EXEMPT' as const,
    jurisdiction: 'FLSA_FEDERAL' as OTJurisdiction,
  };
  const hourlyRate = emp.salary / 2080;

  // Simulate a week's hours
  const dailyData = [
    { date: `${period}-02`, day: 'Monday', hours: 8.5, isHoliday: false, isWeekend: false },
    { date: `${period}-03`, day: 'Tuesday', hours: 9.5, isHoliday: false, isWeekend: false },
    { date: `${period}-04`, day: 'Wednesday', hours: 10.0, isHoliday: false, isWeekend: false },
    { date: `${period}-05`, day: 'Thursday', hours: 9.0, isHoliday: false, isWeekend: false },
    { date: `${period}-06`, day: 'Friday', hours: 8.5, isHoliday: false, isWeekend: false },
    { date: `${period}-07`, day: 'Saturday', hours: 3.0, isHoliday: false, isWeekend: true },
  ];

  const totalHours = dailyData.reduce((s, d) => s + d.hours, 0);
  const weeklyOTHours = emp.jurisdiction === 'CA' ? 0 : Math.max(0, totalHours - 40); // CA uses daily OT

  const dailyBreakdown: DailyHourBreakdown[] = dailyData.map((d) => {
    const regularHours = emp.jurisdiction === 'CA' ? Math.min(8, d.hours) : d.hours;
    const OT1Hours = emp.jurisdiction === 'CA' ? Math.min(4, Math.max(0, d.hours - 8)) : 0;
    const OT2Hours = emp.jurisdiction === 'CA' ? Math.max(0, d.hours - 12) : 0;

    return {
      date: d.date,
      dayOfWeek: d.day,
      hoursWorked: d.hours,
      regularHours,
      OT1Hours,
      OT2Hours,
      isHoliday: d.isHoliday,
      isWeekend: d.isWeekend,
      appliedRate: OT2Hours > 0 ? 'DOUBLE_TIME' : OT1Hours > 0 ? 'TIME_AND_HALF' : 'STRAIGHT_TIME',
    };
  });

  const regularHours = dailyBreakdown.reduce((s, d) => s + d.regularHours, 0);
  const OT1Hours = dailyBreakdown.reduce((s, d) => s + d.OT1Hours, 0) + weeklyOTHours;
  const OT2Hours = dailyBreakdown.reduce((s, d) => s + d.OT2Hours, 0);

  const regularPay = regularHours * hourlyRate;
  const OT1Pay = OT1Hours * hourlyRate * 1.5;
  const OT2Pay = OT2Hours * hourlyRate * 2.0;
  const weekendDiffPay = dailyBreakdown
    .filter((d) => d.isWeekend)
    .reduce((s, d) => s + d.hoursWorked * hourlyRate * 0.1, 0);

  return {
    employeeId,
    employeeName: emp.name,
    period,
    jurisdiction: emp.jurisdiction,
    classification: emp.classification,
    regularHoursWorked: parseFloat(regularHours.toFixed(2)),
    overtimeHoursWorked: parseFloat(OT1Hours.toFixed(2)),
    doubleTimeHoursWorked: parseFloat(OT2Hours.toFixed(2)),
    regularRate: parseFloat(hourlyRate.toFixed(4)),
    weeklyHoursTotal: totalHours,
    dailyBreakdown,
    payBreakdown: {
      regularPay: parseFloat(regularPay.toFixed(2)),
      OT1Pay: parseFloat(OT1Pay.toFixed(2)),
      OT2Pay: parseFloat(OT2Pay.toFixed(2)),
      nightDiffPay: 0,
      weekendDiffPay: parseFloat(weekendDiffPay.toFixed(2)),
      holidayPay: 0,
      totalOTPay: parseFloat((OT1Pay + OT2Pay + weekendDiffPay).toFixed(2)),
      totalGrossPay: parseFloat((regularPay + OT1Pay + OT2Pay + weekendDiffPay).toFixed(2)),
    },
    totalGrossPay: parseFloat((regularPay + OT1Pay + OT2Pay + weekendDiffPay).toFixed(2)),
    isCompliant: emp.classification !== 'EXEMPT' ? true : OT1Hours === 0,
    complianceNotes:
      emp.classification === 'EXEMPT' && OT1Hours > 0
        ? ['Exempt employees do not receive OT pay — verify classification']
        : ['OT calculated correctly per jurisdiction rules'],
  };
}

/**
 * Get pending overtime pre-approval requests for a manager.
 */
export async function getOvertimeApprovals(
  managerId: string,
  status?: OTApprovalStatus
): Promise<OvertimeApprovalRequest[]> {
  await new Promise((r) => setTimeout(r, 250));
  let results = MOCK_OT_REQUESTS.filter((r) => r.managerId === managerId || managerId === 'admin');
  if (status) results = results.filter((r) => r.status === status);
  return results.sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
  });
}

/**
 * Submit an overtime pre-approval request.
 */
export async function requestOvertimePreApproval(
  employeeId: string,
  overtimeDate: string,
  requestedHours: number,
  reason: string,
  details?: {
    startTime?: string;
    endTime?: string;
    workDescription?: string;
    projectCode?: string;
    isUrgent?: boolean;
  }
): Promise<OvertimeApprovalRequest> {
  await new Promise((r) => setTimeout(r, 300));

  const hourlyRate = 50000 / 2080; // Approximate — production would look up from payroll
  const newRequest: OvertimeApprovalRequest = {
    id: `otr-${Date.now()}`,
    employeeId,
    employeeName: 'Employee',
    employeeCode: 'EMP001',
    department: 'Engineering',
    managerId: 'emp-mgr-001',
    managerName: 'Department Manager',
    requestDate: new Date().toISOString().slice(0, 10),
    overtimeDate,
    requestedHours,
    startTime: details?.startTime ?? '17:00',
    endTime: details?.endTime ?? `${(17 + requestedHours).toString().padStart(2, '0')}:00`,
    reason,
    workDescription: details?.workDescription ?? '',
    projectCode: details?.projectCode ?? null,
    estimatedCost: parseFloat((requestedHours * hourlyRate * 1.5).toFixed(2)),
    status: 'PENDING',
    approvedHours: null,
    approvedBy: null,
    approvedDate: null,
    denialReason: null,
    expiryDate: overtimeDate,
    isUrgent: details?.isUrgent ?? false,
    requiresSecondApproval: requestedHours > 4, // Require second approval for > 4h OT
    secondApproverId: requestedHours > 4 ? 'emp-dir-001' : null,
    secondApproverStatus: null,
    actualHoursWorked: null,
    notes: '',
  };

  MOCK_OT_REQUESTS.push(newRequest);
  return newRequest;
}

/**
 * Approve or deny an overtime request.
 */
export async function approveOvertime(
  requestId: string,
  decision: { approved: boolean; approvedHours?: number; reason?: string }
): Promise<OvertimeApprovalRequest> {
  await new Promise((r) => setTimeout(r, 300));

  const request = MOCK_OT_REQUESTS.find((r) => r.id === requestId);
  if (!request) throw new Error(`OT request ${requestId} not found`);
  if (request.status !== 'PENDING') throw new Error('Request is not in PENDING status');

  if (decision.approved) {
    request.status = 'APPROVED';
    request.approvedHours = decision.approvedHours ?? request.requestedHours;
    request.approvedBy = 'Manager';
    request.approvedDate = new Date().toISOString().slice(0, 10);
  } else {
    request.status = 'DENIED';
    request.denialReason = decision.reason ?? 'Not approved';
    request.approvedBy = 'Manager';
    request.approvedDate = new Date().toISOString().slice(0, 10);
  }

  return request;
}

/**
 * Get projected overtime hours and costs for a department.
 */
export async function getOvertimeForecast(departmentId: string): Promise<OvertimeForecast> {
  await new Promise((r) => setTimeout(r, 400));

  const currentMonth = new Date().toISOString().slice(0, 7);

  return {
    departmentId,
    period: currentMonth,
    forecastGeneratedAt: new Date().toISOString(),
    currentWeekOTHours: 18.5,
    projectedMonthOTHours: 86,
    projectedMonthOTCost: 7224,
    budgetedMonthOTCost: 6000,
    forecastAccuracy: 87.4,
    driverAnalysis: [
      {
        driver: 'Q1 product release sprint',
        impact: 'HIGH',
        estimatedHoursImpact: 32,
        estimatedCostImpact: 2688,
        mitigationOption: 'Add temporary contractor for sprint duration',
      },
      {
        driver: 'FMLA coverage gap',
        impact: 'MEDIUM',
        estimatedHoursImpact: 28,
        estimatedCostImpact: 2352,
        mitigationOption: 'Cross-train 2 team members to cover absent employee',
      },
      {
        driver: 'Recurring incident response',
        impact: 'LOW',
        estimatedHoursImpact: 12,
        estimatedCostImpact: 1008,
        mitigationOption: 'Implement on-call rotation to distribute burden',
      },
      {
        driver: 'Customer demos/travel',
        impact: 'LOW',
        estimatedHoursImpact: 14,
        estimatedCostImpact: 1176,
        mitigationOption: 'Schedule demos within core hours where possible',
      },
    ],
    employeeForecasts: [
      {
        employeeId: 'emp-0612',
        employeeName: 'Maria Santos',
        currentHoursThisWeek: 38,
        projectedHoursThisMonth: 188,
        projectedOTHours: 28,
        projectedOTCost: 2015,
        riskLevel: 'HIGH',
        drivingFactor: 'Release deadline sprint',
      },
      {
        employeeId: 'emp-0710',
        employeeName: 'Derek Johnson',
        currentHoursThisWeek: 35,
        projectedHoursThisMonth: 172,
        projectedOTHours: 12,
        projectedOTCost: 538,
        riskLevel: 'MEDIUM',
        drivingFactor: 'FMLA coverage gap',
      },
      {
        employeeId: 'emp-0521',
        employeeName: 'Tom Chen',
        currentHoursThisWeek: 40,
        projectedHoursThisMonth: 168,
        projectedOTHours: 8,
        projectedOTCost: 576,
        riskLevel: 'LOW',
        drivingFactor: 'On-call incidents',
      },
    ],
    weeklyTrend: [
      {
        weekStart: '2026-02-03',
        actualOTHours: 12,
        projectedOTHours: 14,
        budgetedOTHours: 15,
        variance: -2,
      },
      {
        weekStart: '2026-02-10',
        actualOTHours: 18,
        projectedOTHours: 16,
        budgetedOTHours: 15,
        variance: 3,
      },
      {
        weekStart: '2026-02-17',
        actualOTHours: 22,
        projectedOTHours: 20,
        budgetedOTHours: 15,
        variance: 7,
      },
      {
        weekStart: '2026-02-24',
        actualOTHours: 18.5,
        projectedOTHours: 22,
        budgetedOTHours: 15,
        variance: 3.5,
      },
    ],
    alertLevel: 'YELLOW',
    alerts: [
      'Projected OT spend $1,224 over monthly budget — requires management review',
      'Maria Santos projected at 28 OT hours — approaching compliance threshold',
      'Consider temporary staffing or project deadline extension to reduce OT burden',
    ],
  };
}

/**
 * Get overtime budget vs actual spend for a department.
 */
export async function getOvertimeBudget(departmentId: string): Promise<OvertimeBudget> {
  await new Promise((r) => setTimeout(r, 300));

  const monthlyActuals: MonthlyOTActual[] = [
    {
      month: '2026-01',
      budgeted: 6000,
      actual: 5240,
      variance: -760,
      variancePercent: -12.7,
      hours: 62,
    },
    {
      month: '2026-02',
      budgeted: 6000,
      actual: 6820,
      variance: 820,
      variancePercent: 13.7,
      hours: 81,
    },
  ];

  const ytdSpend = monthlyActuals.reduce((s, m) => s + m.actual, 0);
  const annualBudget = 72000;

  return {
    departmentId,
    departmentName: 'Engineering',
    fiscalYear: new Date().getFullYear(),
    annualOTBudget: annualBudget,
    ytdOTSpend: ytdSpend,
    ytdOTHours: 143,
    remainingBudget: annualBudget - ytdSpend,
    percentUsed: parseFloat(((ytdSpend / annualBudget) * 100).toFixed(1)),
    projectedYearEndSpend: Math.round(ytdSpend * 6), // Annualize from 2 months
    projectedOverBudget: Math.round(ytdSpend * 6) > annualBudget,
    projectedOverBudgetAmount: Math.max(0, Math.round(ytdSpend * 6) - annualBudget),
    monthlyActuals,
  };
}

/**
 * Get detailed overtime report for a department and period.
 */
export async function getOvertimeReport(
  departmentId: string,
  period: string
): Promise<OvertimeReport> {
  await new Promise((r) => setTimeout(r, 400));

  const employees: EmployeeOTRecord[] = [
    {
      employeeId: 'emp-0612',
      employeeName: 'Maria Santos',
      employeeCode: 'EMP0612',
      department: 'Engineering',
      classification: 'NON_EXEMPT',
      totalHoursWorked: 188,
      overtimeHours: 28,
      overtimeCost: 2015,
      preApprovedHours: 22,
      unapprovedOTHours: 6,
      weeklyMaxExceeded: false,
    },
    {
      employeeId: 'emp-0710',
      employeeName: 'Derek Johnson',
      employeeCode: 'EMP0710',
      department: 'Engineering',
      classification: 'NON_EXEMPT',
      totalHoursWorked: 172,
      overtimeHours: 12,
      overtimeCost: 538,
      preApprovedHours: 12,
      unapprovedOTHours: 0,
      weeklyMaxExceeded: false,
    },
    {
      employeeId: 'emp-0521',
      employeeName: 'Tom Chen',
      employeeCode: 'EMP0521',
      department: 'Engineering',
      classification: 'NON_EXEMPT',
      totalHoursWorked: 164,
      overtimeHours: 4,
      overtimeCost: 288,
      preApprovedHours: 2,
      unapprovedOTHours: 2,
      weeklyMaxExceeded: false,
    },
    {
      employeeId: 'emp-0445',
      employeeName: 'Sara Mitchell',
      employeeCode: 'EMP0445',
      department: 'Engineering',
      classification: 'NON_EXEMPT',
      totalHoursWorked: 160,
      overtimeHours: 0,
      overtimeCost: 0,
      preApprovedHours: 0,
      unapprovedOTHours: 0,
      weeklyMaxExceeded: false,
    },
  ];

  const totalOT = employees.reduce((s, e) => s + e.overtimeHours, 0);
  const totalCost = employees.reduce((s, e) => s + e.overtimeCost, 0);

  return {
    departmentId,
    period,
    totalOTHours: totalOT,
    totalOTCost: totalCost,
    avgOTHoursPerEmployee: parseFloat((totalOT / employees.length).toFixed(1)),
    employeeBreakdown: employees,
    topOTReasons: [
      {
        reason: 'Product release / sprint completion',
        occurrences: 8,
        totalHours: 22,
        totalCost: 1584,
        percentOfTotal: 50.0,
      },
      {
        reason: 'FMLA/PTO coverage',
        occurrences: 4,
        totalHours: 10,
        totalCost: 720,
        percentOfTotal: 22.7,
      },
      {
        reason: 'Customer-facing deliverable',
        occurrences: 3,
        totalHours: 8,
        totalCost: 576,
        percentOfTotal: 18.2,
      },
      {
        reason: 'System incident response',
        occurrences: 2,
        totalHours: 4,
        totalCost: 288,
        percentOfTotal: 9.1,
      },
    ],
    complianceFlags: [
      'Maria Santos: 6 unapproved OT hours — retroactive approval required within 5 days',
      'Tom Chen: 2 unapproved OT hours — manager review pending',
    ],
    budgetSummary: {
      budgeted: 6000,
      actual: totalCost,
      variance: totalCost - 6000,
    },
  };
}

// ── Named export ───────────────────────────────────────────────────────────────

export const overtimeService = {
  getOvertimePolicy,
  calculateOvertime,
  getOvertimeApprovals,
  requestOvertimePreApproval,
  approveOvertime,
  getOvertimeForecast,
  getOvertimeBudget,
  getOvertimeReport,
};
