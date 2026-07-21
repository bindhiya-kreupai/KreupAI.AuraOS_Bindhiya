/**
 * AI Workflow Generator API
 * GET — list saved workflow definitions (tenant-scoped)
 * POST — save or activate workflow (persists to WorkflowDefinition; execution delegated to Workflow Engine)
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { authenticateWithPermissions } from '@/lib/auth/enhanced-middleware';
import {
  canActivateWorkflow,
  canReadAiAutomation,
  canWriteAiAutomation,
} from '@/lib/ai/ai-automation-auth';
import { getWorkflowAIConfig } from '@/lib/ai/workflow-generator-ai';
import { stepsToEngineDefinition } from '@/lib/ai/workflow-generator-layout';
import type { WorkflowGeneratedStep } from '@/lib/ai/workflow-generator-types';

async function resolveAuth(request: NextRequest) {
  const { context, error } = await authenticateWithPermissions(request);
  if (error || !context?.user?.tenantId) return null;
  return {
    tenantId: context.user.tenantId as string,
    userId: context.user.userId as string,
    permissions: context.permissions as string[],
    roles: context.roles as string[],
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'config') {
      return NextResponse.json({
        success: true,
        data: getWorkflowAIConfig(),
      });
    }

    const auth = await resolveAuth(request);
    if (!auth) {
      return NextResponse.json({
        success: true,
        data: { workflows: [], total: 0 },
      });
    }

    if (!canReadAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json({
        success: true,
        data: { workflows: [], total: 0 },
      });
    }

    const workflows = await prisma.workflowDefinition.findMany({
      where: { tenantId: auth.tenantId, isDeleted: false },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: { _count: { select: { instances: true } } },
    });

    return NextResponse.json({
      success: true,
      data: {
        workflows: workflows.map((w) => ({
          id: w.id,
          name: w.name,
          description: w.description,
          trigger: w.trigger,
          triggerEvent: w.triggerEvent,
          nodes: w.nodes,
          edges: w.edges,
          isActive: w.isActive,
          version: w.version,
          executionCount: w._count.instances,
          updatedAt: w.updatedAt.toISOString(),
        })),
        total: workflows.length,
      },
    });
  } catch (error) {
    console.error('[workflow] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveAuth(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Sign in to save workflows', errorAr: 'يرجى تسجيل الدخول' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const activate = body.activate === true;

    if (activate && !canActivateWorkflow(auth.permissions, auth.roles)) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to activate workflows',
          errorAr: 'ليس لديك صلاحية تفعيل سير العمل',
        },
        { status: 403 }
      );
    }

    if (!canWriteAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json(
        {
          success: false,
          error: 'You do not have permission to save workflows',
          errorAr: 'ليس لديك صلاحية حفظ سير العمل',
        },
        { status: 403 }
      );
    }

    const prompt = body.prompt ? String(body.prompt) : undefined;

    let nodes = body.nodes;
    let edges = body.edges;
    const trigger = body.trigger ? String(body.trigger) : 'HR_REQUEST';
    let triggerEvent = body.triggerEvent ? String(body.triggerEvent) : null;
    const name = String(body.name || 'AI Generated Workflow').trim();
    const description = body.description ? String(body.description) : prompt || null;

    if (Array.isArray(body.steps) && body.steps.length > 0) {
      const engine = stepsToEngineDefinition(body.steps as WorkflowGeneratedStep[]);
      nodes = engine.nodes;
      edges = engine.edges;
      const first = (body.steps as WorkflowGeneratedStep[])[0];
      if (first?.type === 'trigger' && !body.trigger) {
        triggerEvent = first.label;
      }
    }

    if (!nodes || !edges) {
      return NextResponse.json(
        { success: false, error: 'nodes and edges are required' },
        { status: 400 }
      );
    }

    const workflow = await prisma.workflowDefinition.create({
      data: {
        tenantId: auth.tenantId,
        name,
        description,
        trigger,
        triggerEvent,
        nodes: nodes as object,
        edges: edges as object,
        isActive: activate,
        version: 1,
        createdBy: auth.userId,
      },
    });

    await prisma.aIRunRecord.create({
      data: {
        tenantId: auth.tenantId,
        runType: 'workflow',
        inputContext: {
          prompt,
          name,
          activate,
          source: 'ai-workflow-generator',
        } as object,
        output: {
          workflowId: workflow.id,
          status: activate ? 'ACTIVATED' : 'SAVED_DRAFT',
        } as object,
        completedAt: new Date(),
        createdBy: auth.userId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        workflow: {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          trigger: workflow.trigger,
          nodes: workflow.nodes,
          edges: workflow.edges,
          isActive: workflow.isActive,
        },
        message: activate
          ? 'Workflow activated and registered with the Workflow Engine.'
          : 'Workflow saved as draft.',
        workflowEnginePath: '/dashboard/workflow-engine/workflow-designer',
      },
    });
  } catch (error) {
    console.error('[workflow] POST error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save workflow' }, { status: 500 });
  }
}
