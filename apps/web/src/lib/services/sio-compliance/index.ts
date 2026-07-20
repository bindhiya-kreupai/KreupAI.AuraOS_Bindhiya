/**
 * EPIC-15: Bahrain SIO Compliance.
 *
 * Bahrain SIO offers two contribution branches:
 *  - INSURANCE (pension/social insurance) — Bahraini nationals only
 *  - UNEMPLOYMENT — all workers (Bahrainis + expats)
 *
 * Default seed rates (configurable, effective-dated):
 *  - INSURANCE:    Bahraini  12% employer + 7% employee
 *  - UNEMPLOYMENT: All       1% employer  + 1% employee
 */

import { createHash } from 'crypto';
import { prisma } from '@aura/database';
import {
  normalisePaging,
  prismaPageArgs,
  buildPaginatedResult,
  type PaginationInput,
  type PaginatedResult,
} from '@/lib/services/pagination';

export interface AuthContext {
  tenantId: string;
  userId: string;
}

export type NationalityClass = 'BAHRAINI' | 'GCC_NATIONAL_OTHER' | 'EXPAT';
export type SioBranch = 'INSURANCE' | 'UNEMPLOYMENT';

export const SIO_BRANCH_APPLICABILITY: Record<SioBranch, NationalityClass[]> = {
  INSURANCE: ['BAHRAINI'],
  UNEMPLOYMENT: ['BAHRAINI', 'GCC_NATIONAL_OTHER', 'EXPAT'],
};

export interface SioRateSeed {
  branch: SioBranch;
  nationalityClass: NationalityClass;
  employerPct: number;
  employeePct: number;
  wageFloor?: number;
  wageCeiling?: number;
  citation?: string;
}

export const SIO_RATE_SEEDS: SioRateSeed[] = [
  {
    branch: 'INSURANCE',
    nationalityClass: 'BAHRAINI',
    employerPct: 12,
    employeePct: 7,
    wageFloor: 200,
    wageCeiling: 4000,
    citation: 'Bahrain Social Insurance Law (as amended)',
  },
  {
    branch: 'UNEMPLOYMENT',
    nationalityClass: 'BAHRAINI',
    employerPct: 1,
    employeePct: 1,
    wageFloor: 200,
    wageCeiling: 4000,
  },
  {
    branch: 'UNEMPLOYMENT',
    nationalityClass: 'GCC_NATIONAL_OTHER',
    employerPct: 1,
    employeePct: 1,
  },
  {
    branch: 'UNEMPLOYMENT',
    nationalityClass: 'EXPAT',
    employerPct: 1,
    employeePct: 1,
  },
];

const SIO_NUMBER_PATTERN = /^\d{6,12}$/;
const STATUTORY_WINDOW_DAYS = 15;

export class SioConfigService {
  validateSioNumber(n: string) {
    return SIO_NUMBER_PATTERN.test(n);
  }
  async createEstablishment(
    input: {
      sioNumber: string;
      establishmentName: string;
      crNumber?: string;
      legalEntityId?: string;
    },
    auth: AuthContext
  ) {
    if (!this.validateSioNumber(input.sioNumber)) {
      throw new Error('sioNumber must be 6–12 digits');
    }
    return (prisma as any).sioEstablishment.create({
      data: {
        tenantId: auth.tenantId,
        sioNumber: input.sioNumber,
        crNumber: input.crNumber,
        establishmentName: input.establishmentName,
        legalEntityId: input.legalEntityId,
        isInScope: true,
      },
    });
  }
  async listEstablishments(tenantId: string) {
    return (prisma as any).sioEstablishment.findMany({
      where: { tenantId },
      orderBy: { establishmentName: 'asc' },
    });
  }
  async seedBranches(auth: AuthContext) {
    const created: string[] = [];
    for (const [branch, applies] of Object.entries(SIO_BRANCH_APPLICABILITY)) {
      const existing = await (prisma as any).sioBranchConfig.findUnique({
        where: { aura_sio_branch_config_unique: { tenantId: auth.tenantId, branch } },
      });
      if (existing) continue;
      await (prisma as any).sioBranchConfig.create({
        data: { tenantId: auth.tenantId, branch, appliesTo: applies, isActive: true },
      });
      created.push(branch);
    }
    return { created };
  }
  async seedRates(auth: AuthContext, effectiveFrom: Date = new Date()) {
    const created: string[] = [];
    for (const r of SIO_RATE_SEEDS) {
      await (prisma as any).sioContributionRate.create({
        data: {
          tenantId: auth.tenantId,
          branch: r.branch,
          nationalityClass: r.nationalityClass,
          employerPct: r.employerPct,
          employeePct: r.employeePct,
          wageFloor: r.wageFloor,
          wageCeiling: r.wageCeiling,
          effectiveFrom,
          status: 'ACTIVE',
          citation: r.citation,
          createdBy: auth.userId,
        },
      });
      created.push(`${r.branch}/${r.nationalityClass}`);
    }
    return { created };
  }
  async listRates(tenantId: string) {
    return (prisma as any).sioContributionRate.findMany({
      where: { tenantId, status: 'ACTIVE' },
      orderBy: [{ branch: 'asc' }, { nationalityClass: 'asc' }, { effectiveFrom: 'desc' }],
    });
  }
  async resolveRate(
    tenantId: string,
    branch: SioBranch,
    cls: NationalityClass,
    asOf: Date = new Date()
  ) {
    const rows = await (prisma as any).sioContributionRate.findMany({
      where: {
        tenantId,
        branch,
        nationalityClass: cls,
        status: 'ACTIVE',
        effectiveFrom: { lte: asOf },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: asOf } }],
      },
      orderBy: { effectiveFrom: 'desc' },
      take: 1,
    });
    return rows[0] ?? null;
  }
}

export const sioConfigService = new SioConfigService();

export interface RegistrationInput {
  employeeId: string;
  establishmentId: string;
  nationalityClass: NationalityClass;
  sioPersonalNumber?: string;
  cpr?: string;
  registrationDate?: Date;
}

export class SioRegistrationService {
  async register(input: RegistrationInput, auth: AuthContext) {
    return prisma.$transaction(async (tx) => {
      const row = await (tx as any).sioEmployeeRegistration.upsert({
        where: {
          tenantId_employeeId: {
            tenantId: auth.tenantId,
            employeeId: input.employeeId,
          },
        },
        update: {
          establishmentId: input.establishmentId,
          nationalityClass: input.nationalityClass,
          sioPersonalNumber: input.sioPersonalNumber,
          cpr: input.cpr,
          status: 'ACTIVE',
          deregistrationDate: null,
          deregistrationReason: null,
          updatedBy: auth.userId,
        },
        create: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          establishmentId: input.establishmentId,
          nationalityClass: input.nationalityClass,
          sioPersonalNumber: input.sioPersonalNumber,
          cpr: input.cpr,
          registrationDate: input.registrationDate ?? new Date(),
          status: 'ACTIVE',
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
      await (tx as any).sioEvent.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          eventType: 'REGISTRATION',
          payload: { nationalityClass: input.nationalityClass },
        },
      });
      return row;
    });
  }
  async deregister(employeeId: string, input: { reason: string; date?: Date }, auth: AuthContext) {
    return prisma.$transaction(async (tx) => {
      const row = await (tx as any).sioEmployeeRegistration.update({
        where: {
          tenantId_employeeId: {
            tenantId: auth.tenantId,
            employeeId,
          },
        },
        data: {
          status: 'DEREGISTERED',
          deregistrationDate: input.date ?? new Date(),
          deregistrationReason: input.reason,
          updatedBy: auth.userId,
        },
      });
      await (tx as any).sioEvent.create({
        data: {
          tenantId: auth.tenantId,
          employeeId,
          eventType: 'DEREGISTRATION',
          payload: { reason: input.reason },
        },
      });
      return row;
    });
  }
  async list(
    tenantId: string,
    filter: { status?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...filter };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).sioEmployeeRegistration.findMany({
        where,
        orderBy: { registrationDate: 'desc' },
        ...prismaPageArgs(page),
      }),
      (prisma as any).sioEmployeeRegistration.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
  async getActive(tenantId: string, employeeId: string) {
    return (prisma as any).sioEmployeeRegistration.findUnique({
      where: {
        tenantId_employeeId: {
          tenantId,
          employeeId,
        },
      },
    });
  }
  async bahrainizationEvidenceCount(tenantId: string) {
    return (prisma as any).sioEmployeeRegistration.count({
      where: { tenantId, status: 'ACTIVE', nationalityClass: 'BAHRAINI' },
    });
  }
}

export const sioRegistrationService = new SioRegistrationService();

export interface ContributionWageInput {
  employeeId: string;
  period: string;
  basicWage: number;
  housingAllowance?: number;
  otherAllowances?: number;
  effectiveFrom?: Date;
  salaryChangeId?: string;
  salaryStructureRef?: string;
}

export class SioCalculationService {
  async recordContributionWage(input: ContributionWageInput, auth: AuthContext) {
    const contributionWage =
      Number(input.basicWage) +
      Number(input.housingAllowance ?? 0) +
      Number(input.otherAllowances ?? 0);
    return prisma.$transaction(async (tx) => {
      const row = await (tx as any).sioContributionWage.upsert({
        where: {
          tenantId_employeeId_period: {
            tenantId: auth.tenantId,
            employeeId: input.employeeId,
            period: input.period,
          },
        },
        update: {
          basicWage: input.basicWage,
          housingAllowance: input.housingAllowance ?? 0,
          otherAllowances: input.otherAllowances ?? 0,
          contributionWage,
          effectiveFrom: input.effectiveFrom ?? new Date(),
          salaryChangeId: input.salaryChangeId,
          salaryStructureRef: input.salaryStructureRef,
        },
        create: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          period: input.period,
          basicWage: input.basicWage,
          housingAllowance: input.housingAllowance ?? 0,
          otherAllowances: input.otherAllowances ?? 0,
          contributionWage,
          effectiveFrom: input.effectiveFrom ?? new Date(),
          salaryChangeId: input.salaryChangeId,
          salaryStructureRef: input.salaryStructureRef,
        },
      });
      await (tx as any).sioEvent.create({
        data: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          period: input.period,
          eventType: 'WAGE_CHANGE',
          payload: { contributionWage },
        },
      });
      return row;
    });
  }
  async computeContribution(
    input: { employeeId: string; period: string; contributionWage?: number },
    auth: AuthContext
  ) {
    const reg = await sioRegistrationService.getActive(auth.tenantId, input.employeeId);
    if (!reg || reg.status !== 'ACTIVE') {
      throw new Error('employee not actively registered in SIO');
    }
    const wageRow =
      input.contributionWage != null
        ? { contributionWage: input.contributionWage }
        : await (prisma as any).sioContributionWage.findUnique({
            where: {
              tenantId_employeeId_period: {
                tenantId: auth.tenantId,
                employeeId: input.employeeId,
                period: input.period,
              },
            },
          });
    if (!wageRow) throw new Error('contribution wage not recorded for this period');
    const wage = Number(wageRow.contributionWage);
    const cls = reg.nationalityClass as NationalityClass;
    const ins = await sioConfigService.resolveRate(auth.tenantId, 'INSURANCE', cls);
    const unemp = await sioConfigService.resolveRate(auth.tenantId, 'UNEMPLOYMENT', cls);

    const apply = (rate: Record<string, unknown> | null) => {
      if (!rate) return { employer: 0, employee: 0 };
      let w = wage;
      if (rate.wageFloor != null) w = Math.max(w, Number(rate.wageFloor));
      if (rate.wageCeiling != null) w = Math.min(w, Number(rate.wageCeiling));
      return {
        employer: Number(((w * Number(rate.employerPct)) / 100).toFixed(2)),
        employee: Number(((w * Number(rate.employeePct)) / 100).toFixed(2)),
      };
    };
    const insR = apply(ins);
    const unempR = apply(unemp);
    return (prisma as any).sioContribution.upsert({
      where: {
        tenantId_employeeId_period: {
          tenantId: auth.tenantId,
          employeeId: input.employeeId,
          period: input.period,
        },
      },
      update: {
        establishmentId: reg.establishmentId,
        nationalityClass: cls,
        contributionWage: wage,
        insuranceEmployer: insR.employer,
        insuranceEmployee: insR.employee,
        unemploymentEmployer: unempR.employer,
        unemploymentEmployee: unempR.employee,
        totalEmployer: insR.employer + unempR.employer,
        totalEmployee: insR.employee + unempR.employee,
        rateRefs: { insuranceRateId: ins?.id ?? null, unemploymentRateId: unemp?.id ?? null },
      },
      create: {
        tenantId: auth.tenantId,
        employeeId: input.employeeId,
        establishmentId: reg.establishmentId,
        period: input.period,
        nationalityClass: cls,
        contributionWage: wage,
        insuranceEmployer: insR.employer,
        insuranceEmployee: insR.employee,
        unemploymentEmployer: unempR.employer,
        unemploymentEmployee: unempR.employee,
        totalEmployer: insR.employer + unempR.employer,
        totalEmployee: insR.employee + unempR.employee,
        rateRefs: { insuranceRateId: ins?.id ?? null, unemploymentRateId: unemp?.id ?? null },
      },
    });
  }
  async listContributions(
    tenantId: string,
    filter: { period?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...filter };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).sioContribution.findMany({
        where,
        orderBy: [{ period: 'desc' }, { employeeId: 'asc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).sioContribution.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
}

export const sioCalculationService = new SioCalculationService();

export class SioProcessService {
  async build(input: { establishmentId: string; period: string }, auth: AuthContext) {
    const contribs = await (prisma as any).sioContribution.findMany({
      where: {
        tenantId: auth.tenantId,
        establishmentId: input.establishmentId,
        period: input.period,
      },
    });
    const totalEmployer = contribs.reduce(
      (s: number, c: { totalEmployer: number | string }) => s + Number(c.totalEmployer),
      0
    );
    const totalEmployee = contribs.reduce(
      (s: number, c: { totalEmployee: number | string }) => s + Number(c.totalEmployee),
      0
    );
    const [year, month] = input.period.split('-').map(Number);
    const dueDate = new Date(Date.UTC(year, month, 0));
    dueDate.setUTCDate(dueDate.getUTCDate() + STATUTORY_WINDOW_DAYS);
    return (prisma as any).sioPeriodSubmission.upsert({
      where: {
        aura_sio_period_submission_unique: {
          tenantId: auth.tenantId,
          establishmentId: input.establishmentId,
          period: input.period,
        },
      },
      update: {
        totalEmployees: contribs.length,
        totalEmployer,
        totalEmployee,
        dueDate,
        status: 'DRAFT',
        errors: [],
        updatedBy: auth.userId,
      },
      create: {
        tenantId: auth.tenantId,
        establishmentId: input.establishmentId,
        period: input.period,
        totalEmployees: contribs.length,
        totalEmployer,
        totalEmployee,
        dueDate,
        status: 'DRAFT',
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }
  async submit(submissionId: string, submittedAt: Date, auth: AuthContext) {
    const sub = await (prisma as any).sioPeriodSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!sub) throw new Error('submission not found');
    if (sub.status !== 'DRAFT' && sub.status !== 'VALIDATED') {
      throw new Error(`status ${sub.status} cannot be submitted`);
    }
    const contribs = await (prisma as any).sioContribution.findMany({
      where: { tenantId: auth.tenantId, establishmentId: sub.establishmentId, period: sub.period },
      orderBy: { employeeId: 'asc' },
    });
    const fileContent = contribs
      .map(
        (c: Record<string, unknown>) =>
          `${c.employeeId},${c.contributionWage},${c.totalEmployer},${c.totalEmployee}`
      )
      .join('\n');
    const hash = createHash('sha256').update(fileContent).digest('hex');
    return (prisma as any).sioPeriodSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'SUBMITTED',
        submittedAt,
        filePath: `/wps-store/sio/${sub.period}/${submissionId}.csv`,
        fileHash: hash,
        updatedBy: auth.userId,
      },
    });
  }
  async acknowledge(submissionId: string, ackReference: string, auth: AuthContext) {
    return (prisma as any).sioPeriodSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        ackReference,
        updatedBy: auth.userId,
      },
    });
  }
  async list(tenantId: string, filter: { period?: string; status?: string } = {}) {
    return (prisma as any).sioPeriodSubmission.findMany({
      where: { tenantId, ...filter },
      orderBy: { period: 'desc' },
    });
  }
}

export const sioProcessService = new SioProcessService();

export interface PayrollSiRow {
  employeeId: string;
  payrollContribution: number;
}

function severityFor(diffAbs: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (diffAbs > 500) return 'CRITICAL';
  if (diffAbs > 50) return 'HIGH';
  if (diffAbs > 5) return 'MEDIUM';
  return 'LOW';
}

export class SioReconciliationService {
  async reconcile(
    input: {
      establishmentId: string;
      period: string;
      payrollRows: PayrollSiRow[];
      tolerance?: number;
    },
    auth: AuthContext
  ) {
    const tolerance = input.tolerance ?? 0.01;
    const sio = await (prisma as any).sioContribution.findMany({
      where: {
        tenantId: auth.tenantId,
        establishmentId: input.establishmentId,
        period: input.period,
      },
    });
    const sioByEmp = new Map(
      (sio as Array<{ employeeId: string; totalEmployee: unknown }>).map((g) => [
        g.employeeId,
        Number(g.totalEmployee),
      ])
    );
    const payByEmp = new Map(input.payrollRows.map((r) => [r.employeeId, r.payrollContribution]));
    const seen = new Set<string>();
    let varCount = 0;
    for (const [empId, sioAmt] of sioByEmp) {
      seen.add(empId);
      const payAmt = payByEmp.get(empId);
      if (payAmt == null) {
        await this.raise(input, empId, 'PAYROLL_MISSING', sioAmt, null, auth);
        varCount += 1;
        continue;
      }
      const diff = Number((payAmt - sioAmt).toFixed(2));
      if (Math.abs(diff) > tolerance) {
        await this.raise(input, empId, 'AMOUNT_DIFFERENCE', sioAmt, payAmt, auth, diff);
        varCount += 1;
      }
    }
    for (const [empId, payAmt] of payByEmp) {
      if (seen.has(empId)) continue;
      await this.raise(input, empId, 'SIO_MISSING', null, payAmt, auth);
      varCount += 1;
    }
    return { variances: varCount };
  }
  private async raise(
    input: { establishmentId: string; period: string },
    employeeId: string,
    type: string,
    expected: number | null,
    actual: number | null,
    auth: AuthContext,
    explicitDiff?: number
  ) {
    const diff =
      explicitDiff ??
      (expected != null && actual != null ? Number((actual - expected).toFixed(2)) : null);
    return (prisma as any).sioVariance.create({
      data: {
        tenantId: auth.tenantId,
        employeeId,
        establishmentId: input.establishmentId,
        period: input.period,
        type,
        expected,
        actual,
        difference: diff,
        severity: severityFor(Math.abs(diff ?? 0)),
        ownerRole: 'PAYROLL_OFFICER',
        status: 'OPEN',
      },
    });
  }
  async list(
    tenantId: string,
    filter: { period?: string; status?: string; severity?: string } = {},
    paging?: PaginationInput
  ): Promise<PaginatedResult<unknown>> {
    const where = { tenantId, ...filter };
    const page = normalisePaging(paging);
    const [items, total] = await Promise.all([
      (prisma as any).sioVariance.findMany({
        where,
        orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
        ...prismaPageArgs(page),
      }),
      (prisma as any).sioVariance.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page);
  }
  async resolve(id: string, notes?: string) {
    return (prisma as any).sioVariance.update({
      where: { id },
      data: { status: 'RESOLVED', notes },
    });
  }
}

export const sioReconciliationService = new SioReconciliationService();

export class SioCertificateService {
  async dashboard(tenantId: string, period: string) {
    const subs = await (prisma as any).sioPeriodSubmission.findMany({
      where: { tenantId, period },
    });
    const submissions = subs.length;
    const submitted = subs.filter((s: { status: string }) =>
      ['SUBMITTED', 'ACKNOWLEDGED'].includes(s.status)
    ).length;
    const late = subs.filter(
      (s: { submittedAt: Date | null; dueDate: Date | null }) =>
        s.submittedAt &&
        s.dueDate &&
        new Date(s.submittedAt).getTime() > new Date(s.dueDate).getTime()
    ).length;
    const openVariances = await (prisma as any).sioVariance.count({
      where: { tenantId, period, status: 'OPEN' },
    });
    const criticalVariances = await (prisma as any).sioVariance.count({
      where: { tenantId, period, status: 'OPEN', severity: 'CRITICAL' },
    });
    return { period, submissions, submitted, late, openVariances, criticalVariances };
  }
  async generate(period: string, auth: AuthContext) {
    const stats = await this.dashboard(auth.tenantId, period);
    const reasons: string[] = [];
    if (stats.criticalVariances > 0)
      reasons.push(`${stats.criticalVariances} critical variance(s) open`);
    if (stats.late > 0) reasons.push(`${stats.late} late submission(s)`);
    const gatingReason = reasons.length ? `Blocked: ${reasons.join('; ')}` : null;
    return (prisma as any).sioCertificate.upsert({
      where: {
        tenantId_period: {
          tenantId: auth.tenantId,
          period,
        },
      },
      update: {
        submissionsCount: stats.submissions,
        openVariancesCount: stats.openVariances,
        criticalVariancesCount: stats.criticalVariances,
        lateSubmissionsCount: stats.late,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
      create: {
        tenantId: auth.tenantId,
        period,
        submissionsCount: stats.submissions,
        openVariancesCount: stats.openVariances,
        criticalVariancesCount: stats.criticalVariances,
        lateSubmissionsCount: stats.late,
        gatingReason,
        generatedAt: new Date(),
        status: 'DRAFT',
      },
    });
  }
  async sign(
    period: string,
    attestations: Array<{ field: string; value: string }>,
    auth: AuthContext
  ) {
    const cert = await (prisma as any).sioCertificate.findUnique({
      where: {
        tenantId_period: {
          tenantId: auth.tenantId,
          period,
        },
      },
    });
    if (!cert) throw new Error('certificate not generated');
    if (cert.gatingReason) throw new Error(`cannot sign while gated: ${cert.gatingReason}`);
    return (prisma as any).sioCertificate.update({
      where: { id: cert.id },
      data: {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: auth.userId,
        attestationsJson: attestations,
      },
    });
  }
  async list(tenantId: string) {
    return (prisma as any).sioCertificate.findMany({
      where: { tenantId },
      orderBy: { period: 'desc' },
      take: 24,
    });
  }
}

export const sioCertificateService = new SioCertificateService();
