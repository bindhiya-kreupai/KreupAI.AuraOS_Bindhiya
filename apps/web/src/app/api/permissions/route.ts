import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth/enhanced-middleware';
import { logger } from '@/lib/logger';

/**
 * Permissions API - List all available permissions in the system
 * Used for role management UI and permission assignment
 */

// GET - Fetch all permissions
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    // Check permission - only users with role management permissions can view permissions
    if (!permissions.includes('roles:read') && !permissions.includes('roles:manage')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');
    const grouped = searchParams.get('grouped') === 'true';

    // Build where clause
    const where: any = {};
    if (resource) {
      where.resource = resource;
    }

    // Fetch all permissions
    const allPermissions = await prisma.permission.findMany({
      where,
      select: {
        id: true,
        resource: true,
        action: true,
        description: true,
        createdAt: true,
      },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });

    // If grouped, organize by resource
    if (grouped) {
      const groupedPermissions: Record<string, typeof allPermissions> = {};

      for (const perm of allPermissions) {
        if (!groupedPermissions[perm.resource]) {
          groupedPermissions[perm.resource] = [];
        }
        groupedPermissions[perm.resource].push(perm);
      }

      logger.info({
        userId: user.userId,
        resources: Object.keys(groupedPermissions).length,
        total: allPermissions.length,
      }, 'Permissions fetched successfully (grouped)');

      return NextResponse.json({
        success: true,
        data: groupedPermissions,
        meta: {
          total: allPermissions.length,
          resources: Object.keys(groupedPermissions),
        },
      });
    }

    logger.info({
      userId: user.userId,
      count: allPermissions.length,
    }, 'Permissions fetched successfully');

    return NextResponse.json({
      success: true,
      data: allPermissions,
      meta: {
        total: allPermissions.length,
      },
    });
  } catch {
    logger.error({ error, userId: user.userId }, 'Error fetching permissions');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
});
