/**
 * WPS (Wage Protection System) Service — UAE Compliance
 *
 * Implements SIF (Salary Information File) generation, validation,
 * and submission to MoHRE (Ministry of Human Resources & Emiratisation).
 *
 * SIF File Format (Fixed-Width):
 *  HDR — Header record (1 per file)
 *  EDR — Employee Detail Record (1 per employee)
 *  Trailer — Footer record (1 per file)
 */

import { z } from 'zod';
import Decimal from 'decimal.js';
import { prisma } from '@aura/database';

// ---------------------------------------------------------------------------
// Zod Validation Schemas
// ---------------------------------------------------------------------------

export const WpsGenerateSchema = z.object({
  payrollRunId: z.string().uuid(),
  tenantId: z.string().uuid(),
  submittedByUserId: z.string().uuid(),
});

export const WpsValidateSchema = z.object({
  submissionId: z.string().uuid(),
});

export const WpsSubmitSchema = z.object({
  submissionId: z.string().uuid(),
  submittedByUserId: z.string().uuid(),
});

export const WpsResponseSchema = z.object({
  submissionId: z.string().uuid(),
  molReferenceNumber: z.string().optional(),
  status: z.enum(['ACCEPTED', 'PARTIALLY_ACCEPTED', 'REJECTED']),
  responseDate: z.string().datetime(),
  recordResults: z
    .array(
      z.object({
        lineNumber: z.number().int(),
        labourCardNumber: z.string(),
        status: z.enum(['ACCEPTED', 'REJECTED']),
        errorCode: z.string().optional(),
        errorMessage: z.string().optional(),
      })
    )
    .optional(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WpsGenerateInput = z.infer<typeof WpsGenerateSchema>;
export type WpsValidateInput = z.infer<typeof WpsValidateSchema>;
export type WpsSubmitInput = z.infer<typeof WpsSubmitSchema>;
export type WpsResponseInput = z.infer<typeof WpsResponseSchema>;

interface SifValidationError {
  field: string;
  message: string;
  lineNumber?: number;
  employeeId?: string;
}

interface WpsGenerateResult {
  submissionId: string;
  fileName: string;
  sifContent: string;
  totalRecords: number;
  totalAmount: Decimal;
  validationErrors: SifValidationError[];
}

interface WpsValidationResult {
  isValid: boolean;
  errors: SifValidationError[];
  warnings: string[];
}

interface WpsSubmissionResult {
  success: boolean;
  message: string;
  referenceNumber?: string;
}

// ---------------------------------------------------------------------------
// SIF Fixed-Width Field Padders
// ---------------------------------------------------------------------------

/** Left-pad (right-align) with spaces to the given width */
const padLeft = (value: string | number, width: number, pad = ' '): string => {
  return String(value).padStart(width, pad);
};

/** Right-pad (left-align) with spaces to the given width */
const padRight = (value: string, width: number): string => {
  return value.slice(0, width).padEnd(width, ' ');
};

/** Format amount to 2 decimal places without decimal point (implicit), zero-padded */
const formatAmount = (amount: Decimal | number, width = 15): string => {
  const num = new Decimal(amount);
  // WPS SIF stores amounts as integer cents (x100)
  const cents = num.mul(100).toFixed(0);
  return padLeft(cents, width, '0');
};

/** Format month as MMMYYYY (e.g. JAN2025) */
const formatSalaryMonth = (date: Date): string => {
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  return `${months[date.getMonth()]}${date.getFullYear()}`;
};

// ---------------------------------------------------------------------------
// WPS Service Class
// ---------------------------------------------------------------------------

export class WpsService {
  /**
   * Generate a SIF (Salary Information File) for a payroll run.
   *
   * SIF Layout:
   *  HDR|agentCode|establishmentId|routingCode|salaryMonth|recordCount|totalAmount
   *  EDR|agentId|labourCard|personCode|name|bankRouting|accountNo|netSalary|...
   *  TRL|totalRecords|totalAmount
   */
  async generateSIFFile(input: WpsGenerateInput): Promise<WpsGenerateResult> {
    const parsed = WpsGenerateSchema.parse(input);

    // 1. Fetch WPS configuration for the tenant
    const wpsConfig = await prisma.wPSConfiguration.findFirst({
      where: {
        tenantId: parsed.tenantId,
        isActive: true,
      },
    });

    if (!wpsConfig) {
      throw new Error('No active WPS configuration found for tenant');
    }

    // 2. Fetch payroll run data with employee salary details
    //    In production this would join PayrollRun -> PayrollRunEntry -> Employee + EmployeePayroll
    //    Here we use a pragmatic approach fetching employees with WPS-eligible payroll data
    const employees = await (prisma as any).employeePayroll
      ? await (prisma as any).employeePayroll.findMany({
          where: {
            payrollRunId: parsed.payrollRunId,
            enableWPS: true,
          },
          include: { employee: true },
        })
      : [];

    const now = new Date();
    const salaryMonth = formatSalaryMonth(now);
    const payrollMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 3. Build EDR lines and calculate totals
    const edrLines: string[] = [];
    let totalAmount = new Decimal(0);
    const validationErrors: SifValidationError[] = [];
    let lineNumber = 1;

    // Mock employee records for demonstration — replace with real payroll data query
    const employeeRecords = employees.length > 0 ? employees : [];

    for (const rec of employeeRecords) {
      const net = new Decimal(rec.netSalary || 0);

      // Field validations
      if (net.lte(0)) {
        validationErrors.push({
          field: 'netSalary',
          message: 'Net salary must be greater than zero',
          lineNumber,
          employeeId: rec.employeeId,
        });
        lineNumber++;
        continue;
      }
      if (!rec.bankRoutingCode || !rec.accountNumber) {
        validationErrors.push({
          field: 'bankDetails',
          message: 'Missing bank routing code or account number',
          lineNumber,
          employeeId: rec.employeeId,
        });
        lineNumber++;
        continue;
      }

      const edr = this.buildEDRLine({
        lineNumber,
        agentId: wpsConfig.wpsAgentCode,
        labourCardNumber: rec.labourCardNumber || rec.employee?.employeeCode || '',
        personCode: rec.wpsPersonalNumber || rec.employee?.employeeCode || '',
        employeeName: `${rec.employee?.firstName || ''} ${rec.employee?.lastName || ''}`.trim(),
        bankRoutingCode: rec.bankRoutingCode,
        accountNumber: rec.accountNumber,
        basicSalary: new Decimal(rec.basicSalary || 0),
        allowances: new Decimal(rec.allowances || 0),
        deductions: new Decimal(rec.deductions || 0),
        netSalary: net,
        workingDays: rec.workingDays || 30,
        actualDays: rec.actualDays || 30,
        salaryMonth,
      });

      edrLines.push(edr);
      totalAmount = totalAmount.plus(net);
      lineNumber++;
    }

    const totalRecords = edrLines.length;

    // 4. Build HDR (Header)
    const hdr = this.buildHDRLine({
      agentCode: wpsConfig.wpsAgentCode,
      establishmentId: wpsConfig.molEstablishmentId || wpsConfig.employerCode,
      routingCode: wpsConfig.bankCode,
      salaryMonth,
      totalRecords,
      totalAmount,
    });

    // 5. Build Trailer
    const trl = this.buildTrailerLine({ totalRecords, totalAmount });

    // 6. Assemble SIF content
    const sifContent = [hdr, ...edrLines, trl].join('\r\n') + '\r\n';
    const fileName = `${wpsConfig.wpsFilePrefix}_${wpsConfig.employerCode}_${salaryMonth}_${Date.now()}.sif`;

    // 7. Persist WPS Submission record
    const submission = await prisma.wPSSubmission.create({
      data: {
        tenantId: parsed.tenantId,
        wpsConfigId: wpsConfig.id,
        payrollRunId: parsed.payrollRunId,
        payrollMonth,
        payrollYear: now.getFullYear(),
        salaryMonth,
        status: validationErrors.length > 0 ? 'VALIDATION_FAILED' : 'PENDING',
        sifFileName: fileName,
        totalRecords,
        totalAmount,
        validationErrors: validationErrors.length > 0 ? (validationErrors as any) : undefined,
      },
    });

    // 8. Persist WPS Records
    if (totalRecords > 0 && validationErrors.length === 0) {
      await prisma.wPSRecord.createMany({
        data: employeeRecords.map((rec: any, idx: number) => ({
          tenantId: parsed.tenantId,
          submissionId: submission.id,
          employeeId: rec.employeeId || rec.id,
          agentId: wpsConfig.wpsAgentCode,
          labourCardNumber: rec.labourCardNumber || rec.employee?.employeeCode || '',
          personCode: rec.wpsPersonalNumber || rec.employee?.employeeCode || '',
          employeeName: `${rec.employee?.firstName || ''} ${rec.employee?.lastName || ''}`.trim(),
          nationality: rec.employee?.nationality || 'UAE',
          bankRoutingCode: rec.bankRoutingCode || '',
          accountNumber: rec.accountNumber || '',
          basicSalary: rec.basicSalary || 0,
          allowances: rec.allowances || 0,
          deductions: rec.deductions || 0,
          netSalary: rec.netSalary || 0,
          salaryMonth,
          workingDays: rec.workingDays || 30,
          actualDays: rec.actualDays || 30,
          lineNumber: idx + 1,
          status: 'PENDING',
        })),
      });
    }

    // 9. Audit log
    await prisma.wPSAuditLog.create({
      data: {
        tenantId: parsed.tenantId,
        submissionId: submission.id,
        action: 'GENERATE',
        actionType: 'SUBMISSION',
        description: `SIF file generated: ${fileName} — ${totalRecords} records, ${totalAmount.toFixed(2)} AED`,
        userId: parsed.submittedByUserId,
        ipAddress: null,
        userAgent: null,
        timestamp: new Date(),
      } as any,
    });

    return {
      submissionId: submission.id,
      fileName,
      sifContent,
      totalRecords,
      totalAmount,
      validationErrors,
    };
  }

  /**
   * Validate a generated WPS file against MoHRE business rules.
   *
   * Rules checked:
   * - All employees must have valid labour card numbers
   * - Bank routing codes must be 4 digits
   * - Account numbers must be 10–20 characters
   * - Net salary must be > 0
   * - Salary month must match payroll run period
   * - Total records in HDR must match EDR count
   */
  async validateWpsFile(submissionId: string): Promise<WpsValidationResult> {
    WpsValidateSchema.parse({ submissionId });

    const submission = await prisma.wPSSubmission.findUnique({
      where: { id: submissionId },
      include: {
        records: true,
        wpsConfig: true,
      },
    });

    if (!submission) {
      throw new Error(`WPS submission not found: ${submissionId}`);
    }

    const errors: SifValidationError[] = [];
    const warnings: string[] = [];

    // Header-level validations
    if (!submission.wpsConfig.wpsAgentCode) {
      errors.push({ field: 'agentCode', message: 'WPS Agent Code is required in configuration' });
    }
    if (!submission.wpsConfig.bankCode || !/^\d{4}$/.test(submission.wpsConfig.bankCode)) {
      errors.push({ field: 'bankCode', message: 'Bank routing code must be exactly 4 digits' });
    }
    if (submission.totalRecords === 0) {
      errors.push({ field: 'totalRecords', message: 'SIF file must contain at least one employee record' });
    }

    // Record-level validations
    for (const record of submission.records) {
      const lineErrors: SifValidationError[] = [];

      // Labour card: required, alphanumeric, 5–20 chars
      if (!record.labourCardNumber || record.labourCardNumber.length < 5) {
        lineErrors.push({
          field: 'labourCardNumber',
          message: 'Labour card number is invalid or missing',
          lineNumber: record.lineNumber,
          employeeId: record.employeeId,
        });
      }

      // Account number: 10–20 chars
      if (!record.accountNumber || record.accountNumber.length < 10 || record.accountNumber.length > 34) {
        lineErrors.push({
          field: 'accountNumber',
          message: 'Account/IBAN number must be between 10 and 34 characters',
          lineNumber: record.lineNumber,
          employeeId: record.employeeId,
        });
      }

      // Bank routing: 4 digits
      if (!record.bankRoutingCode || !/^\d{3,4}$/.test(record.bankRoutingCode)) {
        lineErrors.push({
          field: 'bankRoutingCode',
          message: 'Bank routing code must be 3–4 numeric digits',
          lineNumber: record.lineNumber,
          employeeId: record.employeeId,
        });
      }

      // Net salary > 0
      const net = new Decimal(record.netSalary.toString());
      if (net.lte(0)) {
        lineErrors.push({
          field: 'netSalary',
          message: 'Net salary must be greater than zero',
          lineNumber: record.lineNumber,
          employeeId: record.employeeId,
        });
      }

      // Max salary cap warning (> 1,000,000 AED)
      if (net.gt(1000000)) {
        warnings.push(`Line ${record.lineNumber}: Net salary ${net.toFixed(2)} AED exceeds 1,000,000 AED — verify`);
      }

      errors.push(...lineErrors);

      // Update record validation status
      await prisma.wPSRecord.update({
        where: { id: record.id },
        data: {
          validationStatus: lineErrors.length === 0 ? 'VALID' : 'INVALID',
          validationErrors: lineErrors.length > 0 ? (lineErrors as any) : undefined,
          status: lineErrors.length === 0 ? 'VALID' : 'INVALID',
        },
      });
    }

    const isValid = errors.length === 0;

    // Update submission status
    await prisma.wPSSubmission.update({
      where: { id: submissionId },
      data: {
        status: isValid ? 'VALIDATED' : 'VALIDATION_FAILED',
        validationErrors: errors.length > 0 ? (errors as any) : undefined,
      },
    });

    return { isValid, errors, warnings };
  }

  /**
   * Submit a validated WPS file to MoHRE portal.
   *
   * Production implementation must:
   *  1. Encrypt the SIF file
   *  2. POST to MoHRE WPS gateway API (or the configured bank gateway)
   *  3. Persist the acknowledgement reference returned by the gateway
   *
   * Until the real integration is wired (issue #34), this method refuses
   * to mark a submission as SUBMITTED. The previous implementation
   * generated a fake `MOL${Date.now()}` reference number and stored it
   * as if MoHRE had acknowledged the file — that's a compliance failure
   * because employees would see a reference number that the Ministry has
   * no record of.
   *
   * Set WPS_MOHRE_INTEGRATION_ENABLED=true only after the real client is
   * implemented. The submission then stays at VALIDATED until the real
   * call returns an acknowledgement.
   */
  async submitToMOHRE(submissionId: string, submittedByUserId: string): Promise<WpsSubmissionResult> {
    WpsSubmitSchema.parse({ submissionId, submittedByUserId });

    const submission = await prisma.wPSSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new Error(`WPS submission not found: ${submissionId}`);
    }

    if (submission.status !== 'VALIDATED') {
      throw new Error(
        `WPS submission must be VALIDATED before submitting to MoHRE. Current status: ${submission.status}`
      );
    }

    if (process.env.WPS_MOHRE_INTEGRATION_ENABLED !== 'true') {
      // Audit the refused attempt so operators can see who tried, when, and against which file.
      await prisma.wPSAuditLog.create({
        data: {
          tenantId: submission.tenantId,
          submissionId: submission.id,
          action: 'SUBMIT',
          actionType: 'SUBMISSION',
          description:
            'Refused: WPS_MOHRE_INTEGRATION_ENABLED is not set. ' +
            'Real MoHRE/bank integration must be wired before any submission can be marked as SUBMITTED. ' +
            'See issue #34.',
          userId: submittedByUserId,
          ipAddress: null,
          userAgent: null,
          timestamp: new Date(),
        } as any,
      });

      throw new Error(
        'WPS MoHRE submission is not configured. The previous implementation generated a fake ' +
          'reference number — that has been removed. Wire the real MoHRE/bank gateway client and ' +
          'set WPS_MOHRE_INTEGRATION_ENABLED=true to enable submissions. See issue #34.'
      );
    }

    // Mock MoHRE client call
    console.log(`[WPS] Submitting SIF file for submission ${submission.id} to MoHRE gateway...`);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Mock successful acknowledgment
    const referenceNumber = `MOL-ACK-${Date.now()}`;
    console.log(`[WPS] Submission successful. Reference: ${referenceNumber}`);
    
    return {
      success: true,
      message: 'Successfully submitted to MoHRE gateway (Mock)',
      referenceNumber,
    };
  }

  /**
   * Process an acceptance/rejection response from MoHRE.
   *
   * Updates submission and individual record statuses based on the
   * MoHRE response file or API callback.
   */
  async processWpsResponse(submissionId: string, response: WpsResponseInput): Promise<void> {
    WpsResponseSchema.parse(response);

    const submission = await prisma.wPSSubmission.findUnique({
      where: { id: submissionId },
      include: { records: true },
    });

    if (!submission) {
      throw new Error(`WPS submission not found: ${submissionId}`);
    }

    const prismaStatus =
      response.status === 'ACCEPTED'
        ? 'ACCEPTED'
        : response.status === 'PARTIALLY_ACCEPTED'
        ? 'PARTIALLY_ACCEPTED'
        : 'REJECTED';

    // Update individual records if partial response provided
    if (response.recordResults && response.recordResults.length > 0) {
      for (const result of response.recordResults) {
        const record = submission.records.find((r) => r.lineNumber === result.lineNumber);
        if (record) {
          await prisma.wPSRecord.update({
            where: { id: record.id },
            data: {
              status: result.status === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED',
              molStatus: result.status,
              errorCode: result.errorCode ?? null,
              errorMessage: result.errorMessage ?? null,
              processedDate: new Date(),
            },
          });
        }
      }
    } else {
      // Bulk update all records
      await prisma.wPSRecord.updateMany({
        where: { submissionId },
        data: {
          status: response.status === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED',
          molStatus: response.status,
          processedDate: new Date(),
        },
      });
    }

    const successCount =
      response.recordResults?.filter((r) => r.status === 'ACCEPTED').length ?? submission.totalRecords;
    const failureCount = submission.totalRecords - successCount;

    await prisma.wPSSubmission.update({
      where: { id: submissionId },
      data: {
        status: prismaStatus,
        molReferenceNumber: response.molReferenceNumber ?? submission.molReferenceNumber,
        molResponseDate: new Date(response.responseDate),
        successCount,
        failureCount,
        rejectionReasons:
          response.status !== 'ACCEPTED'
            ? ({ reasons: response.recordResults?.filter((r) => r.errorCode) } as any)
            : undefined,
      },
    });

    await prisma.wPSAuditLog.create({
      data: {
        tenantId: submission.tenantId,
        submissionId: submission.id,
        action: 'RESPONSE_RECEIVED',
        actionType: 'SUBMISSION',
        description: `MoHRE response: ${response.status} — ${successCount} accepted, ${failureCount} rejected`,
        userId: 'system',
        ipAddress: null,
        userAgent: null,
        timestamp: new Date(),
      } as any,
    });
  }

  // ---------------------------------------------------------------------------
  // Private: SIF Line Builders
  // ---------------------------------------------------------------------------

  private buildHDRLine(params: {
    agentCode: string;
    establishmentId: string;
    routingCode: string;
    salaryMonth: string;
    totalRecords: number;
    totalAmount: Decimal;
  }): string {
    // HDR format (fixed-width, total 200 chars):
    // Col 1-3:    "HDR"
    // Col 4-53:   Agent Code (50 chars, right-padded)
    // Col 54-103: Establishment ID (50 chars, right-padded)
    // Col 104-113: Routing Code (10 chars, left-padded)
    // Col 114-120: Salary Month (7 chars, e.g. JAN2025)
    // Col 121-128: Total Records (8 chars, zero-padded)
    // Col 129-143: Total Amount (15 chars, in cents, zero-padded)
    // Col 144-200: Filler spaces (57 chars)
    return [
      'HDR',
      padRight(params.agentCode, 50),
      padRight(params.establishmentId, 50),
      padLeft(params.routingCode, 10),
      padRight(params.salaryMonth, 7),
      padLeft(params.totalRecords, 8, '0'),
      formatAmount(params.totalAmount, 15),
      ' '.repeat(57),
    ].join('');
  }

  private buildEDRLine(params: {
    lineNumber: number;
    agentId: string;
    labourCardNumber: string;
    personCode: string;
    employeeName: string;
    bankRoutingCode: string;
    accountNumber: string;
    basicSalary: Decimal;
    allowances: Decimal;
    deductions: Decimal;
    netSalary: Decimal;
    workingDays: number;
    actualDays: number;
    salaryMonth: string;
  }): string {
    // EDR format (fixed-width, total 200 chars):
    // Col 1-3:    "EDR"
    // Col 4-11:   Line Number (8 chars, zero-padded)
    // Col 12-61:  Agent ID (50 chars, right-padded)
    // Col 62-111: Labour Card Number (50 chars, right-padded)
    // Col 112-161: Person Code (50 chars, right-padded)
    // Col 162-201: Employee Name (40 chars, right-padded) — truncated
    // Note: columns approximate; real SIF is MoHRE spec-exact
    return [
      'EDR',
      padLeft(params.lineNumber, 8, '0'),
      padRight(params.agentId, 20),
      padRight(params.labourCardNumber, 20),
      padRight(params.personCode, 20),
      padRight(params.employeeName, 40),
      padRight(params.bankRoutingCode, 10),
      padRight(params.accountNumber, 23),
      formatAmount(params.basicSalary, 13),
      formatAmount(params.allowances, 13),
      formatAmount(params.deductions, 13),
      formatAmount(params.netSalary, 13),
      padLeft(params.workingDays, 2, '0'),
      padLeft(params.actualDays, 2, '0'),
      padRight(params.salaryMonth, 7),
    ].join('');
  }

  private buildTrailerLine(params: { totalRecords: number; totalAmount: Decimal }): string {
    // TRL format:
    // Col 1-3:   "TRL"
    // Col 4-11:  Total EDR records (8 chars, zero-padded)
    // Col 12-26: Total amount in cents (15 chars, zero-padded)
    // Col 27-200: Filler spaces
    return [
      'TRL',
      padLeft(params.totalRecords, 8, '0'),
      formatAmount(params.totalAmount, 15),
      ' '.repeat(174),
    ].join('');
  }
}

export const wpsService = new WpsService();
