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
    if (body.availableActions !== undefined) data.nodes = body.availableActions;
    if (body.integrationType !== undefined) data.trigger = body.integrationType;

    if (body.connectionConfig !== undefined || body.authentication !== undefined) {
      let triggerEventPayload: Record<string, any> = {};
      try {
        triggerEventPayload = existing.triggerEvent
          ? JSON.parse(existing.triggerEvent as string)
          : {};
      } catch {}
      if (!triggerEventPayload.connectionConfig && existing.triggerEvent) {
        try {
          const old = JSON.parse(existing.triggerEvent as string);
          if (old.baseUrl !== undefined || old.timeout !== undefined) {
            triggerEventPayload.connectionConfig = old;
          }
        } catch {}
      }
      if (body.connectionConfig !== undefined)
        triggerEventPayload.connectionConfig = body.connectionConfig;
      if (body.authentication !== undefined)
        triggerEventPayload.authentication = body.authentication;
      data.triggerEvent = JSON.stringify(triggerEventPayload);
    }

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
