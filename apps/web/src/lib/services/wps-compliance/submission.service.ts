import { prisma } from '@aura/database';
import type { AuthContext, WpsStatus } from './types';
import {
  wpsFileGeneratorService,
  type WpsRow,
  type WpsHeaderContext,
} from './file-generator.service';
import { wpsSchemeService } from './scheme.service';
import { resolveRuleValue } from '../gcc-rule-library/rule-value.helper';

/**
 * Hardcoded fall-through for the WPS regulatory salary window (days
 * after the pay-period end at which an unpaid salary becomes
 * "critically late"). The canonical value lives in the active country
 * rule pack under PAYROLL / WPS_SALARY_WINDOW_DAYS (EPIC-02 / EPIC-36)
 * — this constant is only used when no active rule pack is seeded for
 * the country, or when the rule engine is unreachable. Keep in sync
 * with rule-pack-seeds.ts.
 *
 *   UAE  (MOHRE / WPS):    15 days
 *   KSA  (MHRSD / Mudad):   7 days  (governed by the rule pack)
 */
const FALLBACK_WPS_SEVERITY_THRESHOLD_DAYS = 15;

export interface BuildSubmissionInput {
  countryCode: string;
  establishmentId: string;
  period: string;
  payDate?: Date;
  rows: WpsRow[];
}

/**
 * EPIC-11-S02..S10: end-to-end WPS submission lifecycle.
 *
 *   build()    -> DRAFT (no file content; rows persisted)
 *   generate() -> GENERATED (file content + hash + control totals)
 *   validate() -> VALIDATED (no errors) | REJECTED (errors)
 *   submit()   -> SUBMITTED (with submittedAt, fired at authority channel)
 *   acknowledge() -> ACKNOWLEDGED (auth response)
 *   reconcile()-> RECONCILED (cross-check with paid wages)
 *
 * Salary-delay flags are raised on submit() when submittedAt > dueDate.
 */
export class WpsSubmissionService {
  async build(input: BuildSubmissionInput, auth: AuthContext) {
    const cc = input.countryCode.toUpperCase();
    const scheme = await wpsSchemeService.getScheme(cc);
    if (!scheme) throw new Error(`no WPS scheme for ${cc}; seed schemes first`);

    const [year, month] = input.period.split('-').map(Number);
    const dueDate = new Date(Date.UTC(year, month, 0)); // last day of period
    dueDate.setUTCDate(dueDate.getUTCDate() + scheme.statutoryWindowDays);

    return prisma.$transaction(async (tx) => {
      const sub = await (tx as any).wpsPeriodSubmission.upsert({
        where: {
          tenantId_establishmentId_period: {
            tenantId: auth.tenantId,
            establishmentId: input.establishmentId,
            period: input.period,
          },
        },
        update: {
          status: 'DRAFT',
          fileFormat: scheme.fileFormat,
          totalEmployees: input.rows.length,
          totalAmount: input.rows.reduce((s, r) => s + Number(r.netPay), 0),
          dueDate,
          errors: [],
          updatedBy: auth.userId,
        },
        create: {
          tenantId: auth.tenantId,
          countryCode: cc,
          establishmentId: input.establishmentId,
          period: input.period,
          status: 'DRAFT',
          fileFormat: scheme.fileFormat,
          totalEmployees: input.rows.length,
          totalAmount: input.rows.reduce((s, r) => s + Number(r.netPay), 0),
          dueDate,
          createdBy: auth.userId,
          updatedBy: auth.userId,
        },
      });
      await (tx as any).wpsEmployeeRow.deleteMany({ where: { submissionId: sub.id } });
      for (const r of input.rows) {
        await (tx as any).wpsEmployeeRow.create({
          data: {
            submissionId: sub.id,
            employeeId: r.employeeCode, // map to employeeId at integration; using code here
            employeeCode: r.employeeCode,
            nationalId: r.nationalId,
            labourCardNumber: r.labourCardNumber,
            iban: r.iban,
            bankSwift: r.bankSwift,
            currency: r.currency,
            fixedPay: r.fixedPay,
            variablePay: r.variablePay,
            deductions: r.deductions,
            netPay: r.netPay,
            daysWorked: r.daysWorked,
            rowStatus: 'PENDING',
          },
        });
      }
      return sub;
    });
  }

  async generate(
    submissionId: string,
    header: Omit<WpsHeaderContext, 'period' | 'countryCode'>,
    auth: AuthContext
  ) {
    const sub = await (prisma as any).wpsPeriodSubmission.findUnique({
      where: { id: submissionId },
      include: { rows: true },
    });
    if (!sub) throw new Error('submission not found');
    const rows = (sub.rows as Array<Record<string, unknown>>).map((r) => ({
      employeeCode: r.employeeCode as string,
      nationalId: r.nationalId as string | undefined,
      labourCardNumber: r.labourCardNumber as string | undefined,
      iban: r.iban as string,
      bankSwift: r.bankSwift as string | undefined,
      currency: r.currency as string,
      fixedPay: Number(r.fixedPay),
      variablePay: Number(r.variablePay),
      deductions: Number(r.deductions),
      netPay: Number(r.netPay),
      daysWorked: r.daysWorked as number | undefined,
    })) as WpsRow[];

    const file = wpsFileGeneratorService.generate(
      sub.fileFormat,
      {
        employerId: header.employerId,
        establishmentName: header.establishmentName,
        period: sub.period,
        countryCode: sub.countryCode,
      },
      rows
    );
    return (prisma as any).wpsPeriodSubmission.update({
      where: { id: submissionId },
      data: {
        status: file.errors.length === 0 ? 'GENERATED' : 'DRAFT',
        fileContent: file.content,
        fileHash: file.hash,
        controlTotals: file.controlTotals,
        errors: file.errors,
        generatedAt: new Date(),
        updatedBy: auth.userId,
      },
    });
  }

  async validate(submissionId: string, auth: AuthContext) {
    const sub = await (prisma as any).wpsPeriodSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!sub) throw new Error('submission not found');
    if (sub.status !== 'GENERATED') {
      throw new Error('only GENERATED submissions can be validated');
    }
    const errors = (sub.errors as string[]) ?? [];
    const next = errors.length === 0 ? 'VALIDATED' : 'REJECTED';
    return (prisma as any).wpsPeriodSubmission.update({
      where: { id: submissionId },
      data: { status: next, updatedBy: auth.userId },
    });
  }

  async submit(submissionId: string, submittedAt: Date, auth: AuthContext) {
    const sub = await (prisma as any).wpsPeriodSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!sub) throw new Error('submission not found');
    if (sub.status !== 'VALIDATED' && sub.status !== 'GENERATED') {
      throw new Error(`status ${sub.status} cannot be submitted`);
    }
    const updated = await (prisma as any).wpsPeriodSubmission.update({
      where: { id: submissionId },
      data: { status: 'SUBMITTED', submittedAt, updatedBy: auth.userId },
    });
    // Raise salary-delay flags if submitted late. The CRITICAL vs HIGH
    // boundary tracks the regulatory salary window per country (UAE 15d,
    // KSA 7d). Read from the active rule pack so compliance officers can
    // edit the threshold without a deploy; fall back to a safe default
    // when no rule pack is seeded or the rule engine is unreachable.
    const due = sub.dueDate ? new Date(sub.dueDate) : null;
    if (due && submittedAt.getTime() > due.getTime()) {
      const daysLate = Math.ceil((submittedAt.getTime() - due.getTime()) / (24 * 3600 * 1000));
      const severityThreshold = await resolveRuleValue<number>(
        sub.countryCode,
        'PAYROLL',
        'WPS_SALARY_WINDOW_DAYS',
        FALLBACK_WPS_SEVERITY_THRESHOLD_DAYS,
        { source: 'wps.submit.raiseSalaryDelay' }
      );
      const rows = await (prisma as any).wpsEmployeeRow.findMany({
        where: { submissionId: sub.id },
      });
      for (const r of rows as Array<{ employeeId: string }>) {
        try {
          await (prisma as any).salaryDelayFlag.create({
            data: {
              tenantId: auth.tenantId,
              submissionId: sub.id,
              employeeId: r.employeeId,
              countryCode: sub.countryCode,
              period: sub.period,
              dueDate: due,
              daysLate,
              severity: daysLate > severityThreshold ? 'CRITICAL' : 'HIGH',
              status: 'OPEN',
            },
          });
        } catch (err) {
          if (!String(err).includes('Unique')) throw err;
        }
      }
    }
    return updated;
  }

  async acknowledge(submissionId: string, ackReference: string, auth: AuthContext) {
    return (prisma as any).wpsPeriodSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        ackReference,
        updatedBy: auth.userId,
      },
    });
  }

  async reconcile(
    submissionId: string,
    paidRows: Array<{ employeeCode: string; paidAt: Date }>,
    auth: AuthContext
  ) {
    const sub = await (prisma as any).wpsPeriodSubmission.findUnique({
      where: { id: submissionId },
      include: { rows: true },
    });
    if (!sub) throw new Error('submission not found');
    const paidByCode = new Map(paidRows.map((p) => [p.employeeCode, p.paidAt]));
    let matched = 0;
    let unmatched = 0;
    for (const row of sub.rows as Array<{ id: string; employeeCode: string }>) {
      const paidAt = paidByCode.get(row.employeeCode);
      if (paidAt) {
        await (prisma as any).wpsEmployeeRow.update({
          where: { id: row.id },
          data: { rowStatus: 'PAID', paidAt },
        });
        matched += 1;
      } else {
        await (prisma as any).wpsEmployeeRow.update({
          where: { id: row.id },
          data: { rowStatus: 'UNRECONCILED' },
        });
        unmatched += 1;
      }
    }
    const status = unmatched === 0 ? 'MATCH' : 'BREAK';
    await (prisma as any).wpsPeriodSubmission.update({
      where: { id: submissionId },
      data: {
        reconciledAt: new Date(),
        reconciliationStatus: status,
        status: 'RECONCILED',
        updatedBy: auth.userId,
      },
    });
    return { matched, unmatched, status };
  }

  async list(
    tenantId: string,
    filter: { period?: string; status?: string; countryCode?: string } = {}
  ) {
    return (prisma as any).wpsPeriodSubmission.findMany({
      where: {
        tenantId,
        ...(filter.period ? { period: filter.period } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.countryCode ? { countryCode: filter.countryCode.toUpperCase() } : {}),
      },
      orderBy: [{ period: 'desc' }, { countryCode: 'asc' }],
    });
  }

  async detail(submissionId: string) {
    return (prisma as any).wpsPeriodSubmission.findUnique({
      where: { id: submissionId },
      include: { rows: true },
    });
  }
}

export const wpsSubmissionService = new WpsSubmissionService();
