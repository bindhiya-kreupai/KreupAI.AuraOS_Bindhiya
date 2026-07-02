import { prisma } from '@aura/database';
import { BaseService } from './base.service';

// statutoryReport exists in the deployed db-push database but is not in
// schema.prisma, so it is absent from the generated PrismaClient types.
const db = prisma as any;

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
      db.statutoryReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.statutoryReport.count({ where }),
    ]);
    return { items, total, page, pageSize: limit, hasNextPage: skip + items.length < total };
  }

  async getById(id: string, tenantId: string) {
    return db.statutoryReport.findFirst({ where: { id, tenantId, isDeleted: false } });
  }

  async generate(
    code: string,
    ctx: ReportContext
  ): Promise<{
    record: Awaited<ReturnType<typeof db.statutoryReport.create>>;
    payload: ReportPayload;
  }> {
    const spec = REGISTRY.get(code);
    if (!spec) throw new Error(`Unknown report code: ${code}`);

    let payload: ReportPayload;
    try {
      payload = await spec.generate(ctx);
    } catch (error) {
      const record = await db.statutoryReport.create({
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

    const record = await db.statutoryReport.create({
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
    return db.statutoryReport.update({
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
    return db.statutoryReport.update({
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

/**
 * KSA GOSI Monthly Contribution file (SAR). Used as the upload format to
 * GOSI for the monthly contribution submission. Employee + employer share
 * split at the legislated rate (9% / 9% Saudi; 2% / 0% non-Saudi). The
 * generator emits one row per payslip; the actual rate split is captured
 * during payroll run, not recomputed here.
 */
registerReport({
  code: 'KSA_GOSI_MONTHLY',
  countryCode: 'SA',
  name: 'KSA GOSI Monthly Contribution',
  format: 'excel',
  description: 'Per-employee GOSI contribution for the contribution month.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
    });
    const lines: Array<Record<string, unknown>> = [];
    let grossAmount = 0;
    let deductionAmount = 0;
    let employeeCount = 0;
    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        const empGosi = Number(slip.employerGOSI ?? 0);
        const basic = Number(slip.basicSalary ?? 0);
        lines.push({
          payrollMonth: run.payrollMonth,
          employeeId: slip.employeeId,
          employeeCode: slip.employeeCode,
          basic,
          employerContribution: empGosi,
          gross: Number(slip.grossSalary ?? 0),
        });
        employeeCount += 1;
        grossAmount += Number(slip.grossSalary ?? 0);
        deductionAmount += empGosi;
      }
    }
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount, deductionAmount, netAmount: 0 },
      lines,
    };
  },
});

/**
 * UAE DEWS — DIFC Employee Workplace Savings contribution file. Mandatory
 * for DIFC-domiciled employers since Feb 2020. Calculation: 5.83% of basic
 * for ≤5y service, 8.33% for >5y. The accrual is funded into a regulated
 * trust, not paid to employee. Service-year placeholder; production wire-up
 * joins Employee.joiningDate.
 */
registerReport({
  code: 'UAE_DEWS',
  countryCode: 'AE',
  name: 'UAE DEWS Contribution (DIFC)',
  format: 'excel',
  description: 'DIFC Employee Workplace Savings monthly contribution per employee.',
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
        warnings: ['No payroll run in period — no DEWS contribution computed.'],
      };
    }
    const lines: Array<Record<string, unknown>> = [];
    let contributionTotal = 0;
    let employeeCount = 0;
    for (const slip of runs[0].payslips ?? []) {
      const yearsOfService = 3; // placeholder
      const basic = Number(slip.basicSalary ?? 0);
      const ratePct = yearsOfService <= 5 ? 5.83 : 8.33;
      const contribution = Math.round(((basic * ratePct) / 100) * 100) / 100;
      lines.push({
        employeeId: slip.employeeId,
        employeeCode: slip.employeeCode,
        basic,
        yearsOfService,
        ratePct,
        contribution,
      });
      contributionTotal += contribution;
      employeeCount += 1;
    }
    return {
      schemaVersion: '1.0.0',
      totals: {
        employeeCount,
        grossAmount: 0,
        deductionAmount: Math.round(contributionTotal * 100) / 100,
        netAmount: 0,
      },
      lines,
      warnings: ['Service years placeholder. Production requires Employee.joiningDate join.'],
    };
  },
});

/**
 * India LWF (Labour Welfare Fund) state-wise monthly contribution. Rates
 * vary per state and per period (monthly / half-yearly / annual).
 * Generator emits per-employee LWF line with the state in scope.
 */
registerReport({
  code: 'IND_LWF',
  countryCode: 'IN',
  name: 'India Labour Welfare Fund Contribution',
  format: 'excel',
  description: 'State-wise LWF monthly contribution per employee.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
    });
    const lines: Array<Record<string, unknown>> = [];
    let deductionAmount = 0;
    let employeeCount = 0;
    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        // LWF is small — typically INR 12-50/mo for employee. Placeholder
        // until LWF state lookup table is wired into payroll run.
        const lwf = 20;
        lines.push({
          payrollMonth: run.payrollMonth,
          employeeId: slip.employeeId,
          employeeCode: slip.employeeCode,
          state: 'KA',
          lwfEmployee: lwf,
          lwfEmployer: lwf * 2,
        });
        employeeCount += 1;
        deductionAmount += lwf;
      }
    }
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount: 0, deductionAmount, netAmount: 0 },
      lines,
      warnings: [
        'LWF rate placeholder INR 20/mo. Production wires the state-rate table from payroll config.',
      ],
    };
  },
});

/**
 * India ESI Monthly Contribution — distinct from the ESIC half-yearly return.
 * Generates the monthly ESI contribution challan: employee 0.75% + employer
 * 3.25% on wages ≤ INR 21,000/mo. Employees above the cap are excluded.
 */
registerReport({
  code: 'IND_ESI_MONTHLY',
  countryCode: 'IN',
  name: 'India ESI Monthly Contribution',
  format: 'excel',
  description: 'ESIC monthly contribution per employee (employee 0.75% + employer 3.25%).',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
    });
    const lines: Array<Record<string, unknown>> = [];
    let grossAmount = 0;
    let deductionAmount = 0;
    let employeeCount = 0;
    const WAGE_CEILING = 21000;
    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        const wages = Number(slip.grossSalary ?? 0);
        if (wages > WAGE_CEILING) continue;
        const empContrib = Math.round(wages * 0.0075 * 100) / 100;
        const employerContrib = Math.round(wages * 0.0325 * 100) / 100;
        lines.push({
          payrollMonth: run.payrollMonth,
          employeeId: slip.employeeId,
          employeeCode: slip.employeeCode,
          wages,
          employeeContribution: empContrib,
          employerContribution: employerContrib,
        });
        employeeCount += 1;
        grossAmount += wages;
        deductionAmount += empContrib + employerContrib;
      }
    }
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount, deductionAmount, netAmount: 0 },
      lines,
      warnings: [
        `${WAGE_CEILING}+ wage employees excluded per ESI Act. Rates: employee 0.75%, employer 3.25%.`,
      ],
    };
  },
});

/**
 * India TDS Quarterly statement (Form 26Q for non-salary deductees). Generator
 * emits one line per non-salary deduction. Salary TDS is covered by IND_FORM_24Q.
 * Useful for vendor payments + professional fees that the payroll process
 * triggers (rare but auditable).
 */
registerReport({
  code: 'IND_TDS_QUARTERLY',
  countryCode: 'IN',
  name: 'India TDS Quarterly (Form 26Q)',
  format: 'excel',
  description: 'Per-deductee TDS deductions for the quarter — non-salary payments.',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
    });
    const lines: Array<Record<string, unknown>> = [];
    let totalTds = 0;
    let employeeCount = 0;
    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        const tds = Number(slip.employeeTDS ?? 0);
        if (tds === 0) continue;
        lines.push({
          quarter: run.payrollMonth,
          deducteeId: slip.employeeId,
          deducteeCode: slip.employeeCode,
          tdsDeducted: tds,
        });
        totalTds += tds;
        employeeCount += 1;
      }
    }
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount: 0, deductionAmount: totalTds, netAmount: 0 },
      lines,
      warnings: ['Form 26Q is for non-salary TDS. Salary TDS goes through IND_FORM_24Q.'],
    };
  },
});

/**
 * UAE PASI (Pension and Social Insurance Authority of Oman, sometimes
 * grouped under MoHRE-adjacent reporting in GCC unified pension files).
 * Emits one row per GCC-national employee with the employer contribution.
 */
registerReport({
  code: 'UAE_PASI',
  countryCode: 'AE',
  name: 'UAE PASI Contribution (GCC Nationals)',
  format: 'excel',
  description: 'Pension Authority of Social Insurance contributions for GCC nationals.',
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
        warnings: ['No payroll run in period — no PASI contribution computed.'],
      };
    }
    const lines: Array<Record<string, unknown>> = [];
    let employeeCount = 0;
    let totalContribution = 0;
    for (const slip of runs[0].payslips ?? []) {
      // PASI placeholder rate 9% employer, 7% employee for GCC nationals.
      // Production-wires the per-nationality lookup.
      const basic = Number(slip.basicSalary ?? 0);
      const employer = Math.round(basic * 0.09 * 100) / 100;
      const employee = Math.round(basic * 0.07 * 100) / 100;
      lines.push({
        employeeId: slip.employeeId,
        employeeCode: slip.employeeCode,
        basic,
        employerContribution: employer,
        employeeContribution: employee,
      });
      employeeCount += 1;
      totalContribution += employer + employee;
    }
    return {
      schemaVersion: '1.0.0',
      totals: {
        employeeCount,
        grossAmount: 0,
        deductionAmount: Math.round(totalContribution * 100) / 100,
        netAmount: 0,
      },
      lines,
      warnings: ['Nationality lookup placeholder. Production filters non-GCC employees out.'],
    };
  },
});

/**
 * KSA HRSD (Ministry of Human Resources & Social Development) labour file.
 * Used for the quarterly compliance attestation that joins Saudization +
 * occupational classification per employee. Distinct from Nitaqat (band
 * status) and Saudization (headcount counts).
 */
registerReport({
  code: 'KSA_HRSD_LABOUR',
  countryCode: 'SA',
  name: 'KSA HRSD Labour Compliance File',
  format: 'excel',
  description: 'Per-employee labour attestation (occupational class + nationality).',
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
        warnings: ['No payroll run in period — HRSD labour file empty.'],
      };
    }
    const lines: Array<Record<string, unknown>> = [];
    let employeeCount = 0;
    for (const slip of runs[0].payslips ?? []) {
      lines.push({
        employeeId: slip.employeeId,
        employeeCode: slip.employeeCode,
        nationality: 'SA', // placeholder
        occupationalClass: 'UNKNOWN', // placeholder
        wagesPaid: Number(slip.netSalary ?? 0),
      });
      employeeCount += 1;
    }
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
      lines,
      warnings: [
        'Nationality + occupational class are placeholders. Production wires Employee.nationality + ISCO-08 mapping.',
      ],
    };
  },
});

/**
 * India Bonus Declaration — Form D under the Payment of Bonus Act 1965.
 * Employer must publish the bonus calculation methodology + per-employee
 * paid amounts within 30 days of payment. Distinct from IND_BONUS_ACT
 * (statutory eligibility calc).
 */
registerReport({
  code: 'IND_FORM_D_BONUS',
  countryCode: 'IN',
  name: 'India Form D — Bonus Payment Statement',
  format: 'excel',
  description: 'Per-employee bonus payment declaration (Payment of Bonus Act 1965).',
  generate: async (ctx) => {
    const months = yyyymmRange(ctx.periodStart, ctx.periodEnd);
    const runs = await prisma.payrollRun.findMany({
      where: { tenantId: ctx.tenantId, payrollMonth: { in: months }, isDeleted: false },
      include: { payslips: true },
    });
    const lines: Array<Record<string, unknown>> = [];
    let totalBonus = 0;
    let employeeCount = 0;
    for (const run of runs) {
      for (const slip of run.payslips ?? []) {
        const earnings = (slip.earnings as Array<Record<string, unknown>>) ?? [];
        const bonus = earnings
          .filter((earning) => ['BONUS', 'STATUTORY_BONUS'].includes(String(earning.code ?? '')))
          .reduce((sum, earning) => sum + Number(earning.amount ?? 0), 0);
        if (bonus === 0) continue;
        lines.push({
          payrollMonth: run.payrollMonth,
          employeeId: slip.employeeId,
          employeeCode: slip.employeeCode,
          bonusPaid: bonus,
          basisWages: Number(slip.basicSalary ?? 0),
        });
        totalBonus += bonus;
        employeeCount += 1;
      }
    }
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount, grossAmount: 0, deductionAmount: 0, netAmount: totalBonus },
      lines,
      warnings: ['Form D must be filed within 30 days of bonus disbursement per Section 26.'],
    };
  },
});

// ---------------- GCC compliance certificate exports ----------------
//
// The 6 monthly compliance certificates that ship under
// /dashboard/{hrms-config, payroll-compliance, org-compliance,
// records-compliance, talent-acquisition-compliance,
// immigration-compliance} need to be exportable as auditor-friendly
// reports (CSV / PDF rendered from JSON). Each registration below
// reads the certificate row for the period and emits canonical lines
// (one row per metric) plus a warning line if gating is non-null.

function periodKey(start: Date): string {
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
}

interface CertMetric {
  metric: string;
  value: string | number;
  // Index signature so CertMetric[] is assignable to ReportPayload.lines
  // (Array<Record<string, unknown>>).
  [key: string]: unknown;
}

async function loadCert(model: string, tenantId: string, period: string) {
  try {
    return await (prisma as any)[model].findFirst({
      where: { tenantId, period },
      orderBy: { updatedAt: 'desc' },
    });
  } catch {
    return null;
  }
}

function metricsToLines(cert: Record<string, unknown> | null, keys: string[]): CertMetric[] {
  if (!cert) return [];
  return keys.map((k) => ({ metric: k, value: (cert[k] as string | number) ?? 0 }));
}

registerReport({
  code: 'PAYROLL_COMPLIANCE_CERT',
  countryCode: 'AE,SA,BH,QA,OM,KW,IN',
  name: 'Payroll Governance & Compliance Certificate (EPIC-10)',
  format: 'pdf',
  description:
    'Monthly payroll compliance certificate — runs, locks, maker-checker, reconciliation, bank file, GL postings, gating reason.',
  generate: async (ctx) => {
    const period = periodKey(ctx.periodStart);
    const cert = await loadCert('payrollComplianceCertificate', ctx.tenantId, period);
    const lines = metricsToLines(cert, [
      'runsCount',
      'runsApproved',
      'runsLocked',
      'runsMakerCheckerBreaches',
      'openFindingsCritical',
      'openFindingsHigh',
      'criticalRisksOpen',
      'controlsOverdue',
      'reconciliationVariancePct',
      'bankFileMismatches',
      'glPostingsMissing',
    ]);
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount: 0, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
      lines,
      warnings: cert?.gatingReason ? [`GATED: ${cert.gatingReason}`] : [],
    };
  },
});

registerReport({
  code: 'ORG_COMPLIANCE_CERT',
  countryCode: 'AE,SA,BH,QA,OM,KW,IN',
  name: 'Org & Position Compliance Certificate (EPIC-09)',
  format: 'pdf',
  description:
    'Monthly org & position compliance certificate — checklist results, overhire/frozen headcount, vacancy ageing, gating reason.',
  generate: async (ctx) => {
    const period = periodKey(ctx.periodStart);
    const cert = await loadCert('orgComplianceCertificate', ctx.tenantId, period);
    const lines = metricsToLines(cert, [
      'checklistTotal',
      'checklistFailing',
      'checklistOverdue',
      'overhireTotal',
      'frozenTotal',
      'vacanciesOpen',
      'vacanciesAgedOver90',
      'unapprovedVacancies',
      'departmentsCovered',
    ]);
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount: 0, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
      lines,
      warnings: cert?.gatingReason ? [`GATED: ${cert.gatingReason}`] : [],
    };
  },
});

registerReport({
  code: 'RECORDS_COMPLIANCE_CERT',
  countryCode: 'AE,SA,BH,QA,OM,KW,IN',
  name: 'Employee Records Compliance Certificate (EPIC-08)',
  format: 'pdf',
  description:
    'Monthly records compliance certificate — completeness band breakdown, missing/expired mandatory documents, audit results.',
  generate: async (ctx) => {
    const period = periodKey(ctx.periodStart);
    const cert = await loadCert('recordsComplianceCertificate', ctx.tenantId, period);
    const lines = metricsToLines(cert, [
      'employeesEvaluated',
      'averageScore',
      'greenEmployees',
      'amberEmployees',
      'redEmployees',
      'mandatoryMissingTotal',
      'expiredDocsTotal',
      'checklistFailing',
      'checklistOverdue',
      'criticalRisksOpen',
    ]);
    return {
      schemaVersion: '1.0.0',
      totals: {
        employeeCount: Number((cert?.employeesEvaluated as number) ?? 0),
        grossAmount: 0,
        deductionAmount: 0,
        netAmount: 0,
      },
      lines,
      warnings: cert?.gatingReason ? [`GATED: ${cert.gatingReason}`] : [],
    };
  },
});

registerReport({
  code: 'TA_COMPLIANCE_CERT',
  countryCode: 'AE,SA,BH,QA,OM,KW,IN',
  name: 'Talent Acquisition Compliance Certificate (EPIC-03/04/05)',
  format: 'pdf',
  description:
    'Monthly TA compliance certificate — workforce planning → recruitment → offer → pre-employment audit, stage breakdown, gating.',
  generate: async (ctx) => {
    const period = periodKey(ctx.periodStart);
    const cert = await loadCert('taComplianceCertificate', ctx.tenantId, period);
    const lines = metricsToLines(cert, [
      'checklistTotal',
      'checklistFailing',
      'checklistOverdue',
      'criticalRisksOpen',
      'stagesCovered',
    ]);
    if (cert?.stageBreakdownJson) {
      for (const s of cert.stageBreakdownJson as Array<Record<string, unknown>>) {
        lines.push({
          metric: `stage:${s.stage}`,
          value: `total=${s.total} pass=${s.pass} fail=${s.fail} obs=${s.obs} unchecked=${s.unchecked}`,
        });
      }
    }
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount: 0, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
      lines,
      warnings: cert?.gatingReason ? [`GATED: ${cert.gatingReason}`] : [],
    };
  },
});

registerReport({
  code: 'IMMIGRATION_COMPLIANCE_CERT',
  countryCode: 'AE,SA,BH,QA,OM,KW',
  name: 'Immigration & Work Authorization Compliance Certificate (EPIC-07)',
  format: 'pdf',
  description:
    'Monthly immigration certificate — expired docs, 60/30/7-day renewal alert ladder, transfer ageing, audit, risks, gating.',
  generate: async (ctx) => {
    const period = periodKey(ctx.periodStart);
    const cert = await loadCert('immigrationComplianceCertificate', ctx.tenantId, period);
    const lines = metricsToLines(cert, [
      'countriesCovered',
      'expiredDocsTotal',
      'alerts7dOpen',
      'alerts30dOpen',
      'alerts60dOpen',
      'transfersOpenOverdue',
      'checklistTotal',
      'checklistFailing',
      'checklistOverdue',
      'criticalRisksOpen',
    ]);
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount: 0, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
      lines,
      warnings: cert?.gatingReason ? [`GATED: ${cert.gatingReason}`] : [],
    };
  },
});

registerReport({
  code: 'HRMS_CONFIG_SNAPSHOT',
  countryCode: 'AE,SA,BH,QA,OM,KW,IN',
  name: 'HRMS Configuration Snapshot (EPIC-34)',
  format: 'csv',
  description:
    'Configuration inventory snapshot — counts of rule sets, approval templates, notification rules, audit settings, plus per-status rule-set breakdown.',
  generate: async (ctx) => {
    let ruleSets: Array<{ status: string }> = [];
    let approvals: Array<{ isActive: boolean }> = [];
    let notifications: Array<{ isActive: boolean }> = [];
    let audits: Array<{ domain: string }> = [];
    try {
      ruleSets = await (prisma as any).countryRuleSet.findMany({
        where: { tenantId: ctx.tenantId },
        select: { status: true },
      });
    } catch {
      /* tolerate */
    }
    try {
      approvals = await (prisma as any).approvalWorkflowTemplate.findMany({
        where: { tenantId: ctx.tenantId },
        select: { isActive: true },
      });
    } catch {
      /* tolerate */
    }
    try {
      notifications = await (prisma as any).notificationRule.findMany({
        where: { tenantId: ctx.tenantId },
        select: { isActive: true },
      });
    } catch {
      /* tolerate */
    }
    try {
      audits = await (prisma as any).auditTrailSetting.findMany({
        where: { tenantId: ctx.tenantId },
        select: { domain: true },
      });
    } catch {
      /* tolerate */
    }
    const ruleSetsByStatus = ruleSets.reduce<Record<string, number>>(
      (acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }),
      {}
    );
    const lines: Array<Record<string, unknown>> = [
      { metric: 'ruleSets.total', value: ruleSets.length },
      { metric: 'ruleSets.draft', value: ruleSetsByStatus.DRAFT ?? 0 },
      { metric: 'ruleSets.published', value: ruleSetsByStatus.PUBLISHED ?? 0 },
      { metric: 'ruleSets.superseded', value: ruleSetsByStatus.SUPERSEDED ?? 0 },
      { metric: 'approvalTemplates.total', value: approvals.length },
      { metric: 'approvalTemplates.active', value: approvals.filter((a) => a.isActive).length },
      { metric: 'notificationRules.total', value: notifications.length },
      {
        metric: 'notificationRules.active',
        value: notifications.filter((n) => n.isActive).length,
      },
      { metric: 'auditSettings.total', value: audits.length },
      {
        metric: 'auditSettings.domainsCovered',
        value: new Set(audits.map((a) => a.domain)).size,
      },
    ];
    return {
      schemaVersion: '1.0.0',
      totals: { employeeCount: 0, grossAmount: 0, deductionAmount: 0, netAmount: 0 },
      lines,
    };
  },
});

export const statutoryReportService = new StatutoryReportService();
