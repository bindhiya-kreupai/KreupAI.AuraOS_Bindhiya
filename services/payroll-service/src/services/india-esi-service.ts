/**
 * India ESI (Employee State Insurance) Service — India Statutory Compliance
 *
 * Contribution Rules (ESI Act, 1948 — effective 2019 revision):
 *  Applicability : Establishments with 10+ employees; gross salary <= Rs 21,000/month
 *                  (Rs 25,000 for persons with disabilities)
 *  Employee contribution : 0.75% of gross salary
 *  Employer contribution : 3.25% of gross salary
 *  Total rate           : 4.00% of gross salary
 *
 *  ESI benefits cover medical, disability, maternity, dependent's relief, etc.
 *  IP (Insured Person) Number: unique ESI ID per employee
 *
 * References: ESIC Notification S.O. 1005(E) dated 12.03.2019
 */

import { z } from 'zod';
import Decimal from 'decimal.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum gross salary for ESI eligibility (Rs/month) */
export const ESI_GROSS_CEILING = new Decimal(21000);

/** ESI ceiling for persons with disabilities (Rs/month) */
export const ESI_DISABILITY_CEILING = new Decimal(25000);

/** Employee ESI contribution rate: 0.75% */
export const EMPLOYEE_ESI_RATE = new Decimal('0.0075');

/** Employer ESI contribution rate: 3.25% */
export const EMPLOYER_ESI_RATE = new Decimal('0.0325');

/** Total ESI rate: 4.00% */
export const TOTAL_ESI_RATE = new Decimal('0.04');

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const ESICalculateSchema = z.object({
  employeeId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  grossSalary: z.number().nonnegative(),
  isDisabled: z.boolean().default(false),
  ipNumber: z.string().optional(),
});

export const ESIEligibilitySchema = z.object({
  grossSalary: z.number().nonnegative(),
  isDisabled: z.boolean().default(false),
});

export const ESIGenerateReturnSchema = z.object({
  tenantId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  submittedByUserId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ESICalculateInput = z.infer<typeof ESICalculateSchema>;
export type ESIEligibilityInput = z.infer<typeof ESIEligibilitySchema>;
export type ESIGenerateReturnInput = z.infer<typeof ESIGenerateReturnSchema>;

export interface ESIEligibilityResult {
  isEligible: boolean;
  grossSalary: Decimal;
  ceiling: Decimal;
  exceedsBy: Decimal | null;
  reason: string;
}

export interface ESIContributionBreakdown {
  employeeId: string;
  ipNumber: string | null;
  grossSalary: Decimal;
  isEligible: boolean;
  isDisabled: boolean;

  employeeContribution: Decimal;  // 0.75% of gross
  employerContribution: Decimal;  // 3.25% of gross
  totalContribution: Decimal;     // 4.00% of gross

  employeeEffectiveRate: number;  // %
  employerEffectiveRate: number;  // %
}

export interface ESIReturnRecord {
  ipNumber: string;
  employeeName: string;
  grossWages: number;
  employeeContrib: number;
  employerContrib: number;
  totalContrib: number;
  daysWorked: number;
}

export interface ESIReturnGenerationResult {
  submissionId: string;
  fileName: string;
  returnContent: string;
  month: string;
  totalEmployees: number;
  totalEligible: number;
  totalIneligible: number;
  totalEmployeeContrib: Decimal;
  totalEmployerContrib: Decimal;
  grandTotal: Decimal;
  errors: Array<{ employeeId: string; message: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const contributionMonth = (year: number, month: number): string =>
  `${year}-${String(month).padStart(2, '0')}`;

const formatINR = (amount: Decimal): string =>
  `Rs ${amount.toFixed(2)}`;

// ---------------------------------------------------------------------------
// India ESI Service
// ---------------------------------------------------------------------------

export class IndiaESIService {
  /**
   * Check if an employee is eligible for ESI based on gross salary.
   *
   * Note: Eligibility is determined at the start of the contribution period.
   * Once enrolled, even if gross exceeds ceiling mid-year, contributions
   * continue till the end of the contribution period (April-September / October-March).
   */
  checkESIEligibility(input: ESIEligibilityInput): ESIEligibilityResult {
    const parsed = ESIEligibilitySchema.parse(input);

    const gross = new Decimal(parsed.grossSalary);
    const ceiling = parsed.isDisabled ? ESI_DISABILITY_CEILING : ESI_GROSS_CEILING;
    const isEligible = gross.lte(ceiling);
    const exceedsBy = isEligible ? null : gross.minus(ceiling);

    return {
      isEligible,
      grossSalary: gross,
      ceiling,
      exceedsBy,
      reason: isEligible
        ? `Eligible — gross ${formatINR(gross)} is within ${formatINR(ceiling)} ceiling`
        : `Not eligible — gross ${formatINR(gross)} exceeds ${formatINR(ceiling)} ceiling by ${formatINR(exceedsBy!)}`,
    };
  }

  /**
   * Calculate ESI contributions for a single employee for a given month.
   * Returns zero contributions if employee is not eligible.
   */
  calculateESIContribution(input: ESICalculateInput): ESIContributionBreakdown {
    const parsed = ESICalculateSchema.parse(input);

    const gross = new Decimal(parsed.grossSalary);
    const eligibility = this.checkESIEligibility({
      grossSalary: parsed.grossSalary,
      isDisabled: parsed.isDisabled,
    });

    if (!eligibility.isEligible) {
      return {
        employeeId: parsed.employeeId,
        ipNumber: parsed.ipNumber ?? null,
        grossSalary: gross,
        isEligible: false,
        isDisabled: parsed.isDisabled,
        employeeContribution: new Decimal(0),
        employerContribution: new Decimal(0),
        totalContribution: new Decimal(0),
        employeeEffectiveRate: 0,
        employerEffectiveRate: 0,
      };
    }

    const employeeContrib = gross.mul(EMPLOYEE_ESI_RATE).toDecimalPlaces(2);
    const employerContrib = gross.mul(EMPLOYER_ESI_RATE).toDecimalPlaces(2);
    const total = employeeContrib.plus(employerContrib);

    return {
      employeeId: parsed.employeeId,
      ipNumber: parsed.ipNumber ?? null,
      grossSalary: gross,
      isEligible: true,
      isDisabled: parsed.isDisabled,
      employeeContribution: employeeContrib,
      employerContribution: employerContrib,
      totalContribution: total,
      employeeEffectiveRate: EMPLOYEE_ESI_RATE.mul(100).toNumber(),
      employerEffectiveRate: EMPLOYER_ESI_RATE.mul(100).toNumber(),
    };
  }

  /**
   * Generate ESI half-yearly return for ESIC portal upload.
   *
   * ESIC return format: CSV suitable for ESIC portal (Form 3 equivalent).
   * Contribution periods: April-September (filed by Nov 11) / October-March (filed by May 11).
   *
   * Columns: IPNumber, EmployeeName, GrossWages, EmployeeContrib, EmployerContrib, Total, DaysWorked
   */
  async generateESIReturn(input: ESIGenerateReturnInput): Promise<ESIReturnGenerationResult> {
    const parsed = ESIGenerateReturnSchema.parse(input);

    // Fetch all employees with their compliance/payroll data
    const employees: any[] = await (prisma as any).employeeCompliance
      ? await (prisma as any).employeeCompliance.findMany({
          where: {
            tenantId: parsed.tenantId,
          },
          include: { employee: true },
        })
      : [];

    const errors: Array<{ employeeId: string; message: string }> = [];
    const returnRows: ESIReturnRecord[] = [];
    const csvRows: string[] = [];

    let totalEligible = 0;
    let totalIneligible = 0;
    let totalEEContrib = new Decimal(0);
    let totalERContrib = new Decimal(0);

    // CSV Header
    csvRows.push(
      `IP Number,Employee Name,Gross Wages (Rs),Employee Contribution (Rs),` +
        `Employer Contribution (Rs),Total Contribution (Rs),Days Worked`
    );

    for (const emp of employees) {
      try {
        const grossSalary = Number(emp.grossSalary ?? emp.grossWages ?? 0);
        const eligibility = this.checkESIEligibility({
          grossSalary,
          isDisabled: emp.isDisabled ?? false,
        });

        if (!eligibility.isEligible) {
          totalIneligible++;
          continue;
        }

        if (!emp.esiIPNumber) {
          errors.push({ employeeId: emp.employeeId, message: 'ESI IP Number not assigned' });
          totalIneligible++;
          continue;
        }

        const breakdown = this.calculateESIContribution({
          employeeId: emp.employeeId,
          month: parsed.month,
          year: parsed.year,
          grossSalary,
          isDisabled: emp.isDisabled ?? false,
          ipNumber: emp.esiIPNumber,
        });

        const employeeName = `${emp.employee?.firstName ?? ''} ${emp.employee?.lastName ?? ''}`.trim();
        const daysWorked = emp.daysWorked ?? 26;

        returnRows.push({
          ipNumber: emp.esiIPNumber,
          employeeName,
          grossWages: breakdown.grossSalary.toNumber(),
          employeeContrib: breakdown.employeeContribution.toNumber(),
          employerContrib: breakdown.employerContribution.toNumber(),
          totalContrib: breakdown.totalContribution.toNumber(),
          daysWorked,
        });

        csvRows.push(
          `${emp.esiIPNumber},${employeeName},${breakdown.grossSalary.toFixed(2)},` +
            `${breakdown.employeeContribution.toFixed(2)},${breakdown.employerContribution.toFixed(2)},` +
            `${breakdown.totalContribution.toFixed(2)},${daysWorked}`
        );

        totalEligible++;
        totalEEContrib = totalEEContrib.plus(breakdown.employeeContribution);
        totalERContrib = totalERContrib.plus(breakdown.employerContribution);
      } catch (err) {
        errors.push({
          employeeId: emp.employeeId,
          message: err instanceof Error ? err.message : 'Calculation error',
        });
      }
    }

    const grandTotal = totalEEContrib.plus(totalERContrib);
    const monthStr = contributionMonth(parsed.year, parsed.month);

    // Summary rows
    csvRows.push(`,,,,,,`);
    csvRows.push(`TOTAL,,${returnRows.reduce((s, r) => s + r.grossWages, 0).toFixed(2)},${totalEEContrib.toFixed(2)},${totalERContrib.toFixed(2)},${grandTotal.toFixed(2)},`);

    const fileName = `ESI_RETURN_${parsed.tenantId}_${monthStr}_${Date.now()}.csv`;
    const returnContent = csvRows.join('\n');

    // Persist submission
    let submissionId = `esi-return-${parsed.tenantId}-${monthStr}-${Date.now()}`;
    try {
      const rec = await (prisma as any).indiaESISubmission?.create({
        data: {
          tenantId: parsed.tenantId,
          contributionMonth: monthStr,
          status: errors.length > 0 && totalEligible === 0 ? 'FAILED' : 'PENDING',
          fileName,
          totalEmployees: employees.length,
          totalEligible,
          totalIneligible,
          totalEmployeeContrib: totalEEContrib,
          totalEmployerContrib: totalERContrib,
          grandTotal,
          errors: errors.length > 0 ? (errors as any) : undefined,
          submittedBy: parsed.submittedByUserId,
        },
      });
      if (rec?.id) submissionId = rec.id;
    } catch {
      // Model may not exist yet — continue with generated ID
    }

    return {
      submissionId,
      fileName,
      returnContent,
      month: monthStr,
      totalEmployees: employees.length,
      totalEligible,
      totalIneligible,
      totalEmployeeContrib: totalEEContrib,
      totalEmployerContrib: totalERContrib,
      grandTotal,
      errors,
    };
  }

  /**
   * Quick preview of ESI contribution for a given gross salary (no DB).
   * Useful for the frontend calculator.
   */
  previewESIContribution(
    grossSalary: number,
    isDisabled: boolean = false
  ): {
    isEligible: boolean;
    grossSalary: number;
    ceiling: number;
    employeeContrib: number;
    employerContrib: number;
    totalContrib: number;
    employeeRate: number;
    employerRate: number;
    totalRate: number;
    reason: string;
  } {
    const eligibility = this.checkESIEligibility({ grossSalary, isDisabled });

    if (!eligibility.isEligible) {
      return {
        isEligible: false,
        grossSalary,
        ceiling: eligibility.ceiling.toNumber(),
        employeeContrib: 0,
        employerContrib: 0,
        totalContrib: 0,
        employeeRate: 0,
        employerRate: 0,
        totalRate: 0,
        reason: eligibility.reason,
      };
    }

    const gross = new Decimal(grossSalary);
    const eeContrib = gross.mul(EMPLOYEE_ESI_RATE).toDecimalPlaces(2);
    const erContrib = gross.mul(EMPLOYER_ESI_RATE).toDecimalPlaces(2);
    const total = eeContrib.plus(erContrib);

    return {
      isEligible: true,
      grossSalary,
      ceiling: eligibility.ceiling.toNumber(),
      employeeContrib: eeContrib.toNumber(),
      employerContrib: erContrib.toNumber(),
      totalContrib: total.toNumber(),
      employeeRate: EMPLOYEE_ESI_RATE.mul(100).toNumber(),
      employerRate: EMPLOYER_ESI_RATE.mul(100).toNumber(),
      totalRate: TOTAL_ESI_RATE.mul(100).toNumber(),
      reason: eligibility.reason,
    };
  }
}

export const indiaESIService = new IndiaESIService();
