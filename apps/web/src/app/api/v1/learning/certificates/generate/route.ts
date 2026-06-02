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
    if (!permissions.includes('learning:certificate')) return forbidden('learning:certificate');
    const body = await safeJson(request);
    if (!body?.courseId || !body?.employeeId)
      return validationError({ message: 'courseId + employeeId required' });
    const certificate = await (prisma as any).certification.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        courseId: body.courseId,
        certificateNumber: `CERT-${Date.now().toString(36).toUpperCase()}`,
        issuedAt: new Date(),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return successItem(certificate, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'generate certificate');
  }
});
