import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  parsePagination,
  safeJson,
  serverError,
  successItem,
  successList,
  validationError,
} from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('health-safety/training:read'))
      return forbidden('health-safety/training:read');
    const searchParams = new URL(request.url).searchParams;
    const { page, limit, skip } = parsePagination(searchParams);
    const employeeId = searchParams.get('employeeId') || undefined;
    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (employeeId) where.employeeId = employeeId;
    const [rows, total] = await Promise.all([
      (prisma as any).healthSafetyTrainingEnrollment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).healthSafetyTrainingEnrollment.count({ where }),
    ]);
    return successList(rows, page, limit, total);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'health-safety/training/enrollments/route.ts' },
      'Failed to list enrollments'
    );
    return serverError(error, 'list enrollments');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('health-safety/training:create'))
      return forbidden('health-safety/training:create');
    const body = await safeJson(request);
    if (!body || !body.trainingId || !body.employeeId)
      return validationError({ message: 'trainingId and employeeId are required' });

    const training = await (prisma as any).healthSafetyTraining.findFirst({
      where: { id: body.trainingId, tenantId: user.tenantId },
    });
    if (!training) return validationError({ message: 'Training course not found' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (training.validityDays ?? 365));

    const enrollment = await (prisma as any).healthSafetyTrainingEnrollment.upsert({
      where: {
        tenantId_trainingId_employeeId: {
          tenantId: user.tenantId,
          trainingId: body.trainingId,
          employeeId: body.employeeId,
        },
      },
      create: {
        tenantId: user.tenantId,
        trainingId: body.trainingId,
        employeeId: body.employeeId,
        progress: 0,
        status: 'ENROLLED',
        dueDate,
        createdBy: user.userId,
      },
      update: { isDeleted: false, updatedBy: user.userId },
    });
    return successItem(enrollment, { status: 201 });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'health-safety/training/enrollments/route.ts' },
      'Failed to create enrollment'
    );
    return serverError(error, 'create enrollment');
  }
});
