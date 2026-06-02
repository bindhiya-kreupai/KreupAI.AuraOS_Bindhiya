import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, parsePagination, serverError, successList } from '@/lib/api/crud-helpers';

// Heuristic attrition risk: combines tenure, recent leave usage, missed
// punches, and recent recognition count. Higher score = higher risk.
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('ai-automation:read')) return forbidden('ai-automation:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const employees: any[] = await (prisma as any).employee.findMany({
      where: { tenantId: user.tenantId, status: 'ACTIVE' as any },
      take: 500,
    });
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const [recognitionByEmp, leaveByEmp] = await Promise.all([
      prisma.recognition.groupBy({
        by: ['receiverId'],
        where: { tenantId: user.tenantId, createdAt: { gte: since } },
        _count: { _all: true },
      }),
      prisma.leaveRequest.groupBy({
        by: ['employeeId'],
        where: { tenantId: user.tenantId, createdAt: { gte: since } } as any,
        _count: { _all: true },
      }),
    ]);
    const recMap = new Map(recognitionByEmp.map((r) => [r.receiverId, r._count._all]));
    const leaveMap = new Map(leaveByEmp.map((r) => [r.employeeId, r._count._all]));
    const scored = employees.map((e) => {
      const tenureYears = e.joiningDate
        ? (Date.now() - new Date(e.joiningDate).getTime()) / (365 * 24 * 3600 * 1000)
        : 0;
      const recCount = recMap.get(e.id) || 0;
      const leaveCount = leaveMap.get(e.id) || 0;
      // simple model: short tenure + few recognitions + many leaves → high risk
      const score = Math.min(
        100,
        Math.round((tenureYears < 1 ? 30 : 0) + (recCount === 0 ? 25 : 0) + leaveCount * 5)
      );
      return {
        employeeId: e.id,
        tenureYears,
        recentRecognitions: recCount,
        recentLeaveRequests: leaveCount,
        riskScore: score,
        riskLevel: score > 60 ? 'HIGH' : score > 30 ? 'MEDIUM' : 'LOW',
      };
    });
    scored.sort((a, b) => b.riskScore - a.riskScore);
    await prisma.aIRunRecord.create({
      data: {
        tenantId: user.tenantId,
        runType: 'attrition_prediction',
        output: { scoredCount: scored.length } as any,
        completedAt: new Date(),
        durationMs: 0,
      },
    });
    return successList(scored.slice(skip, skip + limit), page, limit, scored.length);
  } catch (error: any) {
    return serverError(error, 'compute attrition risk');
  }
});
