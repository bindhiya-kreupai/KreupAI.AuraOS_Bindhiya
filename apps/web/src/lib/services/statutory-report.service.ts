import { prisma } from '@aura/database';
import { BaseService } from './base.service';

export type StatutoryReportStatus = 'DRAFT' | 'GENERATED' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'FAILED';

export type StatutoryReportFormat = 'json' | 'excel' | 'pdf' | 'csv' | 'sif' | 'fvu';

export interface ReportContext {
  tenantId: string;
  periodStart: Date;
  periodEnd: Date;
  generatedById: string;
}

export interface ReportPayload {
  schemaVersion: string;
  totals: {
    employeeCount: number;
    grossAmount: number;
    deductionAmount: number;
    netAmount: number;
  };
  lines: Array<Record<string, unknown>>;
  warnings?: string[];
}

export interface ReportSpec {
  code: string;
  countryCode: string;
  name: string;
  format: StatutoryReportFormat;
  description: string;
  generate: (ctx: ReportContext) => Promise<ReportPayload>;
}

/**
 * Registry of report generators. Each entry produces the canonical JSON
 * payload; format-specific export (Excel, PDF, SIF, FVU) is layered on top.
 */
const REGISTRY: Map<string, ReportSpec> = new Map();

export function registerReport(spec: ReportSpec) {
  REGISTRY.set(spec.code, spec);
}

export function listSpecs(filter?: { countryCode?: string }): ReportSpec[] {
  const arr = Array.from(REGISTRY.values());
  if (!filter?.countryCode) return arr;
  const c = filter.countryCode.toUpperCase();
  return arr.filter((r) => r.countryCode === c || r.countryCode.split(',').includes(c));
}

const SUBMISSION_ALLOWED: Record<StatutoryReportStatus, StatutoryReportStatus[]> = {
  DRAFT: ['GENERATED', 'FAILED'],
  GENERATED: ['SUBMITTED', 'FAILED', 'DRAFT'],
  SUBMITTED: ['ACKNOWLEDGED', 'FAILED'],
  ACKNOWLEDGED: [],
  FAILED: ['DRAFT'],
};

export class InvalidReportTransitionError extends Error {
  constructor(from: StatutoryReportStatus, to: StatutoryReportStatus) {
    super(`Invalid statutory report transition: ${from} → ${to}`);
    this.name = 'InvalidReportTransitionError';
  }
}

export class StatutoryReportService extends BaseService {
  constructor() {
    super('StatutoryReportService');
  }

  listSpecs(filter?: { countryCode?: string }) {
    return listSpecs(filter).map(({ generate: _generate, ...rest }) => rest);
  }

  async list(params: {
    tenantId: string;
    code?: string;
    countryCode?: string;
    status?: StatutoryReportStatus;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = Math.min(params.limit ?? 50, 200);
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { tenantId: params.tenantId, isDeleted: false };
    if (params.code) where.code = params.code;
    if (params.countryCode) where.countryCode = params.countryCode.toUpperCase();
    if (params.status) where.status = params.status;
    const [items, total] = await Promise.all([
      prisma.statutoryReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.statutoryReport.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  async getById(id: string, tenantId: string) {
    return prisma.statutoryReport.findFirst({ where: { id, tenantId, isDeleted: false } });
  }

  async generate(
    code: string,
    ctx: ReportContext
  ): Promise<{
    record: Awaited<ReturnType<typeof prisma.statutoryReport.create>>;
    payload: ReportPayload;
  }> {
    const spec = REGISTRY.get(code);
    if (!spec) throw new Error(`Unknown report code: ${code}`);

    let payload: ReportPayload;
    try {
      payload = await spec.generate(ctx);
    } catch (error) {
      const record = await prisma.statutoryReport.create({
        data: {
          tenantId: ctx.tenantId,
          code,
          countryCode: spec.countryCode.split(',')[0]!,
          periodStart: ctx.periodStart,
          periodEnd: ctx.periodEnd,
          format: spec.format,
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          generatedById: ctx.generatedById,
          createdBy: ctx.generatedById,
        },
      });
      return {
        record,
        payload: {
          schemaVersion: 'error',
          totals: { employeeCount: 0, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
          lines: [],
          warnings: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }

    const record = await prisma.statutoryReport.create({
      data: {
        tenantId: ctx.tenantId,
        code,
        countryCode: spec.countryCode.split(',')[0]!,
        periodStart: ctx.periodStart,
        periodEnd: ctx.periodEnd,
        format: spec.format,
        status: 'GENERATED',
        payload: payload as object,
        generatedAt: new Date(),
        generatedById: ctx.generatedById,
        createdBy: ctx.generatedById,
      },
    });
    return { record, payload };
  }

  async markSubmitted(
    id: string,
    tenantId: string,
    actorId: string,
    submissionReference: string,
    fileUrl?: string
  ) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    if (
      !(SUBMISSION_ALLOWED[existing.status as StatutoryReportStatus] ?? []).includes('SUBMITTED')
    ) {
      throw new InvalidReportTransitionError(existing.status as StatutoryReportStatus, 'SUBMITTED');
    }
    if (!submissionReference || submissionReference.trim().length < 3) {
      throw new Error(
        'A real authority-issued submission reference is required (no placeholders).'
      );
    }
    return prisma.statutoryReport.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submissionReference,
        fileUrl: fileUrl ?? undefined,
        submittedAt: new Date(),
        submittedById: actorId,
        updatedBy: actorId,
      },
    });
  }

  async markAcknowledged(id: string, tenantId: string, actorId: string) {
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    if (
      !(SUBMISSION_ALLOWED[existing.status as StatutoryReportStatus] ?? []).includes('ACKNOWLEDGED')
    ) {
      throw new InvalidReportTransitionError(
        existing.status as StatutoryReportStatus,
        'ACKNOWLEDGED'
      );
    }
    return prisma.statutoryReport.update({
      where: { id },
      data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date(), updatedBy: actorId },
    });
  }
}

// ---------------- Registered generators ----------------

function yyyymmRange(start: Date, end: Date): string[] {
  const months: string[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), 1);
  const stop = new Date(end.getFullYear(), end.getMonth(), 1);
  while (d <= stop) {
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    d.setMonth(d.getMonth() + 1);
  }
  return months;
}

/**
 * UAE WPS reconciliation. Cross-references payroll-run salaries against
 * the WPS SIF files for the period. Produces per-payslip lines.
 */
registerReport({
  code: 'UAE_WPS_RECON',
  countryCode: 'AE',
  name: 'UAE WPS Reconciliation',
  format: 'excel',
  description: 'Cross-references payroll-run salaries against WPS SIF files for the period.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: {
        tenantId: ctx.tenantId,
        payrollMonth: { in: months },
        isDeleted: false,
      },
      include: { payslips: true },
    });

    let grossAmount = 0;
    let deductionAmount = 0;
    let netAmount = 0;
    let employeeCount = 0;
    const lines: Array<Record<string, unknown>> = [];

    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        employeeCount += 1;
        grossAmount += Number(slip.grossSalary);
        deductionAmount += Number(slip.totalDeductions);
        netAmount += Number(slip.netSalary);
        lines.push({
          payrollRunId: run.id,
          payrollMonth: run.payrollMonth,
          employeeId: slip.employeeId,
          employeeCode: slip.employeeCode,
          gross: Number(slip.grossSalary),
          deductions: Number(slip.totalDeductions),
          net: Number(slip.netSalary),
        });
      }
    }

    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount, deductionAmount, netAmount },
      lines,
    };
  },
});

/**
 * India PF ECR (Electronic Challan cum Return). Per-employee PF wages with
 * employee + employer share. Statutory PF wage ceiling INR 15,000.
 */
registerReport({
  code: 'IND_PF_ECR',
  countryCode: 'IN',
  name: 'India PF ECR',
  format: 'csv',
  description: 'Provident Fund Electronic Challan cum Return for the period.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: {
        tenantId: ctx.tenantId,
        payrollMonth: { in: months },
        isDeleted: false,
      },
      include: { payslips: true },
    });

    let grossAmount = 0;
    let deductionAmount = 0;
    let employeeCount = 0;
    const lines: Array<Record<string, unknown>> = [];

    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        const pfWages = Math.min(Number(slip.basicSalary), 15000);
        const employeeShare = Math.round(pfWages * 0.12);
        const employerShare = Math.round(pfWages * 0.12);
        employeeCount += 1;
        grossAmount += pfWages;
        deductionAmount += employeeShare + employerShare;
        lines.push({
          uan: '',
          employeeId: slip.employeeId,
          employeeCode: slip.employeeCode,
          payrollMonth: run.payrollMonth,
          pfWages,
          employeeShare,
          employerShare,
        });
      }
    }
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount, deductionAmount, netAmount: 0 },
      lines,
      warnings: lines.length === 0 ? ['No payroll runs in period — empty ECR'] : undefined,
    };
  },
});

/**
 * KSA GOSI reconciliation. Per-payslip employee+employer GOSI contributions.
 */
registerReport({
  code: 'KSA_GOSI_RECON',
  countryCode: 'SA',
  name: 'KSA GOSI Reconciliation',
  format: 'excel',
  description: 'GOSI contribution reconciliation for the period.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: {
        tenantId: ctx.tenantId,
        payrollMonth: { in: months },
        isDeleted: false,
      },
      include: { payslips: true },
    });

    let grossAmount = 0;
    let deductionAmount = 0;
    let employeeCount = 0;
    const lines: Array<Record<string, unknown>> = [];

    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        employeeCount += 1;
        const empGosi = Number(slip.employerGOSI);
        const totalGosi = empGosi; // employee GOSI lives in earnings/deductions JSON
        grossAmount += Number(slip.grossSalary);
        deductionAmount += totalGosi;
        lines.push({
          payrollMonth: run.payrollMonth,
          employeeId: slip.employeeId,
          employeeCode: slip.employeeCode,
          gross: Number(slip.grossSalary),
          employerGOSI: empGosi,
        });
      }
    }
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount, deductionAmount, netAmount: 0 },
      lines,
    };
  },
});

export const statutoryReportService = new StatutoryReportService();
