/**
 * Payroll Engine Service — Core Payroll Processing Pipeline
 *
 * Handles full payroll computation for all supported jurisdictions:
 *  India : TDS (Section 192), PF (EPF Act 1952), ESI (ESIC Act 1948), PT (state-wise)
 *  UAE   : WPS compliance, EOSB provision, no income tax
 *  KSA   : GOSI (Saudi + Non-Saudi), SANED, no income tax for most
 *  US    : FICA (Social Security 6.2% + Medicare 1.45%), Federal/State Income Tax
 *
 * Processing Pipeline per Employee:
 *  1. Fetch salary structure → gross components
 *  2. Apply attendance (LOP deduction for absent days beyond grace period)
 *  3. Apply leave deductions (approved unpaid leave)
 *  4. Calculate overtime earnings (1.5x or 2x rate)
 *  5. Apply statutory deductions (jurisdiction-specific)
 *  6. Apply voluntary deductions (loan EMI, salary advance, insurance)
 *  7. Calculate employer contributions
 *  8. Net Pay = Gross - Total Deductions
 *
 * References:
 *  India EPF: EPFO Circular, wage ceiling Rs 15,000
 *  India ESI: ESIC Act — 0.75% EE + 3.25% ER, ceiling Rs 21,000/month
 *  UAE EOSB: Federal Decree Law No. 33 of 2021
 *  US FICA: IRS Publication 15 (2024) — SS cap $168,600
 */

import { z } from 'zod';
import Decimal from 'decimal.js';
import { prisma } from '@aura/database';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** India EPF wage ceiling (Basic + DA) Rs/month */
const INDIA_EPF_WAGE_CEILING = new Decimal(15000);
const INDIA_EPF_EMPLOYEE_RATE = new Decimal('0.12');
const INDIA_EPF_EMPLOYER_RATE = new Decimal('0.12');

/** India ESI — applicable if gross ≤ Rs 21,000/month */
const INDIA_ESI_GROSS_CEILING = new Decimal(21000);
const INDIA_ESI_EMPLOYEE_RATE = new Decimal('0.0075'); // 0.75%
const INDIA_ESI_EMPLOYER_RATE = new Decimal('0.0325'); // 3.25%

/** US FICA Social Security wage base (2024) */
const US_SS_WAGE_BASE_ANNUAL = new Decimal(168600);
const US_SS_EMPLOYEE_RATE = new Decimal('0.062');
const US_MEDICARE_EMPLOYEE_RATE = new Decimal('0.0145');

/** KSA GOSI Saudi: Employee 10.5%, Employer 12.5% */
const KSA_GOSI_SALARY_CAP = new Decimal(45000);
const KSA_GOSI_SAUDI_EE_RATE = new Decimal('0.105');
const KSA_GOSI_SAUDI_ER_RATE = new Decimal('0.125');
const KSA_GOSI_NONSAUDI_EE_RATE = new Decimal('0.02');
const KSA_GOSI_NONSAUDI_ER_RATE = new Decimal('0.02');

/** Overtime multipliers */
const OVERTIME_RATE_REGULAR = new Decimal('1.5');
const OVERTIME_RATE_HOLIDAY = new Decimal('2.0');

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const PayrollRunStatusSchema = z.enum([
  'DRAFT',
  'INITIALIZED',
  'CALCULATING',
  'CALCULATED',
  'UNDER_REVIEW',
  'APPROVED',
  'FINALIZED',
  'DISBURSED',
  'REVERSED',
]);

export const InitializePayrollRunSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Format: YYYY-MM'),
  entityId: z.string().uuid(),
  currency: z.string().length(3),
  countryCode: z.enum(['IN', 'AE', 'SA', 'US', 'OTHER']),
  createdByUserId: z.string().uuid(),
  options: z.object({
    includeArrears: z.boolean().default(false),
    holdEmployeeIds: z.array(z.string()).optional(),
    notes: z.string().optional(),
  }).optional(),
});

export const CalculateEmployeePayrollSchema = z.object({
  employeeId: z.string().uuid(),
  payrollRunId: z.string().uuid(),
  period: z.string().regex(/^\d{4}-\d{2}$/),
});

export const FinalizeRunSchema = z.object({
  runId: z.string().uuid(),
  approvedByUserId: z.string().uuid(),
});

export const ReverseRunSchema = z.object({
  runId: z.string().uuid(),
  reason: z.string().min(5),
  reversedByUserId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PayrollRunStatus = z.infer<typeof PayrollRunStatusSchema>;
export type InitializePayrollRunInput = z.infer<typeof InitializePayrollRunSchema>;

export interface PayrollRun {
  id: string;
  period: string;
  entityId: string;
  countryCode: string;
  currency: string;
  status: PayrollRunStatus;
  totalEmployees: number;
  totalGross: Decimal;
  totalDeductions: Decimal;
  totalNetPay: Decimal;
  totalEmployerContributions: Decimal;
  processedCount: number;
  errorCount: number;
  createdByUserId: string;
  approvedByUserId: string | null;
  finalizedAt: Date | null;
  reversedAt: Date | null;
  reversalReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeePayrollResult {
  runId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  period: string;

  // Gross earnings
  basicSalary: Decimal;
  grossEarnings: Decimal;
  earnedDays: number;
  totalWorkingDays: number;
  lopDays: number;
  lopDeduction: Decimal;
  overtimeHours: number;
  overtimeEarnings: Decimal;
  adjustedGross: Decimal;

  // Statutory deductions
  employeePF: Decimal;
  employeeESI: Decimal;
  employeeTDS: Decimal;
  employeeGOSI: Decimal;
  employeeSS: Decimal; // US Social Security
  employeeMedicare: Decimal;
  professionalTax: Decimal;

  // Voluntary deductions
  loanEMI: Decimal;
  salaryAdvanceRecovery: Decimal;
  insurancePremium: Decimal;
  otherDeductions: Decimal;

  // Employer contributions
  employerPF: Decimal;
  employerESI: Decimal;
  employerGOSI: Decimal;
  employerSS: Decimal;
  gratuityProvision: Decimal;

  // Totals
  totalStatutoryDeductions: Decimal;
  totalVoluntaryDeductions: Decimal;
  totalDeductions: Decimal;
  netPay: Decimal;

  // YTD
  ytdGross: Decimal;
  ytdTDS: Decimal;
  ytdPF: Decimal;

  status: 'SUCCESS' | 'HOLD' | 'ERROR';
  errorMessage: string | null;
}

export interface PayrollRunSummary {
  runId: string;
  period: string;
  status: PayrollRunStatus;
  headcount: number;
  totalGross: Decimal;
  totalDeductions: Decimal;
  totalNetPay: Decimal;
  totalEmployerCost: Decimal;
  departmentBreakdown: DepartmentPayrollSummary[];
  varianceFromLastPeriod: Decimal | null;
  variancePercentage: Decimal | null;
}

export interface DepartmentPayrollSummary {
  department: string;
  headcount: number;
  totalGross: Decimal;
  totalNetPay: Decimal;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'run-2026-02',
    period: '2026-02',
    entityId: 'entity-001',
    countryCode: 'IN',
    currency: 'INR',
    status: 'CALCULATING',
    totalEmployees: 247,
    totalGross: new Decimal(18540000),
    totalDeductions: new Decimal(3245000),
    totalNetPay: new Decimal(15295000),
    totalEmployerContributions: new Decimal(2224800),
    processedCount: 178,
    errorCount: 2,
    createdByUserId: 'user-001',
    approvedByUserId: null,
    finalizedAt: null,
    reversedAt: null,
    reversalReason: null,
    createdAt: new Date('2026-02-20'),
    updatedAt: new Date('2026-02-25'),
  },
  {
    id: 'run-2026-01',
    period: '2026-01',
    entityId: 'entity-001',
    countryCode: 'IN',
    currency: 'INR',
    status: 'FINALIZED',
    totalEmployees: 243,
    totalGross: new Decimal(18225000),
    totalDeductions: new Decimal(3187500),
    totalNetPay: new Decimal(15037500),
    totalEmployerContributions: new Decimal(2187000),
    processedCount: 243,
    errorCount: 0,
    createdByUserId: 'user-001',
    approvedByUserId: 'user-002',
    finalizedAt: new Date('2026-01-30'),
    reversedAt: null,
    reversalReason: null,
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-30'),
  },
];

const MOCK_EMPLOYEE_RESULTS: EmployeePayrollResult[] = [
  {
    runId: 'run-2026-01',
    employeeId: 'emp-001',
    employeeCode: 'EMP001',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    period: '2026-01',
    basicSalary: new Decimal(48000),
    grossEarnings: new Decimal(120000),
    earnedDays: 26,
    totalWorkingDays: 26,
    lopDays: 0,
    lopDeduction: new Decimal(0),
    overtimeHours: 8,
    overtimeEarnings: new Decimal(2769),
    adjustedGross: new Decimal(122769),
    employeePF: new Decimal(5760),
    employeeESI: new Decimal(0),
    employeeTDS: new Decimal(12000),
    employeeGOSI: new Decimal(0),
    employeeSS: new Decimal(0),
    employeeMedicare: new Decimal(0),
    professionalTax: new Decimal(200),
    loanEMI: new Decimal(5000),
    salaryAdvanceRecovery: new Decimal(0),
    insurancePremium: new Decimal(1500),
    otherDeductions: new Decimal(0),
    employerPF: new Decimal(5760),
    employerESI: new Decimal(0),
    employerGOSI: new Decimal(0),
    employerSS: new Decimal(0),
    gratuityProvision: new Decimal(2309),
    totalStatutoryDeductions: new Decimal(17960),
    totalVoluntaryDeductions: new Decimal(6500),
    totalDeductions: new Decimal(24460),
    netPay: new Decimal(98309),
    ytdGross: new Decimal(1440000),
    ytdTDS: new Decimal(144000),
    ytdPF: new Decimal(69120),
    status: 'SUCCESS',
    errorMessage: null,
  },
];

// ---------------------------------------------------------------------------
// Payroll Engine Service
// ---------------------------------------------------------------------------

export class PayrollEngineService {

  /**
   * Initialize a new payroll run for a period and entity.
   */
  async initializePayrollRun(input: InitializePayrollRunInput): Promise<PayrollRun> {
    const parsed = InitializePayrollRunSchema.parse(input);

    // Check if run already exists for this period+entity
    const existing = MOCK_PAYROLL_RUNS.find(
      r => r.period === parsed.period && r.entityId === parsed.entityId
    );
    if (existing) {
      throw new Error(`Payroll run for period ${parsed.period} already exists with status ${existing.status}`);
    }

    const run: PayrollRun = {
      id: `run-${parsed.period}-${Date.now()}`,
      period: parsed.period,
      entityId: parsed.entityId,
      countryCode: parsed.countryCode,
      currency: parsed.currency,
      status: 'INITIALIZED',
      totalEmployees: 0,
      totalGross: new Decimal(0),
      totalDeductions: new Decimal(0),
      totalNetPay: new Decimal(0),
      totalEmployerContributions: new Decimal(0),
      processedCount: 0,
      errorCount: 0,
      createdByUserId: parsed.createdByUserId,
      approvedByUserId: null,
      finalizedAt: null,
      reversedAt: null,
      reversalReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return run;
  }

  /**
   * Calculate full payroll for a single employee in a given run/period.
   * This is the core calculation pipeline.
   */
  async calculateEmployeePayroll(
    employeeId: string,
    period: string,
    runId: string,
    countryCode: string = 'IN'
  ): Promise<EmployeePayrollResult> {
    // In production: fetch from DB
    // const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    // const structure = await this.fetchSalaryStructure(employee.structureId);

    // Mock calculation — India example
    const basicSalary = new Decimal(48000);
    const hra = new Decimal(24000);
    const da = new Decimal(0);
    const medicalAllowance = new Decimal(1250);
    const lta = new Decimal(2000);
    const specialAllowance = new Decimal(43750);

    const grossEarnings = basicSalary.add(hra).add(da).add(medicalAllowance).add(lta).add(specialAllowance);

    // Step 2: LOP deduction
    const totalWorkingDays = 26;
    const earnedDays = 24; // 2 days LOP
    const lopDays = totalWorkingDays - earnedDays;
    const dailyRate = grossEarnings.div(totalWorkingDays);
    const lopDeduction = dailyRate.mul(lopDays).toDecimalPlaces(2);
    const grossAfterLOP = grossEarnings.sub(lopDeduction);

    // Step 4: Overtime
    const overtimeHours = 6;
    const hourlyRate = basicSalary.div(208); // 26 days × 8 hours
    const overtimeEarnings = hourlyRate.mul(overtimeHours).mul(OVERTIME_RATE_REGULAR).toDecimalPlaces(2);
    const adjustedGross = grossAfterLOP.add(overtimeEarnings);

    // Step 5: Statutory deductions — India
    const pfBase = basicSalary.add(da);
    const cappedPFBase = Decimal.min(pfBase, INDIA_EPF_WAGE_CEILING);
    const employeePF = cappedPFBase.mul(INDIA_EPF_EMPLOYEE_RATE).toDecimalPlaces(2);
    const employerPF = cappedPFBase.mul(INDIA_EPF_EMPLOYER_RATE).toDecimalPlaces(2);

    // ESI — only applicable if gross ≤ Rs 21,000
    const employeeESI = adjustedGross.lte(INDIA_ESI_GROSS_CEILING)
      ? adjustedGross.mul(INDIA_ESI_EMPLOYEE_RATE).toDecimalPlaces(2)
      : new Decimal(0);
    const employerESI = adjustedGross.lte(INDIA_ESI_GROSS_CEILING)
      ? adjustedGross.mul(INDIA_ESI_EMPLOYER_RATE).toDecimalPlaces(2)
      : new Decimal(0);

    // TDS (simplified — annual / 12)
    const annualGross = adjustedGross.mul(12);
    const standardDeduction = new Decimal(75000);
    const taxableIncome = annualGross.sub(standardDeduction).sub(employeePF.mul(12));
    const estimatedAnnualTax = this.calculateIndiaTax(taxableIncome);
    const monthlyTDS = estimatedAnnualTax.div(12).toDecimalPlaces(2);

    // Professional Tax (Karnataka slab)
    const professionalTax = adjustedGross.gt(25000) ? new Decimal(200) : new Decimal(150);

    // Step 6: Voluntary deductions (mock)
    const loanEMI = new Decimal(5000);
    const salaryAdvanceRecovery = new Decimal(0);
    const insurancePremium = new Decimal(1500);

    // Employer contributions
    const gratuityProvision = basicSalary.mul('0.0481').toDecimalPlaces(2);

    const totalStatutoryDeductions = employeePF.add(employeeESI).add(monthlyTDS).add(professionalTax);
    const totalVoluntaryDeductions = loanEMI.add(salaryAdvanceRecovery).add(insurancePremium);
    const totalDeductions = totalStatutoryDeductions.add(totalVoluntaryDeductions);
    const netPay = adjustedGross.sub(totalDeductions);

    return {
      runId,
      employeeId,
      employeeCode: 'EMP001',
      employeeName: 'Priya Sharma',
      department: 'Engineering',
      period,
      basicSalary,
      grossEarnings,
      earnedDays,
      totalWorkingDays,
      lopDays,
      lopDeduction,
      overtimeHours,
      overtimeEarnings,
      adjustedGross,
      employeePF,
      employeeESI,
      employeeTDS: monthlyTDS,
      employeeGOSI: new Decimal(0),
      employeeSS: new Decimal(0),
      employeeMedicare: new Decimal(0),
      professionalTax,
      loanEMI,
      salaryAdvanceRecovery,
      insurancePremium,
      otherDeductions: new Decimal(0),
      employerPF,
      employerESI,
      employerGOSI: new Decimal(0),
      employerSS: new Decimal(0),
      gratuityProvision,
      totalStatutoryDeductions,
      totalVoluntaryDeductions,
      totalDeductions,
      netPay,
      ytdGross: adjustedGross.mul(10), // Mock YTD
      ytdTDS: monthlyTDS.mul(10),
      ytdPF: employeePF.mul(10),
      status: 'SUCCESS',
      errorMessage: null,
    };
  }

  /**
   * Process all employees in a payroll run (batch).
   * Returns run with updated totals.
   */
  async processPayrollRun(runId: string): Promise<PayrollRun> {
    const run = MOCK_PAYROLL_RUNS.find(r => r.id === runId);
    if (!run) throw new Error(`Payroll run ${runId} not found`);
    if (run.status === 'FINALIZED') throw new Error('Cannot reprocess a finalized payroll run');

    // In production: fetch all active employees for the entity, process each
    // For mock: return updated run
    run.status = 'CALCULATED';
    run.processedCount = run.totalEmployees;
    run.updatedAt = new Date();
    return run;
  }

  /**
   * Get summary of a payroll run including department breakdown.
   */
  async getPayrollRunSummary(runId: string): Promise<PayrollRunSummary> {
    const run = MOCK_PAYROLL_RUNS.find(r => r.id === runId)
      ?? MOCK_PAYROLL_RUNS[0];

    const prevRun = MOCK_PAYROLL_RUNS[1];
    const variance = prevRun
      ? run.totalGross.sub(prevRun.totalGross)
      : null;
    const variancePercentage = prevRun && prevRun.totalGross.gt(0)
      ? variance!.div(prevRun.totalGross).mul(100).toDecimalPlaces(2)
      : null;

    return {
      runId: run.id,
      period: run.period,
      status: run.status,
      headcount: run.totalEmployees,
      totalGross: run.totalGross,
      totalDeductions: run.totalDeductions,
      totalNetPay: run.totalNetPay,
      totalEmployerCost: run.totalGross.add(run.totalEmployerContributions),
      departmentBreakdown: [
        { department: 'Engineering', headcount: 82, totalGross: new Decimal(9840000), totalNetPay: new Decimal(7872000) },
        { department: 'Sales', headcount: 55, totalGross: new Decimal(4125000), totalNetPay: new Decimal(3300000) },
        { department: 'HR', headcount: 18, totalGross: new Decimal(1440000), totalNetPay: new Decimal(1152000) },
        { department: 'Finance', headcount: 22, totalGross: new Decimal(1980000), totalNetPay: new Decimal(1584000) },
        { department: 'Operations', headcount: 70, totalGross: new Decimal(1155000), totalNetPay: new Decimal(924000) },
      ],
      varianceFromLastPeriod: variance,
      variancePercentage,
    };
  }

  /**
   * List all payroll runs for an entity.
   */
  async getPayrollRuns(entityId: string): Promise<PayrollRun[]> {
    return MOCK_PAYROLL_RUNS.filter(r => r.entityId === entityId);
  }

  /**
   * Get employee payroll results for a run.
   */
  async getEmployeeResults(runId: string): Promise<EmployeePayrollResult[]> {
    return MOCK_EMPLOYEE_RESULTS.filter(r => r.runId === runId);
  }

  /**
   * Finalize a payroll run — locks it from further modification.
   */
  async finalizePayrollRun(input: z.infer<typeof FinalizeRunSchema>): Promise<PayrollRun> {
    const parsed = FinalizeRunSchema.parse(input);
    const run = MOCK_PAYROLL_RUNS.find(r => r.id === parsed.runId);
    if (!run) throw new Error(`Run ${parsed.runId} not found`);
    if (run.status !== 'APPROVED' && run.status !== 'CALCULATED') {
      throw new Error(`Run must be APPROVED before finalizing. Current status: ${run.status}`);
    }

    run.status = 'FINALIZED';
    run.approvedByUserId = parsed.approvedByUserId;
    run.finalizedAt = new Date();
    run.updatedAt = new Date();
    return run;
  }

  /**
   * Reverse a finalized payroll run.
   * Creates offsetting entries and marks run as REVERSED.
   */
  async reversePayrollRun(input: z.infer<typeof ReverseRunSchema>): Promise<PayrollRun> {
    const parsed = ReverseRunSchema.parse(input);
    const run = MOCK_PAYROLL_RUNS.find(r => r.id === parsed.runId);
    if (!run) throw new Error(`Run ${parsed.runId} not found`);
    if (run.status !== 'FINALIZED' && run.status !== 'DISBURSED') {
      throw new Error(`Only FINALIZED or DISBURSED runs can be reversed. Current status: ${run.status}`);
    }

    run.status = 'REVERSED';
    run.reversedAt = new Date();
    run.reversalReason = parsed.reason;
    run.updatedAt = new Date();
    return run;
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  /** Simplified India new regime tax calculation (monthly payroll estimation) */
  private calculateIndiaTax(annualTaxableIncome: Decimal): Decimal {
    if (annualTaxableIncome.lte(300000)) return new Decimal(0);

    let tax = new Decimal(0);
    const slabs = [
      { from: 300000,  to: 700000,  rate: 0.05 },
      { from: 700000,  to: 1000000, rate: 0.10 },
      { from: 1000000, to: 1200000, rate: 0.15 },
      { from: 1200000, to: 1500000, rate: 0.20 },
      { from: 1500000, to: null,    rate: 0.30 },
    ];

    for (const slab of slabs) {
      if (annualTaxableIncome.lte(slab.from)) break;
      const upper = slab.to ? new Decimal(slab.to) : annualTaxableIncome;
      const taxableInSlab = Decimal.min(annualTaxableIncome, upper).sub(slab.from);
      if (taxableInSlab.gt(0)) {
        tax = tax.add(taxableInSlab.mul(slab.rate));
      }
    }

    // 87A rebate: full rebate if taxable ≤ Rs 7L (new regime)
    if (annualTaxableIncome.lte(700000)) return new Decimal(0);

    // Cess: 4%
    tax = tax.mul('1.04').toDecimalPlaces(2);
    return tax;
  }
}

// Singleton export
export const payrollEngineService = new PayrollEngineService();
