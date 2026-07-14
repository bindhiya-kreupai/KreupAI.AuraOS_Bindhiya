import type { NextRequest } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { auditQuerySchema } from '@/lib/validation/workflow-engine.schema';
import { workflowAuditService } from '@/services/workflow-engine';

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const url = new URL(request.url);
    const eventType = url.searchParams.get('eventType') || undefined;
    const actorId = url.searchParams.get('actorId') || undefined;
    const dateFrom = url.searchParams.get('dateFrom') || undefined;
    const dateTo = url.searchParams.get('dateTo') || undefined;
    const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined;
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : undefined;

    return workflowAuditService.list(auth!.tenantId, {
      eventType,
      actorId,
      dateFrom,
      dateTo,
      page,
      limit,
    });
  },
  {
    requiredPermissions: ['workflow:read'],
    rateLimit: 'API_USER',
    querySchema: auditQuerySchema,
  }
);
