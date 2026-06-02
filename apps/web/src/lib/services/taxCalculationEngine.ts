/**
 * Tax Calculation Engine
 * Per-jurisdiction tax calculation for payroll processing
 *
 * Features:
 * - Federal income tax (progressive brackets)
 * - State income tax per jurisdiction
 * - FICA (Social Security + Medicare)
 * - Local/city taxes
 * - Pre-tax deduction handling
 * - Tax credit application
 * - Garnishment deduction priority ordering
 */

import { BaseService } from './base.service';

// ============================================================================
// TYPES
// ============================================================================

export interface TaxCalculationInput {
  employeeId: string;
  grossPay: number;
  payFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  filingStatus: 'single' | 'married_jointly' | 'married_separately' | 'head_of_household';
  allowances: number;
  additionalWithholding: number;
  preTaxDeductions: PreTaxDeduction[];
  jurisdiction: TaxJurisdiction;
  ytdEarnings: number;
  ytdFederalTax: number;
  ytdStateTax: number;
  ytdSocialSecurity: number;
  ytdMedicare: number;
}

export interface PreTaxDeduction {
  type: '401k' | '403b' | 'hsa' | 'fsa' | 'transit' | 'parking' | 'health_premium';
  amount: number;
}

export interface TaxJurisdiction {
  country: string;
  state: string;
  locality?: string;
}

export interface TaxCalculationResult {
  federalIncomeTax: number;
  stateIncomeTax: number;
  localTax: number;
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  futa: number;
  suta: number;
  totalEmployeeTax: number;
  totalEmployerTax: number;
  taxableIncome: number;
  effectiveRate: number;
  breakdown: TaxBreakdownItem[];
}

export interface TaxBreakdownItem {
  category: string;
  description: string;
  taxableAmount: number;
  rate: number;
  amount: number;
  paidBy: 'employee' | 'employer';
}

export interface GarnishmentOrder {
  id: string;
  type: GarnishmentType;
  priority: number;
  amount: number;
  amountType: 'fixed' | 'percentage';
  maxPercentage: number;
  remainingBalance: number | null;
}

export type GarnishmentType =
  | 'child_support'
  | 'tax_levy_irs'
  | 'tax_levy_state'
  | 'bankruptcy'
  | 'student_loan'
  | 'creditor'
  | 'other';

// ============================================================================
// TAX CONSTANTS
// ============================================================================

// Federal income tax brackets 2025 (single)
const FEDERAL_BRACKETS_SINGLE = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_MARRIED = [
  { min: 0, max: 23850, rate: 0.10 },
  { min: 23850, max: 96950, rate: 0.12 },
  { min: 96950, max: 206700, rate: 0.22 },
  { min: 206700, max: 394600, rate: 0.24 },
  { min: 394600, max: 501050, rate: 0.32 },
  { min: 501050, max: 751600, rate: 0.35 },
  { min: 751600, max: Infinity, rate: 0.37 },
];

// FICA rates
const SOCIAL_SECURITY_RATE = 0.062;
const SOCIAL_SECURITY_WAGE_BASE = 168600;
const MEDICARE_RATE = 0.0145;
const ADDITIONAL_MEDICARE_RATE = 0.009;
const ADDITIONAL_MEDICARE_THRESHOLD = 200000;

// FUTA (employer only)
const FUTA_RATE = 0.006;
const FUTA_WAGE_BASE = 7000;

// State tax rates (simplified - each state has own brackets)
const STATE_TAX_RATES: Record<string, { flatRate?: number; brackets?: Array<{ min: number; max: number; rate: number }> }> = {
  CA: {
    brackets: [
      { min: 0, max: 10412, rate: 0.01 },
      { min: 10412, max: 24684, rate: 0.02 },
      { min: 24684, max: 38959, rate: 0.04 },
      { min: 38959, max: 54081, rate: 0.06 },
      { min: 54081, max: 68350, rate: 0.08 },
      { min: 68350, max: 349137, rate: 0.093 },
      { min: 349137, max: 418961, rate: 0.103 },
      { min: 418961, max: 698271, rate: 0.113 },
      { min: 698271, max: Infinity, rate: 0.123 },
    ],
  },
  NY: {
    brackets: [
      { min: 0, max: 8500, rate: 0.04 },
      { min: 8500, max: 11700, rate: 0.045 },
      { min: 11700, max: 13900, rate: 0.0525 },
      { min: 13900, max: 80650, rate: 0.0585 },
      { min: 80650, max: 215400, rate: 0.0625 },
      { min: 215400, max: 1077550, rate: 0.0685 },
      { min: 1077550, max: Infinity, rate: 0.0965 },
    ],
  },
  TX: { flatRate: 0 }, // No state income tax
  FL: { flatRate: 0 }, // No state income tax
  WA: { flatRate: 0 }, // No state income tax
  NV: { flatRate: 0 }, // No state income tax
  IL: { flatRate: 0.0495 }, // Flat rate
  PA: { flatRate: 0.0307 }, // Flat rate
  MA: { flatRate: 0.05 }, // Flat rate
  CO: { flatRate: 0.044 }, // Flat rate
};

// Garnishment priority order (federal law)
const GARNISHMENT_PRIORITY: Record<GarnishmentType, number> = {
  child_support: 1,
  tax_levy_irs: 2,
  tax_levy_state: 3,
  bankruptcy: 4,
  student_loan: 5,
  creditor: 6,
  other: 7,
};

// ============================================================================
// TAX CALCULATION ENGINE
// ============================================================================

export class TaxCalculationEngine extends BaseService {
  constructor() {
    super('TaxCalculationEngine');
  }

  /**
   * Calculate all taxes for an employee's pay period
   */
  calculateTaxes(input: TaxCalculationInput): TaxCalculationResult {
    const breakdown: TaxBreakdownItem[] = [];

    // Calculate pre-tax deductions total
    const preTaxTotal = input.preTaxDeductions.reduce((sum, d) => sum + d.amount, 0);
    const taxableIncome = Math.max(0, input.grossPay - preTaxTotal);

    // Annualize for bracket calculation
    const annualizedIncome = this.annualize(taxableIncome, input.payFrequency);

    // 1. Federal Income Tax
    const federalTax = this.calculateFederalTax(annualizedIncome, input.filingStatus, input.payFrequency);
    breakdown.push({
      category: 'Federal Income Tax',
      description: `Filing status: ${input.filingStatus}`,
      taxableAmount: taxableIncome,
      rate: taxableIncome > 0 ? federalTax / taxableIncome : 0,
      amount: federalTax,
      paidBy: 'employee',
    });

    // 2. State Income Tax
    const stateTax = this.calculateStateTax(annualizedIncome, input.jurisdiction.state, input.payFrequency);
    breakdown.push({
      category: 'State Income Tax',
      description: `State: ${input.jurisdiction.state}`,
      taxableAmount: taxableIncome,
      rate: taxableIncome > 0 ? stateTax / taxableIncome : 0,
      amount: stateTax,
      paidBy: 'employee',
    });

    // 3. Local Tax
    const localTax = this.calculateLocalTax(taxableIncome, input.jurisdiction);
    if (localTax > 0) {
      breakdown.push({
        category: 'Local Tax',
        description: `Locality: ${input.jurisdiction.locality || 'N/A'}`,
        taxableAmount: taxableIncome,
        rate: taxableIncome > 0 ? localTax / taxableIncome : 0,
        amount: localTax,
        paidBy: 'employee',
      });
    }

    // 4. Social Security
    const ssRemaining = Math.max(0, SOCIAL_SECURITY_WAGE_BASE - input.ytdEarnings);
    const ssTaxableAmount = Math.min(input.grossPay, ssRemaining);
    const socialSecurity = ssTaxableAmount * SOCIAL_SECURITY_RATE;
    breakdown.push({
      category: 'Social Security',
      description: `Rate: ${(SOCIAL_SECURITY_RATE * 100).toFixed(1)}% up to $${SOCIAL_SECURITY_WAGE_BASE.toLocaleString()}`,
      taxableAmount: ssTaxableAmount,
      rate: SOCIAL_SECURITY_RATE,
      amount: socialSecurity,
      paidBy: 'employee',
    });

    // 5. Medicare
    const medicare = input.grossPay * MEDICARE_RATE;
    breakdown.push({
      category: 'Medicare',
      description: `Rate: ${(MEDICARE_RATE * 100).toFixed(2)}%`,
      taxableAmount: input.grossPay,
      rate: MEDICARE_RATE,
      amount: medicare,
      paidBy: 'employee',
    });

    // 6. Additional Medicare (over threshold)
    let additionalMedicare = 0;
    if (input.ytdEarnings + input.grossPay > ADDITIONAL_MEDICARE_THRESHOLD) {
      const excessAmount = Math.max(0, (input.ytdEarnings + input.grossPay) - ADDITIONAL_MEDICARE_THRESHOLD);
      const previousExcess = Math.max(0, input.ytdEarnings - ADDITIONAL_MEDICARE_THRESHOLD);
      const currentExcess = excessAmount - previousExcess;
      additionalMedicare = Math.max(0, currentExcess) * ADDITIONAL_MEDICARE_RATE;
      if (additionalMedicare > 0) {
        breakdown.push({
          category: 'Additional Medicare',
          description: `Rate: ${(ADDITIONAL_MEDICARE_RATE * 100).toFixed(1)}% on earnings over $${ADDITIONAL_MEDICARE_THRESHOLD.toLocaleString()}`,
          taxableAmount: currentExcess,
          rate: ADDITIONAL_MEDICARE_RATE,
          amount: additionalMedicare,
          paidBy: 'employee',
        });
      }
    }

    // 7. Employer FICA (matching)
    breakdown.push({
      category: 'Employer Social Security',
      description: 'Employer match',
      taxableAmount: ssTaxableAmount,
      rate: SOCIAL_SECURITY_RATE,
      amount: socialSecurity,
      paidBy: 'employer',
    });
    breakdown.push({
      category: 'Employer Medicare',
      description: 'Employer match',
      taxableAmount: input.grossPay,
      rate: MEDICARE_RATE,
      amount: medicare,
      paidBy: 'employer',
    });

    // 8. FUTA (employer only)
    const futaRemaining = Math.max(0, FUTA_WAGE_BASE - input.ytdEarnings);
    const futaTaxable = Math.min(input.grossPay, futaRemaining);
    const futa = futaTaxable * FUTA_RATE;
    if (futa > 0) {
      breakdown.push({
        category: 'FUTA',
        description: 'Federal Unemployment',
        taxableAmount: futaTaxable,
        rate: FUTA_RATE,
        amount: futa,
        paidBy: 'employer',
      });
    }

    // 9. SUTA (employer, varies by state)
    const sutaRate = this.getSUTARate(input.jurisdiction.state);
    const sutaWageBase = this.getSUTAWageBase(input.jurisdiction.state);
    const sutaRemaining = Math.max(0, sutaWageBase - input.ytdEarnings);
    const sutaTaxable = Math.min(input.grossPay, sutaRemaining);
    const suta = sutaTaxable * sutaRate;
    if (suta > 0) {
      breakdown.push({
        category: 'SUTA',
        description: `State Unemployment (${input.jurisdiction.state})`,
        taxableAmount: sutaTaxable,
        rate: sutaRate,
        amount: suta,
        paidBy: 'employer',
      });
    }

    const totalEmployeeTax = federalTax + stateTax + localTax + socialSecurity + medicare + additionalMedicare + input.additionalWithholding;
    const totalEmployerTax = socialSecurity + medicare + futa + suta;

    return {
      federalIncomeTax: federalTax,
      stateIncomeTax: stateTax,
      localTax,
      socialSecurity,
      medicare,
      additionalMedicare,
      futa,
      suta,
      totalEmployeeTax,
      totalEmployerTax,
      taxableIncome,
      effectiveRate: taxableIncome > 0 ? totalEmployeeTax / input.grossPay : 0,
      breakdown,
    };
  }

  // --------------------------------------------------------------------------
  // GARNISHMENT DEDUCTION PRIORITY ORDERING
  // --------------------------------------------------------------------------

  /**
   * Calculate garnishment deductions with federal priority ordering
   * Priority: 1) Child support, 2) IRS tax levy, 3) State tax levy,
   * 4) Bankruptcy, 5) Student loans, 6) Creditor garnishments, 7) Other
   */
  calculateGarnishments(params: {
    disposableEarnings: number;
    garnishments: GarnishmentOrder[];
  }): {
    deductions: Array<{ garnishmentId: string; type: GarnishmentType; priority: number; amount: number; reason?: string }>;
    totalDeducted: number;
    remainingDisposable: number;
    maxAllowable: number;
  } {
    const { disposableEarnings, garnishments } = params;

    // Sort by priority (federal ordering)
    const sorted = [...garnishments].sort((a, b) => {
      const priorityA = GARNISHMENT_PRIORITY[a.type] || 99;
      const priorityB = GARNISHMENT_PRIORITY[b.type] || 99;
      return priorityA - priorityB;
    });

    const deductions: Array<{ garnishmentId: string; type: GarnishmentType; priority: number; amount: number; reason?: string }> = [];
    let remaining = disposableEarnings;
    let totalDeducted = 0;

    // Federal minimum wage * 30 = protected amount (roughly $217.50/week)
    const weeklyMinWage = 7.25 * 30;
    const protectedAmount = weeklyMinWage;

    for (const garnishment of sorted) {
      if (remaining <= 0) {
        deductions.push({
          garnishmentId: garnishment.id,
          type: garnishment.type,
          priority: GARNISHMENT_PRIORITY[garnishment.type] || 99,
          amount: 0,
          reason: 'Insufficient disposable earnings',
        });
        continue;
      }

      // Calculate max allowable for this garnishment type
      const maxPercent = garnishment.maxPercentage / 100;
      const maxFromPercentage = disposableEarnings * maxPercent;

      // Calculate requested amount
      let requestedAmount: number;
      if (garnishment.amountType === 'percentage') {
        requestedAmount = disposableEarnings * (garnishment.amount / 100);
      } else {
        requestedAmount = garnishment.amount;
      }

      // Cap by remaining balance
      if (garnishment.remainingBalance !== null) {
        requestedAmount = Math.min(requestedAmount, garnishment.remainingBalance);
      }

      // Apply limits
      const allowable = Math.min(requestedAmount, maxFromPercentage, remaining);
      const protectionLimit = Math.max(0, remaining - protectedAmount);
      const finalAmount = garnishment.type === 'child_support'
        ? allowable // Child support can go up to 50-65% regardless of protection
        : Math.min(allowable, protectionLimit);

      deductions.push({
        garnishmentId: garnishment.id,
        type: garnishment.type,
        priority: GARNISHMENT_PRIORITY[garnishment.type] || 99,
        amount: Math.round(finalAmount * 100) / 100,
      });

      remaining -= finalAmount;
      totalDeducted += finalAmount;
    }

    return {
      deductions,
      totalDeducted: Math.round(totalDeducted * 100) / 100,
      remainingDisposable: Math.round(remaining * 100) / 100,
      maxAllowable: disposableEarnings * 0.25, // Default 25% for creditor garnishments
    };
  }

  // --------------------------------------------------------------------------
  // PRIVATE HELPERS
  // --------------------------------------------------------------------------

  private annualize(amount: number, frequency: TaxCalculationInput['payFrequency']): number {
    const multipliers = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };
    return amount * multipliers[frequency];
  }

  private deannualize(amount: number, frequency: TaxCalculationInput['payFrequency']): number {
    const multipliers = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };
    return amount / multipliers[frequency];
  }

  private calculateFederalTax(annualIncome: number, filingStatus: string, frequency: TaxCalculationInput['payFrequency']): number {
    const brackets = filingStatus === 'married_jointly' ? FEDERAL_BRACKETS_MARRIED : FEDERAL_BRACKETS_SINGLE;
    let annualTax = 0;

    for (const bracket of brackets) {
      if (annualIncome <= bracket.min) break;
      const taxableInBracket = Math.min(annualIncome, bracket.max) - bracket.min;
      annualTax += taxableInBracket * bracket.rate;
    }

    return Math.max(0, this.deannualize(annualTax, frequency));
  }

  private calculateStateTax(annualIncome: number, state: string, frequency: TaxCalculationInput['payFrequency']): number {
    const stateConfig = STATE_TAX_RATES[state];
    if (!stateConfig) return this.deannualize(annualIncome * 0.05, frequency); // Default 5%

    if (stateConfig.flatRate !== undefined) {
      return this.deannualize(annualIncome * stateConfig.flatRate, frequency);
    }

    if (stateConfig.brackets) {
      let annualTax = 0;
      for (const bracket of stateConfig.brackets) {
        if (annualIncome <= bracket.min) break;
        const taxableInBracket = Math.min(annualIncome, bracket.max) - bracket.min;
        annualTax += taxableInBracket * bracket.rate;
      }
      return this.deannualize(annualTax, frequency);
    }

    return 0;
  }

  private calculateLocalTax(periodIncome: number, jurisdiction: TaxJurisdiction): number {
    // Common local tax rates
    const localRates: Record<string, number> = {
      'New York City': 0.03876,
      'San Francisco': 0.015,
      Philadelphia: 0.038,
      Detroit: 0.024,
      Columbus: 0.025,
    };

    if (jurisdiction.locality && localRates[jurisdiction.locality]) {
      return periodIncome * localRates[jurisdiction.locality];
    }

    return 0;
  }

  private getSUTARate(state: string): number {
    // Simplified - actual rates vary by employer's experience rating
    const rates: Record<string, number> = {
      CA: 0.034, NY: 0.041, TX: 0.027, FL: 0.027,
      IL: 0.0325, PA: 0.0354, MA: 0.0175, WA: 0.0275,
    };
    return rates[state] || 0.03;
  }

  private getSUTAWageBase(state: string): number {
    const bases: Record<string, number> = {
      CA: 7000, NY: 12500, TX: 9000, FL: 7000,
      WA: 68500, MA: 15000, IL: 12960, PA: 10000,
    };
    return bases[state] || 7000;
  }
}

export const taxCalculationEngine = new TaxCalculationEngine();
