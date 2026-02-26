/**
 * @module aiSchedulingService
 * @description AI-powered workforce scheduling — auto-schedule generation, demand forecasting,
 *   fatigue risk scoring, skill-based assignment, fairness analytics, and scenario simulation.
 * @project AURA HCM Platform
 * @section 22.1 — AI Scheduling Engine
 *
 * Constraints Applied:
 *  EU Working Time Directive (2003/88/EC): 48h max/week, 11h daily rest, 24h weekly rest
 *  FLSA (29 U.S.C. § 207): 40h/week OT threshold, no daily rest mandate (federal)
 *  Predictive Scheduling Laws: Fair scheduling ordinances in SF, NYC, Chicago, Seattle, Oregon
 *  Fatigue Risk Management: FRMS (Fatigue Risk Management Systems) principles from FAA/FMCSA
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type SchedulingConstraintType =
  | 'MIN_REST_HOURS'
  | 'MAX_CONSECUTIVE_DAYS'
  | 'MAX_WEEKLY_HOURS'
  | 'SKILL_REQUIRED'
  | 'MIN_COVERAGE'
  | 'MAX_COVERAGE'
  | 'EMPLOYEE_PREFERENCE'
  | 'SENIORITY'
  | 'PREDICTIVE_SCHEDULING_LAW'
  | 'BUDGET_LIMIT';

export type FatigueLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type SchedulePriority = 'COST' | 'FAIRNESS' | 'PREFERENCE' | 'COVERAGE' | 'FATIGUE';
export type DemandPattern =
  | 'STEADY'
  | 'SEASONAL'
  | 'WEEKEND_HEAVY'
  | 'WEEKDAY_HEAVY'
  | 'EVENT_DRIVEN';

export interface SchedulingParams {
  departmentId: string;
  startDate: string;
  endDate: string;
  priority: SchedulePriority;
  constraints: SchedulingConstraint[];
  minimumCoverage: MinimumCoverage[];
  includePartTime: boolean;
  respectPreferences: boolean;
  maxBudget?: number;
  jurisdiction?: string; // For compliance rules
}

export interface SchedulingConstraint {
  type: SchedulingConstraintType;
  value: number | string;
  mandatory: boolean;
  description: string;
}

export interface MinimumCoverage {
  dayOfWeek: number; // 0=Sunday
  shiftStart: string; // HH:mm
  shiftEnd: string;
  minEmployees: number;
  requiredSkill?: string;
}

export interface GeneratedSchedule {
  scheduleId: string;
  departmentId: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  algorithm: string;
  priority: SchedulePriority;
  assignments: ScheduleAssignment[];
  metrics: ScheduleMetrics;
  violations: ScheduleViolation[];
  coverageGaps: CoverageGap[];
  estimatedCost: number;
}

export interface ScheduleAssignment {
  employeeId: string;
  employeeName: string;
  date: string;
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  hoursScheduled: number;
  isOvertime: boolean;
  fatigueScoreAtAssignment: number;
  preferenceMatch: boolean;
  skillsUtilized: string[];
  cost: number;
  assignedByAI: boolean;
  confidence: number; // AI confidence 0-100
}

export interface ScheduleMetrics {
  totalHoursScheduled: number;
  totalOvertimeHours: number;
  coverageRate: number; // % of required slots filled
  fairnessScore: number; // 0-100
  preferenceMatchRate: number; // % of assignments matching preferences
  avgFatigueScore: number;
  estimatedCost: number;
  overtimeCost: number;
  constraintViolations: number;
  aiConfidenceScore: number;
}

export interface ScheduleViolation {
  employeeId: string;
  employeeName: string;
  violationType: SchedulingConstraintType;
  date: string;
  description: string;
  severity: 'WARNING' | 'ERROR';
  autoResolvedBy?: string;
}

export interface CoverageGap {
  date: string;
  shiftStart: string;
  shiftEnd: string;
  required: number;
  scheduled: number;
  shortage: number;
  requiredSkill: string | null;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface DemandForecast {
  departmentId: string;
  period: string;
  pattern: DemandPattern;
  forecastByDay: DayDemand[];
  weeklyAvgFTE: number;
  peakDemandFTE: number;
  troughDemandFTE: number;
  confidenceInterval: number; // %
  factors: DemandFactor[];
  seasonalAdjustment: number;
}

export interface DayDemand {
  date: string;
  dayOfWeek: string;
  forecastedFTE: number;
  historicalAvgFTE: number;
  upperBound: number;
  lowerBound: number;
  specialEvents: string[];
  demandDrivers: string[];
}

export interface DemandFactor {
  factor: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  direction: 'INCREASE' | 'DECREASE' | 'NEUTRAL';
  description: string;
}

export interface FatigueRiskResult {
  employeeId: string;
  employeeName: string;
  fatigueScore: number; // 0-100 (higher = more fatigued)
  fatigueLevel: FatigueLevel;
  assessedAt: string;
  factors: FatigueFactor[];
  recentWorkPattern: WorkPattern;
  recommendations: string[];
  canWorkNextShift: boolean;
  earliestSafeStartTime: string | null;
}

export interface FatigueFactor {
  factor: string;
  weight: number; // contribution to fatigue score
  value: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface WorkPattern {
  last7DaysHours: number;
  consecutiveDaysWorked: number;
  hoursLast24: number;
  hoursLast48: number;
  nightShiftsLast7Days: number;
  lastRestPeriodHours: number;
  avgDailyHours7d: number;
}

export interface SkillMatrix {
  departmentId: string;
  employees: EmployeeSkillProfile[];
  skillGaps: SkillGap[];
  coverageBySkill: SkillCoverage[];
}

export interface EmployeeSkillProfile {
  employeeId: string;
  employeeName: string;
  designation: string;
  skills: Skill[];
  certifications: string[];
  crossTrainedDepts: string[];
  availabilityHoursPerWeek: number;
}

export interface Skill {
  skillName: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  isCritical: boolean;
  yearsExperience: number;
  lastAssessed: string;
}

export interface SkillGap {
  skillName: string;
  requiredCount: number;
  currentCount: number;
  gap: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

export interface SkillCoverage {
  skillName: string;
  totalEmployees: number;
  advancedOrExpert: number;
  coverageScore: number; // 0-100
  minimumRequired: number;
  isSufficient: boolean;
}

export interface FairnessScore {
  departmentId: string;
  period: string;
  overallScore: number; // 0-100
  dimensions: FairnessDimension[];
  employeeOutliers: EmployeeFairnessOutlier[];
  recommendations: string[];
}

export interface FairnessDimension {
  dimension: string;
  score: number;
  description: string;
  standardDeviation: number;
  minValue: number;
  maxValue: number;
  acceptable: boolean;
}

export interface EmployeeFairnessOutlier {
  employeeId: string;
  employeeName: string;
  dimension: string;
  value: number;
  departmentAverage: number;
  deviationPercent: number;
  direction: 'OVER_ASSIGNED' | 'UNDER_ASSIGNED';
}

export interface EmployeePreference {
  employeeId: string;
  preferredShifts: string[];
  avoidShifts: string[];
  preferredDaysOff: number[]; // 0=Sunday
  maxHoursPerWeek: number;
  minHoursPerWeek: number;
  canWorkNights: boolean;
  canWorkWeekends: boolean;
  canWorkHolidays: boolean;
  remoteWorkDays: number[]; // preferred remote days
  blackoutDates: string[];
  notes: string;
}

export interface WhatIfScenario {
  scenarioName: string;
  changes: ScenarioChange[];
  projectedImpact: ScenarioImpact;
}

export interface ScenarioChange {
  changeType:
    | 'ADD_EMPLOYEE'
    | 'REMOVE_EMPLOYEE'
    | 'CHANGE_DEMAND'
    | 'CHANGE_BUDGET'
    | 'CHANGE_HOURS';
  description: string;
  value: string | number;
}

export interface ScenarioImpact {
  coverageChange: number; // % change
  costChange: number; // $ change
  overtimeChange: number; // hours change
  fatigueChange: number; // score change
  fairnessChange: number; // score change
  feasible: boolean;
  warnings: string[];
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_EMPLOYEE_PREFERENCES: Record<string, EmployeePreference> = {
  'emp-0201': {
    employeeId: 'emp-0201',
    preferredShifts: ['MORNING'],
    avoidShifts: ['NIGHT'],
    preferredDaysOff: [0, 6], // Sun & Sat
    maxHoursPerWeek: 40,
    minHoursPerWeek: 32,
    canWorkNights: false,
    canWorkWeekends: false,
    canWorkHolidays: false,
    remoteWorkDays: [3], // Wednesday
    blackoutDates: ['2026-03-15', '2026-04-10'],
    notes: 'School pickup at 3:30 PM on Mon/Wed/Fri',
  },
  'emp-0312': {
    employeeId: 'emp-0312',
    preferredShifts: ['EVENING', 'NIGHT'],
    avoidShifts: ['MORNING'],
    preferredDaysOff: [1, 2], // Mon & Tue
    maxHoursPerWeek: 48,
    minHoursPerWeek: 36,
    canWorkNights: true,
    canWorkWeekends: true,
    canWorkHolidays: true,
    remoteWorkDays: [],
    blackoutDates: [],
    notes: 'Prefers later shifts; studying mornings',
  },
};

const MOCK_SKILL_MATRIX: SkillMatrix = {
  departmentId: 'dept-eng',
  employees: [
    {
      employeeId: 'emp-0201',
      employeeName: 'Priya Sharma',
      designation: 'Senior Engineer',
      skills: [
        {
          skillName: 'React/TypeScript',
          proficiencyLevel: 'EXPERT',
          isCritical: true,
          yearsExperience: 6,
          lastAssessed: '2025-11-01',
        },
        {
          skillName: 'Node.js',
          proficiencyLevel: 'ADVANCED',
          isCritical: false,
          yearsExperience: 4,
          lastAssessed: '2025-11-01',
        },
        {
          skillName: 'System Design',
          proficiencyLevel: 'ADVANCED',
          isCritical: true,
          yearsExperience: 5,
          lastAssessed: '2025-11-01',
        },
      ],
      certifications: ['AWS Solutions Architect Associate', 'Google Cloud Professional'],
      crossTrainedDepts: ['Product', 'QA'],
      availabilityHoursPerWeek: 40,
    },
    {
      employeeId: 'emp-0312',
      employeeName: 'Ahmed Al-Rashid',
      designation: 'DevOps Engineer',
      skills: [
        {
          skillName: 'Kubernetes/Docker',
          proficiencyLevel: 'EXPERT',
          isCritical: true,
          yearsExperience: 5,
          lastAssessed: '2025-10-15',
        },
        {
          skillName: 'CI/CD Pipelines',
          proficiencyLevel: 'EXPERT',
          isCritical: true,
          yearsExperience: 5,
          lastAssessed: '2025-10-15',
        },
        {
          skillName: 'AWS',
          proficiencyLevel: 'ADVANCED',
          isCritical: false,
          yearsExperience: 4,
          lastAssessed: '2025-10-15',
        },
      ],
      certifications: ['CKA - Certified Kubernetes Administrator', 'AWS DevOps Professional'],
      crossTrainedDepts: ['Infrastructure'],
      availabilityHoursPerWeek: 45,
    },
  ],
  skillGaps: [
    {
      skillName: 'Machine Learning / MLOps',
      requiredCount: 3,
      currentCount: 1,
      gap: 2,
      urgency: 'HIGH',
      recommendation: 'Immediate upskilling program or hire 2 ML engineers by Q2 2026',
    },
    {
      skillName: 'Cybersecurity (SIEM/SAST)',
      requiredCount: 2,
      currentCount: 0,
      gap: 2,
      urgency: 'CRITICAL',
      recommendation: 'Security certification program required; consider contractor for interim',
    },
  ],
  coverageBySkill: [
    {
      skillName: 'React/TypeScript',
      totalEmployees: 8,
      advancedOrExpert: 5,
      coverageScore: 85,
      minimumRequired: 4,
      isSufficient: true,
    },
    {
      skillName: 'System Design',
      totalEmployees: 6,
      advancedOrExpert: 4,
      coverageScore: 78,
      minimumRequired: 3,
      isSufficient: true,
    },
    {
      skillName: 'Machine Learning / MLOps',
      totalEmployees: 2,
      advancedOrExpert: 1,
      coverageScore: 38,
      minimumRequired: 3,
      isSufficient: false,
    },
  ],
};

// ── Service Functions ──────────────────────────────────────────────────────────

/**
 * Generate an AI-optimized schedule for a department over a date range.
 */
export async function generateSchedule(params: SchedulingParams): Promise<GeneratedSchedule> {
  await new Promise((r) => setTimeout(r, 800)); // Simulate AI processing time

  const scheduleId = `sched-${Date.now()}`;
  const today = new Date(params.startDate);
  const assignments: ScheduleAssignment[] = [];

  // Simulate AI-generated assignments
  const employees = [
    { id: 'emp-0201', name: 'Priya Sharma' },
    { id: 'emp-0312', name: 'Ahmed Al-Rashid' },
    { id: 'emp-0445', name: 'Sara Mitchell' },
    { id: 'emp-0521', name: 'Tom Chen' },
    { id: 'emp-0612', name: 'Maria Santos' },
  ];

  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends for this mock

    for (let i = 0; i < 3; i++) {
      const emp = employees[i];
      const shifts = [
        { id: 'shift-morning', name: 'Morning', start: '09:00', end: '17:00', hours: 8 },
        { id: 'shift-evening', name: 'Evening', start: '13:00', end: '21:00', hours: 8 },
        { id: 'shift-flexday', name: 'Flex Day', start: '10:00', end: '18:00', hours: 8 },
      ];
      const shift = shifts[i];
      const fatigueScore = 15 + Math.floor(Math.random() * 30);

      assignments.push({
        employeeId: emp.id,
        employeeName: emp.name,
        date: dateStr,
        shiftId: shift.id,
        shiftName: shift.name,
        startTime: shift.start,
        endTime: shift.end,
        hoursScheduled: shift.hours,
        isOvertime: false,
        fatigueScoreAtAssignment: fatigueScore,
        preferenceMatch: Math.random() > 0.2,
        skillsUtilized: ['React/TypeScript', 'Node.js'],
        cost: Math.round(shift.hours * (165000 / 2080)),
        assignedByAI: true,
        confidence: 78 + Math.floor(Math.random() * 20),
      });
    }
  }

  return {
    scheduleId,
    departmentId: params.departmentId,
    startDate: params.startDate,
    endDate: params.endDate,
    generatedAt: new Date().toISOString(),
    algorithm: 'Constraint Satisfaction + Genetic Algorithm (v2.4)',
    priority: params.priority,
    estimatedCost: assignments.reduce((s, a) => s + a.cost, 0),
    assignments,
    metrics: {
      totalHoursScheduled: assignments.reduce((s, a) => s + a.hoursScheduled, 0),
      totalOvertimeHours: 2.5,
      coverageRate: 97.2,
      fairnessScore: 82,
      preferenceMatchRate:
        (assignments.filter((a) => a.preferenceMatch).length / assignments.length) * 100,
      avgFatigueScore:
        assignments.reduce((s, a) => s + a.fatigueScoreAtAssignment, 0) / assignments.length,
      estimatedCost: assignments.reduce((s, a) => s + a.cost, 0),
      overtimeCost: 480,
      constraintViolations: 1,
      aiConfidenceScore: 84,
    },
    violations: [
      {
        employeeId: 'emp-0445',
        employeeName: 'Sara Mitchell',
        violationType: 'MIN_REST_HOURS',
        date: params.startDate,
        description: 'Only 10.5 hours rest between shifts (minimum 11 hours)',
        severity: 'WARNING',
        autoResolvedBy: 'Shifted start time by 30 minutes',
      },
    ],
    coverageGaps: [],
  };
}

/**
 * Get AI demand forecast for a department over a period.
 */
export async function getDemandForecast(
  departmentId: string,
  period: string
): Promise<DemandForecast> {
  await new Promise((r) => setTimeout(r, 400));

  const startDate = new Date(period);
  const days: DayDemand[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const baseFTE: Record<number, number> = { 0: 2, 1: 8, 2: 9, 3: 8.5, 4: 9, 5: 7.5, 6: 3 };

  for (let i = 0; i < 14; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    const base = baseFTE[dow] ?? 7;
    const variance = (Math.random() - 0.5) * 0.8;
    const forecasted = parseFloat((base + variance).toFixed(1));

    days.push({
      date: d.toISOString().slice(0, 10),
      dayOfWeek: dayNames[dow],
      forecastedFTE: forecasted,
      historicalAvgFTE: base,
      upperBound: parseFloat((forecasted + 1.2).toFixed(1)),
      lowerBound: parseFloat(Math.max(0, forecasted - 1.2).toFixed(1)),
      specialEvents: dow === 3 ? ['Q1 Sprint Review — All Hands 2PM'] : [],
      demandDrivers:
        dow >= 1 && dow <= 5
          ? ['Standard workday demand', 'Active sprint cycle']
          : ['Weekend on-call rotation'],
    });
  }

  return {
    departmentId,
    period,
    pattern: 'WEEKDAY_HEAVY',
    forecastByDay: days,
    weeklyAvgFTE: 8.4,
    peakDemandFTE: 10.2,
    troughDemandFTE: 2.1,
    confidenceInterval: 85,
    factors: [
      {
        factor: 'Sprint cycle week',
        impact: 'HIGH',
        direction: 'INCREASE',
        description: 'Sprint review and planning weeks require 15-20% more staff',
      },
      {
        factor: 'Product launch period',
        impact: 'MEDIUM',
        direction: 'INCREASE',
        description: 'Deployment and monitoring demand spikes near release dates',
      },
      {
        factor: 'School holiday season',
        impact: 'LOW',
        direction: 'DECREASE',
        description: 'Historical data shows 8-12% lower attendance during school breaks',
      },
    ],
    seasonalAdjustment: 1.04,
  };
}

/**
 * Calculate fatigue risk score for an employee based on recent work patterns.
 */
export async function checkFatigueRisk(employeeId: string): Promise<FatigueRiskResult> {
  await new Promise((r) => setTimeout(r, 300));

  // Simulate fatigue calculation based on mock work patterns
  const workPatterns: Record<string, WorkPattern> = {
    'emp-0201': {
      last7DaysHours: 42,
      consecutiveDaysWorked: 5,
      hoursLast24: 8.5,
      hoursLast48: 16.5,
      nightShiftsLast7Days: 0,
      lastRestPeriodHours: 14.5,
      avgDailyHours7d: 8.4,
    },
    'emp-0312': {
      last7DaysHours: 56,
      consecutiveDaysWorked: 7,
      hoursLast24: 10,
      hoursLast48: 18,
      nightShiftsLast7Days: 3,
      lastRestPeriodHours: 8,
      avgDailyHours7d: 10.2,
    },
  };

  const pattern = workPatterns[employeeId] ?? {
    last7DaysHours: 40,
    consecutiveDaysWorked: 5,
    hoursLast24: 8,
    hoursLast48: 16,
    nightShiftsLast7Days: 0,
    lastRestPeriodHours: 15,
    avgDailyHours7d: 8,
  };

  const factors: FatigueFactor[] = [
    {
      factor: 'Hours last 24h',
      weight: 25,
      value: `${pattern.hoursLast24}h`,
      risk: pattern.hoursLast24 > 9 ? 'HIGH' : pattern.hoursLast24 > 8 ? 'MEDIUM' : 'LOW',
    },
    {
      factor: 'Consecutive days worked',
      weight: 25,
      value: `${pattern.consecutiveDaysWorked} days`,
      risk:
        pattern.consecutiveDaysWorked > 6
          ? 'HIGH'
          : pattern.consecutiveDaysWorked > 5
            ? 'MEDIUM'
            : 'LOW',
    },
    {
      factor: 'Night shifts last 7 days',
      weight: 20,
      value: `${pattern.nightShiftsLast7Days} shifts`,
      risk:
        pattern.nightShiftsLast7Days > 2
          ? 'HIGH'
          : pattern.nightShiftsLast7Days > 0
            ? 'MEDIUM'
            : 'LOW',
    },
    {
      factor: 'Last rest period',
      weight: 20,
      value: `${pattern.lastRestPeriodHours}h`,
      risk:
        pattern.lastRestPeriodHours < 8
          ? 'HIGH'
          : pattern.lastRestPeriodHours < 11
            ? 'MEDIUM'
            : 'LOW',
    },
    {
      factor: 'Hours last 7 days',
      weight: 10,
      value: `${pattern.last7DaysHours}h`,
      risk: pattern.last7DaysHours > 48 ? 'HIGH' : pattern.last7DaysHours > 44 ? 'MEDIUM' : 'LOW',
    },
  ];

  const fatigueScore = Math.min(
    100,
    factors.reduce((s, f) => {
      const riskScore = f.risk === 'HIGH' ? f.weight : f.risk === 'MEDIUM' ? f.weight * 0.5 : 0;
      return s + riskScore;
    }, 0)
  );

  const fatigueLevel: FatigueLevel =
    fatigueScore >= 75
      ? 'CRITICAL'
      : fatigueScore >= 50
        ? 'HIGH'
        : fatigueScore >= 25
          ? 'MODERATE'
          : 'LOW';

  const canWork = fatigueScore < 75 && pattern.lastRestPeriodHours >= 8;
  const earliestStart =
    pattern.lastRestPeriodHours < 11
      ? new Date(Date.now() + (11 - pattern.lastRestPeriodHours) * 3600000).toISOString()
      : null;

  return {
    employeeId,
    employeeName: employeeId === 'emp-0201' ? 'Priya Sharma' : 'Ahmed Al-Rashid',
    fatigueScore: Math.round(fatigueScore),
    fatigueLevel,
    assessedAt: new Date().toISOString(),
    factors,
    recentWorkPattern: pattern,
    recommendations:
      fatigueLevel === 'CRITICAL'
        ? [
            'Do not schedule for next shift — mandatory rest required',
            'Ensure at least 11 hours rest before next assignment',
            'Consider wellness check-in',
          ]
        : fatigueLevel === 'HIGH'
          ? [
              'Limit next shift to 8 hours maximum',
              'Avoid consecutive night shifts',
              'Schedule mandatory break every 4 hours',
            ]
          : [
              'Monitor work hours — approaching elevated fatigue threshold',
              'Encourage use of scheduled breaks',
            ],
    canWorkNextShift: canWork,
    earliestSafeStartTime: earliestStart,
  };
}

/**
 * Get skill matrix for a department.
 */
export async function getSkillMatrix(departmentId: string): Promise<SkillMatrix> {
  await new Promise((r) => setTimeout(r, 300));
  return { ...MOCK_SKILL_MATRIX, departmentId };
}

/**
 * Calculate shift distribution fairness score for a generated schedule.
 */
export async function calculateFairnessScore(_scheduleId: string): Promise<FairnessScore> {
  await new Promise((r) => setTimeout(r, 300));

  return {
    departmentId: 'dept-eng',
    period: 'Current Week',
    overallScore: 82,
    dimensions: [
      {
        dimension: 'Weekend Shift Distribution',
        score: 78,
        description: 'Variation in weekend shifts assigned per employee',
        standardDeviation: 0.8,
        minValue: 0,
        maxValue: 3,
        acceptable: true,
      },
      {
        dimension: 'Night Shift Distribution',
        score: 71,
        description: 'Variation in night shifts assigned per employee',
        standardDeviation: 1.2,
        minValue: 0,
        maxValue: 4,
        acceptable: true,
      },
      {
        dimension: 'Total Hours Distribution',
        score: 88,
        description: 'Variation in total scheduled hours per employee',
        standardDeviation: 2.4,
        minValue: 32,
        maxValue: 44,
        acceptable: true,
      },
      {
        dimension: 'Holiday Coverage Rotation',
        score: 91,
        description: 'Holiday shifts distributed by seniority rotation',
        standardDeviation: 0.4,
        minValue: 0,
        maxValue: 2,
        acceptable: true,
      },
    ],
    employeeOutliers: [
      {
        employeeId: 'emp-0312',
        employeeName: 'Ahmed Al-Rashid',
        dimension: 'Night Shift Distribution',
        value: 4,
        departmentAverage: 1.8,
        deviationPercent: 122,
        direction: 'OVER_ASSIGNED',
      },
    ],
    recommendations: [
      'Redistribute 1-2 night shifts from Ahmed Al-Rashid to other qualified team members',
      'Consider night shift premium incentive to increase volunteer pool',
      'Night shift distribution is currently the primary fairness risk factor',
    ],
  };
}

/**
 * Get employee scheduling preferences.
 */
export async function getEmployeePreferences(employeeId: string): Promise<EmployeePreference> {
  await new Promise((r) => setTimeout(r, 200));
  return (
    MOCK_EMPLOYEE_PREFERENCES[employeeId] ?? {
      employeeId,
      preferredShifts: ['MORNING'],
      avoidShifts: [],
      preferredDaysOff: [0, 6],
      maxHoursPerWeek: 40,
      minHoursPerWeek: 32,
      canWorkNights: false,
      canWorkWeekends: false,
      canWorkHolidays: false,
      remoteWorkDays: [],
      blackoutDates: [],
      notes: '',
    }
  );
}

/**
 * Run a what-if scenario simulation to assess schedule change impact.
 */
export async function runWhatIfScenario(scenario: WhatIfScenario): Promise<ScenarioImpact> {
  await new Promise((r) => setTimeout(r, 600));

  // Simulate impact calculations based on scenario changes
  let coverageChange = 0;
  let costChange = 0;
  let overtimeChange = 0;
  const warnings: string[] = [];

  for (const change of scenario.changes) {
    switch (change.changeType) {
      case 'ADD_EMPLOYEE':
        coverageChange += 12;
        costChange += (165000 / 52) * 4; // 4 weeks cost
        overtimeChange -= 8;
        break;
      case 'REMOVE_EMPLOYEE':
        coverageChange -= 15;
        costChange -= (120000 / 52) * 4;
        overtimeChange += 12;
        warnings.push('Removing this employee will create a coverage gap on weekends');
        break;
      case 'CHANGE_DEMAND':
        coverageChange += Number(change.value) > 0 ? -8 : 8;
        overtimeChange += Number(change.value) > 0 ? 16 : -8;
        break;
      case 'CHANGE_BUDGET':
        costChange = Number(change.value);
        if (costChange < 0)
          warnings.push('Budget reduction may require OT reduction or coverage gaps');
        break;
    }
  }

  return {
    coverageChange: parseFloat(coverageChange.toFixed(1)),
    costChange: Math.round(costChange),
    overtimeChange: parseFloat(overtimeChange.toFixed(1)),
    fatigueChange: overtimeChange > 0 ? overtimeChange * 1.5 : 0,
    fairnessChange: scenario.changes.length > 2 ? -5 : 0,
    feasible: warnings.every((w) => !w.includes('critical')),
    warnings,
  };
}

// ── Named export ───────────────────────────────────────────────────────────────

export const aiSchedulingService = {
  generateSchedule,
  getDemandForecast,
  checkFatigueRisk,
  getSkillMatrix,
  calculateFairnessScore,
  getEmployeePreferences,
  runWhatIfScenario,
};
