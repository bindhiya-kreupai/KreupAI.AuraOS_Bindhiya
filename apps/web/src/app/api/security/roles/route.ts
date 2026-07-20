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
import { shapeRole, syncRolePermissions } from './role-permissions';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/roles:read')) return forbidden('security/roles:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId, isDeleted: false };
    const [rows, total] = await Promise.all([
      (prisma as any).role.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          permissions: { where: { isDeleted: false }, include: { permission: true } },
          _count: { select: { userRoles: true } },
        },
      }),
      (prisma as any).role.count({ where }),
    ]);
    return successList(rows.map(shapeRole), page, limit, total);
  } catch (error: any) {
    logger.error({ err: error, route: 'security/roles/route.ts' }, 'Failed to list roles');
    return serverError(error, 'list roles');
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/roles:create')) return forbidden('security/roles:create');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const name = (body.roleName ?? body.name ?? '').trim();
    if (!name) return validationError({ message: 'Role name is required' });

    const created = await (prisma as any).role.create({
      data: {
        name,
        description: body.description ?? '',
        tenantId: user.tenantId,
        isActive: body.isActive ?? true,
        isSystem: false,
        createdBy: user.userId,
      },
    });

    // Attach permissions if provided (array of { resource, action }).
    const perms = Array.isArray(body.permissions) ? body.permissions : [];
    if (perms.length > 0) {
      await syncRolePermissions(created.id, perms, user.userId);
    }

    const full = await (prisma as any).role.findFirst({
      where: { id: created.id, tenantId: user.tenantId },
      include: {
        permissions: { where: { isDeleted: false }, include: { permission: true } },
        _count: { select: { userRoles: true } },
      },
    });
    return successItem({ ...shapeRole(full), role: shapeRole(full) }, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'security/roles/route.ts' }, 'Failed to create role');
    return serverError(error, 'create role');
  }
});
