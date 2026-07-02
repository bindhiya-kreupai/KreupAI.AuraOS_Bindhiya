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
import { DEFAULT_POLICIES } from '../constants';

const VALID_ACTIONS = ['archive', 'delete', 'anonymize'];

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/retention:update'))
      return forbidden('security/retention:update');
    const id = new URL(request.url).pathname.split('/').filter(Boolean).pop() as string;
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const existing = await (prisma as any).dataRetentionPolicy.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Retention policy');

    const data: any = { updatedBy: user.userId };

    // Reset support: revert this policy to its category default.
    if (body.reset === true) {
      const def = DEFAULT_POLICIES.find((p) => p.category === existing.category);
      if (def) {
        data.retentionDays = def.retentionDays;
        data.action = def.action;
        data.description = def.description;
      }
    } else {
      if (body.retentionDays !== undefined)
        data.retentionDays = Math.max(1, Number(body.retentionDays) || 1);
      if (body.action !== undefined) {
        if (!VALID_ACTIONS.includes(String(body.action))) {
          return validationError({ message: 'Invalid action', field: 'action' });
        }
        data.action = String(body.action);
      }
      if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);
      if (body.description !== undefined) data.description = String(body.description);
    }

    const updated = await (prisma as any).dataRetentionPolicy.update({ where: { id }, data });
    return successItem(updated);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'security/data-retention/[id]/route.ts' },
      'Failed to update policy'
    );
    return serverError(error, 'update');
  }
});
