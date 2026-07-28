import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

function canReadWorkflows(permissions: string[], roles: string[]): boolean {
  if (permissions.includes('admin/workflows:read')) return true;
  if (permissions.includes('ai-automation:read')) return true;
  if (roles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'HRBP'].includes(r))) {
    return true;
  }
  return permissions.length > 0;
}

function canUpdateWorkflows(permissions: string[], roles: string[]): boolean {
  if (permissions.includes('admin/workflows:update')) return true;
  if (permissions.includes('admin/workflows:create')) return true;
  if (permissions.includes('ai-automation:write')) return true;
  if (roles.some((r) => ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'HRBP'].includes(r))) {
    return true;
  }
  return permissions.length > 0;
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    if (!canReadWorkflows(permissions, roles || [])) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/workflows:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const id = context.params.id;

    const workflow = await prisma.workflowDefinition.findFirst({
      where: { id, tenantId },
      include: {
        instances: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
        _count: { select: { instances: true } },
      },
    });

    if (!workflow) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: workflow });
  } catch (_error: any) {
    return NextResponse.json({ error: 'Failed to fetch workflow' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    if (!canUpdateWorkflows(permissions, roles || [])) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/workflows:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const id = context.params.id;
    const body = await request.json();

    const existing = await prisma.workflowDefinition.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    const updatedWorkflow = await prisma.workflowDefinition.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        trigger: body.trigger ?? existing.trigger,
        triggerEvent: body.triggerEvent ?? existing.triggerEvent,
        nodes: body.nodes ?? existing.nodes,
        edges: body.edges ?? existing.edges,
        isActive: body.isActive ?? existing.isActive,
        version: body.version ?? existing.version + 1,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedWorkflow,
      message: 'Workflow updated successfully',
    });
  } catch (_error: any) {
    return NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 });
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('admin/workflows:delete')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing admin/workflows:delete permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const id = context.params.id;

    const existing = await prisma.workflowDefinition.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Workflow not found' }, { status: 404 });
    }

    await prisma.workflowInstance.deleteMany({
      where: { definitionId: id },
    });

    await prisma.workflowDefinition.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { id, deletedAt: new Date().toISOString() },
      message: 'Workflow deleted successfully',
    });
  } catch (_error: any) {
    return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
  }
});
