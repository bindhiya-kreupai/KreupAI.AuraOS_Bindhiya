import { createHash } from 'crypto';
import { prisma } from '@aura/database';
import type { AuthContext } from './types';

/**
 * EPIC-13-S09 / S17: monthly GOSI process — build submission from
 * per-employee contributions, validate, lock, submit, acknowledge.
 *
 * KSA statutory window: GOSI filing within ~15 days of period end —
 * we expose this as a configurable constant aligned with EPIC-36
 * rule pack and used to set dueDate.
 */
const STATUTORY_WINDOW_DAYS = 15;

export class GosiProcessService {
  async build(input: { establishmentId: string; period: string }, auth: AuthContext) {
    const contributions = await (prisma as any).gosiContribution.findMany({
      where: {
        tenantId: auth.tenantId,
        establishmentId: input.establishmentId,
        period: input.period,
      },
    });
    const totalEmployees = contributions.length;
    const totalEmployer = contributions.reduce(
      (s: number, c: { totalEmployer: number | string }) => s + Number(c.totalEmployer),
      0
    );
    const totalEmployee = contributions.reduce(
      (s: number, c: { totalEmployee: number | string }) => s + Number(c.totalEmployee),
      0
    );

    const [year, month] = input.period.split('-').map(Number);
    const dueDate = new Date(Date.UTC(year, month, 0));
    dueDate.setUTCDate(dueDate.getUTCDate() + STATUTORY_WINDOW_DAYS);

    return (prisma as any).gosiPeriodSubmission.upsert({
      where: {
        aura_gosi_period_submission_unique: {
          tenantId: auth.tenantId,
          establishmentId: input.establishmentId,
          period: input.period,
        },
      },
      update: {
        totalEmployees,
        totalEmployerAmount: totalEmployer,
        totalEmployeeAmount: totalEmployee,
        dueDate,
        status: 'DRAFT',
        errors: [],
        updatedBy: auth.userId,
      },
      create: {
        tenantId: auth.tenantId,
        establishmentId: input.establishmentId,
        period: input.period,
        totalEmployees,
        totalEmployerAmount: totalEmployer,
        totalEmployeeAmount: totalEmployee,
        dueDate,
        status: 'DRAFT',
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async submit(submissionId: string, submittedAt: Date, auth: AuthContext) {
    const sub = await (prisma as any).gosiPeriodSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!sub) throw new Error('submission not found');
    if (sub.status !== 'DRAFT' && sub.status !== 'VALIDATED') {
      throw new Error(`status ${sub.status} cannot be submitted`);
    }
    // Build deterministic file hash off contributions for audit evidence
    const contribs = await (prisma as any).gosiContribution.findMany({
      where: {
        tenantId: auth.tenantId,
        establishmentId: sub.establishmentId,
        period: sub.period,
      },
      orderBy: { employeeId: 'asc' },
    });
    const fileContent = contribs
      .map(
        (c: Record<string, unknown>) =>
          `${c.employeeId},${c.contributionWage},${c.totalEmployer},${c.totalEmployee}`
      )
      .join('\n');
    const hash = createHash('sha256').update(fileContent).digest('hex');
    return (prisma as any).gosiPeriodSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'SUBMITTED',
        submittedAt,
        filePath: `/wps-store/gosi/${sub.period}/${submissionId}.csv`,
        fileHash: hash,
        updatedBy: auth.userId,
      },
    });
  }

  async acknowledge(submissionId: string, ackReference: string, auth: AuthContext) {
    return (prisma as any).gosiPeriodSubmission.update({
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
    return (prisma as any).gosiPeriodSubmission.findMany({
      where: { tenantId, ...filter },
      orderBy: { period: 'desc' },
    });
  }
}

export const gosiProcessService = new GosiProcessService();
