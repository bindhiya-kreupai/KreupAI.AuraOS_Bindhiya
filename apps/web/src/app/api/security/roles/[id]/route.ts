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
import { shapeRole, syncRolePermissions } from '../role-permissions';

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/roles:update')) return forbidden('security/roles:update');
    const id = new URL(request.url).pathname.split('/').filter(Boolean).pop() as string;
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });

    const existing = await (prisma as any).role.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Role');

    const data: any = { updatedBy: user.userId };
    if (typeof body.roleName === 'string') data.name = body.roleName;
    if (typeof body.name === 'string') data.name = body.name;
    if (typeof body.description === 'string') data.description = body.description;
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;

    await (prisma as any).role.update({ where: { id }, data });

    if (Array.isArray(body.permissions)) {
      await syncRolePermissions(id, body.permissions, user.userId);
    }

    const full = await (prisma as any).role.findFirst({
      where: { id, tenantId: user.tenantId },
      include: {
        permissions: { where: { isDeleted: false }, include: { permission: true } },
        _count: { select: { userRoles: true } },
      },
    });
    return successItem({ ...shapeRole(full), role: shapeRole(full) });
  } catch (error: any) {
    logger.error({ err: error, route: 'security/roles/[id]/route.ts' }, 'Failed to update role');
    return serverError(error, 'update role');
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/roles:delete')) return forbidden('security/roles:delete');
    const id = new URL(request.url).pathname.split('/').filter(Boolean).pop() as string;

    const existing = await (prisma as any).role.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Role');
    if (existing.isSystem) {
      return validationError({ message: 'System roles cannot be deleted' });
    }

    await (prisma as any).role.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), isActive: false, updatedBy: user.userId },
    });
    return successItem({ id, deleted: true });
  } catch (error: any) {
    logger.error({ err: error, route: 'security/roles/[id]/route.ts' }, 'Failed to delete role');
    return serverError(error, 'delete role');
  }
});
