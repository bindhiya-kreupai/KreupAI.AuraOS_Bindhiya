/**
 * Labour Law Service
 * Provides country-specific labour law configurations and validations
 * for UAE, KSA, Bahrain, Qatar, Oman, Kuwait, and India
 */

import type {
  LabourLawConfig,
  SupportedCountryCode,
  ComplianceValidation,
  ComplianceIssue} from './types';
import {
  COUNTRY_NAMES,
  COUNTRY_CURRENCIES
} from './types';
import { HijriCalendarService } from './hijri-calendar.service';

// ============================================================================
// LABOUR LAW CONFIGURATIONS BY COUNTRY
// ============================================================================

/**
 * UAE Labour Law Configuration
 * Based on Federal Decree-Law No. 33 of 2021
 */
const UAE_LABOUR_LAW: LabourLawConfig = {
  countryCode: 'AE',
  countryName: COUNTRY_NAMES.AE.en,
  countryNameAr: COUNTRY_NAMES.AE.ar,
  currency: COUNTRY_CURRENCIES.AE,

  workingHours: {
    standardPerDay: 8,
    standardPerWeek: 48,
    ramadanPerDay: 6,
    ramadanPerWeek: 36,
    maxOvertimePerDay: 2,
  },

  overtimeRates: {
    normal: 1.25,      // 125%
    night: 1.50,       // 150% (9pm-4am)
    holiday: 1.50,     // 150%
    friday: 1.50,      // 150% or day off in lieu
    nightShiftStart: '21:00',
    nightShiftEnd: '04:00',
  },

  probation: {
    maxDays: 180,      // 6 months
    noticeDays: 14,    // 14-30 days based on who terminates
  },

  leave: {
    annualFirstYear: 2,    // 2 days per month
    annualAfterYears: 30,  // 30 days per year
    annualThresholdYears: 1,
    sickFullPay: 15,
    sickHalfPay: 30,
    sickUnpaid: 45,
    maternity: 60,
    maternityFullPay: 45,
    maternityHalfPay: 15,
    paternity: 5,
    bereavementSpouse: 5,
    bereavementFamily: 3,
    hajj: 30,              // Unpaid, once during employment
    study: 10,
    marriage: 5,           // UAE nationals
  },

  eosb: {
    firstPeriodYears: 5,
    firstPeriodDaysPerYear: 21,
    afterPeriodDaysPerYear: 30,
    maxMonths: 24,         // Cannot exceed 2 years salary
    resignationFactor1: 0.333,  // 1/3 for 1-3 years
    resignationFactor2: 0.666,  // 2/3 for 3-5 years
    minServiceMonths: 12,
    calculationBase: 'BASIC',
  },

  weekendDays: ['Friday', 'Saturday'],
  workWeekStartDay: 'Sunday',
};

/**
 * KSA Labour Law Configuration
 * Based on Saudi Labour Law (Royal Decree No. M/51)
 */
const KSA_LABOUR_LAW: LabourLawConfig = {
  countryCode: 'SA',
  countryName: COUNTRY_NAMES.SA.en,
  countryNameAr: COUNTRY_NAMES.SA.ar,
  currency: COUNTRY_CURRENCIES.SA,

  workingHours: {
    standardPerDay: 8,
    standardPerWeek: 48,
    ramadanPerDay: 6,
    ramadanPerWeek: 36,
    maxOvertimePerYear: 720,
  },

  overtimeRates: {
    normal: 1.50,      // 150%
    night: 1.50,
    holiday: 1.50,
  },

  probation: {
    maxDays: 90,
    extensionDays: 90,  // Can extend to 180 total
    noticeDays: 30,
  },

  leave: {
    annualFirstYear: 21,
    annualAfterYears: 30,
    annualThresholdYears: 5,
    sickFullPay: 30,
    sickHalfPay: 60,      // 75% pay
    sickUnpaid: 30,
    maternity: 70,        // 10 weeks
    maternityFullPay: 70,
    maternityHalfPay: 0,
    paternity: 3,
    bereavementSpouse: 5,
    bereavementFamily: 3,
    hajj: 15,             // 10-15 days, once after 2 years
    hajjMinServiceYears: 2,
    marriage: 5,
    iddah: 130,           // 4 months 10 days for widows
  },

  eosb: {
    firstPeriodYears: 5,
    firstPeriodDaysPerYear: 15,  // Half month
    afterPeriodDaysPerYear: 30,  // Full month
    resignationFactor1: 0.333,   // 1/3 for 2-5 years
    resignationFactor2: 0.666,   // 2/3 for 5-10 years
    minServiceMonths: 24,
    calculationBase: 'BASIC',
  },

  socialInsurance: {
    employeeRate: 0.105,    // 10.5% total for Saudis
    employerRate: 0.1175,   // 11.75% total for Saudis
    maxWage: 45000,
    pensionEmployeeRate: 0.0975,
    pensionEmployerRate: 0.0975,
    unemploymentEmployeeRate: 0.0075,
    unemploymentEmployerRate: 0.0075,
    occupationalHazardsRate: 0.02,
  },

  weekendDays: ['Friday', 'Saturday'],
  workWeekStartDay: 'Sunday',
};

/**
 * Bahrain Labour Law Configuration
 * Based on Labour Law No. 36 of 2012
 */
const BAHRAIN_LABOUR_LAW: LabourLawConfig = {
  countryCode: 'BH',
  countryName: COUNTRY_NAMES.BH.en,
  countryNameAr: COUNTRY_NAMES.BH.ar,
  currency: COUNTRY_CURRENCIES.BH,

  workingHours: {
    standardPerDay: 8,
    standardPerWeek: 48,
    ramadanPerDay: 6,
    ramadanPerWeek: 36,
  },

  overtimeRates: {
    normal: 1.25,
    night: 1.50,
    holiday: 1.50,
  },

  probation: {
    maxDays: 90,
    noticeDays: 30,
  },

  leave: {
    annualFirstYear: 30,
    annualAfterYears: 30,
    annualThresholdYears: 1,
    sickFullPay: 15,
    sickHalfPay: 20,
    sickUnpaid: 20,
    maternity: 60,
    maternityFullPay: 60,
    maternityHalfPay: 0,
    paternity: 1,
    bereavementSpouse: 3,
    bereavementFamily: 3,
    hajj: 14,
    hajjMinServiceYears: 5,
  },

  eosb: {
    firstPeriodYears: 3,
    firstPeriodDaysPerYear: 15,  // Half month
    afterPeriodDaysPerYear: 30,  // Full month
    minServiceMonths: 12,
    calculationBase: 'BASIC',
  },

  socialInsurance: {
    employeeRate: 0.07,
    employerRate: 0.12,
  },

  weekendDays: ['Friday', 'Saturday'],
  workWeekStartDay: 'Sunday',
};

/**
 * Qatar Labour Law Configuration
 * Based on Labour Law No. 14 of 2004
 */
const QATAR_LABOUR_LAW: LabourLawConfig = {
  countryCode: 'QA',
  countryName: COUNTRY_NAMES.QA.en,
  countryNameAr: COUNTRY_NAMES.QA.ar,
  currency: COUNTRY_CURRENCIES.QA,

  workingHours: {
    standardPerDay: 8,
    standardPerWeek: 48,
    ramadanPerDay: 6,
    ramadanPerWeek: 36,
  },

  overtimeRates: {
    normal: 1.25,
    night: 1.50,       // 9pm-6am
    holiday: 1.50,
    nightShiftStart: '21:00',
    nightShiftEnd: '06:00',
  },

  probation: {
    maxDays: 180,
    noticeDays: 30,
  },

  leave: {
    annualFirstYear: 21,   // 3 weeks
    annualAfterYears: 28,  // 4 weeks
    annualThresholdYears: 5,
    sickFullPay: 14,
    sickHalfPay: 28,
    sickUnpaid: 0,
    maternity: 50,
    maternityFullPay: 50,
    maternityHalfPay: 0,
    paternity: 3,
    bereavementSpouse: 7,
    bereavementFamily: 3,
    hajj: 14,
    hajjMinServiceYears: 5,
  },

  eosb: {
    firstPeriodYears: 0,
    firstPeriodDaysPerYear: 21,  // 3 weeks per year
    afterPeriodDaysPerYear: 21,
    minServiceMonths: 12,
    calculationBase: 'BASIC',
  },

  weekendDays: ['Friday', 'Saturday'],
  workWeekStartDay: 'Sunday',
};

/**
 * Oman Labour Law Configuration
 * Based on Labour Law (Royal Decree 35/2003)
 */
const OMAN_LABOUR_LAW: LabourLawConfig = {
  countryCode: 'OM',
  countryName: COUNTRY_NAMES.OM.en,
  countryNameAr: COUNTRY_NAMES.OM.ar,
  currency: COUNTRY_CURRENCIES.OM,

  workingHours: {
    standardPerDay: 9,
    standardPerWeek: 45,
    ramadanPerDay: 6,
    ramadanPerWeek: 30,
  },

  overtimeRates: {
    normal: 1.25,
    night: 1.50,
    holiday: 1.50,
  },

  probation: {
    maxDays: 90,
    noticeDays: 30,
  },

  leave: {
    annualFirstYear: 30,
    annualAfterYears: 30,
    annualThresholdYears: 1,
    sickFullPay: 10,    // 10 weeks at 100% then reducing
    sickHalfPay: 10,
    sickUnpaid: 32,
    maternity: 50,
    maternityFullPay: 50,
    maternityHalfPay: 0,
    paternity: 3,
    bereavementSpouse: 7,
    bereavementFamily: 3,
    hajj: 15,
    hajjMinServiceYears: 3,
  },

  eosb: {
    firstPeriodYears: 0,
    firstPeriodDaysPerYear: 15,  // 15 days per year for expats
    afterPeriodDaysPerYear: 15,
    minServiceMonths: 12,
    calculationBase: 'BASIC',
  },

  socialInsurance: {
    employeeRate: 0.07,     // For Omanis only
    employerRate: 0.115,
  },

  weekendDays: ['Friday', 'Saturday'],
  workWeekStartDay: 'Sunday',
};

/**
 * Kuwait Labour Law Configuration
 * Based on Labour Law No. 6 of 2010
 */
const KUWAIT_LABOUR_LAW: LabourLawConfig = {
  countryCode: 'KW',
  countryName: COUNTRY_NAMES.KW.en,
  countryNameAr: COUNTRY_NAMES.KW.ar,
  currency: COUNTRY_CURRENCIES.KW,

  workingHours: {
    standardPerDay: 8,
    standardPerWeek: 48,
    ramadanPerDay: 6,
    ramadanPerWeek: 36,
  },

  overtimeRates: {
    normal: 1.25,       // Plus additional hour pay per hour
    night: 1.50,
    holiday: 2.00,      // Double pay
  },

  probation: {
    maxDays: 100,
    noticeDays: 30,
  },

  leave: {
    annualFirstYear: 30,
    annualAfterYears: 30,
    annualThresholdYears: 1,
    sickFullPay: 15,
    sickHalfPay: 10,    // 75%
    sickUnpaid: 50,
    maternity: 70,
    maternityFullPay: 70,
    maternityHalfPay: 0,
    paternity: 3,
    bereavementSpouse: 5,
    bereavementFamily: 3,
    hajj: 21,
    hajjMinServiceYears: 2,
    marriage: 3,
    iddah: 130,
  },

  eosb: {
    firstPeriodYears: 5,
    firstPeriodDaysPerYear: 15,  // 15 days per year
    afterPeriodDaysPerYear: 30,  // 1 month per year
    minServiceMonths: 12,
    calculationBase: 'BASIC',
  },

  socialInsurance: {
    employeeRate: 0.08,     // For Kuwaitis only
    employerRate: 0.115,
  },

  weekendDays: ['Friday', 'Saturday'],
  workWeekStartDay: 'Sunday',
};

/**
 * India Labour Law Configuration
 * Based on various acts including Code on Wages 2019, Code on Social Security 2020
 */
const INDIA_LABOUR_LAW: LabourLawConfig = {
  countryCode: 'IN',
  countryName: COUNTRY_NAMES.IN.en,
  countryNameAr: COUNTRY_NAMES.IN.ar,
  currency: COUNTRY_CURRENCIES.IN,

  workingHours: {
    standardPerDay: 9,
    standardPerWeek: 48,
  },

  overtimeRates: {
    normal: 2.00,       // Double the ordinary rate
    night: 2.00,
    holiday: 2.00,
  },

  probation: {
    maxDays: 180,       // Typically 3-6 months
    noticeDays: 30,
  },

  leave: {
    annualFirstYear: 15,   // Earned leave varies by state
    annualAfterYears: 15,
    annualThresholdYears: 1,
    sickFullPay: 7,        // Varies by state
    sickHalfPay: 0,
    sickUnpaid: 0,
    maternity: 182,        // 26 weeks
    maternityFullPay: 182,
    maternityHalfPay: 0,
    paternity: 15,         // Central govt, not mandatory for private
    bereavementSpouse: 5,
    bereavementFamily: 3,
  },

  eosb: {
    firstPeriodYears: 0,
    firstPeriodDaysPerYear: 15,  // 15 days per year
    afterPeriodDaysPerYear: 15,
    minServiceMonths: 60,        // 5 years minimum for gratuity
    calculationBase: 'BASIC',
  },

  socialInsurance: {
    employeeRate: 0.12,     // PF contribution
    employerRate: 0.13,     // PF + Admin charges
  },

  weekendDays: ['Saturday', 'Sunday'],
  workWeekStartDay: 'Monday',
};

// ============================================================================
// LABOUR LAW CONFIGURATION MAP
// ============================================================================

const LABOUR_LAW_CONFIGS: Record<SupportedCountryCode, LabourLawConfig> = {
  AE: UAE_LABOUR_LAW,
  SA: KSA_LABOUR_LAW,
  BH: BAHRAIN_LABOUR_LAW,
  QA: QATAR_LABOUR_LAW,
  OM: OMAN_LABOUR_LAW,
  KW: KUWAIT_LABOUR_LAW,
  IN: INDIA_LABOUR_LAW,
};

// ============================================================================
// LABOUR LAW SERVICE
// ============================================================================

export class LabourLawService {
  /**
   * Get labour law configuration for a specific country
   */
  static getConfig(countryCode: SupportedCountryCode): LabourLawConfig {
    const config = LABOUR_LAW_CONFIGS[countryCode];
    if (!config) {
      throw new Error(`Labour law configuration not found for country: ${countryCode}`);
    }
    return config;
  }

  /**
   * Get all supported countries
   */
  static getSupportedCountries(): { code: SupportedCountryCode; name: string; nameAr: string }[] {
    return Object.entries(COUNTRY_NAMES).map(([code, names]) => ({
      code: code as SupportedCountryCode,
      name: names.en,
      nameAr: names.ar,
    }));
  }

  /**
   * Get GCC countries only
   */
  static getGCCCountries(): { code: SupportedCountryCode; name: string; nameAr: string }[] {
    const gccCodes: SupportedCountryCode[] = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW'];
    return gccCodes.map(code => ({
      code,
      name: COUNTRY_NAMES[code].en,
      nameAr: COUNTRY_NAMES[code].ar,
    }));
  }

  /**
   * Calculate annual leave entitlement based on years of service
   */
  static calculateAnnualLeave(countryCode: SupportedCountryCode, yearsOfService: number): number {
    const config = this.getConfig(countryCode);
    const { annualFirstYear, annualAfterYears, annualThresholdYears } = config.leave;

    if (countryCode === 'AE' && yearsOfService < 1) {
      // UAE: 2 days per month in first year
      return Math.floor(yearsOfService * 12) * 2;
    }

    if (yearsOfService >= annualThresholdYears) {
      return annualAfterYears;
    }

    return annualFirstYear;
  }

  /**
   * Calculate overtime rate based on type and country
   */
  static calculateOvertimeRate(
    countryCode: SupportedCountryCode,
    type: 'normal' | 'night' | 'holiday' | 'friday'
  ): number {
    const config = this.getConfig(countryCode);
    const { overtimeRates } = config;

    switch (type) {
      case 'normal':
        return overtimeRates.normal;
      case 'night':
        return overtimeRates.night;
      case 'holiday':
        return overtimeRates.holiday;
      case 'friday':
        return overtimeRates.friday || overtimeRates.holiday;
      default:
        return overtimeRates.normal;
    }
  }

  /**
   * Check if it's Ramadan period for reduced working hours
   * Uses the Hijri calendar service for accurate detection
   */
  static isRamadanPeriod(date: Date = new Date()): boolean {
    return HijriCalendarService.isRamadan(date);
  }

  /**
   * Get standard working hours considering Ramadan
   */
  static getWorkingHours(
    countryCode: SupportedCountryCode,
    date: Date = new Date()
  ): { perDay: number; perWeek: number } {
    const config = this.getConfig(countryCode);
    const { workingHours } = config;

    if (this.isRamadanPeriod(date) && workingHours.ramadanPerDay) {
      return {
        perDay: workingHours.ramadanPerDay,
        perWeek: workingHours.ramadanPerWeek || workingHours.ramadanPerDay * 6,
      };
    }

    return {
      perDay: workingHours.standardPerDay,
      perWeek: workingHours.standardPerWeek,
    };
  }

  /**
   * Check if employee is eligible for Hajj leave
   */
  static isEligibleForHajjLeave(
    countryCode: SupportedCountryCode,
    yearsOfService: number,
    religion: string,
    hasTakenHajjLeave: boolean
  ): { eligible: boolean; reason?: string; reasonAr?: string } {
    const config = this.getConfig(countryCode);
    const { hajj, hajjMinServiceYears } = config.leave;

    if (!hajj) {
      return { eligible: false, reason: 'Hajj leave not applicable in this country' };
    }

    if (religion.toLowerCase() !== 'islam' && religion.toLowerCase() !== 'muslim') {
      return { eligible: false, reason: 'Hajj leave is for Muslim employees only', reasonAr: 'إجازة الحج للموظفين المسلمين فقط' };
    }

    if (hasTakenHajjLeave) {
      return { eligible: false, reason: 'Hajj leave can only be taken once during employment', reasonAr: 'يمكن الحصول على إجازة الحج مرة واحدة فقط خلال فترة العمل' };
    }

    if (hajjMinServiceYears && yearsOfService < hajjMinServiceYears) {
      return {
        eligible: false,
        reason: `Minimum ${hajjMinServiceYears} years of service required`,
        reasonAr: `مطلوب ${hajjMinServiceYears} سنوات خدمة كحد أدنى`,
      };
    }

    return { eligible: true };
  }

  /**
   * Validate working hours compliance
   */
  static validateWorkingHours(
    countryCode: SupportedCountryCode,
    dailyHours: number,
    weeklyHours: number,
    overtimeHours: number,
    date: Date = new Date()
  ): ComplianceValidation {
    const config = this.getConfig(countryCode);
    const { workingHours } = config;
    const issues: ComplianceIssue[] = [];

    const isRamadan = this.isRamadanPeriod(date);
    const maxDaily = isRamadan && workingHours.ramadanPerDay
      ? workingHours.ramadanPerDay
      : workingHours.standardPerDay;
    const maxWeekly = isRamadan && workingHours.ramadanPerWeek
      ? workingHours.ramadanPerWeek
      : workingHours.standardPerWeek;

    if (dailyHours > maxDaily + (workingHours.maxOvertimePerDay || 2)) {
      issues.push({
        severity: 'ERROR',
        code: 'EXCESS_DAILY_HOURS',
        message: `Daily hours (${dailyHours}) exceed maximum allowed (${maxDaily + (workingHours.maxOvertimePerDay || 2)})`,
        messageAr: `ساعات العمل اليومية (${dailyHours}) تتجاوز الحد الأقصى المسموح به`,
        field: 'dailyHours',
        currentValue: dailyHours,
        expectedValue: maxDaily,
      });
    }

    if (weeklyHours > maxWeekly) {
      issues.push({
        severity: 'WARNING',
        code: 'EXCESS_WEEKLY_HOURS',
        message: `Weekly hours (${weeklyHours}) exceed standard (${maxWeekly})`,
        messageAr: `ساعات العمل الأسبوعية (${weeklyHours}) تتجاوز الحد المعياري`,
        field: 'weeklyHours',
        currentValue: weeklyHours,
        expectedValue: maxWeekly,
      });
    }

    if (workingHours.maxOvertimePerYear && overtimeHours > workingHours.maxOvertimePerYear) {
      issues.push({
        severity: 'ERROR',
        code: 'EXCESS_ANNUAL_OVERTIME',
        message: `Annual overtime (${overtimeHours}) exceeds maximum (${workingHours.maxOvertimePerYear})`,
        messageAr: `ساعات العمل الإضافي السنوية تتجاوز الحد الأقصى`,
        field: 'overtimeHours',
        currentValue: overtimeHours,
        expectedValue: workingHours.maxOvertimePerYear,
      });
    }

    return {
      isCompliant: issues.filter(i => i.severity === 'ERROR').length === 0,
      country: countryCode,
      category: 'WORKING_HOURS',
      issues,
    };
  }

  /**
   * Validate probation period
   */
  static validateProbation(
    countryCode: SupportedCountryCode,
    probationDays: number,
    hasExtension: boolean
  ): ComplianceValidation {
    const config = this.getConfig(countryCode);
    const { probation } = config;
    const issues: ComplianceIssue[] = [];

    const maxDays = hasExtension && probation.extensionDays
      ? probation.maxDays + probation.extensionDays
      : probation.maxDays;

    if (probationDays > maxDays) {
      issues.push({
        severity: 'ERROR',
        code: 'EXCESS_PROBATION',
        message: `Probation period (${probationDays} days) exceeds maximum (${maxDays} days)`,
        messageAr: `فترة الاختبار تتجاوز الحد الأقصى المسموح به`,
        field: 'probationDays',
        currentValue: probationDays,
        expectedValue: maxDays,
      });
    }

    return {
      isCompliant: issues.length === 0,
      country: countryCode,
      category: 'CONTRACT',
      issues,
    };
  }
}

export default LabourLawService;
