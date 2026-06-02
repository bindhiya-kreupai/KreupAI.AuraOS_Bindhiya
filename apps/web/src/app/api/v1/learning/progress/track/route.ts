import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('learning:write')) return forbidden('learning:write');
    const body = await safeJson(request);
    if (!body?.courseId) return validationError({ message: 'courseId required' });
    const enrollment = await prisma.courseEnrollment.upsert({
      where: {
        tenantId_courseId_employeeId: {
          tenantId: user.tenantId,
          courseId: body.courseId,
          employeeId: body.employeeId || user.userId,
        },
      } as any,
      create: {
        tenantId: user.tenantId,
        courseId: body.courseId,
        employeeId: body.employeeId || user.userId,
        progressPercent: body.progressPercent || 0,
        status: body.status || 'IN_PROGRESS',
      } as any,
      update: {
        progressPercent: body.progressPercent,
        status: body.status,
        completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
      } as any,
    });
    return successItem(enrollment);
  } catch (error: any) {
    return serverError(error, 'track progress');
  }
});
