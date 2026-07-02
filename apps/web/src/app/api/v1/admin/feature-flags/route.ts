import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/feature-flags
 * List all feature flags for the tenant
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

    const flags = await (prisma as any).featureFlag.findMany({
      where,
      orderBy: [{ module: 'asc' }, { key: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: flags,
      meta: {
        total: flags.length,
        enabled: flags.filter((f: any) => f.isEnabled).length,
        disabled: flags.filter((f: any) => !f.isEnabled).length,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error: any) {
    console.error('[Feature Flags API] GET Error:', _error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch feature flags' } },
      { status: 500 }
    );
  }
});
