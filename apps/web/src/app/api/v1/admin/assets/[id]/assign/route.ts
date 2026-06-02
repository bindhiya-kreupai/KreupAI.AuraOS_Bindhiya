import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import {
  forbidden,
  notFound,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('admin/assets:update')) return forbidden('admin/assets:update');
    const body = await safeJson(request);
    if (!body?.employeeId) return validationError({ message: 'employeeId required' });
    const asset = await prisma.asset.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
    });
    if (!asset) return notFound('Asset');
    const assignment = await prisma.assetAssignment.create({
      data: {
        tenantId: user.tenantId,
        assetId: params.id,
        employeeId: body.employeeId,
        assignedDate: new Date(),
        assignedBy: user.userId,
        status: 'ASSIGNED' as any,
      },
    });
    return successItem(assignment, { status: 201 });
  } catch (error: any) {
    return serverError(error, 'assign asset');
  }
});
