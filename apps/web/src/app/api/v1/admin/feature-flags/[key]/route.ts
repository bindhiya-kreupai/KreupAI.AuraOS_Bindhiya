import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/feature-flags/[key]
 * Get a specific feature flag by key
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/feature-flags:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/feature-flags:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { key } = context.params;

    const flag = await (prisma as any).featureFlag.findFirst({
      where: { key, tenantId: user.tenantId },
    });

    if (!flag) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Feature flag not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: flag,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch feature flag' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/admin/feature-flags/[key]
 * Update a feature flag
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/feature-flags:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/feature-flags:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { key } = context.params;
    const body = await request.json();

    const flag = await (prisma as any).featureFlag.findFirst({
      where: { key, tenantId: user.tenantId },
    });

    if (!flag) {
      // Create if not exists
      const newFlag = await (prisma as any).featureFlag.create({
        data: {
          tenantId: user.tenantId,
          key,
          name: body.name || key,
          description: body.description || null,
          isEnabled: body.isEnabled ?? false,
          module: body.module || 'general',
          rolloutPercentage: body.rolloutPercentage || 100,
          enabledForRoles: body.enabledForRoles || [],
          metadata: body.metadata || null,
          updatedBy: user.id,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: newFlag,
          message: 'Feature flag created',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    }

    // tenant-ok: id-based op preceded by tenant-scoped findFirst above
    const updated = await (prisma as any).featureFlag.update({
      where: { id: flag.id },
      data: {
        isEnabled: body.isEnabled !== undefined ? body.isEnabled : flag.isEnabled,
        name: body.name,
        description: body.description,
        rolloutPercentage: body.rolloutPercentage,
        enabledForRoles: body.enabledForRoles,
        metadata: body.metadata,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Feature flag ${updated.isEnabled ? 'enabled' : 'disabled'}`,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update feature flag' } },
      { status: 500 }
    );
  }
});
