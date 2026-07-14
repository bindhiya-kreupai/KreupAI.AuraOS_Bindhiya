import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { prisma } from '@aura/database';

export const GET = createProtectedRoute(
  async (_request: NextRequest, { params, auth }) => {
    const definition = await prisma.workflowDefinition.findFirst({
      where: { id: params.id as string, tenantId: auth!.tenantId, isDeleted: false },
      include: { _count: { select: { instances: true } } },
    });
    if (!definition) return { success: false, error: 'Integration not found', status: 404 };
    return { success: true, data: definition };
  },
  { requiredPermissions: ['workflow:read'], rateLimit: 'API_USER' }
);

export const PUT = createProtectedRoute(
  async (request: NextRequest, { params, auth }) => {
    const body = await request.json().catch(() => ({}));
    const existing = await prisma.workflowDefinition.findFirst({
      where: { id: params.id as string, tenantId: auth!.tenantId, isDeleted: false },
    });
    if (!existing) return { success: false, error: 'Integration not found', status: 404 };

    const data: any = { updatedBy: auth!.userId };
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.status !== undefined) data.status = body.status;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.connectionConfig !== undefined)
      data.triggerEvent = JSON.stringify(body.connectionConfig);
    if (body.authentication !== undefined) {
      const existingConfig = existing.triggerEvent
        ? JSON.parse(existing.triggerEvent as string)
        : {};
      const mergedConfig = { ...existingConfig, authentication: body.authentication };
      data.triggerEvent = JSON.stringify(mergedConfig);
    }
    if (body.availableActions !== undefined) data.nodes = body.availableActions;
    if (body.integrationType !== undefined) data.trigger = body.integrationType;
    data.updatedAt = new Date();

    const updated = await prisma.workflowDefinition.update({ where: { id: existing.id }, data });
    return { success: true, data: updated };
  },
  { requiredPermissions: ['workflow:write'], rateLimit: 'API_USER' }
);

export const DELETE = createProtectedRoute(
  async (_request: NextRequest, { params, auth }) => {
    const existing = await prisma.workflowDefinition.findFirst({
      where: { id: params.id as string, tenantId: auth!.tenantId, isDeleted: false },
    });
    if (!existing) return { success: false, error: 'Integration not found', status: 404 };

    const deleted = await prisma.workflowDefinition.update({
      where: { id: existing.id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: auth!.userId },
    });
    return { success: true, data: deleted };
  },
  { requiredPermissions: ['workflow:write'], rateLimit: 'API_USER' }
);
