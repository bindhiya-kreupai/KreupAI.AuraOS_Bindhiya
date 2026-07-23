import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { workflowDefinitionService } from '@/services/workflow-engine';

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth, params }) => {
    const result = await workflowDefinitionService.activate(
      params.id,
      auth!.tenantId,
      auth!.userId
    );
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return result;
  },
  {
    requiredPermissions: ['workflow:write'],
    rateLimit: 'API_USER',
  }
);
