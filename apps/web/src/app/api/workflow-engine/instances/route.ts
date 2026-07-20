import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { startWorkflowSchema } from '@/lib/validation/workflow-engine.schema';
import { workflowInstanceService, workflowDefinitionService } from '@/services/workflow-engine';

export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const url = new URL(request.url);
    const processType = url.searchParams.get('processType') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const submittedBy = url.searchParams.get('submittedBy') || undefined;
    const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined;
    const limit = url.searchParams.get('limit')
      ? parseInt(url.searchParams.get('limit')!)
      : undefined;
    const stats = url.searchParams.get('stats') === 'true';

    if (stats) {
      return workflowInstanceService.getStats(auth!.tenantId);
    }

    return workflowInstanceService.list(auth!.tenantId, {
      processType,
      status,
      submittedBy,
      page,
      limit,
    });
  },
  {
    requiredPermissions: ['workflow:read'],
    rateLimit: 'API_USER',
  }
);

export const POST = createProtectedRoute(
  async (request: NextRequest, { auth, body }) => {
    let definitionId = body.definitionId;

    if (!definitionId && body.processType) {
      const definition = await workflowDefinitionService.getActiveByProcessType(
        body.processType,
        auth!.tenantId
      );
      if (!definition) {
        return NextResponse.json(
          {
            success: false,
            error: `No active workflow definition found for process type: ${body.processType}`,
          },
          { status: 404 }
        );
      }
      definitionId = definition.id;
    }

    if (!definitionId) {
      return NextResponse.json(
        { success: false, error: 'Either definitionId or processType is required' },
        { status: 400 }
      );
    }

    return workflowInstanceService.start({
      tenantId: auth!.tenantId,
      definitionId,
      processType: body.processType,
      submittedBy: auth!.userId,
      snapshotData: body.snapshotData,
      variables: body.variables,
      documentRef: body.documentRef,
      documentType: body.documentType,
    });
  },
  {
    requiredPermissions: ['workflow:write'],
    rateLimit: 'API_USER',
    bodySchema: startWorkflowSchema,
  }
);
