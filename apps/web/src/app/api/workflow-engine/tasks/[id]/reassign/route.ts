import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { reassignTaskSchema } from '@/lib/validation/workflow-engine.schema';
import { workflowTaskService } from '@/services/workflow-engine';

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth, params, body }) => {
    const result = await workflowTaskService.reassignTask(params.id, {
      ...body,
      adminUserId: auth!.userId,
    });
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return result;
  },
  {
    requiredPermissions: ['workflow:admin'],
    rateLimit: 'API_USER',
    bodySchema: reassignTaskSchema,
  }
);
