/**
 * GOSI (General Organization for Social Insurance) Service — KSA Compliance
 *
 * Contribution Rules (2024):
 *  Saudi nationals:
 *    - Pension:  Employee 9.75% + Employer 9.75%  = 19.50%
 *    - SANED:    Employee 0.75% + Employer 0.75%   =  1.50%  (Unemployment Insurance)
 *    - Occupational Hazards: Employer 2.00%
 *    => Total on employee side: 10.50%; employer side: 12.50%
 *    => Salary cap: SAR 45,000/month (basic + housing)
 *
 *  Non-Saudi nationals:
 *    - SANED only: Employee 2.00% + Employer 2.00% (no pension/annuities)
 *    => Salary cap: SAR 45,000/month for SANED base
 *
 * References: GOSI Circular No. SS/1451 (revised 2024)
 */

import { z } from 'zod';
import Decimal from 'decimal.js';
import { prisma } from '@aura/database';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum contributable salary (SAR per month) */
export const GOSI_SALARY_CAP = new Decimal(45000);

/** Saudi contribution rates */
export const SAUDI_RATES = {
  EMPLOYEE_PENSION: new Decimal('0.0975'), // 9.75%
  EMPLOYER_PENSION: new Decimal('0.0975'), // 9.75%
  EMPLOYEE_SANED: new Decimal('0.0075'),  // 0.75%
  EMPLOYER_SANED: new Decimal('0.0075'),  // 0.75%
  EMPLOYER_HAZARDS: new Decimal('0.02'),  // 2.00%
} as const;

/** Non-Saudi contribution rates (SANED only) */
export const NON_SAUDI_RATES = {
  EMPLOYEE_SANED: new Decimal('0.02'), // 2.00%
  EMPLOYER_SANED: new Decimal('0.02'), // 2.00%
} as const;

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const GosiCalculateSchema = z.object({
  employeeId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  basicSalary: z.number().positive(),
  housingAllowance: z.number().min(0).default(0),
  isSaudi: z.boolean(),
});

export const GosiGenerateFileSchema = z.object({
  tenantId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  submittedByUserId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GosiCalculateInput = z.infer<typeof GosiCalculateSchema>;
export type GosiGenerateFileInput = z.infer<typeof GosiGenerateFileSchema>;

export interface GosiContributionBreakdown {
  employeeId: string;
  isSaudi: boolean;
  basicSalary: Decimal;
  housingAllowance: Decimal;
  grossContributableSalary: Decimal;
  cappedSalary: Decimal;

  // Employee side
  employeePension: Decimal;     // 9.75% Saudis only
  employeeSaned: Decimal;       // 0.75% Saudis / 2% non-Saudis
  totalEmployeeContribution: Decimal;

  // Employer side
  employerPension: Decimal;     // 9.75% Saudis only
  employerSaned: Decimal;       // 0.75% Saudis / 2% non-Saudis
  employerOccupationalHazards: Decimal; // 2% Saudis only
  totalEmployerContribution: Decimal;

  // Grand total
  totalContribution: Decimal;
}

export interface GosiFileGenerationResult {
  submissionId: string;
  fileName: string;
  fileContent: string;
  totalEmployees: number;
  totalSaudis: number;
  totalNonSaudis: number;
  totalEmployeeContribution: Decimal;
  totalEmployerContribution: Decimal;
  grandTotal: Decimal;
  errors: Array<{ employeeId: string; message: string }>;
}

// ---------------------------------------------------------------------------
// GOSI Service Class
// ---------------------------------------------------------------------------

export class GosiService {
  /**
   * Calculate GOSI contributions for a single employee for a given month/year.
   *
   * Contribution base = basic salary + housing allowance, capped at SAR 45,000.
   */
  calculateContributions(input: GosiCalculateInput): GosiContributionBreakdown {
    const parsed = GosiCalculateSchema.parse(input);

    const basic = new Decimal(parsed.basicSalary);
    const housing = new Decimal(parsed.housingAllowance ?? 0);
    const gross = basic.plus(housing);
    const capped = Decimal.min(gross, GOSI_SALARY_CAP);

    let employeePension = new Decimal(0);
    let employerPension = new Decimal(0);
    let employeeSaned = new Decimal(0);
    let employerSaned = new Decimal(0);
    let employerOccupationalHazards = new Decimal(0);

    if (parsed.isSaudi) {
      // Full pension + SANED + Occupational Hazards
      employeePension = capped.mul(SAUDI_RATES.EMPLOYEE_PENSION).toDecimalPlaces(2);
      employerPension = capped.mul(SAUDI_RATES.EMPLOYER_PENSION).toDecimalPlaces(2);
      employeeSaned = capped.mul(SAUDI_RATES.EMPLOYEE_SANED).toDecimalPlaces(2);
      employerSaned = capped.mul(SAUDI_RATES.EMPLOYER_SANED).toDecimalPlaces(2);
      employerOccupationalHazards = capped.mul(SAUDI_RATES.EMPLOYER_HAZARDS).toDecimalPlaces(2);
    } else {
      // Non-Saudi: SANED only (Unemployment Insurance)
      employeeSaned = capped.mul(NON_SAUDI_RATES.EMPLOYEE_SANED).toDecimalPlaces(2);
      employerSaned = capped.mul(NON_SAUDI_RATES.EMPLOYER_SANED).toDecimalPlaces(2);
    }

    const totalEmployee = employeePension.plus(employeeSaned);
    const totalEmployer = employerPension.plus(employerSaned).plus(employerOccupationalHazards);
    const grandTotal = totalEmployee.plus(totalEmployer);

    return {
      employeeId: parsed.employeeId,
      isSaudi: parsed.isSaudi,
      basicSalary: basic,
      housingAllowance: housing,
      grossContributableSalary: gross,
      cappedSalary: capped,
      employeePension,
      employeeSaned,
      totalEmployeeContribution: totalEmployee,
      employerPension,
      employerSaned,
      employerOccupationalHazards,
      totalEmployerContribution: totalEmployer,
      totalContribution: grandTotal,
    };
  }

  /**
   * Generate a GOSI contribution file for all eligible employees in a tenant
   * for the specified month and year.
   *
   * Output format: CSV suitable for GOSI portal upload.
   * Columns: SubscriberNo, NationalID/Iqama, EmployeeName, Nationality,
   *          BasicSalary, HousingAllowance, ContributableSalary,
   *          EmployeeContribution, EmployerContribution, TotalContribution
   */
  async generateGosiFile(input: GosiGenerateFileInput): Promise<GosiFileGenerationResult> {
    const parsed = GosiGenerateFileSchema.parse(input);

    // 1. Fetch GOSI configuration
    const gosiConfig = await prisma.gOSIConfiguration.findFirst({
      where: {
        tenantId: parsed.tenantId,
        isActive: true,
      },
    });

    if (!gosiConfig) {
      throw new Error('No active GOSI configuration found for tenant');
    }

    // 2. Fetch employee payroll/profile data with GOSI-specific fields
    //    Using EmployeeCompliance model (iqamaNumber, nationalId, gosiSubscriptionNumber)
    //    and EmployeePayroll model for salary components
    const employeeCompliances = await (prisma as any).employeeCompliance
      ? await (prisma as any).employeeCompliance.findMany({
          where: { enableGOSI: true },
          include: { employee: true },
        })
      : [];

    const errors: Array<{ employeeId: string; message: string }> = [];
    const csvRows: string[] = [];
    const gosiRecords: any[] = [];

    let totalSaudis = 0;
    let totalNonSaudis = 0;
    let totalEmployeeContrib = new Decimal(0);
    let totalEmployerContrib = new Decimal(0);

    // CSV Header
    const header = [
      'SubscriberNumber',
      'NationalID',
      'IqamaNumber',
      'EmployeeName',
      'Nationality',
      'IsSaudi',
      'BasicSalary',
      'HousingAllowance',
      'ContributableSalary',
      'EmployeePension',
      'EmployeeSaned',
      'TotalEmployeeContribution',
      'EmployerPension',
      'EmployerSaned',
      'EmployerOccupationalHazards',
      'TotalEmployerContribution',
      'GrandTotal',
    ].join(',');
    csvRows.push(header);

    for (const comp of employeeCompliances) {
      try {
        if (!comp.basicWage && !comp.basicSalary) {
          errors.push({ employeeId: comp.employeeId, message: 'Basic salary not defined' });
          continue;
        }

        const isSaudi = comp.isSaudi ?? comp.nationality === 'SA' ?? false;
        const breakdown = this.calculateContributions({
          employeeId: comp.employeeId,
          month: parsed.month,
          year: parsed.year,
          basicSalary: Number(comp.basicWage ?? comp.basicSalary ?? 0),
          housingAllowance: Number(comp.housingAllowance ?? 0),
          isSaudi,
        });

        if (isSaudi) totalSaudis++;
        else totalNonSaudis++;

        totalEmployeeContrib = totalEmployeeContrib.plus(breakdown.totalEmployeeContribution);
        totalEmployerContrib = totalEmployerContrib.plus(breakdown.totalEmployerContribution);

        const row = [
          comp.gosiSubscriptionNumber ?? '',
          comp.nationalId ?? '',
          comp.iqamaNumber ?? '',
          `"${comp.employee?.firstName ?? ''} ${comp.employee?.lastName ?? ''}".trim()`,
          comp.nationality ?? '',
          isSaudi ? 'Y' : 'N',
          breakdown.basicSalary.toFixed(2),
          breakdown.housingAllowance.toFixed(2),
          breakdown.cappedSalary.toFixed(2),
          breakdown.employeePension.toFixed(2),
          breakdown.employeeSaned.toFixed(2),
          breakdown.totalEmployeeContribution.toFixed(2),
          breakdown.employerPension.toFixed(2),
          breakdown.employerSaned.toFixed(2),
          breakdown.employerOccupationalHazards.toFixed(2),
          breakdown.totalEmployerContribution.toFixed(2),
          breakdown.totalContribution.toFixed(2),
        ].join(',');
        csvRows.push(row);

        gosiRecords.push({
          employeeId: comp.employeeId,
          iqamaNumber: comp.iqamaNumber ?? null,
          nationalId: comp.nationalId ?? null,
          nationality: comp.nationality ?? 'SA',
          isSaudi,
          contributableSalary: breakdown.cappedSalary,
          basicSalary: breakdown.basicSalary,
          housingAllowance: breakdown.housingAllowance,
          employeePension: breakdown.employeePension,
          employerPension: breakdown.employerPension,
          sanedEmployee: breakdown.employeeSaned,
          sanedEmployer: breakdown.employerSaned,
          occupationalHazards: breakdown.employerOccupationalHazards,
          totalEmployee: breakdown.totalEmployeeContribution,
          totalEmployer: breakdown.totalEmployerContribution,
          status: 'PENDING',
        });
      } catch (err) {
        errors.push({
          employeeId: comp.employeeId,
          message: err instanceof Error ? err.message : 'Calculation error',
        });
      }
    }

    const totalEmployees = totalSaudis + totalNonSaudis;
    const grandTotal = totalEmployeeContrib.plus(totalEmployerContrib);
    const contributionMonth = `${parsed.year}-${String(parsed.month).padStart(2, '0')}`;
    const fileName = `GOSI_${gosiConfig.gosiSubscriptionNumber}_${contributionMonth}_${Date.now()}.csv`;
    const fileContent = csvRows.join('\n');

    // 3. Persist GOSI Submission
    const submission = await prisma.gOSISubmission.create({
      data: {
        tenantId: parsed.tenantId,
        gosiConfigId: gosiConfig.id,
        contributionMonth,
        status: errors.length > 0 && totalEmployees === 0 ? 'FAILED' : 'PENDING',
        fileName,
        totalEmployees,
        totalSaudis,
        totalNonSaudis,
        totalEmployeeContribution: totalEmployeeContrib,
        totalEmployerContribution: totalEmployerContrib,
        grandTotal,
        validationErrors: errors.length > 0 ? (errors as any) : undefined,
      },
    });

    // 4. Persist GOSI Records
    if (gosiRecords.length > 0) {
      await prisma.gOSIRecord.createMany({
        data: gosiRecords.map((r) => ({
          submissionId: submission.id,
          ...r,
        })),
      });
    }

    return {
      submissionId: submission.id,
      fileName,
      fileContent,
      totalEmployees,
      totalSaudis,
      totalNonSaudis,
      totalEmployeeContribution: totalEmployeeContrib,
      totalEmployerContribution: totalEmployerContrib,
      grandTotal,
      errors,
    };
  }

  /**
   * Calculate contributions preview for a single employee (no DB persistence).
   * Useful for the frontend calculator component.
   */
  previewContributions(
    basicSalary: number,
    housingAllowance: number,
    isSaudi: boolean
  ): {
    cappedSalary: number;
    isCapped: boolean;
    employee: {
      pension: number;
      saned: number;
      total: number;
    };
    employer: {
      pension: number;
      saned: number;
      hazards: number;
      total: number;
    };
    grandTotal: number;
    effectiveEmployeeRate: number;
    effectiveEmployerRate: number;
  } {
    const gross = new Decimal(basicSalary).plus(housingAllowance);
    const capped = Decimal.min(gross, GOSI_SALARY_CAP);
    const isCapped = gross.gt(GOSI_SALARY_CAP);

    let empPension = new Decimal(0);
    let empSaned = new Decimal(0);
    let erPension = new Decimal(0);
    let erSaned = new Decimal(0);
    let erHazards = new Decimal(0);

    if (isSaudi) {
      empPension = capped.mul(SAUDI_RATES.EMPLOYEE_PENSION).toDecimalPlaces(2);
      empSaned = capped.mul(SAUDI_RATES.EMPLOYEE_SANED).toDecimalPlaces(2);
      erPension = capped.mul(SAUDI_RATES.EMPLOYER_PENSION).toDecimalPlaces(2);
      erSaned = capped.mul(SAUDI_RATES.EMPLOYER_SANED).toDecimalPlaces(2);
      erHazards = capped.mul(SAUDI_RATES.EMPLOYER_HAZARDS).toDecimalPlaces(2);
    } else {
      empSaned = capped.mul(NON_SAUDI_RATES.EMPLOYEE_SANED).toDecimalPlaces(2);
      erSaned = capped.mul(NON_SAUDI_RATES.EMPLOYER_SANED).toDecimalPlaces(2);
    }

    const totalEmployee = empPension.plus(empSaned);
    const totalEmployer = erPension.plus(erSaned).plus(erHazards);
    const grandTotal = totalEmployee.plus(totalEmployer);

    const effectiveEmployeeRate = capped.gt(0)
      ? totalEmployee.div(capped).mul(100).toDecimalPlaces(2).toNumber()
      : 0;
    const effectiveEmployerRate = capped.gt(0)
      ? totalEmployer.div(capped).mul(100).toDecimalPlaces(2).toNumber()
      : 0;

    return {
      cappedSalary: capped.toNumber(),
      isCapped,
      employee: {
        pension: empPension.toNumber(),
        saned: empSaned.toNumber(),
        total: totalEmployee.toNumber(),
      },
      employer: {
        pension: erPension.toNumber(),
        saned: erSaned.toNumber(),
        hazards: erHazards.toNumber(),
        total: totalEmployer.toNumber(),
      },
      grandTotal: grandTotal.toNumber(),
      effectiveEmployeeRate,
      effectiveEmployerRate,
    };
  }
}

export const gosiService = new GosiService();
