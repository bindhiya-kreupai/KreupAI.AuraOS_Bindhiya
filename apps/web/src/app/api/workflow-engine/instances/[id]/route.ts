import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { workflowInstanceService } from '@/services/workflow-engine';

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth, params }) => {
    const instance = await workflowInstanceService.getById(params.id, auth!.tenantId);
    if (!instance) {
      return Response.json(
        { success: false, error: 'Workflow instance not found' },
        { status: 404 }
      );
    }
    return instance;
  },
  {
    requiredPermissions: ['workflow:read'],
    rateLimit: 'API_USER',
  }
);
