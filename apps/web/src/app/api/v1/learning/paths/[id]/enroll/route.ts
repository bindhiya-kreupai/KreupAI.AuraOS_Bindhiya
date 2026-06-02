import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, notFound, safeJson, serverError, successItem } from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('learning:enroll')) return forbidden('learning:enroll');
    const body = (await safeJson(request)) || {};
    const employeeId = body.employeeId || user.userId;
    const path = await (prisma as any).learningPath?.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!path) return notFound('Learning path');
    const enrollment = await prisma.learningPathEnrollment.create({
      data: {
        tenantId: user.tenantId,
        learningPathId: params.id,
        employeeId,
        status: 'IN_PROGRESS' as any,
      } as any,
    });
    return successItem(enrollment, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'enroll in path');
  }
});
