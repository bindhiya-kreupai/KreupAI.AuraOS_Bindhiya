import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { cancelInstanceSchema } from '@/lib/validation/workflow-engine.schema';
import { workflowInstanceService } from '@/services/workflow-engine';

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth, params, body }) => {
    const result = await workflowInstanceService.cancel(
      params.id,
      auth!.tenantId,
      auth!.userId,
      body.comment
    );
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return result;
  },
  {
    requiredPermissions: ['workflow:write'],
    rateLimit: 'API_USER',
    bodySchema: cancelInstanceSchema,
  }
);
