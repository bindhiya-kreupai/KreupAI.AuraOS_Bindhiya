import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment-compliance/candidates
 * List candidates for use in compliance dropdowns/selects (screening, etc.)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { permissions } = context;

  // NOTE: confirm this matches the permission string used in
  // recruitment-compliance/cases/route.ts (e.g. 'recruitment-compliance:read')
  if (!permissions.includes('recruitment-compliance:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing recruitment-compliance:read permission',
        },
      },
      { status: 403 }
    );
  }

  try {
    const currentUser = context.user ?? context._user;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || undefined;

    // Scope candidates to the current tenant via their applications' job postings.
    const tenantUsers = await prisma.user.findMany({
      where: { tenantId: currentUser.tenantId },
      select: { id: true },
    });
    const tenantUserIds = tenantUsers.map((u) => u.id);
    const tenantCreatedBy = {
      in: tenantUserIds.length > 0 ? tenantUserIds : ['__no_tenant_users__'],
    };

    const where: Record<string, unknown> = {
      applications: { some: { jobPosting: { createdBy: tenantCreatedBy } } },
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }),
      prisma.candidate.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Recruitment Compliance Candidates API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch candidates' } },
      { status: 500 }
    );
  }
});
