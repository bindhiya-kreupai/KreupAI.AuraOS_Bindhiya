import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/tenants/[id]
 * Get a specific tenant (super admin only)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/tenants:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/tenants:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;

    if (!user.roles?.includes('SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4003', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: { select: { companies: true, users: true, roles: true } },
        companies: {
          select: { id: true, code: true, name: true },
          take: 10,
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Tenant not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tenant,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch tenant' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/admin/tenants/[id]
 * Update a tenant (super admin only)
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/tenants:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/tenants:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;
    const body = await request.json();

    if (!user.roles?.includes('SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4003', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    const tenant = await prisma.tenant.findUnique({ where: { id } });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Tenant not found' } },
        { status: 404 }
      );
    }

    const updated = await prisma.tenant.update({
      where: { id },
      data: {
        name: body.name,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update tenant' } },
      { status: 500 }
    );
  }
});
