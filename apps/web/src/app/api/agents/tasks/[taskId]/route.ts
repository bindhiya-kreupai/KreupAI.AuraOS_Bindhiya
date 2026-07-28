/**
 * Agent Task Detail API Routes
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { resolveAgentAuth } from '@/lib/ai/agent-auth';
import { agentError } from '@/lib/ai/agent-types';
import { AgentFrameworkService } from '@/lib/services/agentic-ai';
import type { TaskStatus } from '@/lib/services/agentic-ai';

type RouteContext = { params: Promise<{ taskId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  try {
    const { taskId } = await context.params;
    const task = await AgentFrameworkService.getTask(taskId);
    if (!task || task.tenantId !== auth.tenantId) {
      return NextResponse.json(agentError('Task not found', 'المهمة غير موجودة'), { status: 404 });
    }
    return NextResponse.json({ success: true, data: task });
  } catch {
    return NextResponse.json(agentError('Failed to fetch task', 'فشل تحميل المهمة'), {
      status: 500,
    });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await resolveAgentAuth(request);
  if (!auth) {
    return NextResponse.json(agentError('Unauthorized', 'غير مصرح'), { status: 401 });
  }

  if (!auth.canWrite) {
    return NextResponse.json(agentError('Permission denied', 'تم رفض الإذن'), { status: 403 });
  }

  try {
    const { taskId } = await context.params;
    const body = await request.json();
    const { status, output } = body;

    const validStatuses: TaskStatus[] = [
      'PENDING',
      'QUEUED',
      'IN_PROGRESS',
      'WAITING_APPROVAL',
      'WAITING_INPUT',
      'COMPLETED',
      'FAILED',
      'CANCELLED',
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(agentError('Invalid status', 'حالة غير صالحة'), { status: 400 });
    }

    const existing = await AgentFrameworkService.getTask(taskId);
    if (!existing || existing.tenantId !== auth.tenantId) {
      return NextResponse.json(agentError('Task not found', 'المهمة غير موجودة'), { status: 404 });
    }

    const task = await AgentFrameworkService.updateTaskStatus(taskId, status, output);
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to update task';
    return NextResponse.json(agentError(msg, 'فشل تحديث المهمة'), { status: 500 });
  }
}
