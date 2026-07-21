import { prisma } from '@aura/database';
import { LeaveAccrualService } from '@/lib/services/leave/leave-accrual.service';
import { ACCRUAL_RULES, accrualStatus } from './auto-accruals-rules';
import { retrieveRecentAccruals } from './auto-accruals-retrieval';
import type { AccrualDashboard } from './auto-accruals-types';

export async function getAccrualDashboard(tenantId: string): Promise<AccrualDashboard> {
  const records = await retrieveRecentAccruals(tenantId);
  const projections = records.map((row) => {
    const accrued = Number(row.accruedDays);
    const state = accrualStatus(0, accrued);
    return {
      id: row.id,
      employeeId: row.employeeId,
      employeeName: row.employeeId,
      leaveType: row.policyId,
      current: 0,
      accrued,
      projected: accrued,
      ...state,
    };
  });
  return {
    rules: ACCRUAL_RULES,
    projections,
    summary: {
      recentAccruals: records.length,
      totalDays: projections.reduce((sum, row) => sum + row.accrued, 0),
      nextCycle: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    },
  };
}

export async function previewAccruals(tenantId: string, userId: string) {
  const dashboard = await getAccrualDashboard(tenantId);
  const run = await prisma.aIRunRecord.create({
    data: {
      tenantId,
      runType: 'accrual_preview',
      inputContext: { processDate: new Date().toISOString() },
      output: dashboard,
      completedAt: new Date(),
      createdBy: userId,
    },
  });
  return { ...dashboard, runId: run.id };
}

export async function commitAccruals(tenantId: string, userId: string) {
  const started = Date.now();
  try {
    const result = await LeaveAccrualService.processMonthlyAccrual({
      tenantId,
      processDate: new Date(),
    });
    const run = await prisma.aIRunRecord.create({
      data: {
        tenantId,
        runType: 'accrual_commit',
        output: result as object,
        completedAt: new Date(),
        durationMs: Date.now() - started,
        createdBy: userId,
      },
    });
    return { runId: run.id, committed: true, result };
  } catch (error) {
    const run = await prisma.aIRunRecord.create({
      data: {
        tenantId,
        runType: 'accrual_commit',
        output: {
          status: 'COMMIT_REQUEST_RECORDED',
          message: 'Accrual service could not complete; no partial write was initiated.',
        },
        completedAt: new Date(),
        durationMs: Date.now() - started,
        createdBy: userId,
      },
    });
    return {
      runId: run.id,
      committed: false,
      message: error instanceof Error ? error.message : 'Accrual commit request recorded.',
    };
  }
}
