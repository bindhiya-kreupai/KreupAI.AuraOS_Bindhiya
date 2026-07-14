import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { updateDefinitionSchema } from '@/lib/validation/workflow-engine.schema';
import { workflowDefinitionService } from '@/services/workflow-engine';

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth, params }) => {
    const definition = await workflowDefinitionService.getById(params.id, auth!.tenantId);
    if (!definition) {
      return Response.json(
        { success: false, error: 'Workflow definition not found' },
        { status: 404 }
      );
    }
    return definition;
  },
  {
    requiredPermissions: ['workflow:read'],
    rateLimit: 'API_USER',
  }
);

export const PUT = createProtectedRoute(
  async (request: NextRequest, { auth, params, body }) => {
    return workflowDefinitionService.update(params.id, auth!.tenantId, {
      ...body,
      updatedBy: auth!.userId,
    });
  },
  {
    requiredPermissions: ['workflow:write'],
    rateLimit: 'API_USER',
    bodySchema: updateDefinitionSchema,
  }
);

export const DELETE = createProtectedRoute(
  async (request: NextRequest, { auth, params }) => {
    return workflowDefinitionService.remove(params.id, auth!.tenantId);
  },
  {
    requiredPermissions: ['workflow:admin'],
    rateLimit: 'API_USER',
  }
);
