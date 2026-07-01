import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbiddenResponse } from '../_shared';

/**
 * GET /api/v1/access-governance/matrix -> AccessMatrix
 *
 * Builds a role x permission grid from real Role / RolePermission / Permission rows
 * scoped by tenant. Permission keys are `resource.action`, grouped by resource.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('access-governance:read')) {
      return forbiddenResponse('access-governance:read');
    }
    const tenantId = user.tenantId;

    const roles: any[] = await (prisma as any).role.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        OR: [{ tenantId }, { tenantId: null }, { isSystem: true }],
      },
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: 'asc' },
    });

    const roleNames: string[] = [];
    const groupMap = new Map<string, Set<string>>();
    const assignments: Record<string, Record<string, boolean>> = {};

    for (const role of roles) {
      const name = role.name as string;
      if (roleNames.includes(name)) continue;
      roleNames.push(name);
      assignments[name] = assignments[name] ?? {};

      for (const rp of role.permissions ?? []) {
        const perm = rp.permission;
        if (!perm) continue;
        const resource = perm.resource as string;
        const key = `${perm.resource}.${perm.action}`;
        if (!groupMap.has(resource)) groupMap.set(resource, new Set());
        groupMap.get(resource)!.add(key);
        assignments[name][key] = true;
      }
    }

    const permissionGroups = Array.from(groupMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, keys]) => ({
        group,
        permissions: Array.from(keys).sort(),
      }));

    // Ensure every role has an explicit false for every known permission key.
    const allKeys = permissionGroups.flatMap((g) => g.permissions);
    for (const name of roleNames) {
      for (const key of allKeys) {
        if (assignments[name][key] === undefined) assignments[name][key] = false;
      }
    }

    const matrix = { roles: roleNames, permissionGroups, assignments };
    return NextResponse.json(matrix);
  } catch (error: any) {
    logger.error(
      { err: error, route: 'access-governance/matrix' },
      'Failed to build access matrix'
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to build access matrix',
          messageAr: 'فشل في بناء مصفوفة الوصول',
        },
      },
      { status: 500 }
    );
  }
});
