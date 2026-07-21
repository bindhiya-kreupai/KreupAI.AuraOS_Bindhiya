import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { createProtectedRoute } from '@/lib/api/route-wrapper';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    // if (!permissions.includes('industry-aviation/ground-ops:read'))
    //   return forbidden('industry-aviation/ground-ops:read');
    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId };
    const [rows, total] = await Promise.all([
      (prisma as any).aviationTurnaround.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ turnarounds: data }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  },
  { requiredPermissions: ['aviation:read'] }
);

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    //  if (!permissions.includes('industry-aviation/ground-ops:create'))
    // return forbidden('industry-aviation/ground-ops:create');
    const body = await safeJson(request);
    if (!body) return validationError({ message: 'Invalid JSON body' });
    const created = await (prisma as any).aviationTurnaround.create({
      data: {
        ...body,
        tenantId: user.tenantId,
        createdBy: user.userId,
      },
    });
    return successItem(created, { status: 201 });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'industry-aviation/ground-operations/turnarounds/route.ts' },
      'Failed to create'
    );
    return serverError(error, 'create');
  }
});
