import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

// Aggregate role-permission matrix from the existing Role/Permission/RolePermission
// models for tenant-wide visibility.
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/permissions:read')) return forbidden('admin/permissions:read');
    const [roles, perms] = await Promise.all([
      (prisma as any).role.findMany({
        where: { tenantId: user.tenantId },
        include: { permissions: { include: { permission: true } } },
      }),
      (prisma as any).permission.findMany(),
    ]);
    const matrix = roles.map((role: any) => ({
      roleId: role.id,
      roleName: role.name,
      permissions: role.permissions.map((rp: any) => rp.permission?.code || rp.permissionId),
    }));
    return successItem({ matrix, roles, permissions: perms });
  } catch (error: any) {
    return serverError(error, 'fetch permission matrix');
  }
});
