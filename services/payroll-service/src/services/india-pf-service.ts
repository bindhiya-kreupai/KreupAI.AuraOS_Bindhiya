/**
 * India PF (Provident Fund / EPF) Service — India Statutory Compliance
 *
 * Contribution Rules (EPF & MP Act, 1952):
 *  Employee contribution : 12% of (Basic + DA), capped at Rs 15,000/month wage ceiling
 *  Employer contribution : 12% of (Basic + DA), split as:
 *    - 8.33% → EPS (Employee Pension Scheme), capped at Rs 15,000 base  (max Rs 1,250/month)
 *    - 3.67% → EPF (Employee Provident Fund)
 *  Admin charges:
 *    - 0.50% EPF Admin (on EPF wages)
 *    - 0.01% EDLI (Employee Deposit Linked Insurance)
 *
 *  UAN: Universal Account Number — unique 12-digit ID per employee
 *  ECR: Electronic Challan cum Return — monthly filing to EPFO portal
 *
 * References: EPFO Circular, Budget 2021 — wage ceiling Rs 15,000
 */

import { z } from 'zod';
import Decimal from 'decimal.js';
import { prisma } from '@aura/database';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum pensionable wage for EPS calculation (Rs/month) */
export const PF_WAGE_CEILING = new Decimal(15000);

/** Employee EPF contribution rate: 12% of (Basic + DA) */
export const EMPLOYEE_EPF_RATE = new Decimal('0.12');

/** Employer total rate: 12% of (Basic + DA) */
export const EMPLOYER_TOTAL_RATE = new Decimal('0.12');

/** Employer EPS rate: 8.33% of capped wage */
export const EMPLOYER_EPS_RATE = new Decimal('0.0833');

/** Employer EPF rate: 3.67% of capped wage (= 12% - 8.33%) */
export const EMPLOYER_EPF_RATE = new Decimal('0.0367');

/** Admin charge on EPF: 0.50% */
export const EPF_ADMIN_RATE = new Decimal('0.005');

/** EDLI charge: 0.01% */
export const EDLI_RATE = new Decimal('0.0001');

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const PFCalculateSchema = z.object({
  employeeId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  basicSalary: z.number().nonnegative(),
  daAllowance: z.number().nonnegative().default(0),
  uan: z.string().regex(/^\d{12}$/, 'UAN must be exactly 12 digits').optional(),
});

export const PFGenerateECRSchema = z.object({
  tenantId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  submittedByUserId: z.string().uuid(),
});

export const PFMonthlySummarySchema = z.object({
  tenantId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PFCalculateInput = z.infer<typeof PFCalculateSchema>;
export type PFGenerateECRInput = z.infer<typeof PFGenerateECRSchema>;
export type PFMonthlySummaryInput = z.infer<typeof PFMonthlySummarySchema>;

export interface PFContributionBreakdown {
  employeeId: string;
  uan: string | null;
  basicSalary: Decimal;
  daAllowance: Decimal;
  pfWages: Decimal;          // Basic + DA (before ceiling)
  cappedPFWages: Decimal;    // min(pfWages, 15,000)
  isCapped: boolean;

  // Employee side
  employeeEPFContribution: Decimal;   // 12% of pfWages (NOT capped — employee can contribute on full wages)

  // Employer side
  employerEPSContribution: Decimal;   // 8.33% of capped wages (max 1,250/month)
  employerEPFContribution: Decimal;   // 3.67% of capped wages
  totalEmployerContribution: Decimal; // sum = 12% of capped

  // Admin
  epfAdminCharge: Decimal;            // 0.50% of capped wages
  edliCharge: Decimal;                // 0.01% of capped wages

  // Grand total payable by employer per employee
  totalPayable: Decimal;
}

export interface ECRRecord {
  uan: string;
  memberName: string;
  fatherHusbandName: string;
  dateOfBirth: string;
  gender: string;
  grossWages: number;
  epfWages: number;
  epsWages: number;
  edliWages: number;
  eeContrib: number;       // Employee EPF contribution
  erContrib: number;       // Employer EPF contribution
  epsContrib: number;      // Employer EPS contribution
  ncp: number;             // Non-contributing periods (days)
  refund: number;
}

export interface ECRGenerationResult {
  submissionId: string;
  fileName: string;
  ecrContent: string;
  month: string;
  totalEmployees: number;
  totalEEContrib: Decimal;
  totalERContrib: Decimal;
  totalEPSContrib: Decimal;
  totalAdminCharges: Decimal;
  grandTotal: Decimal;
  errors: Array<{ employeeId: string; message: string }>;
}

export interface PFMonthlySummary {
  tenantId: string;
  month: string;
  totalEmployees: number;
  totalEPFWages: Decimal;
  totalEmployeeContrib: Decimal;
  totalEmployerEPFContrib: Decimal;
  totalEPSContrib: Decimal;
  totalAdminCharges: Decimal;
  totalEDLI: Decimal;
  grandTotalPayable: Decimal;
  pendingECR: boolean;
  ecrFileName: string | null;
  breakdown: PFContributionBreakdown[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const monthName = (m: number): string =>
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1];

const contributionMonth = (year: number, month: number): string =>
  `${year}-${String(month).padStart(2, '0')}`;

// ---------------------------------------------------------------------------
// India PF Service
// ---------------------------------------------------------------------------

export class IndiaPFService {
  /**
   * Calculate EPF/EPS contributions for a single employee.
   *
   * Key rules:
   *  - Employee contributes 12% of full (Basic + DA) wages (no ceiling on employee side in law, but
   *    for statutory minimum we use the wage ceiling logic for employer side).
   *  - Employer EPS is capped at Rs 15,000 wage ceiling (max contribution = Rs 1,250/month).
   *  - Employer EPF = Total employer (12% of capped) - EPS contribution.
   */
  calculatePFContribution(input: PFCalculateInput): PFContributionBreakdown {
    const parsed = PFCalculateSchema.parse(input);

    const basic = new Decimal(parsed.basicSalary);
    const da = new Decimal(parsed.daAllowance ?? 0);
    const pfWages = basic.plus(da);
    const cappedWages = Decimal.min(pfWages, PF_WAGE_CEILING);
    const isCapped = pfWages.gt(PF_WAGE_CEILING);

    // Employee contribution: 12% of actual PF wages (employee may contribute on higher wages)
    const employeeEPF = pfWages.mul(EMPLOYEE_EPF_RATE).toDecimalPlaces(2);

    // Employer EPS: 8.33% of CAPPED wages
    const employerEPS = cappedWages.mul(EMPLOYER_EPS_RATE).toDecimalPlaces(2);

    // Employer EPF: 3.67% of capped wages
    const employerEPF = cappedWages.mul(EMPLOYER_EPF_RATE).toDecimalPlaces(2);

    // Total employer contribution: 12% of capped wages
    const totalEmployer = employerEPS.plus(employerEPF);

    // Admin charges on capped EPF wages
    const adminCharge = cappedWages.mul(EPF_ADMIN_RATE).toDecimalPlaces(2);
    const edli = cappedWages.mul(EDLI_RATE).toDecimalPlaces(2);

    // Total payable by employer = employer contrib + admin + EDLI + employee (remitted by employer)
    const totalPayable = employeeEPF.plus(totalEmployer).plus(adminCharge).plus(edli);

    return {
      employeeId: parsed.employeeId,
      uan: parsed.uan ?? null,
      basicSalary: basic,
      daAllowance: da,
      pfWages,
      cappedPFWages: cappedWages,
      isCapped,
      employeeEPFContribution: employeeEPF,
      employerEPSContribution: employerEPS,
      employerEPFContribution: employerEPF,
      totalEmployerContribution: totalEmployer,
      epfAdminCharge: adminCharge,
      edliCharge: edli,
      totalPayable,
    };
  }

  /**
   * Generate ECR (Electronic Challan cum Return) file for EPFO portal upload.
   *
   * ECR 2.0 Format (pipe-delimited):
   *   UAN#MemberName#FatherHusbandName#DOB#Gender#GrossWages#EPFWages#EPSWages#
   *   EDLIWages#EPFContriEE#EPFContriER#EPSContri#NCP#Refund
   */
  async generateECR(input: PFGenerateECRInput): Promise<ECRGenerationResult> {
    const parsed = PFGenerateECRSchema.parse(input);

    // Fetch employees with PF-enabled compliance settings
    const employees: any[] = await (prisma as any).employeeCompliance
      ? await (prisma as any).employeeCompliance.findMany({
          where: {
            tenantId: parsed.tenantId,
            enablePF: true,
          },
          include: { employee: true },
        })
      : [];

    const errors: Array<{ employeeId: string; message: string }> = [];
    const ecrRows: string[] = [];
    const breakdowns: ECRRecord[] = [];

    let totalEE = new Decimal(0);
    let totalER = new Decimal(0);
    let totalEPS = new Decimal(0);
    let totalAdmin = new Decimal(0);

    // ECR 2.0 header line
    ecrRows.push(`#~#`);
    ecrRows.push(
      `ESTABLISHMENT ID~${parsed.tenantId}~ESTABLISHMENT NAME~AuraOS Tenant~` +
        `WAGE MONTH~${monthName(parsed.month).toUpperCase()}${parsed.year}`
    );
    ecrRows.push(
      `TRRN~AUTO~CONTRIBUTION MONTH~${contributionMonth(parsed.year, parsed.month)}~TOTAL EMPLOYEES~${employees.length}`
    );
    ecrRows.push(
      `UAN~MEM_NAME~FAT_HUSB_NAME~DOB~GENDER~GROSS_WAGES~EPF_WAGES~EPS_WAGES~EDLI_WAGES~` +
        `EE_EPF_CONTRI~ER_EPF_CONTRI~EPS_CONTRI~NCP~REFUND`
    );

    for (const emp of employees) {
      try {
        if (!emp.uan) {
          errors.push({ employeeId: emp.employeeId, message: 'UAN not assigned' });
          continue;
        }

        const breakdown = this.calculatePFContribution({
          employeeId: emp.employeeId,
          month: parsed.month,
          year: parsed.year,
          basicSalary: Number(emp.basicSalary ?? emp.basicWage ?? 0),
          daAllowance: Number(emp.daAllowance ?? 0),
          uan: emp.uan,
        });

        const employeeName = `${emp.employee?.firstName ?? ''} ${emp.employee?.lastName ?? ''}`.trim();
        const fatherName = emp.fatherName ?? emp.employee?.fatherName ?? '';
        const dob = emp.employee?.dateOfBirth
          ? new Date(emp.employee.dateOfBirth).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '';
        const gender = emp.employee?.gender?.charAt(0)?.toUpperCase() ?? 'M';

        const grossWages = breakdown.pfWages.toNumber();
        const epfWages = breakdown.cappedPFWages.toNumber();
        const epsWages = breakdown.cappedPFWages.toNumber();
        const edliWages = breakdown.cappedPFWages.toNumber();

        const row =
          `${emp.uan}~${employeeName}~${fatherName}~${dob}~${gender}~` +
          `${grossWages.toFixed(0)}~${epfWages.toFixed(0)}~${epsWages.toFixed(0)}~${edliWages.toFixed(0)}~` +
          `${breakdown.employeeEPFContribution.toFixed(0)}~${breakdown.employerEPFContribution.toFixed(0)}~` +
          `${breakdown.employerEPSContribution.toFixed(0)}~0~0`;

        ecrRows.push(row);

        breakdowns.push({
          uan: emp.uan,
          memberName: employeeName,
          fatherHusbandName: fatherName,
          dateOfBirth: dob,
          gender,
          grossWages,
          epfWages,
          epsWages,
          edliWages,
          eeContrib: breakdown.employeeEPFContribution.toNumber(),
          erContrib: breakdown.employerEPFContribution.toNumber(),
          epsContrib: breakdown.employerEPSContribution.toNumber(),
          ncp: 0,
          refund: 0,
        });

        totalEE = totalEE.plus(breakdown.employeeEPFContribution);
        totalER = totalER.plus(breakdown.employerEPFContribution);
        totalEPS = totalEPS.plus(breakdown.employerEPSContribution);
        totalAdmin = totalAdmin.plus(breakdown.epfAdminCharge).plus(breakdown.edliCharge);
      } catch (err) {
        errors.push({
          employeeId: emp.employeeId,
          message: err instanceof Error ? err.message : 'Calculation error',
        });
      }
    }

    const grandTotal = totalEE.plus(totalER).plus(totalEPS).plus(totalAdmin);
    const totalEmployees = breakdowns.length;

    // Summary footer rows
    ecrRows.push(`#~#`);
    ecrRows.push(`TOTAL EE CONTRIBUTION~${totalEE.toFixed(0)}`);
    ecrRows.push(`TOTAL ER EPF CONTRIBUTION~${totalER.toFixed(0)}`);
    ecrRows.push(`TOTAL EPS CONTRIBUTION~${totalEPS.toFixed(0)}`);
    ecrRows.push(`TOTAL ADMIN CHARGES~${totalAdmin.toFixed(0)}`);
    ecrRows.push(`GRAND TOTAL~${grandTotal.toFixed(0)}`);

    const monthStr = contributionMonth(parsed.year, parsed.month);
    const fileName = `ECR_${parsed.tenantId}_${monthStr}_${Date.now()}.txt`;
    const ecrContent = ecrRows.join('\n');

    // Persist submission record (using a generic compliance submission if PF table not in schema)
    let submissionId = `pf-ecr-${parsed.tenantId}-${monthStr}-${Date.now()}`;
    try {
      const rec = await (prisma as any).indiaPFSubmission?.create({
        data: {
          tenantId: parsed.tenantId,
          contributionMonth: monthStr,
          status: errors.length > 0 && totalEmployees === 0 ? 'FAILED' : 'PENDING',
          fileName,
          totalEmployees,
          totalEEContrib: totalEE,
          totalEREPFContrib: totalER,
          totalEPSContrib: totalEPS,
          totalAdminCharges: totalAdmin,
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
      ecrContent,
      month: monthStr,
      totalEmployees,
      totalEEContrib: totalEE,
      totalERContrib: totalER,
      totalEPSContrib: totalEPS,
      totalAdminCharges: totalAdmin,
      grandTotal,
      errors,
    };
  }

  /**
   * Get a comprehensive monthly PF summary for a tenant.
   * Includes contribution breakdown per employee and aggregated totals.
   */
  async getMonthlyPFSummary(input: PFMonthlySummaryInput): Promise<PFMonthlySummary> {
    const parsed = PFMonthlySummarySchema.parse(input);
    const monthStr = contributionMonth(parsed.year, parsed.month);

    // Fetch PF-eligible employees
    const employees: any[] = await (prisma as any).employeeCompliance
      ? await (prisma as any).employeeCompliance.findMany({
          where: {
            tenantId: parsed.tenantId,
            enablePF: true,
          },
          include: { employee: true },
        })
      : [];

    const breakdowns: PFContributionBreakdown[] = [];
    let totalWages = new Decimal(0);
    let totalEE = new Decimal(0);
    let totalERPF = new Decimal(0);
    let totalEPS = new Decimal(0);
    let totalAdmin = new Decimal(0);
    let totalEDLI = new Decimal(0);

    for (const emp of employees) {
      try {
        const bd = this.calculatePFContribution({
          employeeId: emp.employeeId,
          month: parsed.month,
          year: parsed.year,
          basicSalary: Number(emp.basicSalary ?? emp.basicWage ?? 0),
          daAllowance: Number(emp.daAllowance ?? 0),
          uan: emp.uan,
        });

        breakdowns.push(bd);
        totalWages = totalWages.plus(bd.pfWages);
        totalEE = totalEE.plus(bd.employeeEPFContribution);
        totalERPF = totalERPF.plus(bd.employerEPFContribution);
        totalEPS = totalEPS.plus(bd.employerEPSContribution);
        totalAdmin = totalAdmin.plus(bd.epfAdminCharge);
        totalEDLI = totalEDLI.plus(bd.edliCharge);
      } catch {
        // Skip problematic records
      }
    }

    const grandTotal = totalEE.plus(totalERPF).plus(totalEPS).plus(totalAdmin).plus(totalEDLI);

    // Check if ECR has been generated for this month
    let pendingECR = true;
    let ecrFileName: string | null = null;
    try {
      const submission = await (prisma as any).indiaPFSubmission?.findFirst({
        where: {
          tenantId: parsed.tenantId,
          contributionMonth: monthStr,
          status: { in: ['PENDING', 'SUBMITTED', 'FILED'] },
        },
        orderBy: { createdAt: 'desc' },
      });
      if (submission) {
        pendingECR = submission.status === 'PENDING';
        ecrFileName = submission.fileName;
      }
    } catch {
      // Model may not exist yet
    }

    return {
      tenantId: parsed.tenantId,
      month: monthStr,
      totalEmployees: breakdowns.length,
      totalEPFWages: totalWages,
      totalEmployeeContrib: totalEE,
      totalEmployerEPFContrib: totalERPF,
      totalEPSContrib: totalEPS,
      totalAdminCharges: totalAdmin,
      totalEDLI: totalEDLI,
      grandTotalPayable: grandTotal,
      pendingECR,
      ecrFileName,
      breakdown: breakdowns,
    };
  }

  /**
   * Quick preview of PF contribution for a single employee (no DB persistence).
   * Useful for the frontend calculator.
   */
  previewPFContribution(
    basicSalary: number,
    daAllowance: number = 0
  ): {
    pfWages: number;
    cappedWages: number;
    isCapped: boolean;
    employee: { epf: number };
    employer: { epf: number; eps: number; total: number };
    admin: { epfAdmin: number; edli: number };
    totalPayable: number;
    effectiveEmployeeRate: number;
    effectiveEmployerRate: number;
  } {
    const wages = new Decimal(basicSalary).plus(daAllowance);
    const capped = Decimal.min(wages, PF_WAGE_CEILING);
    const isCapped = wages.gt(PF_WAGE_CEILING);

    const employeeEPF = wages.mul(EMPLOYEE_EPF_RATE).toDecimalPlaces(2);
    const employerEPS = capped.mul(EMPLOYER_EPS_RATE).toDecimalPlaces(2);
    const employerEPF = capped.mul(EMPLOYER_EPF_RATE).toDecimalPlaces(2);
    const adminCharge = capped.mul(EPF_ADMIN_RATE).toDecimalPlaces(2);
    const edli = capped.mul(EDLI_RATE).toDecimalPlaces(2);

    const totalPayable = employeeEPF.plus(employerEPS).plus(employerEPF).plus(adminCharge).plus(edli);

    return {
      pfWages: wages.toNumber(),
      cappedWages: capped.toNumber(),
      isCapped,
      employee: { epf: employeeEPF.toNumber() },
      employer: {
        epf: employerEPF.toNumber(),
        eps: employerEPS.toNumber(),
        total: employerEPF.plus(employerEPS).toNumber(),
      },
      admin: { epfAdmin: adminCharge.toNumber(), edli: edli.toNumber() },
      totalPayable: totalPayable.toNumber(),
      effectiveEmployeeRate: wages.gt(0)
        ? employeeEPF.div(wages).mul(100).toDecimalPlaces(2).toNumber()
        : 0,
      effectiveEmployerRate: wages.gt(0)
        ? employerEPF.plus(employerEPS).div(wages).mul(100).toDecimalPlaces(2).toNumber()
        : 0,
    };
  }
}

export const indiaPFService = new IndiaPFService();
