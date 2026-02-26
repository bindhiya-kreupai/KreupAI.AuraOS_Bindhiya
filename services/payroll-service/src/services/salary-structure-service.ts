/**
 * Salary Structure Service — Multi-Jurisdiction Salary Component Builder
 *
 * Supports salary structures for:
 *  India  : Basic (40-50% CTC) + HRA + DA + Special Allowance + Medical + LTA + PF + Gratuity
 *  UAE    : Basic (min 60% total for WPS compliance) + Housing + Transport + Phone + Other
 *  KSA    : Basic (min 50%) + Housing (25%) + Transport + Other allowances
 *  US     : Base salary + Bonus target + Stock/Equity
 *
 * References:
 *  UAE: MoHRE WPS Guidelines — Basic must be ≥60% of total package
 *  KSA: Saudi Labour Law Article 34 — Basic wage definition
 *  India: Income Tax Act 1961 — HRA exemption u/s 10(13A)
 *  India: EPF & MP Act 1952 — PF on Basic + DA
 */

import { z } from 'zod';
import Decimal from 'decimal.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Constants — Country-Specific Rules
// ---------------------------------------------------------------------------

/** UAE: Minimum Basic as percentage of total salary (WPS Compliance) */
export const UAE_MIN_BASIC_RATIO = new Decimal('0.60');

/** KSA: Minimum Basic as percentage of total salary (Saudi Labour Law) */
export const KSA_MIN_BASIC_RATIO = new Decimal('0.50');

/** KSA: Standard Housing Allowance as percentage of Basic */
export const KSA_STANDARD_HOUSING_RATIO = new Decimal('0.25');

/** India: Typical Basic as % of CTC — 40-50% range */
export const INDIA_BASIC_MIN_RATIO = new Decimal('0.40');
export const INDIA_BASIC_MAX_RATIO = new Decimal('0.50');

/** India: HRA as % of Basic — metro: 50%, non-metro: 40% */
export const INDIA_HRA_METRO_RATIO = new Decimal('0.50');
export const INDIA_HRA_NON_METRO_RATIO = new Decimal('0.40');

/** India: Medical allowance exempt up to Rs 15,000/year (old regime) */
export const INDIA_MEDICAL_EXEMPT_ANNUAL = new Decimal(15000);

/** India: LTA — Leave Travel Allowance (exempt 2 journeys in 4-year block) */
export const INDIA_LTA_STANDARD = new Decimal(24000); // Annual typical

/** India: Gratuity employer contribution ≈ 4.81% of Basic + DA */
export const INDIA_GRATUITY_RATE = new Decimal('0.0481');

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const CountryCodeSchema = z.enum(['IN', 'AE', 'SA', 'US', 'OTHER']);

export const ComponentTypeSchema = z.enum([
  'FIXED',         // Fixed amount
  'PERCENTAGE',    // Percentage of a base component
  'FORMULA',       // Derived from other components
  'REIMBURSEMENT', // Expense reimbursement (not included in CTC)
]);

export const ComponentCategorySchema = z.enum([
  'BASIC',
  'ALLOWANCE',
  'BONUS',
  'DEDUCTION',
  'EMPLOYER_CONTRIBUTION',
  'REIMBURSEMENT',
]);

export const SalaryComponentSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  code: z.string().min(1).max(20),
  category: ComponentCategorySchema,
  type: ComponentTypeSchema,
  /** For FIXED: amount in local currency. For PERCENTAGE: rate as decimal (e.g., 0.4 = 40%) */
  value: z.number().nonnegative(),
  /** Component whose value this is a percentage of — required when type=PERCENTAGE */
  calculationBase: z.string().optional(),
  isTaxable: z.boolean().default(true),
  isPartOfCTC: z.boolean().default(true),
  isStatutory: z.boolean().default(false),
  order: z.number().int().min(0),
  description: z.string().optional(),
});

export const SalaryStructureSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  countryCode: CountryCodeSchema,
  currency: z.string().length(3),
  components: z.array(SalaryComponentSchema),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateStructureSchema = z.object({
  name: z.string().min(1),
  countryCode: CountryCodeSchema,
  currency: z.string().length(3),
  components: z.array(SalaryComponentSchema),
  isDefault: z.boolean().optional(),
});

export const CalculateBreakdownSchema = z.object({
  employeeId: z.string().uuid(),
  annualCTC: z.number().positive(),
  structureId: z.string(),
});

export const ReviseSalarySchema = z.object({
  employeeId: z.string().uuid(),
  newAnnualCTC: z.number().positive(),
  structureId: z.string(),
  effectiveDate: z.string().datetime(),
  reason: z.string().min(1),
  approvedBy: z.string().uuid().optional(),
  notes: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CountryCode = z.infer<typeof CountryCodeSchema>;
export type ComponentType = z.infer<typeof ComponentTypeSchema>;
export type ComponentCategory = z.infer<typeof ComponentCategorySchema>;
export type SalaryComponent = z.infer<typeof SalaryComponentSchema>;
export type SalaryStructure = z.infer<typeof SalaryStructureSchema>;
export type CreateStructureInput = z.infer<typeof CreateStructureSchema>;
export type CalculateBreakdownInput = z.infer<typeof CalculateBreakdownSchema>;
export type ReviseSalaryInput = z.infer<typeof ReviseSalarySchema>;

export interface SalaryBreakdown {
  employeeId: string;
  structureId: string;
  annualCTC: Decimal;
  monthlyCTC: Decimal;
  components: BreakdownComponent[];
  totalEarnings: Decimal;
  totalDeductions: Decimal;
  totalEmployerContributions: Decimal;
  netMonthlyPay: Decimal;
  netAnnualPay: Decimal;
  validationWarnings: string[];
}

export interface BreakdownComponent {
  componentId: string;
  code: string;
  name: string;
  category: ComponentCategory;
  annualAmount: Decimal;
  monthlyAmount: Decimal;
  isTaxable: boolean;
  isPartOfCTC: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SalaryRevisionRecord {
  id: string;
  employeeId: string;
  previousCTC: Decimal;
  newCTC: Decimal;
  increaseAmount: Decimal;
  increasePercentage: Decimal;
  effectiveDate: Date;
  reason: string;
  approvedBy: string | null;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Mock Data — Default Salary Structures by Country
// ---------------------------------------------------------------------------

const MOCK_STRUCTURES: SalaryStructure[] = [
  // ─── India Standard Structure ───────────────────────────────────────────
  {
    id: 'struct-india-standard',
    name: 'India Standard CTC',
    countryCode: 'IN',
    currency: 'INR',
    isDefault: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    components: [
      { id: 'c1', name: 'Basic Salary', code: 'BASIC', category: 'BASIC', type: 'PERCENTAGE', value: 0.40, isTaxable: true, isPartOfCTC: true, isStatutory: false, order: 1, description: '40% of Annual CTC', calculationBase: 'CTC' },
      { id: 'c2', name: 'HRA', code: 'HRA', category: 'ALLOWANCE', type: 'PERCENTAGE', value: 0.50, calculationBase: 'BASIC', isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 2, description: '50% of Basic (Metro)' },
      { id: 'c3', name: 'DA (Dearness Allowance)', code: 'DA', category: 'ALLOWANCE', type: 'PERCENTAGE', value: 0.00, calculationBase: 'BASIC', isTaxable: true, isPartOfCTC: true, isStatutory: false, order: 3, description: '0% DA (private sector)' },
      { id: 'c4', name: 'Medical Allowance', code: 'MEDICAL', category: 'ALLOWANCE', type: 'FIXED', value: 15000, isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 4, description: 'Rs 15,000 annual tax-exempt' },
      { id: 'c5', name: 'LTA', code: 'LTA', category: 'ALLOWANCE', type: 'FIXED', value: 24000, isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 5, description: 'Leave Travel Allowance — annual' },
      { id: 'c6', name: 'Special Allowance', code: 'SPECIAL', category: 'ALLOWANCE', type: 'FORMULA', value: 0, isTaxable: true, isPartOfCTC: true, isStatutory: false, order: 6, description: 'CTC - all other components (balancing)' },
      { id: 'c7', name: 'Employee PF', code: 'EE_PF', category: 'DEDUCTION', type: 'PERCENTAGE', value: 0.12, calculationBase: 'BASIC', isTaxable: false, isPartOfCTC: true, isStatutory: true, order: 7, description: '12% of Basic+DA, max Rs 1,800/month' },
      { id: 'c8', name: 'Employer PF', code: 'ER_PF', category: 'EMPLOYER_CONTRIBUTION', type: 'PERCENTAGE', value: 0.12, calculationBase: 'BASIC', isTaxable: false, isPartOfCTC: true, isStatutory: true, order: 8, description: '12% employer PF contribution' },
      { id: 'c9', name: 'Gratuity', code: 'GRATUITY', category: 'EMPLOYER_CONTRIBUTION', type: 'PERCENTAGE', value: 0.0481, calculationBase: 'BASIC', isTaxable: false, isPartOfCTC: true, isStatutory: true, order: 9, description: '4.81% of Basic — employer provision' },
    ],
  },
  // ─── UAE Standard Structure ──────────────────────────────────────────────
  {
    id: 'struct-uae-standard',
    name: 'UAE Standard Package',
    countryCode: 'AE',
    currency: 'AED',
    isDefault: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    components: [
      { id: 'u1', name: 'Basic Salary', code: 'BASIC', category: 'BASIC', type: 'PERCENTAGE', value: 0.60, calculationBase: 'CTC', isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 1, description: '60% of total (WPS minimum)' },
      { id: 'u2', name: 'Housing Allowance', code: 'HOUSING', category: 'ALLOWANCE', type: 'PERCENTAGE', value: 0.25, calculationBase: 'CTC', isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 2, description: '25% of total' },
      { id: 'u3', name: 'Transportation Allowance', code: 'TRANSPORT', category: 'ALLOWANCE', type: 'PERCENTAGE', value: 0.10, calculationBase: 'CTC', isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 3, description: '10% of total' },
      { id: 'u4', name: 'Phone Allowance', code: 'PHONE', category: 'ALLOWANCE', type: 'FIXED', value: 500, isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 4, description: 'AED 500/month fixed' },
      { id: 'u5', name: 'Other Allowances', code: 'OTHER', category: 'ALLOWANCE', type: 'FORMULA', value: 0, isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 5, description: 'Balance of package' },
    ],
  },
  // ─── KSA Standard Structure ──────────────────────────────────────────────
  {
    id: 'struct-ksa-standard',
    name: 'KSA Standard Package',
    countryCode: 'SA',
    currency: 'SAR',
    isDefault: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    components: [
      { id: 'k1', name: 'Basic Salary', code: 'BASIC', category: 'BASIC', type: 'PERCENTAGE', value: 0.60, calculationBase: 'CTC', isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 1, description: '60% of total (Saudi Labour Law min 50%)' },
      { id: 'k2', name: 'Housing Allowance', code: 'HOUSING', category: 'ALLOWANCE', type: 'PERCENTAGE', value: 0.25, calculationBase: 'BASIC', isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 2, description: '25% of Basic (standard)' },
      { id: 'k3', name: 'Transportation Allowance', code: 'TRANSPORT', category: 'ALLOWANCE', type: 'FIXED', value: 1000, isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 3, description: 'SAR 1,000/month fixed' },
      { id: 'k4', name: 'Other Allowances', code: 'OTHER', category: 'ALLOWANCE', type: 'FORMULA', value: 0, isTaxable: false, isPartOfCTC: true, isStatutory: false, order: 4, description: 'Balance of package' },
    ],
  },
  // ─── US Standard Structure ───────────────────────────────────────────────
  {
    id: 'struct-us-standard',
    name: 'US Total Compensation',
    countryCode: 'US',
    currency: 'USD',
    isDefault: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    components: [
      { id: 'us1', name: 'Base Salary', code: 'BASE', category: 'BASIC', type: 'PERCENTAGE', value: 0.80, calculationBase: 'CTC', isTaxable: true, isPartOfCTC: true, isStatutory: false, order: 1, description: '80% of total comp' },
      { id: 'us2', name: 'Annual Bonus Target', code: 'BONUS', category: 'BONUS', type: 'PERCENTAGE', value: 0.10, calculationBase: 'BASE', isTaxable: true, isPartOfCTC: true, isStatutory: false, order: 2, description: '10% of base salary target bonus' },
      { id: 'us3', name: 'Stock/Equity (RSU)', code: 'EQUITY', category: 'BONUS', type: 'PERCENTAGE', value: 0.10, calculationBase: 'CTC', isTaxable: true, isPartOfCTC: true, isStatutory: false, order: 3, description: '10% equity component (annualized)' },
    ],
  },
];

const MOCK_REVISION_HISTORY: SalaryRevisionRecord[] = [
  {
    id: 'rev-001',
    employeeId: 'emp-001',
    previousCTC: new Decimal(1200000),
    newCTC: new Decimal(1440000),
    increaseAmount: new Decimal(240000),
    increasePercentage: new Decimal(20),
    effectiveDate: new Date('2025-04-01'),
    reason: 'Annual Appraisal — Exceeds Expectations',
    approvedBy: 'mgr-001',
    createdAt: new Date('2025-03-25'),
  },
  {
    id: 'rev-002',
    employeeId: 'emp-001',
    previousCTC: new Decimal(1000000),
    newCTC: new Decimal(1200000),
    increaseAmount: new Decimal(200000),
    increasePercentage: new Decimal(20),
    effectiveDate: new Date('2024-04-01'),
    reason: 'Annual Appraisal — Meets Expectations',
    approvedBy: 'mgr-001',
    createdAt: new Date('2024-03-20'),
  },
];

// ---------------------------------------------------------------------------
// Salary Structure Service
// ---------------------------------------------------------------------------

export class SalaryStructureService {

  /**
   * Create a new salary structure template.
   * Validates country-specific rules before saving.
   */
  async createSalaryStructure(input: CreateStructureInput): Promise<SalaryStructure> {
    const parsed = CreateStructureSchema.parse(input);

    // Validate the structure before creating
    const validation = await this.validateStructure({
      id: `struct-${Date.now()}`,
      ...parsed,
      isDefault: parsed.isDefault ?? false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (validation.errors.length > 0) {
      throw new Error(`Salary structure validation failed: ${validation.errors.join('; ')}`);
    }

    // In production: persist to DB via Prisma
    // const record = await prisma.salaryStructure.create({ data: { ... } });

    const newStructure: SalaryStructure = {
      id: `struct-${Date.now()}`,
      ...parsed,
      isDefault: parsed.isDefault ?? false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newStructure;
  }

  /**
   * Calculate full salary breakdown for an employee given annual CTC
   * and a salary structure template.
   */
  async calculateBreakdown(input: CalculateBreakdownInput): Promise<SalaryBreakdown> {
    const parsed = CalculateBreakdownSchema.parse(input);

    const structure = MOCK_STRUCTURES.find(s => s.id === parsed.structureId)
      ?? MOCK_STRUCTURES[0];

    const annualCTC = new Decimal(parsed.annualCTC);
    const monthlyCTC = annualCTC.div(12).toDecimalPlaces(2);

    const components: BreakdownComponent[] = [];
    const resolvedValues: Record<string, Decimal> = { CTC: annualCTC };
    const warnings: string[] = [];

    // Sort by order to resolve dependencies sequentially
    const sorted = [...structure.components].sort((a, b) => a.order - b.order);

    let totalFixed = new Decimal(0);
    let formulaComponent: SalaryComponent | undefined;

    for (const comp of sorted) {
      if (comp.type === 'FORMULA') {
        formulaComponent = comp;
        continue; // Calculate after all others
      }

      let annualAmount = new Decimal(0);

      if (comp.type === 'FIXED') {
        // Fixed annual amount (if monthly, stored as annual = value × 12)
        annualAmount = new Decimal(comp.value);
        // If the value looks like a monthly amount (small number), treat as monthly
        if (comp.value < 100000 && structure.countryCode !== 'US') {
          annualAmount = new Decimal(comp.value).mul(12);
        }
      } else if (comp.type === 'PERCENTAGE') {
        const base = resolvedValues[comp.calculationBase ?? 'CTC'] ?? annualCTC;
        annualAmount = base.mul(comp.value).toDecimalPlaces(2);
      }

      resolvedValues[comp.code] = annualAmount;
      if (comp.isPartOfCTC) totalFixed = totalFixed.add(annualAmount);

      components.push({
        componentId: comp.id,
        code: comp.code,
        name: comp.name,
        category: comp.category,
        annualAmount,
        monthlyAmount: annualAmount.div(12).toDecimalPlaces(2),
        isTaxable: comp.isTaxable,
        isPartOfCTC: comp.isPartOfCTC,
      });
    }

    // Handle FORMULA (balancing) component
    if (formulaComponent) {
      const ctcComponents = components.filter(c => c.isPartOfCTC);
      const allocatedSum = ctcComponents.reduce((s, c) => s.add(c.annualAmount), new Decimal(0));
      const balanceAmount = annualCTC.sub(allocatedSum).toDecimalPlaces(2);
      const formulaAnnual = balanceAmount.gt(0) ? balanceAmount : new Decimal(0);

      resolvedValues[formulaComponent.code] = formulaAnnual;
      components.push({
        componentId: formulaComponent.id,
        code: formulaComponent.code,
        name: formulaComponent.name,
        category: formulaComponent.category,
        annualAmount: formulaAnnual,
        monthlyAmount: formulaAnnual.div(12).toDecimalPlaces(2),
        isTaxable: formulaComponent.isTaxable,
        isPartOfCTC: formulaComponent.isPartOfCTC,
      });
    }

    // Country-specific validation warnings
    if (structure.countryCode === 'AE') {
      const basic = resolvedValues['BASIC'] ?? new Decimal(0);
      const basicRatio = basic.div(annualCTC);
      if (basicRatio.lt(UAE_MIN_BASIC_RATIO)) {
        warnings.push(`UAE WPS: Basic salary (${basicRatio.mul(100).toFixed(1)}%) is below the required 60% minimum of total package.`);
      }
    }

    if (structure.countryCode === 'SA') {
      const basic = resolvedValues['BASIC'] ?? new Decimal(0);
      const basicRatio = basic.div(annualCTC);
      if (basicRatio.lt(KSA_MIN_BASIC_RATIO)) {
        warnings.push(`KSA Labour Law: Basic salary (${basicRatio.mul(100).toFixed(1)}%) is below the required 50% minimum.`);
      }
    }

    if (structure.countryCode === 'IN') {
      const basic = resolvedValues['BASIC'] ?? new Decimal(0);
      const basicRatio = basic.div(annualCTC);
      if (basicRatio.lt(INDIA_BASIC_MIN_RATIO)) {
        warnings.push(`India: Basic salary (${basicRatio.mul(100).toFixed(1)}%) is below the recommended 40% minimum. PF contributions may be affected.`);
      }
    }

    // Compute totals
    const earnings = components.filter(c => c.category === 'BASIC' || c.category === 'ALLOWANCE' || c.category === 'BONUS');
    const deductions = components.filter(c => c.category === 'DEDUCTION');
    const employerContribs = components.filter(c => c.category === 'EMPLOYER_CONTRIBUTION');

    const totalEarnings = earnings.reduce((s, c) => s.add(c.monthlyAmount), new Decimal(0));
    const totalDeductions = deductions.reduce((s, c) => s.add(c.monthlyAmount), new Decimal(0));
    const totalEmployerContributions = employerContribs.reduce((s, c) => s.add(c.monthlyAmount), new Decimal(0));
    const netMonthlyPay = totalEarnings.sub(totalDeductions);

    return {
      employeeId: parsed.employeeId,
      structureId: structure.id,
      annualCTC,
      monthlyCTC,
      components,
      totalEarnings,
      totalDeductions,
      totalEmployerContributions,
      netMonthlyPay,
      netAnnualPay: netMonthlyPay.mul(12),
      validationWarnings: warnings,
    };
  }

  /**
   * Get available salary structures for a country.
   */
  async getSalaryStructures(countryCode?: CountryCode): Promise<SalaryStructure[]> {
    if (!countryCode) return MOCK_STRUCTURES;
    return MOCK_STRUCTURES.filter(s => s.countryCode === countryCode && s.isActive);
  }

  /**
   * Validate a salary structure for country-specific rules.
   */
  async validateStructure(structure: SalaryStructure): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (structure.components.length === 0) {
      errors.push('Salary structure must have at least one component.');
    }

    const hasBasic = structure.components.some(c => c.category === 'BASIC');
    if (!hasBasic) {
      errors.push('Salary structure must have a Basic/Base salary component.');
    }

    // Compute the ratio for percentage-based BASIC component
    const basicComp = structure.components.find(c => c.category === 'BASIC');

    if (basicComp && basicComp.type === 'PERCENTAGE' && basicComp.calculationBase === 'CTC') {
      const ratio = new Decimal(basicComp.value);

      if (structure.countryCode === 'AE' && ratio.lt(UAE_MIN_BASIC_RATIO)) {
        errors.push(`UAE: Basic salary must be at least ${UAE_MIN_BASIC_RATIO.mul(100).toFixed(0)}% of total package for WPS compliance. Current: ${ratio.mul(100).toFixed(1)}%.`);
      }

      if (structure.countryCode === 'SA' && ratio.lt(KSA_MIN_BASIC_RATIO)) {
        errors.push(`KSA: Basic salary must be at least ${KSA_MIN_BASIC_RATIO.mul(100).toFixed(0)}% of total package per Saudi Labour Law. Current: ${ratio.mul(100).toFixed(1)}%.`);
      }

      if (structure.countryCode === 'IN') {
        if (ratio.lt(INDIA_BASIC_MIN_RATIO)) {
          warnings.push(`India: Basic salary at ${ratio.mul(100).toFixed(1)}% is below recommended 40%. Low Basic increases tax liability due to higher HRA taxability.`);
        }
        if (ratio.gt(INDIA_BASIC_MAX_RATIO)) {
          warnings.push(`India: Basic salary at ${ratio.mul(100).toFixed(1)}% exceeds recommended 50%. Higher PF deduction will apply.`);
        }
      }
    }

    // Validate percentage components sum to ≤100% of CTC
    const ctcPercentageComponents = structure.components.filter(
      c => c.type === 'PERCENTAGE' && c.calculationBase === 'CTC' && c.isPartOfCTC
    );
    const totalCtcPercentage = ctcPercentageComponents.reduce(
      (sum, c) => sum.add(c.value), new Decimal(0)
    );
    if (totalCtcPercentage.gt(1)) {
      errors.push(`Components as % of CTC sum to ${totalCtcPercentage.mul(100).toFixed(1)}%, which exceeds 100%. Adjust component percentages.`);
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Record a salary revision for an employee.
   * Returns the new breakdown and revision record.
   */
  async reviseSalary(input: ReviseSalaryInput): Promise<{
    revision: SalaryRevisionRecord;
    newBreakdown: SalaryBreakdown;
  }> {
    const parsed = ReviseSalarySchema.parse(input);

    // In production: fetch current salary from DB
    const currentCTC = new Decimal(1200000); // Mock current CTC
    const newCTC = new Decimal(parsed.newAnnualCTC);

    const increaseAmount = newCTC.sub(currentCTC);
    const increasePercentage = increaseAmount.div(currentCTC).mul(100).toDecimalPlaces(2);

    const revision: SalaryRevisionRecord = {
      id: `rev-${Date.now()}`,
      employeeId: parsed.employeeId,
      previousCTC: currentCTC,
      newCTC,
      increaseAmount,
      increasePercentage,
      effectiveDate: new Date(parsed.effectiveDate),
      reason: parsed.reason,
      approvedBy: parsed.approvedBy ?? null,
      createdAt: new Date(),
    };

    const newBreakdown = await this.calculateBreakdown({
      employeeId: parsed.employeeId,
      annualCTC: parsed.newAnnualCTC,
      structureId: parsed.structureId,
    });

    return { revision, newBreakdown };
  }

  /**
   * Get salary revision history for an employee.
   */
  async getRevisionHistory(employeeId: string): Promise<SalaryRevisionRecord[]> {
    // In production: query from DB
    return MOCK_REVISION_HISTORY.filter(r => r.employeeId === employeeId);
  }
}

// Singleton export
export const salaryStructureService = new SalaryStructureService();
