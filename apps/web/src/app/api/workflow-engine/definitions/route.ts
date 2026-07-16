import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { createDefinitionSchema } from '@/lib/validation/workflow-engine.schema';
import { workflowDefinitionService } from '@/services/workflow-engine';

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const url = new URL(request.url);
    const processType = url.searchParams.get('processType') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const isActive = url.searchParams.get('isActive');
    const stats = url.searchParams.get('stats') === 'true';

    if (stats) {
      return workflowDefinitionService.getStats(auth!.tenantId);
    }

    return workflowDefinitionService.list(auth!.tenantId, {
      processType,
      status,
      isActive: isActive != null ? isActive === 'true' : undefined,
    });
  },
  {
    requiredPermissions: ['workflow:read'],
    rateLimit: 'API_USER',
  }
);

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth, body }) => {
    return workflowDefinitionService.create({
      ...body,
      tenantId: auth!.tenantId,
      createdBy: auth!.userId,
    });
  },
  {
    requiredPermissions: ['workflow:write'],
    rateLimit: 'API_USER',
    bodySchema: createDefinitionSchema,
  }
);
