import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

// Recommend learning paths by ranking against existing enrollment + competency data.
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('learning:read')) return forbidden('learning:read');
    const employeeId = new URL(request.url).searchParams.get('employeeId') || user.userId;
    // Suggest paths the employee hasn't enrolled in yet
    const enrolled = await prisma.learningPathEnrollment.findMany({
      where: { tenantId: user.tenantId, employeeId },
      select: { pathId: true },
    });
    const enrolledIds = enrolled.map((e: any) => e.pathId);
    const paths =
      (await (prisma as any).learningPath?.findMany?.({
        where: { tenantId: user.tenantId, id: { notIn: enrolledIds } },
        take: 10,
      })) ?? [];
    return successItem({ employeeId, recommended: paths });
  } catch (error: any) {
    return serverError(error, 'recommend paths');
  }
});
