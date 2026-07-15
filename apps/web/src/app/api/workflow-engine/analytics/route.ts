import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

function getDateRange(timeRange: string): Date | null {
  const now = new Date();
  switch (timeRange) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'quarter': {
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      return qStart;
    }
    case 'ytd':
      return new Date(now.getFullYear(), 0, 1);
    case 'all':
      return null;
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || '30d';
    const tenantId = auth!.tenantId;
    const dateFrom = getDateRange(timeRange);

    const instanceWhere: any = { tenantId, isDeleted: false };
    const taskWhere: any = { instance: { tenantId, isDeleted: false } };
    const auditWhere: any = { instance: { tenantId, isDeleted: false } };
    if (dateFrom) {
      instanceWhere.createdAt = { gte: dateFrom };
      taskWhere.createdAt = { gte: dateFrom };
      auditWhere.createdAt = { gte: dateFrom };
    }

    const [
      total,
      initiated,
      inProgress,
      pendingApproval,
      approved,
      rejected,
      cancelled,
      failed,
      paused,
    ] = await Promise.all([
      prisma.workflowInstance.count({ where: instanceWhere }),
      prisma.workflowInstance.count({ where: { ...instanceWhere, status: 'INITIATED' } }),
      prisma.workflowInstance.count({ where: { ...instanceWhere, status: 'IN_PROGRESS' } }),
      prisma.workflowInstance.count({ where: { ...instanceWhere, status: 'PENDING_APPROVAL' } }),
      prisma.workflowInstance.count({ where: { ...instanceWhere, status: 'APPROVED' } }),
      prisma.workflowInstance.count({ where: { ...instanceWhere, status: 'REJECTED' } }),
      prisma.workflowInstance.count({ where: { ...instanceWhere, status: 'CANCELLED' } }),
      prisma.workflowInstance.count({ where: { ...instanceWhere, status: 'FAILED' } }),
      prisma.workflowInstance.count({ where: { ...instanceWhere, status: 'PAUSED' } }),
    ]);

    const completedInstances = await prisma.workflowInstance.findMany({
      where: {
        ...instanceWhere,
        completedAt: { not: null },
        status: { in: ['APPROVED', 'REJECTED', 'CANCELLED', 'FAILED'] },
      },
      select: { startedAt: true, completedAt: true, status: true },
    });

    let totalDurationMs = 0;
    const durations: number[] = [];
    for (const inst of completedInstances) {
      const start = new Date(inst.startedAt).getTime();
      const end = new Date(inst.completedAt!).getTime();
      const dur = Math.max(0, end - start);
      totalDurationMs += dur;
      durations.push(dur);
    }
    durations.sort((a, b) => a - b);
    const avgExecTime =
      completedInstances.length > 0 ? totalDurationMs / completedInstances.length / 1000 : 0;
    const medianExecTime =
      durations.length > 0 ? durations[Math.floor(durations.length / 2)] / 1000 : 0;
    const minExecTime = durations.length > 0 ? durations[0] / 1000 : 0;
    const maxExecTime = durations.length > 0 ? durations[durations.length - 1] / 1000 : 0;

    const [totalTasks, completedTasks, overdueTasks] = await Promise.all([
      prisma.workflowTask.count({ where: taskWhere }),
      prisma.workflowTask.count({ where: { ...taskWhere, actionTaken: { not: null } } }),
      prisma.workflowTask.count({
        where: { ...taskWhere, status: 'PENDING', slaDueAt: { lt: new Date() } },
      }),
    ]);

    const allTasks = await prisma.workflowTask.findMany({
      where: { ...taskWhere, actionTaken: { not: null }, actionAt: { not: null } },
      select: { createdAt: true, actionAt: true },
    });
    let totalTaskDurationMs = 0;
    for (const t of allTasks) {
      const dur = Math.max(0, new Date(t.actionAt!).getTime() - new Date(t.createdAt).getTime());
      totalTaskDurationMs += dur;
    }
    const avgTaskCompletionTime =
      allTasks.length > 0 ? totalTaskDurationMs / allTasks.length / 1000 : 0;

    const totalApprovals = await prisma.workflowTask.count({
      where: { ...taskWhere, actionTaken: { in: ['APPROVE', 'REJECT'] } },
    });
    const approvedTasks = await prisma.workflowTask.count({
      where: { ...taskWhere, actionTaken: 'APPROVE' },
    });

    const approvalsWithTime = await prisma.workflowTask.findMany({
      where: { ...taskWhere, actionTaken: { in: ['APPROVE', 'REJECT'] }, actionAt: { not: null } },
      select: { createdAt: true, actionAt: true },
    });
    let totalApprovalDurationMs = 0;
    for (const a of approvalsWithTime) {
      const dur = Math.max(0, new Date(a.actionAt!).getTime() - new Date(a.createdAt).getTime());
      totalApprovalDurationMs += dur;
    }
    const avgApprovalTime =
      approvalsWithTime.length > 0
        ? totalApprovalDurationMs / approvalsWithTime.length / 1000 / 3600
        : 0;

    const escalatedTasks = await prisma.workflowTask.count({
      where: { ...taskWhere, status: 'ESCALATED' },
    });
    const escalationRate = totalTasks > 0 ? (escalatedTasks / totalTasks) * 100 : 0;

    const topByUsage = await prisma.workflowInstance.groupBy({
      by: ['definitionId'],
      where: instanceWhere,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const defIds = topByUsage.map((t) => t.definitionId);
    const definitions = await prisma.workflowDefinition.findMany({
      where: { id: { in: defIds } },
      select: { id: true, name: true },
    });
    const defMap = new Map(definitions.map((d) => [d.id, d.name]));

    const topWorkflowsByUsage = (() => {
      const merged = new Map<string, { workflowName: string; count: number }>();
      for (const t of topByUsage) {
        const name = defMap.get(t.definitionId) || 'Unknown';
        const existing = merged.get(name);
        if (existing) {
          existing.count += t._count.id;
        } else {
          merged.set(name, { workflowName: name, count: t._count.id });
        }
      }
      return Array.from(merged.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((t) => ({ workflowId: '', ...t, averageDuration: 0, successRate: 0 }));
    })();

    const topWorkflowsByFailure = await prisma.workflowInstance.groupBy({
      by: ['definitionId'],
      where: { ...instanceWhere, status: 'FAILED' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const failDefIds = topWorkflowsByFailure.map((t) => t.definitionId);
    const failDefs = await prisma.workflowDefinition.findMany({
      where: { id: { in: failDefIds } },
      select: { id: true, name: true },
    });
    const failDefMap = new Map(failDefs.map((d) => [d.id, d.name]));

    const topByFailure = (() => {
      const merged = new Map<string, { workflowName: string; count: number }>();
      for (const t of topWorkflowsByFailure) {
        const name = failDefMap.get(t.definitionId) || 'Unknown';
        const existing = merged.get(name);
        if (existing) {
          existing.count += t._count.id;
        } else {
          merged.set(name, { workflowName: name, count: t._count.id });
        }
      }
      return Array.from(merged.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((t) => ({ workflowId: '', ...t, averageDuration: 0, successRate: 0 }));
    })();

    const executionTrends: { period: string; value: number }[] = [];
    if (total > 0) {
      const instanceDates = await prisma.workflowInstance.findMany({
        where: instanceWhere,
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });
      const dayMap = new Map<string, number>();
      for (const inst of instanceDates) {
        const day = new Date(inst.createdAt).toISOString().slice(0, 10);
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      }

      if (dayMap.size > 0) {
        const dates = Array.from(dayMap.keys()).sort();
        const start = new Date(dates[0]);
        const end = new Date(dates[dates.length - 1]);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = d.toISOString().slice(0, 10);
          executionTrends.push({ period: key, value: dayMap.get(key) || 0 });
        }
      }
    }

    const approvedTaskCount = approvedTasks;
    const failedTaskCount = totalTasks - completedTasks;
    const approvalRate =
      totalApprovals > 0 ? Math.round((approvedTaskCount / totalApprovals) * 1000) / 10 : 0;

    return {
      success: true,
      data: {
        totalExecutions: total,
        successfulExecutions: approved,
        failedExecutions: failed,
        cancelledExecutions: cancelled,
        successRate: total > 0 ? Math.round((approved / total) * 1000) / 10 : 0,
        averageExecutionTime: Math.round(avgExecTime),
        medianExecutionTime: Math.round(medianExecTime),
        minExecutionTime: Math.round(minExecTime),
        maxExecutionTime: Math.round(maxExecTime),
        runningExecutions: inProgress,
        pendingExecutions: pendingApproval,
        pausedExecutions: paused,
        initiatedExecutions: initiated,
        totalApprovals,
        approvalRate,
        averageApprovalTime: Math.round(avgApprovalTime * 10) / 10,
        escalationRate: Math.round(escalationRate * 10) / 10,
        totalTasks,
        completedTasks,
        overdueTasks,
        taskCompletionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0,
        averageTaskCompletionTime: Math.round(avgTaskCompletionTime),
        topWorkflowsByUsage,
        topWorkflowsByDuration: topWorkflowsByUsage,
        topWorkflowsByFailure: topByFailure,
        executionTrends,
        performanceTrends: executionTrends,
        statusBreakdown: {
          initiated,
          inProgress,
          pendingApproval,
          approved,
          rejected,
          cancelled,
          failed,
          paused,
        },
        lastUpdated: new Date().toISOString(),
      },
    };
  },
  { requiredPermissions: ['workflow:read'], rateLimit: 'API_USER' }
);
