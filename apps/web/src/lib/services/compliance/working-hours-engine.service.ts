/**
 * Working Hours Engine Service
 * Comprehensive working hours management with Ramadan-aware scheduling,
 * country-specific overtime caps, Friday work rules, night shift detection,
 * break time enforcement, and weekly rest day compliance.
 *
 * Supported countries: UAE, KSA, Bahrain, Qatar, Oman, Kuwait, India
 * All rules derived from respective labour law frameworks.
 */

import type { SupportedCountryCode } from './types';
import { LabourLawService } from './labour-law.service';
import { HijriCalendarService } from './hijri-calendar.service';

// ============================================================================
// TYPES
// ============================================================================

export type OvertimeType = 'normal' | 'night' | 'holiday' | 'friday';

export interface WorkScheduleConfig {
  countryCode: SupportedCountryCode;
  standardHoursPerDay: number;
  standardHoursPerWeek: number;
  ramadanHoursPerDay: number | null;
  ramadanHoursPerWeek: number | null;
  maxOvertimePerDay: number | null;
  maxOvertimePerYear: number | null;
  weekendDays: string[];
  workWeekStartDay: string;
  nightShiftStart: string | null;
  nightShiftEnd: string | null;
  breakAfterConsecutiveHours: number;
  minimumBreakMinutes: number;
  fridayPayRate: number | null;
  message: string;
  messageAr: string;
}

export interface OvertimeCalculation {
  countryCode: SupportedCountryCode;
  date: Date;
  standardHours: number;
  actualHours: number;
  overtimeHours: number;
  overtimeType: OvertimeType;
  overtimeRate: number;
  isRamadan: boolean;
  isFriday: boolean;
  isNightShift: boolean;
  isCompliant: boolean;
  dailyOvertimeCap: number | null;
  annualOvertimeCap: number | null;
  baseSalaryPerHour: number | null;
  overtimeAmount: number | null;
  violations: OvertimeViolation[];
  message: string;
  messageAr: string;
}

export interface OvertimeViolation {
  code: string;
  severity: 'ERROR' | 'WARNING';
  message: string;
  messageAr: string;
  currentValue: number;
  maxAllowed: number;
}

export interface WorkingHoursValidation {
  isCompliant: boolean;
  countryCode: SupportedCountryCode;
  date: Date;
  hoursWorked: number;
  overtimeHours: number;
  standardHours: number;
  maxAllowedHours: number;
  isRamadan: boolean;
  isFriday: boolean;
  breakRequired: boolean;
  breakMinutes: number;
  issues: WorkingHoursIssue[];
  message: string;
  messageAr: string;
}

export interface WorkingHoursIssue {
  code: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  messageAr: string;
  field: string;
  currentValue: number;
  expectedValue: number;
  recommendation: string;
  recommendationAr: string;
}

export interface ShiftBreakRule {
  countryCode: SupportedCountryCode;
  consecutiveHours: number;
  breakRequired: boolean;
  minimumBreakMinutes: number;
  maximumContinuousWorkHours: number;
  additionalBreaks: AdditionalBreak[];
  message: string;
  messageAr: string;
}

export interface AdditionalBreak {
  afterHours: number;
  durationMinutes: number;
  isPaid: boolean;
  description: string;
  descriptionAr: string;
}

export interface WeeklyComplianceReport {
  countryCode: SupportedCountryCode;
  weekStartDate: Date;
  weekEndDate: Date;
  isCompliant: boolean;
  totalHoursWorked: number;
  standardWeeklyHours: number;
  maxWeeklyHours: number;
  totalOvertimeHours: number;
  restDaysCount: number;
  minimumRestDays: number;
  consecutiveRestHours: number;
  minimumConsecutiveRestHours: number;
  hasAdequateRest: boolean;
  isRamadanWeek: boolean;
  fridayWorkDetected: boolean;
  fridayCompensationRequired: boolean;
  issues: WeeklyComplianceIssue[];
  summary: string;
  summaryAr: string;
}

export interface WeeklyComplianceIssue {
  code: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  messageAr: string;
  recommendation: string;
  recommendationAr: string;
}

// ============================================================================
// INTERNAL COUNTRY CONFIGURATION
// ============================================================================

interface CountryWorkingHoursConfig {
  breakAfterHours: number;
  breakMinutes: number;
  maxContinuousHours: number;
  fridayRate: number | null;
  nightStart: string | null;
  nightEnd: string | null;
  nightRate: number;
  minRestDaysPerWeek: number;
  minConsecutiveRestHours: number;
  maxDailyOvertime: number | null;
  maxAnnualOvertime: number | null;
}

const COUNTRY_WORKING_HOURS_CONFIG: Record<SupportedCountryCode, CountryWorkingHoursConfig> = {
  AE: {
    breakAfterHours: 5,
    breakMinutes: 60,
    maxContinuousHours: 5,
    fridayRate: 1.50,
    nightStart: '21:00',
    nightEnd: '04:00',
    nightRate: 1.50,
    minRestDaysPerWeek: 1,
    minConsecutiveRestHours: 24,
    maxDailyOvertime: 2,
    maxAnnualOvertime: null,
  },
  SA: {
    breakAfterHours: 5,
    breakMinutes: 30,
    maxContinuousHours: 5,
    fridayRate: 1.50,
    nightStart: null,
    nightEnd: null,
    nightRate: 1.50,
    minRestDaysPerWeek: 1,
    minConsecutiveRestHours: 24,
    maxDailyOvertime: null,
    maxAnnualOvertime: 720,
  },
  BH: {
    breakAfterHours: 6,
    breakMinutes: 60,
    maxContinuousHours: 6,
    fridayRate: 1.50,
    nightStart: null,
    nightEnd: null,
    nightRate: 1.50,
    minRestDaysPerWeek: 1,
    minConsecutiveRestHours: 24,
    maxDailyOvertime: 2,
    maxAnnualOvertime: null,
  },
  QA: {
    breakAfterHours: 5,
    breakMinutes: 60,
    maxContinuousHours: 5,
    fridayRate: 1.50,
    nightStart: '21:00',
    nightEnd: '06:00',
    nightRate: 1.50,
    minRestDaysPerWeek: 1,
    minConsecutiveRestHours: 24,
    maxDailyOvertime: 2,
    maxAnnualOvertime: null,
  },
  OM: {
    breakAfterHours: 6,
    breakMinutes: 30,
    maxContinuousHours: 6,
    fridayRate: 1.50,
    nightStart: '21:00',
    nightEnd: '06:00',
    nightRate: 1.50,
    minRestDaysPerWeek: 1,
    minConsecutiveRestHours: 24,
    maxDailyOvertime: 2,
    maxAnnualOvertime: null,
  },
  KW: {
    breakAfterHours: 5,
    breakMinutes: 60,
    maxContinuousHours: 5,
    fridayRate: 1.50,
    nightStart: null,
    nightEnd: null,
    nightRate: 1.50,
    minRestDaysPerWeek: 1,
    minConsecutiveRestHours: 24,
    maxDailyOvertime: 2,
    maxAnnualOvertime: null,
  },
  IN: {
    breakAfterHours: 5,
    breakMinutes: 30,
    maxContinuousHours: 5,
    fridayRate: null, // Friday is a normal workday in India
    nightStart: '19:00',
    nightEnd: '06:00',
    nightRate: 2.00,
    minRestDaysPerWeek: 1,
    minConsecutiveRestHours: 24,
    maxDailyOvertime: 2, // Factories Act limit
    maxAnnualOvertime: null,
  },
};

// GCC country codes for Ramadan and Friday rules
const GCC_COUNTRIES: SupportedCountryCode[] = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'];

// ============================================================================
// WORKING HOURS ENGINE
// ============================================================================

export class WorkingHoursEngine {
  // --------------------------------------------------------------------------
  // DAILY WORKING HOURS CALCULATION
  // --------------------------------------------------------------------------

  /**
   * Calculate the standard daily working hours for a given country and date.
   * Automatically detects Ramadan for GCC countries and reduces hours accordingly.
   */
  static calculateDailyWorkingHours(
    countryCode: SupportedCountryCode,
    date: Date = new Date()
  ): {
    standardHours: number;
    isRamadan: boolean;
    ramadanHours: number | null;
    effectiveHours: number;
    message: string;
    messageAr: string;
  } {
    const config = LabourLawService.getConfig(countryCode);
    const isRamadan = GCC_COUNTRIES.includes(countryCode) && HijriCalendarService.isRamadan(date);
    const ramadanHours = config.workingHours.ramadanPerDay || null;

    const effectiveHours = isRamadan && ramadanHours
      ? ramadanHours
      : config.workingHours.standardPerDay;

    const message = isRamadan
      ? `Ramadan working hours apply: ${effectiveHours} hours/day (reduced from ${config.workingHours.standardPerDay} hours)`
      : `Standard working hours: ${effectiveHours} hours/day`;

    const messageAr = isRamadan
      ? `تُطبق ساعات العمل في رمضان: ${effectiveHours} ساعات/يوم (مخفضة من ${config.workingHours.standardPerDay} ساعات)`
      : `ساعات العمل القياسية: ${effectiveHours} ساعات/يوم`;

    return {
      standardHours: config.workingHours.standardPerDay,
      isRamadan,
      ramadanHours,
      effectiveHours,
      message,
      messageAr,
    };
  }

  // --------------------------------------------------------------------------
  // OVERTIME CALCULATION
  // --------------------------------------------------------------------------

  /**
   * Calculate overtime details including rate, amount, and compliance.
   * Considers Ramadan hours, Friday premium, night shift premium, and country caps.
   */
  static calculateOvertime(
    countryCode: SupportedCountryCode,
    actualHours: number,
    shiftHours: number,
    date: Date = new Date(),
    overtimeType: OvertimeType = 'normal'
  ): OvertimeCalculation {
    const config = LabourLawService.getConfig(countryCode);
    const countryConfig = COUNTRY_WORKING_HOURS_CONFIG[countryCode];
    const isRamadan = GCC_COUNTRIES.includes(countryCode) && HijriCalendarService.isRamadan(date);

    // Determine effective standard hours (Ramadan-adjusted)
    const standardHours = isRamadan && config.workingHours.ramadanPerDay
      ? config.workingHours.ramadanPerDay
      : config.workingHours.standardPerDay;

    // Calculate overtime hours
    const overtimeHours = Math.max(0, actualHours - shiftHours);

    // Determine if it is Friday
    const isFriday = date.getDay() === 5;

    // Determine effective overtime type
    let effectiveOvertimeType = overtimeType;
    if (isFriday && GCC_COUNTRIES.includes(countryCode) && overtimeType === 'normal') {
      effectiveOvertimeType = 'friday';
    }

    // Get overtime rate
    const overtimeRate = LabourLawService.calculateOvertimeRate(countryCode, effectiveOvertimeType);

    // Check compliance violations
    const violations: OvertimeViolation[] = [];

    // Daily overtime cap check
    if (countryConfig.maxDailyOvertime !== null && overtimeHours > countryConfig.maxDailyOvertime) {
      violations.push({
        code: 'DAILY_OT_EXCEEDED',
        severity: 'ERROR',
        message: `Daily overtime (${overtimeHours}h) exceeds maximum allowed (${countryConfig.maxDailyOvertime}h)`,
        messageAr: `العمل الإضافي اليومي (${overtimeHours} ساعة) يتجاوز الحد الأقصى المسموح (${countryConfig.maxDailyOvertime} ساعة)`,
        currentValue: overtimeHours,
        maxAllowed: countryConfig.maxDailyOvertime,
      });
    }

    const isCompliant = violations.filter(v => v.severity === 'ERROR').length === 0;

    const message = isCompliant
      ? `Overtime calculation: ${overtimeHours}h at ${overtimeRate * 100}% rate`
      : `Overtime violation: ${violations[0].message}`;

    const messageAr = isCompliant
      ? `حساب العمل الإضافي: ${overtimeHours} ساعة بمعدل ${overtimeRate * 100}%`
      : `مخالفة العمل الإضافي: ${violations[0].messageAr}`;

    return {
      countryCode,
      date,
      standardHours,
      actualHours,
      overtimeHours,
      overtimeType: effectiveOvertimeType,
      overtimeRate,
      isRamadan,
      isFriday,
      isNightShift: this.isNightShift(countryCode, null, null, date),
      isCompliant,
      dailyOvertimeCap: countryConfig.maxDailyOvertime,
      annualOvertimeCap: countryConfig.maxAnnualOvertime,
      baseSalaryPerHour: null, // Caller must provide for amount calculation
      overtimeAmount: null,    // Use calculateOvertimeAmount for monetary value
      violations,
      message,
      messageAr,
    };
  }

  // --------------------------------------------------------------------------
  // DAILY COMPLIANCE VALIDATION
  // --------------------------------------------------------------------------

  /**
   * Validate daily working hours compliance against labour law limits.
   * Checks total hours, overtime caps, break requirements, and Ramadan rules.
   */
  static validateDailyCompliance(
    countryCode: SupportedCountryCode,
    hoursWorked: number,
    overtimeHours: number,
    date: Date = new Date()
  ): WorkingHoursValidation {
    const config = LabourLawService.getConfig(countryCode);
    const countryConfig = COUNTRY_WORKING_HOURS_CONFIG[countryCode];
    const isRamadan = GCC_COUNTRIES.includes(countryCode) && HijriCalendarService.isRamadan(date);
    const isFriday = date.getDay() === 5;

    const standardHours = isRamadan && config.workingHours.ramadanPerDay
      ? config.workingHours.ramadanPerDay
      : config.workingHours.standardPerDay;

    const maxDailyOT = countryConfig.maxDailyOvertime ?? Infinity;
    const maxAllowedHours = standardHours + (countryConfig.maxDailyOvertime ?? 2);

    const breakRequired = hoursWorked > countryConfig.breakAfterHours;
    const breakMinutes = breakRequired ? countryConfig.breakMinutes : 0;

    const issues: WorkingHoursIssue[] = [];

    // Check: Total hours exceed maximum allowed
    if (hoursWorked > maxAllowedHours) {
      issues.push({
        code: 'EXCESS_DAILY_HOURS',
        severity: 'ERROR',
        message: `Total daily hours (${hoursWorked}) exceed maximum allowed (${maxAllowedHours})`,
        messageAr: `إجمالي الساعات اليومية (${hoursWorked}) يتجاوز الحد الأقصى المسموح (${maxAllowedHours})`,
        field: 'hoursWorked',
        currentValue: hoursWorked,
        expectedValue: maxAllowedHours,
        recommendation: `Reduce working hours to maximum ${maxAllowedHours} hours per day`,
        recommendationAr: `تقليل ساعات العمل إلى ${maxAllowedHours} ساعات كحد أقصى في اليوم`,
      });
    }

    // Check: Overtime exceeds daily cap
    if (countryConfig.maxDailyOvertime !== null && overtimeHours > countryConfig.maxDailyOvertime) {
      issues.push({
        code: 'EXCESS_DAILY_OVERTIME',
        severity: 'ERROR',
        message: `Daily overtime (${overtimeHours}h) exceeds cap (${countryConfig.maxDailyOvertime}h)`,
        messageAr: `العمل الإضافي اليومي (${overtimeHours} ساعة) يتجاوز الحد (${countryConfig.maxDailyOvertime} ساعة)`,
        field: 'overtimeHours',
        currentValue: overtimeHours,
        expectedValue: countryConfig.maxDailyOvertime,
        recommendation: `Maximum ${countryConfig.maxDailyOvertime} hours overtime per day allowed`,
        recommendationAr: `الحد الأقصى ${countryConfig.maxDailyOvertime} ساعات عمل إضافي في اليوم`,
      });
    }

    // Check: Ramadan hours violation
    if (isRamadan && config.workingHours.ramadanPerDay) {
      const ramadanMax = config.workingHours.ramadanPerDay + (countryConfig.maxDailyOvertime ?? 2);
      if (hoursWorked > ramadanMax) {
        issues.push({
          code: 'RAMADAN_HOURS_EXCEEDED',
          severity: 'ERROR',
          message: `Working hours during Ramadan (${hoursWorked}h) exceed reduced maximum (${ramadanMax}h)`,
          messageAr: `ساعات العمل خلال رمضان (${hoursWorked} ساعة) تتجاوز الحد المخفض (${ramadanMax} ساعة)`,
          field: 'hoursWorked',
          currentValue: hoursWorked,
          expectedValue: ramadanMax,
          recommendation: `During Ramadan, standard hours are ${config.workingHours.ramadanPerDay}h with max ${countryConfig.maxDailyOvertime ?? 2}h overtime`,
          recommendationAr: `خلال رمضان، ساعات العمل القياسية ${config.workingHours.ramadanPerDay} ساعة مع ${countryConfig.maxDailyOvertime ?? 2} ساعة عمل إضافي كحد أقصى`,
        });
      }
    }

    // Check: Break requirement not met (advisory)
    if (breakRequired) {
      issues.push({
        code: 'BREAK_REQUIRED',
        severity: 'INFO',
        message: `Mandatory break of ${breakMinutes} minutes required after ${countryConfig.breakAfterHours} consecutive hours`,
        messageAr: `استراحة إلزامية مدتها ${breakMinutes} دقيقة مطلوبة بعد ${countryConfig.breakAfterHours} ساعات متواصلة`,
        field: 'breakTime',
        currentValue: hoursWorked,
        expectedValue: countryConfig.breakAfterHours,
        recommendation: `Ensure a minimum ${breakMinutes}-minute break is provided`,
        recommendationAr: `تأكد من توفير استراحة لا تقل عن ${breakMinutes} دقيقة`,
      });
    }

    // Check: Friday work in GCC
    if (isFriday && GCC_COUNTRIES.includes(countryCode) && hoursWorked > 0) {
      issues.push({
        code: 'FRIDAY_WORK',
        severity: 'WARNING',
        message: `Friday work detected. Employee entitled to 150% pay or substitute rest day`,
        messageAr: `تم رصد عمل يوم الجمعة. يستحق الموظف 150% أجر أو يوم راحة بديل`,
        field: 'dayOfWeek',
        currentValue: hoursWorked,
        expectedValue: 0,
        recommendation: `Compensate with 150% overtime rate or grant substitute rest day`,
        recommendationAr: `التعويض بمعدل 150% للعمل الإضافي أو منح يوم راحة بديل`,
      });
    }

    const isCompliant = issues.filter(i => i.severity === 'ERROR').length === 0;

    const message = isCompliant
      ? `Daily compliance check passed: ${hoursWorked}h worked (standard: ${standardHours}h)`
      : `Daily compliance violation detected: ${issues.filter(i => i.severity === 'ERROR').length} error(s)`;

    const messageAr = isCompliant
      ? `اجتياز فحص الامتثال اليومي: ${hoursWorked} ساعة عمل (المعيار: ${standardHours} ساعة)`
      : `تم رصد مخالفة في الامتثال اليومي: ${issues.filter(i => i.severity === 'ERROR').length} خطأ/أخطاء`;

    return {
      isCompliant,
      countryCode,
      date,
      hoursWorked,
      overtimeHours,
      standardHours,
      maxAllowedHours,
      isRamadan,
      isFriday,
      breakRequired,
      breakMinutes,
      issues,
      message,
      messageAr,
    };
  }

  // --------------------------------------------------------------------------
  // WEEKLY COMPLIANCE VALIDATION
  // --------------------------------------------------------------------------

  /**
   * Validate weekly working hours and rest day compliance.
   * Checks total weekly hours, rest day minimum, and consecutive rest period.
   */
  static validateWeeklyCompliance(
    countryCode: SupportedCountryCode,
    weeklyHours: number,
    restDays: number,
    options?: {
      weekStartDate?: Date;
      consecutiveRestHours?: number;
      dailyHours?: number[];
      annualOvertimeSoFar?: number;
    }
  ): WeeklyComplianceReport {
    const config = LabourLawService.getConfig(countryCode);
    const countryConfig = COUNTRY_WORKING_HOURS_CONFIG[countryCode];

    const weekStartDate = options?.weekStartDate ?? new Date();
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const isRamadanWeek = GCC_COUNTRIES.includes(countryCode) && HijriCalendarService.isRamadan(weekStartDate);

    const standardWeeklyHours = isRamadanWeek && config.workingHours.ramadanPerWeek
      ? config.workingHours.ramadanPerWeek
      : config.workingHours.standardPerWeek;

    // Max weekly hours = standard + (dailyOT cap * workdays)
    const workDays = 7 - countryConfig.minRestDaysPerWeek;
    const maxWeeklyHours = standardWeeklyHours + ((countryConfig.maxDailyOvertime ?? 2) * workDays);

    const totalOvertimeHours = Math.max(0, weeklyHours - standardWeeklyHours);
    const consecutiveRestHours = options?.consecutiveRestHours ?? (restDays > 0 ? 24 * restDays : 0);

    const hasAdequateRest = restDays >= countryConfig.minRestDaysPerWeek &&
      consecutiveRestHours >= countryConfig.minConsecutiveRestHours;

    // Check for Friday work across the week
    let fridayWorkDetected = false;
    if (options?.dailyHours && GCC_COUNTRIES.includes(countryCode)) {
      // Determine which index in dailyHours is Friday
      const startDay = weekStartDate.getDay();
      for (let i = 0; i < (options.dailyHours.length); i++) {
        const dayOfWeek = (startDay + i) % 7;
        if (dayOfWeek === 5 && options.dailyHours[i] > 0) {
          fridayWorkDetected = true;
          break;
        }
      }
    }

    const fridayCompensationRequired = fridayWorkDetected && GCC_COUNTRIES.includes(countryCode);

    const issues: WeeklyComplianceIssue[] = [];

    // Check: Weekly hours exceed maximum
    if (weeklyHours > maxWeeklyHours) {
      issues.push({
        code: 'EXCESS_WEEKLY_HOURS',
        severity: 'ERROR',
        message: `Weekly hours (${weeklyHours}h) exceed maximum allowed (${maxWeeklyHours}h)`,
        messageAr: `ساعات العمل الأسبوعية (${weeklyHours} ساعة) تتجاوز الحد الأقصى (${maxWeeklyHours} ساعة)`,
        recommendation: `Reduce weekly hours to ${maxWeeklyHours} or below`,
        recommendationAr: `تقليل ساعات العمل الأسبوعية إلى ${maxWeeklyHours} أو أقل`,
      });
    }

    // Check: Insufficient rest days
    if (restDays < countryConfig.minRestDaysPerWeek) {
      issues.push({
        code: 'INSUFFICIENT_REST_DAYS',
        severity: 'ERROR',
        message: `Rest days (${restDays}) below minimum requirement (${countryConfig.minRestDaysPerWeek})`,
        messageAr: `أيام الراحة (${restDays}) أقل من الحد الأدنى المطلوب (${countryConfig.minRestDaysPerWeek})`,
        recommendation: `Ensure at least ${countryConfig.minRestDaysPerWeek} rest day(s) per week`,
        recommendationAr: `ضمان ${countryConfig.minRestDaysPerWeek} يوم/أيام راحة على الأقل في الأسبوع`,
      });
    }

    // Check: Insufficient consecutive rest
    if (consecutiveRestHours < countryConfig.minConsecutiveRestHours) {
      issues.push({
        code: 'INSUFFICIENT_CONSECUTIVE_REST',
        severity: 'ERROR',
        message: `Consecutive rest (${consecutiveRestHours}h) below required minimum (${countryConfig.minConsecutiveRestHours}h)`,
        messageAr: `الراحة المتواصلة (${consecutiveRestHours} ساعة) أقل من الحد الأدنى المطلوب (${countryConfig.minConsecutiveRestHours} ساعة)`,
        recommendation: `Provide at least ${countryConfig.minConsecutiveRestHours} consecutive hours of rest`,
        recommendationAr: `توفير ${countryConfig.minConsecutiveRestHours} ساعة راحة متواصلة على الأقل`,
      });
    }

    // Check: Annual overtime cap (KSA specific)
    if (countryConfig.maxAnnualOvertime !== null && options?.annualOvertimeSoFar !== undefined) {
      const projectedAnnual = options.annualOvertimeSoFar + totalOvertimeHours;
      if (projectedAnnual > countryConfig.maxAnnualOvertime) {
        issues.push({
          code: 'ANNUAL_OVERTIME_CAP_RISK',
          severity: 'WARNING',
          message: `Annual overtime (${projectedAnnual}h) approaching or exceeding cap (${countryConfig.maxAnnualOvertime}h/year)`,
          messageAr: `العمل الإضافي السنوي (${projectedAnnual} ساعة) يقترب أو يتجاوز الحد (${countryConfig.maxAnnualOvertime} ساعة/سنة)`,
          recommendation: `Monitor annual overtime to stay within ${countryConfig.maxAnnualOvertime}h limit`,
          recommendationAr: `مراقبة العمل الإضافي السنوي للبقاء ضمن حد ${countryConfig.maxAnnualOvertime} ساعة`,
        });
      }
    }

    // Check: Ramadan weekly hours
    if (isRamadanWeek && config.workingHours.ramadanPerWeek && weeklyHours > config.workingHours.ramadanPerWeek) {
      issues.push({
        code: 'RAMADAN_WEEKLY_HOURS_EXCEEDED',
        severity: 'WARNING',
        message: `Weekly hours during Ramadan (${weeklyHours}h) exceed reduced limit (${config.workingHours.ramadanPerWeek}h)`,
        messageAr: `ساعات العمل الأسبوعية خلال رمضان (${weeklyHours} ساعة) تتجاوز الحد المخفض (${config.workingHours.ramadanPerWeek} ساعة)`,
        recommendation: `Adjust schedule to comply with Ramadan reduced hours`,
        recommendationAr: `تعديل الجدول للامتثال لساعات رمضان المخفضة`,
      });
    }

    // Check: Friday work compensation
    if (fridayCompensationRequired) {
      issues.push({
        code: 'FRIDAY_COMPENSATION_REQUIRED',
        severity: 'INFO',
        message: `Friday work detected. Employee must receive 150% pay or a substitute rest day`,
        messageAr: `تم رصد عمل يوم الجمعة. يجب أن يحصل الموظف على 150% أجر أو يوم راحة بديل`,
        recommendation: `Apply Friday overtime rate (150%) or provide substitute day off`,
        recommendationAr: `تطبيق معدل العمل الإضافي ليوم الجمعة (150%) أو منح يوم إجازة بديل`,
      });
    }

    const isCompliant = issues.filter(i => i.severity === 'ERROR').length === 0;

    const summary = isCompliant
      ? `Weekly compliance met: ${weeklyHours}h worked, ${restDays} rest day(s), ${totalOvertimeHours}h overtime`
      : `Weekly compliance failed: ${issues.filter(i => i.severity === 'ERROR').length} violation(s) detected`;

    const summaryAr = isCompliant
      ? `تم استيفاء الامتثال الأسبوعي: ${weeklyHours} ساعة عمل، ${restDays} يوم/أيام راحة، ${totalOvertimeHours} ساعة عمل إضافي`
      : `فشل الامتثال الأسبوعي: تم رصد ${issues.filter(i => i.severity === 'ERROR').length} مخالفة/مخالفات`;

    return {
      countryCode,
      weekStartDate,
      weekEndDate,
      isCompliant,
      totalHoursWorked: weeklyHours,
      standardWeeklyHours,
      maxWeeklyHours,
      totalOvertimeHours,
      restDaysCount: restDays,
      minimumRestDays: countryConfig.minRestDaysPerWeek,
      consecutiveRestHours,
      minimumConsecutiveRestHours: countryConfig.minConsecutiveRestHours,
      hasAdequateRest,
      isRamadanWeek,
      fridayWorkDetected,
      fridayCompensationRequired,
      issues,
      summary,
      summaryAr,
    };
  }

  // --------------------------------------------------------------------------
  // BREAK REQUIREMENTS
  // --------------------------------------------------------------------------

  /**
   * Get break requirements for a country based on consecutive hours worked.
   * Returns detailed break rules including paid/unpaid status and additional breaks.
   */
  static getBreakRequirements(
    countryCode: SupportedCountryCode,
    consecutiveHours: number
  ): ShiftBreakRule {
    const countryConfig = COUNTRY_WORKING_HOURS_CONFIG[countryCode];
    const breakRequired = consecutiveHours >= countryConfig.breakAfterHours;

    const additionalBreaks: AdditionalBreak[] = [];

    // Primary break
    if (breakRequired) {
      additionalBreaks.push({
        afterHours: countryConfig.breakAfterHours,
        durationMinutes: countryConfig.breakMinutes,
        isPaid: false, // Breaks are generally unpaid across GCC and India
        description: `Mandatory rest break after ${countryConfig.breakAfterHours} consecutive hours of work`,
        descriptionAr: `استراحة إلزامية بعد ${countryConfig.breakAfterHours} ساعات عمل متواصلة`,
      });
    }

    // Additional break for extended shifts (over double the max continuous)
    if (consecutiveHours >= countryConfig.maxContinuousHours * 2) {
      additionalBreaks.push({
        afterHours: countryConfig.maxContinuousHours * 2,
        durationMinutes: Math.ceil(countryConfig.breakMinutes * 0.5),
        isPaid: false,
        description: `Additional break required for extended shift duration`,
        descriptionAr: `استراحة إضافية مطلوبة لفترة المناوبة الممتدة`,
      });
    }

    // Country-specific prayer break (GCC)
    if (GCC_COUNTRIES.includes(countryCode) && consecutiveHours >= 4) {
      additionalBreaks.push({
        afterHours: 4,
        durationMinutes: 15,
        isPaid: true,
        description: `Prayer break allowance (customary in GCC workplaces)`,
        descriptionAr: `وقت الصلاة (عرف سائد في أماكن العمل في دول مجلس التعاون)`,
      });
    }

    const message = breakRequired
      ? `Break of ${countryConfig.breakMinutes} minutes required after ${countryConfig.breakAfterHours} hours. Maximum continuous work: ${countryConfig.maxContinuousHours} hours.`
      : `No break required for ${consecutiveHours} consecutive hours (threshold: ${countryConfig.breakAfterHours} hours)`;

    const messageAr = breakRequired
      ? `استراحة ${countryConfig.breakMinutes} دقيقة مطلوبة بعد ${countryConfig.breakAfterHours} ساعات. الحد الأقصى للعمل المتواصل: ${countryConfig.maxContinuousHours} ساعات.`
      : `لا حاجة لاستراحة لمدة ${consecutiveHours} ساعات متواصلة (الحد: ${countryConfig.breakAfterHours} ساعات)`;

    return {
      countryCode,
      consecutiveHours,
      breakRequired,
      minimumBreakMinutes: breakRequired ? countryConfig.breakMinutes : 0,
      maximumContinuousWorkHours: countryConfig.maxContinuousHours,
      additionalBreaks,
      message,
      messageAr,
    };
  }

  // --------------------------------------------------------------------------
  // NIGHT SHIFT DETECTION
  // --------------------------------------------------------------------------

  /**
   * Determine if a shift falls within the night shift window for a country.
   * Night shift hours attract premium rates (typically 150% in GCC).
   *
   * @param countryCode - Country code
   * @param startTime - Shift start time in "HH:MM" format (24h), or null to use date
   * @param endTime - Shift end time in "HH:MM" format (24h), or null to use date
   * @param date - Optional date to check current time against night window
   */
  static isNightShift(
    countryCode: SupportedCountryCode,
    startTime: string | null,
    endTime: string | null,
    date?: Date
  ): boolean {
    const countryConfig = COUNTRY_WORKING_HOURS_CONFIG[countryCode];

    if (!countryConfig.nightStart || !countryConfig.nightEnd) {
      return false;
    }

    const nightStartMinutes = this.timeToMinutes(countryConfig.nightStart);
    const nightEndMinutes = this.timeToMinutes(countryConfig.nightEnd);

    // If we have explicit start/end times, check overlap
    if (startTime && endTime) {
      const shiftStartMinutes = this.timeToMinutes(startTime);
      const shiftEndMinutes = this.timeToMinutes(endTime);

      return this.hasNightOverlap(
        shiftStartMinutes,
        shiftEndMinutes,
        nightStartMinutes,
        nightEndMinutes
      );
    }

    // If only date is provided, check if current time is within night window
    if (date) {
      const currentMinutes = date.getHours() * 60 + date.getMinutes();
      return this.isWithinNightWindow(currentMinutes, nightStartMinutes, nightEndMinutes);
    }

    return false;
  }

  /**
   * Get the night shift configuration for a country.
   */
  static getNightShiftConfig(countryCode: SupportedCountryCode): {
    hasNightShiftRules: boolean;
    nightStart: string | null;
    nightEnd: string | null;
    nightRate: number;
    message: string;
    messageAr: string;
  } {
    const countryConfig = COUNTRY_WORKING_HOURS_CONFIG[countryCode];

    if (!countryConfig.nightStart || !countryConfig.nightEnd) {
      return {
        hasNightShiftRules: false,
        nightStart: null,
        nightEnd: null,
        nightRate: countryConfig.nightRate,
        message: `No specific night shift rules defined for this country`,
        messageAr: `لا توجد قواعد محددة للمناوبة الليلية في هذا البلد`,
      };
    }

    return {
      hasNightShiftRules: true,
      nightStart: countryConfig.nightStart,
      nightEnd: countryConfig.nightEnd,
      nightRate: countryConfig.nightRate,
      message: `Night shift: ${countryConfig.nightStart} to ${countryConfig.nightEnd} at ${countryConfig.nightRate * 100}% rate`,
      messageAr: `المناوبة الليلية: من ${countryConfig.nightStart} إلى ${countryConfig.nightEnd} بمعدل ${countryConfig.nightRate * 100}%`,
    };
  }

  // --------------------------------------------------------------------------
  // OVERTIME AMOUNT CALCULATION
  // --------------------------------------------------------------------------

  /**
   * Calculate the monetary overtime amount.
   *
   * Formula: baseSalary / (standardHoursPerDay * 30) * overtimeHours * rate
   * - UAE/GCC: hourly rate = (basic salary / 30 / standard hours)
   * - India: hourly rate = (basic + DA) / 26 / standard hours (double rate)
   */
  static calculateOvertimeAmount(
    baseSalary: number,
    overtimeHours: number,
    rate: number,
    options?: {
      countryCode?: SupportedCountryCode;
      workingDaysPerMonth?: number;
      standardHoursPerDay?: number;
    }
  ): {
    hourlyRate: number;
    overtimeRate: number;
    overtimeHours: number;
    overtimeAmount: number;
    totalCost: number;
    message: string;
    messageAr: string;
  } {
    const countryCode = options?.countryCode;
    const workingDaysPerMonth = options?.workingDaysPerMonth ?? 30;

    // Determine standard hours per day
    let standardHoursPerDay = options?.standardHoursPerDay ?? 8;
    if (countryCode) {
      const config = LabourLawService.getConfig(countryCode);
      standardHoursPerDay = config.workingHours.standardPerDay;
    }

    // Calculate base hourly rate
    const hourlyRate = baseSalary / workingDaysPerMonth / standardHoursPerDay;

    // Calculate overtime amount
    const overtimeRate = hourlyRate * rate;
    const overtimeAmount = overtimeRate * overtimeHours;

    return {
      hourlyRate: Math.round(hourlyRate * 100) / 100,
      overtimeRate: Math.round(overtimeRate * 100) / 100,
      overtimeHours,
      overtimeAmount: Math.round(overtimeAmount * 100) / 100,
      totalCost: Math.round(overtimeAmount * 100) / 100,
      message: `Overtime: ${overtimeHours}h x ${rate * 100}% of hourly rate (${hourlyRate.toFixed(2)}) = ${overtimeAmount.toFixed(2)}`,
      messageAr: `العمل الإضافي: ${overtimeHours} ساعة × ${rate * 100}% من الأجر بالساعة (${hourlyRate.toFixed(2)}) = ${overtimeAmount.toFixed(2)}`,
    };
  }

  // --------------------------------------------------------------------------
  // WORK SCHEDULE CONFIGURATION
  // --------------------------------------------------------------------------

  /**
   * Get the complete work schedule configuration for a country.
   */
  static getWorkScheduleConfig(countryCode: SupportedCountryCode): WorkScheduleConfig {
    const config = LabourLawService.getConfig(countryCode);
    const countryConfig = COUNTRY_WORKING_HOURS_CONFIG[countryCode];

    return {
      countryCode,
      standardHoursPerDay: config.workingHours.standardPerDay,
      standardHoursPerWeek: config.workingHours.standardPerWeek,
      ramadanHoursPerDay: config.workingHours.ramadanPerDay ?? null,
      ramadanHoursPerWeek: config.workingHours.ramadanPerWeek ?? null,
      maxOvertimePerDay: countryConfig.maxDailyOvertime,
      maxOvertimePerYear: countryConfig.maxAnnualOvertime,
      weekendDays: config.weekendDays,
      workWeekStartDay: config.workWeekStartDay,
      nightShiftStart: countryConfig.nightStart,
      nightShiftEnd: countryConfig.nightEnd,
      breakAfterConsecutiveHours: countryConfig.breakAfterHours,
      minimumBreakMinutes: countryConfig.breakMinutes,
      fridayPayRate: countryConfig.fridayRate,
      message: `Work schedule for ${config.countryName}: ${config.workingHours.standardPerDay}h/day, ${config.workingHours.standardPerWeek}h/week`,
      messageAr: `جدول العمل في ${config.countryNameAr}: ${config.workingHours.standardPerDay} ساعة/يوم، ${config.workingHours.standardPerWeek} ساعة/أسبوع`,
    };
  }

  // --------------------------------------------------------------------------
  // FRIDAY WORK RULES
  // --------------------------------------------------------------------------

  /**
   * Calculate Friday work compensation for GCC countries.
   * In GCC, Friday is the weekly rest day; work on Friday attracts 150% pay
   * or a substitute rest day must be provided.
   */
  static calculateFridayCompensation(
    countryCode: SupportedCountryCode,
    hoursWorkedOnFriday: number,
    baseSalary: number,
    options?: {
      substituteRestProvided?: boolean;
      standardHoursPerDay?: number;
    }
  ): {
    applies: boolean;
    hoursWorked: number;
    rate: number;
    compensationAmount: number;
    substituteRestRequired: boolean;
    message: string;
    messageAr: string;
  } {
    const countryConfig = COUNTRY_WORKING_HOURS_CONFIG[countryCode];

    // Friday rules only apply to GCC countries
    if (!GCC_COUNTRIES.includes(countryCode) || !countryConfig.fridayRate) {
      return {
        applies: false,
        hoursWorked: hoursWorkedOnFriday,
        rate: 1.0,
        compensationAmount: 0,
        substituteRestRequired: false,
        message: `Friday work rules do not apply in this country`,
        messageAr: `قواعد العمل يوم الجمعة لا تنطبق في هذا البلد`,
      };
    }

    if (hoursWorkedOnFriday <= 0) {
      return {
        applies: true,
        hoursWorked: 0,
        rate: countryConfig.fridayRate,
        compensationAmount: 0,
        substituteRestRequired: false,
        message: `No Friday work recorded`,
        messageAr: `لم يتم تسجيل عمل يوم الجمعة`,
      };
    }

    const config = LabourLawService.getConfig(countryCode);
    const standardHours = options?.standardHoursPerDay ?? config.workingHours.standardPerDay;
    const hourlyRate = baseSalary / 30 / standardHours;
    const compensationAmount = hourlyRate * hoursWorkedOnFriday * countryConfig.fridayRate;
    const substituteRestRequired = !options?.substituteRestProvided;

    const message = substituteRestRequired
      ? `Friday work: ${hoursWorkedOnFriday}h at ${countryConfig.fridayRate * 100}% = ${compensationAmount.toFixed(2)}. Substitute rest day required.`
      : `Friday work: ${hoursWorkedOnFriday}h at ${countryConfig.fridayRate * 100}% = ${compensationAmount.toFixed(2)}. Substitute rest day provided.`;

    const messageAr = substituteRestRequired
      ? `عمل يوم الجمعة: ${hoursWorkedOnFriday} ساعة بمعدل ${countryConfig.fridayRate * 100}% = ${compensationAmount.toFixed(2)}. يوم راحة بديل مطلوب.`
      : `عمل يوم الجمعة: ${hoursWorkedOnFriday} ساعة بمعدل ${countryConfig.fridayRate * 100}% = ${compensationAmount.toFixed(2)}. تم توفير يوم راحة بديل.`;

    return {
      applies: true,
      hoursWorked: hoursWorkedOnFriday,
      rate: countryConfig.fridayRate,
      compensationAmount: Math.round(compensationAmount * 100) / 100,
      substituteRestRequired,
      message,
      messageAr,
    };
  }

  // --------------------------------------------------------------------------
  // ANNUAL OVERTIME TRACKING (KSA SPECIFIC)
  // --------------------------------------------------------------------------

  /**
   * Check annual overtime compliance for countries with yearly caps (e.g., KSA 720h/year).
   */
  static checkAnnualOvertimeCompliance(
    countryCode: SupportedCountryCode,
    annualOvertimeHours: number,
    monthsElapsed: number = 12
  ): {
    hasAnnualCap: boolean;
    annualCap: number | null;
    currentHours: number;
    remainingHours: number | null;
    projectedAnnual: number;
    isCompliant: boolean;
    isAtRisk: boolean;
    message: string;
    messageAr: string;
  } {
    const countryConfig = COUNTRY_WORKING_HOURS_CONFIG[countryCode];

    if (countryConfig.maxAnnualOvertime === null) {
      return {
        hasAnnualCap: false,
        annualCap: null,
        currentHours: annualOvertimeHours,
        remainingHours: null,
        projectedAnnual: annualOvertimeHours,
        isCompliant: true,
        isAtRisk: false,
        message: `No annual overtime cap for this country`,
        messageAr: `لا يوجد حد أقصى سنوي للعمل الإضافي في هذا البلد`,
      };
    }

    const annualCap = countryConfig.maxAnnualOvertime;
    const remainingHours = Math.max(0, annualCap - annualOvertimeHours);
    const monthlyAverage = monthsElapsed > 0 ? annualOvertimeHours / monthsElapsed : 0;
    const projectedAnnual = monthsElapsed > 0 ? Math.round(monthlyAverage * 12) : annualOvertimeHours;
    const isCompliant = annualOvertimeHours <= annualCap;
    const isAtRisk = projectedAnnual > annualCap || annualOvertimeHours > annualCap * 0.85;

    let message: string;
    let messageAr: string;

    if (!isCompliant) {
      message = `VIOLATION: Annual overtime (${annualOvertimeHours}h) exceeds cap (${annualCap}h/year)`;
      messageAr = `مخالفة: العمل الإضافي السنوي (${annualOvertimeHours} ساعة) يتجاوز الحد (${annualCap} ساعة/سنة)`;
    } else if (isAtRisk) {
      message = `WARNING: On track to exceed annual cap. Current: ${annualOvertimeHours}h, Projected: ${projectedAnnual}h, Cap: ${annualCap}h`;
      messageAr = `تحذير: في طريقه لتجاوز الحد السنوي. الحالي: ${annualOvertimeHours} ساعة، المتوقع: ${projectedAnnual} ساعة، الحد: ${annualCap} ساعة`;
    } else {
      message = `Annual overtime compliant: ${annualOvertimeHours}h of ${annualCap}h used (${remainingHours}h remaining)`;
      messageAr = `الامتثال للعمل الإضافي السنوي: ${annualOvertimeHours} ساعة من ${annualCap} ساعة مستخدمة (${remainingHours} ساعة متبقية)`;
    }

    return {
      hasAnnualCap: true,
      annualCap,
      currentHours: annualOvertimeHours,
      remainingHours,
      projectedAnnual,
      isCompliant,
      isAtRisk,
      message,
      messageAr,
    };
  }

  // --------------------------------------------------------------------------
  // PRIVATE UTILITY METHODS
  // --------------------------------------------------------------------------

  /**
   * Convert time string "HH:MM" to minutes since midnight
   */
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  /**
   * Check if a shift time range overlaps with the night window.
   * Handles overnight windows (e.g., 21:00 to 04:00).
   */
  private static hasNightOverlap(
    shiftStart: number,
    shiftEnd: number,
    nightStart: number,
    nightEnd: number
  ): boolean {
    // Night window crosses midnight (e.g., 21:00 - 04:00)
    if (nightStart > nightEnd) {
      // Shift overlaps if it starts during night OR ends during night OR spans midnight
      if (shiftStart >= nightStart || shiftStart < nightEnd) return true;
      if (shiftEnd > nightStart || shiftEnd <= nightEnd) return true;

      // Shift crosses midnight
      if (shiftStart > shiftEnd) return true;

      return false;
    }

    // Night window within same day (e.g., 19:00 - 06:00 doesn't apply here)
    // Standard overlap check
    if (shiftStart < nightEnd && shiftEnd > nightStart) return true;

    // Handle shift crossing midnight
    if (shiftStart > shiftEnd) {
      if (shiftStart < nightEnd || nightStart < 1440) return true;
    }

    return false;
  }

  /**
   * Check if a time in minutes falls within the night window.
   * Handles overnight windows.
   */
  private static isWithinNightWindow(
    currentMinutes: number,
    nightStart: number,
    nightEnd: number
  ): boolean {
    // Night window crosses midnight
    if (nightStart > nightEnd) {
      return currentMinutes >= nightStart || currentMinutes < nightEnd;
    }

    // Night window within same day
    return currentMinutes >= nightStart && currentMinutes < nightEnd;
  }
}

export default WorkingHoursEngine;
