import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  notFound,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('health-safety/training:update'))
      return forbidden('health-safety/training:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });

    const existing = await (prisma as any).healthSafetyTrainingEnrollment.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!existing) return notFound('Enrollment');

    const progress =
      typeof body.progress === 'number'
        ? Math.min(100, Math.max(0, Math.round(body.progress)))
        : existing.progress;
    const isComplete = progress >= 100;

    const updated = await (prisma as any).healthSafetyTrainingEnrollment.update({
      where: { id: params.id },
      data: {
        progress,
        status: isComplete ? 'COMPLETED' : progress > 0 ? 'IN_PROGRESS' : 'ENROLLED',
        completedAt: isComplete ? (existing.completedAt ?? new Date()) : null,
        certificateId:
          isComplete && !existing.certificateId
            ? `CERT-${params.id.slice(0, 8).toUpperCase()}-${Date.now()}`
            : existing.certificateId,
        updatedBy: user.userId,
      },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'health-safety/training/enrollments/[id]/route.ts' },
      'Failed to update enrollment'
    );
    return serverError(error, 'update enrollment');
  }
});
