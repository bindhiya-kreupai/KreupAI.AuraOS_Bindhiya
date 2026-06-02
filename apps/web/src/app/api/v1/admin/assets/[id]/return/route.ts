import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, notFound, safeJson, serverError, successItem } from '@/lib/api/crud-helpers';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('admin/assets:update')) return forbidden('admin/assets:update');
    const body = (await safeJson(request)) || {};
    const active = await prisma.assetAssignment.findFirst({
      where: { tenantId: user.tenantId, assetId: params.id, status: { not: 'RETURNED' as any } },
      orderBy: { assignedDate: 'desc' },
    });
    if (!active) return notFound('Active asset assignment');
    const returned = await prisma.assetAssignment.update({
      where: { id: active.id },
      data: { status: 'RETURNED' as any, returnedDate: new Date(), returnNotes: body.notes },
    });
    return successItem(returned);
  } catch (error: any) {
    return serverError(error, 'return asset');
  }
});
