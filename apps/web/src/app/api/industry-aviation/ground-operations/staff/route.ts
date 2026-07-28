import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  parsePagination,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

type AviationRouteContext = {
  user: { tenantId: string; userId: string };
};

export const GET = withEnhancedAuth(async (request: NextRequest, context: AviationRouteContext) => {
  try {
    const { user } = context;
    // if (!permissions.includes('industry-aviation/ground-ops:read'))
    //   return forbidden('industry-aviation/ground-ops:read');
    const { limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId };
    const [rows, total] = await Promise.all([
      prisma.aviationGroundStaff.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.aviationGroundStaff.count({ where }),
    ]);
    return NextResponse.json({ staff: rows, total }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}, { requiredPermissions: ['aviation:read'] });

export const POST = withEnhancedAuth(async (request: NextRequest, context: AviationRouteContext) => {
  try {
    const { user } = context;
    // if (!permissions.includes('industry-aviation/ground-ops:create'))
    //   return forbidden('industry-aviation/ground-ops:create');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const created = await prisma.aviationGroundStaff.create({
      data: {
        ...body,
        tenantId: user.tenantId,
        createdBy: user.userId,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error) {
    logger.error(
      { err: error, route: 'industry-aviation/ground-operations/staff/route.ts' },
      'Failed to create'
    );
    return serverError(error, 'create');
  }
});
