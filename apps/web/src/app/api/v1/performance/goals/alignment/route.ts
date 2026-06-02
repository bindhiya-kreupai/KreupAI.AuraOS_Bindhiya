import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('performance/goals:read')) return forbidden('performance/goals:read');
    // Compute alignment by walking the PerformanceGoal parent chain
    const goals = await prisma.performanceGoal.findMany({ where: { tenantId: user.tenantId } });
    const total = goals.length;
    const aligned = goals.filter((g: any) => g.parentGoalId).length;
    const alignmentPercentage = total > 0 ? Math.round((aligned / total) * 100) : 0;
    return successItem({ total, aligned, unaligned: total - aligned, alignmentPercentage });
  } catch (error: any) {
    return serverError(error, 'fetch goal alignment');
  }
});
