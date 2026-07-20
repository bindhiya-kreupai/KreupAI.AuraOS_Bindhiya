import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'definitions';

    switch (type) {
      case 'definitions': {
        const definitions = await prisma.workflowDefinition.findMany({
          where: { tenantId, isDeleted: false },
          orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json({
          success: true,
          data: definitions,
        });
      }

      case 'instances': {
        const statusFilter = searchParams.get('status') || undefined;
        const definitionIdFilter = searchParams.get('definitionId') || undefined;

        const where: any = { tenantId };
        if (statusFilter) where.status = statusFilter;
        if (definitionIdFilter) where.definitionId = definitionIdFilter;

        const instances = await prisma.workflowInstance.findMany({
          where,
          include: { definition: true },
          orderBy: { startedAt: 'desc' },
        });

        return NextResponse.json({
          success: true,
          data: instances,
        });
      }

      case 'templates': {
        const templates = await prisma.workflowDefinition.findMany({
          where: { tenantId, isActive: true },
          orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
          success: true,
          data: templates,
        });
      }

      case 'analytics': {
        const [
          totalDefinitions,
          activeDefinitions,
          totalInstances,
          runningInstances,
          completedInstances,
          failedInstances,
          cancelledInstances,
        ] = await Promise.all([
          prisma.workflowDefinition.count({ where: { tenantId } }),
          prisma.workflowDefinition.count({ where: { tenantId, isActive: true } }),
          prisma.workflowInstance.count({ where: { tenantId } }),
          prisma.workflowInstance.count({ where: { tenantId, status: 'RUNNING' } }),
          prisma.workflowInstance.count({ where: { tenantId, status: 'COMPLETED' } }),
          prisma.workflowInstance.count({ where: { tenantId, status: 'FAILED' } }),
          prisma.workflowInstance.count({ where: { tenantId, status: 'CANCELLED' } }),
        ]);

        const successRate = totalInstances > 0 ? (completedInstances / totalInstances) * 100 : 0;

        return NextResponse.json({
          success: true,
          data: {
            totalDefinitions,
            activeDefinitions,
            totalInstances,
            runningInstances,
            completedInstances,
            failedInstances,
            cancelledInstances,
            successRate,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type', errorAr: 'نوع غير صالح' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch workflow data', errorAr: 'فشل في جلب بيانات سير العمل' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const body = await request.json();
    const action = body.action || 'create';

    switch (action) {
      case 'create': {
        if (!body.name) {
          return NextResponse.json(
            { error: 'Workflow name is required', errorAr: 'اسم سير العمل مطلوب' },
            { status: 400 }
          );
        }

        const workflow = await prisma.workflowDefinition.create({
          data: {
            tenantId,
            name: body.name,
            description: body.description || null,
            trigger: body.trigger || 'MANUAL',
            triggerEvent: body.triggerEvent || null,
            nodes: body.nodes || [],
            edges: body.edges || [],
            isActive: body.isActive ?? false,
            version: 1,
            createdBy: user.userId,
          },
        });

        return NextResponse.json(
          {
            success: true,
            data: workflow,
          },
          { status: 201 }
        );
      }

      case 'start': {
        if (!body.definitionId) {
          return NextResponse.json(
            { error: 'definitionId is required', errorAr: 'معرف التعريف مطلوب' },
            { status: 400 }
          );
        }

        const definition = await prisma.workflowDefinition.findFirst({
          where: { id: body.definitionId, tenantId },
        });

        if (!definition) {
          return NextResponse.json(
            {
              error: 'Workflow definition not found',
              errorAr: 'لم يتم العثور على تعريف سير العمل',
            },
            { status: 404 }
          );
        }

        const nodes = definition.nodes as any[];
        const startNode = Array.isArray(nodes) && nodes.length > 0 ? nodes[0]?.id : null;

        const instance = await prisma.workflowInstance.create({
          data: {
            definitionId: body.definitionId,
            tenantId,
            status: 'RUNNING',
            currentNode: startNode || null,
            context: body.context || {},
            triggeredBy: user.userId,
          },
          include: { definition: true },
        });

        return NextResponse.json(
          {
            success: true,
            data: instance,
          },
          { status: 201 }
        );
      }

      case 'process': {
        if (!body.instanceId || !body.status) {
          return NextResponse.json(
            { error: 'instanceId and status are required', errorAr: 'معرف المثيل والحالة مطلوبان' },
            { status: 400 }
          );
        }

        const existing = await prisma.workflowInstance.findFirst({
          where: { id: body.instanceId, tenantId },
        });

        if (!existing) {
          return NextResponse.json(
            { error: 'Workflow instance not found', errorAr: 'لم يتم العثور على مثيل سير العمل' },
            { status: 404 }
          );
        }

        const updateData: any = {
          status: body.status,
          currentNode: body.currentNode || existing.currentNode,
          context: body.context || existing.context,
        };

        if (
          body.status === 'COMPLETED' ||
          body.status === 'FAILED' ||
          body.status === 'CANCELLED'
        ) {
          updateData.completedAt = new Date();
        }

        if (body.error) {
          updateData.error = body.error;
        }

        const updated = await prisma.workflowInstance.update({
          where: { id: body.instanceId },
          data: updateData,
          include: { definition: true },
        });

        return NextResponse.json({
          success: true,
          data: updated,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process workflow',
        errorAr: 'فشل في معالجة سير العمل',
      },
      { status: 500 }
    );
  }
});
