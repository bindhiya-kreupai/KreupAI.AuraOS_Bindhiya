/**
 * Workflow Engine API Routes
 * Phase 4: Enterprise Expansion - Approval Workflows
 */

import { NextRequest, NextResponse } from 'next/server';
import { WorkflowService } from '@/lib/services/enterprise';

/**
 * POST /api/workflows
 * Manage workflows and instances
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    const action = body.action || 'create';

    switch (action) {
      case 'create':
        if (!body.definition) {
          return NextResponse.json(
            { error: 'workflow definition is required', errorAr: 'تعريف سير العمل مطلوب' },
            { status: 400 }
          );
        }

        const workflow = await WorkflowService.createWorkflow(
          body.tenantId,
          body.definition,
          body.createdBy || 'system'
        );

        return NextResponse.json({
          success: true,
          data: workflow,
        });

      case 'create-from-template':
        if (!body.type || !body.name) {
          return NextResponse.json(
            { error: 'type and name are required', errorAr: 'النوع والاسم مطلوبان' },
            { status: 400 }
          );
        }

        const fromTemplate = await WorkflowService.createFromTemplate(
          body.tenantId,
          body.type,
          body.name,
          body.createdBy || 'system'
        );

        return NextResponse.json({
          success: true,
          data: fromTemplate,
        });

      case 'publish':
        if (!body.workflowId) {
          return NextResponse.json(
            { error: 'workflowId is required', errorAr: 'معرف سير العمل مطلوب' },
            { status: 400 }
          );
        }

        const published = await WorkflowService.publishWorkflow(body.workflowId);

        return NextResponse.json({
          success: true,
          data: published,
        });

      case 'start':
        if (!body.workflowId || !body.requesterId || !body.referenceType || !body.referenceId) {
          return NextResponse.json(
            { error: 'workflowId, requesterId, referenceType and referenceId are required', errorAr: 'معرف سير العمل ومعرف الطالب ونوع المرجع ومعرف المرجع مطلوبان' },
            { status: 400 }
          );
        }

        const instance = await WorkflowService.startWorkflow(
          body.tenantId,
          body.workflowId,
          body.requesterId,
          body.requesterName || 'Requester',
          body.entityId || body.tenantId,
          body.referenceType,
          body.referenceId,
          body.requestData || {}
        );

        return NextResponse.json({
          success: true,
          data: instance,
        });

      case 'process':
        if (!body.instanceId || !body.taskId || !body.taskAction || !body.actorId) {
          return NextResponse.json(
            { error: 'instanceId, taskId, taskAction and actorId are required', errorAr: 'معرف المثيل ومعرف المهمة والإجراء ومعرف المنفذ مطلوبان' },
            { status: 400 }
          );
        }

        const processed = await WorkflowService.processAction(
          body.instanceId,
          body.taskId,
          body.taskAction,
          body.actorId,
          body.actorName || 'Actor',
          body.comments,
          body.delegateTo
        );

        return NextResponse.json({
          success: true,
          data: processed,
        });

      case 'cancel':
        if (!body.instanceId || !body.cancelledBy) {
          return NextResponse.json(
            { error: 'instanceId and cancelledBy are required', errorAr: 'معرف المثيل ومن ألغى مطلوبان' },
            { status: 400 }
          );
        }

        const cancelled = await WorkflowService.cancelInstance(
          body.instanceId,
          body.cancelledBy,
          body.reason || ''
        );

        return NextResponse.json({
          success: true,
          data: cancelled,
        });

      case 'delegate':
        if (!body.delegation) {
          return NextResponse.json(
            { error: 'delegation is required', errorAr: 'التفويض مطلوب' },
            { status: 400 }
          );
        }

        const delegation = await WorkflowService.createDelegation({
          tenantId: body.tenantId,
          ...body.delegation,
          createdBy: body.createdBy || 'system',
        });

        return NextResponse.json({
          success: true,
          data: delegation,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Workflow error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process workflow',
        errorAr: 'فشل في معالجة سير العمل',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workflows
 * Get workflows, instances and tasks
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const type = searchParams.get('type') || 'definitions';
    const userId = searchParams.get('userId');

    if (!tenantId && type !== 'templates') {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'templates':
        const templates = await WorkflowService.getTemplates(
          searchParams.get('workflowType') as any
        );

        return NextResponse.json({
          success: true,
          data: templates,
        });

      case 'definitions':
        // In production, fetch from database
        return NextResponse.json({
          success: true,
          data: [],
        });

      case 'instances':
        const instances = await WorkflowService.getInstances(tenantId!, {
          workflowType: searchParams.get('workflowType') as any,
          status: searchParams.get('status') || undefined,
          requesterId: searchParams.get('requesterId') || undefined,
          entityId: searchParams.get('entityId') || undefined,
        });

        return NextResponse.json({
          success: true,
          data: instances,
        });

      case 'tasks':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId is required for tasks', errorAr: 'معرف المستخدم مطلوب للمهام' },
            { status: 400 }
          );
        }

        const tasks = await WorkflowService.getPendingTasks(userId, {
          workflowType: searchParams.get('workflowType') as any,
          priority: searchParams.get('priority') || undefined,
          status: searchParams.get('status') || undefined,
        });

        return NextResponse.json({
          success: true,
          data: tasks,
        });

      case 'delegations':
        if (!userId) {
          return NextResponse.json(
            { error: 'userId is required for delegations', errorAr: 'معرف المستخدم مطلوب للتفويضات' },
            { status: 400 }
          );
        }

        const delegations = await WorkflowService.getActiveDelegations(userId);

        return NextResponse.json({
          success: true,
          data: delegations,
        });

      case 'analytics':
        const analytics = await WorkflowService.getAnalytics(
          tenantId!,
          searchParams.get('period') || 'month'
        );

        return NextResponse.json({
          success: true,
          data: analytics,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type', errorAr: 'نوع غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Workflow fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow data', errorAr: 'فشل في جلب بيانات سير العمل' },
      { status: 500 }
    );
  }
}
