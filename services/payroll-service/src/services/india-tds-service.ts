/**
 * India TDS (Tax Deducted at Source) Service — Income Tax on Salaries
 *
 * TDS is deducted under Section 192 of the Income Tax Act, 1961.
 *
 * TAX SLABS — New Regime (default from FY 2023-24, Budget 2024 updates):
 *   0 – 3,00,000      : Nil
 *   3,00,001 – 7,00,000  : 5%
 *   7,00,001 – 10,00,000 : 10%
 *   10,00,001 – 12,00,000: 15%
 *   12,00,001 – 15,00,000: 20%
 *   15,00,001+           : 30%
 *   Standard deduction   : Rs 75,000 (Budget 2024 — increased from Rs 50,000)
 *   Rebate u/s 87A       : Full rebate if taxable income <= Rs 7,00,000 (new regime)
 *
 * TAX SLABS — Old Regime:
 *   0 – 2,50,000      : Nil
 *   2,50,001 – 5,00,000  : 5%
 *   5,00,001 – 10,00,000 : 20%
 *   10,00,001+           : 30%
 *   Standard deduction   : Rs 50,000
 *   Section 80C          : up to Rs 1,50,000 deduction
 *   Rebate u/s 87A       : Full rebate if taxable income <= Rs 5,00,000 (old regime)
 *
 * Health & Education Cess: 4% on income tax (after rebate)
 * Surcharge: 10% on income > Rs 50L; 15% > Rs 1Cr; 25% > Rs 2Cr; 37% > Rs 5Cr
 *
 * References: Finance Act 2024, CBDT Circular No. 1/2024
 */

import { z } from 'zod';
import Decimal from 'decimal.js';
import { prisma } from '@aura/database';

// ---------------------------------------------------------------------------
// Constants — New Regime Slabs (Budget 2024)
// ---------------------------------------------------------------------------

interface TaxSlab {
  from: Decimal;
  to: Decimal | null;  // null = unlimited
  rate: Decimal;
}

export const NEW_REGIME_SLABS: TaxSlab[] = [
  { from: new Decimal(0),       to: new Decimal(300000),  rate: new Decimal('0') },
  { from: new Decimal(300001),  to: new Decimal(700000),  rate: new Decimal('0.05') },
  { from: new Decimal(700001),  to: new Decimal(1000000), rate: new Decimal('0.10') },
  { from: new Decimal(1000001), to: new Decimal(1200000), rate: new Decimal('0.15') },
  { from: new Decimal(1200001), to: new Decimal(1500000), rate: new Decimal('0.20') },
  { from: new Decimal(1500001), to: null,                  rate: new Decimal('0.30') },
];

export const OLD_REGIME_SLABS: TaxSlab[] = [
  { from: new Decimal(0),       to: new Decimal(250000),  rate: new Decimal('0') },
  { from: new Decimal(250001),  to: new Decimal(500000),  rate: new Decimal('0.05') },
  { from: new Decimal(500001),  to: new Decimal(1000000), rate: new Decimal('0.20') },
  { from: new Decimal(1000001), to: null,                  rate: new Decimal('0.30') },
];

/** Standard deduction (Budget 2024 — new regime) */
export const STANDARD_DEDUCTION_NEW = new Decimal(75000);

/** Standard deduction (old regime) */
export const STANDARD_DEDUCTION_OLD = new Decimal(50000);

/** Maximum 80C deduction (old regime) */
export const MAX_80C_DEDUCTION = new Decimal(150000);

/** Rebate limit — new regime */
export const REBATE_LIMIT_NEW = new Decimal(700000);

/** Rebate limit — old regime */
export const REBATE_LIMIT_OLD = new Decimal(500000);

/** Health & Education Cess rate: 4% */
export const CESS_RATE = new Decimal('0.04');

// ---------------------------------------------------------------------------
// Surcharge thresholds
// ---------------------------------------------------------------------------

const SURCHARGE_THRESHOLDS = [
  { from: new Decimal(5000000),  to: new Decimal(10000000), rate: new Decimal('0.10') },
  { from: new Decimal(10000001), to: new Decimal(20000000), rate: new Decimal('0.15') },
  { from: new Decimal(20000001), to: new Decimal(50000000), rate: new Decimal('0.25') },
  { from: new Decimal(50000001), to: null,                   rate: new Decimal('0.37') },
];

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const TaxRegimeSchema = z.enum(['NEW', 'OLD']);

export const TDSCalculateSchema = z.object({
  employeeId: z.string().uuid(),
  financialYear: z.string().regex(/^\d{4}-\d{2,4}$/, 'e.g. 2024-25'),
  annualIncome: z.number().nonnegative(),
  regime: TaxRegimeSchema.default('NEW'),
  deductions: z
    .object({
      section80C: z.number().nonnegative().default(0),
      section80D: z.number().nonnegative().default(0),
      hra: z.number().nonnegative().default(0),
      lta: z.number().nonnegative().default(0),
      nps: z.number().nonnegative().default(0),      // 80CCD(1B) up to 50,000
      other: z.number().nonnegative().default(0),
    })
    .default({}),
});

export const Form16Schema = z.object({
  employeeId: z.string().uuid(),
  financialYear: z.string().regex(/^\d{4}-\d{2,4}$/),
});

export const TDSQuarterlySummarySchema = z.object({
  tenantId: z.string().uuid(),
  quarter: z.number().int().min(1).max(4),
  financialYear: z.string().regex(/^\d{4}-\d{2,4}$/),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TaxRegime = z.infer<typeof TaxRegimeSchema>;
export type TDSCalculateInput = z.infer<typeof TDSCalculateSchema>;
export type Form16Input = z.infer<typeof Form16Schema>;
export type TDSQuarterlySummaryInput = z.infer<typeof TDSQuarterlySummarySchema>;

export interface TaxSlabBreakdown {
  slabFrom: number;
  slabTo: number | null;
  rate: number;
  taxableInSlab: number;
  tax: number;
}

export interface TDSCalculationResult {
  employeeId: string;
  financialYear: string;
  regime: TaxRegime;

  // Income components
  grossAnnualIncome: Decimal;
  standardDeduction: Decimal;
  hraExemption: Decimal;
  ltaExemption: Decimal;
  section80C: Decimal;
  section80D: Decimal;
  section80CCD1B: Decimal;  // NPS contribution
  otherDeductions: Decimal;
  totalDeductions: Decimal;
  taxableIncome: Decimal;

  // Tax computation
  slabBreakdown: TaxSlabBreakdown[];
  grossTax: Decimal;
  surcharge: Decimal;
  surchargeRate: Decimal;
  taxAfterSurcharge: Decimal;
  rebateU87A: Decimal;
  taxAfterRebate: Decimal;
  cess: Decimal;
  totalTax: Decimal;

  // Monthly TDS
  monthlyTDS: Decimal;
  effectiveTaxRate: number; // % of gross income
}

export interface Form16Data {
  employeeId: string;
  employeeName: string;
  pan: string | null;
  financialYear: string;
  employer: {
    name: string;
    tan: string;
    address: string;
  };
  incomeDetails: {
    grossSalary: number;
    exemptions: number;
    netSalary: number;
    standardDeduction: number;
    taxableIncome: number;
  };
  deductionDetails: {
    section80C: number;
    section80D: number;
    section80CCD1B: number;
    totalDeductions: number;
  };
  taxComputation: {
    grossTax: number;
    surcharge: number;
    cess: number;
    rebate87A: number;
    totalTaxPayable: number;
    totalTDSDeducted: number;
  };
  generatedAt: string;
  financialYearStart: number;
  financialYearEnd: number;
}

export interface TDSQuarterlySummary {
  tenantId: string;
  financialYear: string;
  quarter: number;
  quarterPeriod: string;
  totalEmployees: number;
  totalGrossSalary: Decimal;
  totalTDSDeducted: Decimal;
  totalTDSDeposited: Decimal;
  pendingDeposit: Decimal;
  form24QStatus: 'NOT_FILED' | 'FILED' | 'PROCESSED';
  employees: Array<{
    employeeId: string;
    employeeName: string;
    pan: string | null;
    grossSalary: number;
    tdsDeducted: number;
    regime: TaxRegime;
  }>;
}

// ---------------------------------------------------------------------------
// Tax Calculation Helpers
// ---------------------------------------------------------------------------

function computeSlabTax(taxableIncome: Decimal, slabs: TaxSlab[]): {
  grossTax: Decimal;
  breakdown: TaxSlabBreakdown[];
} {
  let grossTax = new Decimal(0);
  const breakdown: TaxSlabBreakdown[] = [];

  for (const slab of slabs) {
    if (taxableIncome.lte(slab.from.minus(1))) break;

    const slabStart = slab.from;
    const slabEnd = slab.to ?? new Decimal(Infinity);
    const taxableInSlab = Decimal.min(taxableIncome, slabEnd).minus(slabStart.minus(1));
    const taxForSlab = taxableInSlab.gt(0)
      ? taxableInSlab.mul(slab.rate).toDecimalPlaces(2)
      : new Decimal(0);

    if (taxForSlab.gt(0) || slab.rate.gt(0)) {
      breakdown.push({
        slabFrom: slabStart.toNumber(),
        slabTo: slab.to?.toNumber() ?? null,
        rate: slab.rate.mul(100).toNumber(),
        taxableInSlab: Decimal.max(taxableInSlab, 0).toNumber(),
        tax: taxForSlab.toNumber(),
      });
    }

    grossTax = grossTax.plus(taxForSlab);
  }

  return { grossTax, breakdown };
}

function computeSurcharge(taxableIncome: Decimal, grossTax: Decimal): {
  surcharge: Decimal;
  surchargeRate: Decimal;
} {
  let surchargeRate = new Decimal(0);
  for (const threshold of SURCHARGE_THRESHOLDS) {
    if (taxableIncome.gt(threshold.from.minus(1))) {
      surchargeRate = threshold.rate;
    }
  }
  const surcharge = grossTax.mul(surchargeRate).toDecimalPlaces(2);
  return { surcharge, surchargeRate };
}

// ---------------------------------------------------------------------------
// India TDS Service
// ---------------------------------------------------------------------------

export class IndiaTDSService {
  /**
   * Calculate annual TDS for an employee given annual income and deductions.
   *
   * Supports both New Regime (default from FY2023-24) and Old Regime.
   * Monthly TDS = Annual Tax / 12 (spread evenly).
   */
  calculateTDS(input: TDSCalculateInput): TDSCalculationResult {
    const parsed = TDSCalculateSchema.parse(input);

    const gross = new Decimal(parsed.annualIncome);
    const regime = parsed.regime;
    const ded = parsed.deductions;

    // --- Standard deduction ---
    const standardDeduction =
      regime === 'NEW' ? STANDARD_DEDUCTION_NEW : STANDARD_DEDUCTION_OLD;

    // --- Other deductions ---
    // Old regime: 80C capped at 1.5L, HRA, LTA, NPS 80CCD(1B) up to 50K
    // New regime: Only standard deduction and NPS 80CCD(1B) up to 50K
    let section80C = new Decimal(0);
    let section80D = new Decimal(0);
    let hraExemption = new Decimal(0);
    let ltaExemption = new Decimal(0);
    const nps80CCD1B = Decimal.min(new Decimal(ded.nps ?? 0), new Decimal(50000));
    const otherDeductions = new Decimal(ded.other ?? 0);

    if (regime === 'OLD') {
      section80C = Decimal.min(new Decimal(ded.section80C ?? 0), MAX_80C_DEDUCTION);
      section80D = new Decimal(ded.section80D ?? 0);
      hraExemption = new Decimal(ded.hra ?? 0);
      ltaExemption = new Decimal(ded.lta ?? 0);
    }

    const totalDeductions = standardDeduction
      .plus(section80C)
      .plus(section80D)
      .plus(hraExemption)
      .plus(ltaExemption)
      .plus(nps80CCD1B)
      .plus(otherDeductions);

    // --- Taxable income ---
    const taxableIncome = Decimal.max(gross.minus(totalDeductions), new Decimal(0));

    // --- Slab tax ---
    const slabs = regime === 'NEW' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS;
    const { grossTax, breakdown } = computeSlabTax(taxableIncome, slabs);

    // --- Surcharge ---
    const { surcharge, surchargeRate } = computeSurcharge(taxableIncome, grossTax);
    const taxAfterSurcharge = grossTax.plus(surcharge);

    // --- Rebate u/s 87A ---
    const rebateLimit = regime === 'NEW' ? REBATE_LIMIT_NEW : REBATE_LIMIT_OLD;
    const rebateU87A = taxableIncome.lte(rebateLimit) ? taxAfterSurcharge : new Decimal(0);
    const taxAfterRebate = Decimal.max(taxAfterSurcharge.minus(rebateU87A), new Decimal(0));

    // --- Health & Education Cess ---
    const cess = taxAfterRebate.mul(CESS_RATE).toDecimalPlaces(2);
    const totalTax = taxAfterRebate.plus(cess).toDecimalPlaces(2);

    // --- Monthly TDS ---
    const monthlyTDS = totalTax.div(12).toDecimalPlaces(2);

    // --- Effective rate ---
    const effectiveTaxRate = gross.gt(0)
      ? totalTax.div(gross).mul(100).toDecimalPlaces(2).toNumber()
      : 0;

    return {
      employeeId: parsed.employeeId,
      financialYear: parsed.financialYear,
      regime,
      grossAnnualIncome: gross,
      standardDeduction,
      hraExemption,
      ltaExemption,
      section80C,
      section80D,
      section80CCD1B: nps80CCD1B,
      otherDeductions,
      totalDeductions,
      taxableIncome,
      slabBreakdown: breakdown,
      grossTax,
      surcharge,
      surchargeRate,
      taxAfterSurcharge,
      rebateU87A,
      taxAfterRebate,
      cess,
      totalTax,
      monthlyTDS,
      effectiveTaxRate,
    };
  }

  /**
   * Compare tax liability under Old vs New regime for a given income and deductions.
   * Helps employees choose the optimal regime.
   */
  compareRegimes(
    annualIncome: number,
    deductions: TDSCalculateInput['deductions']
  ): {
    newRegime: TDSCalculationResult;
    oldRegime: TDSCalculationResult;
    recommendation: 'NEW' | 'OLD';
    savingWithRecommended: Decimal;
  } {
    const baseInput: TDSCalculateInput = {
      employeeId: '00000000-0000-0000-0000-000000000000',
      financialYear: '2024-25',
      annualIncome,
      deductions: deductions ?? {},
      regime: 'NEW',
    };

    const newResult = this.calculateTDS({ ...baseInput, regime: 'NEW' });
    const oldResult = this.calculateTDS({ ...baseInput, regime: 'OLD' });

    const recommendation = newResult.totalTax.lte(oldResult.totalTax) ? 'NEW' : 'OLD';
    const savingWithRecommended = Decimal.max(
      oldResult.totalTax.minus(newResult.totalTax),
      newResult.totalTax.minus(oldResult.totalTax)
    );

    return {
      newRegime: newResult,
      oldRegime: oldResult,
      recommendation,
      savingWithRecommended,
    };
  }

  /**
   * Generate Form 16 (TDS certificate) data for an employee for a financial year.
   *
   * Form 16 has two parts:
   *  Part A: TDS deducted and deposited (from TRACES)
   *  Part B: Details of salary paid and deductions claimed
   *
   * This method returns the data required to render/download Form 16.
   */
  async generateForm16(employeeId: string, financialYear: string): Promise<Form16Data> {
    Form16Schema.parse({ employeeId, financialYear });

    // Fetch employee data
    let employee: any = null;
    let employeeName = 'Employee';
    let pan: string | null = null;

    try {
      employee = await (prisma as any).employee?.findUnique({
        where: { id: employeeId },
        include: {
          employeeCompliance: true,
          tenant: true,
        },
      });
      if (employee) {
        employeeName = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim();
        pan = employee.employeeCompliance?.pan ?? employee.pan ?? null;
      }
    } catch {
      // Continue with defaults
    }

    // Fetch annual TDS summary for the FY
    let annualIncome = 0;
    let tdsDeducted = 0;
    let regime: TaxRegime = 'NEW';
    let deductions = {};

    try {
      const tdsSummary = await (prisma as any).indiaTDSRecord?.findFirst({
        where: {
          employeeId,
          financialYear,
        },
      });
      if (tdsSummary) {
        annualIncome = Number(tdsSummary.grossAnnualIncome ?? 0);
        tdsDeducted = Number(tdsSummary.totalTDSDeducted ?? 0);
        regime = tdsSummary.regime ?? 'NEW';
        deductions = tdsSummary.deductions ?? {};
      }
    } catch {
      // Model may not exist yet
    }

    // Calculate tax for this employee
    const calc = this.calculateTDS({
      employeeId,
      financialYear,
      annualIncome,
      regime,
      deductions: deductions as any,
    });

    const fyStart = parseInt(financialYear.split('-')[0], 10);
    const fyEnd = fyStart + 1;

    return {
      employeeId,
      employeeName,
      pan,
      financialYear,
      employer: {
        name: employee?.tenant?.name ?? 'Employer',
        tan: employee?.tenant?.tan ?? employee?.tenant?.employeeTAN ?? '',
        address: employee?.tenant?.address ?? '',
      },
      incomeDetails: {
        grossSalary: calc.grossAnnualIncome.toNumber(),
        exemptions: calc.hraExemption.plus(calc.ltaExemption).toNumber(),
        netSalary: calc.grossAnnualIncome
          .minus(calc.hraExemption)
          .minus(calc.ltaExemption)
          .toNumber(),
        standardDeduction: calc.standardDeduction.toNumber(),
        taxableIncome: calc.taxableIncome.toNumber(),
      },
      deductionDetails: {
        section80C: calc.section80C.toNumber(),
        section80D: calc.section80D.toNumber(),
        section80CCD1B: calc.section80CCD1B.toNumber(),
        totalDeductions: calc.totalDeductions.toNumber(),
      },
      taxComputation: {
        grossTax: calc.grossTax.toNumber(),
        surcharge: calc.surcharge.toNumber(),
        cess: calc.cess.toNumber(),
        rebate87A: calc.rebateU87A.toNumber(),
        totalTaxPayable: calc.totalTax.toNumber(),
        totalTDSDeducted: tdsDeducted,
      },
      generatedAt: new Date().toISOString(),
      financialYearStart: fyStart,
      financialYearEnd: fyEnd,
    };
  }

  /**
   * Get TDS quarterly summary for Form 24Q filing.
   *
   * Quarters:
   *  Q1: April–June      (due July 31)
   *  Q2: July–September  (due October 31)
   *  Q3: October–December (due January 31)
   *  Q4: January–March   (due May 31)
   */
  async getTDSSummary(tenantId: string, quarter: number, financialYear: string): Promise<TDSQuarterlySummary> {
    TDSQuarterlySummarySchema.parse({ tenantId, quarter, financialYear });

    const quarterPeriods: Record<number, string> = {
      1: 'April–June',
      2: 'July–September',
      3: 'October–December',
      4: 'January–March',
    };

    // Fetch TDS records for the quarter
    let tdsRecords: any[] = [];
    try {
      tdsRecords = await (prisma as any).indiaTDSRecord?.findMany({
        where: {
          tenantId,
          financialYear,
          quarter,
        },
        include: { employee: true },
      }) ?? [];
    } catch {
      // Model may not exist yet
    }

    let totalGross = new Decimal(0);
    let totalDeducted = new Decimal(0);
    let totalDeposited = new Decimal(0);

    const employeeSummaries = tdsRecords.map((rec: any) => {
      const gross = new Decimal(rec.grossSalary ?? 0);
      const deducted = new Decimal(rec.tdsDeducted ?? 0);
      const deposited = new Decimal(rec.tdsDeposited ?? 0);
      totalGross = totalGross.plus(gross);
      totalDeducted = totalDeducted.plus(deducted);
      totalDeposited = totalDeposited.plus(deposited);

      return {
        employeeId: rec.employeeId,
        employeeName: `${rec.employee?.firstName ?? ''} ${rec.employee?.lastName ?? ''}`.trim(),
        pan: rec.employee?.pan ?? null,
        grossSalary: gross.toNumber(),
        tdsDeducted: deducted.toNumber(),
        regime: (rec.regime ?? 'NEW') as TaxRegime,
      };
    });

    const pendingDeposit = totalDeducted.minus(totalDeposited);

    // Check Form 24Q filing status
    let form24QStatus: 'NOT_FILED' | 'FILED' | 'PROCESSED' = 'NOT_FILED';
    try {
      const form24Q = await (prisma as any).indiaForm24Q?.findFirst({
        where: {
          tenantId,
          financialYear,
          quarter,
        },
      });
      if (form24Q) {
        form24QStatus = form24Q.status === 'PROCESSED' ? 'PROCESSED' : 'FILED';
      }
    } catch {
      // Model may not exist yet
    }

    return {
      tenantId,
      financialYear,
      quarter,
      quarterPeriod: quarterPeriods[quarter],
      totalEmployees: tdsRecords.length,
      totalGrossSalary: totalGross,
      totalTDSDeducted: totalDeducted,
      totalTDSDeposited: totalDeposited,
      pendingDeposit,
      form24QStatus,
      employees: employeeSummaries,
    };
  }
}

export const indiaTDSService = new IndiaTDSService();
