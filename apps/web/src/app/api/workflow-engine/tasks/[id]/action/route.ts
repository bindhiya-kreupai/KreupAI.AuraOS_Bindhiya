import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute, getIpAddress, getUserAgent } from '@/lib/api/route-wrapper';
import { taskActionSchema } from '@/lib/validation/workflow-engine.schema';
import { workflowTaskService } from '@/services/workflow-engine';

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth, params, body }) => {
    const result = await workflowTaskService.actOnTask(params.id, auth!.userId, body, {
      ip: getIpAddress(request),
      userAgent: getUserAgent(request),
    });
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return result;
  },
  {
    requiredPermissions: ['workflow:write'],
    rateLimit: 'API_USER',
    bodySchema: taskActionSchema,
  }
);
