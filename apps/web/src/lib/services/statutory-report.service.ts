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
    // Cheap input validation first — never hit Prisma for a placeholder ref.
    if (!submissionReference || submissionReference.trim().length < 3) {
      throw new Error(
        'A real authority-issued submission reference is required (no placeholders).'
      );
    }
    const existing = await this.getById(id, tenantId);
    if (!existing) return null;
    if (
      !(SUBMISSION_ALLOWED[existing.status as StatutoryReportStatus] ?? []).includes('SUBMITTED')
    ) {
      throw new InvalidReportTransitionError(existing.status as StatutoryReportStatus, 'SUBMITTED');
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
 * UAE MOHRE headcount and salary report. Aggregates active employees and
 * total monthly salary spend per month in the period. Drives MOHRE filings
 * and EOSB provision reporting.
 */
registerReport({
  code: 'UAE_MOHRE',
  countryCode: 'AE',
  name: 'UAE MOHRE Headcount & Salary',
  format: 'excel',
  description: 'Headcount and salary spend per month for UAE MOHRE filing.',
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

    let employeeCount = 0;
    let grossAmount = 0;
    let deductionAmount = 0;
    let netAmount = 0;
    const monthlyTotals = new Map<string, { count: number; gross: number; net: number }>();

    for (const run of runs) {
      const bucket = monthlyTotals.get(run.payrollMonth) ?? { count: 0, gross: 0, net: 0 };
      for (const slip of run.payslips ?? []) {
        bucket.count += 1;
        bucket.gross += Number(slip.grossSalary);
        bucket.net += Number(slip.netSalary);
        employeeCount += 1;
        grossAmount += Number(slip.grossSalary);
        deductionAmount += Number(slip.totalDeductions);
        netAmount += Number(slip.netSalary);
      }
      monthlyTotals.set(run.payrollMonth, bucket);
    }

    const lines = Array.from(monthlyTotals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([payrollMonth, totals]) => ({
        payrollMonth,
        employeeCount: totals.count,
        totalGross: totals.gross,
        totalNet: totals.net,
      }));

    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount, deductionAmount, netAmount },
      lines,
    };
  },
});

/**
 * Saudization (Nitaqat) compliance ratio. Requires per-employee nationality
 * metadata; falls back to `unknown` bucket when nationality is missing and
 * surfaces a warning rather than failing.
 */
registerReport({
  code: 'KSA_NITAQAT',
  countryCode: 'SA',
  name: 'KSA Nitaqat (Saudization) Ratio',
  format: 'pdf',
  description: 'Saudization ratio per company for KSA Nitaqat compliance.',
  generate: async (ctx) => {
    const employees = await prisma.employee.findMany({
      where: {
        isDeleted: false,
        company: { tenantId: ctx.tenantId },
      },
      select: {
        id: true,
        companyId: true,
        company: { select: { name: true } },
      },
    });

    const lines: Array<Record<string, unknown>> = [];
    const byCompany = new Map<string, { total: number; saudi: number; name: string }>();

    for (const emp of employees) {
      const bucket = byCompany.get(emp.companyId) ?? {
        total: 0,
        saudi: 0,
        name: emp.company?.name ?? emp.companyId,
      };
      bucket.total += 1;
      byCompany.set(emp.companyId, bucket);
    }

    let totalEmployees = 0;
    for (const [companyId, totals] of byCompany.entries()) {
      const ratio = totals.total > 0 ? totals.saudi / totals.total : 0;
      lines.push({
        companyId,
        companyName: totals.name,
        totalEmployees: totals.total,
        saudiEmployees: totals.saudi,
        saudizationRatio: Math.round(ratio * 10000) / 100, // percent with 2dp
      });
      totalEmployees += totals.total;
    }

    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount: totalEmployees, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
      lines,
      warnings: [
        'Saudi/non-Saudi classification requires nationality column on Employee. ' +
          'All employees currently bucketed as non-Saudi pending nationality field wiring.',
      ],
    };
  },
});

/**
 * India Form 24Q — quarterly TDS return for salary payments. Reports per
 * employee gross, TDS deducted, and PAN. Quarter is inferred from period.
 */
registerReport({
  code: 'IND_FORM_24Q',
  countryCode: 'IN',
  name: 'India Form 24Q (Quarterly TDS Return)',
  format: 'fvu',
  description: 'Quarterly TDS return for salary payments (India).',
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

    let employeeCount = 0;
    let grossAmount = 0;
    let deductionAmount = 0;
    const lines: Array<Record<string, unknown>> = [];
    const perEmployee = new Map<string, { gross: number; tds: number; code: string }>();

    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        const bucket = perEmployee.get(slip.employeeId) ?? {
          gross: 0,
          tds: 0,
          code: slip.employeeCode,
        };
        bucket.gross += Number(slip.grossSalary);
        bucket.tds += Number(slip.employeeTDS);
        perEmployee.set(slip.employeeId, bucket);
      }
    }

    for (const [employeeId, totals] of perEmployee.entries()) {
      employeeCount += 1;
      grossAmount += totals.gross;
      deductionAmount += totals.tds;
      lines.push({
        employeeId,
        employeeCode: totals.code,
        pan: '', // PAN sourced from EmployeeComplianceDetails — populated by export layer
        grossSalary: totals.gross,
        tdsDeducted: totals.tds,
      });
    }

    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount, deductionAmount, netAmount: 0 },
      lines,
      warnings: lines.length === 0 ? ['No payslips in period — empty 24Q return'] : undefined,
    };
  },
});

/**
 * India Form 16 — annual TDS certificate per employee. Period is expected to
 * cover the financial year (April → March).
 */
registerReport({
  code: 'IND_FORM_16',
  countryCode: 'IN',
  name: 'India Form 16 (Annual TDS Certificate)',
  format: 'pdf',
  description: 'Annual Form 16 generation per employee for the financial year.',
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

    const perEmployee = new Map<
      string,
      { code: string; name: string; gross: number; tds: number; basic: number }
    >();

    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        const bucket = perEmployee.get(slip.employeeId) ?? {
          code: slip.employeeCode,
          name: slip.employeeName,
          gross: 0,
          tds: 0,
          basic: 0,
        };
        bucket.gross += Number(slip.grossSalary);
        bucket.tds += Number(slip.employeeTDS);
        bucket.basic += Number(slip.basicSalary);
        perEmployee.set(slip.employeeId, bucket);
      }
    }

    let totalGross = 0;
    let totalTds = 0;
    const lines: Array<Record<string, unknown>> = [];
    for (const [employeeId, totals] of perEmployee.entries()) {
      totalGross += totals.gross;
      totalTds += totals.tds;
      lines.push({
        employeeId,
        employeeCode: totals.code,
        employeeName: totals.name,
        grossSalary: totals.gross,
        basicSalary: totals.basic,
        tdsDeducted: totals.tds,
      });
    }

    return {
      schemaVersion: '1.0.0',
      totals: {
        employeeCount: perEmployee.size,
        grossAmount: totalGross,
        deductionAmount: totalTds,
        netAmount: 0,
      },
      lines,
    };
  },
});

/**
 * UAE Emiratisation compliance. Per-company headcount of Emirati vs non-Emirati
 * employees and the resulting Emiratisation %. Like Nitaqat, surfaces a warning
 * until a nationality column is wired on Employee.
 */
registerReport({
  code: 'UAE_EMIRATISATION',
  countryCode: 'AE',
  name: 'UAE Emiratisation Ratio',
  format: 'pdf',
  description: 'Emiratisation compliance ratio per company for UAE MOHRE.',
  generate: async (ctx) => {
    const employees = await prisma.employee.findMany({
      where: {
        isDeleted: false,
        company: { tenantId: ctx.tenantId },
      },
      select: {
        id: true,
        companyId: true,
        company: { select: { name: true } },
      },
    });

    const byCompany = new Map<string, { total: number; emirati: number; name: string }>();
    for (const emp of employees) {
      const bucket = byCompany.get(emp.companyId) ?? {
        total: 0,
        emirati: 0,
        name: emp.company?.name ?? emp.companyId,
      };
      bucket.total += 1;
      byCompany.set(emp.companyId, bucket);
    }

    let totalEmployees = 0;
    const lines: Array<Record<string, unknown>> = [];
    for (const [companyId, totals] of byCompany.entries()) {
      const ratio = totals.total > 0 ? totals.emirati / totals.total : 0;
      lines.push({
        companyId,
        companyName: totals.name,
        totalEmployees: totals.total,
        emiratiEmployees: totals.emirati,
        emiratisationRatio: Math.round(ratio * 10000) / 100,
      });
      totalEmployees += totals.total;
    }

    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount: totalEmployees, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
      lines,
      warnings: [
        'Emirati/non-Emirati classification requires nationality column on Employee. ' +
          'All employees currently bucketed as non-Emirati pending nationality field wiring.',
      ],
    };
  },
});

/**
 * India ESI half-yearly return. Per-employee ESI wages with employee + employer
 * share. Statutory wage ceiling INR 21,000/month (employees earning above are
 * exempt from ESI).
 */
registerReport({
  code: 'IND_ESI_RETURN',
  countryCode: 'IN',
  name: 'India ESI Half-Yearly Return',
  format: 'excel',
  description: 'Employee State Insurance half-yearly return for the period.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
    });

    let employeeCount = 0;
    let grossAmount = 0;
    let deductionAmount = 0;
    const lines: Array<Record<string, unknown>> = [];

    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        const gross = Number(slip.grossSalary);
        // ESI wage ceiling = INR 21,000; employees above are exempt.
        if (gross > 21000) continue;
        const employeeShare = Math.round(gross * 0.0075); // 0.75%
        const employerShare = Math.round(gross * 0.0325); // 3.25%
        employeeCount += 1;
        grossAmount += gross;
        deductionAmount += employeeShare + employerShare;
        lines.push({
          employeeId: slip.employeeId,
          employeeCode: slip.employeeCode,
          payrollMonth: run.payrollMonth,
          esiWages: gross,
          employeeShare,
          employerShare,
        });
      }
    }

    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount, deductionAmount, netAmount: 0 },
      lines,
      warnings: lines.length === 0 ? ['No eligible payslips (ESI ceiling INR 21,000)'] : undefined,
    };
  },
});

/**
 * India Professional Tax challan. Per-state PT slabs vary; this report
 * aggregates the PT amount captured on each payslip and groups by month.
 * Per-state slab evaluation lives in IndiaProfessionalTaxService (#103
 * follow-up).
 */
registerReport({
  code: 'IND_PT_CHALLAN',
  countryCode: 'IN',
  name: 'India Professional Tax Challan',
  format: 'csv',
  description: 'Monthly Professional Tax challan aggregating PT captured on payslips.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
    });

    let employeeCount = 0;
    let deductionAmount = 0;
    const lines: Array<Record<string, unknown>> = [];

    for (const run of runs) {
      // PT is captured in payslip.deductions JSON; we surface a per-payslip
      // row even when zero so finance can reconcile.
      for (const slip of run.payslips ?? []) {
        const deds = (slip.deductions as Array<Record<string, unknown>>) ?? [];
        const pt = deds.find(
          (d) =>
            typeof d.code === 'string' &&
            ['PT', 'PROF_TAX', 'PROFESSIONAL_TAX'].includes(d.code.toUpperCase())
        );
        const ptAmount = pt ? Number(pt.amount ?? 0) : 0;
        employeeCount += 1;
        deductionAmount += ptAmount;
        lines.push({
          employeeId: slip.employeeId,
          employeeCode: slip.employeeCode,
          payrollMonth: run.payrollMonth,
          ptAmount,
        });
      }
    }

    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount: 0, deductionAmount, netAmount: 0 },
      lines,
    };
  },
});

/**
 * KSA Saudization quota — per-company saudi/non-saudi headcount + delta
 * vs tenant-configured target. Complements KSA_NITAQAT by reporting raw
 * compliance rather than tier classification.
 */
registerReport({
  code: 'KSA_SAUDIZATION',
  countryCode: 'SA',
  name: 'KSA Saudization Quota',
  format: 'excel',
  description: 'Per-company Saudization headcount + quota delta.',
  generate: async (ctx) => {
    const employees = await prisma.employee.findMany({
      where: { isDeleted: false, company: { tenantId: ctx.tenantId } },
      select: { id: true, companyId: true, company: { select: { name: true } } },
    });
    const byCompany = new Map<string, { total: number; saudi: number; name: string }>();
    for (const emp of employees) {
      const b = byCompany.get(emp.companyId) ?? {
        total: 0,
        saudi: 0,
        name: emp.company?.name ?? emp.companyId,
      };
      b.total += 1;
      byCompany.set(emp.companyId, b);
    }
    const TARGET_RATIO = 0.4;
    let totalEmployees = 0;
    const lines: Array<Record<string, unknown>> = [];
    for (const [companyId, t] of byCompany.entries()) {
      const ratio = t.total > 0 ? t.saudi / t.total : 0;
      lines.push({
        companyId,
        companyName: t.name,
        totalEmployees: t.total,
        saudiEmployees: t.saudi,
        saudizationRatioPct: Math.round(ratio * 10000) / 100,
        targetRatioPct: TARGET_RATIO * 100,
        deltaPct: Math.round((ratio - TARGET_RATIO) * 10000) / 100,
      });
      totalEmployees += t.total;
    }
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount: totalEmployees, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
      lines,
      warnings: ['Saudi/non-Saudi classification requires nationality column on Employee.'],
    };
  },
});

/**
 * UAE EOSB provision — End-of-Service Benefit accrual per Federal Law
 * No. 33 of 2021 (21 days basic ≤5y, 30 days basic >5y, capped 24mo basic).
 * Service years placeholder — production wire-up joins Employee.joiningDate.
 */
registerReport({
  code: 'UAE_EOSB_PROVISION',
  countryCode: 'AE',
  name: 'UAE EOSB Provision (Federal Law 33/2021)',
  format: 'excel',
  description: 'End-of-Service Benefit accrual per employee as of period end.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
      orderBy: { payrollMonth: 'desc' },
      take: 1,
    });
    if (runs.length === 0) {
      return {
        schemaVersion: '1.0.0',
        totals: { employeeCount: 0, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
        lines: [],
        warnings: ['No payroll run in period — no EOSB provision computed.'],
      };
    }
    const lines: Array<Record<string, unknown>> = [];
    let totalProvision = 0;
    let employeeCount = 0;
    for (const slip of runs[0].payslips ?? []) {
      const yearsOfService = 3;
      const dailyBasic = Number(slip.basicSalary) / 30;
      const days = yearsOfService <= 5 ? 21 * yearsOfService : 21 * 5 + 30 * (yearsOfService - 5);
      const eosb = Math.min(dailyBasic * days, Number(slip.basicSalary) * 24);
      lines.push({
        employeeId: slip.employeeId,
        employeeCode: slip.employeeCode,
        basicSalary: Number(slip.basicSalary),
        yearsOfService,
        eosbProvision: Math.round(eosb * 100) / 100,
      });
      totalProvision += eosb;
      employeeCount += 1;
    }
    return {
      schemaVersion: '1.0.0',
      totals: {
        employeeCount,
        grossAmount: 0,
        deductionAmount: 0,
        netAmount: Math.round(totalProvision * 100) / 100,
      },
      lines,
      warnings: ['Service years placeholder. Production requires Employee.joiningDate join.'],
    };
  },
});

/**
 * India Gratuity provision per Payment of Gratuity Act 1972: (15/26) ×
 * basic × completed years, payable only ≥ 5y service, capped at INR
 * 20,00,000. Service years placeholder — production joins joiningDate.
 */
registerReport({
  code: 'IND_GRATUITY_PROVISION',
  countryCode: 'IN',
  name: 'India Gratuity Provision (Act 1972)',
  format: 'excel',
  description: 'Per-employee gratuity provision accrual.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
      orderBy: { payrollMonth: 'desc' },
      take: 1,
    });
    if (runs.length === 0) {
      return {
        schemaVersion: '1.0.0',
        totals: { employeeCount: 0, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
        lines: [],
        warnings: ['No payroll run in period — no gratuity provision computed.'],
      };
    }
    const lines: Array<Record<string, unknown>> = [];
    let total = 0;
    let employeeCount = 0;
    const CAP = 2_000_000;
    const MIN_YEARS = 5;
    for (const slip of runs[0].payslips ?? []) {
      const yearsOfService = 6;
      let gratuity = 0;
      if (yearsOfService >= MIN_YEARS) {
        gratuity = Math.min(CAP, (15 / 26) * Number(slip.basicSalary) * yearsOfService);
      }
      lines.push({
        employeeId: slip.employeeId,
        employeeCode: slip.employeeCode,
        basicSalary: Number(slip.basicSalary),
        yearsOfService,
        gratuityProvision: Math.round(gratuity * 100) / 100,
      });
      total += gratuity;
      employeeCount += 1;
    }
    return {
      schemaVersion: '1.0.0',
      totals: {
        employeeCount,
        grossAmount: 0,
        deductionAmount: 0,
        netAmount: Math.round(total * 100) / 100,
      },
      lines,
      warnings: ['Service years placeholder. Production requires Employee.joiningDate join.'],
    };
  },
});

/**
 * KSA Mudad wage protection. Per-payslip salary + bank route. Mirrors
 * the UAE WPS shape — produces a CSV file that the Mudad portal accepts
 * for cross-checking employer wage payments against ledger transfers.
 */
registerReport({
  code: 'KSA_MUDAD',
  countryCode: 'SA',
  name: 'KSA Mudad Wage Protection',
  format: 'csv',
  description: 'Wage Protection System CSV for the KSA Mudad portal.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
    });

    let employeeCount = 0;
    let grossAmount = 0;
    let netAmount = 0;
    const lines: Array<Record<string, unknown>> = [];

    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        employeeCount += 1;
        grossAmount += Number(slip.grossSalary);
        netAmount += Number(slip.netSalary);
        lines.push({
          payrollMonth: run.payrollMonth,
          employeeId: slip.employeeId,
          employeeCode: slip.employeeCode,
          gross: Number(slip.grossSalary),
          net: Number(slip.netSalary),
          // Bank routing fields populated by the export layer from the
          // employee's compliance details (IBAN, bank code).
        });
      }
    }

    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount, deductionAmount: 0, netAmount },
      lines,
      warnings: lines.length === 0 ? ['No payroll runs in period — empty Mudad file'] : undefined,
    };
  },
});

/**
 * India Form 12BA — annual perquisites statement. Reports per-employee
 * total perquisite value for the financial year. Aggregates the
 * "PERQUISITE" component code from each payslip's earnings JSON.
 */
registerReport({
  code: 'IND_FORM_12BA',
  countryCode: 'IN',
  name: 'India Form 12BA (Annual Perquisites Statement)',
  format: 'pdf',
  description: 'Per-employee perquisites statement for the financial year.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
    });

    const perEmployee = new Map<
      string,
      { code: string; name: string; perqTotal: number; gross: number }
    >();

    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        const earnings = (slip.earnings as Array<Record<string, unknown>>) ?? [];
        const perq = earnings
          .filter(
            (e) =>
              typeof e.code === 'string' &&
              ['PERQUISITE', 'PERQ', 'PERQS', 'CAR', 'HOUSING_PERQ'].includes(e.code.toUpperCase())
          )
          .reduce((s, e) => s + Number(e.amount ?? 0), 0);

        const bucket = perEmployee.get(slip.employeeId) ?? {
          code: slip.employeeCode,
          name: slip.employeeName,
          perqTotal: 0,
          gross: 0,
        };
        bucket.perqTotal += perq;
        bucket.gross += Number(slip.grossSalary);
        perEmployee.set(slip.employeeId, bucket);
      }
    }

    const lines = Array.from(perEmployee.entries()).map(([employeeId, t]) => ({
      employeeId,
      employeeCode: t.code,
      employeeName: t.name,
      grossSalary: t.gross,
      totalPerquisites: t.perqTotal,
    }));

    return {
      schemaVersion: '1.0.0',
      totals: {
        employeeCount: perEmployee.size,
        grossAmount: lines.reduce((s, l) => s + (l.grossSalary as number), 0),
        deductionAmount: 0,
        netAmount: 0,
      },
      lines,
    };
  },
});

/**
 * India Payment of Bonus Act statutory bonus calculation. Per-employee
 * 8.33% minimum bonus on basic wages, capped at the prevailing statutory
 * basic ceiling (currently INR 7,000/month or actual basic, whichever is
 * less, per § 12). Employees earning > INR 21,000/month basic are
 * excluded per § 2(13).
 */
registerReport({
  code: 'IND_BONUS_ACT',
  countryCode: 'IN',
  name: 'India Bonus Act § 8.33% Statutory Bonus',
  format: 'excel',
  description: 'Statutory bonus per Payment of Bonus Act, 1965 for the period.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
    });

    const perEmployee = new Map<
      string,
      { code: string; name: string; basicSum: number; eligibleMonths: number }
    >();

    // § 2(13) wage ceiling for eligibility (basic + DA ≤ INR 21,000/month).
    // § 12 ceiling for calculation (basic capped at INR 7,000/month).
    const ELIGIBILITY_CEILING = 21000;
    const CALCULATION_CEILING = 7000;
    const MIN_RATE = 0.0833; // 8.33%

    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        const basic = Number(slip.basicSalary);
        if (basic > ELIGIBILITY_CEILING) continue; // excluded employee
        const bucket = perEmployee.get(slip.employeeId) ?? {
          code: slip.employeeCode,
          name: slip.employeeName,
          basicSum: 0,
          eligibleMonths: 0,
        };
        bucket.basicSum += Math.min(basic, CALCULATION_CEILING);
        bucket.eligibleMonths += 1;
        perEmployee.set(slip.employeeId, bucket);
      }
    }

    let totalBonus = 0;
    const lines = Array.from(perEmployee.entries()).map(([employeeId, t]) => {
      const bonus = Math.round(t.basicSum * MIN_RATE);
      totalBonus += bonus;
      return {
        employeeId,
        employeeCode: t.code,
        employeeName: t.name,
        eligibleMonths: t.eligibleMonths,
        cappedBasicSum: t.basicSum,
        statutoryBonus: bonus,
      };
    });

    return {
      schemaVersion: '1.0.0',
      totals: {
        employeeCount: perEmployee.size,
        grossAmount: 0,
        deductionAmount: 0,
        netAmount: totalBonus,
      },
      lines,
      warnings:
        perEmployee.size === 0
          ? ['No eligible employees in period (all basic > INR 21,000 ceiling)']
          : undefined,
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
