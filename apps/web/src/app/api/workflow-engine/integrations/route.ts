import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || undefined;

    const where: any = { tenantId: auth!.tenantId, isDeleted: false, processType: 'INTEGRATION' };
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const definitions = await prisma.workflowDefinition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { instances: true } } },
    });

    return { success: true, data: definitions };
  },
  { requiredPermissions: ['workflow:read'], rateLimit: 'API_USER' }
);

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth, body }) => {
    const definition = await prisma.workflowDefinition.create({
      data: {
        tenantId: auth!.tenantId,
        processType: 'INTEGRATION',
        name: body.name,
        description: body.description || '',
        trigger: body.integrationType || 'REST_API',
        triggerEvent: body.connectionConfig ? JSON.stringify(body.connectionConfig) : null,
        nodes: body.availableActions || [],
        edges: [],
        status: body.status || 'DRAFT',
        isActive: body.isActive ?? false,
        createdBy: auth!.userId,
      },
    });

    return { success: true, data: definition };
  },
  {
    requiredPermissions: ['workflow:write'],
    rateLimit: 'API_USER',
    bodySchema: undefined,
  }
);
