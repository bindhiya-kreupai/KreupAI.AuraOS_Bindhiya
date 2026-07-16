import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { workflowTaskService } from '@/services/workflow-engine';

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const url = new URL(request.url);
    const processType = url.searchParams.get('processType') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const slaState = url.searchParams.get('slaState') || undefined;
    const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined;
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : undefined;

    return workflowTaskService.getInbox(auth!.userId, auth!.tenantId, {
      processType,
      status,
      slaState,
      page,
      limit,
    });
  },
  {
    requiredPermissions: ['workflow:read'],
    rateLimit: 'API_USER',
  }
);
