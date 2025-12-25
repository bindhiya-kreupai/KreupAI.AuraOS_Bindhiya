/**
 * EOSB (End of Service Benefits) / Gratuity Calculator
 * Calculates termination benefits for GCC countries and India
 */

import type {
  EOSBCalculationInput,
  EOSBCalculationResult,
  SupportedCountryCode} from './types';
import {
  TerminationType,
  COUNTRY_CURRENCIES,
} from './types';
import { LabourLawService } from './labour-law.service';

// ============================================================================
// EOSB SERVICE
// ============================================================================

export class EOSBService {
  /**
   * Calculate End of Service Benefits for an employee
   */
  static calculate(input: EOSBCalculationInput): EOSBCalculationResult {
    const { countryCode, joiningDate, lastWorkingDate, basicSalary, terminationType } = input;

    // Calculate service duration
    const serviceDuration = this.calculateServiceDuration(joiningDate, lastWorkingDate);

    // Get country-specific configuration
    const config = LabourLawService.getConfig(countryCode);
    const { eosb } = config;

    // Calculate daily rate (basic salary / 30 days)
    const dailyRate = basicSalary / 30;

    // Check minimum service requirement
    if (serviceDuration.totalMonths < eosb.minServiceMonths) {
      return this.createZeroResult(input, serviceDuration, dailyRate, {
        law: `${countryCode} Labour Law`,
        formula: 'N/A - Minimum service not met',
        notes: [`Minimum service of ${eosb.minServiceMonths} months required`],
        notesAr: [`الحد الأدنى للخدمة المطلوبة ${eosb.minServiceMonths} شهر`],
      });
    }

    // Calculate based on country-specific rules
    let result: EOSBCalculationResult;

    switch (countryCode) {
      case 'AE':
        result = this.calculateUAE(input, serviceDuration, dailyRate);
        break;
      case 'SA':
        result = this.calculateKSA(input, serviceDuration, dailyRate);
        break;
      case 'BH':
        result = this.calculateBahrain(input, serviceDuration, dailyRate);
        break;
      case 'QA':
        result = this.calculateQatar(input, serviceDuration, dailyRate);
        break;
      case 'OM':
        result = this.calculateOman(input, serviceDuration, dailyRate);
        break;
      case 'KW':
        result = this.calculateKuwait(input, serviceDuration, dailyRate);
        break;
      case 'IN':
        result = this.calculateIndia(input, serviceDuration, dailyRate);
        break;
      default:
        throw new Error(`EOSB calculation not supported for country: ${countryCode}`);
    }

    return result;
  }

  /**
   * Calculate service duration between two dates
   */
  private static calculateServiceDuration(startDate: Date, endDate: Date): {
    years: number;
    months: number;
    days: number;
    totalMonths: number;
    totalDays: number;
    fractionalYears: number;
  } {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalMonths = years * 12 + months;
    const fractionalYears = totalDays / 365.25;

    return { years, months, days, totalMonths, totalDays, fractionalYears };
  }

  /**
   * UAE EOSB Calculation
   * Based on Federal Decree-Law No. 33 of 2021
   */
  private static calculateUAE(
    input: EOSBCalculationInput,
    duration: ReturnType<typeof EOSBService.calculateServiceDuration>,
    dailyRate: number
  ): EOSBCalculationResult {
    const { employeeId, countryCode, basicSalary, terminationType } = input;
    const years = duration.fractionalYears;

    // First 5 years: 21 days per year
    const firstPeriodYears = Math.min(years, 5);
    const firstPeriodAmount = firstPeriodYears * 21 * dailyRate;

    // After 5 years: 30 days per year
    const secondPeriodYears = Math.max(0, years - 5);
    const secondPeriodAmount = secondPeriodYears * 30 * dailyRate;

    let grossAmount = firstPeriodAmount + secondPeriodAmount;

    // Cap at 2 years salary
    const maxGratuity = basicSalary * 24;
    grossAmount = Math.min(grossAmount, maxGratuity);

    // Resignation factor
    let resignationFactor = 1;
    if (terminationType === 'RESIGNATION') {
      if (years >= 1 && years < 3) {
        resignationFactor = 1 / 3;
      } else if (years >= 3 && years < 5) {
        resignationFactor = 2 / 3;
      }
      // 5+ years: full gratuity
    }

    const adjustedAmount = grossAmount * resignationFactor;
    const netAmount = adjustedAmount; // No standard deductions

    const notes: string[] = [];
    const notesAr: string[] = [];

    if (terminationType === 'RESIGNATION' && years < 5) {
      notes.push(`Resignation factor applied: ${Math.round(resignationFactor * 100)}%`);
      notesAr.push(`تم تطبيق معامل الاستقالة: ${Math.round(resignationFactor * 100)}%`);
    }

    if (grossAmount >= maxGratuity) {
      notes.push('Gratuity capped at 2 years salary');
      notesAr.push('تم تحديد سقف المكافأة بما يعادل راتب سنتين');
    }

    return {
      employeeId,
      countryCode,
      currency: COUNTRY_CURRENCIES.AE,
      yearsOfService: duration.years,
      monthsOfService: duration.totalMonths,
      daysOfService: duration.totalDays,
      basicSalary,
      dailyRate,
      firstPeriodYears,
      firstPeriodDays: Math.round(firstPeriodYears * 21),
      firstPeriodAmount,
      secondPeriodYears,
      secondPeriodDays: Math.round(secondPeriodYears * 30),
      secondPeriodAmount,
      grossAmount,
      terminationType,
      resignationFactor,
      adjustedAmount,
      deductions: 0,
      netAmount,
      calculationDetails: {
        law: 'UAE Federal Decree-Law No. 33 of 2021',
        formula: '(Years ≤ 5) × 21 days × Daily Rate + (Years > 5) × 30 days × Daily Rate',
        notes,
        notesAr,
      },
    };
  }

  /**
   * KSA EOSB Calculation
   * Based on Saudi Labour Law
   */
  private static calculateKSA(
    input: EOSBCalculationInput,
    duration: ReturnType<typeof EOSBService.calculateServiceDuration>,
    dailyRate: number
  ): EOSBCalculationResult {
    const { employeeId, countryCode, basicSalary, terminationType } = input;
    const years = duration.fractionalYears;

    // First 5 years: Half month (15 days) per year
    const firstPeriodYears = Math.min(years, 5);
    const firstPeriodAmount = firstPeriodYears * 15 * dailyRate;

    // After 5 years: Full month (30 days) per year
    const secondPeriodYears = Math.max(0, years - 5);
    const secondPeriodAmount = secondPeriodYears * 30 * dailyRate;

    const grossAmount = firstPeriodAmount + secondPeriodAmount;

    // Resignation factor
    let resignationFactor = 1;
    if (terminationType === 'RESIGNATION') {
      if (years < 2) {
        resignationFactor = 0; // No entitlement
      } else if (years >= 2 && years < 5) {
        resignationFactor = 1 / 3;
      } else if (years >= 5 && years < 10) {
        resignationFactor = 2 / 3;
      }
      // 10+ years: full gratuity
    }

    const adjustedAmount = grossAmount * resignationFactor;
    const netAmount = adjustedAmount;

    const notes: string[] = [];
    const notesAr: string[] = [];

    if (terminationType === 'RESIGNATION') {
      if (years < 2) {
        notes.push('No gratuity entitlement for resignation under 2 years');
        notesAr.push('لا يوجد استحقاق للمكافأة عند الاستقالة قبل سنتين');
      } else if (years < 10) {
        notes.push(`Resignation factor applied: ${Math.round(resignationFactor * 100)}%`);
        notesAr.push(`تم تطبيق معامل الاستقالة: ${Math.round(resignationFactor * 100)}%`);
      }
    }

    return {
      employeeId,
      countryCode,
      currency: COUNTRY_CURRENCIES.SA,
      yearsOfService: duration.years,
      monthsOfService: duration.totalMonths,
      daysOfService: duration.totalDays,
      basicSalary,
      dailyRate,
      firstPeriodYears,
      firstPeriodDays: Math.round(firstPeriodYears * 15),
      firstPeriodAmount,
      secondPeriodYears,
      secondPeriodDays: Math.round(secondPeriodYears * 30),
      secondPeriodAmount,
      grossAmount,
      terminationType,
      resignationFactor,
      adjustedAmount,
      deductions: 0,
      netAmount,
      calculationDetails: {
        law: 'Saudi Labour Law (Royal Decree No. M/51)',
        formula: '(Years ≤ 5) × 15 days × Daily Rate + (Years > 5) × 30 days × Daily Rate',
        notes,
        notesAr,
      },
    };
  }

  /**
   * Bahrain EOSB Calculation
   */
  private static calculateBahrain(
    input: EOSBCalculationInput,
    duration: ReturnType<typeof EOSBService.calculateServiceDuration>,
    dailyRate: number
  ): EOSBCalculationResult {
    const { employeeId, countryCode, basicSalary, terminationType } = input;
    const years = duration.fractionalYears;

    // First 3 years: 15 days per year
    const firstPeriodYears = Math.min(years, 3);
    const firstPeriodAmount = firstPeriodYears * 15 * dailyRate;

    // After 3 years: 30 days per year
    const secondPeriodYears = Math.max(0, years - 3);
    const secondPeriodAmount = secondPeriodYears * 30 * dailyRate;

    const grossAmount = firstPeriodAmount + secondPeriodAmount;
    const netAmount = grossAmount;

    return {
      employeeId,
      countryCode,
      currency: COUNTRY_CURRENCIES.BH,
      yearsOfService: duration.years,
      monthsOfService: duration.totalMonths,
      daysOfService: duration.totalDays,
      basicSalary,
      dailyRate,
      firstPeriodYears,
      firstPeriodDays: Math.round(firstPeriodYears * 15),
      firstPeriodAmount,
      secondPeriodYears,
      secondPeriodDays: Math.round(secondPeriodYears * 30),
      secondPeriodAmount,
      grossAmount,
      terminationType,
      resignationFactor: 1,
      adjustedAmount: grossAmount,
      deductions: 0,
      netAmount,
      calculationDetails: {
        law: 'Bahrain Labour Law No. 36 of 2012',
        formula: '(Years ≤ 3) × 15 days × Daily Rate + (Years > 3) × 30 days × Daily Rate',
        notes: [],
        notesAr: [],
      },
    };
  }

  /**
   * Qatar EOSB Calculation
   */
  private static calculateQatar(
    input: EOSBCalculationInput,
    duration: ReturnType<typeof EOSBService.calculateServiceDuration>,
    dailyRate: number
  ): EOSBCalculationResult {
    const { employeeId, countryCode, basicSalary, terminationType } = input;
    const years = duration.fractionalYears;

    // 3 weeks (21 days) per year for all years
    const firstPeriodYears = years;
    const firstPeriodAmount = years * 21 * dailyRate;

    const grossAmount = firstPeriodAmount;
    const netAmount = grossAmount;

    return {
      employeeId,
      countryCode,
      currency: COUNTRY_CURRENCIES.QA,
      yearsOfService: duration.years,
      monthsOfService: duration.totalMonths,
      daysOfService: duration.totalDays,
      basicSalary,
      dailyRate,
      firstPeriodYears,
      firstPeriodDays: Math.round(years * 21),
      firstPeriodAmount,
      secondPeriodYears: 0,
      secondPeriodDays: 0,
      secondPeriodAmount: 0,
      grossAmount,
      terminationType,
      resignationFactor: 1,
      adjustedAmount: grossAmount,
      deductions: 0,
      netAmount,
      calculationDetails: {
        law: 'Qatar Labour Law No. 14 of 2004',
        formula: 'Years × 21 days × Daily Rate',
        notes: [],
        notesAr: [],
      },
    };
  }

  /**
   * Oman EOSB Calculation
   */
  private static calculateOman(
    input: EOSBCalculationInput,
    duration: ReturnType<typeof EOSBService.calculateServiceDuration>,
    dailyRate: number
  ): EOSBCalculationResult {
    const { employeeId, countryCode, basicSalary, terminationType } = input;
    const years = duration.fractionalYears;

    // 15 days per year for expats
    const firstPeriodYears = years;
    const firstPeriodAmount = years * 15 * dailyRate;

    const grossAmount = firstPeriodAmount;
    const netAmount = grossAmount;

    return {
      employeeId,
      countryCode,
      currency: COUNTRY_CURRENCIES.OM,
      yearsOfService: duration.years,
      monthsOfService: duration.totalMonths,
      daysOfService: duration.totalDays,
      basicSalary,
      dailyRate,
      firstPeriodYears,
      firstPeriodDays: Math.round(years * 15),
      firstPeriodAmount,
      secondPeriodYears: 0,
      secondPeriodDays: 0,
      secondPeriodAmount: 0,
      grossAmount,
      terminationType,
      resignationFactor: 1,
      adjustedAmount: grossAmount,
      deductions: 0,
      netAmount,
      calculationDetails: {
        law: 'Oman Labour Law (Royal Decree 35/2003)',
        formula: 'Years × 15 days × Daily Rate',
        notes: ['Calculation for expatriate employees'],
        notesAr: ['الحساب للموظفين الوافدين'],
      },
    };
  }

  /**
   * Kuwait EOSB (Indemnity) Calculation
   */
  private static calculateKuwait(
    input: EOSBCalculationInput,
    duration: ReturnType<typeof EOSBService.calculateServiceDuration>,
    dailyRate: number
  ): EOSBCalculationResult {
    const { employeeId, countryCode, basicSalary, terminationType } = input;
    const years = duration.fractionalYears;

    // First 5 years: 15 days per year
    const firstPeriodYears = Math.min(years, 5);
    const firstPeriodAmount = firstPeriodYears * 15 * dailyRate;

    // After 5 years: 1 month (30 days) per year
    const secondPeriodYears = Math.max(0, years - 5);
    const secondPeriodAmount = secondPeriodYears * 30 * dailyRate;

    // Kuwait: Maximum cap of 1.5 years salary
    const maxIndemnity = basicSalary * 18;
    let grossAmount = firstPeriodAmount + secondPeriodAmount;
    grossAmount = Math.min(grossAmount, maxIndemnity);

    const netAmount = grossAmount;

    const notes: string[] = [];
    const notesAr: string[] = [];

    if (firstPeriodAmount + secondPeriodAmount > maxIndemnity) {
      notes.push('Indemnity capped at 1.5 years salary');
      notesAr.push('تم تحديد سقف التعويض بما يعادل راتب سنة ونصف');
    }

    return {
      employeeId,
      countryCode,
      currency: COUNTRY_CURRENCIES.KW,
      yearsOfService: duration.years,
      monthsOfService: duration.totalMonths,
      daysOfService: duration.totalDays,
      basicSalary,
      dailyRate,
      firstPeriodYears,
      firstPeriodDays: Math.round(firstPeriodYears * 15),
      firstPeriodAmount,
      secondPeriodYears,
      secondPeriodDays: Math.round(secondPeriodYears * 30),
      secondPeriodAmount,
      grossAmount,
      terminationType,
      resignationFactor: 1,
      adjustedAmount: grossAmount,
      deductions: 0,
      netAmount,
      calculationDetails: {
        law: 'Kuwait Labour Law No. 6 of 2010',
        formula: '(Years ≤ 5) × 15 days × Daily Rate + (Years > 5) × 30 days × Daily Rate',
        notes,
        notesAr,
      },
    };
  }

  /**
   * India Gratuity Calculation
   * Based on Payment of Gratuity Act, 1972
   */
  private static calculateIndia(
    input: EOSBCalculationInput,
    duration: ReturnType<typeof EOSBService.calculateServiceDuration>,
    dailyRate: number
  ): EOSBCalculationResult {
    const { employeeId, countryCode, basicSalary, terminationType } = input;

    // Minimum 5 years for gratuity eligibility (except death/disability)
    if (
      duration.fractionalYears < 5 &&
      terminationType !== 'DEATH' &&
      terminationType !== 'DISABILITY'
    ) {
      return this.createZeroResult(input, duration, dailyRate, {
        law: 'Payment of Gratuity Act, 1972',
        formula: 'N/A - Minimum 5 years service required',
        notes: ['Gratuity is payable only after 5 years of continuous service'],
        notesAr: ['المكافأة تستحق فقط بعد 5 سنوات من الخدمة المستمرة'],
      });
    }

    // Round up to complete years (6 months or more counts as full year)
    const years = duration.months >= 6 ? Math.ceil(duration.fractionalYears) : Math.floor(duration.fractionalYears);

    // Formula: (15 × Last Drawn Salary × Years) / 26
    const gratuityAmount = (15 * basicSalary * years) / 26;

    // Maximum gratuity: ₹20,00,000
    const maxGratuity = 2000000;
    const grossAmount = Math.min(gratuityAmount, maxGratuity);

    const notes: string[] = [];
    const notesAr: string[] = [];

    if (gratuityAmount > maxGratuity) {
      notes.push('Gratuity capped at ₹20,00,000 (statutory limit)');
      notesAr.push('تم تحديد سقف المكافأة بـ 20 لاخ روبية');
    }

    return {
      employeeId,
      countryCode,
      currency: COUNTRY_CURRENCIES.IN,
      yearsOfService: duration.years,
      monthsOfService: duration.totalMonths,
      daysOfService: duration.totalDays,
      basicSalary,
      dailyRate,
      firstPeriodYears: years,
      firstPeriodDays: Math.round(years * 15),
      firstPeriodAmount: grossAmount,
      secondPeriodYears: 0,
      secondPeriodDays: 0,
      secondPeriodAmount: 0,
      grossAmount,
      terminationType,
      resignationFactor: 1,
      adjustedAmount: grossAmount,
      deductions: 0,
      netAmount: grossAmount,
      calculationDetails: {
        law: 'Payment of Gratuity Act, 1972',
        formula: '(15 × Last Drawn Salary × Years of Service) / 26',
        notes,
        notesAr,
      },
    };
  }

  /**
   * Create zero result for ineligible employees
   */
  private static createZeroResult(
    input: EOSBCalculationInput,
    duration: ReturnType<typeof EOSBService.calculateServiceDuration>,
    dailyRate: number,
    details: EOSBCalculationResult['calculationDetails']
  ): EOSBCalculationResult {
    return {
      employeeId: input.employeeId,
      countryCode: input.countryCode,
      currency: COUNTRY_CURRENCIES[input.countryCode],
      yearsOfService: duration.years,
      monthsOfService: duration.totalMonths,
      daysOfService: duration.totalDays,
      basicSalary: input.basicSalary,
      dailyRate,
      firstPeriodYears: 0,
      firstPeriodDays: 0,
      firstPeriodAmount: 0,
      secondPeriodYears: 0,
      secondPeriodDays: 0,
      secondPeriodAmount: 0,
      grossAmount: 0,
      terminationType: input.terminationType,
      resignationFactor: 0,
      adjustedAmount: 0,
      deductions: 0,
      netAmount: 0,
      calculationDetails: details,
    };
  }

  /**
   * Get EOSB estimation for an active employee (preview)
   */
  static getEstimate(
    countryCode: SupportedCountryCode,
    joiningDate: Date,
    basicSalary: number
  ): { currentAmount: number; projections: { months: number; amount: number }[] } {
    const today = new Date();

    const current = this.calculate({
      employeeId: 'preview',
      countryCode,
      joiningDate,
      lastWorkingDate: today,
      basicSalary,
      terminationType: 'END_OF_CONTRACT',
    });

    // Project for 6, 12, 24, 36 months
    const projections = [6, 12, 24, 36].map(months => {
      const futureDate = new Date(today);
      futureDate.setMonth(futureDate.getMonth() + months);

      const projected = this.calculate({
        employeeId: 'preview',
        countryCode,
        joiningDate,
        lastWorkingDate: futureDate,
        basicSalary,
        terminationType: 'END_OF_CONTRACT',
      });

      return { months, amount: projected.netAmount };
    });

    return {
      currentAmount: current.netAmount,
      projections,
    };
  }
}

export default EOSBService;
