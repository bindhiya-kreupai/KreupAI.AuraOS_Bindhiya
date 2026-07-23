import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { mapDbFlagToFrontend } from '../route';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/feature-flags/[key]
 * Get a specific feature flag by key (raw object)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    if (!user?.tenantId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const { key } = context.params;

    const flag = await prisma.featureFlag.findFirst({
      where: { key, tenantId: user.tenantId },
    });

    if (!flag) {
      return new NextResponse('Feature flag not found', { status: 404 });
    }

    return NextResponse.json(mapDbFlagToFrontend(flag));
  } catch (_error: any) {
    return new NextResponse('Internal server error', { status: 500 });
  }
});

/**
 * Update logic helper
 */
async function handleUpdate(request: NextRequest, context: any) {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/feature-flags:update')) {
      return new NextResponse('Forbidden: missing admin/feature-flags:update permission', {
        status: 403,
      });
    }
    const { key } = context.params;
    const body = await request.json();

    const flag = await prisma.featureFlag.findFirst({
      where: { key, tenantId: user.tenantId },
    });

    if (!flag) {
      // Create if not exists
      const metadata = {
        isPermanent: body.isPermanent ?? false,
        isProductionCritical: body.isProductionCritical ?? false,
        tags: body.tags ?? [],
        userWhitelist: body.targeting?.userWhitelist ?? [],
        tenantWhitelist: body.targeting?.tenantWhitelist ?? [],
        auditLog: body.auditLog ?? [],
      };

      const newFlag = await prisma.featureFlag.create({
        data: {
          tenantId: user.tenantId,
          key,
          name: body.name || key,
          description: body.description || null,
          isEnabled: body.isEnabled ?? false,
          module: body.module || 'general',
          rolloutPercentage:
            body.rolloutPercentage || body.targeting?.percentageRollout?.percentage || 100,
          enabledForRoles: body.enabledForRoles || body.targeting?.roleWhitelist || [],
          metadata,
          createdBy: user.id,
          updatedBy: user.id,
        },
      });

      return NextResponse.json(mapDbFlagToFrontend(newFlag), { status: 201 });
    }

    const existingMetadata =
      flag.metadata && typeof flag.metadata === 'object' ? (flag.metadata as any) : {};
    const metadata = {
      isPermanent: body.isPermanent ?? existingMetadata.isPermanent ?? false,
      isProductionCritical:
        body.isProductionCritical ?? existingMetadata.isProductionCritical ?? false,
      tags: body.tags ?? existingMetadata.tags ?? [],
      userWhitelist: body.targeting?.userWhitelist ?? existingMetadata.userWhitelist ?? [],
      tenantWhitelist: body.targeting?.tenantWhitelist ?? existingMetadata.tenantWhitelist ?? [],
      auditLog: body.auditLog ?? existingMetadata.auditLog ?? [],
    };

    const updated = await prisma.featureFlag.update({
      where: { id: flag.id },
      data: {
        isEnabled: body.isEnabled !== undefined ? body.isEnabled : flag.isEnabled,
        name: body.name !== undefined ? body.name : flag.name,
        description: body.description !== undefined ? body.description : flag.description,
        rolloutPercentage:
          body.rolloutPercentage !== undefined
            ? body.rolloutPercentage
            : body.targeting?.percentageRollout?.percentage !== undefined
              ? body.targeting.percentageRollout.percentage
              : flag.rolloutPercentage,
        enabledForRoles:
          body.enabledForRoles !== undefined
            ? body.enabledForRoles
            : body.targeting?.roleWhitelist !== undefined
              ? body.targeting.roleWhitelist
              : flag.enabledForRoles,
        metadata,
        updatedAt: new Date(),
        updatedBy: user.id,
      },
    });

    return NextResponse.json(mapDbFlagToFrontend(updated));
  } catch (_error: any) {
    console.error('[Feature Flags API] Update Error:', _error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export const PUT = withEnhancedAuth(handleUpdate);
export const PATCH = withEnhancedAuth(handleUpdate);

/**
 * DELETE /api/v1/feature-flags/[key]
 * Delete a feature flag
 */
export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/feature-flags:update')) {
      return new NextResponse('Forbidden: missing admin/feature-flags:update permission', {
        status: 403,
      });
    }
    const { key } = context.params;

    const flag = await prisma.featureFlag.findFirst({
      where: { key, tenantId: user.tenantId },
    });

    if (!flag) {
      return new NextResponse('Feature flag not found', { status: 404 });
    }

    await prisma.featureFlag.delete({
      where: { id: flag.id },
    });

    return new NextResponse('Feature flag deleted successfully', { status: 200 });
  } catch (_error: any) {
    console.error('[Feature Flags API] DELETE Error:', _error);
    return new NextResponse('Internal server error', { status: 500 });
  }
});
