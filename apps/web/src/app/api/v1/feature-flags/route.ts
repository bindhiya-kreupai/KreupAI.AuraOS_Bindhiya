import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

export function mapDbFlagToFrontend(dbFlag: any): any {
  const metadata = dbFlag.metadata && typeof dbFlag.metadata === 'object' ? dbFlag.metadata : {};

  const targeting: any = {
    roleWhitelist: dbFlag.enabledForRoles || [],
    userWhitelist: metadata.userWhitelist || [],
    tenantWhitelist: metadata.tenantWhitelist || [],
  };

  if (dbFlag.rolloutPercentage < 100) {
    targeting.percentageRollout = {
      enabled: true,
      percentage: dbFlag.rolloutPercentage,
    };
  }

  const isEnabled = dbFlag.isEnabled;

  let status = 'disabled';
  if (isEnabled) {
    if (
      targeting.percentageRollout?.enabled ||
      targeting.userWhitelist?.length > 0 ||
      targeting.tenantWhitelist?.length > 0 ||
      targeting.roleWhitelist?.length > 0
    ) {
      status = 'partial';
    } else {
      status = 'enabled';
    }
  }

  return {
    key: dbFlag.key,
    name: dbFlag.name,
    description: dbFlag.description,
    module: dbFlag.module,
    isEnabled,
    status,
    isPermanent: metadata.isPermanent ?? false,
    isProductionCritical: metadata.isProductionCritical ?? false,
    tags: metadata.tags || [],
    targeting,
    createdAt: dbFlag.createdAt.toISOString(),
    updatedAt: dbFlag.updatedAt.toISOString(),
    auditLog: metadata.auditLog || [],
  };
}

/**
 * GET /api/v1/feature-flags
 * List all feature flags for the tenant (raw array)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    if (!user?.tenantId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isEnabled = searchParams.get('isEnabled');
    const moduleFilter = searchParams.get('module') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (isEnabled !== null && isEnabled !== undefined) where.isEnabled = isEnabled === 'true';
    if (moduleFilter) where.module = moduleFilter;
    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const flags = await prisma.featureFlag.findMany({
      where,
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    });

    const mappedFlags = flags.map(mapDbFlagToFrontend);
    return NextResponse.json(mappedFlags);
  } catch (_error: any) {
    console.error('[Feature Flags API] GET Error:', _error);
    return NextResponse.json([]);
  }
});

/**
 * POST /api/v1/feature-flags
 * Create a new feature flag (raw object)
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/feature-flags:update')) {
      return new NextResponse('Forbidden: missing admin/feature-flags:update permission', {
        status: 403,
      });
    }

    const body = await request.json();
    const { key, name, description, module, isEnabled, rolloutPercentage, enabledForRoles } = body;

    if (!key) {
      return new NextResponse('Flag key is required', { status: 400 });
    }

    const existing = await prisma.featureFlag.findFirst({
      where: { key, tenantId: user.tenantId },
    });

    if (existing) {
      return new NextResponse('Feature flag already exists', { status: 400 });
    }

    const metadata = {
      isPermanent: body.isPermanent ?? false,
      isProductionCritical: body.isProductionCritical ?? false,
      tags: body.tags ?? [],
      userWhitelist: body.targeting?.userWhitelist ?? [],
      tenantWhitelist: body.targeting?.tenantWhitelist ?? [],
      auditLog: body.auditLog ?? [],
    };

    const flag = await prisma.featureFlag.create({
      data: {
        tenantId: user.tenantId,
        key,
        name: name || key,
        description: description || null,
        isEnabled: isEnabled ?? false,
        module: module || 'general',
        rolloutPercentage:
          rolloutPercentage || body.targeting?.percentageRollout?.percentage || 100,
        enabledForRoles: enabledForRoles || body.targeting?.roleWhitelist || [],
        metadata,
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    return NextResponse.json(mapDbFlagToFrontend(flag), { status: 201 });
  } catch (_error: any) {
    console.error('[Feature Flags API] POST Error:', _error);
    return new NextResponse('Internal server error', { status: 500 });
  }
});
