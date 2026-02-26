/**
 * @module laborComplianceService
 * @description Labor law compliance engine — FLSA classification, predictive scheduling laws,
 *   EU Working Time Directive, meal break rules, clopening checks, child labor, and OT cost forecasting.
 * @project AURA HCM Platform
 * @section 22.2 — Labor Compliance Engine
 *
 * Legal References:
 *  FLSA: 29 U.S.C. §§ 201-219 — Fair Labor Standards Act (1938); OT threshold 40h/wk for non-exempt
 *  FLSA Exempt Tests: 29 C.F.R. Part 541 — salary basis ($684/wk as of 2020; updated $1,128/wk per 2024 rule)
 *  EU WTD: Directive 2003/88/EC — 48h max/week, 11h daily rest, 24h weekly rest, 20 days paid leave
 *  Predictive Scheduling:
 *    - San Francisco: Formula Retail Employee Rights Ordinance (SF Admin Code §§ 3200-3214)
 *    - New York City: Fair Workweek Law (NYC Admin Code § 20-1201 et seq.)
 *    - Oregon: Predictive Scheduling Law (ORS 653.450 et seq.)
 *    - Chicago: Fair Workweek Ordinance (Chicago Mun. Code §§ 1-24-010 to 1-24-100)
 *    - Seattle: Secure Scheduling Ordinance (Seattle SMC § 14.22)
 *  California Meal Breaks: Cal. Lab. Code § 512 — 30-min break by 5th hour; 2nd break by 10th
 *  Child Labor: FLSA §§ 212-213; 29 C.F.R. Part 570 — hazardous work restrictions by age
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type FLSAClassification =
  | 'EXEMPT'
  | 'NON_EXEMPT'
  | 'HIGHLY_COMPENSATED'
  | 'COMPUTER_PROFESSIONAL'
  | 'OUTSIDE_SALES';
export type ExemptionTest =
  | 'EXECUTIVE'
  | 'ADMINISTRATIVE'
  | 'PROFESSIONAL'
  | 'COMPUTER'
  | 'OUTSIDE_SALES'
  | 'HCE';
export type Jurisdiction =
  | 'FEDERAL_FLSA'
  | 'CA'
  | 'NY'
  | 'OR'
  | 'WA'
  | 'IL'
  | 'TX'
  | 'FL'
  | 'EU'
  | 'UAE'
  | 'KSA'
  | 'INDIA';
export type ViolationSeverity = 'INFO' | 'WARNING' | 'VIOLATION' | 'CRITICAL';
export type ComplianceArea =
  | 'OVERTIME'
  | 'MINIMUM_WAGE'
  | 'MEAL_BREAK'
  | 'REST_BREAK'
  | 'PREDICTIVE_SCHEDULING'
  | 'DAILY_REST'
  | 'WEEKLY_REST'
  | 'CHILD_LABOR'
  | 'CLOPENING'
  | 'CLASSIFICATION';

export interface FLSAComplianceResult {
  employeeId: string;
  employeeName: string;
  period: string;
  classification: FLSAClassification;
  exemptionBasis: ExemptionTest | null;
  salary: number;
  salaryThreshold: number; // Current DOL threshold
  meetsHCEThreshold: boolean;
  hoursWorked: number;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number; // Must be 1.5x regular rate
  totalPay: number;
  regularRate: number; // Per hour for OT calculation
  violations: ComplianceViolation[];
  isCompliant: boolean;
  misclassificationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  misclassificationReasons: string[];
}

export interface ComplianceViolation {
  violationId: string;
  area: ComplianceArea;
  severity: ViolationSeverity;
  date: string;
  description: string;
  legalReference: string;
  potentialPenalty: string;
  remediation: string;
}

export interface PredictiveSchedulingCheck {
  scheduleId: string;
  employeeId: string;
  employeeName: string;
  jurisdiction: Jurisdiction;
  violations: PredictiveSchedulingViolation[];
  isCompliant: boolean;
  advanceNoticeGiven: number; // days notice given
  requiredAdvanceNotice: number; // days required by law
  premiumsOwed: number; // predictability pay owed
  lastMinuteChanges: ScheduleChange[];
}

export interface PredictiveSchedulingViolation {
  law: string;
  jurisdiction: string;
  description: string;
  severity: ViolationSeverity;
  penaltyPerOccurrence: number;
  isPredictabilityPayRequired: boolean;
  predictabilityPayAmount: number;
}

export interface ScheduleChange {
  changeType: 'ADD_SHIFT' | 'REMOVE_SHIFT' | 'CHANGE_SHIFT' | 'CANCEL_SHIFT';
  originalShift: string;
  newShift: string | null;
  noticeHours: number;
  premiumOwed: number;
  legalRequirement: string;
}

export interface EUWorkingTimeResult {
  employeeId: string;
  employeeName: string;
  period: string;
  violations: EUWTDViolation[];
  weeklyHours: number;
  maxAllowed: number; // 48h with opt-out or 48h
  hasOptOut: boolean;
  dailyRestPeriods: DailyRestCheck[];
  weeklyRestPeriods: WeeklyRestCheck[];
  nightWorkHours: number;
  annualLeaveEntitlement: number; // 20 working days minimum
  annualLeaveTaken: number;
  annualLeaveOutstanding: number;
  isCompliant: boolean;
}

export interface EUWTDViolation {
  articleNumber: string;
  requirement: string;
  actual: string;
  violation: string;
  severity: ViolationSeverity;
}

export interface DailyRestCheck {
  date: string;
  restHours: number;
  required: number; // 11h
  compliant: boolean;
  deficit: number;
}

export interface WeeklyRestCheck {
  weekStart: string;
  restHours: number;
  required: number; // 24h uninterrupted
  compliant: boolean;
}

export interface MealBreakViolation {
  employeeId: string;
  employeeName: string;
  date: string;
  jurisdiction: Jurisdiction;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftHours: number;
  breakTaken: boolean;
  breakTime: string | null;
  breakDurationMinutes: number;
  violations: MealBreakRule[];
  penaltyOwed: number;
}

export interface MealBreakRule {
  rule: string;
  requirement: string;
  actual: string;
  violated: boolean;
  penaltyPerViolation: number;
  legalReference: string;
}

export interface ClopeningViolation {
  employeeId: string;
  employeeName: string;
  closingShift: { date: string; endTime: string };
  openingShift: { date: string; startTime: string };
  gapHours: number;
  minimumGapRequired: number; // 10h in SF, 11h generally
  isViolation: boolean;
  jurisdiction: Jurisdiction;
  premiumOwed: number;
  legalReference: string;
}

export interface ChildLaborRestriction {
  age: number;
  jurisdiction: Jurisdiction;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  earliestStartTime: string;
  latestEndTime: string;
  allowedDuringSchool: boolean;
  schoolWeekMaxHours: number;
  prohibitedOccupations: string[];
  notes: string;
}

export interface LaborComplianceReport {
  period: string;
  reportDate: string;
  totalViolations: number;
  violationsBySeverity: Record<ViolationSeverity, number>;
  violationsByArea: Record<ComplianceArea, number>;
  affectedEmployees: number;
  totalPenaltiesRisk: number;
  topViolations: ComplianceViolation[];
  remediationPlan: RemediationItem[];
  complianceScore: number;
  trendVsPriorPeriod: number; // % change in violations
}

export interface RemediationItem {
  area: ComplianceArea;
  priority: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM';
  action: string;
  owner: string;
  deadline: string;
  estimatedCostSavings: number;
}

export interface OvertimeCostForecast {
  departmentId: string;
  period: string;
  currentOTHours: number;
  projectedOTHours: number;
  currentOTCost: number;
  projectedOTCost: number;
  budgetedOTCost: number;
  overBudgetBy: number;
  overBudgetPercent: number;
  driversByEmployee: EmployeeOTForecast[];
  recommendations: string[];
  complianceAlerts: string[];
}

export interface EmployeeOTForecast {
  employeeId: string;
  employeeName: string;
  currentWeekHours: number;
  projectedWeekHours: number;
  projectedOTHours: number;
  projectedOTCost: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const CHILD_LABOR_RULES: Record<string, ChildLaborRestriction> = {
  US_14: {
    age: 14,
    jurisdiction: 'FEDERAL_FLSA',
    maxHoursPerDay: 3,
    maxHoursPerWeek: 18,
    earliestStartTime: '07:00',
    latestEndTime: '19:00',
    allowedDuringSchool: true,
    schoolWeekMaxHours: 18,
    prohibitedOccupations: [
      'manufacturing',
      'mining',
      'hazardous work',
      'cooking with open flames',
      'meat processing',
    ],
    notes: '29 C.F.R. § 570.119 — Federal child labor rules for 14-15 year olds',
  },
  US_16: {
    age: 16,
    jurisdiction: 'FEDERAL_FLSA',
    maxHoursPerDay: 8,
    maxHoursPerWeek: 40,
    earliestStartTime: '00:00',
    latestEndTime: '23:59',
    allowedDuringSchool: true,
    schoolWeekMaxHours: 40,
    prohibitedOccupations: [
      'Hazardous Order occupations (HO 1-17)',
      'driving',
      'explosives',
      'roofing',
    ],
    notes:
      '29 C.F.R. § 570.120 — 16-17 year olds may work unlimited hours; hazardous jobs prohibited',
  },
};

// ── Service Functions ──────────────────────────────────────────────────────────

/**
 * Check FLSA compliance for an employee in a given period — classification, OT pay, rate.
 */
export async function checkFLSACompliance(
  employeeId: string,
  period: string
): Promise<FLSAComplianceResult> {
  await new Promise((r) => setTimeout(r, 400));

  // Mock data for different employees
  const empData: Record<
    string,
    {
      name: string;
      salary: number;
      classification: FLSAClassification;
      exemption: ExemptionTest | null;
      hours: number;
    }
  > = {
    'emp-0201': {
      name: 'Priya Sharma',
      salary: 165000,
      classification: 'EXEMPT',
      exemption: 'PROFESSIONAL',
      hours: 42,
    },
    'emp-0312': {
      name: 'Ahmed Al-Rashid',
      salary: 95000,
      classification: 'EXEMPT',
      exemption: 'COMPUTER',
      hours: 44,
    },
    'emp-0612': {
      name: 'Maria Santos',
      salary: 38000,
      classification: 'NON_EXEMPT',
      exemption: null,
      hours: 46,
    },
    'emp-0710': {
      name: 'Derek Johnson',
      salary: 28000,
      classification: 'NON_EXEMPT',
      exemption: null,
      hours: 48,
    },
  };

  const emp = empData[employeeId] ?? {
    name: 'Unknown Employee',
    salary: 60000,
    classification: 'EXEMPT' as FLSAClassification,
    exemption: 'ADMINISTRATIVE' as ExemptionTest,
    hours: 40,
  };
  const salaryThreshold = 1128 * 52; // $58,656/year — 2024 DOL rule (eff. Jan 1, 2025)
  const hceThreshold = 151164; // 2024 HCE threshold

  const regularHours = Math.min(40, emp.hours);
  const overtimeHours = Math.max(0, emp.hours - 40);
  const hourlyRate = emp.salary / 2080;
  const regularRate = hourlyRate;
  const regularPay = regularHours * hourlyRate;
  const overtimePay = emp.classification === 'NON_EXEMPT' ? overtimeHours * hourlyRate * 1.5 : 0;
  const totalPay = regularPay + overtimePay;

  const violations: ComplianceViolation[] = [];

  if (emp.classification === 'NON_EXEMPT' && overtimeHours > 0) {
    // Check OT was properly compensated (mock assumes it was)
  }

  // Misclassification risk
  let misclassRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  const misclassReasons: string[] = [];
  if (emp.classification === 'EXEMPT' && emp.salary < salaryThreshold) {
    misclassRisk = 'HIGH';
    misclassReasons.push(
      `Salary ($${emp.salary.toLocaleString()}) below DOL threshold ($${salaryThreshold.toLocaleString()})`
    );
    violations.push({
      violationId: `viol-${Date.now()}-1`,
      area: 'CLASSIFICATION',
      severity: 'VIOLATION',
      date: period,
      description:
        'Exempt employee salary below DOL minimum threshold — may not qualify for exemption',
      legalReference: '29 C.F.R. § 541.600 — salary basis requirement',
      potentialPenalty: 'Back pay for all overtime hours + liquidated damages (2x back pay)',
      remediation: 'Reclassify as non-exempt or increase salary above threshold immediately',
    });
  }

  return {
    employeeId,
    employeeName: emp.name,
    period,
    classification: emp.classification,
    exemptionBasis: emp.exemption,
    salary: emp.salary,
    salaryThreshold,
    meetsHCEThreshold: emp.salary >= hceThreshold,
    hoursWorked: emp.hours,
    regularHours,
    overtimeHours,
    regularPay: parseFloat(regularPay.toFixed(2)),
    overtimePay: parseFloat(overtimePay.toFixed(2)),
    totalPay: parseFloat(totalPay.toFixed(2)),
    regularRate: parseFloat(regularRate.toFixed(4)),
    violations,
    isCompliant: violations.length === 0,
    misclassificationRisk: misclassRisk,
    misclassificationReasons: misclassReasons,
  };
}

/**
 * Check predictive scheduling law compliance for a schedule.
 */
export async function checkPredictiveScheduling(
  scheduleData: { employeeId: string; noticeGivenDays: number; changes: ScheduleChange[] },
  jurisdiction: Jurisdiction
): Promise<PredictiveSchedulingCheck> {
  await new Promise((r) => setTimeout(r, 300));

  const rules: Record<string, { advanceDays: number; law: string; premiumRate: number }> = {
    CA: { advanceDays: 0, law: 'No statewide predictive scheduling law', premiumRate: 0 },
    NY: {
      advanceDays: 14,
      law: 'NYC Fair Workweek Law (NYC Admin Code § 20-1201)',
      premiumRate: 75,
    },
    OR: { advanceDays: 7, law: 'Oregon Predictive Scheduling Law (ORS 653.450)', premiumRate: 40 },
    IL: {
      advanceDays: 10,
      law: 'Chicago Fair Workweek Ordinance (Chicago Mun. Code § 1-24)',
      premiumRate: 50,
    },
    WA: {
      advanceDays: 14,
      law: 'Seattle Secure Scheduling Ordinance (SMC § 14.22)',
      premiumRate: 50,
    },
    FEDERAL_FLSA: {
      advanceDays: 0,
      law: 'No federal predictive scheduling requirement',
      premiumRate: 0,
    },
  };

  const rule = rules[jurisdiction] ?? { advanceDays: 0, law: 'No applicable law', premiumRate: 0 };
  const violations: PredictiveSchedulingViolation[] = [];
  let premiumsOwed = 0;

  if (rule.advanceDays > 0 && scheduleData.noticeGivenDays < rule.advanceDays) {
    const daysShort = rule.advanceDays - scheduleData.noticeGivenDays;
    const premium = rule.premiumRate * (scheduleData.changes.length || 1);
    premiumsOwed += premium;
    violations.push({
      law: rule.law,
      jurisdiction,
      description: `Schedule posted ${scheduleData.noticeGivenDays} days in advance; ${rule.advanceDays} days required. Short by ${daysShort} day(s).`,
      severity: daysShort > 7 ? 'VIOLATION' : 'WARNING',
      penaltyPerOccurrence: rule.premiumRate,
      isPredictabilityPayRequired: true,
      predictabilityPayAmount: premium,
    });
  }

  for (const change of scheduleData.changes) {
    if (change.noticeHours < 24 * rule.advanceDays) {
      const premium = rule.premiumRate;
      premiumsOwed += premium;
      change.premiumOwed = premium;
    }
  }

  return {
    scheduleId: `sched-check-${Date.now()}`,
    employeeId: scheduleData.employeeId,
    employeeName: 'Employee',
    jurisdiction,
    violations,
    isCompliant: violations.length === 0,
    advanceNoticeGiven: scheduleData.noticeGivenDays,
    requiredAdvanceNotice: rule.advanceDays,
    premiumsOwed,
    lastMinuteChanges: scheduleData.changes,
  };
}

/**
 * Check EU Working Time Directive compliance for an employee.
 */
export async function checkEUWorkingTime(
  employeeId: string,
  period: string
): Promise<EUWorkingTimeResult> {
  await new Promise((r) => setTimeout(r, 350));

  const mockHours = { 'emp-0201': 44, 'emp-0312': 52 };
  const weeklyHours = mockHours[employeeId as keyof typeof mockHours] ?? 42;
  const violations: EUWTDViolation[] = [];

  if (weeklyHours > 48) {
    violations.push({
      articleNumber: 'Article 6',
      requirement: 'Maximum 48 working hours per week (including OT) averaged over 4-17 weeks',
      actual: `${weeklyHours}h this week`,
      violation: `Exceeded maximum by ${weeklyHours - 48}h`,
      severity: 'VIOLATION',
    });
  }

  const dailyRests: DailyRestCheck[] = [];
  for (let d = 0; d < 5; d++) {
    const date = new Date(period);
    date.setDate(date.getDate() + d);
    const restHours = 10.5 + Math.random() * 3;
    const compliant = restHours >= 11;
    if (!compliant) {
      violations.push({
        articleNumber: 'Article 3',
        requirement: 'Minimum 11 consecutive hours rest per 24-hour period',
        actual: `${restHours.toFixed(1)}h rest on ${date.toISOString().slice(0, 10)}`,
        violation: `Insufficient daily rest — ${(11 - restHours).toFixed(1)}h deficit`,
        severity: 'WARNING',
      });
    }
    dailyRests.push({
      date: date.toISOString().slice(0, 10),
      restHours: parseFloat(restHours.toFixed(1)),
      required: 11,
      compliant,
      deficit: compliant ? 0 : parseFloat((11 - restHours).toFixed(1)),
    });
  }

  return {
    employeeId,
    employeeName: 'Employee',
    period,
    violations,
    weeklyHours,
    maxAllowed: 48,
    hasOptOut: false,
    dailyRestPeriods: dailyRests,
    weeklyRestPeriods: [{ weekStart: period, restHours: 55, required: 24, compliant: true }],
    nightWorkHours: 0,
    annualLeaveEntitlement: 20, // EU minimum — 4 weeks
    annualLeaveTaken: 8,
    annualLeaveOutstanding: 12,
    isCompliant: violations.length === 0,
  };
}

/**
 * Detect meal break violations for an employee shift based on jurisdiction rules.
 */
export async function detectMealBreakViolations(
  employeeId: string,
  shiftData: {
    date: string;
    startTime: string;
    endTime: string;
    breakTaken: boolean;
    breakTime: string | null;
    breakDurationMinutes: number;
  },
  jurisdiction: Jurisdiction
): Promise<MealBreakViolation> {
  await new Promise((r) => setTimeout(r, 200));

  const start = new Date(`2026-01-01T${shiftData.startTime}:00`);
  const end = new Date(`2026-01-01T${shiftData.endTime}:00`);
  const shiftHours = (end.getTime() - start.getTime()) / 3600000;

  const violations: MealBreakRule[] = [];
  let penaltyOwed = 0;

  if (jurisdiction === 'CA') {
    // California: 30-min meal break by end of 5th hour; second break by end of 10th hour
    if (shiftHours > 5 && (!shiftData.breakTaken || shiftData.breakDurationMinutes < 30)) {
      violations.push({
        rule: 'California Meal Period — First Meal Break',
        requirement: '30-minute unpaid meal period before end of 5th hour of work',
        actual: shiftData.breakTaken
          ? `${shiftData.breakDurationMinutes} minutes taken`
          : 'No meal break taken',
        violated: true,
        penaltyPerViolation: hourlyRate(50000), // 1 hour premium pay penalty
        legalReference: 'Cal. Lab. Code § 512; IWC Wage Orders',
      });
      penaltyOwed += hourlyRate(50000);
    }
    if (shiftHours > 10 && shiftData.breakDurationMinutes < 60) {
      violations.push({
        rule: 'California Meal Period — Second Meal Break',
        requirement: '30-minute unpaid meal period before end of 10th hour of work',
        actual: 'Second meal period not provided',
        violated: true,
        penaltyPerViolation: hourlyRate(50000),
        legalReference: 'Cal. Lab. Code § 512(a)',
      });
      penaltyOwed += hourlyRate(50000);
    }
  } else if (jurisdiction === 'FEDERAL_FLSA') {
    // FLSA: No meal break requirement (bona fide breaks 30+ min are unpaid; 20 min or less are paid)
    if (shiftData.breakTaken && shiftData.breakDurationMinutes < 20) {
      violations.push({
        rule: 'FLSA Short Break',
        requirement: 'Breaks 20 minutes or less must be counted as paid work time',
        actual: `${shiftData.breakDurationMinutes}-minute break taken but likely unpaid`,
        violated: true,
        penaltyPerViolation: 0,
        legalReference: '29 C.F.R. § 785.18 — Rest periods of short duration',
      });
    }
  }

  return {
    employeeId,
    employeeName: 'Employee',
    date: shiftData.date,
    jurisdiction,
    shiftStartTime: shiftData.startTime,
    shiftEndTime: shiftData.endTime,
    shiftHours,
    breakTaken: shiftData.breakTaken,
    breakTime: shiftData.breakTime,
    breakDurationMinutes: shiftData.breakDurationMinutes,
    violations,
    penaltyOwed,
  };
}

function hourlyRate(annualSalary: number): number {
  return parseFloat((annualSalary / 2080).toFixed(2));
}

/**
 * Check for clopening violations (insufficient gap between closing and opening shifts).
 */
export async function checkClopeningViolation(
  employeeId: string,
  closingShift: { date: string; endTime: string },
  openingShift: { date: string; startTime: string },
  jurisdiction: Jurisdiction
): Promise<ClopeningViolation> {
  await new Promise((r) => setTimeout(r, 200));

  const closing = new Date(`${closingShift.date}T${closingShift.endTime}:00`);
  const opening = new Date(`${openingShift.date}T${openingShift.startTime}:00`);
  const gapHours = (opening.getTime() - closing.getTime()) / 3600000;

  const gapRequirements: Record<string, { minGap: number; law: string; premium: number }> = {
    NY: { minGap: 11, law: 'NYC Fair Workweek Law — minimum 11h between shifts', premium: 100 },
    OR: {
      minGap: 10,
      law: 'Oregon Predictive Scheduling — minimum 10h rest between shifts',
      premium: 80,
    },
    WA: { minGap: 10, law: 'Seattle Secure Scheduling — minimum 10h between shifts', premium: 75 },
    IL: { minGap: 10, law: 'Chicago Fair Workweek — minimum 10h between shifts', premium: 100 },
    EU: { minGap: 11, law: 'EU Working Time Directive Article 3 — 11h daily rest', premium: 0 },
  };

  const req = gapRequirements[jurisdiction] ?? {
    minGap: 8,
    law: 'No specific clopening law (best practice: 8h minimum)',
    premium: 0,
  };
  const isViolation = gapHours < req.minGap;

  return {
    employeeId,
    employeeName: 'Employee',
    closingShift,
    openingShift,
    gapHours: parseFloat(gapHours.toFixed(1)),
    minimumGapRequired: req.minGap,
    isViolation,
    jurisdiction,
    premiumOwed: isViolation ? req.premium : 0,
    legalReference: req.law,
  };
}

/**
 * Get child labor hour and occupation restrictions for a given age and jurisdiction.
 */
export async function getChildLaborRestrictions(
  age: number,
  jurisdiction: Jurisdiction
): Promise<ChildLaborRestriction> {
  await new Promise((r) => setTimeout(r, 200));

  if (age < 14) {
    return {
      age,
      jurisdiction,
      maxHoursPerDay: 0,
      maxHoursPerWeek: 0,
      earliestStartTime: 'N/A',
      latestEndTime: 'N/A',
      allowedDuringSchool: false,
      schoolWeekMaxHours: 0,
      prohibitedOccupations: ['All employment prohibited under age 14 (FLSA)'],
      notes: '29 U.S.C. § 212(c) — no employment of minors under 14 in most occupations',
    };
  }

  if (age >= 14 && age < 16) return CHILD_LABOR_RULES['US_14'];
  if (age >= 16 && age < 18) return CHILD_LABOR_RULES['US_16'];

  return {
    age,
    jurisdiction,
    maxHoursPerDay: 24,
    maxHoursPerWeek: 168,
    earliestStartTime: '00:00',
    latestEndTime: '23:59',
    allowedDuringSchool: true,
    schoolWeekMaxHours: 168,
    prohibitedOccupations: [],
    notes: 'Age 18+ — no federal child labor restrictions apply',
  };
}

/**
 * Generate aggregate labor compliance report for a period.
 */
export async function getLaborComplianceReport(period: string): Promise<LaborComplianceReport> {
  await new Promise((r) => setTimeout(r, 500));

  const violations: ComplianceViolation[] = [
    {
      violationId: 'viol-001',
      area: 'OVERTIME',
      severity: 'VIOLATION',
      date: period,
      description:
        'Non-exempt employee Bashir Al-Sayed worked 52h — OT pay at 1.0x instead of 1.5x',
      legalReference: '29 U.S.C. § 207(a)(1)',
      potentialPenalty: '$840 back wages + $840 liquidated damages',
      remediation: 'Issue corrected OT payment; audit payroll system OT multiplier configuration',
    },
    {
      violationId: 'viol-002',
      area: 'MEAL_BREAK',
      severity: 'WARNING',
      date: period,
      description:
        '3 California employees did not receive compliant 30-minute meal period by 5th hour',
      legalReference: 'Cal. Lab. Code § 512',
      potentialPenalty: '$3 × (1-hour premium) = 3 penalty days',
      remediation: 'Schedule automated break reminders; require manager approval if break waived',
    },
    {
      violationId: 'viol-003',
      area: 'PREDICTIVE_SCHEDULING',
      severity: 'WARNING',
      date: period,
      description:
        '4 NYC employees had shifts added with < 14 days notice — predictability pay owed',
      legalReference: 'NYC Admin Code § 20-1241',
      potentialPenalty: '4 × $75 = $300 predictability pay',
      remediation:
        'Post schedules 14 days in advance; enable system-level predictive scheduling checks',
    },
  ];

  return {
    period,
    reportDate: new Date().toISOString().slice(0, 10),
    totalViolations: violations.length,
    violationsBySeverity: {
      INFO: 0,
      WARNING: 2,
      VIOLATION: 1,
      CRITICAL: 0,
    },
    violationsByArea: {
      OVERTIME: 1,
      MINIMUM_WAGE: 0,
      MEAL_BREAK: 1,
      REST_BREAK: 0,
      PREDICTIVE_SCHEDULING: 1,
      DAILY_REST: 0,
      WEEKLY_REST: 0,
      CHILD_LABOR: 0,
      CLOPENING: 0,
      CLASSIFICATION: 0,
    },
    affectedEmployees: 8,
    totalPenaltiesRisk: 1980,
    topViolations: violations,
    remediationPlan: [
      {
        area: 'OVERTIME',
        priority: 'IMMEDIATE',
        action: 'Issue corrected OT payments',
        owner: 'Payroll Team',
        deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        estimatedCostSavings: 1680,
      },
      {
        area: 'MEAL_BREAK',
        priority: 'SHORT_TERM',
        action: 'Configure break scheduling alerts in HRIS',
        owner: 'HR Operations',
        deadline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        estimatedCostSavings: 500,
      },
      {
        area: 'PREDICTIVE_SCHEDULING',
        priority: 'SHORT_TERM',
        action: 'Enable 14-day advance posting requirement in scheduling system',
        owner: 'HR Technology',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        estimatedCostSavings: 2400,
      },
    ],
    complianceScore: 87,
    trendVsPriorPeriod: -8.4, // 8.4% reduction in violations vs prior period
  };
}

/**
 * Calculate projected overtime costs for a department with compliance alerts.
 */
export async function calculateOvertimeCost(
  departmentId: string,
  period: string
): Promise<OvertimeCostForecast> {
  await new Promise((r) => setTimeout(r, 350));

  const employees: EmployeeOTForecast[] = [
    {
      employeeId: 'emp-0612',
      employeeName: 'Maria Santos',
      currentWeekHours: 38,
      projectedWeekHours: 46,
      projectedOTHours: 6,
      projectedOTCost: 327,
      riskLevel: 'HIGH',
    },
    {
      employeeId: 'emp-0710',
      employeeName: 'Derek Johnson',
      currentWeekHours: 36,
      projectedWeekHours: 43,
      projectedOTHours: 3,
      projectedOTCost: 121,
      riskLevel: 'MEDIUM',
    },
    {
      employeeId: 'emp-0521',
      employeeName: 'Tom Chen',
      currentWeekHours: 40,
      projectedWeekHours: 42,
      projectedOTHours: 2,
      projectedOTCost: 96,
      riskLevel: 'LOW',
    },
    {
      employeeId: 'emp-0445',
      employeeName: 'Sara Mitchell',
      currentWeekHours: 32,
      projectedWeekHours: 40,
      projectedOTHours: 0,
      projectedOTCost: 0,
      riskLevel: 'LOW',
    },
  ];

  const projectedOTHours = employees.reduce((s, e) => s + e.projectedOTHours, 0);
  const projectedOTCost = employees.reduce((s, e) => s + e.projectedOTCost, 0);
  const budgetedOTCost = 400;

  return {
    departmentId,
    period,
    currentOTHours: 8,
    projectedOTHours,
    currentOTCost: 312,
    projectedOTCost,
    budgetedOTCost,
    overBudgetBy: Math.max(0, projectedOTCost - budgetedOTCost),
    overBudgetPercent: parseFloat(
      (((projectedOTCost - budgetedOTCost) / budgetedOTCost) * 100).toFixed(1)
    ),
    driversByEmployee: employees,
    recommendations: [
      'Redistribute 4h from Maria Santos to Sara Mitchell to prevent excess OT',
      'Schedule Tom Chen for optional extended hours on Thursday instead of required OT',
      'Pre-approve OT for Maria Santos and Derek Johnson — current demand justifies the spend',
    ],
    complianceAlerts: [
      'Maria Santos (non-exempt) projected to work 46h — ensure OT rate of 1.5x is applied correctly',
      'Derek Johnson approaching 7 consecutive days — check clopening gap before scheduling weekend',
    ],
  };
}

// ── Named export ───────────────────────────────────────────────────────────────

export const laborComplianceService = {
  checkFLSACompliance,
  checkPredictiveScheduling,
  checkEUWorkingTime,
  detectMealBreakViolations,
  checkClopeningViolation,
  getChildLaborRestrictions,
  getLaborComplianceReport,
  calculateOvertimeCost,
};
