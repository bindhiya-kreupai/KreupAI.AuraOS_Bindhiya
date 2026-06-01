import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/workflows:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/workflows:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const id = context.params.id;
    const body = await request.json();

    const definition = await prisma.workflowDefinition.findFirst({
      where: { id, tenantId },
    });

    if (!definition) {
      return NextResponse.json(
        { success: false, error: 'Workflow definition not found' },
        { status: 404 }
      );
    }

    if (!definition.isActive) {
      return NextResponse.json(
        { success: false, error: 'Workflow is not active' },
        { status: 400 }
      );
    }

    const nodes = definition.nodes as any[];
    const startNode = Array.isArray(nodes) && nodes.length > 0 ? nodes[0]?.id : null;

    const instance = await prisma.workflowInstance.create({
      data: {
        definitionId: id,
        tenantId,
        status: 'RUNNING',
        currentNode: startNode || null,
        context: body.input || {},
        triggeredBy: user.userId,
      },
      include: { definition: true },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          executionId: instance.id,
          workflowId: instance.definitionId,
          workflowName: instance.definition.name,
          status: instance.status,
          triggeredAt: instance.startedAt,
          triggeredBy: instance.triggeredBy,
          currentNode: instance.currentNode,
          context: instance.context,
        },
        message: 'Workflow execution triggered successfully',
      },
      { status: 201 }
    );
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to execute workflow' }, { status: 500 });
  }
});
