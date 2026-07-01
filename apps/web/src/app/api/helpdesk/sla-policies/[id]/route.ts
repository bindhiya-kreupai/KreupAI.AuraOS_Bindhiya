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
    if (!permissions.includes('helpdesk/sla:update')) return forbidden('helpdesk/sla:update');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const existing = await (prisma as any).helpdeskSLA.findFirst({
      where: { id: params.id, tenantId: user.tenantId },
      select: { id: true },
    });
    if (!existing) return notFound('SLA policy');
    const { tenantId: _t, id: _i, createdBy: _cb, ...data } = body as Record<string, unknown>;
    const updated = await (prisma as any).helpdeskSLA.update({
      where: { id: params.id },
      data: { ...data, updatedBy: user.userId },
    });
    return successItem(updated);
  } catch (error: any) {
    logger.error({ err: error, route: 'helpdesk/sla-policies/[id]' }, 'Failed to update');
    return serverError(error, 'update sla policy');
  }
});
