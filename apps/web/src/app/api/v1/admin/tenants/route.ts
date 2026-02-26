import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/admin/tenants
 * List all tenants (super admin only)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;

    // Only super admins can list all tenants
    if (!user.roles?.includes('SUPER_ADMIN')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: 'Insufficient permissions. Super admin access required.',
          },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || undefined;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              companies: true,
              users: true,
            },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: tenants,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Tenants API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch tenants' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/admin/tenants
 * Create a new tenant (super admin only)
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;

    if (!user.roles?.includes('SUPER_ADMIN')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: 'Insufficient permissions. Super admin access required.',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    if (!body.code || !body.name) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'code and name are required' } },
        { status: 400 }
      );
    }

    const existing = await prisma.tenant.findFirst({ where: { code: body.code } });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E3002', message: `Tenant with code '${body.code}' already exists` },
        },
        { status: 409 }
      );
    }

    const tenant = await prisma.tenant.create({
      data: {
        code: body.code.toUpperCase(),
        name: body.name,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: tenant,
        message: 'Tenant created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[Tenants API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create tenant',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
