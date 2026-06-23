import { createHash } from 'crypto';
import { prisma } from '@aura/database';
import type { AuthContext } from './types';

const STATUTORY_WINDOW_DAYS = 15;

/**
 * EPIC-14-S07 / S12: monthly process — build → submit → acknowledge.
 */
export class GpssaProcessService {
  async build(input: { establishmentId: string; period: string }, auth: AuthContext) {
    const contributions = await (prisma as any).gpssaContribution.findMany({
      where: {
        tenantId: auth.tenantId,
        establishmentId: input.establishmentId,
        period: input.period,
      },
    });
    const totalEmployees = contributions.length;
    const totalEmployer = contributions.reduce(
      (s: number, c: { employerAmount: number | string }) => s + Number(c.employerAmount),
      0
    );
    const totalEmployee = contributions.reduce(
      (s: number, c: { employeeAmount: number | string }) => s + Number(c.employeeAmount),
      0
    );
    const totalGovernment = contributions.reduce(
      (s: number, c: { governmentAmount: number | string }) => s + Number(c.governmentAmount),
      0
    );
    const [year, month] = input.period.split('-').map(Number);
    const dueDate = new Date(Date.UTC(year, month, 0));
    dueDate.setUTCDate(dueDate.getUTCDate() + STATUTORY_WINDOW_DAYS);

    return (prisma as any).gpssaPeriodSubmission.upsert({
      where: {
        aura_gpssa_period_submission_unique: {
          tenantId: auth.tenantId,
          establishmentId: input.establishmentId,
          period: input.period,
        },
      },
      update: {
        totalEmployees,
        totalEmployer,
        totalEmployee,
        totalGovernment,
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
        totalEmployer,
        totalEmployee,
        totalGovernment,
        dueDate,
        status: 'DRAFT',
        createdBy: auth.userId,
        updatedBy: auth.userId,
      },
    });
  }

  async submit(submissionId: string, submittedAt: Date, auth: AuthContext) {
    const sub = await (prisma as any).gpssaPeriodSubmission.findUnique({
      where: { id: submissionId },
    });
    if (!sub) throw new Error('submission not found');
    if (sub.status !== 'DRAFT' && sub.status !== 'VALIDATED') {
      throw new Error(`status ${sub.status} cannot be submitted`);
    }
    const contribs = await (prisma as any).gpssaContribution.findMany({
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
          `${c.employeeId},${c.contributionWage},${c.employerAmount},${c.employeeAmount},${c.governmentAmount}`
      )
      .join('\n');
    const hash = createHash('sha256').update(fileContent).digest('hex');
    return (prisma as any).gpssaPeriodSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'SUBMITTED',
        submittedAt,
        filePath: `/wps-store/gpssa/${sub.period}/${submissionId}.csv`,
        fileHash: hash,
        updatedBy: auth.userId,
      },
    });
  }

  async acknowledge(submissionId: string, ackReference: string, auth: AuthContext) {
    return (prisma as any).gpssaPeriodSubmission.update({
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
    return (prisma as any).gpssaPeriodSubmission.findMany({
      where: { tenantId, ...filter },
      orderBy: { period: 'desc' },
    });
  }
}

export const gpssaProcessService = new GpssaProcessService();
