/**
 * India Statutory Compliance Service
 * Handles PF (Provident Fund), ESI (Employee State Insurance), TDS (Tax Deducted at Source),
 * Professional Tax, and LWF (Labour Welfare Fund) calculations
 *
 * Based on:
 * - Employees' Provident Fund Act, 1952
 * - Employees' State Insurance Act, 1948
 * - Income Tax Act, 1961
 * - Professional Tax Acts of various states
 * - Code on Wages, 2019
 * - Code on Social Security, 2020
 */

import { SupportedCountryCode } from './types';

// ============================================================================
// INDIA STATUTORY CONFIGURATION (FY 2024-25)
// ============================================================================

/**
 * Provident Fund (PF) Configuration
 * As per EPFO guidelines
 */
export interface PFConfiguration {
  employeeContributionRate: number;   // 12% of basic + DA
  employerContributionRate: number;   // 12% of basic + DA
  employerPFRate: number;             // 3.67% goes to PF
  employerEPSRate: number;            // 8.33% goes to EPS (Pension)
  adminCharges: number;               // 0.50%
  edliCharges: number;                // 0.50% EDLI
  edliAdminCharges: number;           // Included in admin
  wageCeiling: number;                // PF wage ceiling
  pensionWageCeiling: number;         // EPS wage ceiling (15,000)
  applicableThreshold: number;        // 20+ employees
}

export const PF_CONFIG: PFConfiguration = {
  employeeContributionRate: 0.12,      // 12%
  employerContributionRate: 0.12,      // 12%
  employerPFRate: 0.0367,              // 3.67%
  employerEPSRate: 0.0833,             // 8.33%
  adminCharges: 0.005,                 // 0.50%
  edliCharges: 0.005,                  // 0.50%
  edliAdminCharges: 0,                 // Now included in admin
  wageCeiling: 15000,                  // Basic + DA ceiling for contribution
  pensionWageCeiling: 15000,           // Pension scheme ceiling
  applicableThreshold: 20,             // Minimum 20 employees
};

/**
 * Employee State Insurance (ESI) Configuration
 * As per ESIC guidelines (2024-25)
 */
export interface ESIConfiguration {
  employeeContributionRate: number;   // 0.75%
  employerContributionRate: number;   // 3.25%
  wageCeiling: number;                // Applicable if gross <= 21,000
  applicableThreshold: number;        // 10+ employees
}

export const ESI_CONFIG: ESIConfiguration = {
  employeeContributionRate: 0.0075,    // 0.75%
  employerContributionRate: 0.0325,    // 3.25%
  wageCeiling: 21000,                  // Monthly wage ceiling
  applicableThreshold: 10,             // Minimum 10 employees
};

/**
 * Professional Tax Configuration by State
 */
export interface ProfessionalTaxSlab {
  minSalary: number;
  maxSalary: number | null;
  monthlyTax: number;
}

export interface StateProfessionalTax {
  stateCode: string;
  stateName: string;
  maxAnnualTax: number;
  slabs: ProfessionalTaxSlab[];
}

// Professional Tax slabs by state (major states)
export const PROFESSIONAL_TAX_BY_STATE: Record<string, StateProfessionalTax> = {
  MH: {
    stateCode: 'MH',
    stateName: 'Maharashtra',
    maxAnnualTax: 2500,
    slabs: [
      { minSalary: 0, maxSalary: 7500, monthlyTax: 0 },
      { minSalary: 7501, maxSalary: 10000, monthlyTax: 175 },
      { minSalary: 10001, maxSalary: null, monthlyTax: 200 }, // 300 for Feb
    ],
  },
  KA: {
    stateCode: 'KA',
    stateName: 'Karnataka',
    maxAnnualTax: 2500,
    slabs: [
      { minSalary: 0, maxSalary: 15000, monthlyTax: 0 },
      { minSalary: 15001, maxSalary: null, monthlyTax: 200 },
    ],
  },
  TN: {
    stateCode: 'TN',
    stateName: 'Tamil Nadu',
    maxAnnualTax: 2500,
    slabs: [
      { minSalary: 0, maxSalary: 21000, monthlyTax: 0 },
      { minSalary: 21001, maxSalary: 30000, monthlyTax: 135 },
      { minSalary: 30001, maxSalary: 45000, monthlyTax: 315 },
      { minSalary: 45001, maxSalary: 60000, monthlyTax: 690 },
      { minSalary: 60001, maxSalary: 75000, monthlyTax: 1025 },
      { minSalary: 75001, maxSalary: null, monthlyTax: 1250 },
    ],
  },
  WB: {
    stateCode: 'WB',
    stateName: 'West Bengal',
    maxAnnualTax: 2500,
    slabs: [
      { minSalary: 0, maxSalary: 10000, monthlyTax: 0 },
      { minSalary: 10001, maxSalary: 15000, monthlyTax: 110 },
      { minSalary: 15001, maxSalary: 25000, monthlyTax: 130 },
      { minSalary: 25001, maxSalary: 40000, monthlyTax: 150 },
      { minSalary: 40001, maxSalary: null, monthlyTax: 200 },
    ],
  },
  AP: {
    stateCode: 'AP',
    stateName: 'Andhra Pradesh',
    maxAnnualTax: 2500,
    slabs: [
      { minSalary: 0, maxSalary: 15000, monthlyTax: 0 },
      { minSalary: 15001, maxSalary: 20000, monthlyTax: 150 },
      { minSalary: 20001, maxSalary: null, monthlyTax: 200 },
    ],
  },
  TS: {
    stateCode: 'TS',
    stateName: 'Telangana',
    maxAnnualTax: 2500,
    slabs: [
      { minSalary: 0, maxSalary: 15000, monthlyTax: 0 },
      { minSalary: 15001, maxSalary: 20000, monthlyTax: 150 },
      { minSalary: 20001, maxSalary: null, monthlyTax: 200 },
    ],
  },
  GJ: {
    stateCode: 'GJ',
    stateName: 'Gujarat',
    maxAnnualTax: 2500,
    slabs: [
      { minSalary: 0, maxSalary: 5999, monthlyTax: 0 },
      { minSalary: 6000, maxSalary: 8999, monthlyTax: 80 },
      { minSalary: 9000, maxSalary: 11999, monthlyTax: 150 },
      { minSalary: 12000, maxSalary: null, monthlyTax: 200 },
    ],
  },
  KL: {
    stateCode: 'KL',
    stateName: 'Kerala',
    maxAnnualTax: 2500,
    slabs: [
      { minSalary: 0, maxSalary: 11999, monthlyTax: 0 },
      { minSalary: 12000, maxSalary: 17999, monthlyTax: 120 },
      { minSalary: 18000, maxSalary: 29999, monthlyTax: 180 },
      { minSalary: 30000, maxSalary: null, monthlyTax: 250 },
    ],
  },
  OR: {
    stateCode: 'OR',
    stateName: 'Odisha',
    maxAnnualTax: 2500,
    slabs: [
      { minSalary: 0, maxSalary: 13304, monthlyTax: 0 },
      { minSalary: 13305, maxSalary: 25000, monthlyTax: 150 },
      { minSalary: 25001, maxSalary: null, monthlyTax: 200 },
    ],
  },
  AS: {
    stateCode: 'AS',
    stateName: 'Assam',
    maxAnnualTax: 2500,
    slabs: [
      { minSalary: 0, maxSalary: 10000, monthlyTax: 0 },
      { minSalary: 10001, maxSalary: 15000, monthlyTax: 150 },
      { minSalary: 15001, maxSalary: null, monthlyTax: 250 },
    ],
  },
  MP: {
    stateCode: 'MP',
    stateName: 'Madhya Pradesh',
    maxAnnualTax: 2500,
    slabs: [
      { minSalary: 0, maxSalary: 18750, monthlyTax: 0 },
      { minSalary: 18751, maxSalary: null, monthlyTax: 208 }, // 2500/12
    ],
  },
};

/**
 * Income Tax Slabs for TDS (Old Regime - FY 2024-25)
 */
export interface TaxSlab {
  minIncome: number;
  maxIncome: number | null;
  rate: number;
  fixedAmount: number;
}

export const OLD_TAX_REGIME_SLABS: TaxSlab[] = [
  { minIncome: 0, maxIncome: 250000, rate: 0, fixedAmount: 0 },
  { minIncome: 250001, maxIncome: 500000, rate: 0.05, fixedAmount: 0 },
  { minIncome: 500001, maxIncome: 1000000, rate: 0.20, fixedAmount: 12500 },
  { minIncome: 1000001, maxIncome: null, rate: 0.30, fixedAmount: 112500 },
];

/**
 * Income Tax Slabs for TDS (New Regime - FY 2024-25)
 */
export const NEW_TAX_REGIME_SLABS: TaxSlab[] = [
  { minIncome: 0, maxIncome: 300000, rate: 0, fixedAmount: 0 },
  { minIncome: 300001, maxIncome: 700000, rate: 0.05, fixedAmount: 0 },
  { minIncome: 700001, maxIncome: 1000000, rate: 0.10, fixedAmount: 20000 },
  { minIncome: 1000001, maxIncome: 1200000, rate: 0.15, fixedAmount: 50000 },
  { minIncome: 1200001, maxIncome: 1500000, rate: 0.20, fixedAmount: 80000 },
  { minIncome: 1500001, maxIncome: null, rate: 0.30, fixedAmount: 140000 },
];

// Education Cess and Health Cess
export const CESS_RATE = 0.04; // 4%

// Standard Deduction (New Regime)
export const STANDARD_DEDUCTION = 75000;

// Section 87A Rebate Threshold (New Regime)
export const SECTION_87A_THRESHOLD = 700000;
export const SECTION_87A_MAX_REBATE = 25000;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface IndiaEmployeeData {
  employeeId: string;
  uanNumber?: string;
  pfAccountNumber?: string;
  esiNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  stateCode: string;
  basicSalary: number;
  dearnessAllowance: number;
  hra: number;
  otherAllowances: number;
  grossSalary: number;
  isNewTaxRegime: boolean;
  section80CDeductions?: number;
  section80DDeductions?: number;
  homeLoanInterest?: number;
  otherDeductions?: number;
}

export interface PFCalculationResult {
  contributableWage: number;
  employeeContribution: number;
  employerPFContribution: number;
  employerEPSContribution: number;
  totalEmployerContribution: number;
  adminCharges: number;
  edliCharges: number;
  totalEmployerCost: number;
  isVoluntaryHigher: boolean;
}

export interface ESICalculationResult {
  contributableWage: number;
  employeeContribution: number;
  employerContribution: number;
  totalContribution: number;
  isApplicable: boolean;
}

export interface ProfessionalTaxResult {
  stateCode: string;
  stateName: string;
  monthlyTax: number;
  isFebruaryAdjustment: boolean;
  annualTax: number;
}

export interface TDSCalculationResult {
  regime: 'OLD' | 'NEW';
  annualGrossSalary: number;
  exemptions: number;
  deductions: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebateUnder87A: number;
  taxAfterRebate: number;
  cess: number;
  totalTax: number;
  monthlyTDS: number;
  effectiveRate: number;
  slabBreakdown: { slab: string; taxableAmount: number; tax: number }[];
}

export interface IndiaStatutoryResult {
  employeeId: string;
  month: string;
  pf: PFCalculationResult;
  esi: ESICalculationResult;
  professionalTax: ProfessionalTaxResult;
  tds: TDSCalculationResult;
  totalEmployeeDeductions: number;
  totalEmployerCost: number;
  netPayable: number;
}

// ============================================================================
// INDIA STATUTORY SERVICE
// ============================================================================

export class IndiaStatutoryService {
  /**
   * Calculate Provident Fund contribution
   */
  static calculatePF(
    basicSalary: number,
    dearnessAllowance: number = 0,
    isVoluntaryHigherContribution: boolean = false
  ): PFCalculationResult {
    // PF is calculated on Basic + DA
    const pfWage = basicSalary + dearnessAllowance;

    // Contribution is capped at wage ceiling unless voluntary higher
    const contributableWage = isVoluntaryHigherContribution
      ? pfWage
      : Math.min(pfWage, PF_CONFIG.wageCeiling);

    // Employee contribution: 12%
    const employeeContribution = Math.round(contributableWage * PF_CONFIG.employeeContributionRate);

    // Employer contribution breakdown:
    // - 8.33% to EPS (capped at pension ceiling)
    // - 3.67% to EPF
    const pensionableWage = Math.min(contributableWage, PF_CONFIG.pensionWageCeiling);
    const employerEPSContribution = Math.round(pensionableWage * PF_CONFIG.employerEPSRate);
    const employerPFContribution = Math.round(contributableWage * PF_CONFIG.employerPFRate);

    // Admin charges on total PF wages
    const adminCharges = Math.round(contributableWage * PF_CONFIG.adminCharges);

    // EDLI charges
    const edliCharges = Math.round(contributableWage * PF_CONFIG.edliCharges);

    const totalEmployerContribution = employerPFContribution + employerEPSContribution;
    const totalEmployerCost = totalEmployerContribution + adminCharges + edliCharges;

    return {
      contributableWage,
      employeeContribution,
      employerPFContribution,
      employerEPSContribution,
      totalEmployerContribution,
      adminCharges,
      edliCharges,
      totalEmployerCost,
      isVoluntaryHigher: isVoluntaryHigherContribution,
    };
  }

  /**
   * Calculate ESI contribution
   */
  static calculateESI(grossSalary: number): ESICalculationResult {
    // ESI is applicable only if gross salary <= wage ceiling
    const isApplicable = grossSalary <= ESI_CONFIG.wageCeiling;

    if (!isApplicable) {
      return {
        contributableWage: 0,
        employeeContribution: 0,
        employerContribution: 0,
        totalContribution: 0,
        isApplicable: false,
      };
    }

    const contributableWage = grossSalary;
    const employeeContribution = Math.round(contributableWage * ESI_CONFIG.employeeContributionRate);
    const employerContribution = Math.round(contributableWage * ESI_CONFIG.employerContributionRate);

    return {
      contributableWage,
      employeeContribution,
      employerContribution,
      totalContribution: employeeContribution + employerContribution,
      isApplicable: true,
    };
  }

  /**
   * Calculate Professional Tax based on state
   */
  static calculateProfessionalTax(
    grossSalary: number,
    stateCode: string,
    isFebruary: boolean = false
  ): ProfessionalTaxResult {
    const stateConfig = PROFESSIONAL_TAX_BY_STATE[stateCode];

    if (!stateConfig) {
      return {
        stateCode,
        stateName: 'Unknown',
        monthlyTax: 0,
        isFebruaryAdjustment: false,
        annualTax: 0,
      };
    }

    // Find applicable slab
    const applicableSlab = stateConfig.slabs.find(
      slab => grossSalary >= slab.minSalary &&
              (slab.maxSalary === null || grossSalary <= slab.maxSalary)
    );

    let monthlyTax = applicableSlab?.monthlyTax || 0;

    // Special handling for Maharashtra - February adjustment
    let isFebruaryAdjustment = false;
    if (stateCode === 'MH' && isFebruary && grossSalary > 10000) {
      // In Feb, Maharashtra deducts 300 instead of 200 to reach 2500 annual
      monthlyTax = 300;
      isFebruaryAdjustment = true;
    }

    // Calculate annual tax based on 12 months standard rate
    const standardMonthlyTax = applicableSlab?.monthlyTax || 0;
    const annualTax = Math.min(standardMonthlyTax * 12, stateConfig.maxAnnualTax);

    return {
      stateCode,
      stateName: stateConfig.stateName,
      monthlyTax,
      isFebruaryAdjustment,
      annualTax,
    };
  }

  /**
   * Calculate TDS (Tax Deducted at Source)
   */
  static calculateTDS(
    annualGrossSalary: number,
    isNewRegime: boolean = true,
    deductions: {
      section80C?: number;      // Max 1.5L (Investments, Insurance, etc.)
      section80CCD1B?: number;  // Max 50K (NPS additional)
      section80D?: number;      // Health Insurance
      section24B?: number;      // Home Loan Interest
      section80E?: number;      // Education Loan
      hra?: number;             // HRA Exemption
      lta?: number;             // LTA Exemption
      otherExemptions?: number; // Other exemptions
    } = {}
  ): TDSCalculationResult {
    const slabs = isNewRegime ? NEW_TAX_REGIME_SLABS : OLD_TAX_REGIME_SLABS;

    // Calculate exemptions
    let totalExemptions = 0;
    let totalDeductions = 0;

    if (isNewRegime) {
      // New regime: Only standard deduction allowed
      totalDeductions = STANDARD_DEDUCTION;
    } else {
      // Old regime: Multiple deductions allowed
      totalDeductions = STANDARD_DEDUCTION +
        Math.min(deductions.section80C || 0, 150000) +
        Math.min(deductions.section80CCD1B || 0, 50000) +
        (deductions.section80D || 0) +
        Math.min(deductions.section24B || 0, 200000) +
        (deductions.section80E || 0);

      totalExemptions = (deductions.hra || 0) +
        (deductions.lta || 0) +
        (deductions.otherExemptions || 0);
    }

    // Calculate taxable income
    const taxableIncome = Math.max(0, annualGrossSalary - totalExemptions - totalDeductions);

    // Calculate tax based on slabs
    let taxBeforeRebate = 0;
    const slabBreakdown: { slab: string; taxableAmount: number; tax: number }[] = [];

    for (const slab of slabs) {
      if (taxableIncome <= slab.minIncome) continue;

      const slabMax = slab.maxIncome || taxableIncome;
      const taxableInSlab = Math.min(taxableIncome, slabMax) - slab.minIncome + 1;

      if (taxableInSlab > 0) {
        const taxForSlab = taxableInSlab * slab.rate;
        taxBeforeRebate += taxForSlab;

        slabBreakdown.push({
          slab: `${slab.minIncome} - ${slab.maxIncome || 'Above'}`,
          taxableAmount: taxableInSlab,
          tax: Math.round(taxForSlab),
        });
      }
    }

    // Apply Section 87A rebate (New Regime)
    let rebateUnder87A = 0;
    if (isNewRegime && taxableIncome <= SECTION_87A_THRESHOLD) {
      rebateUnder87A = Math.min(taxBeforeRebate, SECTION_87A_MAX_REBATE);
    }

    const taxAfterRebate = Math.max(0, taxBeforeRebate - rebateUnder87A);

    // Calculate cess (4% on tax)
    const cess = Math.round(taxAfterRebate * CESS_RATE);

    const totalTax = Math.round(taxAfterRebate + cess);
    const monthlyTDS = Math.round(totalTax / 12);

    const effectiveRate = annualGrossSalary > 0
      ? (totalTax / annualGrossSalary) * 100
      : 0;

    return {
      regime: isNewRegime ? 'NEW' : 'OLD',
      annualGrossSalary,
      exemptions: totalExemptions,
      deductions: totalDeductions,
      taxableIncome,
      taxBeforeRebate: Math.round(taxBeforeRebate),
      rebateUnder87A,
      taxAfterRebate: Math.round(taxAfterRebate),
      cess,
      totalTax,
      monthlyTDS,
      effectiveRate: Math.round(effectiveRate * 100) / 100,
      slabBreakdown,
    };
  }

  /**
   * Calculate all India statutory deductions for an employee
   */
  static calculateAll(
    employeeData: IndiaEmployeeData,
    month: string,
    annualGrossSalary?: number
  ): IndiaStatutoryResult {
    const isFebruary = month.endsWith('-02') || month.toLowerCase().includes('feb');

    // Calculate PF
    const pf = this.calculatePF(
      employeeData.basicSalary,
      employeeData.dearnessAllowance
    );

    // Calculate ESI
    const esi = this.calculateESI(employeeData.grossSalary);

    // Calculate Professional Tax
    const professionalTax = this.calculateProfessionalTax(
      employeeData.grossSalary,
      employeeData.stateCode,
      isFebruary
    );

    // Calculate TDS (based on annual salary)
    const annualSalary = annualGrossSalary || employeeData.grossSalary * 12;
    const tds = this.calculateTDS(
      annualSalary,
      employeeData.isNewTaxRegime,
      {
        section80C: employeeData.section80CDeductions,
        section80D: employeeData.section80DDeductions,
        section24B: employeeData.homeLoanInterest,
        otherExemptions: employeeData.otherDeductions,
      }
    );

    // Calculate totals
    const totalEmployeeDeductions =
      pf.employeeContribution +
      esi.employeeContribution +
      professionalTax.monthlyTax +
      tds.monthlyTDS;

    const totalEmployerCost =
      pf.totalEmployerCost +
      esi.employerContribution;

    const netPayable = employeeData.grossSalary - totalEmployeeDeductions;

    return {
      employeeId: employeeData.employeeId,
      month,
      pf,
      esi,
      professionalTax,
      tds,
      totalEmployeeDeductions,
      totalEmployerCost,
      netPayable,
    };
  }

  /**
   * Validate PAN number format
   */
  static validatePAN(pan: string): { isValid: boolean; error?: string } {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (!pan) {
      return { isValid: false, error: 'PAN number is required' };
    }

    if (!panRegex.test(pan.toUpperCase())) {
      return { isValid: false, error: 'Invalid PAN format (e.g., ABCDE1234F)' };
    }

    // Fourth character indicates category
    const categoryChar = pan[3];
    const validCategories = ['A', 'B', 'C', 'F', 'G', 'H', 'L', 'J', 'P', 'T', 'K'];
    if (!validCategories.includes(categoryChar)) {
      return { isValid: false, error: 'Invalid PAN category code' };
    }

    return { isValid: true };
  }

  /**
   * Validate Aadhaar number
   */
  static validateAadhaar(aadhaar: string): { isValid: boolean; error?: string } {
    const cleanAadhaar = aadhaar.replace(/\s/g, '');

    if (!cleanAadhaar) {
      return { isValid: false, error: 'Aadhaar number is required' };
    }

    if (!/^\d{12}$/.test(cleanAadhaar)) {
      return { isValid: false, error: 'Aadhaar must be 12 digits' };
    }

    // First digit cannot be 0 or 1
    if (cleanAadhaar[0] === '0' || cleanAadhaar[0] === '1') {
      return { isValid: false, error: 'Invalid Aadhaar number' };
    }

    return { isValid: true };
  }

  /**
   * Validate UAN (Universal Account Number)
   */
  static validateUAN(uan: string): { isValid: boolean; error?: string } {
    if (!uan) {
      return { isValid: false, error: 'UAN is required' };
    }

    if (!/^\d{12}$/.test(uan)) {
      return { isValid: false, error: 'UAN must be 12 digits' };
    }

    return { isValid: true };
  }

  /**
   * Get supported states for Professional Tax
   */
  static getSupportedStates(): { code: string; name: string }[] {
    return Object.entries(PROFESSIONAL_TAX_BY_STATE).map(([code, config]) => ({
      code,
      name: config.stateName,
    }));
  }

  /**
   * Compare Old vs New Tax Regime
   */
  static compareRegimes(
    annualGrossSalary: number,
    deductions: {
      section80C?: number;
      section80CCD1B?: number;
      section80D?: number;
      section24B?: number;
      hra?: number;
      lta?: number;
    } = {}
  ): {
    oldRegime: TDSCalculationResult;
    newRegime: TDSCalculationResult;
    recommendation: 'OLD' | 'NEW';
    savings: number;
  } {
    const oldRegime = this.calculateTDS(annualGrossSalary, false, deductions);
    const newRegime = this.calculateTDS(annualGrossSalary, true, {});

    const savings = oldRegime.totalTax - newRegime.totalTax;

    return {
      oldRegime,
      newRegime,
      recommendation: savings > 0 ? 'NEW' : 'OLD',
      savings: Math.abs(savings),
    };
  }

  /**
   * Generate Form 16 Part B summary
   */
  static generateForm16Summary(
    employeeId: string,
    financialYear: string,
    monthlyData: IndiaStatutoryResult[]
  ): {
    employeeId: string;
    financialYear: string;
    totalGrossSalary: number;
    totalPFDeducted: number;
    totalESIDeducted: number;
    totalPTDeducted: number;
    totalTDSDeducted: number;
    totalDeductions: number;
    taxableIncome: number;
    taxPayable: number;
    cessPayable: number;
    totalTaxPayable: number;
    refundDue: number;
  } {
    const totals = monthlyData.reduce(
      (acc, m) => ({
        grossSalary: acc.grossSalary + m.netPayable + m.totalEmployeeDeductions,
        pf: acc.pf + m.pf.employeeContribution,
        esi: acc.esi + m.esi.employeeContribution,
        pt: acc.pt + m.professionalTax.monthlyTax,
        tds: acc.tds + m.tds.monthlyTDS,
      }),
      { grossSalary: 0, pf: 0, esi: 0, pt: 0, tds: 0 }
    );

    // Recalculate annual tax
    const annualTDS = this.calculateTDS(totals.grossSalary, true);
    const refundDue = Math.max(0, totals.tds - annualTDS.totalTax);

    return {
      employeeId,
      financialYear,
      totalGrossSalary: totals.grossSalary,
      totalPFDeducted: totals.pf,
      totalESIDeducted: totals.esi,
      totalPTDeducted: totals.pt,
      totalTDSDeducted: totals.tds,
      totalDeductions: totals.pf + totals.esi + totals.pt + totals.tds,
      taxableIncome: annualTDS.taxableIncome,
      taxPayable: annualTDS.taxAfterRebate,
      cessPayable: annualTDS.cess,
      totalTaxPayable: annualTDS.totalTax,
      refundDue,
    };
  }

  /**
   * Get current PF configuration
   */
  static getPFConfig(): PFConfiguration {
    return { ...PF_CONFIG };
  }

  /**
   * Get current ESI configuration
   */
  static getESIConfig(): ESIConfiguration {
    return { ...ESI_CONFIG };
  }
}

export default IndiaStatutoryService;
